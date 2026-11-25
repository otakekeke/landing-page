// 事例：リハビリアスレチック（2026-11-18 本人「LPにも書きたい。実績として。綺麗にUX極めて。」）
// 載せてよい範囲（11/18 リハビリアスレチックの代表の確認済み）：施設のお名前・架空の名前の画面・ご感想。場所はホームページと冊子。
//   - ご感想は、いただいた言葉のまま（1字も変えない）。数字は先方が言っていないので足さない（減った時間・人数・期間など）。
//   - 画面は、本番の利用者予定管理アプリを触らず、本番データの写しも使わずに、架空の利用者・職員で作り直した物。
//     元：takenokonoko/takenoko-knowledge/operations/sales/shoukai-sasshi/screens/*.html（冊子と同じ画面。shot.cjs の 3 倍の画像を 1520px に縮めて assets/jirei/ に置いた）
//   - 文と画面は、2026-11-19 に本人が決めてリハビリアスレチックに見ていただく（了承の時の約束ではない）。push は本人の OK のあと。
// 文は冊子（sasshi.html の 10〜19 ページ）とそろえる。scripts/check_site.mjs が、ご感想・了承・作り直しの断り書き・数字を足していない事を見張る。
import {cta} from './shared.mjs';

export const VOICE = 'バイタル表や送迎表が利用されている方と連携されているので、とても使いやすいです。時間短縮にもなっています。';
export const CONSENT = '施設のお名前とご感想は、リハビリアスレチックの了承をいただいて載せています。';
export const REMADE = '画面は、実際の画面を、架空の利用者・職員で作り直したものです。';

// 6 つの画面（冊子の 14〜19 ページと同じ順・同じ文）。h は画像の高さ（幅 760 の時）
export const SHOTS = [
  {id:'weekday', tag:'入れる所', name:'曜日別の利用者マスタ', h:487,
   what:'決まった曜日に来る方を、午前・午後ごとに入れておきます。',
   linkH:'ここに入れると', link:'その曜日のバイタル表・送迎表・実施記録の、もとになります。',
   alt:'曜日別の利用者マスタの画面。午前の利用者を、番号ごとに月曜から金曜の欄へ名前で入れる。'},
  {id:'off', tag:'入れる所', name:'お休みカレンダー', h:358,
   what:'お休みの電話を受けたら、その日の午前か午後の「＋」から名前を入れます。理由も残せます。決まった曜日のお休みは、ひと月分をまとめて入れられます。',
   linkH:'ここに入れると', link:'その日のバイタル表と実施記録では名前が線で消え、送迎表の名前の候補には出なくなります。',
   alt:'お休みカレンダーの画面。日ごとに、午前・午後のお休みの方の名前と理由が出る。'},
  {id:'vitals', tag:'並ぶ表', name:'バイタル表', h:446,
   what:'その日来る方が並び、体温・血圧・脈拍・酸素と注意事項を入れます。',
   linkH:'つながり', link:'お休みの方は名前が線で消え、振替で来る方には（振替）と出ます。',
   alt:'バイタル表の画面。その日来る方が並び、体温・血圧・脈拍・酸素・注意事項を入れる。お休みの方の名前は線で消え、振替の方は（振替）と付く。'},
  {id:'route', tag:'並ぶ表', name:'送迎表', h:407,
   what:'車ごとに、運転する職員と、迎えに行く方・時間を並べて印刷します。',
   linkH:'つながり', link:'名前の候補に、その日来る方が出ます。お休みの方は出ず、振替で来る方は（振替）と出るので、迎えの行き違いを防げます。前の日の送迎表をコピーしたり、同じ曜日の日にまとめて保存したりもできます。',
   alt:'送迎表の画面。車ごとに運転する職員と、迎えに行く方の名前と時間が並ぶ。'},
  {id:'record', tag:'並ぶ表', name:'通所介護実施記録', h:477,
   what:'その日来る方が並び、記入者・様子・看護記録・施術の項目を入れます。表は右へ長く続きます（画像は左の一部）。',
   linkH:'つながり', link:'記入者は［記入者一括入力］で、表の全員に一度で入ります。お休みの方は名前が線で消えます。「申し送り」に印を付けた行は、申し送りの画面に並びます。',
   alt:'通所介護実施記録の画面。その日来る方が並び、記入者・申し送りの印・様子を入れる。お休みの方は名前が線で消える。表は右へ続く。'},
  {id:'handover', tag:'並ぶ表', name:'申し送り', h:556,
   what:'実施記録で「申し送り」に印を付けた行が、日ごと・午前午後ごとに並びます。',
   linkH:'使い方', link:'年月・利用者名・曜日で絞り込み、そのまま印刷できます。書き写す手間がありません。',
   alt:'申し送りの画面。年月・利用者名・曜日で絞り込み、日ごと・午前午後ごとに、利用者名・施術・様子・看護記録が並ぶ。'}
];

// つながっている画面（トップの「実例」の一覧と同じ物・同じ順）
export const SCREENS = ['利用者の一覧','曜日ごとの利用者','お休み','振替・臨時','送迎表','送迎カレンダー','バイタル','通所介護の実施記録','施術・運動シート','申し送り','お誕生日','車両','使う人の管理','使い方の説明'];

// 芯の一言（2026-11-19 本人「凄さがめっちゃわかるようにしてどっちも」）。冊子の事例のページと同じ言葉。
export const CLAIM = 'お休みも振替も、入れるのは一度だけ。';

// 押して確かめる（トップの「実例」と、このページの 01 の両方に同じ物を置く。トップには scripts/build_pages.mjs が差し込む）
// 名前・行は全部ここで書き出し、assets/jirei-try.js は見せる・隠す・線・印だけを変える。名前は冊子の画面と同じ架空の方。
// 朝、まだ測っていない時の表なので、体温・血圧などの欄は空。
const person = (row, name, extra = '') => `<span class="jr-name">${name}</span>${row === 'ueno' ? '<span class="jr-vh jr-offtxt" hidden>（お休み）</span>' : ''}${extra}`;
const BASE = [['aoki','青木 花子'],['ishida','石田 正'],['ueno','上野 和子']];
const tp = (id, title, body, sub = '') => `<section class="jr-tp" data-panel="${id}" aria-label="${title}"><div class="jr-tp-head"><h3>${title}</h3><span class="jr-tp-badge" hidden></span></div>${sub ? `<p class="jr-tp-sub">${sub}</p>` : ''}${body}<p class="jr-tp-note" aria-hidden="true"></p></section>`;
const vitalsTp = tp('vitals', 'バイタル表', `<table><thead><tr><th scope="col">利用者氏名</th><th scope="col" class="jr-wide">体温</th><th scope="col" class="jr-wide">血圧</th></tr></thead><tbody>${
  BASE.map(([r, n]) => `<tr data-row="${r}"><td>${person(r, n)}</td><td class="jr-wide"></td><td class="jr-wide"></td></tr>`).join('')
}<tr data-row="okawa" hidden><td><span class="jr-name">大川 幸子（振替）</span></td><td class="jr-wide"></td><td class="jr-wide"></td></tr></tbody></table>`);
const routeTp = tp('route', '送迎表', `<ul class="jr-cands" aria-label="迎えに行く方の名前の候補">${
  BASE.map(([r, n]) => `<li data-row="${r}">${n}</li>`).join('')
}<li data-row="okawa" hidden>大川 幸子（振替）</li></ul>`, '1号車の迎え：名前の候補');
const recordTp = tp('record', '実施記録', `<table><thead><tr><th scope="col">利用者氏名</th><th scope="col">申し送り</th><th scope="col" class="jr-wide">様子</th></tr></thead><tbody>${
  BASE.map(([r, n]) => `<tr data-row="${r}"><td>${person(r, n)}</td><td class="jr-c">${r === 'ishida' ? '<span class="jr-box" role="img" aria-label="申し送りの印なし"></span>' : ''}</td><td class="jr-wide jr-y">${r === 'ishida' ? '帰る前に血圧を測り直した。ご家族へ' : ''}</td></tr>`).join('')
}<tr data-row="okawa" hidden><td><span class="jr-name">大川 幸子</span></td><td class="jr-c"></td><td class="jr-wide jr-y"></td></tr></tbody></table>`);
const handoverTp = tp('handover', '申し送り', `<table><thead><tr><th scope="col">利用者氏名</th><th scope="col">様子</th></tr></thead><tbody><tr data-row="empty"><td colspan="2" class="jr-y">印を付けた行は、まだありません。</td></tr><tr data-row="ishida" hidden><td>石田 正</td><td class="jr-y">帰る前に血圧を測り直した。ご家族へ</td></tr></tbody></table>`);
// スマホでは、表が同じ画面に入るように、短い言葉（short）の横一列にする
const act = (id, where, what, short) => `<li><button type="button" class="jr-act" data-act="${id}" aria-pressed="false"><span class="jr-act-icon" aria-hidden="true"></span><span class="jr-act-where">${where}</span><span class="jr-act-what">${what}</span><span class="jr-act-short">${short}</span><span class="jr-act-done">入れました・押すと取り消し</span></button></li>`;
export const TRY = `<div class="jr-try" data-try>
  <div class="jr-try-controls">
    <p class="jr-try-day">ある水曜日の午前（見本）</p>
    <p class="jr-try-lead">入れるのは一か所だけ。<br>押すと、表がそろって変わります。</p>
    <ul class="jr-acts">${act('off', 'お休みカレンダーに', '上野 和子さんのお休みを入れる', '上野さんの<br>お休み')}${act('furikae', '振替・臨時に', '大川 幸子さんの振替を入れる', '大川さんの<br>振替')}${act('mark', '実施記録で', '石田 正さんの行に申し送りの印を付ける', '石田さんに<br>申し送りの印')}</ul>
    <button type="button" class="jr-reset">最初に戻す</button>
    <p class="jr-try-status" role="status">ボタンを押すと、表が変わります。</p>
  </div>
  <div class="jr-tps">${vitalsTp}${routeTp}${recordTp}${handoverTp}</div>
  <p class="jr-try-fine">本物のアプリの動きを、架空の名前で再現した見本です。本物のアプリとデータは使っていません。押した内容は、どこにも送られず、残りません。</p>
</div>`;

const section = (id, kicker, title, body, tint = false) => `<section class="section sub-section${tint ? ' sub-tint' : ''}" id="${id}"><div class="container"><div class="section-heading"><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${body}</div></section>`;

const voice = `<div class="jr-voice-grid">
  <figure class="jr-voice">
    <blockquote><p>${VOICE}</p></blockquote>
    <figcaption>リハビリアスレチックの方<small>いただいた言葉のまま載せています。</small></figcaption>
  </figure>
  <div class="jr-before-after">
    <div class="jr-ba jr-before"><p class="jr-ba-h">前は</p><p>実施記録とお休みは紙でした。紙に書いてから、ソフトに打ち直していました。</p></div>
    <div class="jr-ba jr-after"><p class="jr-ba-h">作った物</p><p>利用者・曜日の予定・お休み・振替を一度入れると、その日のバイタル表・送迎表・実施記録に、その日来る方が並ぶアプリ。請求は今までどおり介護ソフトで。</p></div>
  </div>
</div>`;

// 何が違うのか（3 つ）。どれも、この施設で作った物の事実だけ。数字は足さない（画面の数は実際に数えた数）。
const points = `<section class="jr-points-sec" aria-label="この事例の要点"><div class="container"><ol class="jr-points">
  <li><p class="jr-point-k"><span class="jr-point-n" aria-hidden="true">1</span>入れるのは一度</p><p>お休みも振替も、一か所に入れるだけです。ほかの表で、入れ直しません。</p></li>
  <li><p class="jr-point-k"><span class="jr-point-n" aria-hidden="true">2</span>ほかの表に、そろって出る</p><p>バイタル表・送迎表・実施記録に、その日来る方が並びます。印を付けた記録は、申し送りへ。</p></li>
  <li><p class="jr-point-k"><span class="jr-point-n" aria-hidden="true">3</span>この施設の仕事の形で</p><p>曜日ごとの予定、送迎の車、施術の項目まで、この施設のやり方のままです。請求は今までどおり介護ソフトで。</p></li>
</ol></div></section>`;

// 紙からアプリにして、できるようになった事（2026-11-19 本人「紙で記録していたのを、デジタルにしたことで、一括入力やコピペなどが簡単に…
// 担当者なども一括入力できる…お迎えに行くのを忘れたり、その逆も防げる…いろんなところで管理しなくてもよくなる」）。
// 先方の言葉ではないので、ご感想とは分けて、アプリでできる事として書く。冊子の 11 ページと同じ文。どれも本物のアプリの動き（ソースと説明書で確かめた）。
export const GAIN = [
  ['まとめて入れられる', '記入者は、表の全員に一度で入ります。送迎表は前の日をコピーして使えます。'],
  ['迎えの行き違いを防ぐ', 'お休みの方は、送迎表に出ません。振替の方は「（振替）」付きで出ます。迎え忘れも、むだな迎えも防げます。'],
  ['あちこちで管理しない', 'お休みも振替も、入れるのは一か所。バイタル表・実施記録・送迎表が、それに合わせてそろいます。']
];
const gain = `<ol class="jr-points jr-gain">${GAIN.map(([k, p], i) => `<li><p class="jr-point-k"><span class="jr-point-n" aria-hidden="true">${i + 1}</span>${k}</p><p>${p}</p></li>`).join('')}</ol>`;

const shots = `<p class="jr-remade">${REMADE}<span class="jr-tap">画像を押すと、大きく開きます。</span></p>
<ol class="jr-shots">${SHOTS.map(s=>`
  <li class="jr-shot" id="screen-${s.id}">
    <a class="jr-shot-img" href="assets/jirei/${s.id}.png" aria-label="${s.name}の画面を大きく開く"><img src="assets/jirei/${s.id}.png" width="760" height="${s.h}" alt="${s.alt}"></a>
    <div class="jr-shot-text"><p class="jr-tag${s.tag==='入れる所'?' jr-tag-in':''}">${s.tag}</p><h3>${s.name}</h3><p>${s.what}</p><div class="jr-link"><p class="jr-link-h">${s.linkH}</p><p>${s.link}</p></div></div>
  </li>`).join('')}
</ol>`;

const screens = `<ul class="jr-screens">${SCREENS.map(s=>`<li>${s}</li>`).join('')}</ul>
<p class="jr-consent">${CONSENT}${REMADE}</p>`;

const mihon = `<section class="section sub-section jr-next"><div class="container"><div class="mihon-cta"><div><h3>同じ流れを、見本で触れます。</h3><p>デイサービスの例です。お休みの電話を入れると、今日の画面・送迎表・記録にまとめて反映されます。<br class="desktop-break">名前はすべて仮のものです。入れた内容は、お使いの端末の中だけに残ります。</p></div><div class="mihon-actions"><a class="button button-primary" href="mihon.html">見本を触る <span aria-hidden="true">→</span></a><a class="text-link" href="index.html#case">トップの実例へ戻る <span aria-hidden="true">↑</span></a></div></div></div></section>`;

export const jirei = {
  file:'jirei.html', title:'事例：リハビリアスレチック', eyebrow:'事例｜リハビリアスレチック（通所介護・神奈川県相模原市）',
  heading:'お休みも振替も、<br>入れるのは一度だけ。',
  description:'リハビリアスレチックのために作ったアプリです。お休みや振替を一度入れると、その日のバイタル表・送迎表・実施記録に、その日来る方がそろって出ます。請求は今までどおり介護ソフトで。',
  heroLink:'<a class="text-link" href="#try">押して確かめる <span aria-hidden="true">↓</span></a>',
  styles:['assets/jirei.css','assets/jirei-try.css'], scripts:['assets/jirei-try.js'], bodyClass:'jr-page',
  body: points
    + section('try','01 / 押して確かめる','一つ入れると、<br>ほかの表がそろって変わります。',TRY)
    + section('voice','02 / ご感想','使っている方から、<br class="mobile-break">いただいた言葉です。',voice,true)
    + section('gain','03 / できるようになった事','紙からアプリにして、<br>できるようになった事。',gain)
    + section('screens','04 / 使っている画面','入れる所と、並ぶ表。',shots,true)
    + section('all-screens','05 / つながっている画面','この施設の仕事に合わせた画面です。',screens)
    + mihon + cta
};
