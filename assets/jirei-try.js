// 押して確かめる（リハビリアスレチックの事例）。2026-11-19
// 表の中身（名前・行）は、ページを作る時に site/jirei.mjs が全部書き出しておく。ここでは、見せる・隠す・線を引く・印を付けるだけ。
// 動きは本物のアプリと同じ：
//   お休み（上野 和子）……バイタル表と実施記録で名前に線。送迎表の名前の候補から外れる。
//   振替（大川 幸子）……バイタル表と送迎表の候補に（振替）付きで並ぶ。実施記録にはふつうの行で並ぶ。
//   申し送りの印（石田 正）……実施記録の印を付けた行が、申し送りの画面に並ぶ。
// 押した物はこのページの中だけで変わり、どこにも送らない・残さない。
(() => {
  const SAY = {
    off: {
      on: {status:'お休みカレンダーに一度入れただけで、バイタル表・実施記録・送迎表が変わりました。',
        notes:{vitals:'上野 和子さんの名前に線', record:'上野 和子さんの名前に線', route:'上野 和子さんが候補から外れた'}},
      undo: {status:'お休みを取り消すと、三つの表とも元に戻ります。',
        notes:{vitals:'上野 和子さんの線が消えた', record:'上野 和子さんの線が消えた', route:'上野 和子さんが候補に戻った'}}
    },
    furikae: {
      on: {status:'振替・臨時に一度入れただけで、バイタル表・実施記録・送迎表に大川 幸子さんが並びました。',
        notes:{vitals:'大川 幸子さんが（振替）で並んだ', record:'大川 幸子さんの行ができた', route:'大川 幸子さんが（振替）で候補に出た'}},
      undo: {status:'振替を取り消すと、三つの表とも元に戻ります。',
        notes:{vitals:'大川 幸子さんの行が消えた', record:'大川 幸子さんの行が消えた', route:'大川 幸子さんが候補から消えた'}}
    },
    mark: {
      on: {status:'実施記録で印を付けると、申し送りの画面に並びました。書き写す手間がありません。',
        notes:{record:'石田 正さんの行に印を付けた', handover:'石田 正さんの行が並んだ'}},
      undo: {status:'印を外すと、申し送りの画面からも消えます。',
        notes:{record:'石田 正さんの行の印を外した', handover:'石田 正さんの行が消えた'}}
    }
  };
  // 入れた所（実施記録の印）は「変わりました」ではなく「入れた所」の札にする
  const ENTERED = {mark:'record'};
  // どの操作で、どの表のどの行が動くか
  const ROWS = {off:{vitals:'ueno', record:'ueno', route:'ueno'}, furikae:{vitals:'okawa', record:'okawa', route:'okawa'}, mark:{record:'ishida', handover:'ishida'}};

  function init(root) {
    const state = {off:false, furikae:false, mark:false};
    const panel = id => root.querySelector(`[data-panel="${id}"]`);
    const rows = (id, row) => panel(id).querySelectorAll(`[data-row="${row}"]`);
    const status = root.querySelector('.jr-try-status');
    const first = status.textContent;

    function apply() {
      for (const id of ['vitals', 'record']) rows(id, 'ueno').forEach(el => {
        el.classList.toggle('jr-off', state.off);
        el.querySelector('.jr-offtxt').hidden = !state.off;
      });
      rows('route', 'ueno').forEach(el => { el.hidden = state.off; });
      for (const id of ['vitals', 'record', 'route']) rows(id, 'okawa').forEach(el => { el.hidden = !state.furikae; });
      rows('record', 'ishida').forEach(el => {
        const box = el.querySelector('.jr-box');
        box.classList.toggle('on', state.mark);
        box.setAttribute('aria-label', state.mark ? '申し送りの印あり' : '申し送りの印なし');
      });
      rows('handover', 'ishida').forEach(el => { el.hidden = !state.mark; });
      rows('handover', 'empty').forEach(el => { el.hidden = state.mark; });
      root.querySelectorAll('.jr-act').forEach(b => b.setAttribute('aria-pressed', String(state[b.dataset.act])));
    }

    function clearMarks() {
      root.querySelectorAll('.jr-changed').forEach(el => el.classList.remove('jr-changed'));
      root.querySelectorAll('.jr-tp').forEach(p => {
        p.classList.remove('jr-hit');
        p.querySelector('.jr-tp-badge').hidden = true;
        p.querySelector('.jr-tp-note').textContent = '';
      });
    }

    function show(act) {
      const say = SAY[act][state[act] ? 'on' : 'undo'];
      for (const [id, note] of Object.entries(say.notes)) {
        const p = panel(id);
        p.classList.add('jr-hit');
        const badge = p.querySelector('.jr-tp-badge');
        badge.textContent = ENTERED[act] === id ? '入れた所' : '変わりました';
        badge.hidden = false;
        p.querySelector('.jr-tp-note').textContent = note;
        const row = ROWS[act][id];
        if (row) rows(id, row).forEach(el => { if (!el.hidden) { void el.offsetWidth; el.classList.add('jr-changed'); } });
      }
      status.textContent = say.status;
    }

    root.querySelectorAll('.jr-act').forEach(b => b.addEventListener('click', () => {
      const act = b.dataset.act;
      state[act] = !state[act];
      clearMarks();
      apply();
      show(act);
    }));
    root.querySelector('.jr-reset').addEventListener('click', () => {
      for (const k of Object.keys(state)) state[k] = false;
      clearMarks();
      apply();
      status.textContent = '最初の形に戻しました。' + first;
    });
    apply();
  }

  const start = () => document.querySelectorAll('[data-try]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
