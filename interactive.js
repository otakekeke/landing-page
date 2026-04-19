/* ============================================================
   嶽ノ子 — Interactive Layer JS
   ============================================================ */
(function() {
  'use strict';

  // ===== HERO parallax =====
  const heroTile = document.querySelector('.tile-hero');
  if (heroTile) {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const p = Math.min(y * 0.4, 300);
        const scale = 1 + Math.min(y / 2400, 0.25);
        heroTile.style.setProperty('--hero-parallax', p + 'px');
        heroTile.style.setProperty('--hero-scale', scale);
        ticking = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ===== BEFORE/AFTER Slider =====
  const baStage = document.querySelector('.ix-ba-stage');
  if (baStage) {
    const handle = baStage.querySelector('.ix-ba-handle');
    const after = baStage.querySelector('.ix-ba-after');
    const knob = baStage.querySelector('.ix-ba-handle-knob');
    const beforeN = baStage.querySelector('.ix-ba-before .ix-ba-time .n');
    const afterN = baStage.querySelector('.ix-ba-after .ix-ba-time .n');

    let split = 50;

    function setSplit(pct) {
      split = Math.max(0, Math.min(100, pct));
      baStage.style.setProperty('--split', split + '%');
      handle.style.left = split + '%';
    }

    function onPointerMove(e) {
      const rect = baStage.getBoundingClientRect();
      const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
      setSplit((x / rect.width) * 100);
    }

    let dragging = false;
    function startDrag(e) {
      dragging = true;
      onPointerMove(e);
      document.body.style.userSelect = 'none';
    }
    function stopDrag() {
      dragging = false;
      document.body.style.userSelect = '';
    }
    function moveDrag(e) {
      if (!dragging) return;
      e.preventDefault();
      onPointerMove(e);
    }

    baStage.addEventListener('mousedown', startDrag);
    baStage.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);

    // Auto-demo slider motion when scrolled into view
    const baIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          // Animate from 85% -> 15% -> 50%
          let step = 0;
          const frames = [85, 15, 50];
          function tick() {
            if (dragging || step >= frames.length) return;
            const target = frames[step++];
            const start = split;
            const dur = 1100;
            const startT = performance.now();
            function anim(t) {
              if (dragging) return;
              const p = Math.min(1, (t - startT) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setSplit(start + (target - start) * eased);
              if (p < 1) requestAnimationFrame(anim);
              else setTimeout(tick, 400);
            }
            requestAnimationFrame(anim);
          }
          tick();
          baIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    baIO.observe(baStage);
  }

  // ===== BUSINESS APP Picker =====
  const appsStage = document.querySelector('.ix-apps-stage');
  if (appsStage) {
    const btns = appsStage.querySelectorAll('.ix-app-btn');
    const views = appsStage.querySelectorAll('.ix-app-view');
    const dockDots = appsStage.querySelectorAll('.ix-phone-dock .dot');

    function setActive(idx) {
      btns.forEach((b, i) => b.classList.toggle('active', i === idx));
      views.forEach((v, i) => v.classList.toggle('active', i === idx));
      // Dock dot maps to row (4 rows of 3 btns)
      const dockIdx = Math.min(dockDots.length - 1, Math.floor(idx / 3));
      dockDots.forEach((d, i) => d.classList.toggle('active', i === dockIdx));
    }

    btns.forEach((b, i) => b.addEventListener('click', () => setActive(i)));
    setActive(0);

    // Auto-cycle when in view
    let cycleInterval = null;
    let userInteracted = false;
    btns.forEach(b => b.addEventListener('click', () => {
      userInteracted = true;
      if (cycleInterval) { clearInterval(cycleInterval); cycleInterval = null; }
    }));

    const appsIO = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !userInteracted && !cycleInterval) {
          let idx = 0;
          cycleInterval = setInterval(() => {
            if (userInteracted) { clearInterval(cycleInterval); return; }
            idx = (idx + 1) % btns.length;
            setActive(idx);
          }, 2800);
        } else if (!e.isIntersecting && cycleInterval) {
          clearInterval(cycleInterval);
          cycleInterval = null;
        }
      });
    }, { threshold: 0.2 });
    appsIO.observe(appsStage);
  }

  // ===== FLOW Scroll-pinned =====
  const flowOuter = document.querySelector('.ix-flow-outer');
  if (flowOuter) {
    const steps = flowOuter.querySelectorAll('.ix-flow-step');
    const scenes = flowOuter.querySelectorAll('.ix-flow-scene');
    const progressEl = flowOuter.querySelector('.ix-flow-progress');

    function updateFlow() {
      const rect = flowOuter.getBoundingClientRect();
      const h = flowOuter.offsetHeight - window.innerHeight;
      let p = (-rect.top) / h;
      p = Math.max(0, Math.min(1, p));

      // Divide into 3 equal segments
      let idx;
      if (p < 0.33) idx = 0;
      else if (p < 0.66) idx = 1;
      else idx = 2;

      steps.forEach((s, i) => s.classList.toggle('active', i === idx));
      scenes.forEach((s, i) => s.classList.toggle('active', i === idx));

      const pct = Math.min(100, p * 100 + 10);
      progressEl.style.setProperty('--flow-progress', pct + '%');
    }

    window.addEventListener('scroll', updateFlow, { passive: true });
    window.addEventListener('resize', updateFlow);
    updateFlow();
  }

  // ===== PRICING SIMULATOR =====
  const sim = document.querySelector('.ix-sim');
  if (sim) {
    const featSlider = sim.querySelector('#simFeatures');
    const siteSlider = sim.querySelector('#simSites');
    const featVal = sim.querySelector('#simFeaturesVal');
    const siteVal = sim.querySelector('#simSitesVal');
    const initEl = sim.querySelector('#simInit');
    const monEl = sim.querySelector('#simMon');
    const brkList = sim.querySelector('#simBreakdown');
    const planTag = sim.querySelector('#simPlanTag');
    const featureLabel = sim.querySelector('#simFeatureLabel');
    const planIndicator = sim.querySelector('.ix-plan-indicator');
    const planCodeEl = sim.querySelector('#simPlanCode');
    const planNameEl = sim.querySelector('#simPlanName');
    const planDescEl = sim.querySelector('#simPlanDesc');

    function format(n) {
      return '¥' + n.toLocaleString('en-US');
    }

    function flash(el) {
      el.classList.remove('flash');
      void el.offsetWidth;
      el.classList.add('flash');
    }

    function setPlanVisual(plan) {
      if (!planIndicator) return;
      planIndicator.dataset.plan = plan;
      // Apply styles directly — some preview environments defeat attribute-based CSS switching
      if (plan === 'single') {
        planIndicator.style.background = '#EDE4D1';
        planIndicator.style.borderColor = 'rgba(180, 100, 50, 0.18)';
        planIndicator.style.color = '#1A1614';
        planCodeEl.textContent = 'PLAN 01';
        planNameEl.textContent = '単一ツール';
        planDescEl.textContent = 'ひとつの業務から、小さく始めて効果を確認。必要になったら統合へ育てられます。';
      } else {
        planIndicator.style.background = '#1A1614';
        planIndicator.style.borderColor = 'transparent';
        planIndicator.style.color = '#F5EFE3';
        planCodeEl.textContent = 'PLAN 02';
        planNameEl.textContent = '統合アプリ';
        planDescEl.textContent = '2つ以上の業務を、1つのアプリで横断管理。データが繋がり、重複入力が消える。';
      }
      // Toggle visual opacity directly
      const single = planIndicator.querySelector('.plan-viz-single');
      const integrated = planIndicator.querySelector('.plan-viz-integrated');
      if (single && integrated) {
        single.style.opacity = plan === 'single' ? '1' : '0';
        single.style.transform = plan === 'single' ? 'scale(1)' : 'scale(0.88)';
        integrated.style.opacity = plan === 'integrated' ? '1' : '0';
        integrated.style.transform = plan === 'integrated' ? 'scale(1)' : 'scale(0.88)';
      }
      // plan-ind-name color
      if (plan === 'integrated' && planNameEl) planNameEl.style.color = '#D97862';
      else if (planNameEl) planNameEl.style.color = '';
    }

    function recompute() {
      const feats = parseInt(featSlider.value, 10);
      const sites = parseInt(siteSlider.value, 10);
      featVal.textContent = feats;
      siteVal.textContent = sites;

      // AUTO-SWITCH PLAN from feature count
      const plan = feats === 1 ? 'single' : 'integrated';
      setPlanVisual(plan);

      const breakdown = [];
      let init = 0, mon = 0;

      if (plan === 'single') {
        init = 100000;
        mon = 25000;
        breakdown.push(['単一業務ツール ベース', 100000, 25000]);

        // Sites: pattern ① single expansion
        if (sites > 1) {
          const extra = sites - 1;
          init += extra * 50000;
          mon += extra * 10000;
          breakdown.push([`他施設展開 × ${extra}`, extra * 50000, extra * 10000]);
        }

        featureLabel.textContent = '業務数';
        if (planTag) planTag.textContent = 'PLAN 01 / 単一ツール';
      } else {
        init = 800000;
        mon = 88000;
        breakdown.push(['統合アプリ ベース（機能3つまで）', 800000, 88000]);

        // Features beyond 3 = add-on per feature
        if (feats > 3) {
          const extra = feats - 3;
          init += extra * 200000;
          mon += extra * 30000;
          breakdown.push([`追加業務機能 × ${extra}`, extra * 200000, extra * 30000]);
        }

        // Sites: pattern ② shared expansion
        if (sites > 1) {
          const extra = sites - 1;
          init += extra * 150000;
          mon += extra * 50000;
          breakdown.push([`他施設展開 × ${extra}`, extra * 150000, extra * 50000]);
        }

        featureLabel.textContent = '業務機能数';
        if (planTag) planTag.textContent = 'PLAN 02 / 統合アプリ';
      }

      initEl.innerHTML = format(init) + '<small>税込</small>';
      monEl.innerHTML = format(mon) + '<small>税込/月</small>';
      flash(initEl);
      flash(monEl);

      brkList.innerHTML = breakdown.map(([k, i, m]) =>
        `<div class="row"><span>${k}</span><span class="amt">+${format(i)} / ${format(m)}/月</span></div>`
      ).join('');
    }

    featSlider.addEventListener('input', recompute);
    siteSlider.addEventListener('input', recompute);
    recompute();
  }

  // ===== COUNT UP =====
  function animateNumber(el, to, dur = 1400, suffix = '') {
    const from = 0;
    const startT = performance.now();
    const isFloat = !Number.isInteger(to);
    // If an explicit minus sign precedes the element, output positive numbers
    const prevTxt = (el.previousSibling && el.previousSibling.textContent) || '';
    const hasPrecedingMinus = /[-−]\s*$/.test(prevTxt);
    const absMode = hasPrecedingMinus && to < 0;
    function tick(t) {
      const p = Math.min(1, (t - startT) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      let v = from + (to - from) * eased;
      if (absMode) v = Math.abs(v);
      el.textContent = (isFloat ? v.toFixed(1) : Math.round(v)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const countEls = document.querySelectorAll('[data-count]');
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const to = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        animateNumber(el, to, 1400, suffix);
        countIO.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  countEls.forEach(el => countIO.observe(el));

  // ===== DONUTS =====
  const donuts = document.querySelectorAll('.ix-case-donut');
  const donutIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('drawn');
        donutIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  donuts.forEach(d => donutIO.observe(d));

  // ===== BEFORE/AFTER time count-up (bidirectional on scroll) =====
  // Already handled by [data-count] if we mark them
})();
