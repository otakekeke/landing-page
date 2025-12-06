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
        const functionNameInput = field.querySelector('.function-name-input');
        
        const perTask = parseFloat(perTaskInput.value) || 0;
        const perMonth = parseFloat(perMonthInput.value) || 0;
        const functionName = functionNameInput ? functionNameInput.value.trim() : `機能${index + 1}`;
        
        if (perTask > 0 && perMonth > 0) {
          const hours = perTask * perMonth;
          reductionHours.push(hours);
          totalReductionHours += hours;
          functionDetails.push({
            name: functionName || `機能${index + 1}`,
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

    // PDFエクスポート関数
    function exportToPDF() {
      // html2pdf関数を取得（複数の方法で確認）
      function getHtml2PdfFn() {
        if (typeof html2pdf !== 'undefined') {
          return html2pdf;
        }
        if (typeof window.html2pdf !== 'undefined') {
          return window.html2pdf;
        }
        // html2pdf.jsは通常、グローバルスコープにhtml2pdfとして定義される
        if (window.html2pdf && typeof window.html2pdf === 'function') {
          return window.html2pdf;
        }
        return null;
      }
      
      let html2pdfFn = getHtml2PdfFn();
      
      // ライブラリが読み込まれていない場合、少し待ってから再試行
      if (!html2pdfFn) {
        // 最大5秒待つ
        let attempts = 0;
        const maxAttempts = 50; // 100ms × 50 = 5秒
        
        // ローディング表示
        const exportBtn = document.getElementById('export-pdf-btn');
        const originalText = exportBtn ? exportBtn.textContent : '';
        if (exportBtn) {
          exportBtn.disabled = true;
          exportBtn.textContent = 'ライブラリ読み込み中...';
        }
        
        const checkInterval = setInterval(function() {
          attempts++;
          html2pdfFn = getHtml2PdfFn();
          
          if (html2pdfFn) {
            clearInterval(checkInterval);
            if (exportBtn) {
              exportBtn.disabled = false;
              exportBtn.textContent = originalText;
            }
            executePDFExport(html2pdfFn);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            if (exportBtn) {
              exportBtn.disabled = false;
              exportBtn.textContent = originalText;
            }
            alert('PDF生成ライブラリが読み込まれていません。\n\n以下のいずれかを試してください：\n1. ページを再読み込みしてください（F5キー）\n2. 数秒待ってから再度お試しください\n3. ブラウザのコンソール（F12）でエラーを確認してください\n\nCDNへの接続に問題がある可能性があります。');
          }
        }, 100);
        return;
      }
      
      executePDFExport(html2pdfFn);
    }
    
    // PDFエクスポート実行関数
    function executePDFExport(html2pdfFn) {
      
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
        const perTaskInput = field.querySelector('.per-task-input');
        const perMonthInput = field.querySelector('.per-month-input');
        const functionNameInput = field.querySelector('.function-name-input');
        
        const perTask = parseFloat(perTaskInput.value) || 0;
        const perMonth = parseFloat(perMonthInput.value) || 0;
        const functionName = functionNameInput ? functionNameInput.value.trim() : `機能${index + 1}`;
        
        if (perTask > 0 && perMonth > 0) {
          const hours = perTask * perMonth;
          totalReductionHours += hours;
          functionDetails.push({
            name: functionName || `機能${index + 1}`,
            perTask: perTask,
            perMonth: perMonth,
            hours: hours
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

      // テーブル行を生成
      let tableRows = '';
      functionDetails.forEach(function(detail) {
        tableRows += `
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 6px;">${escapeHtml(detail.name)}</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${detail.perTask}時間</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${detail.perMonth}回</td>
            <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">${detail.hours.toFixed(1)}時間</td>
          </tr>
        `;
      });
      tableRows += `
        <tr style="font-weight: bold; background-color: #f1f5f9;">
          <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">合計</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">-</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">-</td>
          <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">${totalReductionHours.toFixed(1)}時間</td>
        </tr>
      `;

      // HTMLコンテンツを生成
      const pdfContent = `
        <div id="pdf-content" style="font-family: 'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; padding: 20mm; width: 210mm; max-width: 210mm; margin: 0; color: #1e293b; background-color: white; box-sizing: border-box; display: block; visibility: visible; opacity: 1;">
          <!-- ヘッダー -->
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 20px; font-weight: bold; margin-bottom: 10px;">業務効率化アプリ 月額料金見積書</h1>
            <div style="font-size: 10px; display: flex; justify-content: space-between; margin-top: 10px;">
              <span>作成日：${dateStr}</span>
              <span>サービス提供元：嶽ノ子</span>
            </div>
          </div>

          <!-- 基本情報 -->
          <div style="margin-bottom: 15px;">
            <div style="margin-bottom: 8px;">
              <span style="font-weight: bold; font-size: 12px;">お客様名：</span>
              <span style="font-size: 12px;">${escapeHtml(companyName)}</span>
            </div>
            <div style="font-size: 10px;">
              <span>見積有効期限：${validUntilStr}</span>
            </div>
          </div>

          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 15px 0;">

          <!-- 料金詳細 -->
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 11px; font-weight: bold; margin-bottom: 8px;">料金詳細</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; border: 1px solid #cbd5e1;">
              <thead>
                <tr style="background-color: #6366f1; color: white;">
                  <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-weight: bold;">機能名</th>
                  <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">作業当たり削減時間</th>
                  <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">月当たり回数</th>
                  <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">削減時間合計（時間/月）</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>

          <!-- 計算式 -->
          <div style="margin-bottom: 15px; font-size: 10px;">
            <div style="margin-bottom: 5px;">
              <span style="font-weight: bold;">平均時給：</span>
              <span style="font-weight: bold;">${hourlyWage.toLocaleString()}円</span>
            </div>
            <div>
              <span style="font-weight: bold;">計算式：</span>
              <span>${totalReductionHours.toFixed(1)}時間 × ${hourlyWage.toLocaleString()}円 × 1/3</span>
            </div>
          </div>

          <!-- 月額保守費 -->
          <div style="margin-bottom: 20px; text-align: center; padding: 15px; background-color: #ecfdf5; border: 2px solid #10b981; border-radius: 8px;">
            <div style="font-size: 11px; color: #64748b; margin-bottom: 5px;">月額保守費（税込）</div>
            <div style="font-size: 24px; font-weight: bold; color: #10b981;">${monthlyFee.toLocaleString()}円/月</div>
          </div>

          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 15px 0;">

          <!-- 契約条件 -->
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 11px; font-weight: bold; margin-bottom: 8px;">契約条件</h2>
            <ul style="font-size: 9px; padding-left: 20px; margin: 0; line-height: 1.8;">
              <li>初期費用：無料（ベータ版プラン）</li>
              <li>支払条件：月末締め翌月末日支払（Stripeによる自動決済）</li>
              <li>契約期間：月単位の自動更新（解約は14日前までに通知）</li>
              <li>解約条件：14日前までの通知により解約可能</li>
              <li>その他：詳細は契約書をご確認ください</li>
            </ul>
          </div>

          ${remarks ? `
          <!-- 備考 -->
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 11px; font-weight: bold; margin-bottom: 8px;">備考</h2>
            <div style="font-size: 9px; padding: 8px; background-color: #f8fafc; border-radius: 4px; white-space: pre-wrap;">${escapeHtml(remarks)}</div>
          </div>
          ` : ''}

          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 15px 0;">

          <!-- フッター -->
          <div style="font-size: 9px;">
            <div style="font-weight: bold; margin-bottom: 5px;">サービス提供元</div>
            <div style="line-height: 1.8;">
              <div>屋号：嶽ノ子</div>
              <div>代表者：大嶽 耕太郎</div>
              <div>所在地：神奈川県相模原市中央区千代田7-10-7</div>
              <div>メール：takenoko.ai.care@gmail.com</div>
              <div>電話：070-1383-4420</div>
              <div>受付時間：平日・土曜 9:00-18:00</div>
            </div>
          </div>

          <!-- 注意事項 -->
          <div style="margin-top: 15px; font-size: 8px; color: #64748b;">
            <div>※本見積書は参考資料です。正式な契約条件は契約書に準じます。</div>
            <div>※本見積書の有効期限は上記の通りです。</div>
          </div>
        </div>
      `;

      // 一時的な要素を作成
      const element = document.createElement('div');
      if (!element) {
        alert('PDF生成エラー: 要素の作成に失敗しました。');
        return;
      }
      
      element.innerHTML = pdfContent;
      
      // HTMLコンテンツが正しく設定されたか確認
      if (!element.innerHTML || element.innerHTML.trim() === '') {
        alert('PDF生成エラー: HTMLコンテンツが正しく生成されませんでした。');
        return;
      }
      
      // 画面内に配置（html2canvasがキャプチャできるように）
      element.style.position = 'absolute';
      element.style.top = '0';
      element.style.left = '0';
      element.style.width = '794px'; // A4幅をピクセルに変換（210mm ≈ 794px at 96dpi）
      element.style.maxWidth = '794px';
      element.style.minHeight = '1123px'; // A4高さをピクセルに変換（297mm ≈ 1123px at 96dpi）
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      element.style.pointerEvents = 'none';
      element.style.zIndex = '9999';
      element.style.backgroundColor = 'white';
      element.style.overflow = 'visible';
      element.style.boxSizing = 'border-box';
      
      // 要素をDOMに追加
      try {
        document.body.appendChild(element);
      } catch (error) {
        console.error('要素の追加エラー:', error);
        alert('PDF生成エラー: 要素をDOMに追加できませんでした。\n\nエラー: ' + error.message);
        return;
      }
      
      // 要素が正しく追加されたか確認
      if (!element.parentNode) {
        alert('PDF生成エラー: 要素がDOMに追加されませんでした。');
        return;
      }

      // 要素が完全にレンダリングされるまで待つ
      function waitForRender() {
        return new Promise(function(resolve) {
          // requestAnimationFrameを使用してレンダリング完了を待つ
          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              // 要素のレンダリング確認
              const rect = element.getBoundingClientRect();
              const hasContent = element.children.length > 0;
              const hasSize = rect.width > 0 && rect.height > 0;
              
              console.log('レンダリング確認:', {
                hasContent: hasContent,
                hasSize: hasSize,
                width: rect.width,
                height: rect.height,
                childrenCount: element.children.length
              });
              
              if (hasContent && hasSize) {
                resolve();
              } else {
                // まだレンダリングされていない場合は少し待つ
                setTimeout(function() {
                  resolve();
                }, 200);
              }
            });
          });
        });
      }
      
      // レンダリング待機とフォント読み込み
      setTimeout(function() {
        // フォント読み込みを待つ
        const fontPromise = document.fonts && document.fonts.ready 
          ? document.fonts.ready 
          : Promise.resolve();
        
        Promise.all([fontPromise, waitForRender()]).then(function() {
          // さらに少し待ってからPDF生成（レンダリング完了を確実にする）
          setTimeout(function() {
            generatePDF();
          }, 300);
        });
      }, 500);

      function generatePDF() {
        // 要素のサイズと位置を確認（デバッグ用）
        const rect = element.getBoundingClientRect();
        const scrollWidth = element.scrollWidth;
        const scrollHeight = element.scrollHeight;
        const offsetWidth = element.offsetWidth;
        const offsetHeight = element.offsetHeight;
        const children = element.children;
        
        console.log('=== PDF生成デバッグ情報 ===');
        console.log('要素の存在:', element ? 'あり' : 'なし');
        console.log('getBoundingClientRect:', {
          width: rect.width,
          height: rect.height,
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom
        });
        console.log('scrollWidth:', scrollWidth);
        console.log('scrollHeight:', scrollHeight);
        console.log('offsetWidth:', offsetWidth);
        console.log('offsetHeight:', offsetHeight);
        console.log('子要素の数:', children.length);
        console.log('要素のスタイル:', {
          position: element.style.position,
          visibility: element.style.visibility,
          opacity: element.style.opacity,
          width: element.style.width,
          height: element.style.height || 'auto'
        });
        
        // 要素サイズが0の場合はエラー
        if (scrollWidth === 0 || scrollHeight === 0) {
          console.error('要素のサイズが0です。要素が正しくレンダリングされていません。');
          alert('PDF生成エラー: 要素が正しくレンダリングされていません。\n\nページを再読み込みして再度お試しください。');
          if (element && element.parentNode) {
            document.body.removeChild(element);
          }
          return;
        }
        
        // PDF生成オプション
        const opt = {
          margin: [10, 10, 10, 10],
          filename: `月額料金見積書_${companyName}_${dateStr.replace(/[年月日]/g, '')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 1.5,
            useCORS: true,
            letterRendering: true,
            logging: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
            onclone: function(clonedDoc, clonedElement) {
              console.log('onclone コールバック実行');
              // クローンされたドキュメントにもフォントとスタイルを適用
              const pdfContentDiv = clonedDoc.querySelector('#pdf-content');
              if (pdfContentDiv) {
                console.log('pdf-content div が見つかりました');
                pdfContentDiv.style.fontFamily = "'Noto Sans JP', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif";
                pdfContentDiv.style.visibility = 'visible';
                pdfContentDiv.style.opacity = '1';
                pdfContentDiv.style.position = 'relative';
                pdfContentDiv.style.width = '794px';
                pdfContentDiv.style.maxWidth = '794px';
                pdfContentDiv.style.backgroundColor = 'white';
                pdfContentDiv.style.color = '#1e293b';
              } else {
                console.warn('pdf-content div が見つかりませんでした');
              }
              // 親要素のスタイルも確認
              if (clonedElement) {
                console.log('clonedElement が見つかりました');
                clonedElement.style.visibility = 'visible';
                clonedElement.style.opacity = '1';
                clonedElement.style.backgroundColor = 'white';
              } else {
                console.warn('clonedElement が見つかりませんでした');
              }
            }
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
          }
        };

        // 要素が存在するか再確認
        if (!element || !element.parentNode) {
          console.error('PDF生成エラー: 要素が存在しません');
          alert('PDF生成エラー: 要素が存在しません。ページを再読み込みして再度お試しください。');
          return;
        }
        
        // PDF生成
        console.log('PDF生成を開始します...');
        html2pdfFn().set(opt).from(element).save().then(function() {
          console.log('PDF生成成功');
          // 一時要素を削除（少し遅延させて確実に削除）
          setTimeout(function() {
            try {
              if (element && element.parentNode) {
                document.body.removeChild(element);
              }
            } catch (error) {
              console.warn('要素の削除エラー（無視可能）:', error);
            }
          }, 500);
        }).catch(function(error) {
          console.error('PDF生成エラー:', error);
          console.error('エラー詳細:', error.stack);
          console.error('エラーオブジェクト:', error);
          
          let errorMessage = 'PDF生成中にエラーが発生しました。';
          if (error.message) {
            errorMessage += '\n\nエラー: ' + error.message;
          }
          errorMessage += '\n\nブラウザのコンソール（F12）で詳細を確認してください。';
          
          alert(errorMessage);
          
          // 一時要素を削除
          setTimeout(function() {
            try {
              if (element && element.parentNode) {
                document.body.removeChild(element);
              }
            } catch (error) {
              console.warn('要素の削除エラー（無視可能）:', error);
            }
          }, 500);
        });
      }
    }

    // HTMLエスケープ関数
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  }

})();