import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {pages,moved} from '../site/pages.mjs';
import {pricing,rate,monthlyFee,formula,initialFormula,additionalFormula,additionalFee,header,footer} from '../site/shared.mjs';
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
assert.equal(pricing.exampleMinimumWage,1279);
for(const [minutes,yen] of [[0,0],[1,63],[60,3837],[80,5116],[300,19185],[480,30696],[600,38370]]) assert.equal(monthlyFee(minutes),yen,`monthly fee ${minutes}min`);
assert.equal(additionalFee(19185,30696),34533);
assert.equal(pricing.multiplier,3);
assert.equal(pricing.initialFeeMonths,3);
assert.equal(pricing.additionalFeeMonths,3);
const additionalFeeCases = [[30000,48000,54000],[30000,30000,0],[30000,24000,0],[0,6000,18000],[30000,30100,300],[0,0,0]];
for(const [before,after,expected] of additionalFeeCases) assert.equal(additionalFee(before,after),expected,`Additional fee ${before} -> ${after}`);
for(const name of ['index.html','terms.html']) {
  const html = documents.get(name);
  for(const text of [additionalFormula,'標準範囲','大規模改修','34,533円','着手前']) assert.ok(html.includes(text),`${name}: additional development ${text}`);
}
assert.ok(documents.get('terms.html').includes('0円未満の場合は0円'));
assert.ok(documents.get('terms.html').includes('開発を伴わない通常の業務量の見直しだけでは追加開発費は発生しません'));
assert.equal(rate,3837);
// The fixed 2,000-yen reference rate was replaced by the minimum wage on 2026-09-27.
for (const [name,html] of documents) assert.doesNotMatch(html,/2,000円|6,000円|1分あたり100円|月額100円|基準時給2,000/,`${name}: old 2,000-yen pricing`);
for (const name of ['terms.html','privacy.html']) {
  assert.ok(documents.get(name).includes('一次返信は通常3営業日以内'),`${name}: public form response time`);
  assert.doesNotMatch(documents.get(name),/一次返信は原則2営業日以内/,`${name}: obsolete response time`);
}
assert.ok(documents.get('index.html').includes(formula));
for (const page of moved) {
  const stub = await fs.readFile(path.join(root,page.file),'utf8');
  assert.ok(stub.includes(`url=${page.to}`) && stub.includes('noindex'),`${page.file}: redirect stub`);
  for (const [name,html] of documents) assert.ok(!html.includes(`href="${page.file}"`),`${name}: links to merged page ${page.file}`);
}
for(const p of pages.filter(p=>/manager|staff|dayservice|small-facility|sample-app|subsidy-app/.test(p.file))) assert.ok(documents.get(p.file).includes(formula),p.file);
for (const [name,html] of documents) assert.doesNotMatch(html,/紙・Excel改善パック|550,000円|800,000円/,`${name}: obsolete initial plans`);
assert.ok(documents.get('index.html').includes(initialFormula));
{const home=documents.get('index.html');for(const text of ['金額の決まり方','使う前は、手順を一緒に書き出して決めます。','使った後は、アプリが記録します。','差がなければ0円。','数字は説明のための例です。','assets/price-flow.js','月額 5,116円','差がなかったら？']) assert.ok(home.includes(text),`price flow: ${text}`);assert.doesNotMatch(home,/ストップウォッチで測って/,'price flow: no stopwatch');}
// Facts decided on 2026-09-27 after the manager-perspective review.
for(const [name,texts] of [['index.html',['短いほうを採ります','無料のGoogleアカウント','インボイス）の登録をしていません','翌営業日までに','最初に伺うときは','value="20"','>5,116</output>','施設の実際の時給は伺いません','令和6年度介護従事者処遇状況等調査','令和3年就労条件総合調査','2は、減った時間の人件費にあたる分']],['terms.html',['短いほうの時間を採用します','有料のGoogle Workspaceの契約は必須としません','適格請求書発行事業者の登録をしていません','翌営業日までに']],['company.html',['インボイス）の登録はしていません']]]) for(const text of texts) assert.ok(documents.get(name).includes(text),`${name}: ${text}`);
for(const p of pages.filter(p=>/manager|staff|dayservice|small-facility|sample-app|subsidy-app/.test(p.file))) {assert.ok(documents.get(p.file).includes('index.html#price'),`${p.file}: link to pricing details`);assert.ok(documents.get(p.file).includes('月額の3か月分'),`${p.file}: initial fee summary`);}
// Copy that was removed on 2026-09-27 as salesy or cliched must not come back.
for (const [name,html] of documents) if(!/terms|privacy|conflict|index\.dc/.test(name)) assert.doesNotMatch(html,/余白を|わたしたち|LET’S START|MONTHLY ESTIMATE|FOR MANAGERS|FOR CARE TEAMS|FOR DAY SERVICES|FOR SMALL TEAMS|TRY BEFORE YOU DECIDE|WORKFLOW SUPPORT|FUNDING &amp; CONDITIONS|ABOUT TAKENOKO|時間だけでは測れない価値を|値札をつけない|「これなら私にも使えそう」|だからこそ/,`${name}: removed copy came back`);
for(const term of ['第13条','D-14','0円','最低月額','既存契約','個別契約','57,555円','115,110円','地域別最低賃金','契約締結時の基準時給',initialFormula,'月額を再計算','適用開始月']) assert.ok(documents.get('terms.html').includes(term),term);
class Element {
  constructor(value='') {this.value=value;this.attrs={};this.events={};this.textContent='';this.hidden=true;this.dataset={};}
  get valueAsNumber(){return this.value===''?NaN:Number(this.value);}
  setAttribute(name,value){this.attrs[name]=value;}
  addEventListener(name,callback){this.events[name]=callback;}
}
const nodes=Object.fromEntries(['saving-hours','saving-minutes','monthly-price','initial-price','result-detail','calculator-error'].map(id=>['#'+id,new Element()]));
nodes['#saving-hours'].value='5';nodes['#saving-minutes'].value='0';
const presets=[0,5,10,20].map(h=>{const e=new Element();e.dataset.hours=String(h);return e;});
const document={querySelector:s=>nodes[s]||null,querySelectorAll:()=>presets};
vm.runInNewContext(await fs.readFile(path.join(root,'assets/home.js'),'utf8'),{document,Intl});
let cases=0;
for(const [h,m,expected] of [['0','0','0'],['0','1','63'],['0','59',null],['1','0','3,837'],['1','20','5,116'],['5','0','19,185'],['5','30',null],['8','0','30,696'],['20','0',null],['10000','59',null],['-1','0','—'],['1.5','0','—'],['','0','—'],['0','','—'],['0','60','—'],['0','-1','—'],['0','0.5','—'],['10001','0','—']].map(([h,m,e])=>[h,m,e??new Intl.NumberFormat('ja-JP').format(monthlyFee(Number(h)*60+Number(m)))])) {
  nodes['#saving-hours'].value=h;nodes['#saving-minutes'].value=m;nodes['#saving-hours'].events.input();
  assert.equal(nodes['#monthly-price'].value,expected,`${h}h ${m}m`);
  assert.equal(nodes['#initial-price'].value,expected==='—'?'—':new Intl.NumberFormat('ja-JP').format(Number(expected.replaceAll(',',''))*pricing.initialFeeMonths),`${h}h ${m}m initial`);
  assert.equal(nodes['#calculator-error'].hidden,expected!=='—');cases++;
}
for(const button of presets){button.events.click();assert.equal(nodes['#monthly-price'].value,new Intl.NumberFormat('ja-JP').format(monthlyFee(Number(button.dataset.hours)*60)));assert.equal(nodes['#initial-price'].value,new Intl.NumberFormat('ja-JP').format(monthlyFee(Number(button.dataset.hours)*60)*pricing.initialFeeMonths));assert.equal(button.attrs['aria-pressed'],'true');cases++;}
console.log(JSON.stringify({pages:documents.size,localReferences:references,calculatorCases:cases,additionalFeeCases:additionalFeeCases.length,result:'PASS'},null,2));
