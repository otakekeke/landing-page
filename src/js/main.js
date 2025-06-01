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
    const form = document.getElementById('cost-calculator-form');
    const steps = document.querySelectorAll('.calculator-step');
    const nextButtons = document.querySelectorAll('.next-step-btn');
    const prevButtons = document.querySelectorAll('.prev-step-btn');
    const calculateButton = document.querySelector('.calculate-btn');
    const recalculateButton = document.getElementById('recalculate-btn');
    const issueOptions = document.querySelectorAll('.issue-option');
    const packageOptions = document.querySelectorAll('.package-option');
    
    let currentStep = 1;
    let calculationData = {};

    // パッケージ設定
    const packageConfigs = {
        basic: {
            name: 'ベーシック',
            icon: 'fas fa-play',
            description: '音声記録、基本的な業務効率化',
            basePrice: 45000,
            laborReduction: 0.4, // 40%の労務削減
            riskReduction: 15000,
            benefits: [
                '記録作業を大幅削減',
                '簡単操作で即日導入',
                '基本的なAI機能'
            ]
        },
        standard: {
            name: 'スタンダード',
            icon: 'fas fa-star',
            description: '記録＋管理業務の自動化',
            basePrice: 75000,
            laborReduction: 0.6, // 60%の労務削減
            riskReduction: 30000,
            benefits: [
                '総業務時間を大幅削減',
                '管理機能も充実',
                '中級AI機能セット'
            ]
        },
        premium: {
            name: 'プレミアム',
            icon: 'fas fa-crown',
            description: '全業務AI化＋予測・分析機能',
            basePrice: 120000,
            laborReduction: 0.8, // 80%の労務削減
            riskReduction: 50000,
            benefits: [
                '総業務時間を最大限削減',
                'AI予測機能でリスク軽減',
                '最上位AI機能フルセット'
            ]
        }
    };

    // ステップナビゲーション
    function showStep(stepNumber) {
        steps.forEach((step, index) => {
            if (index + 1 === stepNumber) {
                step.style.display = 'block';
                step.style.animation = 'fadeInUp 0.6s ease-out';
            } else {
                step.style.display = 'none';
            }
        });
        currentStep = stepNumber;
    }

    // 次のステップへ
    nextButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const nextStep = parseInt(button.dataset.next);
            
            if (validateCurrentStep()) {
                showStep(nextStep);
            }
        });
    });

    // 前のステップへ
    prevButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const prevStep = parseInt(button.dataset.prev);
            showStep(prevStep);
        });
    });

    // バリデーション
    function validateCurrentStep() {
        const currentStepElement = document.querySelector(`[data-step="${currentStep}"]`);
        const requiredFields = currentStepElement.querySelectorAll('input[required], select[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (field.type === 'radio') {
                const radioGroup = currentStepElement.querySelectorAll(`input[name="${field.name}"]`);
                const isGroupChecked = Array.from(radioGroup).some(radio => radio.checked);
                if (!isGroupChecked) {
                    isValid = false;
                    showNotification('AI活用レベルを選択してください', 'error');
                }
            } else if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
                showFieldError(field, '必須項目です');
            } else {
                field.style.borderColor = '#e5e7eb';
                clearFieldError(field);
            }
        });

        return isValid;
    }

    // チェックボックスの処理
    issueOptions.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        
        option.addEventListener('click', (e) => {
            if (e.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked;
            }
            updateIssueOptionAppearance(option, checkbox.checked);
        });

        checkbox.addEventListener('change', (e) => {
            updateIssueOptionAppearance(option, e.target.checked);
        });
    });

    function updateIssueOptionAppearance(option, isChecked) {
        if (isChecked) {
            option.classList.add('checked');
        } else {
            option.classList.remove('checked');
        }
    }

    // 計算実行
    calculateButton.addEventListener('click', () => {
        if (validateCurrentStep()) {
            collectFormData();
            performCalculation();
            showResults();
        }
    });

    // 再計算
    recalculateButton?.addEventListener('click', () => {
        showStep(1);
        hideResults();
        // フォームリセット
        form.reset();
        issueOptions.forEach(option => {
            option.classList.remove('checked');
        });
    });

    // フォームデータ収集
    function collectFormData() {
        const formData = new FormData(form);
        calculationData = {};

        // 基本情報
        calculationData.staffCount = parseInt(formData.get('staff-count')) || 0;
        calculationData.avgHourlyWage = parseInt(formData.get('avg-hourly-wage')) || 0;

        // 選択された課題
        calculationData.selectedIssues = formData.getAll('current-issues');

        // 選択されたパッケージ
        calculationData.selectedPackage = formData.get('ai-package');
    }

    // 計算実行
    function performCalculation() {
        const packageConfig = packageConfigs[calculationData.selectedPackage];
        if (!packageConfig) return;

        // 課題の数に応じて基本工数を推定
        const issueMultiplier = Math.max(1, calculationData.selectedIssues.length);
        const estimatedMonthlyHours = calculationData.staffCount * 40 * issueMultiplier * 0.3; // スタッフ1人あたり月間12時間の改善可能業務を想定

        // 削減効果計算
        const laborSavingHours = estimatedMonthlyHours * packageConfig.laborReduction;
        const laborSavingValue = laborSavingHours * calculationData.avgHourlyWage;
        const totalValue = laborSavingValue + packageConfig.riskReduction;

        // 月額料金計算（簡素化）
        const alpha = 0.33;
        const monthlyCost = Math.round(totalValue * alpha + packageConfig.basePrice * 0.3);

        // 計算結果を保存
        calculationData.results = {
            packageConfig: packageConfig,
            laborSavingHours: Math.round(laborSavingHours),
            laborSavingValue: Math.round(laborSavingValue),
            riskReduction: packageConfig.riskReduction,
            totalValue: Math.round(totalValue),
            monthlyCost: monthlyCost,
            annualSavings: Math.round(totalValue * 12),
            roiPercentage: totalValue > 0 ? Math.round((totalValue / monthlyCost) * 100) : 0
        };
    }

    // 結果表示
    function showResults() {
        const results = calculationData.results;
        const resultsContainer = document.getElementById('calculation-results');
        const placeholder = document.getElementById('calculation-placeholder');

        // メイン数値更新
        document.getElementById('monthly-cost').textContent = results.monthlyCost.toLocaleString();
        document.getElementById('monthly-savings').textContent = `¥${results.totalValue.toLocaleString()}`;
        document.getElementById('annual-savings').textContent = results.annualSavings.toLocaleString();
        document.getElementById('roi-percentage').textContent = `${results.roiPercentage}%`;

        // 選択されたパッケージ情報表示
        const packageSummary = document.getElementById('package-summary');
        packageSummary.innerHTML = `
            <div class="package-icon">
                <i class="${results.packageConfig.icon}"></i>
            </div>
            <div class="package-details">
                <h5>${results.packageConfig.name}プラン</h5>
                <p>${results.packageConfig.description}</p>
            </div>
        `;

        // 効果詳細表示
        const efficiencyBreakdown = document.getElementById('efficiency-breakdown');
        efficiencyBreakdown.innerHTML = `
            <div class="efficiency-item">
                <span class="effect-name">月間業務時間削減</span>
                <span class="effect-value">${results.laborSavingHours}時間</span>
            </div>
            <div class="efficiency-item">
                <span class="effect-name">人件費削減効果</span>
                <span class="effect-value">¥${results.laborSavingValue.toLocaleString()}</span>
            </div>
            <div class="efficiency-item">
                <span class="effect-name">リスク軽減価値</span>
                <span class="effect-value">¥${results.riskReduction.toLocaleString()}</span>
            </div>
            <div class="efficiency-item">
                <span class="effect-name">総削減効果</span>
                <span class="effect-value">¥${results.totalValue.toLocaleString()}</span>
            </div>
        `;

        // 結果表示
        placeholder.style.display = 'none';
        resultsContainer.style.display = 'block';
        
        // アニメーション
        animateCountUp(document.getElementById('monthly-cost'), results.monthlyCost);
        animateCountUp(document.getElementById('annual-savings'), results.annualSavings);
    }

    // 結果非表示
    function hideResults() {
        const resultsContainer = document.getElementById('calculation-results');
        const placeholder = document.getElementById('calculation-placeholder');
        
        resultsContainer.style.display = 'none';
        placeholder.style.display = 'flex';
    }

    // カウントアップアニメーション
    function animateCountUp(element, targetValue) {
        const startValue = 0;
        const duration = 1500;
        const startTime = Date.now();

        function updateCounter() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
            
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }

        requestAnimationFrame(updateCounter);
    }

    // フィールドエラー処理
    function showFieldError(field, message) {
        clearFieldError(field);
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorElement);
    }

    function clearFieldError(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // 通知表示
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideInRight 0.3s ease-out;
        `;
        
        if (type === 'error') {
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // PDFダウンロード機能（簡素化）
    document.getElementById('download-results')?.addEventListener('click', () => {
        if (!calculationData.results) return;
        
        const results = calculationData.results;
        const reportContent = `
嶽ノ子 AI介護システム - 料金シミュレーション結果

=== 基本情報 ===
スタッフ数: ${calculationData.staffCount}名
平均時給: ¥${calculationData.avgHourlyWage.toLocaleString()}
選択された課題: ${calculationData.selectedIssues.join(', ')}

=== 選択プラン ===
${results.packageConfig.name}プラン
${results.packageConfig.description}

=== 計算結果 ===
月額料金: ¥${results.monthlyCost.toLocaleString()}
月間削減効果: ¥${results.totalValue.toLocaleString()}
年間削減効果: ¥${results.annualSavings.toLocaleString()}
投資回収率: ${results.roiPercentage}%

=== 削減効果詳細 ===
業務時間削減: ${results.laborSavingHours}時間/月
人件費削減: ¥${results.laborSavingValue.toLocaleString()}/月
リスク軽減価値: ¥${results.riskReduction.toLocaleString()}/月

※ この概算は入力いただいた情報に基づく試算です。
※ 詳細な見積もりについては、お問い合わせください。

生成日時: ${new Date().toLocaleString('ja-JP')}
        `;

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `嶽ノ子_料金シミュレーション_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showNotification('結果をダウンロードしました', 'info');
    });

    // 初期化
    showStep(1);
}
