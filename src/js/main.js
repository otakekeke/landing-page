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

// DOM要素が読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
    try {
        // ローディングアニメーションの表示
        showLoadingScreen();
        
        // デバイス固有の初期化
        setupDeviceOptimizations();
        
        // Three.jsの初期化
        if (enableComplexAnimations) {
        initThree();
        }
        
        // イベントリスナーの設定
        setupEventListeners();
        
        // GSAPアニメーションの設定
        setupGSAPAnimations();
        
        // ナビゲーションメニューの設定
        setupNavigation();
        
        // トップに戻るボタンの設定
        setupBackToTopButton();
        
        // スクロールガイドの設定
        setupScrollGuide();
        
        // フォームの設定
        setupFormValidation();
        
        // アクセシビリティの設定
        setupAccessibility();
        
        // ローディング完了後の処理
        window.addEventListener('load', () => {
            setTimeout(() => {
                hideLoadingScreen();
            }, isMobile ? 500 : 1000);
        });

        // 実装例の折り畳み機能の初期化
        initExamplesToggle();
        
        // フォーム送信の処理
        initFormSubmission();

        // 費用概算計算ツールの初期化
        initCostCalculator();
    } catch (e) {
        console.error('初期化エラー:', e);
        // エラー時もローディング画面を非表示
        hideLoadingScreen();
    }
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

// ローディング画面の表示
function showLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.opacity = '1';
        loadingOverlay.classList.remove('fade-out');
        
        // プログレスバーアニメーションを確実に開始
        const progressBar = loadingOverlay.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.animation = 'progress 2s ease-in-out infinite';
        }
        
        // ローダーアニメーションを確実に開始
        const loader = loadingOverlay.querySelector('.loader');
        if (loader) {
            loader.style.animation = 'spin 1s linear infinite';
        }
        
        // 文字のフェードイン・アウトアニメーション
        const loadingText = loadingOverlay.querySelector('.loading-text');
        const loadingSubtitle = loadingOverlay.querySelector('.loading-subtitle');
        if (loadingText) {
            loadingText.style.animation = 'fadeInOut 3s ease-in-out infinite';
        }
        if (loadingSubtitle) {
            loadingSubtitle.style.animation = 'fadeInOut 3s ease-in-out infinite 0.5s';
        }
        
        console.log('ローディング画面を表示しました');
    }
}

// ローディング画面の非表示
function hideLoadingScreen() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        console.log('ローディング画面を非表示にします');
        
        // フェードアウトアニメーションを開始
        loadingOverlay.classList.add('fade-out');
        
        // アニメーション完了後に非表示
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            
            // メインコンテンツを表示
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.style.opacity = '1';
                mainContent.style.visibility = 'visible';
            }
            
            console.log('ローディング完了');
        }, 500);
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

        // 課題チェックボックスの状態変更
        document.addEventListener('change', (e) => {
            if (e.target.name === 'current-issues') {
                updateIssueOptionAppearance(e.target.closest('.issue-option'), e.target.checked);
            }
            
            if (e.target.name === 'meeting-type') {
                updateMeetingOptionAppearance(e.target.closest('.meeting-option'), e.target.checked);
            }
        });

        // 計算ボタンの処理
        const calculateButton = document.querySelector('.calculate-btn');
        if (calculateButton) {
            calculateButton.addEventListener('click', () => {
                if (validateCurrentStep()) {
                    performCalculation();
                }
            });
        }

        function updateMeetingOptionAppearance(option, isChecked) {
            if (isChecked) {
                option.classList.add('checked');
                // 他のオプションのチェック状態をリセット
                document.querySelectorAll('.meeting-option').forEach(opt => {
                    if (opt !== option) {
                        opt.classList.remove('checked');
                    }
                });
            } else {
                option.classList.remove('checked');
            }
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
    
    if (!toggleBtn || !additionalExamples) return;
    
    toggleBtn.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            // 折り畳む
            this.setAttribute('aria-expanded', 'false');
            additionalExamples.setAttribute('aria-hidden', 'true');
            additionalExamples.classList.remove('show');
            toggleText.textContent = 'さらに6つの事例を見る';
        } else {
            // 展開する
            this.setAttribute('aria-expanded', 'true');
            additionalExamples.setAttribute('aria-hidden', 'false');
            additionalExamples.classList.add('show');
            toggleText.textContent = '事例を閉じる';
        }
    });
}

// フォーム送信の処理
function initFormSubmission() {
    // フォーム送信の処理を実装するコードをここに追加
}

// 費用概算計算ツール - シンプル版
function initCostCalculator() {
    console.log("initCostCalculator CALLED"); 
    const calculatorForm = document.getElementById('cost-calculator-form');
    const resultsSection = document.getElementById('calculation-results');
    const placeholderSection = document.getElementById('calculation-placeholder');
    const recalculateBtn = document.getElementById('recalculate-btn');
    const downloadBtn = document.getElementById('download-results');
    
    let calculationResults = null;

    if (!calculatorForm) {
        console.error('Calculator form not found!');
        return; 
    }

    loadSavedCalculation();
    
    function loadSavedCalculation() {
        const savedResults = localStorage.getItem('calculationResults');
        if (savedResults) {
            calculationResults = JSON.parse(savedResults);
            showResults();
            updateContactFormWithResults();
        }
    }

    function saveCalculationResults(results) {
        calculationResults = results;
        localStorage.setItem('calculationResults', JSON.stringify(results));
        updateContactFormWithResults();
    }

    function updateContactFormWithResults() {
        const summaryArea = document.getElementById('calculation-summary-area');
        const summaryContent = document.getElementById('calculation-summary-content');
        const hiddenField = document.getElementById('simulation-data');
        
        if (calculationResults && summaryArea && summaryContent && hiddenField) {
            summaryContent.innerHTML = generateSummaryHTML(calculationResults);
            summaryArea.style.display = 'block';
            hiddenField.value = JSON.stringify({
                timestamp: new Date().toISOString(),
                ...calculationResults
            });
            setTimeout(() => {
                summaryArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        }
    }

    function generateSummaryHTML(results) {
        const levelInfo = getLevelInfo(results.selectedLevel);
        return `
            <div class="summary-grid">
                <div class="summary-item highlight">
                    <div class="label">月額料金</div>
                    <div class="value">¥${results.monthlyCost.toLocaleString()}</div>
                </div>
                <div class="summary-item">
                    <div class="label">削減時間</div>
                    <div class="value">${results.netSavedHours}時間/月</div>
                </div>
                <div class="summary-item">
                    <div class="label">月間削減効果</div>
                    <div class="value">¥${results.totalMonthlyValue.toLocaleString()}</div>
                </div>
                <div class="summary-item">
                    <div class="label">年間削減効果</div>
                    <div class="value">¥${results.annualSavings.toLocaleString()}</div>
                </div>
            </div>
            <div class="summary-package">
                <div class="package-icon"><i class="fas fa-robot"></i></div>
                <div class="package-details">
                    <h4>AIレベル ${results.selectedLevel} - ${levelInfo.name}</h4>
                    <p>${levelInfo.description}</p>
                </div>
            </div>
        `;
    }

    document.addEventListener('change', (e) => {
        if (e.target.name === 'ai-level') {
            document.querySelectorAll('.ai-level-option').forEach(option => {
                option.classList.remove('selected');
            });
            e.target.closest('.ai-level-option').classList.add('selected');
        }
        if (e.target.name === 'meeting-type') {
            document.querySelectorAll('.meeting-option').forEach(opt => opt.classList.remove('checked'));
            e.target.closest('.meeting-option').classList.add('checked');
        }
    });

    const calculateButton = calculatorForm.querySelector('.calculate-btn');
    if (calculateButton) {
        calculateButton.addEventListener('click', (event) => {
            event.preventDefault(); 
            console.log('Calculate button clicked.'); 
            if (validateForm()) {
                console.log('Form is valid, performing calculation...');
                performCalculation();
            } else {
                console.log('Form is invalid.'); 
            }
        });
    } else {
        console.error('Calculate button not found within the form!');
    }
    
    function validateForm() {
        const currentHoursInput = document.getElementById('current-hours');
        const hourlyCostInput = document.getElementById('hourly-cost');
        const selectedLevelRadio = document.querySelector('input[name="ai-level"]:checked');
        
        clearAllErrors();
        let isValid = true;

        if (!currentHoursInput.value || parseInt(currentHoursInput.value) < 1) {
            showFieldError(currentHoursInput, '作業時間を入力してください (1時間以上)');
            isValid = false;
        }
        if (!hourlyCostInput.value || parseInt(hourlyCostInput.value) < 1000) {
            showFieldError(hourlyCostInput, '適切な時給を入力してください (1000円以上)');
            isValid = false;
        }
        if (!selectedLevelRadio) {
            showNotification('AIレベルを選択してください', 'warning');
            const aiLevelOptions = document.querySelector('.ai-level-options');
            if(aiLevelOptions) {
                aiLevelOptions.style.border = '2px dashed red'; 
                setTimeout(() => { if(aiLevelOptions) aiLevelOptions.style.border = 'none'; }, 3000);
            }
            isValid = false;
        }
        console.log(`Validation result: ${isValid}`);
        return isValid;
    }

    function clearAllErrors() {
        document.querySelectorAll('.field-error').forEach(error => error.remove());
        const aiLevelOptions = document.querySelector('.ai-level-options');
        if(aiLevelOptions) aiLevelOptions.style.border = 'none';
    }

    function performCalculation() {
        console.log('Inside performCalculation');
        const currentHours = parseInt(document.getElementById('current-hours').value);
        const hourlyCost = parseInt(document.getElementById('hourly-cost').value);
        const selectedLevel = document.querySelector('input[name="ai-level"]:checked').value;
        
        const levelConfigs = {
            '1': { reductionRate: 0.3, newWorkRate: 0.1, riskReductionFactor: 0.05, name: '少しだけお任せ', description: '記録の一部をAIが手伝います' },
            '2': { reductionRate: 0.5, newWorkRate: 0.15, riskReductionFactor: 0.1, name: '半分くらいお任せ', description: '記録と管理をAIが自動化' },
            '3': { reductionRate: 0.8, newWorkRate: 0.05, riskReductionFactor: 0.2, name: 'ほぼ全部お任せ', description: '全ての作業をAIが自動実行' }
        };
        
        const config = levelConfigs[selectedLevel];
        const savedHours = Math.round(currentHours * config.reductionRate);
        const newWorkHours = Math.round(currentHours * config.newWorkRate);
        const netSavedHours = savedHours - newWorkHours;
        const laborSavingsValue = netSavedHours * hourlyCost;
        // リスク削減価値は、削減された労務価値に対する割合として計算
        const riskReductionValue = Math.round(laborSavingsValue * config.riskReductionFactor);
        const totalMonthlyValue = laborSavingsValue + riskReductionValue;
        const annualSavings = totalMonthlyValue * 12;
        const monthlyCost = Math.round(totalMonthlyValue * 0.33); // 価値の1/3を費用とする
        const roiPercentage = monthlyCost > 0 ? Math.round(((totalMonthlyValue - monthlyCost) / monthlyCost) * 100) : (totalMonthlyValue > 0 ? '∞' : 0);

        calculationResults = {
            currentHours, hourlyCost, selectedLevel, savedHours, newWorkHours, netSavedHours,
            monthlySavings: Math.round(laborSavingsValue), // 以前のmonthlySavingsは労務削減価値のみだったため名称変更
            riskReductionValue, // riskReductionValueをそのまま使用
            totalMonthlyValue: Math.round(totalMonthlyValue),
            annualSavings: Math.round(annualSavings),
            monthlyCost,
            roiPercentage,
            calculationDate: new Date().toLocaleDateString('ja-JP')
        };
        
        saveCalculationResults(calculationResults);
        showResults();
    }

    function showResults() {
        if (!calculationResults) return;
        if(placeholderSection) placeholderSection.style.display = 'none';
        if(resultsSection) resultsSection.style.display = 'block';
        
        animateCountUp(document.getElementById('monthly-cost'), calculationResults.monthlyCost);
        // 「月間削減効果」の表示箇所IDが monthly-savings であると想定
        animateCountUp(document.getElementById('monthly-savings'), calculationResults.totalMonthlyValue);
        animateCountUp(document.getElementById('annual-savings'), calculationResults.annualSavings);
        document.getElementById('roi-percentage').textContent = calculationResults.roiPercentage;
        
        const levelInfo = getLevelInfo(calculationResults.selectedLevel);
        document.getElementById('package-summary').innerHTML = `
            <div class="package-summary">
                <div class="package-icon"><i class="fas fa-robot"></i></div>
                <div class="package-details">
                    <h5>AIレベル ${calculationResults.selectedLevel} - ${levelInfo.name}</h5>
                    <p>${levelInfo.description}</p>
                </div>
            </div>
        `;
        
        document.getElementById('efficiency-breakdown').innerHTML = `
            <div class="efficiency-item">
                <div class="effect-name">作業時間削減</div>
                <div class="effect-value">${calculationResults.savedHours}時間/月削減<br>¥${calculationResults.monthlySavings.toLocaleString()}/月</div>
            </div>
            <div class="efficiency-item">
                <div class="effect-name">新規作業時間</div>
                <div class="effect-value">${calculationResults.newWorkHours}時間/月追加<br>システム操作・確認作業</div>
            </div>
            <div class="efficiency-item">
                <div class="effect-name">リスク軽減効果</div>
                <div class="effect-value">¥${calculationResults.riskReductionValue.toLocaleString()}/月<br>ミス防止・品質向上</div>
            </div>
        `;
        if(resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function getLevelInfo(level) {
        const levels = {
            '1': { name: '少しだけお任せ', description: '記録の一部をAIが手伝います' },
            '2': { name: '半分くらいお任せ', description: '記録と管理をAIが自動化' },
            '3': { name: 'ほぼ全部お任せ', description: '全ての作業をAIが自動実行' }
        };
        return levels[level] || { name: '不明', description: '選択されていません' };
    }

    if (recalculateBtn) {
        recalculateBtn.addEventListener('click', () => {
            if(resultsSection) resultsSection.style.display = 'none';
            if(placeholderSection) placeholderSection.style.display = 'block';
            if(calculatorForm) calculatorForm.reset();
            document.querySelectorAll('.ai-level-option.selected').forEach(option => option.classList.remove('selected'));
            localStorage.removeItem('calculationResults');
            calculationResults = null;
            const summaryArea = document.getElementById('calculation-summary-area');
            if (summaryArea) summaryArea.style.display = 'none';
            clearAllErrors(); // フォームリセット時にエラー表示もクリア
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', generateJapanesePDF);
    }

    function generateJapanesePDF() {
        if (!calculationResults) return;
        
        showNotification('PDFを生成中です...', 'info');
        
        // Create a temporary HTML element with the report content
        const reportContainer = document.createElement('div');
        reportContainer.style.cssText = `
            position: absolute;
            left: -9999px;
            top: -9999px;
            width: 794px;
            background: white;
            font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #000;
            padding: 40px;
            box-sizing: border-box;
        `;
        
        const levelInfoPdf = getLevelInfo(calculationResults.selectedLevel);
        
        reportContainer.innerHTML = `
            <div style="background: #3b82f6; color: white; padding: 20px; margin: -40px -40px 30px -40px; position: relative;">
                <h1 style="margin: 0; font-size: 18px; font-weight: bold;">AI介護システム導入効果 分析レポート</h1>
                <p style="margin: 5px 0 0 0; font-size: 12px;">嶽ノ子 FastAI システム</p>
                <div style="position: absolute; top: 20px; right: 20px; text-align: right; font-size: 9px;">
                    <div>Email: takenoko.ai.care@gmail.com</div>
                    <div>Tel: 070-1383-4420</div>
                    <div>対応時間: 平日・土曜 9:00-18:00</div>
                </div>
            </div>
            
            <div style="color: #666; font-size: 9px; margin-bottom: 20px;">
                レポート作成日: ${calculationResults.calculationDate}
            </div>
            
            <div style="background: #f0f9ff; border: 2px solid #3b82f6; padding: 20px; margin-bottom: 30px;">
                <h2 style="margin: 0 0 15px 0; font-size: 14px; color: #000;">導入効果 概要</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 11px;">
                    <div>
                        <div>月額料金: ¥${calculationResults.monthlyCost.toLocaleString()}</div>
                        <div>月間削減効果: ¥${calculationResults.totalMonthlyValue.toLocaleString()}</div>
                        <div>投資回収率: ${calculationResults.roiPercentage}%</div>
                    </div>
                    <div>
                        <div>年間削減効果: ¥${calculationResults.annualSavings.toLocaleString()}</div>
                        <div>選択AIレベル: レベル${calculationResults.selectedLevel} (${levelInfoPdf.name})</div>
                        <div>正味削減時間: ${calculationResults.netSavedHours}時間/月</div>
                    </div>
                </div>
            </div>
            
            <h2 style="font-size: 13px; margin: 30px 0 10px 0; color: #000;">詳細分析</h2>
            
            <h3 style="font-size: 11px; margin: 20px 0 8px 0; color: #000;">【入力条件】</h3>
            <div style="margin-left: 15px; font-size: 10px;">
                <div style="margin-bottom: 6px;">現在の作業時間: ${calculationResults.currentHours}時間/月</div>
                <div style="margin-bottom: 6px;">時間単価: ¥${calculationResults.hourlyCost.toLocaleString()}/時間</div>
                <div style="margin-bottom: 15px;">AIレベル: レベル${calculationResults.selectedLevel} (${levelInfoPdf.name})</div>
            </div>
            
            <h3 style="font-size: 11px; margin: 20px 0 8px 0; color: #000;">【効果詳細】</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #3b82f6; color: white;">
                        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">項目</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">時間/月</th>
                        <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">金額/月</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="background: #f8fafc;">
                        <td style="padding: 8px; border: 1px solid #ddd;">作業時間削減(効果)</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${calculationResults.savedHours}時間</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">¥${calculationResults.monthlySavings.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">新規作業時間(コスト)</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${calculationResults.newWorkHours}時間</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">-</td>
                    </tr>
                    <tr style="background: #f8fafc;">
                        <td style="padding: 8px; border: 1px solid #ddd;">正味作業時間削減</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">${calculationResults.netSavedHours}時間</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">¥${(calculationResults.monthlySavings - (calculationResults.newWorkHours * calculationResults.hourlyCost)).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;">リスク軽減効果</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">-</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">¥${calculationResults.riskReductionValue.toLocaleString()}</td>
                    </tr>
                    <tr style="background: #f8fafc;">
                        <td style="padding: 8px; border: 1px solid #ddd;">総月間経済効果</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">-</td>
                        <td style="padding: 8px; border: 1px solid #ddd;">¥${calculationResults.totalMonthlyValue.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            
            <h3 style="font-size: 11px; margin: 20px 0 8px 0; color: #000;">【投資回収分析】</h3>
            <div style="margin-left: 15px; font-size: 10px;">
                <div style="margin-bottom: 6px;">• 投資回収期間: ${(() => {
                    const netMonthlyBenefit = calculationResults.totalMonthlyValue - calculationResults.monthlyCost;
                    return netMonthlyBenefit > 0 ? Math.ceil(calculationResults.monthlyCost / netMonthlyBenefit) : 'N/A';
                })()}ヶ月</div>
                <div style="margin-bottom: 6px;">• 3年間累計純効果: ¥${((calculationResults.totalMonthlyValue * 36) - (calculationResults.monthlyCost * 36)).toLocaleString()}</div>
                <div style="margin-bottom: 15px;">• AIによる品質向上とミス削減効果を含む</div>
            </div>
            
            <h3 style="font-size: 11px; margin: 20px 0 8px 0; color: #000;">【注意事項】</h3>
            <div style="margin-left: 15px; font-size: 9px;">
                <div style="margin-bottom: 5px;">• この試算は入力された条件に基づく概算です</div>
                <div style="margin-bottom: 5px;">• 実際の導入効果は業務内容や運用方法により変動します</div>
                <div style="margin-bottom: 5px;">• 詳細な見積もりについては、お気軽にお問い合わせください</div>
            </div>
            
            <div style="background: #f8fafc; margin-top: 40px; padding: 15px; font-size: 8px; color: #666; border-top: 1px solid #e5e7eb;">
                <div>このレポートは FastAI 料金シミュレーターにより生成されました</div>
                <div>詳細な相談をご希望の場合: takenoko.ai.care@gmail.com</div>
                <div>© 2024 嶽ノ子 - All rights reserved</div>
            </div>
        `;
        
        document.body.appendChild(reportContainer);
        
        // Use html2canvas to render the HTML content with Japanese text
        html2canvas(reportContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            width: 794,
            height: Math.max(1123, reportContainer.scrollHeight + 80)
        }).then(canvas => {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: 'a4'
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 595;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            const fileName = `FastAI導入効果分析_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            
            // Clean up
            document.body.removeChild(reportContainer);
            showNotification('分析レポートをダウンロードしました', 'success');
            
        }).catch(error => {
            console.error('PDF generation failed:', error);
            document.body.removeChild(reportContainer);
            showNotification('PDF生成中にエラーが発生しました', 'warning');
        });
    }

    function animateCountUp(element, targetValue) {
        if(!element) return;
        const startValue = 0;
        const duration = 1500; 
        let startTime = null;
        function updateCounter(currentTime) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const currentValue = Math.floor(progress * targetValue);
            element.textContent = currentValue.toLocaleString();
            if (progress < 1) requestAnimationFrame(updateCounter);
        }
        requestAnimationFrame(updateCounter);
    }

    function showFieldError(field, message) {
        if(!field) return;
        // Remove existing error first
        const parent = field.parentNode;
        const existingError = parent.querySelector('.field-error');
        if (existingError) existingError.remove();

        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        parent.appendChild(errorElement);
        field.focus();
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `<div class="notification-content"><i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i><span>${message}</span></div>`;
        const styles = { position: 'fixed', top: '20px', right: '20px', zIndex: '10000', padding: '1rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', backgroundColor: type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6', color: 'white', fontWeight: '500', maxWidth: '400px', animation: 'slideInRight 0.3s ease' };
        Object.assign(notification.style, styles);
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 300);
        }, 3000);
    }
}
