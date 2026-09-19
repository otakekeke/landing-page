(() => {
  'use strict';

  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#main-nav');

  if (menuToggle && navigation) {
    document.documentElement.classList.add('has-js');
    menuToggle.hidden = false;
    const closeMenu = (restoreFocus = false) => {
      menuToggle.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('is-open');
      if (restoreFocus) menuToggle.focus();
    };
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      navigation.classList.toggle('is-open', !isOpen);
    });
    navigation.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMenu(true);
      }
    });
    document.addEventListener('click', event => {
      if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', () => closeMenu());
  }

  const hours = document.querySelector('#saving-hours');
  const minutes = document.querySelector('#saving-minutes');
  const amount = document.querySelector('#monthly-price');
  const initialAmount = document.querySelector('#initial-price');
  const detail = document.querySelector('#result-detail');
  const error = document.querySelector('#calculator-error');
  const presets = document.querySelectorAll('[data-hours]');
  if (!hours || !minutes || !amount || !initialAmount || !detail || !error) return;

  // The same reference hourly rate and multiplier apply to every estimate.
  // There is no minimum fee. The calculation is in whole worker-minutes.
  const REFERENCE_HOURLY_RATE = 2000;
  const COMMON_MULTIPLIER = 3;
  const INITIAL_FEE_MONTHS = 3;
  const PRICE_PER_MINUTE = REFERENCE_HOURLY_RATE * COMMON_MULTIPLIER / 60;
  const formatter = new Intl.NumberFormat('ja-JP');

  const updateEstimate = () => {
    const h = hours.valueAsNumber;
    const m = minutes.valueAsNumber;
    const validHours = Number.isInteger(h) && h >= 0 && h <= 10000;
    const validMinutes = Number.isInteger(m) && m >= 0 && m <= 59;
    hours.setAttribute('aria-invalid', String(!validHours));
    minutes.setAttribute('aria-invalid', String(!validMinutes));

    presets.forEach(button => button.setAttribute('aria-pressed', String(
      validHours && validMinutes && h === Number(button.dataset.hours) && m === 0
    )));

    if (!validHours || !validMinutes) {
      error.hidden = false;
      error.textContent = '時間は0〜10,000、分は0〜59の整数で入力してください。';
      amount.value = '—';
      initialAmount.value = '—';
      detail.textContent = '正しい時間を入力すると、目安を表示します。';
      return;
    }

    error.hidden = true;
    error.textContent = '';
    const totalMinutes = h * 60 + m;
    const monthly = totalMinutes * PRICE_PER_MINUTE;
    amount.value = formatter.format(monthly);
    initialAmount.value = formatter.format(monthly * INITIAL_FEE_MONTHS);
    detail.textContent = totalMinutes === 0
      ? '導入時の削減時間がゼロなら、月額・初期費用ともにゼロです。'
      : `月${h ? `${formatter.format(h)}時間` : ''}${m ? `${m}分` : ''}の削減を想定した目安です。`;
  };

  hours.addEventListener('input', updateEstimate);
  minutes.addEventListener('input', updateEstimate);
  presets.forEach(button => button.addEventListener('click', () => {
    hours.value = button.dataset.hours;
    minutes.value = '0';
    updateEstimate();
  }));
  updateEstimate();
})();
