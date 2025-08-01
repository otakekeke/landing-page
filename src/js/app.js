// メインアプリケーションスクリプト
// CSP対応のため、すべてのインラインJavaScriptを外部ファイルに移動

(function() {
  'use strict';

  // DOM読み込み完了後に実行
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initFormHandling();
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

})();