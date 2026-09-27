export const pricing = Object.freeze({
  updated: '2026-09-19', referenceHourlyRate: 2000, multiplier: 3,
  initialFeeMonths: 3, additionalFeeMonths: 3
});
export const money = n => n.toLocaleString('ja-JP');
export const formula = `月間削減時間 × ${money(pricing.referenceHourlyRate)}円 × ${pricing.multiplier}`;
export const rate = pricing.referenceHourlyRate * pricing.multiplier;
export const initialFormula = `初期費用 ＝ 確定した月額 × ${pricing.initialFeeMonths}か月分（税込）`;
export const additionalFormula = `追加開発費 ＝ 月額の増加分 × ${pricing.additionalFeeMonths}か月分（税込）`;
export const additionalFee = (before, after) => Math.max(0, after - before) * pricing.additionalFeeMonths;
export const contacts = { email:'kotaro.otake@takenokonoko.com', phone:'070-1383-4420' };
export const links = [
  ['manager.html','管理者の方へ'], ['staff.html','現場職員の方へ'],
  ['dayservice.html','デイサービスの方へ'], ['small-facility.html','小規模事業所の方へ'],
  ['sample-app.html','契約前のデモについて'], ['business-improvement.html','業務改善支援'],
  ['subsidy-app.html','補助金をご検討の方へ'], ['company.html','事業者情報'],
  ['privacy.html','個人情報保護方針'], ['terms.html','利用規約'],
  ['conflict-of-interest.html','利益相反管理規程']
];
export function header(home = false) {
  const top = home ? '#top' : 'index.html';
  const base = home ? '' : 'index.html';
  return `<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${top}" aria-label="タケノコ トップへ"><img src="assets/favicon.svg" width="36" height="36" alt=""><span>タケノコ<small>TAKENOKO</small></span></a>
    <button class="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false" hidden><span>メニュー</span><span class="menu-lines" aria-hidden="true"></span></button>
    <nav class="main-nav" id="main-nav" aria-label="メインナビゲーション">
      <a href="${base}#value">できること</a><a href="${base}#examples">活用イメージ</a>
      <a href="${base}#price">料金</a><a href="${base}#faq">よくある質問</a>
      <a class="nav-contact" href="${base}#contact">相談する <span aria-hidden="true">↗</span></a>
    </nav>
  </div>
</header>`;
}
export function footer(home = false) {
  return `<footer class="site-footer"><div class="container">
  <div class="footer-top"><div><a class="brand" href="${home ? '#top' : 'index.html'}" aria-label="タケノコ トップへ"><img src="assets/favicon.svg" width="36" height="36" alt=""><span>タケノコ<small>TAKENOKO</small></span></a><p class="footer-tagline">介護現場の業務アプリ制作と運用支援</p></div>
    <nav class="footer-nav" aria-label="フッターナビゲーション">${links.map(([href,label])=>`<a href="${href}">${label}</a>`).join('\n')}</nav></div>
  <div class="footer-bottom"><div class="security-declaration"><img src="assets/security-action/security_action_hitotsuboshi-small_color.png" width="48" height="48" alt="SECURITY ACTION 一つ星"><p>SECURITY ACTION 一つ星を自己宣言しています。<small>自己宣言ID：50000228580 ／ 認証・認定ではありません。</small></p></div><small>© 2026 タケノコ（屋号：嶽ノ子）</small></div>
  <p class="footer-scope">提供するのは、業務アプリの制作・利用・運用支援、助言・教育・データ整備です。申請書類の作成・提出代行、税務・法律上の判断は行いません。効果は業務・運用によって異なり、ミスの完全な防止や残業の解消、補助金の採択は保証しません。</p>
</div></footer>`;
}
export const cta = `<section class="sub-cta"><div class="container"><div><p class="eyebrow">お問い合わせ</p><h2>相談を受け付けています。</h2><p>今の業務を見ながら、困っていることを伺います。相談と契約前のデモに費用はかかりません。</p></div><a class="button button-primary" href="index.html#contact">相談する <span aria-hidden="true">↗</span></a></div></section>`;
export function section(kicker, title, body, tint = false) {
  return `<section class="section sub-section${tint ? ' sub-tint' : ''}"><div class="container"><div class="section-heading"><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${body}</div></section>`;
}
export function cards(items) {
  return `<div class="sub-grid">${items.map(([title,body],i)=>`<article class="sub-card"><span class="sub-number">0${i+1}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div>`;
}
export const initialTable = () => `<p class="policy-formula">${initialFormula}</p><div class="table-scroll" role="region" aria-label="月額と初期費用の例。横にスクロールできます" tabindex="0"><table><caption>料金例（税込・紹介割引適用前）</caption><thead><tr><th scope="col">月間削減時間</th><th scope="col">確定した月額</th><th scope="col">初期費用（初回のみ）</th></tr></thead><tbody>${[0,1,5,10].map(hours=>`<tr><th scope="row">${hours}時間</th><td class="money">${money(hours*rate)}円</td><td class="money">${money(hours*rate*pricing.initialFeeMonths)}円</td></tr>`).join('')}</tbody></table></div>`;
export function pricePanel() {
  return section('料金', '料金は、<br>減った作業時間で決まります。', `<div class="reading"><p>月額は「${formula}」（税込）で、すべてのお客さまに同じ式です。初期費用は月額の3か月分です。使う前と後の作業時間を比べて金額が決まってから請求し、短くならなければ0円です。</p><a class="text-link" href="index.html#price">金額の決まり方を見る <span aria-hidden="true">→</span></a></div>`,true);
}
