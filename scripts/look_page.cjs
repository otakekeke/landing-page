// 1つのページを、人が受け取る形（スマホ・パソコンの画面と、A4 に刷った紙）で開いて測る。regress_site.mjs が、変わったページと新しいページに流す。
// 使い方: node scripts/look_page.cjs houmon.html [--strict] [--shots=写真の出力先]
// - 落とすもの：横のはみ出し・コンソールや読み込みの誤り・h1 が1つでない・紙が横にはみ出す
// - --strict（新しいページ）：本文の 14px 未満の字・44px 未満の押せる所も落とす（デジタル庁デザインシステムの決まり）。
//   前からあるページは数だけ出す（前からの小さい字があるため。増やさないこと）
// 画面を開く道具（playwright-core と Chromium）は、このリポジトリの隣の .e2e_tools と、パソコンに入っている物を使う。
const path = require('path'), fs = require('fs'), os = require('os');
const { pathToFileURL } = require('url');
const root = path.resolve(__dirname, '..');
const { chromium } = require(path.resolve(root, '..', '.e2e_tools', 'node_modules', 'playwright-core'));
const browsers = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
const dir = fs.readdirSync(browsers).filter((d) => /^chromium-\d+$/.test(d)).sort().pop();
const EXE = path.join(browsers, dir, 'chrome-win64', 'chrome.exe');
const file = process.argv[2];
const strict = process.argv.includes('--strict');
const shots = (process.argv.find((a) => a.startsWith('--shots=')) || '').slice(8);
if (!file) { console.error('ページのファイルを指定してください'); process.exit(2); }
const url = pathToFileURL(path.resolve(root, file)).href;

(async () => {
  const b = await chromium.launch({ executablePath: EXE });
  const problems = [];
  const out = { file, strict, screens: [], paper: null };
  for (const [label, width, height] of [['スマホ 390', 390, 844], ['スマホ 320', 320, 700], ['パソコン 1280', 1280, 800]]) {
    const ctx = await b.newContext({ viewport: { width, height } });
    const p = await ctx.newPage();
    const errors = [];
    p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 120)); });
    p.on('pageerror', (e) => errors.push(String(e).slice(0, 120)));
    p.on('requestfailed', (r) => errors.push('読めない: ' + r.url().slice(-80)));
    await p.goto(url);
    await p.waitForLoadState('networkidle');
    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const main = document.querySelector('main') || document.body;
      const vis = (el) => { const s = getComputedStyle(el); const q = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && q.width > 0 && q.height > 0; };
      const small = []; const seen = new Set();
      const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const t = walker.currentNode; if (!t.nodeValue.trim()) continue;
        const el = t.parentElement; if (seen.has(el) || !vis(el)) continue; seen.add(el);
        const size = parseFloat(getComputedStyle(el).fontSize);
        if (size < 14) small.push(`${size}px「${t.nodeValue.trim().slice(0, 12)}」`);
      }
      const over = [...main.querySelectorAll('*')].filter((el) => vis(el) && el.getBoundingClientRect().right > de.clientWidth + 0.5).map((el) => String(el.className || el.tagName)).slice(0, 5);
      const tap = [...main.querySelectorAll('a,summary,button')].filter(vis).map((el) => ({ h: Math.round(el.getBoundingClientRect().height), t: (el.textContent || '').trim().slice(0, 12) })).filter((x) => x.h < 44).map((x) => `${x.h}px「${x.t}」`);
      return { scrollW: de.scrollWidth, clientW: de.clientWidth, small, over, tap, h1: document.querySelectorAll('h1').length };
    });
    if (shots) { fs.mkdirSync(shots, { recursive: true }); await p.screenshot({ path: path.join(shots, `${path.basename(file, '.html')}_${width}.png`), fullPage: true }); }
    out.screens.push({ label, 横のはみ出し: r.scrollW > r.clientW ? r.scrollW - r.clientW : 0, はみ出した要素: r.over.length, '14px未満の字': r.small.length, '44px未満の押せる所': r.tap.length, 誤り: errors.length });
    if (r.scrollW > r.clientW || r.over.length) problems.push(`${label}：横にはみ出す（${r.over.join('・') || r.scrollW + 'px'}）`);
    if (errors.length) problems.push(`${label}：誤り ${errors.slice(0, 3).join(' / ')}`);
    if (r.h1 !== 1) problems.push(`${label}：h1 が ${r.h1} 個`);
    if (strict && r.small.length) problems.push(`${label}：14px 未満の字 ${r.small.slice(0, 4).join(' ')}`);
    if (strict && r.tap.length) problems.push(`${label}：44px 未満の押せる所 ${r.tap.slice(0, 4).join(' ')}`);
    await ctx.close();
  }
  // 紙：実際の印刷の道筋で A4 の PDF にして、枚数・いちばん小さい字（pt）・横のはみ出しを測る
  {
    const ctx = await b.newContext({ viewport: { width: 794, height: 1123 } });
    const p = await ctx.newPage();
    await p.goto(url);
    await p.waitForLoadState('networkidle');
    await p.emulateMedia({ media: 'print' });
    const r = await p.evaluate(() => {
      const de = document.documentElement;
      const main = document.querySelector('main') || document.body;
      const vis = (el) => { const s = getComputedStyle(el); const q = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && q.width > 0 && q.height > 0; };
      let min = 999; const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) { const t = walker.currentNode; if (!t.nodeValue.trim() || !vis(t.parentElement)) continue; min = Math.min(min, parseFloat(getComputedStyle(t.parentElement).fontSize)); }
      return { minPx: min, over: de.scrollWidth - de.clientWidth };
    });
    const tmp = path.join(os.tmpdir(), `look_${process.pid}.pdf`);
    await p.pdf({ path: tmp, format: 'A4', printBackground: true });
    const pages = (fs.readFileSync(tmp, 'latin1').match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
    fs.unlinkSync(tmp);
    out.paper = { 枚数: pages, 'いちばん小さい字(pt)': Math.round(r.minPx * 0.75 * 10) / 10, 横のはみ出し: Math.max(0, r.over) };
    if (r.over > 0) problems.push(`紙：横に ${r.over}px はみ出す`);
    if (!pages) problems.push('紙：PDF の枚数を数えられない');
    if (strict && r.minPx * 0.75 < 9) problems.push(`紙：いちばん小さい字が ${Math.round(r.minPx * 0.75 * 10) / 10}pt（9pt 未満）`);
    await ctx.close();
  }
  await b.close();
  out.problems = problems;
  console.log(JSON.stringify(out));
  process.exit(problems.length ? 1 : 0);
})().catch((e) => { console.log(JSON.stringify({ file, problems: ['測れない：' + String(e).slice(0, 200)] })); process.exit(1); });
