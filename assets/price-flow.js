(() => {
  'use strict';

  const root = document.querySelector('.price-flow');
  if (!root) return;

  // Draw each panel once it scrolls into view. Without JS, or with reduced motion,
  // the finished drawing is shown as-is.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panels = root.querySelectorAll('.pf-panel');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    root.classList.add('pf-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-drawn');
        observer.unobserve(entry.target);
      });
    }, {threshold: 0.35});
    panels.forEach(panel => observer.observe(panel));
  }

  // "What if nothing got shorter?" lets the reader check the zero case themselves.
  const toggle = root.querySelector('.pf-toggle');
  const compare = root.querySelector('.pf-compare');
  const live = root.querySelector('.pf-live');
  if (!toggle || !compare) return;
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const noDiff = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(noDiff));
    compare.classList.add('pf-settled');
    compare.classList.toggle('is-nodiff', noDiff);
    toggle.textContent = noDiff ? '差があった場合に戻す' : '差がなかったら？';
    if (live) {
      live.textContent = noDiff
        ? '使う前と後の作業時間が同じなら、差は0分、料金は0円です。'
        : '使う前と後の差は1回2分。月40回で月80分、月額5,116円です。';
    }
  });
})();
