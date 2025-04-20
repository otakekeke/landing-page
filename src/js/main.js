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

// DOM要素が読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
    try {
        // ローディングアニメーションの表示
        showLoadingScreen();
        
        // Three.jsの初期化
        initThree();
        
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
        
        // ローディング完了後の処理
        window.addEventListener('load', () => {
            setTimeout(() => {
                hideLoadingScreen();
            }, 1000); // 1秒遅延でローディング画面を非表示
        });
    } catch (e) {
        console.error('初期化エラー:', e);
        // エラー時もローディング画面を非表示
        hideLoadingScreen();
    }
});

// ローディング画面の表示
function showLoadingScreen() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.classList.remove('fade-out');
    }
}

// ローディング画面の非表示
function hideLoadingScreen() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.classList.add('fade-out');
    }
}

// ナビゲーションメニューの設定
function setupNavigation() {
    try {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.main-nav');
        
        if (menuToggle && nav) {
            // モバイルメニュートグルボタンのクリックイベント
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
            
            // ナビゲーションリンクのクリックでメニューを閉じる
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    nav.classList.remove('active');
                });
            });
            
            // スクロール時のヘッダー表示/非表示の制御
            let lastScrollTop = 0;
            const header = document.querySelector('.main-header');
            
            window.addEventListener('scroll', () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // スクロール方向を検出
                if (scrollTop > lastScrollTop && scrollTop > 150) {
                    // 下にスクロール
                    header.classList.add('hide');
                } else {
                    // 上にスクロール
                    header.classList.remove('hide');
                }
                
                lastScrollTop = scrollTop;
            });
        }
    } catch (e) {
        console.error('ナビゲーション設定エラー:', e);
    }
}

// トップに戻るボタンの設定
function setupBackToTopButton() {
    try {
        const backToTopButton = document.getElementById('back-to-top');
        
        if (backToTopButton) {
            // スクロール位置に応じてボタン表示/非表示
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
            });
            
            // クリック時にページトップにスクロール
            backToTopButton.addEventListener('click', () => {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: 0
                    },
                    ease: "power3.inOut"
                });
            });
        }
    } catch (e) {
        console.error('トップに戻るボタン設定エラー:', e);
    }
}

// スクロールガイドの設定
function setupScrollGuide() {
    try {
        const scrollGuide = document.querySelector('.scroll-guide');
        const serviceSection = document.getElementById('service');
        
        if (scrollGuide && serviceSection) {
            // クリック時にサービスセクションまでスクロール
            scrollGuide.addEventListener('click', () => {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: {
                        y: serviceSection,
                        offsetY: 50
                    },
                    ease: "power3.inOut"
                });
            });
            
            // スクロール位置に応じてフェードアウト
            window.addEventListener('scroll', () => {
                const scrollPosition = window.pageYOffset;
                const threshold = window.innerHeight * 0.3;
                
                if (scrollPosition > threshold) {
                    gsap.to(scrollGuide, {
                        opacity: 0,
                        duration: 0.3
                    });
                } else {
                    gsap.to(scrollGuide, {
                        opacity: 0.7,
                        duration: 0.3
                    });
                }
            });
        }
    } catch (e) {
        console.error('スクロールガイド設定エラー:', e);
    }
}

// Three.jsの初期化
function initThree() {
    console.log('Three.jsの初期化を開始します');
    
    // シーンの作成
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // 背景色を設定
    
    // カメラの作成
    camera = new THREE.PerspectiveCamera(50, windowWidth / windowHeight, 0.1, 1000); // FOVを少し狭める
    camera.position.set(0, 1, 6); // カメラ位置を調整
    
    // WebGLの対応を確認
    if (!checkWebGLSupport()) {
        showWebGLError();
        return;
    }
    
    // レンダラーの作成
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('webgl-canvas'),
            antialias: true,
            alpha: true // alpha: false にして背景色を有効にする場合はCSS側で透明度を調整
        });
        renderer.setSize(windowWidth, windowHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        // renderer.setClearColor(0xffffff, 1); // シーンの背景色で管理するためコメントアウト
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping; // よりリアルなトーンマッピング
        renderer.toneMappingExposure = 1.0;
    } catch (e) {
        console.error('レンダラーの作成エラー:', e);
        return;
    }
    
    // OrbitControlsの設定
    try {
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05; // ダンピングを少し強く
        controls.enableZoom = true; // ズームを有効に
        controls.minDistance = 3; // 最小ズーム距離
        controls.maxDistance = 10; // 最大ズーム距離
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.2; // 自動回転を遅く
        
        // 視点制限を調整
        controls.minPolarAngle = Math.PI / 4;    // 上からの視点を少し緩和
        controls.maxPolarAngle = Math.PI / 1.5;  // 下からの視点を少し緩和
    } catch (e) {
        console.error('OrbitControlsの設定エラー:', e);
    }
    
    // ライトの設定
    setupLights();
    
    // クリスタルオブジェクトの作成
    createCrystal();
    
    // パーティクルシステムの作成（無効化）
    // createParticleSystem();
    
    // アニメーションの開始
    animate();
    
    console.log('Three.jsの初期化が完了しました');
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

// パーティクルシステムの作成 - 無効化
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
