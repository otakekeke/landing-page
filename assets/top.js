// Top page interactions v2: reveal on scroll, interactive system map, case counter, video dialog.
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal blocks as they enter the viewport.
  const reveals = document.querySelectorAll('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-in'));
  }

  // System map: hovering, focusing or tapping a task lights the tasks it feeds.
  const map = document.querySelector('.system-map');
  const caption = document.querySelector('.map-caption');
  if (map && caption) {
    const nodes = [...map.querySelectorAll('.sm-node')];
    const lines = [...map.querySelectorAll('.sm-line')];
    const RELATED = { 0: [1, 4, 5, 6, 7], 1: [4, 6], 2: [4, 6], 3: [1, 4], 4: [], 5: [6], 6: [8], 7: [0], 8: [6] };
    const TEXT = [
      '利用者の情報は1か所に。ほかの画面は、ここを見ます。',
      '曜日ごとの利用者から、その日の名簿ができます。',
      'お休みを入れると、送迎表と記録に反映されます。',
      '振替を入れると、両方の日の人数と送迎表が変わります。',
      '名簿・お休み・振替から、その日の送迎表ができます。',
      '測った値が、その日の記録の欄に入ります。',
      'その日の記録をまとめて見られ、印刷もできます。',
      '申し送りはご利用者ごとに残り、翌日の担当が見られます。',
      '日々の記録から、月末の数字を出します。'
    ];
    const idle = '業務の名前を選ぶと、つながりが見えます。';
    caption.removeAttribute('aria-live');
    caption.textContent = idle;
    // Touch-friendly buttons under the map (shown on narrow screens by CSS).
    const chips = document.createElement('div');
    chips.className = 'map-chips';
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', '業務を選ぶ');
    nodes.forEach((n, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = n.textContent.trim(); b.setAttribute('aria-pressed', 'false'); chips.appendChild(b); });
    caption.after(chips);
    const chipBtns = [...chips.children];
    // Phone diagram: dots at the same positions as the named boxes (names live in the chips).
    const NS = 'http://www.w3.org/2000/svg';
    const dots = document.createElementNS(NS, 'svg');
    dots.setAttribute('class', 'system-dots'); dots.setAttribute('viewBox', '0 0 520 520'); dots.setAttribute('aria-hidden', 'true');
    const centres = nodes.map(n => { const r = n.querySelector('rect'); return [+r.getAttribute('x') + +r.getAttribute('width') / 2, +r.getAttribute('y') + +r.getAttribute('height') / 2]; });
    const dotLines = centres.map(([x, y]) => { const l = document.createElementNS(NS, 'line'); Object.entries({ x1: 260, y1: 260, x2: x, y2: y }).forEach(([k, v]) => l.setAttribute(k, v)); dots.appendChild(l); return l; });
    const dotCircles = centres.map(([x, y]) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 16); dots.appendChild(c); return c; });
    const core = document.createElementNS(NS, 'rect'); Object.entries({ x: 120, y: 205, width: 280, height: 110, rx: 24 }).forEach(([k, v]) => core.setAttribute(k, v)); dots.appendChild(core);
    [['施設専用の', 252], ['業務システム', 290]].forEach(([s, y]) => { const tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', 260); tx.setAttribute('y', y); tx.setAttribute('text-anchor', 'middle'); tx.textContent = s; dots.appendChild(tx); });
    map.after(dots);
    const light = (i, announce) => {
      const set = new Set([i, ...(RELATED[i] || [])]);
      nodes.forEach((n, k) => n.classList.toggle('is-lit', set.has(k)));
      lines.forEach((l, k) => l.classList.toggle('is-lit', set.has(k)));
      dotLines.forEach((l, k) => l.classList.toggle('is-lit', set.has(k)));
      dotCircles.forEach((c, k) => c.classList.toggle('is-lit', set.has(k)));
      chipBtns.forEach((c, k) => c.setAttribute('aria-pressed', String(k === i)));
      if (announce) caption.setAttribute('aria-live', 'polite');
      caption.textContent = TEXT[i];
    };
    const clear = () => { nodes.forEach(n => n.classList.remove('is-lit')); lines.forEach(l => l.classList.remove('is-lit')); dotLines.forEach(l => l.classList.remove('is-lit')); dotCircles.forEach(c => c.classList.remove('is-lit')); chipBtns.forEach(c => c.setAttribute('aria-pressed', 'false')); caption.textContent = idle; };
    let touched = false, timer = null;
    const stopTour = () => { touched = true; clearInterval(timer); };
    nodes.forEach((n, i) => {
      n.setAttribute('tabindex', '0');
      n.setAttribute('role', 'button');
      n.setAttribute('aria-label', n.textContent.trim() + '：' + TEXT[i]);
      const on = () => { stopTour(); light(i, true); };
      n.addEventListener('mouseenter', on);
      n.addEventListener('focus', on);
      n.addEventListener('click', on);
      n.addEventListener('mouseleave', clear);
      n.addEventListener('blur', clear);
    });
    chipBtns.forEach((c, i) => c.addEventListener('click', () => { stopTour(); light(i, true); }));
    // One gentle tour (four steps), then it stops by itself.
    if (!reduce && 'IntersectionObserver' in window) {
      const tour = [2, 3, 5, 0];
      let step = 0;
      const io = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting || touched) return;
        io.disconnect();
        timer = setInterval(() => {
          if (touched) return clearInterval(timer);
          if (step >= tour.length) { clearInterval(timer); clear(); return; }
          light(tour[step++], false);
        }, 2400);
      }, { threshold: .4 });
      io.observe(map);
    }
  }

  // Count the screens up once.
  const count = document.querySelector('.case-count b');
  if (count && !reduce && 'IntersectionObserver' in window) {
    const to = Number(count.textContent) || 14;
    count.textContent = '0';
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = now => { const p = Math.min(1, (now - t0) / 1100); count.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: .6 });
    io.observe(count);
  }

  // Showreel dialog.
  const dialog = document.querySelector('.video-dialog');
  if (dialog) {
    const video = dialog.querySelector('video');
    document.querySelectorAll('[data-open-video]').forEach(b => b.addEventListener('click', () => {
      if (typeof dialog.showModal === 'function') { dialog.showModal(); video.play().catch(() => {}); }
      else { window.location.href = video.currentSrc || video.getAttribute('src'); }
    }));
    const close = () => { video.pause(); dialog.close(); };
    dialog.querySelector('.video-close').addEventListener('click', close);
    dialog.addEventListener('click', e => { if (e.target === dialog) close(); });
    dialog.addEventListener('close', () => video.pause());
  }
})();

// Scroll story: six copies of the same note collapse into one system that feeds the same six places.
(() => {
  const story = document.querySelector('.story');
  if (!story) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LAYOUT = {
    wide: { W: 1200, H: 620, pw: 320, ph: 160, P: [[20, 70], [440, 40], [860, 80], [860, 380], [440, 410], [20, 380]], core: [600, 310, 300, 150] },
    narrow: { W: 600, H: 840, pw: 270, ph: 140, P: [[10, 20], [320, 60], [320, 340], [10, 380], [10, 660], [320, 690]], core: [300, 420, 270, 136], N: [[100, 120], [300, 70], [500, 120], [100, 720], [300, 770], [500, 720]] }
  };
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const back = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const T = [0, 1, 2, 3, 4, 5].map(i => .05 + i * .075);

  const makeScene = fit => {
    const canvas = fit.querySelector('.story-canvas');
    const svg = fit.querySelector('.st-svg');
    const papers = [...fit.querySelectorAll('.st-paper')];
    const hands = papers.map(p => p.querySelector('.st-hand'));
    const arrows = [...fit.querySelectorAll('.st-arrow')];
    const links = [...fit.querySelectorAll('.st-link')];
    const nodes = [...fit.querySelectorAll('.st-node')];
    const core = fit.querySelector('.st-core');
    let L = null;
    const centre = i => [L.P[i][0] + L.pw / 2, L.P[i][1] + L.ph / 2];
    const edge = (a, b) => {
      const [ax, ay] = centre(a), [bx, by] = centre(b);
      const dx = bx - ax, dy = by - ay, s = Math.min((L.pw / 2 + 10) / Math.abs(dx || 1e-6), (L.ph / 2 + 10) / Math.abs(dy || 1e-6));
      return [ax + dx * s, ay + dy * s];
    };
    // The still copy sits inside the caption column, whose width grows with its content; measure the heading box instead.
    const room = () => (fit.classList.contains('is-before') ? story.querySelector('.story-head') : fit.parentElement).clientWidth;
    const layout = heightShare => {
      const next = room() < 700 ? LAYOUT.narrow : LAYOUT.wide;
      if (next !== L) {
        L = next;
        canvas.style.width = L.W + 'px'; canvas.style.height = L.H + 'px';
        svg.setAttribute('viewBox', `0 0 ${L.W} ${L.H}`); svg.style.width = L.W + 'px'; svg.style.height = L.H + 'px';
        fit.classList.toggle('is-narrow', L === LAYOUT.narrow);
        story.classList.toggle('is-narrow', L === LAYOUT.narrow);
        papers.forEach((el, i) => Object.assign(el.style, { left: L.P[i][0] + 'px', top: L.P[i][1] + 'px', width: L.pw + 'px', height: L.ph + 'px' }));
        arrows.forEach((el, i) => {
          const [x1, y1] = edge(i, i + 1), [x2, y2] = edge(i + 1, i);
          el.setAttribute('d', `M ${x1} ${y1} Q ${(x1 + x2) / 2 + (y2 - y1) * .18} ${(y1 + y2) / 2 - (x2 - x1) * .18} ${x2} ${y2}`);
        });
        const [cx, cy, cw, ch] = L.core;
        Object.assign(core.style, { left: cx - cw / 2 + 'px', top: cy - ch / 2 + 'px', width: cw + 'px', height: ch + 'px' });
        const spot = i => (L.N ? L.N[i] : centre(i));
        links.forEach((el, i) => { const [x, y] = spot(i); el.setAttribute('d', `M ${cx} ${cy} L ${x} ${y}`); });
        nodes.forEach((el, i) => { const [x, y] = spot(i); el.style.left = x + 'px'; el.style.top = y + 'px'; });
      }
      const k = Math.min(1, room() / L.W, (window.innerHeight * heightShare) / L.H);
      canvas.style.transform = `scale(${k})`;
      fit.style.height = Math.round(L.H * k) + 'px';
      fit.style.width = Math.round(L.W * k) + 'px';
    };
    const render = p => {
      const c = ss(.5, .64, p);
      const [cx, cy] = L.core;
      papers.forEach((el, i) => {
        const a = ss(T[i], T[i] + .06, p), [x0, y0] = centre(i);
        el.style.opacity = String(a * (1 - c));
        el.style.transform = `translate(${(cx - x0) * c}px, ${(cy - y0) * c + (1 - a) * 40}px) rotate(calc(var(--r) + ${c * 24}deg)) scale(${1 - .8 * c})`;
        hands[i].style.clipPath = `inset(0 ${100 - 100 * ss(T[i] + .03, T[i] + .085, p)}% 0 0)`;
      });
      arrows.forEach((el, i) => {
        const t = T[i + 1], d = ss(t - .045, t, p);
        el.style.strokeDashoffset = String(1 - d);
        el.style.opacity = String(d > .02 && p < .5 ? 1 : 0);
      });
      const s = ss(.58, .7, p);
      core.style.transform = `scale(${s > 0 ? back(s) : 0})`;
      core.style.opacity = String(Math.min(1, s * 3));
      links.forEach((el, i) => { el.style.strokeDashoffset = String(1 - ss(.68 + i * .02, .74 + i * .02, p)); });
      nodes.forEach((el, i) => { const a = ss(.72 + i * .02, .78 + i * .02, p); el.style.opacity = String(a); el.style.transform = `translate(-50%, -50%) scale(${.6 + .4 * (a > 0 ? back(a) : 0)})`; });
    };
    return { layout, render };
  };

  const fit = story.querySelector('.story-fit');
  const scene = makeScene(fit);

  if (reduce) {
    // Still pictures: before (six copies) under the first caption, after (one system) under the second.
    const before = fit.cloneNode(true);
    before.classList.add('is-before');
    before.querySelector('.story-canvas').setAttribute('aria-hidden', 'true');
    before.querySelector('marker').id = 'st-ah-b';
    before.querySelectorAll('.st-arrow').forEach(a => a.setAttribute('marker-end', 'url(#st-ah-b)'));
    story.querySelector('.st-cap-a').after(before);
    story.querySelector('.story-captions').classList.add('is-static');
    const sBefore = makeScene(before);
    const draw = () => { sBefore.layout(1.2); sBefore.render(.48); scene.layout(1.2); scene.render(1); };
    draw();
    window.addEventListener('resize', draw);
    return;
  }

  story.classList.add('is-scrolly');
  scene.layout(.6);
  const capA = story.querySelector('.st-cap-a'), capB = story.querySelector('.st-cap-b');
  const count = story.querySelector('.st-count'), countN = count.querySelector('b');
  const bar = story.querySelector('.st-progress');
  let ticking = false, active = true;
  const render = () => {
    ticking = false;
    const r = story.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
    scene.render(p);
    countN.textContent = String(Math.max(1, T.filter(t => p >= t + .05).length));
    count.style.opacity = String(ss(.04, .08, p) * (1 - ss(.46, .52, p)));
    capA.style.opacity = String(1 - ss(.52, .6, p));
    capA.style.transform = `translateY(${-20 * ss(.52, .6, p)}px)`;
    capB.style.opacity = String(ss(.58, .66, p));
    capB.style.transform = `translateY(${20 * (1 - ss(.58, .66, p))}px)`;
    bar.style.transform = `scaleX(${p})`;
  };
  const onScroll = () => { if (active && !ticking) { ticking = true; requestAnimationFrame(render); } };
  new IntersectionObserver(([e]) => { active = e.isIntersecting; if (active) onScroll(); }, { rootMargin: '120px 0px' }).observe(story);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { scene.layout(.6); onScroll(); });
  render();
})();

// The day as a time line: a mark per scene on the line, the line fills as you read.
(() => {
  const list = document.querySelector('.day-scenes');
  if (!list) return;
  const scenes = [...list.querySelectorAll('.scene')];
  scenes.forEach(s => {
    const time = s.querySelector('.scene-time');
    if (!time) return;
    const mark = document.createElement('span');
    mark.className = 'scene-mark';
    mark.setAttribute('aria-hidden', 'true');
    mark.innerHTML = '<i></i><b></b>';
    mark.querySelector('b').textContent = time.textContent;
    s.prepend(mark);
  });
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { list.style.setProperty('--fill', 1); scenes.forEach(s => s.classList.add('is-past')); return; }
  let ticking = false, active = false;
  const update = () => {
    ticking = false;
    const r = list.getBoundingClientRect(), line = window.innerHeight * .55;
    const f = Math.min(1, Math.max(0, (line - r.top) / r.height));
    list.style.setProperty('--fill', f.toFixed(4));
    scenes.forEach(s => s.classList.toggle('is-past', s.getBoundingClientRect().top < line));
  };
  const on = () => { if (active && !ticking) { ticking = true; requestAnimationFrame(update); } };
  new IntersectionObserver(([e]) => { active = e.isIntersecting; on(); }, { rootMargin: '200px 0px' }).observe(list);
  window.addEventListener('scroll', on, { passive: true });
  update();
})();
