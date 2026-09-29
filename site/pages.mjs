import {section, cards, pricePanel, initialTable, cta, formula} from './shared.mjs';
import {terms, privacy} from './policies.mjs';

// Audience pages merged into the top page on 2026-09-27. Old URLs redirect so shared links keep working.
export const moved = [
  {file:'manager.html', title:'管理者の方へ', to:'index.html#examples'},
  {file:'staff.html', title:'現場職員の方へ', to:'index.html#examples'},
  {file:'dayservice.html', title:'デイサービスの方へ', to:'index.html#examples'},
  {file:'small-facility.html', title:'小規模事業所の方へ', to:'index.html#examples'},
  // Services not offered for now (decided 2026-09-27). Pages removed; old URLs go to the top page.
  {file:'business-improvement.html', title:'業務改善支援', to:'index.html'},
  {file:'subsidy-app.html', title:'補助金をご検討の方へ', to:'index.html'},
  {file:'conflict-of-interest.html', title:'利益相反管理規程', to:'index.html'}
];

export const pages = [
  {
    file:'sample-app.html', title:'契約前のデモについて', eyebrow:'',
    heading:'契約の前に、<br>自分の業務でデモを試せます。',
    description:'デモでは、使いやすさと仕事の流れ、削減時間の見込みを確認します。',
    body:section('01 / デモで確かめること','確かめるのは、この3つです。',cards([
      ['使う人が扱えるか','入力の順番、用語、文字、必要な確認。日々使う人と、一連の流れを試します。'],
      ['どの作業が減るか','今の手順と試作を並べて、転記や集計の時間から、新しく増える入力や確認の時間を引いて考えます。'],
      ['どこまで作るか','対象の業務、画面、帳票、連携、保守の範囲と、含まれないことを決めます。']
    ]))+section('02 / 無料の範囲','契約するか決めるまでは、<br>費用はかかりません。',`<ol class="sub-steps"><li><h3>いつもの帳票を見る</h3><p>資料づくりは要りません。利用者さまの情報が載っている部分は、伏せたままで構いません。</p></li><li><h3>試作を触って確認する</h3><p>合意した一つのテーマでデモを作ります。無料の段階で、完成品まで作るものではありません。</p></li><li><h3>費用と範囲を確認する</h3><p>削減時間と料金の見込み、作る範囲、実費、作業時間の整理のしかた、見直しの時期をお伝えします。月額は、使った後にもう一度伺って一緒に整理した時間で決まります。契約しないという判断もできます。</p></li></ol><p class="sub-note">デモは検討のためのものです。本番のデータ移行、セキュリティの設定、受け入れの確認を終えるまで、本番の業務では使いません。</p>`,true)+pricePanel()+cta
  },
  {
    file:'company.html', title:'事業者情報', eyebrow:'',
    heading:'タケノコについて',
    description:'タケノコ（屋号：嶽ノ子）は、神奈川県相模原市を拠点に、介護現場向け業務アプリの設計・開発・運用支援を行う個人事業です。',
    body:section('01 / 大切にしていること','今の運用を見るところから始めます。',`<div class="reading"><p>介護の現場には、言葉にしにくい判断や、帳票の中に残る工夫があります。まず実物と仕事の流れを見せていただき、その現場で続けられる形を考えます。</p><p>代表は介護の現場で働いた経験があり、相談から設計・制作・運用支援まで一人で担当します。新しい道具が、別の負担にならないことを大切にしています。</p><p>作業時間だけでなく、ミスや確認の手間、特定の人に仕事が集まることも減らすことを目指します。料金は相手によって変えず、すべてのお客さまに同じ式で決めます。</p></div>`)+section('02 / 事業者概要','運営者',`<dl class="sub-definitions"><div><dt>サービス名・屋号</dt><dd>タケノコ ／ 嶽ノ子（たけのこ）</dd></div><div><dt>代表者</dt><dd>大嶽 耕太郎</dd></div><div><dt>事業形態・設立日</dt><dd>個人事業 ／ 2025年4月19日</dd></div><div><dt>所在地</dt><dd>神奈川県相模原市中央区千代田7-10-7</dd></div><div><dt>事業内容</dt><dd>介護事業所向け業務アプリの設計・制作・導入・運用支援</dd></div><div><dt>請求・支払</dt><dd>請求書を発行します。適格請求書発行事業者（インボイス）の登録はしていません。銀行振込／Stripe決済（契約で合意した方法）。</dd></div><div><dt>秘密保持</dt><dd>秘密保持契約に対応します。</dd></div><div><dt>連絡先</dt><dd><a href="mailto:kotaro.otake@takenokonoko.com">kotaro.otake@takenokonoko.com</a><br><a href="tel:07013834420">070-1383-4420</a></dd></div><div><dt>受付時間</dt><dd>平日・土曜 9:00〜18:00（日本時間）。対応中は折り返しになる場合があります。</dd></div></dl>`,true)+section('03 / 情報の取り扱い','データの扱いは、案件ごとに先に決めます。',`<div class="reading"><p>保存先・所有者・アクセス権限・バックアップ・契約終了時のデータの返し方を、案件ごとに確認します。相談とデモは、利用者さまの情報を伏せたまま進めます。</p><p>IPAのSECURITY ACTION 一つ星を自己宣言しています（自己宣言ID：50000228580）。第三者による認証や、安全性の保証ではありません。</p><p><a href="privacy.html">個人情報保護方針</a> ／ <a href="terms.html">利用規約・事業継続時の取り決め</a></p></div>`)+cta
  },
  {file:'terms.html',title:'利用規約',eyebrow:'',heading:'利用規約',description:'タケノコの業務アプリに関する料金・支払・運用支援・データ・契約条件と個人情報取扱い契約。',policy:true,body:terms(initialTable())},
  {file:'privacy.html',title:'個人情報保護方針',eyebrow:'',heading:'個人情報保護方針',description:'タケノコの個人情報の取得・利用・委託・安全管理措置・問い合わせ窓口について。',policy:true,body:privacy}
];
