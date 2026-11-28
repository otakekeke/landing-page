import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {pages,moved} from '../site/pages.mjs';
import {header,footer} from '../site/shared.mjs';
import {audit} from './served.mjs';
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
// 2026-11-12: the home-care subsidy guides (houmon.html = Kanagawa prefecture, houmon-kawasaki.html = Kawasaki city, added 2026-11-13). Not indexed, not linked from other pages.
// They must never promise a free or guaranteed result or an application service, must not use IT jargon in the body text,
// and must cover every stage from the first call to the money arriving, plus the what-if cases (no holes). Dates and wording differ by area.
{const guides=[
  {file:'houmon.html',gov:'県',stages:{'申請':['11月30日まで','県へ申請します','申請の表'],'決定':['決定のお知らせが届きます','およそ30日'],'注文か契約':['注文書','ここからが、ご契約です'],'公開':['1月22日まで'],'支払い':['1月29日まで','1月31日まで'],'報告':['2月12日まで','県へ報告します','5年間'],'補助金':['3月まで','補助金が入ります'],'窓口':['045-210-4755'],'範囲':['神奈川県の補助']}},
  {file:'houmon-kawasaki.html',gov:'市',stages:{'申請':['12月28日まで','市へ申請します','申請の表'],'決定':['決定のお知らせが届きます','速やかに'],'注文か契約':['契約書をお送りします','ここからが、ご契約です','契約書と見積書の写し'],'公開':['3月12日まで'],'支払い':['3月19日まで','3月31日まで'],'報告':['4月2日まで','市へ報告します','見積書・契約書・領収書・納品書の写し'],'補助金':['補助金が入ります','請求書を出すと','示されていません'],'窓口':['044-200-2666'],'範囲':['川崎市の補助']}}
];
const common={'試作を見る':['試作','見積書','申請の手順の動画'],'聞き取り':['お話を伺います','1時間ほど','写真'],'案と直し':['案をお見せします','直しは2回まで'],'公開':['ホームページを公開します','takenokonoko.com','応募が届くかを、一緒に試します','今のホームページがある場合'],'チラシ':['チラシが届きます','1,000枚','原稿'],'支払い':['納品書と請求書','領収書'],'そのあと':['公開から3か月は','無料で直します','1か月後'],'もしもの時':['補助が決まらなかった時','終わらないと分かった時','途中でやめたくなった時','分からない時','ほかへ移したくなった時']};
for(const g of guides){const h=documents.get(g.file);
const body=h.slice(h.indexOf('<main'),h.indexOf('</main>')).replace(/<[^>]+>/g,' ');
assert.ok(h.includes('<meta name="robots" content="noindex,nofollow">'),`${g.file}: noindex`);
assert.ok(h.includes('assets/houmon.css'),`${g.file}: page stylesheet`);
for(const text of ['補助が決まれば','補助が決まった時だけ作ります','事業所ご本人か行政書士','タケノコは申請書を作りません',`${g.gov}の窓口や、${g.gov}から頼まれた事業者ではありません`,'お約束するものではありません','お振込の手数料','30万円','翌営業日までに']) assert.ok(body.includes(text),`${g.file}: ${text}`);
assert.doesNotMatch(body,/完全無料|完全に無料|必ず通|確実に|(?<![0-9０-９万,])0円|ゼロ円|今なら|限定|申請を代行|申請書を作成します|申請をサポート/,`${g.file}: wording that must not appear`);
// 2026-11-12 the owner asked for no IT jargon (say 入力欄・住所・入口・原稿・置き場 instead).
const jargon=body.match(/フォーム|URL|ＵＲＬ|アドレス|ドメイン|サーバ|オンライン|アップロード|ダウンロード|PDF|Excel|Zoom|リンク|クリック|タップ|ログイン|アカウント|データ|サイト|ウェブ|Web|システム|コンテンツ|スマホ対応|レスポンシブ|SEO|SNS/g);
assert.equal(jargon,null,`${g.file}: IT words in the body: ${jargon}`);
// 2026-11-12 the owner asked for no holes from start to end: every stage and the what-if cases must be there.
for(const set of [common,g.stages]) for(const [stage,words] of Object.entries(set)) for(const w of words) assert.ok(body.includes(w),`${g.file}: stage ${stage} lacks ${w}`);
// The other area's dates and authority must not leak into this page.
const other=guides.find(x=>x!==g);for(const w of [...other.stages['申請'].slice(0,2),...other.stages['公開'],other.stages['支払い'][0],other.stages['報告'][0],other.stages['窓口'][0]]) assert.ok(!body.includes(w),`${g.file}: the other area's wording leaked: ${w}`);
const steps=h.split('<li class="hm-step').slice(1).map(c=>c.split('</ol>')[0]);
assert.equal(steps.length,12,`${g.file}: 12 steps`);
for(const [i,c] of steps.entries()) {assert.ok(c.includes('class="hm-when"'),`${g.file}: step ${i+1} has no date`);assert.ok(c.includes('class="hm-chip '),`${g.file}: step ${i+1} does not say who acts`);assert.ok(c.includes('<ul><li>'),`${g.file}: step ${i+1} has no concrete lines`);}
for(const [name,html] of documents) if(name!==g.file) assert.ok(!html.includes(`"${g.file}"`),`${name}: links to ${g.file}`);}}
// 2026-11-14: zaiko.html is a demo app (stock and orders for a care home, fictional data) that is shown by address only.
// It is generated outside this repository (never edit it here). Not indexed, not linked from other pages,
// and it carries no notes from the generator (one header comment only) and nothing that only works in the preview version.
{const z=await fs.readFile(path.join(root,'zaiko.html'),'utf8');
assert.match(z,/^<!doctype html>\n<html lang="ja">/,'zaiko.html: document start');
assert.ok(z.includes('<meta name="robots" content="noindex,nofollow">'),'zaiko.html: noindex');
assert.equal((z.match(/<!--/g)||[]).length,1,'zaiko.html: comments left in the served page');
assert.doesNotMatch(z,/claude|Artifact/i,'zaiko.html: preview-only code left');
assert.ok(!z.includes('\r'),'zaiko.html: CRLF');
for (const [name,html] of documents) assert.ok(!html.includes('zaiko.html'),`${name}: links to zaiko.html`);}
// 2026-11-18: the case of Rehabilitation Athletic (jirei.html + the top page's #case). Allowed by the facility: its name, screens with fictional names, and its words.
// The words must stay exactly as given, no numbers may be added to the case (the facility gave none), and the consent and "remade with fictional people" notes must be shown.
{const {VOICE,CONSENT,REMADE,SHOTS}=await import('../site/jirei.mjs');const j=documents.get('jirei.html'),home=documents.get('index.html');
const main=j.slice(j.indexOf('<main'),j.indexOf('</main>'));const text=main.replace(/<[^>]+>/g,' ');
for(const t of [VOICE,CONSENT,REMADE,'いただいた言葉のまま']) assert.ok(text.includes(t),`jirei.html: ${t.slice(0,20)}`);
for(const t of [VOICE,'リハビリアスレチックの了承をいただいて','架空の利用者・職員で作り直したもの','href="jirei.html"','毎日使われています','14の画面']) assert.ok(home.includes(t),`index.html case: ${t.slice(0,20)}`);
assert.ok(!home.includes('施設名は伏せています'),'index.html: the facility is named now');
const caseText=text.replace(VOICE,'');assert.doesNotMatch(caseText,/[0-9０-９]+\s*(分|時間|％|%|円|人|件|割|倍|か月|ヶ月|年|日間|回)/,'jirei.html: a number was added to the case');
assert.equal(SHOTS.length,6,'jirei.html: six screens');
for(const s of SHOTS){assert.ok(j.includes(`src="assets/jirei/${s.id}.png" width="760" height="${s.h}" alt="${s.alt}"`),`jirei.html: image ${s.id}`);await fs.access(path.join(root,'assets/jirei',s.id+'.png'));}
assert.ok(j.includes('assets/jirei.css'),'jirei.html: page stylesheet');
// 2026-11-19: "押して確かめる" (the same block on both pages, written once in site/jirei.mjs). The claim is the page's h1 and the top's case.
const {CLAIM,TRY}=await import('../site/jirei.mjs');
const h1=(j.match(/<h1>([\s\S]*?)<\/h1>/)||[])[1]||'';assert.equal(h1.replace(/<br>/g,''),CLAIM,'jirei.html: the claim is the h1');
assert.ok(home.replace(/<br>/g,'').includes(CLAIM),'index.html case: the claim');
for(const [name,html] of [['jirei.html',j],['index.html',home]]){
  assert.equal(html.split(TRY).length-1,1,`${name}: the "押して確かめる" block, once and unchanged`);
  assert.ok(html.includes('<link rel="stylesheet" href="assets/jirei-try.css">')&&html.includes('<script src="assets/jirei-try.js" defer></script>'),`${name}: the block's style and script`);}
for(const t of ['架空の名前で再現した見本','本物のアプリとデータは使っていません','どこにも送られず、残りません']) assert.ok(TRY.includes(t),`the block: ${t}`);
for(const a of ['off','furikae','mark']) assert.ok(TRY.includes(`data-act="${a}" aria-pressed="false"`),`the block: button ${a}`);
assert.doesNotMatch(TRY.replace(/<[^>]+>/g,' '),/[0-9０-９]+\s*(分|時間|％|%|円|人|件|割|倍|か月|ヶ月|年|日間|回)/,'the block: a number was added');
// 2026-11-19: "できるようになった事" (from the owner's words, not the facility's). Kept apart from the facility's words and before the screens.
const {GAIN}=await import('../site/jirei.mjs');assert.equal(GAIN.length,3,'jirei.html: three gains');
for(const [k,p] of GAIN) assert.ok(text.includes(k)&&text.includes(p),`jirei.html: gain ${k}`);
assert.ok(j.indexOf('id="voice"')<j.indexOf('id="gain"')&&j.indexOf('id="gain"')<j.indexOf('id="screens"'),'jirei.html: gains sit between the words and the screens');
const js=await fs.readFile(path.join(root,'assets/jirei-try.js'),'utf8');assert.doesNotMatch(js,/fetch\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|document\.cookie/,'jirei-try.js: must not send or keep anything');}
// 2026-11-28: ai-data.html (the voice notebook's AI and data handling). The seven items of rule 18(3) of the PPC enforcement rules must stay,
// with the same facts as the trial consent wording (processed in the US, contract with the Singapore company, up to 90 days, the key only on the facility's devices).
// No revision date and no "生成AI" on it (the owner's rules). Findable, and linked once from privacy.html.
// 2026-11-28 later: sections 7 and 8 (the record key and the paper copy, stopping a device) were put before the contact, which became 9.
// They carry the same facts as the consent form's key and lost-device parts, fitted to the notebook's README (kagi v2) and the app's "停止" button.
// 2026-11-28 night: a page for all of Takenoko's apps that send to an AI, not only the voice notebook (the owner: "これも汎用的にしてよ"). Same URL, same facts.
// 1 holds one h3 per app (now only the notebook, id="koe"; not "renrakucho", which check_renrakucho.mjs keeps off every other page), with the key/paper and the lost-device parts as its h4s; 2 is the AI company and the contract;
// 3-7 are common to the apps that use Google's AI; 8 is the contact. The title, h1 and the link from privacy.html no longer name the notebook.
{const {AI_DATA_HEADINGS,AI_DATA_APPS,aiDataTitle}=await import('../site/aidata.mjs');const a=documents.get('ai-data.html');
const main=a.slice(a.indexOf('<main'),a.indexOf('</main>'));const text=main.replace(/<[^>]+>/g,' ');
assert.equal(AI_DATA_HEADINGS.length,8,'ai-data.html: eight headings (1 per app, 2 AI company and contract, 3-7 common, 8 contact)');
for(const h of AI_DATA_HEADINGS) assert.ok(a.includes(`<h2>${h}</h2>`),`ai-data.html: heading ${h}`);
const at=AI_DATA_HEADINGS.map(h=>a.indexOf(`<h2>${h}</h2>`));assert.ok(at.every((v,i)=>i===0||v>at[i-1]),'ai-data.html: headings in order');
assert.equal((main.match(/<h2[ >]/g)||[]).length,AI_DATA_HEADINGS.length,'ai-data.html: no other h2');
assert.ok(AI_DATA_APPS.some(p=>p.id==='koe'&&p.name==='声で入れる連絡帳'),'ai-data.html: the voice notebook part (its consent form links here)');
for(const p of AI_DATA_APPS){const h3=a.indexOf(`<h3 id="${p.id}">${p.name}</h3>`);assert.ok(h3>at[0]&&h3<at[1],`ai-data.html: app ${p.name} sits in 1`);
  let prev=h3;for(const s of p.sub){const i=a.indexOf(`<h4>${s}</h4>`,prev);assert.ok(i>prev&&i<at[1],`ai-data.html: ${p.name} / ${s.replace(/<[^>]+>/g,'')} in order inside 1`);prev=i;}}
assert.equal((main.match(/<h3[ >]/g)||[]).length,AI_DATA_APPS.length,'ai-data.html: one h3 per app');
assert.equal((main.match(/<h4[ >]/g)||[]).length,AI_DATA_APPS.reduce((n,p)=>n+p.sub.length,0),'ai-data.html: h4 only inside the apps');
assert.ok(a.includes(`<title>${aiDataTitle}｜タケノコ</title>`)&&aiDataTitle==='AIとデータの取り扱い','ai-data.html: the title is for all apps');
assert.equal((a.match(/<h1>([\s\S]*?)<\/h1>/)||[])[1],'AI とデータの取り扱い','ai-data.html: the h1 is for all apps');
assert.ok(documents.get('privacy.html').includes('min-height:44px">AIとデータの取り扱い</a>'),'privacy.html: the link names the page for all apps');
// 2026-11-28 night: the wording was made formal, at the privacy policy's level (the owner: "ことばがやさしすぎて信ぴょう性に欠ける"). Same facts, same checks, in the new words.
for(const t of ['暗号鍵の控えの用紙を1枚お渡しします','マスター端末','事務所内の施錠できる場所','タケノコが施設の方と一緒に行います','この用紙だけでは、記録を復号できません','どなたも復号できなくなります','端末の一覧','「停止」','タケノコへのご連絡によっても、停止できます']) assert.ok(text.includes(t),`ai-data.html: ${t}`);
for(const t of ['米国','Google Asia Pacific Pte. Ltd.','再委託','データ処理の追加条項','施行規則 第16条第1号','年に1回','2021年10月時点','2022年2月時点','刑事訴訟法','最大90日','学習には使われません','施設の端末の中にのみ保管される暗号鍵','24時間以内','問題は生じていません','東京にある Google Cloud のサーバー','30日前','ISO/IEC 27001・27017・27018']) assert.ok(text.includes(t),`ai-data.html: ${t}`);
// 2026-11-28 night: from two judging roles' notes, facts unchanged. The certificates are checked as two words now ("…27018" above, "SOC 2 の報告書" below).
// The notebook part opens with a table of the main points (項目｜内容), which took over the one-line "processed in the US" paragraph.
for(const t of ['タケノコは暗号鍵を持たないため','要配慮個人情報として取り扱います','職員の方のお名前を送信します','今の記録と申し送りの文章を送信します','暗号化した形で一時的に置き','最大14日','Cloud Data Processing Addendum','SOC 2 の報告書','記録の管理主体である施設と連携']) assert.ok(text.includes(t),`ai-data.html: ${t}`);
{const h3=a.indexOf('<h3 id="koe">');const top=a.slice(h3,a.indexOf('<ul>',h3));const table=(top.match(/<table>[\s\S]*?<\/table>/)||[])[0];
assert.ok(table,'ai-data.html: the notebook part opens with the table of main points (between the h3 and the list)');
assert.ok(table.includes('<thead><tr><th scope="col">項目</th><th scope="col">内容</th></tr></thead>'),'ai-data.html: the table head is 項目｜内容');
const rows=[...table.matchAll(/<tr><th scope="row">([^<]+)<\/th><td>([^<]+)<\/td><\/tr>/g)].map(m=>[m[1],m[2]]);
assert.deepEqual(rows.map(r=>r[0]),['送信する情報','送信先','処理を行う国','記録の保存先','音声データ'],'ai-data.html: the table rows');
assert.equal((rows.find(r=>r[0]==='処理を行う国')||[])[1],'米国','ai-data.html: the table says the processing country is the US');}
assert.doesNotMatch(text,/生成\s?AI|改定日|制定日|更新日/,'ai-data.html: words that must not appear');
assert.doesNotMatch(text,/端末にも保存しません/,'ai-data.html: the draft voice is kept on the device (sealed) until saved, so do not say it is not stored there (11/28)');
assert.doesNotMatch(text,/送る物|送り先|下請け|困った事|鍵をかけ|タケノコの者|処理する国/,'ai-data.html: the soft wording came back');
assert.ok(!a.includes('noindex'),'ai-data.html: findable');
assert.equal(documents.get('privacy.html').split('href="ai-data.html"').length-1,1,'privacy.html: one link to ai-data.html');}
// 2026-11-14: internal files (docs/, scripts/, site/, README, package.json) were readable at takenokonoko.com. _config.yml tells GitHub Pages not to serve them.
// Every tracked file must be either a public file (top-level page, assets/) or hidden by the exclude list, and no public file may be caught by it.
const serving = audit();
console.log(JSON.stringify({pages:documents.size,localReferences:references,servedFiles:serving.served,internalFilesHidden:serving.internal,result:'PASS'},null,2));
