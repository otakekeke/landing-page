// メインアプリケーションスクリプト
// CSP対応のため、すべてのインラインJavaScriptを外部ファイルに移動

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initFormHandling();
    initMonthlyCalculator();
    initPrintButton();
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

          if (!targetElement.hasAttribute('tabindex')) {
            targetElement.setAttribute('tabindex', '-1');
          }
          targetElement.focus();

          const mobileMenu = document.getElementById('mobile-menu');
          const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
          if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
          }
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

  function validateForm(form) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var requiredFields = form.querySelectorAll('[required]');
    var isValid = true;
    
    requiredFields.forEach(function(field) {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
        showFieldError(field, 'この項目は必須です');
      } else if (field.type === 'email' && !emailRegex.test(field.value.trim())) {
        isValid = false;
        field.classList.add('error');
        showFieldError(field, '有効なメールアドレスを入力してください');
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

    // PDFエクスポートボタン
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', function() {
        exportToPDF();
      });
    }

    // 削減時間入力欄を追加する関数
    function addReductionHourField() {
      fieldCount++;
      const fieldId = 'reduction-hour-' + fieldCount;
      
      const fieldWrapper = document.createElement('div');
      fieldWrapper.className = 'reduction-hour-field bg-slate-50 rounded-lg p-4 border border-slate-200';
      fieldWrapper.dataset.fieldId = fieldId;
      
      fieldWrapper.innerHTML = `
        <div class="flex items-center justify-between mb-3">
          <label for="${fieldId}-name" class="text-sm font-semibold text-slate-700">機能名称</label>
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
        <div class="mb-3">
          <input 
            type="text" 
            id="${fieldId}-name" 
            class="function-name-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
            placeholder="例：シフト管理、在庫管理など">
        </div>
        <div class="grid md:grid-cols-2 gap-3">
          <div>
            <label for="${fieldId}-per-task" class="block text-xs text-slate-600 mb-1">一つの作業当たりの削減時間</label>
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <input 
                  type="number" 
                  id="${fieldId}-per-task-hours" 
                  class="per-task-hours-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  min="0" 
                  step="1"
                  placeholder="時間">
                <label for="${fieldId}-per-task-hours" class="block text-xs text-slate-500 mt-1 text-center">時間</label>
              </div>
              <div class="flex-1">
            <input 
              type="number" 
                  id="${fieldId}-per-task-minutes" 
                  class="per-task-minutes-input w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
              min="0" 
                  max="59"
                  step="1"
                  placeholder="分">
                <label for="${fieldId}-per-task-minutes" class="block text-xs text-slate-500 mt-1 text-center">分</label>
              </div>
            </div>
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
          <span class="calculated-hours-value font-semibold text-indigo-600">0時間0分</span>
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
      const perTaskHoursInput = fieldWrapper.querySelector('.per-task-hours-input');
      const perTaskMinutesInput = fieldWrapper.querySelector('.per-task-minutes-input');
      const perMonthInput = fieldWrapper.querySelector('.per-month-input');
      const calculatedValue = fieldWrapper.querySelector('.calculated-hours-value');
      
      // 分の入力値が60以上にならないように制限
      if (perTaskMinutesInput) {
        perTaskMinutesInput.addEventListener('input', function() {
          const minutes = parseInt(this.value) || 0;
          if (minutes >= 60) {
            this.value = 59;
          }
        });
      }
      
      function updateCalculatedHours() {
        const hours = parseInt(perTaskHoursInput.value) || 0;
        const minutes = parseInt(perTaskMinutesInput.value) || 0;
        const perMonth = parseFloat(perMonthInput.value) || 0;
        
        // 時間単位に変換（時間 + 分/60）
        const perTaskInHours = hours + (minutes / 60);
        const totalHours = perTaskInHours * perMonth;
        
        // 時間と分に変換して表示
        const totalHoursInt = Math.floor(totalHours);
        const totalMinutesInt = Math.round((totalHours - totalHoursInt) * 60);
        
        if (totalHoursInt === 0 && totalMinutesInt === 0) {
          calculatedValue.textContent = '0時間0分';
        } else if (totalHoursInt === 0) {
          calculatedValue.textContent = `${totalMinutesInt}分`;
        } else if (totalMinutesInt === 0) {
          calculatedValue.textContent = `${totalHoursInt}時間`;
        } else {
          calculatedValue.textContent = `${totalHoursInt}時間${totalMinutesInt}分`;
        }
      }
      
      perTaskHoursInput.addEventListener('input', updateCalculatedHours);
      perTaskMinutesInput.addEventListener('input', updateCalculatedHours);
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
        const perTaskHoursInput = field.querySelector('.per-task-hours-input');
        const perTaskMinutesInput = field.querySelector('.per-task-minutes-input');
        const perMonthInput = field.querySelector('.per-month-input');
        const functionNameInput = field.querySelector('.function-name-input');
        
        const hours = parseInt(perTaskHoursInput.value) || 0;
        const minutes = parseInt(perTaskMinutesInput.value) || 0;
        const perMonth = parseFloat(perMonthInput.value) || 0;
        const functionName = functionNameInput ? functionNameInput.value.trim() : `機能${index + 1}`;
        
        // 時間単位に変換（時間 + 分/60）
        const perTaskInHours = hours + (minutes / 60);
        
        if (perTaskInHours > 0 && perMonth > 0) {
          const totalHours = perTaskInHours * perMonth;
          reductionHours.push(totalHours);
          totalReductionHours += totalHours;
          functionDetails.push({
            name: functionName || `機能${index + 1}`,
            perTaskHours: hours,
            perTaskMinutes: minutes,
            perTaskInHours: perTaskInHours,
            perMonth: perMonth,
            hours: totalHours,
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

      // 時間と分を文字列に変換する関数
      function formatTime(hours) {
        const hoursInt = Math.floor(hours);
        const minutesInt = Math.round((hours - hoursInt) * 60);
        if (hoursInt === 0 && minutesInt === 0) {
          return '0時間0分';
        } else if (hoursInt === 0) {
          return `${minutesInt}分`;
        } else if (minutesInt === 0) {
          return `${hoursInt}時間`;
        } else {
          return `${hoursInt}時間${minutesInt}分`;
        }
      }

      // 計算式を表示
      let formulaText = '';
      if (reductionHours.length === 1) {
        const detail = functionDetails[0];
        const perTaskText = formatTime(detail.perTaskInHours);
        const totalHoursText = formatTime(totalHours);
        formulaText = `${perTaskText} × ${detail.perMonth}回 = ${totalHoursText} × ${hourlyWage.toLocaleString()}円 × 1/3`;
      } else {
        const detailsText = functionDetails.map(d => {
          const perTaskText = formatTime(d.perTaskInHours);
          return `${perTaskText} × ${d.perMonth}回`;
        }).join(' + ');
        const hoursText = reductionHours.map(h => formatTime(h)).join(' + ');
        const totalHoursText = formatTime(totalHours);
        formulaText = `(${detailsText}) = (${hoursText}) = ${totalHoursText} × ${hourlyWage.toLocaleString()}円 × 1/3`;
      }
      formulaDiv.textContent = formulaText;

      // 月額料金を表示
      monthlyFeeDiv.textContent = monthlyFee.toLocaleString();

      // 結果エリアを表示
      resultDiv.classList.remove('hidden');
      
      // 結果エリアまでスクロール
      resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // PDFエクスポート関数（ブラウザ印刷機能を使用）
    function exportToPDF() {
      // データ取得
      const companyName = document.getElementById('company-name').value.trim();
      if (!companyName) {
        alert('お客様名（会社名）を入力してください。');
        document.getElementById('company-name').focus();
        return;
      }
      
      const hourlyWage = parseFloat(document.getElementById('hourly-wage').value) || 0;
      const remarks = document.getElementById('remarks').value.trim() || '';
      const fields = container.querySelectorAll('.reduction-hour-field');
      
      const functionDetails = [];
      let totalReductionHours = 0;

      fields.forEach(function(field, index) {
        const perTaskHoursInput = field.querySelector('.per-task-hours-input');
        const perTaskMinutesInput = field.querySelector('.per-task-minutes-input');
        const perMonthInput = field.querySelector('.per-month-input');
        const functionNameInput = field.querySelector('.function-name-input');
        
        const hours = parseInt(perTaskHoursInput.value) || 0;
        const minutes = parseInt(perTaskMinutesInput.value) || 0;
        const perMonth = parseFloat(perMonthInput.value) || 0;
        const functionName = functionNameInput ? functionNameInput.value.trim() : `機能${index + 1}`;
        
        // 時間単位に変換（時間 + 分/60）
        const perTaskInHours = hours + (minutes / 60);
        
        if (perTaskInHours > 0 && perMonth > 0) {
          const totalHours = perTaskInHours * perMonth;
          totalReductionHours += totalHours;
          functionDetails.push({
            name: functionName || `機能${index + 1}`,
            perTaskHours: hours,
            perTaskMinutes: minutes,
            perTaskInHours: perTaskInHours,
            perMonth: perMonth,
            hours: totalHours
          });
        }
      });

      if (functionDetails.length === 0 || hourlyWage <= 0) {
        alert('計算結果が正しくありません。再度計算を実行してください。');
        return;
      }

      const monthlyFee = Math.round(totalReductionHours * hourlyWage * (1/3));
      
      // 日付フォーマット
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${year}年${month}月${day}日`;
      
      // 見積有効期限（1か月後）
      const validUntil = new Date(today);
      validUntil.setMonth(validUntil.getMonth() + 1);
      const validYear = validUntil.getFullYear();
      const validMonth = String(validUntil.getMonth() + 1).padStart(2, '0');
      const validDay = String(validUntil.getDate()).padStart(2, '0');
      const validUntilStr = `${validYear}年${validMonth}月${validDay}日`;

      // 見積書HTMLを生成
      const printArea = document.getElementById('estimate-print-area');
      
      // 時間と分を文字列に変換する関数
      function formatTimeForTable(hours) {
        const hoursInt = Math.floor(hours);
        const minutesInt = Math.round((hours - hoursInt) * 60);
        if (hoursInt === 0 && minutesInt === 0) {
          return '0時間0分';
        } else if (hoursInt === 0) {
          return `${minutesInt}分`;
        } else if (minutesInt === 0) {
          return `${hoursInt}時間`;
        } else {
          return `${hoursInt}時間${minutesInt}分`;
        }
      }
      
      // テーブル行を生成
      let tableRows = '';
      functionDetails.forEach(function(detail) {
        const perTaskText = formatTimeForTable(detail.perTaskInHours);
        const totalHoursText = formatTimeForTable(detail.hours);
        tableRows += `
          <tr>
            <td>${escapeHtml(detail.name)}</td>
            <td>${perTaskText}</td>
            <td>${detail.perMonth}回</td>
            <td>${totalHoursText}</td>
          </tr>
        `;
      });
      const totalHoursText = formatTimeForTable(totalReductionHours);
      tableRows += `
        <tr>
          <td><strong>合計</strong></td>
          <td>-</td>
          <td>-</td>
          <td><strong>${totalHoursText}</strong></td>
        </tr>
      `;

      // 契約条件のリストを生成
      const conditionsHtml = `
        <li>初期費用：無料（ベータ版プラン）</li>
        <li>支払条件：月末締め翌月末日支払（Stripeによる自動決済）</li>
        <li>契約期間：月単位の自動更新（解約は14日前までに通知）</li>
        <li>解約条件：14日前までの通知により解約可能</li>
        <li>その他：詳細は契約書をご確認ください</li>
      `;

      // 備考欄のHTML
      const remarksHtml = remarks ? `
        <div class="estimate-section">
          <div class="estimate-section-title">備考</div>
          <div>${escapeHtml(remarks).replace(/\n/g, '<br>')}</div>
        </div>
      ` : '';

      // 見積書HTMLを構築
      const estimateHtml = `
        <div class="estimate-header">
          <div class="estimate-title">業務効率化アプリ 月額料金見積書</div>
          <div class="estimate-info">
            <div>作成日：${dateStr}</div>
            <div>サービス提供元：嶽ノ子</div>
          </div>
        </div>

        <div class="estimate-section">
          <div><strong>お客様名：</strong>${escapeHtml(companyName)}</div>
          <div>見積有効期限：${validUntilStr}</div>
        </div>

        <div class="estimate-section">
          <div class="estimate-section-title">料金詳細</div>
          <table class="estimate-table">
            <thead>
              <tr>
                <th>機能名</th>
                <th>作業当たり削減時間</th>
                <th>月当たり回数</th>
                <th>削減時間合計（時間/月）</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>

        <div class="estimate-section">
          <div><strong>平均時給：</strong>${hourlyWage.toLocaleString()}円</div>
          <div><strong>計算式：</strong>${formatTimeForTable(totalReductionHours)} × ${hourlyWage.toLocaleString()}円 × 1/3</div>
        </div>

        <div class="estimate-section">
          <div class="estimate-section-title">月額保守費（税込）</div>
          <div class="estimate-total">${monthlyFee.toLocaleString()}円/月</div>
        </div>

        <div class="estimate-section">
          <div class="estimate-section-title">契約条件</div>
          <ul style="margin: 0; padding-left: 20px;">
            ${conditionsHtml}
          </ul>
        </div>

        ${remarksHtml}

        <div class="estimate-footer">
          <div class="estimate-section-title">サービス提供元</div>
          <div>屋号：嶽ノ子</div>
          <div>代表者：大嶽 耕太郎</div>
          <div>所在地：神奈川県相模原市中央区千代田7-10-7</div>
          <div>メール：kotaro.otake@takenokonoko.com</div>
          <div>電話：070-1383-4420</div>
          <div>受付時間：平日・土曜 9:00-18:00</div>
          <div style="margin-top: 15px; font-size: 7pt; color: #666;">
            <div>※本見積書は参考資料です。正式な契約条件は契約書に準じます。</div>
            <div>※本見積書の有効期限は上記の通りです。</div>
          </div>
        </div>
      `;

      // HTMLを挿入
      printArea.innerHTML = estimateHtml;
      printArea.classList.remove('hidden');

      // 印刷ダイアログを表示
      window.print();

      // 印刷後、HTMLをクリア（少し遅延を入れる）
      setTimeout(function() {
        printArea.innerHTML = '';
        printArea.classList.add('hidden');
      }, 1000);
    }

    // HTMLエスケープ関数
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

})();