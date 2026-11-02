// 今の本番（origin/new-plan）と出すコミットを並べ比べる。静的なサイトなので、中身が同じファイルは動きも見た目も同じ。
// 使い方: node scripts/regress_site.mjs docs/regression-checks/intended_YYYY-MM-DD.json
// 意図した差の一覧（intended）: { "tool": ["scripts/regress_site.mjs"], "pages": { "privacy.html": [{ "from": "前の文", "to": "新しい文" }] } }
// - 比べる元が本番と同じか：配っている文字のファイルを本番の住所から取って、前の版と比べる
// - 変わったファイル：一覧に無ければデグレ候補
// - 変わったページ：前の版に一覧の置き換えだけをしたものが、新しい版と1字も違わないこと（違えばデグレ候補）
// - 一覧の置き換えが前の版に1回だけ現れなければ漏れ（意図した差が入っていない）
// - 今までの試験（npm test・npm run check:generated）も通すこと
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const started = Date.now();
const git = (...args) => execFileSync('git', ['-c', 'core.quotepath=off', '-C', root, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
const show = (rev, file) => execFileSync('git', ['-C', root, 'show', `${rev}:${file}`], { maxBuffer: 1 << 28 });
const SITE = 'https://takenokonoko.com/';

const intendedPath = process.argv[2];
if (!intendedPath) throw new Error('意図した差の一覧のファイルを指定してください');
const intended = JSON.parse(readFileSync(path.resolve(root, intendedPath), 'utf8'));
const candidates = [];
const misses = [];
const lines = [];

if (git('status', '--porcelain', '--', 'site', '*.html', 'assets', 'scripts')) candidates.push('コミットしていない変更があるので、出すコミットを比べられない');
git('fetch', '--quiet', 'origin', 'new-plan');
const base = git('rev-parse', 'origin/new-plan');
const head = git('rev-parse', 'HEAD');

// 比べる元が今の本番と同じか
const served = git('ls-tree', '-r', '--name-only', base).split('\n').filter((f) => /\.(html|css|js)$/.test(f) && !/^(docs|scripts|site)\//.test(f));
let sameAsLive = 0;
for (const file of served) {
    try {
        const res = await fetch(`${SITE}${file}`, { cache: 'no-store' });
        const live = Buffer.from(await res.arrayBuffer());
        if (res.status === 200 && live.equals(show(base, file))) sameAsLive++;
        else misses.push(`本番の ${file} が前の版と違う（${res.status}）`);
    } catch (error) {
        misses.push(`本番の ${file} を取れない（${error.message}）`);
    }
}
lines.push(`本番と前の版の一致: ${sameAsLive}/${served.length} ファイル`);

// 変わったファイル
const changed = git('diff', '--name-only', base, head).split('\n').filter(Boolean);
const allFiles = git('ls-tree', '-r', '--name-only', head).split('\n').filter(Boolean);
const tool = new Set(intended.tool || []);
const pages = intended.pages || {};
const sources = intended.sources || {};
for (const file of changed) {
    if (!tool.has(file) && !pages[file] && !sources[file]) candidates.push(`一覧に無いファイルが変わった：${file}`);
}
lines.push(`1字も同じと git で確かめたファイル: ${allFiles.length - changed.length}/${allFiles.length}`);
lines.push(`変わったファイル: ${changed.join('、') || 'なし'}`);

// 変わったページは、一覧の置き換えだけで前の版から作れること
for (const [file, swaps] of Object.entries({ ...pages, ...sources })) {
    if (!changed.includes(file)) { misses.push(`一覧にあるのに変わっていない：${file}`); continue; }
    let expected = show(base, file).toString('utf8');
    for (const { from, to } of swaps) {
        const seen = expected.split(from).length - 1;
        if (seen !== 1) misses.push(`${file}：置き換える文が前の版に ${seen} 回（1回のはず）：${from.slice(0, 40)}`);
        else expected = expected.replace(from, () => to);
    }
    const actual = show(head, file).toString('utf8');
    if (expected === actual) lines.push(`${file}: 置き換え ${swaps.length} か所のほかは1字も同じ`);
    else candidates.push(`${file}：一覧の置き換えのほかにも差がある`);
}

// 今までの試験
for (const [label, args] of [['npm test', ['test', '--silent']], ['npm run check:generated', ['run', '-s', 'check:generated']]]) {
    const r = spawnSync('npm', args, { cwd: root, encoding: 'utf8', shell: true });
    if (r.status === 0) lines.push(`${label}: 通った`);
    else candidates.push(`${label} が落ちた：${(r.stdout + r.stderr).trim().slice(-300)}`);
}

const seconds = ((Date.now() - started) / 1000).toFixed(1);
const report = [
    `# サイトの並べ比べ ${new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' })}`, '',
    `今の版: ${head}`, `前の版: ${base}`, '',
    ...lines.map((l) => `- ${l}`), '',
    ...candidates.map((c) => `- デグレ候補：${c}`),
    ...misses.map((m) => `- 漏れ：${m}`), '',
    `デグレ候補の合計: ${candidates.length}`, `漏れ: ${misses.length}`, `所要時間: ${seconds} 秒`, ''
].join('\n');
const outDir = path.join(root, 'docs', 'regression-checks', 'runs');
mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, `${new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).slice(0, 10)}_${head.slice(0, 7)}.md`);
writeFileSync(out, report);
console.log(report);
console.log(`結果：${out}`);
process.exit(candidates.length || misses.length ? 1 : 0);
