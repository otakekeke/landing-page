import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {pages,moved} from '../site/pages.mjs';
import {header,footer} from '../site/shared.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = ['index.html',...pages.map(p=>p.file),'index.dc.html'];
const documents = new Map(await Promise.all(names.map(async n=>[n,await fs.readFile(path.join(root,n),'utf8')])));
let references = 0;
for (const [name,html] of documents) {
  assert.match(html, /<html lang="ja">/, name);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length,`Duplicate id: ${name}`);
  if (name!=='index.dc.html') {
    assert.equal((html.match(/<h1\b/g)||[]).length,1,`${name}: one H1`);
    assert.ok(html.includes(header(name==='index.html')),`${name}: shared navigation`);
    assert.ok(html.includes(footer(name==='index.html')),`${name}: shared footer`);
    assert.ok(html.includes('assets/home.css') && html.includes('assets/home.js'),name);
    assert.doesNotMatch(html,/固定価格|月額運用サポート費|月額[^<\n]{0,15}1\/3|¥(?:10,000|15,000|30,000)\s*\/月/,`${name}: obsolete pricing`);
    assert.doesNotMatch(html,/gtag\(|googletagmanager\.com|mode:\s*['"]no-cors/,`${name}: undeclared tracking or opaque form submission`);
  }
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:)/.test(url)) continue;
    const [file,hash] = url.split('#');
    const target = file || name;
    assert.ok(path.resolve(root,target).startsWith(root+path.sep),`Out-of-site path: ${url}`);
    await fs.access(path.join(root,target));
    if(hash) assert.ok((documents.get(target)||await fs.readFile(path.join(root,target),'utf8')).includes(`id="${hash}"`),`${name}: missing ${url}`);
    references++;
  }
  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(m[0],/rel="[^"]*noopener/,name);
}
// 2026-10-30: the time-based price (saved minutes x minimum wage) was dropped; prices are quoted after hearing.
for (const name of ['terms.html','privacy.html','sample-app.html','company.html']) assert.doesNotMatch(documents.get(name),/削減時間|最低賃金|基準時給|シミュレーター|月額0円/,`${name}: time-based pricing left`);
for (const text of ['見積書に示し','着手前に示し','大規模改修','月額に含まれる不具合修正']) assert.ok(documents.get('terms.html').includes(text),`terms: ${text}`);
// The fixed 2,000-yen reference rate was replaced by the minimum wage on 2026-09-27.
for (const [name,html] of documents) assert.doesNotMatch(html,/2,000円|6,000円|1分あたり100円|月額100円|基準時給2,000/,`${name}: old 2,000-yen pricing`);
for (const name of ['terms.html','privacy.html']) {
  assert.ok(documents.get(name).includes('一次返信は通常3営業日以内'),`${name}: public form response time`);
  assert.doesNotMatch(documents.get(name),/一次返信は原則2営業日以内/,`${name}: obsolete response time`);
}
for (const page of moved) {
  const stub = await fs.readFile(path.join(root,page.file),'utf8');
  assert.ok(stub.includes(`url=${page.to}`) && stub.includes('noindex'),`${page.file}: redirect stub`);
  for (const [name,html] of documents) assert.ok(!html.includes(`href="${page.file}"`),`${name}: links to merged page ${page.file}`);
}
for (const [name,html] of documents) assert.doesNotMatch(html,/紙・Excel改善パック|550,000円|800,000円/,`${name}: obsolete initial plans`);
// 2026-10-30: core message is 'care software is hard to use'; price is told after hearing, no 0-yen promise on the top page.
{const home=documents.get('index.html');for(const text of ['介護ソフトは、','使いにくい。','お話を聞いてから','法改正']) assert.ok(home.includes(text),`core: ${text}`);assert.doesNotMatch(home,/減らなければ0円|短くならなければ0円|price-flow\.js|calculator/,'top page: no time-based pricing');}
// Facts decided on 2026-09-27 after the manager-perspective review.
for(const [name,texts] of [['index.html',['無料のGoogleアカウント','インボイス）の登録をしていません','翌営業日までに','最初に伺うときは','毎日使われています','14の画面']],['terms.html',['有料のGoogle Workspaceの契約は必須としません','適格請求書発行事業者の登録をしていません','翌営業日までに']],['company.html',['インボイス）の登録はしていません']]]) for(const text of texts) assert.ok(documents.get(name).includes(text),`${name}: ${text}`);
for(const p of pages.filter(p=>/manager|staff|dayservice|small-facility|sample-app|subsidy-app/.test(p.file))) {assert.ok(documents.get(p.file).includes('index.html#price'),`${p.file}: link to pricing details`);}
// Copy that was removed on 2026-09-27 as salesy or cliched must not come back.
for (const [name,html] of documents) if(!/terms|privacy|conflict|index\.dc/.test(name)) assert.doesNotMatch(html,/余白を|わたしたち|LET’S START|MONTHLY ESTIMATE|FOR MANAGERS|FOR CARE TEAMS|FOR DAY SERVICES|FOR SMALL TEAMS|TRY BEFORE YOU DECIDE|WORKFLOW SUPPORT|FUNDING &amp; CONDITIONS|ABOUT TAKENOKO|時間だけでは測れない価値を|値札をつけない|「これなら私にも使えそう」|だからこそ/,`${name}: removed copy came back`);
for(const term of ['第13条','D-14','既存契約','個別契約','適用開始月']) assert.ok(documents.get('terms.html').includes(term),term);
// 2026-11-12: the home-care subsidy guide (houmon.html). Not indexed, not linked from other pages. It must never promise a free or guaranteed result or an application service,
// must not use IT jargon in the body text, and must cover every stage from the first call to the money arriving, plus the what-if cases (no holes).
{const h=documents.get('houmon.html');
const body=h.slice(h.indexOf('<main'),h.indexOf('</main>')).replace(/<[^>]+>/g,' ');
assert.ok(h.includes('<meta name="robots" content="noindex,nofollow">'),'houmon: noindex');
assert.ok(h.includes('assets/houmon.css'),'houmon: page stylesheet');
for(const text of ['補助が決まれば','補助が決まった時だけ作ります','事業所ご本人か行政書士','タケノコは申請書を作りません','県の窓口や、県から頼まれた事業者ではありません','お約束するものではありません','お振込の手数料','30万円']) assert.ok(body.includes(text),`houmon: ${text}`);
assert.doesNotMatch(body,/完全無料|完全に無料|必ず通|確実に|(?<![0-9０-９万,])0円|ゼロ円|今なら|限定|申請を代行|申請書を作成します|申請をサポート/,'houmon: wording that must not appear');
// 2026-11-12 the owner asked for no IT jargon (say 入力欄・住所・入口・原稿・置き場 instead).
const jargon=body.match(/フォーム|URL|ＵＲＬ|アドレス|ドメイン|サーバ|オンライン|アップロード|ダウンロード|PDF|Excel|Zoom|リンク|クリック|タップ|ログイン|アカウント|データ|サイト|ウェブ|Web|システム|コンテンツ|スマホ対応|レスポンシブ|SEO|SNS/g);
assert.equal(jargon,null,`houmon: IT words in the body: ${jargon}`);
// 2026-11-12 the owner asked for no holes from start to end: every stage and the what-if cases must be there.
const stages={'試作を見る':['試作','見積書','申請の手順の動画'],'県へ申請':['11月30日まで','県へ申請します','申請の表'],'決定':['決定のお知らせが届きます','およそ30日'],'注文':['注文書','ここからが、ご契約です'],'聞き取り':['お話を伺います','1時間ほど','写真'],'案と直し':['案をお見せします','直しは2回まで'],'公開':['1月22日まで','ホームページを公開します','takenokonoko.com','応募が届くかを、一緒に試します','今のホームページがある場合'],'チラシ':['チラシが届きます','1,000枚','原稿'],'支払い':['1月29日まで','納品書と請求書','領収書','1月31日まで'],'県へ報告':['2月12日まで','県へ報告します','5年間'],'補助金':['3月まで','補助金が入ります'],'そのあと':['公開から3か月は','無料で直します','1か月後'],'もしもの時':['補助が決まらなかった時','終わらないと分かった時','途中でやめたくなった時','分からない時','ほかへ移したくなった時'],'連絡先':['翌営業日までに']};
for(const [stage,words] of Object.entries(stages)) for(const w of words) assert.ok((stage==='連絡先'?h:body).includes(w),`houmon: stage ${stage} lacks ${w}`);
const steps=h.split('<li class="hm-step').slice(1).map(c=>c.split('</ol>')[0]);
assert.equal(steps.length,12,'houmon: 12 steps');
for(const [i,c] of steps.entries()) {assert.ok(c.includes('class="hm-when"'),`houmon: step ${i+1} has no date`);assert.ok(c.includes('class="hm-chip '),`houmon: step ${i+1} does not say who acts`);assert.ok(c.includes('<ul><li>'),`houmon: step ${i+1} has no concrete lines`);}
for(const [name,html] of documents) if(name!=='houmon.html') assert.ok(!html.includes('houmon.html'),`${name}: links to the houmon guide`);}
console.log(JSON.stringify({pages:documents.size,localReferences:references,result:'PASS'},null,2));
