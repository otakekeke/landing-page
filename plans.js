// 嶽ノ子 導入例ページ — ペルソナデータ＋カード生成
(function() {
  'use strict';

  const personas = {
    lite: [
      { name: '田中 美咲', role: '管理者', facility: '小規模デイサービス', staff: 15, users: 25, icon: '👩‍💼',
        problem: 'シフト希望の回収・調整に毎月かなり時間がかかり、夜遅くまで作業していた',
        app: 'シフト希望回収＋シフト表自動作成アプリ',
        features: ['スタッフがスマホで希望を入力', '条件を満たす形でシフト案を自動生成', 'Excel出力・印刷にも対応'],
        time: '月15時間', cost: '月3万円',
        story: '導入後は、スタッフがスマホで希望を入力するだけで、条件を満たすシフト案が自動生成されるように。夜遅くまで作業することがなくなり、家族との時間が増えました。' },
      { name: '佐藤 健一', role: '事務職', facility: '小規模グループホーム', staff: 12, users: 18, icon: '📋',
        problem: '利用者情報の管理が紙とExcelで二重管理になっており、転記ミスが頻発していた',
        app: '利用者情報一元管理アプリ',
        features: ['利用者情報の一元管理', '変更履歴の自動記録', '必要な情報をすぐに検索可能'],
        time: '月12時間', cost: '月2.4万円',
        story: '導入後は、利用者情報が一元管理され、変更履歴も自動で記録されるように。転記ミスがなくなり、必要な情報をすぐに検索できるようになりました。' },
      { name: '鈴木 恵子', role: '管理者', facility: '訪問介護事業所', staff: 18, users: 45, icon: '🏠',
        problem: '訪問スケジュールの調整と送迎ルートの最適化に時間がかかりすぎていた',
        app: '訪問スケジュール最適化アプリ',
        features: ['訪問スケジュールの自動調整', '送迎ルートの最適化', '急な変更にも柔軟に対応'],
        time: '月18時間', cost: '月3.6万円',
        story: 'スケジュール調整のストレスが大幅に減り、余裕を持って業務に取り組めるようになりました。' },
      { name: '高橋 さくら', role: '介護職リーダー', facility: '小規模デイサービス', staff: 14, users: 22, icon: '👩‍⚕️',
        problem: 'レクレーションの企画・準備・記録に時間がかかり、利用者対応に集中できなかった',
        app: 'レクレーション企画・記録アプリ',
        features: ['レク企画の提案機能', '材料リストの自動生成', '実施記録の簡単入力'],
        time: '月10時間', cost: '月2万円',
        story: 'レク企画の負担が減り、利用者対応に集中できるようになりました。' },
      { name: '伊藤 太郎', role: '事務職', facility: '小規模特養', staff: 16, users: 30, icon: '📊',
        problem: '月次報告書の作成に時間がかかり、他の業務に手が回らなかった',
        app: '月次報告書自動作成アプリ',
        features: ['データの自動集計', '報告書の自動生成', '必要な形式で出力可能'],
        time: '月14時間', cost: '月2.8万円',
        story: 'データが自動で集計され、報告書も自動生成されるように。他の業務に集中できるようになりました。' },
      { name: '渡辺 みどり', role: '看護職', facility: '小規模デイサービス', staff: 13, users: 20, icon: '💊',
        problem: '服薬管理の記録と確認に時間がかかり、誤薬のリスクが常にあった',
        app: '服薬管理・記録アプリ',
        features: ['服薬情報の一元管理', '変更履歴の自動記録', '誤薬防止のアラート機能'],
        time: '月11時間', cost: '月2.2万円',
        story: '誤薬防止のアラート機能もあり、誤薬のリスクが大幅に減りました。' },
      { name: '中村 一郎', role: '管理者', facility: '小規模有料老人ホーム', staff: 17, users: 28, icon: '🏢',
        problem: '入居者の健康管理記録と家族への報告に時間がかかりすぎていた',
        app: '健康管理・家族報告アプリ',
        features: ['健康状態の一元管理', '家族への報告書の自動生成', '変更履歴の自動記録'],
        time: '月16時間', cost: '月3.2万円',
        story: '健康管理記録の負担が大幅に減り、入居者対応に集中できるようになりました。' },
      { name: '小林 花子', role: '送迎担当', facility: '小規模デイサービス', staff: 15, users: 24, icon: '🚗',
        problem: '送迎ルートの最適化と利用者の体調確認に時間がかかりすぎていた',
        app: '送迎ルート最適化アプリ',
        features: ['送迎ルートの自動最適化', '利用者体調の一元管理', '急な変更にも柔軟に対応'],
        time: '月13時間', cost: '月2.6万円',
        story: '余裕を持って業務に取り組めるようになりました。' },
      { name: '加藤 あゆみ', role: 'レク担当', facility: '小規模デイサービス', staff: 14, users: 23, icon: '🎨',
        problem: 'レクレーションの準備と片付けに時間がかかり、実施時間が短くなっていた',
        app: 'レクレーション準備・記録アプリ',
        features: ['準備物リストの自動生成', '実施記録の簡単入力', '過去のレクの検索機能'],
        time: '月9時間', cost: '月1.8万円',
        story: 'レク準備の負担が大幅に減り、実施時間を十分に確保できるようになりました。' },
      { name: '吉田 次郎', role: '経理担当', facility: '小規模事業所', staff: 12, users: 20, icon: '💰',
        problem: '経理処理と請求書作成に時間がかかり、他の業務に手が回らなかった',
        app: '経理処理・請求書作成アプリ',
        features: ['経理処理の自動化', '請求書の自動生成', 'ミス防止機能'],
        time: '月17時間', cost: '月3.4万円',
        story: 'ミス防止機能もあり、経理処理の負担が大幅に減りました。' }
    ],
    standard: [
      { name: '山田 健太', role: '管理者', facility: '中規模特養', staff: 60, users: 90, icon: '🏥',
        problem: 'インシデント・ヒヤリハットの報告書が紙中心で、集計に時間がかかり、対策が遅れていた',
        app: 'インシデント報告〜集計ダッシュボードアプリ',
        features: ['スマホorPCから簡単に報告入力', '自動で集計・グラフ化', '委員会用の資料をワンクリックで出力'],
        time: '月25時間', cost: '月5万円',
        story: '報告の集計が自動化され、対策に集中できるようになりました。' },
      { name: '松本 由美', role: '看護職リーダー', facility: '中規模老健', staff: 55, users: 85, icon: '👩‍⚕️',
        problem: '看護記録とケアプランの連携がうまくいかず、情報の共有に時間がかかっていた',
        app: '看護記録・ケアプラン連携アプリ',
        features: ['看護記録とケアプランの一元管理', '情報の自動共有', '変更履歴の自動記録'],
        time: '月22時間', cost: '月4.4万円',
        story: '情報共有がスムーズになり、チーム連携が向上しました。' },
      { name: '井上 正雄', role: '管理者', facility: '中規模デイサービス', staff: 45, users: 70, icon: '👨‍💼',
        problem: '各種委員会の議事録・アクション管理がバラバラで、進捗確認に時間がかかっていた',
        app: '委員会管理・議事録アプリ',
        features: ['議事録の一元管理', 'アクション項目の自動管理', '進捗状況の可視化'],
        time: '月24時間', cost: '月4.8万円',
        story: '委員会管理が効率化され、意思決定が速くなりました。' },
      { name: '木村 さくら', role: '介護職リーダー', facility: '中規模特養', staff: 58, users: 88, icon: '👩‍⚕️',
        problem: '夜勤記録や巡視記録が、後から転記されており、リアルタイムでの情報共有ができていなかった',
        app: '夜勤・巡視記録アプリ',
        features: ['リアルタイムでの記録入力', '情報の自動共有', '変更履歴の自動記録'],
        time: '月23時間', cost: '月4.6万円',
        story: '記録の転記がなくなり、リアルタイムでの情報共有が可能になりました。' },
      { name: '林 太郎', role: 'リハビリ職リーダー', facility: '中規模老健', staff: 52, users: 80, icon: '🏃',
        problem: 'リハビリ記録と目標設定の管理が手作業で、進捗確認に時間がかかっていた',
        app: 'リハビリ記録・目標管理アプリ',
        features: ['リハビリ記録の一元管理', '目標設定の自動管理', '進捗状況の可視化'],
        time: '月21時間', cost: '月4.2万円',
        story: 'リハビリ記録の管理が効率化され、目標の見直しが速くなりました。' },
      { name: '斎藤 みゆき', role: '事務職', facility: '中規模特養', staff: 62, users: 95, icon: '📋',
        problem: '加算要件の管理と申請に時間がかかり、申請漏れのリスクがあった',
        app: '加算管理・申請アプリ',
        features: ['加算要件の一元管理', '申請の自動チェック', '申請漏れの防止機能'],
        time: '月26時間', cost: '月5.2万円',
        story: '申請漏れのリスクがなくなり、安心して業務に取り組めるようになりました。' },
      { name: '清水 健', role: '看護職', facility: '中規模デイサービス', staff: 48, users: 75, icon: '💉',
        problem: 'バイタル記録と健康管理の情報共有に時間がかかり、チーム連携がうまくいっていなかった',
        app: 'バイタル記録・健康管理アプリ',
        features: ['バイタル記録の一元管理', '健康管理情報の自動共有', '異常値のアラート機能'],
        time: '月20時間', cost: '月4万円',
        story: '異常値のアラート機能もあり、チーム連携が向上しました。' },
      { name: '山口 あきこ', role: '相談員', facility: '中規模老健', staff: 50, users: 78, icon: '💬',
        problem: '家族との連絡記録とケア会議の準備に時間がかかり、対応が遅れることがあった',
        app: '家族連絡・ケア会議管理アプリ',
        features: ['連絡記録の一元管理', 'ケア会議の自動準備', '過去の記録の検索機能'],
        time: '月19時間', cost: '月3.8万円',
        story: '連絡記録の管理が効率化され、対応が速くなりました。' },
      { name: '森 一郎', role: '委員会担当', facility: '中規模特養', staff: 59, users: 92, icon: '📝',
        problem: '各種委員会の資料作成と議事録の管理に時間がかかり、委員会の運営が非効率だった',
        app: '委員会資料・議事録管理アプリ',
        features: ['資料の自動生成', '議事録の一元管理', 'アクション項目の自動管理'],
        time: '月27時間', cost: '月5.4万円',
        story: '委員会の運営が効率化され、意思決定が速くなりました。' },
      { name: '池田 さとみ', role: '品質管理担当', facility: '中規模事業所', staff: 54, users: 82, icon: '⭐',
        problem: '品質管理の記録と分析に時間がかかり、改善策の検討まで時間がかかっていた',
        app: '品質管理・分析アプリ',
        features: ['品質管理記録の一元管理', '自動分析機能', '改善策の提案機能'],
        time: '月28時間', cost: '月5.6万円',
        story: '品質管理が効率化され、改善策の検討が速くなりました。' }
    ],
    pro: [
      { name: '橋本 大輔', role: '経営企画担当', facility: '法人本部', staff: 300, users: 500, icon: '📈',
        problem: '全拠点からの月次報告の集計に時間がかかり、経営判断が遅れていた',
        app: '全拠点月次経営ダッシュボードアプリ',
        features: ['決まったフォーマットでクラウドに直接入力', '本部側でリアルタイム確認', '会議用資料の自動出力'],
        time: '月80時間', cost: '月16万円',
        story: '経営判断が速くなりました。' },
      { name: '石川 智子', role: '情報システム担当', facility: '法人本部', staff: 280, users: 480, icon: '💻',
        problem: '各拠点のIT環境がバラバラで、システム統合に時間がかかっていた',
        app: '全拠点統合管理アプリ',
        features: ['全拠点で統一されたシステム', 'データの自動統合', 'システムの一元管理'],
        time: '月75時間', cost: '月15万円',
        story: 'システム統合が効率化され、データ管理が一元化されました。' },
      { name: '前田 雄一', role: '本部管理者', facility: '複数拠点を持つ法人', staff: 320, users: 550, icon: '👔',
        problem: '各拠点の運営状況の把握に時間がかかり、適切な支援ができていなかった',
        app: '全拠点運営状況可視化アプリ',
        features: ['運営状況をリアルタイム可視化', '問題点の早期発見', '支援が必要な拠点の自動判定'],
        time: '月85時間', cost: '月17万円',
        story: '適切な支援ができるようになりました。' },
      { name: '藤原 美咲', role: '品質管理担当', facility: '法人本部', staff: 290, users: 490, icon: '⭐',
        problem: '全拠点の品質管理データの集計と分析に時間がかかり、改善策の検討が遅れていた',
        app: '全拠点品質管理統合アプリ',
        features: ['品質管理データの自動集計', '自動分析機能', '改善策の提案機能'],
        time: '月78時間', cost: '月15.6万円',
        story: '改善策の検討が速くなりました。' },
      { name: '岡田 健', role: '人事担当', facility: '複数拠点を持つ法人', staff: 310, users: 520, icon: '👥',
        problem: '全拠点の人事データの管理と分析に時間がかかり、人事戦略の検討が遅れていた',
        app: '全拠点人事管理統合アプリ',
        features: ['人事データの一元管理', '自動分析機能', '人事戦略の提案機能'],
        time: '月82時間', cost: '月16.4万円',
        story: '人事戦略の検討が速くなりました。' },
      { name: '長谷川 さとみ', role: '経理担当', facility: '法人本部', staff: 295, users: 495, icon: '💰',
        problem: '全拠点の経理データの集計と分析に時間がかかり、経営判断が遅れていた',
        app: '全拠点経理統合アプリ',
        features: ['経理データの自動集計', '自動分析機能', '経営判断の支援機能'],
        time: '月88時間', cost: '月17.6万円',
        story: '経営判断が速くなりました。' },
      { name: '村上 あゆみ', role: '研修担当', facility: '複数拠点を持つ法人', staff: 305, users: 510, icon: '📚',
        problem: '全拠点の研修データの管理と分析に時間がかかり、研修計画の検討が遅れていた',
        app: '全拠点研修管理統合アプリ',
        features: ['研修データの一元管理', '自動分析機能', '研修計画の提案機能'],
        time: '月76時間', cost: '月15.2万円',
        story: '研修計画の検討が速くなりました。' },
      { name: '近藤 一郎', role: '監査対応担当', facility: '法人本部', staff: 285, users: 485, icon: '🔍',
        problem: '監査対応の準備と資料作成に時間がかかり、監査対応が非効率だった',
        app: '監査対応支援アプリ',
        features: ['監査資料の自動生成', '監査対応の自動チェック', '過去の監査記録の検索機能'],
        time: '月90時間', cost: '月18万円',
        story: '監査対応が効率化され、準備時間が大幅に短縮されました。' },
      { name: '坂本 みゆき', role: '加算管理担当', facility: '複数拠点を持つ法人', staff: 315, users: 530, icon: '📊',
        problem: '全拠点の加算管理と申請の確認に時間がかかり、申請漏れのリスクがあった',
        app: '全拠点加算管理統合アプリ',
        features: ['加算管理の一元管理', '申請の自動チェック', '申請漏れの防止機能'],
        time: '月84時間', cost: '月16.8万円',
        story: '申請漏れのリスクがなくなり、安心して業務に取り組めるようになりました。' },
      { name: '渡部 健太', role: 'DX推進担当', facility: '法人本部', staff: 300, users: 500, icon: '🚀',
        problem: 'DX推進の進捗管理と効果測定に時間がかかり、戦略の見直しが遅れていた',
        app: 'DX推進管理アプリ',
        features: ['DX推進の進捗管理', '効果測定の自動化', '戦略の提案機能'],
        time: '月86時間', cost: '月17.2万円',
        story: '戦略の見直しが速くなりました。' }
    ]
  };

  const planLabel = { lite: '小規模', standard: '中規模', pro: '法人' };

  function card(p, plan) {
    const features = p.features.map(f => `<li>${f}</li>`).join('');
    return `
      <article class="persona-card" data-plan="${plan}">
        <div class="persona-head">
          <div class="persona-icon">${p.icon}</div>
          <div>
            <div class="persona-name">${p.name}</div>
            <div class="persona-role">${p.role}</div>
          </div>
          <span class="persona-tag ${plan}">${planLabel[plan]}</span>
        </div>
        <div class="persona-meta">
          <span>施設：${p.facility}</span>
          <span>職員${p.staff}名／利用者${p.users}名</span>
        </div>
        <div class="persona-problem">
          <h4>導入前の課題</h4>
          <p>${p.problem}</p>
        </div>
        <div class="persona-app">
          <h4>導入アプリ</h4>
          <div class="app-name">${p.app}</div>
          <ul>${features}</ul>
        </div>
        <div class="persona-effects">
          <div class="persona-effect">
            <div class="label">削減時間</div>
            <div class="value">${p.time}</div>
          </div>
          <div class="persona-effect">
            <div class="label">削減コスト</div>
            <div class="value">${p.cost}</div>
          </div>
        </div>
        <div class="persona-story">${p.story}</div>
      </article>`;
  }

  function render(filter) {
    const c = document.getElementById('all-personas');
    if (!c) return;
    let html = '';
    ['lite', 'standard', 'pro'].forEach(plan => {
      if (filter !== 'all' && filter !== plan) return;
      personas[plan].forEach(p => { html += card(p, plan); });
    });
    c.innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', () => {
    render('all');
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(btn.dataset.filter);
      });
    });
  });
})();
