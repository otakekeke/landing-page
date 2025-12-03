// メインアプリケーションスクリプト
// CSP対応のため、すべてのインラインJavaScriptを外部ファイルに移動

(function() {
  'use strict';

  // DOM読み込み完了後に実行
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initFormHandling();
    initMonthlyCalculator();
  });

  // モバイルメニューの初期化
  function initMobileMenu() {
    const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener('click', function() {
        const isHidden = mobileMenu.classList.contains('hidden');
        mobileMenu.classList.toggle('hidden');
        
        // アクセシビリティのためのaria-expanded属性を更新
        mobileMenuButton.setAttribute('aria-expanded', !isHidden);
      });

      // ESCキーでメニューを閉じる
      document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
          mobileMenuButton.setAttribute('aria-expanded', 'false');
          mobileMenuButton.focus();
        }
      });

      // メニュー外をクリックした時に閉じる
      document.addEventListener('click', function(event) {
        if (!mobileMenuButton.contains(event.target) && !mobileMenu.contains(event.target)) {
          mobileMenu.classList.add('hidden');
          mobileMenuButton.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  // スムーススクロールの初期化
  function initSmoothScroll() {
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    
    scrollLinks.forEach(function(link) {
      link.addEventListener('click', function(event) {
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          event.preventDefault();
          
          const headerHeight = document.querySelector('header')?.offsetHeight || 0;
          const targetPosition = targetElement.offsetTop - headerHeight - 20;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // フォーカスを移動（アクセシビリティ）
          targetElement.focus();
        }
      });
    });
  }

  // フォーム処理の初期化
  function initFormHandling() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
      form.addEventListener('submit', function(event) {
        if (!validateForm(form)) {
          event.preventDefault();
        }
      });
    });
  }

  // フォームバリデーション
  function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(function(field) {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        showFieldError(field, 'この項目は必須です');
      } else {
        field.classList.remove('error');
        hideFieldError(field);
      }
    });
    
    return isValid;
  }

  // フィールドエラーの表示
  function showFieldError(field, message) {
    hideFieldError(field); // 既存のエラーを削除
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message text-sm text-red-600 mt-1';
    errorElement.textContent = message;
    errorElement.setAttribute('role', 'alert');
    
    field.parentNode.appendChild(errorElement);
  }

  // フィールドエラーの非表示
  function hideFieldError(field) {
    const errorElement = field.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  // 印刷機能（sales_material.html用）
  function initPrintButton() {
    const printButton = document.querySelector('[data-print-button]');
    
    if (printButton) {
      printButton.addEventListener('click', function() {
        window.print();
      });
    }
  }

  // 印刷ボタンの初期化を追加
  document.addEventListener('DOMContentLoaded', function() {
    initPrintButton();
  });

  // 月額算出ツールの初期化
  function initMonthlyCalculator() {
    const container = document.getElementById('reduction-hours-container');
    const addBtn = document.getElementById('add-reduction-hour-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    
    if (!container || !addBtn || !calculateBtn) {
      return; // contract.html以外のページでは実行しない
    }

    let fieldCount = 0;

    // 初期の削減時間入力欄を追加
    addReductionHourField();

    // 削減時間を追加ボタン
    addBtn.addEventListener('click', function() {
      addReductionHourField();
    });

    // 算出ボタン
    calculateBtn.addEventListener('click', function() {
      calculateMonthlyFee();
    });

    // 削減時間入力欄を追加する関数
    function addReductionHourField() {
      fieldCount++;
      const fieldId = 'reduction-hour-' + fieldCount;
      
      const fieldWrapper = document.createElement('div');
      fieldWrapper.className = 'reduction-hour-field bg-slate-50 rounded-lg p-4 border border-slate-200';
      fieldWrapper.dataset.fieldId = fieldId;
      
      fieldWrapper.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-semibold text-slate-700">機能 ${fieldCount}</label>
          <button 
            type="button" 
            class="remove-field-btn px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm ${fieldCount === 1 ? 'hidden' : ''}"
            aria-label="この機能を削除">
            <svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            削除
          </button>
        </div>
        <div class="grid md:grid-cols-2 gap-3">
          <div>
            <label for="${fieldId}-per-task" class="block text-xs text-slate-600 mb-1">一つの作業当たりの削減時間（時間）</label>
            <input 
              type="number" 
              id="${fieldId}-per-task" 
              class="per-task-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              min="0" 
              step="0.1"
              placeholder="例：0.5">
          </div>
          <div>
            <label for="${fieldId}-per-month" class="block text-xs text-slate-600 mb-1">月当たりの回数（回）</label>
            <input 
              type="number" 
              id="${fieldId}-per-month" 
              class="per-month-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              min="0" 
              step="1"
              placeholder="例：20">
          </div>
        </div>
        <div class="mt-2 text-xs text-slate-500">
          <span class="calculated-hours-label">削減時間（時間/月）: </span>
          <span class="calculated-hours-value font-semibold text-indigo-600">0</span>
        </div>
      `;
      
      container.appendChild(fieldWrapper);
      
      // 削除ボタンのイベント
      const removeBtn = fieldWrapper.querySelector('.remove-field-btn');
      if (removeBtn) {
        removeBtn.addEventListener('click', function() {
          fieldWrapper.remove();
          updateRemoveButtons();
          calculateMonthlyFee(); // 再計算
        });
      }
      
      // 入力値変更時に自動計算
      const perTaskInput = fieldWrapper.querySelector('.per-task-input');
      const perMonthInput = fieldWrapper.querySelector('.per-month-input');
      const calculatedValue = fieldWrapper.querySelector('.calculated-hours-value');
      
      function updateCalculatedHours() {
        const perTask = parseFloat(perTaskInput.value) || 0;
        const perMonth = parseFloat(perMonthInput.value) || 0;
        const calculated = (perTask * perMonth).toFixed(1);
        calculatedValue.textContent = calculated;
      }
      
      perTaskInput.addEventListener('input', updateCalculatedHours);
      perMonthInput.addEventListener('input', updateCalculatedHours);
      
      updateRemoveButtons();
    }

    // 削除ボタンの表示/非表示を更新
    function updateRemoveButtons() {
      const fields = container.querySelectorAll('.reduction-hour-field');
      fields.forEach(function(field, index) {
        const removeBtn = field.querySelector('.remove-field-btn');
        if (removeBtn) {
          if (fields.length === 1) {
            removeBtn.classList.add('hidden');
          } else {
            removeBtn.classList.remove('hidden');
          }
        }
      });
    }

    // 月額料金を計算する関数
    function calculateMonthlyFee() {
      const hourlyWageInput = document.getElementById('hourly-wage');
      const hourlyWage = parseFloat(hourlyWageInput.value) || 0;
      
      if (hourlyWage <= 0) {
        alert('平均時給を入力してください。');
        hourlyWageInput.focus();
        return;
      }

      // すべての機能の削減時間を取得
      const fields = container.querySelectorAll('.reduction-hour-field');
      let totalReductionHours = 0;
      const reductionHours = [];
      const functionDetails = [];

      fields.forEach(function(field, index) {
        const perTaskInput = field.querySelector('.per-task-input');
        const perMonthInput = field.querySelector('.per-month-input');
        
        const perTask = parseFloat(perTaskInput.value) || 0;
        const perMonth = parseFloat(perMonthInput.value) || 0;
        
        if (perTask > 0 && perMonth > 0) {
          const hours = perTask * perMonth;
          reductionHours.push(hours);
          totalReductionHours += hours;
          functionDetails.push({
            perTask: perTask,
            perMonth: perMonth,
            hours: hours,
            index: index + 1
          });
        }
      });

      if (totalReductionHours <= 0) {
        alert('各機能の削減時間を入力してください。');
        return;
      }

      // 計算: 削減時間 × 時給 × 1/3
      const monthlyFee = Math.round(totalReductionHours * hourlyWage * (1/3));

      // 結果を表示
      displayResult(totalReductionHours, hourlyWage, monthlyFee, reductionHours, functionDetails);
    }

    // 結果を表示する関数
    function displayResult(totalHours, hourlyWage, monthlyFee, reductionHours, functionDetails) {
      const resultDiv = document.getElementById('calculation-result');
      const formulaDiv = document.getElementById('calculation-formula');
      const monthlyFeeDiv = document.getElementById('monthly-fee');

      // 計算式を表示
      let formulaText = '';
      if (reductionHours.length === 1) {
        const detail = functionDetails[0];
        formulaText = `${detail.perTask}時間 × ${detail.perMonth}回 = ${totalHours}時間 × ${hourlyWage.toLocaleString()}円 × 1/3`;
      } else {
        const detailsText = functionDetails.map(d => 
          `${d.perTask}時間 × ${d.perMonth}回`
        ).join(' + ');
        const hoursText = reductionHours.map(h => h.toFixed(1) + '時間').join(' + ');
        formulaText = `(${detailsText}) = (${hoursText}) = ${totalHours.toFixed(1)}時間 × ${hourlyWage.toLocaleString()}円 × 1/3`;
      }
      formulaDiv.textContent = formulaText;

      // 月額料金を表示
      monthlyFeeDiv.textContent = monthlyFee.toLocaleString();

      // 結果エリアを表示
      resultDiv.classList.remove('hidden');
      
      // 結果エリアまでスクロール
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

})();