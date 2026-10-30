export const contacts = { email:'kotaro.otake@takenokonoko.com', phone:'070-1383-4420' };
export const links = [
  ['sample-app.html','契約前のデモについて'], ['company.html','事業者情報'],
  ['privacy.html','個人情報保護方針'], ['terms.html','利用規約']
];
export function header(home = false) {
  const top = home ? '#top' : 'index.html';
  const base = home ? '' : 'index.html';
  return `<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="${top}" aria-label="タケノコ トップへ"><img src="assets/favicon.svg" width="36" height="36" alt=""><span>タケノコ<small>TAKENOKO</small></span></a>
    <button class="menu-toggle" type="button" aria-controls="main-nav" aria-expanded="false" hidden><span>メニュー</span><span class="menu-lines" aria-hidden="true"></span></button>
    <nav class="main-nav" id="main-nav" aria-label="メインナビゲーション">
      <a href="${base}#difference">理由</a><a href="${base}#case">実例</a>
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
  <div class="footer-bottom"><small>© 2026 タケノコ（屋号：嶽ノ子）</small></div>
</div></footer>`;
}
export const cta = `<section class="sub-cta"><div class="container"><div><p class="eyebrow">お問い合わせ</p><h2>相談を受け付けています。</h2><p>今の画面と紙を見ながら、使いにくい所を伺います。相談と契約前のデモに費用はかかりません。</p></div><a class="button button-primary" href="index.html#contact">相談する <span aria-hidden="true">↗</span></a></div></section>`;
export function section(kicker, title, body, tint = false) {
  return `<section class="section sub-section${tint ? ' sub-tint' : ''}"><div class="container"><div class="section-heading"><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${body}</div></section>`;
}
export function cards(items) {
  return `<div class="sub-grid">${items.map(([title,body],i)=>`<article class="sub-card"><span class="sub-number">0${i+1}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div>`;
}
export function pricePanel() {
  return section('料金', '料金は、<br>お話を聞いてからお伝えします。', `<div class="reading"><p>作るものは、施設ごとに違います。使いにくい所と今の運用を伺ってから、その施設の額をお伝えします。お話を聞くことと、試作を見ていただくところまでは無料です。</p><a class="text-link" href="index.html#price">料金について見る <span aria-hidden="true">→</span></a></div>`,true);
}

