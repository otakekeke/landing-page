// シンプルなJavaScript - 新しいデザインに対応

// DOM読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    // フォームバリデーションの設定
    setupFormValidation();
    
    // スムーススクロールの設定
    setupSmoothScroll();
    
    // FAQ展開機能
    setupFAQToggle();
    
    // フォーム送信処理
    setupFormSubmission();
});

// フォームバリデーション
function setupFormValidation() {
    const form = document.getElementById('trial-form');
    if (!form) return;
    
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });
        
        field.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// フィールドの検証
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'この項目は必須です';
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = '有効なメールアドレスを入力してください';
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        clearFieldError(field);
    }
    
    return isValid;
}

// フィールドエラーの表示
function showFieldError(field, message) {
    field.classList.add('error');
    
    // 既存のエラーメッセージを削除
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // エラーメッセージを追加
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-sm text-red-600 mt-1';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

// フィールドエラーのクリア
function clearFieldError(field) {
    field.classList.remove('error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// スムーススクロールの設定
function setupSmoothScroll() {
    // ナビゲーションリンクのスムーススクロール
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// FAQ展開機能
function setupFAQToggle() {
    const faqItems = document.querySelectorAll('#faq details');
    
    faqItems.forEach(item => {
        item.addEventListener('toggle', function() {
            // アニメーション効果を追加
            if (this.open) {
                this.classList.add('animate-fade-in');
            }
        });
    });
}

// フォーム送信処理
function setupFormSubmission() {
    const form = document.getElementById('trial-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // すべての必須フィールドを検証
        const requiredFields = form.querySelectorAll('[required]');
        let allValid = true;
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                allValid = false;
            }
        });
        
        if (!allValid) {
            // 最初のエラーフィールドにフォーカス
            const firstErrorField = form.querySelector('.error');
            if (firstErrorField) {
                firstErrorField.focus();
            }
            return;
        }
        
        // 送信処理
        submitForm(form);
    });
}

// フォーム送信
async function submitForm(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    // ローディング状態
    submitButton.textContent = '送信中...';
    submitButton.disabled = true;
    submitButton.classList.add('loading');
    
    try {
        const formData = new FormData(form);
        
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            showSuccessMessage();
            form.reset();
        } else {
            showErrorMessage('送信に失敗しました。しばらく時間をおいて再度お試しください。');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showErrorMessage('送信中にエラーが発生しました。お急ぎの場合は直接お電話ください。');
    } finally {
        // ローディング状態を解除
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
}

// 成功メッセージの表示
function showSuccessMessage() {
    const form = document.getElementById('trial-form');
    const message = document.createElement('div');
    message.className = 'bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6';
    message.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
                <p class="font-semibold">お問い合わせを受け付けました</p>
                <p class="text-sm">担当者より24時間以内にご連絡いたします。</p>
            </div>
        </div>
    `;
    
    form.parentNode.insertBefore(message, form);
    
    // 3秒後にメッセージを自動で非表示
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// エラーメッセージの表示
function showErrorMessage(errorText) {
    const form = document.getElementById('trial-form');
    const message = document.createElement('div');
    message.className = 'bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6';
    message.innerHTML = `
        <div class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <div>
                <p class="font-semibold">送信エラー</p>
                <p class="text-sm">${errorText}</p>
            </div>
        </div>
    `;
    
    form.parentNode.insertBefore(message, form);
    
    // 5秒後にメッセージを自動で非表示
    setTimeout(() => {
        message.remove();
    }, 5000);
}

// ユーティリティ関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ページ読み込み完了時の処理
window.addEventListener('load', function() {
    // フェードインアニメーションを適用
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('animate-fade-in');
    });
});

// スクロール時の処理
window.addEventListener('scroll', debounce(function() {
    // 必要に応じてスクロール時の処理を追加
}, 100));