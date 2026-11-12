// 訪問介護の事業所向け：ヘルパー募集のホームページとチラシ（補助金）のご案内。アポの日に、このページを見せながら説明する。
// 2026-11-12 本人「全体の流れのページを takenokonoko のページのどこかに設けたい。当日説明する用に」
//   → 同日「全体的に、極めて具体的に、かつ簡潔に、かつ、IT専門用語がない形に。契約前も後も。作ったものをどうやってそのホームページに反映するとかも。開始から終了まで穴がないように」
// トップからはつなげない・検索に出さない（noindex）。日付と金額は神奈川県の補助（4市を除く県内）の分。
// 正本：takenokonoko/takenoko-knowledge/strategy/current/訪問介護の補助_ホームページとチラシ_方針と流れ_2026-11-08.md
// 決まり（scripts/check_site.mjs が見張る）：
//   - 「完全無料」「必ず通る」「0円」と書かない。「実質無料」には「補助が決まれば」を付ける。申請書は事業所ご本人か行政書士。県の関係者に見せない
//   - 本文に IT の言葉を使わない（入力欄・住所・入口・原稿・置き場 と言う）
//   - 始めから終わりまでの段（試作 → 申請 → 決定 → 注文 → 聞き取り → 案 → 公開 → チラシ → 支払い → 報告 → 補助金 → そのあと）と、もしもの時を欠かさない
// 2026-11-12 本人が決めた約束：置き場はタケノコが無料で用意（住所は「事業所名.takenokonoko.com」の形）・公開から3か月は文字と写真の入れ替えが無料・途中でやめても費用はいただかない・月々の費用は取らない
import {contacts} from './shared.mjs';

// shared.mjs の section() と同じ形に、ページ内の行き先（id）を付けた物
const section = (id, kicker, title, body, tint = false) => `<section class="section sub-section${tint ? ' sub-tint' : ''}" id="${id}"><div class="container"><div class="section-heading"><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${body}</div></section>`;

// 日付と金額（県の交付申請マニュアル・県のページと、見積書の型 mitsumori/make_docs.cjs に合わせる）
const D = {
  apply: '11月30日',
  due: '1月22日',
  pay: '1月29日',
  payLimit: '1月31日',
  report: '2月12日',
  grant: '3月',
  price: '30万円',
  prints: '1,000枚',
  kenTel: '045-210-4755'
};

const who = (...names) => `<span class="hm-who">${names.map(n => `<span class="hm-chip hm-chip-${n === '事業所様' ? 'you' : n === '県' ? 'ken' : 'us'}">${n}</span>`).join('')}</span>`;
const step = (when, title, actors, lines) => `<li class="hm-step${actors.includes('事業所様') ? ' hm-step-you' : ''}"><p class="hm-when">${when}</p><div class="hm-step-body"><h3>${title}</h3>${who(...actors)}<ul>${lines.map(l => `<li>${l}</li>`).join('')}</ul></div></li>`;
const arrow = '<span class="hm-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>';

const index = `<nav class="hm-index" aria-label="このページの内容"><div class="container"><ul>
<li><a href="#hm-make">作るもの</a></li><li><a href="#hm-promise">お約束</a></li><li><a href="#hm-money">お金の流れ</a></li><li><a href="#hm-before">ご契約まで</a></li><li><a href="#hm-after">ご契約のあと</a></li><li><a href="#hm-if">もしもの時</a></li>
</ul></div></nav>`;

const make = `<div class="hm-make">
<article class="hm-card"><h3>ホームページ</h3><ul>
<li>ヘルパー募集の、1ページのホームページです。スマホで見やすく作ります。</li>
<li>載せること：仕事の内容、働ける曜日と時間、時給、よくある心配への答え、応募の方法。</li>
<li>応募の方法は2つ。電話のボタン（押すと事業所にかかります）と、入力欄（名前と電話番号を書いて送ると、事業所のメールに届きます）。</li>
<li>文章は、お話を伺ってこちらで書きます。</li>
</ul></article>
<article class="hm-card"><h3>チラシ</h3><ul>
<li>ホームページと同じ内容の、A4・両面・カラーのチラシを1種類。</li>
<li>${D.prints}を印刷して、事業所へお届けします。</li>
<li>QRコードを入れます（スマホのカメラで読むと、ホームページが開きます）。</li>
<li>裏面に、利用者・ご家族への案内も入れられます。</li>
</ul></article>
</div>
<div class="hm-price"><p class="hm-price-label">料金</p><p class="hm-price-value">${D.price}<small>（一式）</small></p><ul>
<li>消費税のご請求はありません。</li>
<li>追加のご請求、月々の費用はありません。</li>
<li>お振込の手数料だけ、事業所様のご負担です。</li>
</ul></div>`;

const promise = `<ol class="hm-promise">
<li><h3>補助が決まった時だけ作ります</h3><p>決まらなければ、作りませんし、ご請求もしません。試作を見るのも無料です。</p></li>
<li><h3>${D.price}のほかに費用はかかりません</h3><p>追加のご請求も、月々の費用もありません。ご負担は、お振込の手数料だけです。</p></li>
<li><h3>お支払いは、公開と納品のあとです</h3><p>途中でやめても、費用はいただきません。</p></li>
<li><h3>申請は、事業所様ご自身で</h3><p>申請書を作れるのは、事業所ご本人か行政書士です。書き方は、動画でご案内します。</p></li>
</ol>`;

const money = `<div class="hm-money">
<div class="hm-money-step"><p class="hm-when">${D.pay}まで</p><p class="hm-route">事業所様 ${arrow} タケノコ</p><p class="hm-amount">${D.price}をお支払い</p><p class="hm-money-note">公開と納品のあとに、お振込みいただきます。</p></div>
<div class="hm-money-step"><p class="hm-when">${D.report}まで</p><p class="hm-route">事業所様 ${arrow} 県</p><p class="hm-amount">県へ報告</p><p class="hm-money-note">領収書などを付けて出します。付ける物は、こちらでそろえます。</p></div>
<div class="hm-money-step hm-money-back"><p class="hm-when">${D.grant}まで</p><p class="hm-route">県 ${arrow} 事業所様</p><p class="hm-amount">補助金 ${D.price}</p><p class="hm-money-note">県から、事業所の口座に入ります。</p></div>
</div>
<ul class="hm-points">
<li>立て替えの期間は、1〜2か月です。</li>
<li>補助が決まらなかった時は、お支払いはありません。</li>
</ul>`;

const todo = `<div class="hm-todo"><p class="hm-todo-label">事業所様にしていただくことは、5つです。</p><ol><li>県へ申請する</li><li>注文書を書いて、お話を聞かせていただく</li><li>案を見て、直したい所を伝える</li><li>お支払い</li><li>県へ報告する</li></ol></div>
<p class="hm-legend">だれがするか：${who('事業所様', 'タケノコ', '県')}</p>`;

const before = [
  step('はじめに', 'お電話で、試作とこの案内を一緒に見ます', ['事業所様', 'タケノコ'], [
    '30分ほどです。事業所様の名前が入った試作を、スマホかパソコンで開いていただきます。開き方は、先にメールでお送りします。',
    'その日のうちに、メールで3つお送りします。見積書・制作内容のご説明・申請の手順の動画（約5分）。'
  ]),
  step(`${D.apply}まで`, '県へ申請します', ['事業所様'], [
    '県のホームページにある申請の表（エクセル）に入力して、同じ県のホームページから送ります。',
    '入力するのは、事業所の名前と住所、代表の方、補助金を受け取る口座、「ホームページの制作 30万円」など。動画のとおりに進められます。',
    '分からない所は、お電話ください。同じ画面を見ながらご案内します（入力はご本人にお願いします）。',
    '送ったら、「送りました」とお知らせください。'
  ]),
  step('12月ごろ', '県から、決定のお知らせが届きます', ['県'], [
    '申請が受け付けられてから、およそ30日です（県の案内）。',
    '待っている間、していただくことはありません。届いたら、お知らせください。'
  ])
];

const after = [
  step('決定が届いたら', 'ご注文（注文書を1枚）', ['事業所様'], [
    '注文書を1枚お送りします。事業所名とお名前を書いて、写真に撮って送り返してください。印鑑は要りません。',
    'ここからが、ご契約です。'
  ]),
  step('ご注文のあと', 'お話を伺います（お電話で1時間ほど）', ['事業所様', 'タケノコ'], [
    'ご注文から1週間以内に、日を決めてお電話します。',
    '伺うこと：時給、働ける曜日と時間、仕事の内容、資格が要るか、応募の受け方、働いている方の声。聞くことの一覧を、前の日までにお送りします。',
    '写真は、スマホで撮って送っていただくか、1回お伺いして撮ります。写る方には、載せてよいかを事業所様からお聞きください。'
  ]),
  step('お話のあと', '案をお見せします', ['タケノコ', '事業所様'], [
    'お話を伺ってから1週間以内に、ホームページとチラシの案をメールでお送りします。',
    '直したい所を、電話かメールでお伝えください。「ここの言い方を変えたい」で十分です。直しは2回までお受けします。'
  ]),
  step(`${D.due}まで`, 'ホームページを公開します', ['タケノコ', '事業所様'], [
    '誰でも見られるようにします。ホームページの住所は<span class="hm-nb">「事業所名.takenokonoko.com」</span>の形です。置いておく費用はかかりません。',
    '応募が届くかを、一緒に試します。入力欄から試しに送って事業所のメールに届くこと、電話のボタンでかかることを確かめます。',
    '今のホームページがある場合は、そこに「ヘルパー募集はこちら」の入口を足します。管理している会社さんへお願いする文は、こちらで用意します。'
  ]),
  step(`${D.due}まで`, 'チラシが届きます', ['タケノコ'], [
    `${D.prints}を、宅配で事業所へお届けします。`,
    'チラシの原稿もお渡しします。増し刷りに使えます。',
    '配る作業（ポストへの投函など）は含みません。'
  ]),
  step(`${D.pay}まで`, 'お支払い', ['事業所様'], [
    `納品書と請求書をお送りします。請求書に書いた口座へ、${D.price}をお振込みください。`,
    '入金を確かめた日に、領収書をお送りします。',
    `県の決まりで、${D.payLimit}までにお支払いが終わった分だけが補助の対象です。`
  ]),
  step(`${D.report}まで`, '県へ報告します', ['事業所様'], [
    '県の報告の表（エクセル）に入力して、県のホームページから送ります。手順の動画をお渡しします。',
    '一緒に送る物は、こちらでそろえてお渡しします。領収書の写し・納品書の写し・ホームページの画面の写し・チラシ。',
    '領収書などは、事業所で5年間とっておきます（県の決まり）。'
  ]),
  step(`${D.grant}まで`, '補助金が入ります', ['県'], [
    `申請の時に書いた事業所の口座に、県から${D.price}が入ります。`
  ]),
  step('そのあと', '公開のあと', ['タケノコ'], [
    'ホームページは、そのまま残ります。費用はかかりません。',
    '公開から3か月は、文字と写真の入れ替えを無料でお受けします（時給・曜日・電話番号など）。そのあとは、1回ごとにお見積りします。',
    '見られない・応募が届かないなどの不具合は、お知らせください。無料で直します。',
    '公開の1か月後に、応募があったかを伺います。'
  ])
];

const flow = (steps, from) => `<ol class="hm-flow" style="counter-reset:hmf ${from}">\n${steps.join('\n')}\n</ol>`;

const ifs = `<dl class="hm-if">
<div><dt>補助が決まらなかった時</dt><dd>作りません。費用はかかりません。</dd></div>
<div><dt>決定が遅れて、${D.payLimit}までに終わらないと分かった時</dt><dd>作る前にお伝えします。作らない場合、費用はかかりません。</dd></div>
<div><dt>途中でやめたくなった時</dt><dd>いつでもやめられます。費用はいただきません。決定のあとにやめる時は、県へ取り下げの届けが要ります（出し方は県の窓口へ）。</dd></div>
<div><dt>申請や報告で分からない時</dt><dd>タケノコへお電話ください。補助の決まりそのものは、県の窓口（地域福祉課 ${D.kenTel}）が答えます。</dd></div>
<div><dt>ホームページを、ほかへ移したくなった時</dt><dd>ホームページの中身（文章と写真）は、公開の時にまとめてお渡しします。ほかの会社の置き場へ移せます。</dd></div>
</dl>`;

const notes = `<ul class="hm-notes">
<li>申請書を作れるのは、事業所ご本人か行政書士です。タケノコは申請書を作りません。お渡しするのは、手順の動画・見積書・制作内容のご説明です。</li>
<li>タケノコは民間の事業者です。県の窓口や、県から頼まれた事業者ではありません。</li>
<li>補助は先着順で、予算に達すると受付が終わることがあります。交付が決まることをお約束するものではありません。</li>
<li>対象は、訪問介護・定期巡回・夜間対応型の事業所です。内容は、ヘルパーの募集と、利用者・ご家族への案内に限ります。</li>
<li>このページの日付と金額は、令和8年度の神奈川県の補助（横浜市・川崎市・相模原市・横須賀市を除く県内の事業所）の場合です。</li>
</ul>
<p class="hm-source"><a href="https://www.pref.kanagawa.jp/docs/n7j/houmonkaigo-hojo.html" target="_blank" rel="noopener noreferrer">神奈川県の案内（訪問介護等サービス提供体制確保支援事業費補助金）を見る</a></p>`;

const contact = `<section class="hm-contact"><div class="container"><div><p class="eyebrow">ご連絡先</p><h2>嶽ノ子（タケノコ）<br>代表　大嶽 耕太郎</h2><p class="hm-contact-note">お電話かメールでどうぞ。出られなかった時は、翌営業日までに折り返します。</p></div><div class="hm-contact-links"><a class="button button-primary" href="tel:${contacts.phone.replaceAll('-', '')}">電話 ${contacts.phone}</a><a class="button button-outline" href="mailto:${contacts.email}">${contacts.email}</a></div></div></section>`;

export const houmon = {
  file: 'houmon.html',
  title: 'ヘルパー募集のホームページとチラシ',
  eyebrow: '訪問介護の事業所の方へ',
  heading: '<span class="hm-nb">ヘルパー募集の</span><span class="hm-nb">ホームページとチラシを、</span><br>補助金で作ります。',
  description: '訪問介護の事業所向けの補助（神奈川県・1事業所30万円まで）が決まった時だけ作ります。補助が決まれば、ご負担は実質無料です（お振込の手数料を除く）。決まらなければ、費用はかかりません。',
  noindex: true,
  styles: ['assets/houmon.css'],
  bodyClass: 'hm-page',
  heroLink: '',
  body: index
    + section('hm-make', '01 / 作るもの', 'ホームページとチラシを、<br>ひとまとめで作ります。', make)
    + section('hm-promise', '02 / お約束', '先にお伝えしておくこと。', promise, true)
    + section('hm-money', '03 / お金の流れ', 'いったんお支払いいただき、<br>補助金で戻ります。', money)
    + section('hm-before', '04 / ご契約まで', '申請して、<br>県の決定を待ちます。', todo + flow(before, 0), true)
    + section('hm-after', '05 / ご契約のあと', '作って、公開して、<br>補助金が入るまで。', flow(after, before.length))
    + section('hm-if', '06 / もしもの時', 'こういう時は、こうします。', ifs, true)
    + section('hm-notes', '07 / ご確認いただきたいこと', 'ご確認いただきたいこと。', notes)
    + contact
};
