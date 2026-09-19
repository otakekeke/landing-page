import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {pages} from '../site/pages.mjs';
import {pricing,rate,formula,initialFormula,additionalFormula,additionalFee,header,footer} from '../site/shared.mjs';
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
assert.equal(pricing.referenceHourlyRate,2000);
assert.equal(pricing.multiplier,3);
assert.equal(pricing.initialFeeMonths,3);
assert.equal(pricing.additionalFeeMonths,3);
const additionalFeeCases = [[30000,48000,54000],[30000,30000,0],[30000,24000,0],[0,6000,18000],[30000,30100,300],[0,0,0]];
for(const [before,after,expected] of additionalFeeCases) assert.equal(additionalFee(before,after),expected,`Additional fee ${before} -> ${after}`);
for(const name of ['index.html','manager.html','staff.html','dayservice.html','small-facility.html','sample-app.html','subsidy-app.html','terms.html']) {
  const html = documents.get(name);
  for(const text of [additionalFormula,'標準範囲','大規模改修','54,000円','着手前']) assert.ok(html.includes(text),`${name}: additional development ${text}`);
}
assert.ok(documents.get('terms.html').includes('0円未満の場合は0円'));
assert.ok(documents.get('terms.html').includes('開発を伴わない通常の業務量の見直しだけでは追加開発費は発生しません'));
assert.equal(rate,6000);
for (const name of ['terms.html','privacy.html']) {
  assert.ok(documents.get(name).includes('一次返信は通常3営業日以内'),`${name}: public form response time`);
  assert.doesNotMatch(documents.get(name),/一次返信は原則2営業日以内/,`${name}: obsolete response time`);
}
assert.ok(documents.get('index.html').includes(formula));
for(const p of pages.filter(p=>/manager|staff|dayservice|small-facility|sample-app|subsidy-app/.test(p.file))) assert.ok(documents.get(p.file).includes(formula),p.file);
for (const [name,html] of documents) assert.doesNotMatch(html,/紙・Excel改善パック|550,000円|800,000円/,`${name}: obsolete initial plans`);
assert.ok(documents.get('index.html').includes(initialFormula));
for(const p of pages.filter(p=>/manager|staff|dayservice|small-facility|sample-app|subsidy-app/.test(p.file))) {assert.ok(documents.get(p.file).includes(initialFormula),p.file);assert.ok(documents.get(p.file).includes('月額を再計算'),p.file);}
for(const term of ['第13条','D-14','0円','最低月額','既存契約','個別契約','90,000円','180,000円',initialFormula,'月額を再計算','適用開始月']) assert.ok(documents.get('terms.html').includes(term),term);
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
for(const [h,m,expected] of [['0','0','0'],['0','1','100'],['0','59','5,900'],['1','0','6,000'],['5','0','30,000'],['5','30','33,000'],['8','0','48,000'],['20','0','120,000'],['10000','59','60,005,900'],['-1','0','—'],['1.5','0','—'],['','0','—'],['0','','—'],['0','60','—'],['0','-1','—'],['0','0.5','—'],['10001','0','—']]) {
  nodes['#saving-hours'].value=h;nodes['#saving-minutes'].value=m;nodes['#saving-hours'].events.input();
  assert.equal(nodes['#monthly-price'].value,expected,`${h}h ${m}m`);
  assert.equal(nodes['#initial-price'].value,expected==='—'?'—':new Intl.NumberFormat('ja-JP').format(Number(expected.replaceAll(',',''))*pricing.initialFeeMonths),`${h}h ${m}m initial`);
  assert.equal(nodes['#calculator-error'].hidden,expected!=='—');cases++;
}
for(const button of presets){button.events.click();assert.equal(nodes['#monthly-price'].value,new Intl.NumberFormat('ja-JP').format(Number(button.dataset.hours)*rate));assert.equal(nodes['#initial-price'].value,new Intl.NumberFormat('ja-JP').format(Number(button.dataset.hours)*rate*pricing.initialFeeMonths));assert.equal(button.attrs['aria-pressed'],'true');cases++;}
console.log(JSON.stringify({pages:documents.size,localReferences:references,calculatorCases:cases,additionalFeeCases:additionalFeeCases.length,result:'PASS'},null,2));
