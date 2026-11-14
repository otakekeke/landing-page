// サイトで配るファイルと、配らないファイルを分けて確かめる。
// 2026-11-14：内部の文書（docs/）・道具（scripts/）・ページの元（site/）・README・package.json が takenokonoko.com から誰でも読めたので足した。
// GitHub Pages（Jekyll）は、_config.yml の exclude にある物と、名前が「.」「_」で始まる物を配らない。
// - audit()：追っているファイルが全部「配る物（いちばん上のページ・assets/）」か「配らない物」のどちらかで、配る物が exclude に巻き込まれていないこと（npm test が呼ぶ）
// - live(コミット)：本番を見る。配る物はそのコミットと1字も同じ・配らない物は読めない（Markdown は Jekyll が作る .html と拡張子なしの住所も見る）
// 直に流す時（上げた後）: node scripts/served.mjs [コミット]   省くと origin/new-plan
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://takenokonoko.com/';
const git = (...args) => execFileSync('git', ['-c', 'core.quotepath=off', '-C', root, ...args], { maxBuffer: 1 << 28 });
// rev を省くと、手元の今のファイル（git が追っている物）を見る
const filesAt = (rev) => (rev ? git('ls-tree', '-r', '--name-only', rev) : git('ls-files')).toString('utf8').split('\n').filter(Boolean);
const excludeAt = (rev) => {
    let config = '';
    try { config = rev ? git('show', `${rev}:_config.yml`).toString('utf8') : readFileSync(path.join(root, '_config.yml'), 'utf8'); } catch { return null; }
    return [...config.matchAll(/^\s+-\s+(\S+)\s*$/gm)].map((m) => m[1].replace(/\/$/, ''));
};

// 配る物：いちばん上のページと assets/。CNAME は GitHub Pages が自分で使う（住所では配られない）
const isPublic = (file) => /^[^/]+\.html$/.test(file) || file.startsWith('assets/');
const isHosting = (file) => file === 'CNAME';
// Jekyll は名前の頭が同じ物も外す（site と書くと sitemap.xml も外れる）
const caught = (file, exclude) => exclude.some((e) => file.startsWith(e));
const hidden = (file, exclude) => file.split('/').some((part) => /^[._]/.test(part)) || exclude.some((e) => file === e || file.startsWith(e + '/'));

export function classify(rev) {
    const exclude = excludeAt(rev);
    const problems = [];
    const served = [];
    const internal = [];
    for (const file of filesAt(rev)) {
        if (isHosting(file)) continue;
        if (isPublic(file)) {
            served.push(file);
            if (exclude && caught(file, exclude)) problems.push(`${file}：配るファイルが _config.yml の exclude に巻き込まれている`);
        } else {
            internal.push(file);
            if (!exclude) problems.push(`${file}：_config.yml が無いので、内部のファイルがサイトから読める`);
            else if (!hidden(file, exclude)) problems.push(`${file}：内部のファイルがサイトから読める。_config.yml の exclude に足す`);
        }
    }
    return { exclude, served, internal, problems };
}

export function audit(rev) {
    const { served, internal, problems } = classify(rev);
    if (problems.length) throw new Error(problems.join('\n'));
    return { served: served.length, internal: internal.length };
}

export async function live(rev = 'origin/new-plan') {
    const { served, internal } = classify(rev);
    const problems = [];
    let same = 0;
    for (const file of served) {
        const res = await fetch(`${SITE}${file}`, { cache: 'no-store' });
        const body = Buffer.from(await res.arrayBuffer());
        if (res.status === 200 && body.equals(git('show', `${rev}:${file}`))) same++;
        else problems.push(`本番の ${file} が出した版と違う（${res.status}）`);
    }
    const addresses = new Set();
    for (const file of internal) {
        addresses.add(file);
        if (/\.md$/.test(file)) { addresses.add(file.replace(/\.md$/, '.html')); addresses.add(file.replace(/\.md$/, '')); }
    }
    let closed = 0;
    for (const address of addresses) {
        const res = await fetch(`${SITE}${address}`, { cache: 'no-store', redirect: 'manual' });
        await res.arrayBuffer();
        if (res.status === 404) closed++;
        else problems.push(`本番で内部のファイルが読める：${address}（${res.status}）`);
    }
    return { same, served: served.length, closed, addresses: addresses.size, problems };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const rev = process.argv[2] || 'origin/new-plan';
    const r = await live(rev);
    console.log(`配るファイル：本番と1字も同じ ${r.same}/${r.served}`);
    console.log(`配らないファイル：本番で読めない ${r.closed}/${r.addresses}`);
    for (const p of r.problems) console.log(`- ${p}`);
    process.exit(r.problems.length ? 1 : 0);
}
