// Three.jsとその関連モジュールをインポート
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// Three.js関連の変数
let scene, camera, renderer, controls;
let crystal, light, ambientLight;
let clock = new THREE.Clock();

// ウィンドウサイズ
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

// パーティクル関連の変数
let particles = [];
let particleSystem;

// モバイル判定
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTablet = /iPad|Android(?=.*\b(tablet|pad)\b)/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// デバイス判定とパフォーマンス設定
let devicePixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
let particleCount = isMobile ? 50 : 100;
let enableComplexAnimations = !isMobile || window.innerWidth > 768;

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', function() {
    // ローディングオーバーレイの処理
    const loadingOverlay = document.getElementById('loading-overlay');
    
    // 最小表示時間を設定（UX向上のため）
    const minLoadingTime = 1500; // 1.5秒
    const startTime = Date.now();
    
    // ページの読み込み完了を待つ
    window.addEventListener('load', function() {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
        
        setTimeout(() => {
            if (loadingOverlay) {
                loadingOverlay.classList.add('fade-out');
                
                // フェードアウト完了後に要素を削除
                setTimeout(() => {
                    loadingOverlay.remove();
                }, 600);
            }
        }, remainingTime);
    });
    
    // ナビゲーション関連の初期化
    initMobileMenu();
    initSmoothScrolling();
    initScrollEffects();
    initBackToTop();
    
    // 実装例の折り畳み機能を初期化
    initExamplesToggle();
    
    // フォーム送信の処理
    initFormSubmission();
});

// デバイス最適化の設定
function setupDeviceOptimizations() {
    // モバイルでのビューポート設定
    if (isMobile) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
        }
        
        // モバイル用CSS変数の設定
        document.documentElement.style.setProperty('--is-mobile', '1');
        
        // プリロードの最適化
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = 'src/css/style.css';
        document.head.appendChild(link);
        
        // モバイル専用の最適化スタイル
        const mobileStyle = document.createElement('style');
        mobileStyle.textContent = `
            /* モバイル向けスムーズスクロール最適化 */
            html {
                scroll-behavior: smooth;
                -webkit-overflow-scrolling: touch;
            }
            
            /* タッチデバイス向けのインタラクション改善 */
            .touch-device * {
                -webkit-tap-highlight-color: rgba(59, 130, 246, 0.2);
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            .touch-device input, 
            .touch-device textarea {
                -webkit-user-select: text;
                user-select: text;
            }
            
            /* ダブルタップズーム防止 */
            .touch-device .primary-button,
            .touch-device .cta-button,
            .touch-device .appeal-cta,
            .touch-device .nav-links a {
                touch-action: manipulation;
            }
            
            /* モバイルでのホバー効果無効化 */
            @media (hover: none) and (pointer: coarse) {
                .card:hover,
                .example-card:hover,
                .strength-item:hover,
                .primary-button:hover,
                .cta-button:hover,
                .appeal-cta:hover {
                    transform: none;
                }
            }
        `;
        document.head.appendChild(mobileStyle);
    }
    
    // 高DPIディスプレイ対応
    if (window.devicePixelRatio > 1) {
        document.documentElement.classList.add('high-dpi');
    }
    
    // タッチデバイス対応
    if (isTouchDevice) {
        document.documentElement.classList.add('touch-device');
        
        // タッチイベントの最適化
        setupTouchOptimizations();
    }
    
    // iOS Safari対応の追加最適化
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        document.documentElement.classList.add('ios-device');
        
        // iOS Safariでの100vh問題対応
        const setVH = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        setVH();
        window.addEventListener('resize', setVH);
        window.addEventListener('orientationchange', () => {
            setTimeout(setVH, 100);
        });
    }
    
    // Android Chrome対応
    if (/Android.*Chrome/.test(navigator.userAgent)) {
        document.documentElement.classList.add('android-chrome');
    }
}

// タッチ操作の最適化
function setupTouchOptimizations() {
    // タッチスクロールの改善
    let isScrolling = false;
    let scrollTimeout = null;
    
    const handleTouchStart = () => {
        isScrolling = true;
        document.body.classList.add('is-scrolling');
    };
    
    const handleTouchEnd = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
            document.body.classList.remove('is-scrolling');
        }, 150);
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // スワイプジェスチャーでナビゲーション閉じる
    let touchStartX = 0;
    let touchStartY = 0;
    
    const navLinks = document.querySelector('.nav-links');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (navLinks && menuToggle) {
        navLinks.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        navLinks.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // 左方向のスワイプでメニューを閉じる
            if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX < -100) {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
        }, { passive: true });
    }
    
    // ピンチズーム防止（ダブルタップズームは許可）
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
}

// ローディング画面の表示（改善版）
function showLoadingScreen() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = 'flex';
        
        // ローディングメッセージの配列
        const loadingMessages = [
            {
                main: "FastAI システムを準備中...",
                sub: "あなたの施設に最適な介護支援環境を構築しています"
            },
            {
                main: "データベースを初期化中...",
                sub: "安全で信頼性の高いシステム環境を準備しています"
            },
            {
                main: "AIエンジンを起動中...",
                sub: "介護現場に特化したAI機能を読み込んでいます"
            },
            {
                main: "UI コンポーネントを最適化中...",
                sub: "使いやすいインターフェースを準備しています"
            }
        ];
        
        const loadingText = document.querySelector('.loading-text');
        const loadingSubtitle = document.querySelector('.loading-subtitle');
        
        if (loadingText && loadingSubtitle) {
            let messageIndex = 0;
            
            // 初期メッセージを設定
            loadingText.textContent = loadingMessages[0].main;
            loadingSubtitle.textContent = loadingMessages[0].sub;
            
            // 1.5秒ごとにメッセージを変更
            const messageInterval = setInterval(() => {
                messageIndex = (messageIndex + 1) % loadingMessages.length;
                
                // フェードアウト
                loadingText.style.opacity = '0';
                loadingSubtitle.style.opacity = '0';
                
                setTimeout(() => {
                    // メッセージ変更
                    loadingText.textContent = loadingMessages[messageIndex].main;
                    loadingSubtitle.textContent = loadingMessages[messageIndex].sub;
                    
                    // フェードイン
                    loadingText.style.opacity = '1';
                    loadingSubtitle.style.opacity = '0.8';
                }, 200);
            }, 1500);
            
            // ローディング完了時にインターバルをクリア
            setTimeout(() => {
                clearInterval(messageInterval);
            }, 2800);
        }
    }
}

// ローディング画面の非表示（改善版）
function hideLoadingScreen() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.classList.add('fade-out');
        
        // ローディング完了後にメインコンテンツをフェードイン
        setTimeout(() => {
            loader.style.display = 'none';
            const content = document.querySelector('.content');
            if (content) {
                content.style.opacity = '1';
            }
        }, 600);
    }
}

// ナビゲーションメニューの設定（改善版）
function setupNavigation() {
    try {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        const nav = document.querySelector('.main-nav');
        const header = document.querySelector('.main-header');
        
        if (menuToggle && navLinks) {
            // ハンバーガーメニューの開閉
            menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.classList.toggle('active');
                menuToggle.classList.toggle('active');
                
                // aria-expanded属性を更新
                const isExpanded = navLinks.classList.contains('active');
                menuToggle.setAttribute('aria-expanded', isExpanded);
                
                // ボディのスクロールを制御（モバイルメニュー開閉時）
                if (isExpanded) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
            
            // ナビゲーションリンクのクリックでメニューを閉じる
            const navItems = navLinks.querySelectorAll('a');
            navItems.forEach(link => {
                link.addEventListener('click', (e) => {
                    // スムーズスクロールの処理
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#')) {
                        e.preventDefault();
                        const target = document.querySelector(href);
                        if (target) {
                            navLinks.classList.remove('active');
                            menuToggle.classList.remove('active');
                            document.body.style.overflow = '';
                            
                            // スムーズスクロール
                            const headerHeight = header ? header.offsetHeight : 70;
                            const targetPosition = target.offsetTop - headerHeight;
                            
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    } else {
                        navLinks.classList.remove('active');
                        menuToggle.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            });
            
            // 外部クリックでメニューを閉じる
            document.addEventListener('click', (e) => {
                if (!nav.contains(e.target) && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            // ESCキーでメニューを閉じる
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    menuToggle.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        
        // スクロール時のヘッダー表示/非表示の制御（改善版）
        if (header) {
            let lastScrollTop = 0;
            let ticking = false;
            
            function updateHeader() {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // スクロール方向を検出
                if (scrollTop > lastScrollTop && scrollTop > 150) {
                    // 下にスクロール
                    header.classList.add('hide');
                } else {
                    // 上にスクロール
                    header.classList.remove('hide');
                }
                
                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
                ticking = false;
            }
            
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateHeader);
                    ticking = true;
                }
            }, { passive: true });
        }
    } catch (e) {
        console.error('ナビゲーション設定エラー:', e);
    }
}

// トップに戻るボタンの設定（改善版）
function setupBackToTopButton() {
    try {
        const backToTopButton = document.getElementById('back-to-top');
        
        if (backToTopButton) {
            let ticking = false;
            
            function updateBackToTopButton() {
                const scrollPosition = window.pageYOffset;
                const threshold = window.innerHeight * 0.5;
                
                if (scrollPosition > threshold) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
                ticking = false;
            }
            
            // パフォーマンス最適化されたスクロールイベント
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateBackToTopButton);
                    ticking = true;
                }
            }, { passive: true });
            
            // クリック時にページトップにスクロール
            backToTopButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                // GSAP利用可能時はアニメーション、そうでなければブラウザデフォルト
                if (typeof gsap !== 'undefined' && gsap.to) {
                gsap.to(window, {
                    duration: 1,
                        scrollTo: { y: 0 },
                    ease: "power3.inOut"
                });
                } else {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            });
            
            // キーボードサポート
            backToTopButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    backToTopButton.click();
                }
            });
        }
    } catch (e) {
        console.error('トップに戻るボタン設定エラー:', e);
    }
}

// スクロールガイドの設定（改善版）
function setupScrollGuide() {
    try {
        const scrollGuide = document.querySelector('.scroll-guide');
        const serviceSection = document.getElementById('service');
        
        if (scrollGuide && serviceSection) {
            // クリック時にサービスセクションまでスクロール
            scrollGuide.addEventListener('click', (e) => {
                e.preventDefault();
                
                const headerHeight = document.querySelector('.main-header')?.offsetHeight || 70;
                const targetPosition = serviceSection.offsetTop - headerHeight;
                
                if (typeof gsap !== 'undefined' && gsap.to) {
                gsap.to(window, {
                    duration: 1,
                        scrollTo: { y: targetPosition },
                    ease: "power3.inOut"
                });
                } else {
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
            
            // スクロール位置に応じてフェードアウト
            let ticking = false;
            
            function updateScrollGuide() {
                const scrollPosition = window.pageYOffset;
                const threshold = window.innerHeight * 0.3;
                
                if (scrollPosition > threshold) {
                    scrollGuide.style.opacity = '0';
                    scrollGuide.style.pointerEvents = 'none';
                } else {
                    scrollGuide.style.opacity = '0.7';
                    scrollGuide.style.pointerEvents = 'auto';
                }
                ticking = false;
            }
            
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateScrollGuide);
                    ticking = true;
                }
            }, { passive: true });
        }
    } catch (e) {
        console.error('スクロールガイド設定エラー:', e);
    }
}

// フォームバリデーションの設定
function setupFormValidation() {
    try {
        const form = document.getElementById('trial-form');
        
        if (form) {
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            
            // リアルタイムバリデーション
            inputs.forEach(input => {
                input.addEventListener('blur', validateField);
                input.addEventListener('input', debounce(validateField, 300));
            });
            
            // フォーム送信時のバリデーション
            form.addEventListener('submit', (e) => {
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!validateField.call(input)) {
                        isValid = false;
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    
                    // 最初のエラーフィールドにフォーカス
                    const firstError = form.querySelector('.error');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstError.focus();
                    }
                }
            });
        }
    } catch (e) {
        console.error('フォームバリデーション設定エラー:', e);
    }
}

// フィールドバリデーション関数
function validateField() {
    const field = this;
    const value = field.value.trim();
    let isValid = true;
    let message = '';
    
    // 既存のエラーメッセージを削除
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    field.classList.remove('error');
    
    // 必須フィールドチェック
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'この項目は必須です';
    }
    
    // メールアドレスの形式チェック
    if (field.type === 'email' && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
            isValid = false;
            message = '正しいメールアドレスを入力してください';
        }
    }
    
    // 電話番号の形式チェック
    if (field.type === 'tel' && value) {
        const phonePattern = /^[\d\-\(\)\+\s]+$/;
        if (!phonePattern.test(value) || value.length < 10) {
            isValid = false;
            message = '正しい電話番号を入力してください';
        }
    }
    
    // エラー表示
    if (!isValid) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorDiv);
    }
    
    return isValid;
}

// アクセシビリティの設定
function setupAccessibility() {
    try {
        // キーボードナビゲーション改善
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        // フォーカストラップ（モーダル用）
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && navLinks.classList.contains('active')) {
                    const focusableInModal = navLinks.querySelectorAll('a, button');
                    const firstElement = focusableInModal[0];
                    const lastElement = focusableInModal[focusableInModal.length - 1];
                    
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
        
        // スキップリンクの追加
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'メインコンテンツにスキップ';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--accent-color);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
            transition: top 0.2s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // メインコンテンツにIDを追加
        const mainContent = document.querySelector('main, .content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
        
        // 動きを好まないユーザーへの配慮
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-medium', '0s');
            document.documentElement.style.setProperty('--transition-fast', '0s');
        }
    } catch (e) {
        console.error('アクセシビリティ設定エラー:', e);
    }
}

// デバウンス関数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Three.jsの初期化
function initThree() {
    console.log('Three.jsの初期化を開始します');
    
    try {
        // WebGLサポートチェック
    if (!checkWebGLSupport()) {
            console.warn('WebGLがサポートされていません');
        return;
    }
    
        // シーンの作成
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        
        // カメラの作成（モバイル対応）
        const fov = isMobile ? 60 : 50;
        camera = new THREE.PerspectiveCamera(fov, windowWidth / windowHeight, 0.1, 1000);
        camera.position.set(0, 0, isMobile ? 8 : 6);
        
        // レンダラーの作成（パフォーマンス最適化）
        const canvas = document.getElementById('webgl-canvas');
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: !isMobile,
            alpha: true,
            powerPreference: isMobile ? 'low-power' : 'high-performance'
        });
        
        renderer.setSize(windowWidth, windowHeight);
        renderer.setPixelRatio(devicePixelRatio);
        renderer.shadowMap.enabled = !isMobile;
        renderer.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
        
        // コントロールの設定（タッチデバイス対応）
        if (!isMobile) {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
            controls.dampingFactor = 0.05;
            controls.enableZoom = false;
            controls.enablePan = false;
            controls.maxPolarAngle = Math.PI / 2;
            controls.minPolarAngle = Math.PI / 2;
        controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
    }
    
    // ライトの設定
    setupLights();
    
        // オブジェクトの作成
    createCrystal();
    
        // パーティクルシステムの作成
        createParticleSystem();
    
        // アニメーション開始
    animate();
    
    console.log('Three.jsの初期化が完了しました');
    } catch (error) {
        console.error('Three.js初期化エラー:', error);
    }
}

// WebGL対応確認
function checkWebGLSupport() {
    try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
            (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
        return false;
    }
}

// WebGLエラー表示
function showWebGLError() {
    const message = document.createElement('div');
    message.style.position = 'absolute';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.color = '#333';
    message.style.background = 'rgba(255,255,255,0.8)';
    message.style.padding = '20px';
    message.style.borderRadius = '10px';
    message.style.textAlign = 'center';
    message.innerHTML = 'お使いのブラウザはWebGLに対応していないため、3Dアニメーションを表示できません。<br>最新のブラウザでご覧ください。';
    document.body.appendChild(message);
    
    // ローディング画面を非表示
    hideLoadingScreen();
}

// ライトの設定
function setupLights() {
    try {
        // 環境光（全体を柔らかく照らす） - 少し強度を下げる
        ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // メインの方向光源（太陽光） - より自然な色と強度に
        light = new THREE.DirectionalLight(0xfff5e8, 1.0); // 少し暖色系に
        light.position.set(5, 7, 5); // 光源の位置を調整
        light.castShadow = true;

        // シャドウのクオリティ設定
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 50;
        light.shadow.camera.left = -15; // シャドウ範囲を広げる
        light.shadow.camera.right = 15;
        light.shadow.camera.top = 15;
        light.shadow.camera.bottom = -15;
        light.shadow.bias = -0.0005; // シャドウアクネを軽減
        light.shadow.radius = 4; // 影を柔らかく

        scene.add(light);

        // 補助光源（リムライト） - 球体の輪郭を強調
        const rimLight = new THREE.PointLight(0x87cefa, 1.0); // ライトブルー系
        rimLight.position.set(-4, 3, -3);
        scene.add(rimLight);

        // 環境マップ用ライト（よりリアルな反射のため）
        const hemiLight = new THREE.HemisphereLight( 0xcccccc, 0x555555, 0.6 );
        scene.add( hemiLight );

    } catch (e) {
        console.error('ライト設定エラー:', e);
    }
}

// クリスタルオブジェクトの作成
function createCrystal() {
    try {
        // 球体のジオメトリとマテリアル（より洗練されたデザイン）
        const sphereGeometry = new THREE.SphereGeometry(1.5, 64, 64);
        const sphereMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xeeeeff, // ベースカラーを白っぽく
            metalness: 0.2,  // 金属感を少し
            roughness: 0.05, // 表面の粗さを低くして滑らかに
            transmission: 0.95, // 高い透明度
            thickness: 1.0,    // 厚みによる色の変化
            clearcoat: 1.0,    // クリアコートで表面の光沢を強調
            clearcoatRoughness: 0.03,
            iridescence: 0.6,  // 虹色の光沢を追加
            iridescenceIOR: 1.5,
            sheen: 0.3,        // シーン（布のような光沢）
            sheenRoughness: 0.2,
            sheenColor: new THREE.Color(0x87cefa) // シーンの色
        });

        // 球体メッシュの作成
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        scene.add(sphere);

        // クリスタルの参照を更新
        crystal = sphere; // この変数は球体を指すように

        // 地面の作成（影を落とすための平面）
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.ShadowMaterial({
            opacity: 0.1, // 影をさらに薄く
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -1.8; // 球体との距離を少し離す
        ground.receiveShadow = true;
        scene.add(ground);
    } catch (e) {
        console.error('オブジェクト作成エラー:', e);
    }
}

// パーティクルシステムの作成
function createParticleSystem() {
    // パーティクルシステムを作成しない
    console.log('パーティクルシステムは無効化されています');
}

// アニメーションループ
function animate() {
    try {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        if (controls) {
            controls.update();
        }

        if (crystal) {
            crystal.rotation.x = Math.sin(time * 0.25) * 0.1 + Math.cos(time * 0.15) * 0.05;
            crystal.rotation.y = Math.cos(time * 0.3) * 0.15 + Math.sin(time * 0.2) * 0.1 + time * 0.03;
            crystal.rotation.z = Math.sin(time * 0.35) * 0.12 + Math.cos(time * 0.25) * 0.08;

            const floatingY = Math.sin(time * 0.5) * 0.15;
            const wobbleX = Math.sin(time * 0.8) * 0.03;
            const wobbleZ = Math.cos(time * 0.6) * 0.02;
            crystal.position.set(wobbleX, floatingY, wobbleZ);

            const breathScale = 1.0 + Math.sin(time * 0.7) * 0.02 + Math.cos(time * 1.1) * 0.01;
            crystal.scale.set(breathScale, breathScale, breathScale);
        }

        if (light) {
            light.position.x = Math.sin(time * 0.15) * 6;
            light.position.z = Math.cos(time * 0.15) * 6;
            const hue = (Math.sin(time * 0.05) * 15 + 30) / 360;
            light.color.setHSL(hue, 0.8, 0.7);
        }

        if (scene && camera && renderer) {
            renderer.render(scene, camera);
        }
    } catch (e) {
        console.error('アニメーションループエラー:', e);
    }
}

// ウィンドウリサイズ時の処理
function onWindowResize() {
    try {
        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        if (camera) {
            camera.aspect = windowWidth / windowHeight;
            camera.updateProjectionMatrix();
        }

        if (renderer) {
            renderer.setSize(windowWidth, windowHeight);
        }
    } catch (e) {
        console.error('リサイズエラー:', e);
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    try {
        // ウィンドウリサイズイベント
        window.addEventListener('resize', onWindowResize);

        // 課題項目クリックイベント (存在する場合のみ設定)
        const challengeItems = document.querySelectorAll('.challenge-item');
        if (challengeItems.length > 0) {
            challengeItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    // アクティブクラスの切り替え
                    item.classList.toggle('active');

                    // トグルアイコンのアニメーション
                    const toggleIcon = item.querySelector('.toggle-icon');
                    if (toggleIcon && typeof gsap !== 'undefined') {
                        gsap.to(toggleIcon, {
                            rotation: item.classList.contains('active') ? 180 : 0,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    }

                    // 解決策の表示/非表示のアニメーション
                    const solution = item.querySelector('.solution');
                    if (solution && typeof gsap !== 'undefined') {
                        if (item.classList.contains('active')) {
                            gsap.to(solution, {
                                height: 'auto',
                                opacity: 1,
                                duration: 0.4,
                                ease: "power2.out"
                            });
                        } else {
                            gsap.to(solution, {
                                height: 0,
                                opacity: 0,
                                duration: 0.3,
                                ease: "power2.in"
                            });
                        }
                    }

                    // クリスタルアニメーションをトリガー
                    animateSolutionReveal(index);
                });
            });
        }

        // カードアイコンのアニメーション (存在する場合のみ設定)
        const cardIcons = document.querySelectorAll('.card-icon, .strength-icon, .example-icon');
        if (cardIcons.length > 0 && typeof gsap !== 'undefined') {
            cardIcons.forEach((icon) => {
                const parent = icon.parentElement;
                if(parent) {
                    parent.addEventListener('mouseenter', () => {
                        gsap.to(icon, {
                            y: -5,
                            scale: 1.1,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    });
                    
                    parent.addEventListener('mouseleave', () => {
                        gsap.to(icon, {
                            y: 0,
                            scale: 1,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    });
                }
            });
        }

        // CTAボタンクリックでコンタクトセクションにスクロール
        const ctaButton = document.getElementById('cta-button');
        if (ctaButton) {
            ctaButton.addEventListener('click', (e) => {
                e.preventDefault(); // デフォルトのアンカー動作を抑制
                const contactSection = document.getElementById('contact');
                if (contactSection && typeof gsap !== 'undefined') {
                    // スムーズスクロールをGSAPで実装
                    gsap.to(window, {
                        duration: 1.2, // 少しゆっくりに
                        scrollTo: {
                            y: contactSection,
                            offsetY: 80 // ヘッダーの高さを考慮
                        },
                        ease: "power3.inOut"
                    });
                }
            });
        }

        // フォームフィールドのアニメーション (存在する場合のみ設定)
        const formFields = document.querySelectorAll('input, textarea');
        if (formFields.length > 0 && typeof gsap !== 'undefined') {
            formFields.forEach(field => {
                field.addEventListener('focus', () => {
                    gsap.to(field, {
                        boxShadow: "0 0 0 3px rgba(58, 110, 232, 0.3)", // 色を調整
                        borderColor: "#3a6ee8",
                        duration: 0.3
                    });
                });

                field.addEventListener('blur', () => {
                    gsap.to(field, {
                        boxShadow: "none",
                        borderColor: "#ddd", // デフォルトの境界線色
                        duration: 0.3
                    });
                });
            });
        }

    } catch (e) {
        console.error('イベントリスナー設定エラー:', e);
    }
}

// GSAPアニメーションの設定
function setupGSAPAnimations() {
    try {
        // GSAPとプラグインが読み込まれているか確認
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof ScrollToPlugin === 'undefined') {
            console.warn('GSAPまたは必要なプラグインが読み込まれていません');
            return;
        }

        // ScrollTriggerとScrollToプラグインの初期化
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        // ヘッダーアニメーション
        gsap.from('.main-header', {
            y: -100,
            opacity: 0,
            duration: 1,
            delay: 0.5,
            ease: 'power3.out'
        });

        // ヒーローセクションの要素アニメーション
        gsap.from('#hero h1', { opacity: 0, y: 30, duration: 1.2, delay: 0.7, ease: 'power3.out' });
        gsap.from('.hero-subtitle', { opacity: 0, y: 30, duration: 1.2, delay: 1.0, ease: 'power3.out' });
        gsap.from('#cta-button', { opacity: 0, y: 30, scale: 0.9, duration: 1, delay: 1.3, ease: 'elastic.out(1, 0.5)' });
        gsap.from('.scroll-guide', { opacity: 0, y: 30, duration: 1, delay: 1.5, ease: 'power3.out' });

        // 各セクションのスクロールアニメーション
        const sections = gsap.utils.toArray('.content-section'); // 対象を .content-section に変更
        sections.forEach((section, index) => {
             if (!section) return; // セクションが存在しない場合はスキップ
             
            const sectionHeader = section.querySelector('.section-header h2');
            const sectionSubtext = section.querySelector('.section-header p');
            const cards = section.querySelectorAll('.pricing-card, .strength-item, .example-card'); // ターゲット要素を見直し
            const icons = section.querySelectorAll('.card-icon, .strength-icon, .example-icon, .pricing-features i'); // アイコンを追加
            const challenges = section.querySelectorAll('.challenge-item');
            const form = section.querySelector('#trial-form');

            // セクションヘッダーのアニメーション
            if (sectionHeader) {
                gsap.from(sectionHeader, {
                    opacity: 0, y: 50, duration: 0.8, scrollTrigger: {
                        trigger: section, start: 'top 85%', toggleActions: 'play none none reset' // リセットを追加
                    }
                });
            }
             if (sectionSubtext) {
                gsap.from(sectionSubtext, {
                    opacity: 0, y: 40, duration: 0.8, delay: 0.2, scrollTrigger: {
                        trigger: section, start: 'top 85%', toggleActions: 'play none none reset'
                    }
                });
            }

            // カードアニメーション
            if (cards.length > 0) {
                gsap.from(cards, {
                    opacity: 0, y: 70, scale: 0.95, duration: 0.8, stagger: 0.15, ease: "power3.out", scrollTrigger: {
                        trigger: section, start: 'top 75%', toggleActions: 'play none none reset'
                    }
                });
            }

            // アイコンアニメーション
            if (icons.length > 0) {
                gsap.from(icons, {
                    opacity: 0, scale: 0, duration: 0.6, delay: 0.3, stagger: 0.1, ease: "back.out(1.7)", scrollTrigger: {
                        trigger: section, start: 'top 75%', toggleActions: 'play none none reset'
                    }
                });
            }

            // チャレンジ項目のアニメーション (存在する場合)
            if (challenges.length > 0) {
                gsap.from(challenges, {
                    opacity: 0, x: -50, duration: 0.8, stagger: 0.15, ease: "power3.out", scrollTrigger: {
                        trigger: section, start: 'top 70%', toggleActions: 'play none none reset'
                    }
                });
            }

            // フォームのアニメーション (存在する場合)
            if (form) {
                gsap.from(form, {
                    opacity: 0, y: 50, duration: 1.0, scrollTrigger: {
                        trigger: section, start: 'top 75%', toggleActions: 'play none none reset'
                    }
                });
                const formGroups = form.querySelectorAll('.form-group, button');
                if (formGroups.length > 0) {
                    gsap.from(formGroups, {
                        opacity: 0, y: 30, duration: 0.6, stagger: 0.1, delay: 0.3, scrollTrigger: {
                            trigger: section, start: 'top 75%', toggleActions: 'play none none reset'
                        }
                    });
                }
            }
        });

        // フッターのアニメーション
        gsap.from('footer', {
            opacity: 0, y: 50, duration: 1.0, scrollTrigger: {
                trigger: 'footer', start: 'top 95%', toggleActions: 'play none none reset'
            }
        });

    } catch (e) {
        console.error('GSAPアニメーション設定エラー:', e);
    }
}

// 課題項目をクリックした際のアニメーション
function animateSolutionReveal(index) {
    try {
        // クリスタルをアニメーション
        if (crystal && typeof gsap !== 'undefined') {
            // 弾むような回転
            gsap.to(crystal.rotation, {
                x: crystal.rotation.x + Math.random() * Math.PI * 0.5 - Math.PI * 0.25, // ランダム方向へ
                y: crystal.rotation.y + Math.random() * Math.PI * 0.5 - Math.PI * 0.25,
                duration: 1.2,
                ease: "elastic.out(1, 0.4)" // 弾性を調整
            });

            // ポップアップするスケール変化
            gsap.to(crystal.scale, {
                x: 1.15,
                y: 1.15,
                z: 1.15,
                duration: 0.4,
                ease: "back.out(2)", // Backイージングで飛び出す感じ
                yoyo: true,
                repeat: 1
            });
        }
    } catch (e) {
        console.error('ソリューション表示アニメーションエラー:', e);
    }
}

// エラーをキャッチして表示する関数
window.addEventListener('error', function(event) {
    console.error('グローバルエラー:', event.message, 'ファイル:', event.filename, '行:', event.lineno, event.error);

    // エラー時もローディング画面を非表示
    hideLoadingScreen();
});

// GSAPプラグイン読み込み確認用 (デバッグ用)
// document.addEventListener('DOMContentLoaded', () => {
//     console.log('GSAP:', typeof gsap);
//     console.log('ScrollTrigger:', typeof ScrollTrigger);
//     console.log('ScrollToPlugin:', typeof ScrollToPlugin);
// });

// 実装例の折り畳み機能
function initExamplesToggle() {
    const toggleBtn = document.getElementById('examples-toggle-btn');
    const additionalExamples = document.getElementById('additional-examples');
    const toggleText = toggleBtn.querySelector('.toggle-text');
    const toggleIcon = toggleBtn.querySelector('.toggle-icon');
    
    if (!toggleBtn || !additionalExamples) return;
    
    let isExpanded = false;
    
    toggleBtn.addEventListener('click', function() {
        // ローディング状態を表示
        toggleBtn.classList.add('loading');
        toggleBtn.disabled = true;
        
        // 少し遅延を入れてスムーズなアニメーションを実現
        setTimeout(() => {
            if (!isExpanded) {
                // 展開
                additionalExamples.classList.add('expanding');
                additionalExamples.classList.add('expanded');
                toggleBtn.setAttribute('aria-expanded', 'true');
                toggleText.textContent = '事例を折り畳む';
                
                // スクロール位置を調整（オプション）
                setTimeout(() => {
                    const rect = toggleBtn.getBoundingClientRect();
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    const targetPosition = scrollTop + rect.top - 100; // 少し上にマージンを取る
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 300);
                
            } else {
                // 折り畳み
                additionalExamples.classList.add('collapsing');
                additionalExamples.classList.remove('expanded');
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleText.textContent = 'さらに6つの事例を見る';
            }
            
            isExpanded = !isExpanded;
            
            // ローディング状態を解除
            toggleBtn.classList.remove('loading');
            toggleBtn.disabled = false;
            
            // アニメーション完了後にヘルパークラスを削除
            setTimeout(() => {
                additionalExamples.classList.remove('expanding', 'collapsing');
            }, 600);
            
        }, 200); // 200ms の遅延
    });
    
    // キーボードアクセシビリティ
    toggleBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleBtn.click();
        }
    });
}
