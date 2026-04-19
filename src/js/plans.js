// プラン別ペルソナページのスクリプト

(function() {
  'use strict';

  // ペルソナデータ
  const personas = {
    lite: [
      {
        name: '田中 美咲',
        role: '管理者',
        facility: '小規模デイサービス',
        staffCount: 15,
        userCount: 25,
        icon: '👩‍💼',
        problem: 'シフト希望の回収・調整に毎月かなり時間がかかり、夜遅くまで作業していた',
        beforeScenario: '毎月、スタッフからシフト希望を紙やメールで回収し、Excelで手作業で調整。希望が重複すると電話で確認し直し、最終的に夜遅くまでシフト表を作成していた。',
        app: 'シフト希望回収＋シフト表自動作成アプリ',
        appFeatures: ['スタッフがスマホで希望を入力', '条件を満たす形でシフト案を自動生成', 'Excel出力・印刷にも対応'],
        effects: {
          timeReduction: '月15時間',
          costReduction: '月3万円',
          stressReduction: '夜作業がなくなり、家族との時間が増えた',
          story: '導入後は、スタッフがスマホで希望を入力するだけで、条件を満たすシフト案が自動生成されるように。夜遅くまで作業することがなくなり、家族との時間が増えました。'
        }
      },
      {
        name: '佐藤 健一',
        role: '事務職',
        facility: '小規模グループホーム',
        staffCount: 12,
        userCount: 18,
        icon: '📋',
        problem: '利用者情報の管理が紙とExcelで二重管理になっており、転記ミスが頻発していた',
        beforeScenario: '利用者の基本情報、健康状態、服薬情報などを紙のファイルとExcelの両方で管理。情報更新のたびに両方に転記する必要があり、転記ミスが起きやすかった。',
        app: '利用者情報一元管理アプリ',
        appFeatures: ['利用者情報の一元管理', '変更履歴の自動記録', '必要な情報をすぐに検索可能'],
        effects: {
          timeReduction: '月12時間',
          costReduction: '月2.4万円',
          stressReduction: '転記ミスがなくなり、安心して業務に集中できるようになった',
          story: '導入後は、利用者情報が一元管理され、変更履歴も自動で記録されるように。転記ミスがなくなり、必要な情報をすぐに検索できるようになりました。'
        }
      },
      {
        name: '鈴木 恵子',
        role: '管理者',
        facility: '訪問介護事業所',
        staffCount: 18,
        userCount: 45,
        icon: '🏠',
        problem: '訪問スケジュールの調整と送迎ルートの最適化に時間がかかりすぎていた',
        beforeScenario: '訪問介護員のスケジュールと利用者の希望時間を手作業で調整し、送迎ルートも経験と勘で決めていた。急な変更があると、全体のスケジュールを見直す必要があり、時間がかかった。',
        app: '訪問スケジュール最適化アプリ',
        appFeatures: ['訪問スケジュールの自動調整', '送迎ルートの最適化', '急な変更にも柔軟に対応'],
        effects: {
          timeReduction: '月18時間',
          costReduction: '月3.6万円',
          stressReduction: 'スケジュール調整のストレスが大幅に減り、余裕を持って業務に取り組めるようになった',
          story: '導入後は、訪問スケジュールが自動で調整され、送迎ルートも最適化されるように。急な変更にも柔軟に対応でき、スケジュール調整のストレスが大幅に減りました。'
        }
      },
      {
        name: '高橋 さくら',
        role: '介護職リーダー',
        facility: '小規模デイサービス',
        staffCount: 14,
        userCount: 22,
        icon: '👩‍⚕️',
        problem: 'レクレーションの企画・準備・記録に時間がかかり、利用者対応に集中できなかった',
        beforeScenario: '毎週、レクレーションの企画を考え、必要な材料をリストアップし、準備をし、実施後に記録を残していた。企画を考える時間がなく、同じようなレクを繰り返しがちだった。',
        app: 'レクレーション企画・記録アプリ',
        appFeatures: ['レク企画の提案機能', '材料リストの自動生成', '実施記録の簡単入力'],
        effects: {
          timeReduction: '月10時間',
          costReduction: '月2万円',
          stressReduction: 'レク企画の負担が減り、利用者対応に集中できるようになった',
          story: '導入後は、レク企画が提案され、材料リストも自動生成されるように。実施記録も簡単に入力でき、レク企画の負担が大幅に減りました。'
        }
      },
      {
        name: '伊藤 太郎',
        role: '事務職',
        facility: '小規模特養',
        staffCount: 16,
        userCount: 30,
        icon: '📊',
        problem: '月次報告書の作成に時間がかかり、他の業務に手が回らなかった',
        beforeScenario: '毎月末、各部署から集めたデータをExcelで集計し、報告書を作成していた。データの集計に時間がかかり、報告書の作成までに数日かかっていた。',
        app: '月次報告書自動作成アプリ',
        appFeatures: ['データの自動集計', '報告書の自動生成', '必要な形式で出力可能'],
        effects: {
          timeReduction: '月14時間',
          costReduction: '月2.8万円',
          stressReduction: '報告書作成の負担が減り、他の業務に集中できるようになった',
          story: '導入後は、データが自動で集計され、報告書も自動生成されるように。報告書作成の負担が大幅に減り、他の業務に集中できるようになりました。'
        }
      },
      {
        name: '渡辺 みどり',
        role: '看護職',
        facility: '小規模デイサービス',
        staffCount: 13,
        userCount: 20,
        icon: '💊',
        problem: '服薬管理の記録と確認に時間がかかり、誤薬のリスクが常にあった',
        beforeScenario: '利用者の服薬情報を紙のファイルで管理し、毎回手作業で確認していた。服薬の変更があった場合、ファイルを更新する必要があり、更新漏れのリスクがあった。',
        app: '服薬管理・記録アプリ',
        appFeatures: ['服薬情報の一元管理', '変更履歴の自動記録', '誤薬防止のアラート機能'],
        effects: {
          timeReduction: '月11時間',
          costReduction: '月2.2万円',
          stressReduction: '誤薬のリスクが減り、安心して業務に取り組めるようになった',
          story: '導入後は、服薬情報が一元管理され、変更履歴も自動で記録されるように。誤薬防止のアラート機能もあり、誤薬のリスクが大幅に減りました。'
        }
      },
      {
        name: '中村 一郎',
        role: '管理者',
        facility: '小規模有料老人ホーム',
        staffCount: 17,
        userCount: 28,
        icon: '🏢',
        problem: '入居者の健康管理記録と家族への報告に時間がかかりすぎていた',
        beforeScenario: '入居者の健康状態を紙のファイルで管理し、家族への報告も手作業で作成していた。健康状態の変化を記録するたびに、ファイルを更新し、家族への報告書も作成する必要があった。',
        app: '健康管理・家族報告アプリ',
        appFeatures: ['健康状態の一元管理', '家族への報告書の自動生成', '変更履歴の自動記録'],
        effects: {
          timeReduction: '月16時間',
          costReduction: '月3.2万円',
          stressReduction: '健康管理記録の負担が減り、入居者対応に集中できるようになった',
          story: '導入後は、健康状態が一元管理され、家族への報告書も自動生成されるように。健康管理記録の負担が大幅に減り、入居者対応に集中できるようになりました。'
        }
      },
      {
        name: '小林 花子',
        role: '送迎担当',
        facility: '小規模デイサービス',
        staffCount: 15,
        userCount: 24,
        icon: '🚗',
        problem: '送迎ルートの最適化と利用者の体調確認に時間がかかりすぎていた',
        beforeScenario: '毎朝、利用者の体調を確認し、送迎ルートを手作業で決めていた。ルートの最適化ができず、送迎に時間がかかることが多かった。',
        app: '送迎ルート最適化アプリ',
        appFeatures: ['送迎ルートの自動最適化', '利用者体調の一元管理', '急な変更にも柔軟に対応'],
        effects: {
          timeReduction: '月13時間',
          costReduction: '月2.6万円',
          stressReduction: '送迎ルートの最適化が簡単になり、余裕を持って業務に取り組めるようになった',
          story: '導入後は、送迎ルートが自動で最適化され、利用者の体調も一元管理されるように。送迎ルートの最適化が簡単になり、余裕を持って業務に取り組めるようになりました。'
        }
      },
      {
        name: '加藤 あゆみ',
        role: 'レク担当',
        facility: '小規模デイサービス',
        staffCount: 14,
        userCount: 23,
        icon: '🎨',
        problem: 'レクレーションの準備と片付けに時間がかかり、実施時間が短くなっていた',
        beforeScenario: 'レクレーションの準備に時間がかかり、実施時間が短くなることが多かった。また、片付けも時間がかかり、次の業務に影響することがあった。',
        app: 'レクレーション準備・記録アプリ',
        appFeatures: ['準備物リストの自動生成', '実施記録の簡単入力', '過去のレクの検索機能'],
        effects: {
          timeReduction: '月9時間',
          costReduction: '月1.8万円',
          stressReduction: 'レク準備の負担が減り、実施時間を十分に確保できるようになった',
          story: '導入後は、準備物リストが自動生成され、実施記録も簡単に入力できるように。レク準備の負担が大幅に減り、実施時間を十分に確保できるようになりました。'
        }
      },
      {
        name: '吉田 次郎',
        role: '経理担当',
        facility: '小規模事業所',
        staffCount: 12,
        userCount: 20,
        icon: '💰',
        problem: '経理処理と請求書作成に時間がかかり、他の業務に手が回らなかった',
        beforeScenario: '毎月、経理処理と請求書作成に時間がかかり、他の業務に手が回らなかった。請求書の作成ミスもあり、修正に時間がかかることがあった。',
        app: '経理処理・請求書作成アプリ',
        appFeatures: ['経理処理の自動化', '請求書の自動生成', 'ミス防止機能'],
        effects: {
          timeReduction: '月17時間',
          costReduction: '月3.4万円',
          stressReduction: '経理処理の負担が減り、他の業務に集中できるようになった',
          story: '導入後は、経理処理が自動化され、請求書も自動生成されるように。ミス防止機能もあり、経理処理の負担が大幅に減りました。'
        }
      }
    ],
    standard: [
      {
        name: '山田 健太',
        role: '管理者',
        facility: '中規模特養',
        staffCount: 60,
        userCount: 90,
        icon: '🏥',
        problem: 'インシデント・ヒヤリハットの報告書が紙中心で、集計に時間がかかり、対策が遅れていた',
        beforeScenario: '職員が紙の報告書を提出し、それを手作業で集計していた。集計に時間がかかり、傾向分析や対策の検討まで時間がかかっていた。',
        app: 'インシデント報告〜集計ダッシュボードアプリ',
        appFeatures: ['職員がスマホorPCから簡単に報告入力', '自動で集計・グラフ化', '委員会用の資料をワンクリックで出力'],
        effects: {
          timeReduction: '月25時間',
          costReduction: '月5万円',
          stressReduction: '報告の集計が自動化され、対策に集中できるようになった',
          story: '導入後は、職員がスマホやPCから簡単に報告入力でき、自動で集計・グラフ化されるように。委員会用の資料もワンクリックで出力でき、対策に集中できるようになりました。'
        }
      },
      {
        name: '松本 由美',
        role: '看護職リーダー',
        facility: '中規模老健',
        staffCount: 55,
        userCount: 85,
        icon: '👩‍⚕️',
        problem: '看護記録とケアプランの連携がうまくいかず、情報の共有に時間がかかっていた',
        beforeScenario: '看護記録とケアプランが別々のシステムで管理されており、情報の共有に時間がかかっていた。記録の転記も必要で、ミスのリスクがあった。',
        app: '看護記録・ケアプラン連携アプリ',
        appFeatures: ['看護記録とケアプランの一元管理', '情報の自動共有', '変更履歴の自動記録'],
        effects: {
          timeReduction: '月22時間',
          costReduction: '月4.4万円',
          stressReduction: '情報共有がスムーズになり、チーム連携が向上した',
          story: '導入後は、看護記録とケアプランが一元管理され、情報が自動で共有されるように。情報共有がスムーズになり、チーム連携が向上しました。'
        }
      },
      {
        name: '井上 正雄',
        role: '管理者',
        facility: '中規模デイサービス',
        staffCount: 45,
        userCount: 70,
        icon: '👨‍💼',
        problem: '各種委員会の議事録・アクション管理がバラバラで、進捗確認に時間がかかっていた',
        beforeScenario: '各種委員会の議事録が紙やExcelでバラバラに管理されており、進捗確認に時間がかかっていた。アクション項目の管理も手作業で、抜け漏れのリスクがあった。',
        app: '委員会管理・議事録アプリ',
        appFeatures: ['議事録の一元管理', 'アクション項目の自動管理', '進捗状況の可視化'],
        effects: {
          timeReduction: '月24時間',
          costReduction: '月4.8万円',
          stressReduction: '委員会管理が効率化され、意思決定が速くなった',
          story: '導入後は、議事録が一元管理され、アクション項目も自動で管理されるように。進捗状況も可視化され、意思決定が速くなりました。'
        }
      },
      {
        name: '木村 さくら',
        role: '介護職リーダー',
        facility: '中規模特養',
        staffCount: 58,
        userCount: 88,
        icon: '👩‍⚕️',
        problem: '夜勤記録や巡視記録が、後から転記されており、リアルタイムでの情報共有ができていなかった',
        beforeScenario: '夜勤記録や巡視記録を紙で記録し、後からExcelに転記していた。転記に時間がかかり、リアルタイムでの情報共有ができていなかった。',
        app: '夜勤・巡視記録アプリ',
        appFeatures: ['リアルタイムでの記録入力', '情報の自動共有', '変更履歴の自動記録'],
        effects: {
          timeReduction: '月23時間',
          costReduction: '月4.6万円',
          stressReduction: '記録の転記がなくなり、リアルタイムでの情報共有が可能になった',
          story: '導入後は、リアルタイムで記録入力でき、情報が自動で共有されるように。記録の転記がなくなり、リアルタイムでの情報共有が可能になりました。'
        }
      },
      {
        name: '林 太郎',
        role: 'リハビリ職リーダー',
        facility: '中規模老健',
        staffCount: 52,
        userCount: 80,
        icon: '🏃',
        problem: 'リハビリ記録と目標設定の管理が手作業で、進捗確認に時間がかかっていた',
        beforeScenario: 'リハビリ記録を紙で管理し、目標設定も手作業で行っていた。進捗確認に時間がかかり、目標の見直しが遅れることがあった。',
        app: 'リハビリ記録・目標管理アプリ',
        appFeatures: ['リハビリ記録の一元管理', '目標設定の自動管理', '進捗状況の可視化'],
        effects: {
          timeReduction: '月21時間',
          costReduction: '月4.2万円',
          stressReduction: 'リハビリ記録の管理が効率化され、目標の見直しが速くなった',
          story: '導入後は、リハビリ記録が一元管理され、目標設定も自動で管理されるように。進捗状況も可視化され、目標の見直しが速くなりました。'
        }
      },
      {
        name: '斎藤 みゆき',
        role: '事務職',
        facility: '中規模特養',
        staffCount: 62,
        userCount: 95,
        icon: '📋',
        problem: '加算要件の管理と申請に時間がかかり、申請漏れのリスクがあった',
        beforeScenario: '加算要件をExcelで管理し、申請も手作業で行っていた。申請漏れのリスクがあり、確認作業に時間がかかっていた。',
        app: '加算管理・申請アプリ',
        appFeatures: ['加算要件の一元管理', '申請の自動チェック', '申請漏れの防止機能'],
        effects: {
          timeReduction: '月26時間',
          costReduction: '月5.2万円',
          stressReduction: '加算管理が効率化され、申請漏れのリスクがなくなった',
          story: '導入後は、加算要件が一元管理され、申請も自動でチェックされるように。申請漏れのリスクがなくなり、安心して業務に取り組めるようになりました。'
        }
      },
      {
        name: '清水 健',
        role: '看護職',
        facility: '中規模デイサービス',
        staffCount: 48,
        userCount: 75,
        icon: '💉',
        problem: 'バイタル記録と健康管理の情報共有に時間がかかり、チーム連携がうまくいっていなかった',
        beforeScenario: 'バイタル記録を紙で管理し、健康管理の情報も別々に管理していた。情報共有に時間がかかり、チーム連携がうまくいっていなかった。',
        app: 'バイタル記録・健康管理アプリ',
        appFeatures: ['バイタル記録の一元管理', '健康管理情報の自動共有', '異常値のアラート機能'],
        effects: {
          timeReduction: '月20時間',
          costReduction: '月4万円',
          stressReduction: '情報共有がスムーズになり、チーム連携が向上した',
          story: '導入後は、バイタル記録が一元管理され、健康管理情報も自動で共有されるように。異常値のアラート機能もあり、チーム連携が向上しました。'
        }
      },
      {
        name: '山口 あきこ',
        role: '相談員',
        facility: '中規模老健',
        staffCount: 50,
        userCount: 78,
        icon: '💬',
        problem: '家族との連絡記録とケア会議の準備に時間がかかり、対応が遅れることがあった',
        beforeScenario: '家族との連絡記録を紙で管理し、ケア会議の準備も手作業で行っていた。準備に時間がかかり、対応が遅れることがあった。',
        app: '家族連絡・ケア会議管理アプリ',
        appFeatures: ['連絡記録の一元管理', 'ケア会議の自動準備', '過去の記録の検索機能'],
        effects: {
          timeReduction: '月19時間',
          costReduction: '月3.8万円',
          stressReduction: '連絡記録の管理が効率化され、対応が速くなった',
          story: '導入後は、連絡記録が一元管理され、ケア会議も自動で準備されるように。過去の記録も検索でき、対応が速くなりました。'
        }
      },
      {
        name: '森 一郎',
        role: '委員会担当',
        facility: '中規模特養',
        staffCount: 59,
        userCount: 92,
        icon: '📝',
        problem: '各種委員会の資料作成と議事録の管理に時間がかかり、委員会の運営が非効率だった',
        beforeScenario: '各種委員会の資料を手作業で作成し、議事録も紙で管理していた。資料作成に時間がかかり、委員会の運営が非効率だった。',
        app: '委員会資料・議事録管理アプリ',
        appFeatures: ['資料の自動生成', '議事録の一元管理', 'アクション項目の自動管理'],
        effects: {
          timeReduction: '月27時間',
          costReduction: '月5.4万円',
          stressReduction: '委員会の運営が効率化され、意思決定が速くなった',
          story: '導入後は、資料が自動生成され、議事録も一元管理されるように。アクション項目も自動で管理され、委員会の運営が効率化されました。'
        }
      },
      {
        name: '池田 さとみ',
        role: '品質管理担当',
        facility: '中規模事業所',
        staffCount: 54,
        userCount: 82,
        icon: '⭐',
        problem: '品質管理の記録と分析に時間がかかり、改善策の検討まで時間がかかっていた',
        beforeScenario: '品質管理の記録をExcelで管理し、分析も手作業で行っていた。分析に時間がかかり、改善策の検討まで時間がかかっていた。',
        app: '品質管理・分析アプリ',
        appFeatures: ['品質管理記録の一元管理', '自動分析機能', '改善策の提案機能'],
        effects: {
          timeReduction: '月28時間',
          costReduction: '月5.6万円',
          stressReduction: '品質管理が効率化され、改善策の検討が速くなった',
          story: '導入後は、品質管理記録が一元管理され、自動分析機能も追加されました。改善策の提案機能もあり、改善策の検討が速くなりました。'
        }
      }
    ],
    pro: [
      {
        name: '橋本 大輔',
        role: '経営企画担当',
        facility: '法人本部',
        staffCount: 300,
        userCount: 500,
        icon: '📈',
        problem: '全拠点からの月次報告の集計に時間がかかり、経営判断が遅れていた',
        beforeScenario: '各拠点からExcelで報告が送られてきて、それを手作業で集計していた。集計に数日かかり、経営判断が遅れていた。',
        app: '全拠点月次経営ダッシュボードアプリ',
        appFeatures: ['各事業所が決まったフォーマットでクラウドに直接入力', '本部側でリアルタイム確認', '会議用資料の自動出力'],
        effects: {
          timeReduction: '月80時間',
          costReduction: '月16万円',
          stressReduction: '報告の集計が自動化され、経営判断が速くなった',
          story: '導入後は、各事業所が決まったフォーマットでクラウドに直接入力でき、本部側でリアルタイム確認できるように。会議用資料も自動出力され、経営判断が速くなりました。'
        }
      },
      {
        name: '石川 智子',
        role: '情報システム担当',
        facility: '法人本部',
        staffCount: 280,
        userCount: 480,
        icon: '💻',
        problem: '各拠点のIT環境がバラバラで、システム統合に時間がかかっていた',
        beforeScenario: '各拠点で異なるシステムを使っていたため、システム統合に時間がかかっていた。データの形式もバラバラで、統合が困難だった。',
        app: '全拠点統合管理アプリ',
        appFeatures: ['全拠点で統一されたシステム', 'データの自動統合', 'システムの一元管理'],
        effects: {
          timeReduction: '月75時間',
          costReduction: '月15万円',
          stressReduction: 'システム統合が効率化され、データ管理が一元化された',
          story: '導入後は、全拠点で統一されたシステムを使えるようになり、データも自動で統合されるように。システムの一元管理が可能になりました。'
        }
      },
      {
        name: '前田 雄一',
        role: '本部管理者',
        facility: '複数拠点を持つ法人',
        staffCount: 320,
        userCount: 550,
        icon: '👔',
        problem: '各拠点の運営状況の把握に時間がかかり、適切な支援ができていなかった',
        beforeScenario: '各拠点の運営状況を把握するために、定期的に報告を集めていたが、集計に時間がかかり、適切な支援ができていなかった。',
        app: '全拠点運営状況可視化アプリ',
        appFeatures: ['各拠点の運営状況をリアルタイムで可視化', '問題点の早期発見', '支援が必要な拠点の自動判定'],
        effects: {
          timeReduction: '月85時間',
          costReduction: '月17万円',
          stressReduction: '運営状況の把握が効率化され、適切な支援ができるようになった',
          story: '導入後は、各拠点の運営状況をリアルタイムで可視化でき、問題点も早期発見できるように。支援が必要な拠点も自動で判定され、適切な支援ができるようになりました。'
        }
      },
      {
        name: '藤原 美咲',
        role: '品質管理担当',
        facility: '法人本部',
        staffCount: 290,
        userCount: 490,
        icon: '⭐',
        problem: '全拠点の品質管理データの集計と分析に時間がかかり、改善策の検討が遅れていた',
        beforeScenario: '各拠点から品質管理データを集め、それを手作業で集計・分析していた。集計に時間がかかり、改善策の検討が遅れていた。',
        app: '全拠点品質管理統合アプリ',
        appFeatures: ['全拠点の品質管理データの自動集計', '自動分析機能', '改善策の提案機能'],
        effects: {
          timeReduction: '月78時間',
          costReduction: '月15.6万円',
          stressReduction: '品質管理データの集計が自動化され、改善策の検討が速くなった',
          story: '導入後は、全拠点の品質管理データが自動で集計され、自動分析機能も追加されました。改善策の提案機能もあり、改善策の検討が速くなりました。'
        }
      },
      {
        name: '岡田 健',
        role: '人事担当',
        facility: '複数拠点を持つ法人',
        staffCount: 310,
        userCount: 520,
        icon: '👥',
        problem: '全拠点の人事データの管理と分析に時間がかかり、人事戦略の検討が遅れていた',
        beforeScenario: '各拠点の人事データをExcelで管理し、分析も手作業で行っていた。分析に時間がかかり、人事戦略の検討が遅れていた。',
        app: '全拠点人事管理統合アプリ',
        appFeatures: ['全拠点の人事データの一元管理', '自動分析機能', '人事戦略の提案機能'],
        effects: {
          timeReduction: '月82時間',
          costReduction: '月16.4万円',
          stressReduction: '人事データの管理が効率化され、人事戦略の検討が速くなった',
          story: '導入後は、全拠点の人事データが一元管理され、自動分析機能も追加されました。人事戦略の提案機能もあり、人事戦略の検討が速くなりました。'
        }
      },
      {
        name: '長谷川 さとみ',
        role: '経理担当',
        facility: '法人本部',
        staffCount: 295,
        userCount: 495,
        icon: '💰',
        problem: '全拠点の経理データの集計と分析に時間がかかり、経営判断が遅れていた',
        beforeScenario: '各拠点から経理データを集め、それを手作業で集計・分析していた。集計に時間がかかり、経営判断が遅れていた。',
        app: '全拠点経理統合アプリ',
        appFeatures: ['全拠点の経理データの自動集計', '自動分析機能', '経営判断の支援機能'],
        effects: {
          timeReduction: '月88時間',
          costReduction: '月17.6万円',
          stressReduction: '経理データの集計が自動化され、経営判断が速くなった',
          story: '導入後は、全拠点の経理データが自動で集計され、自動分析機能も追加されました。経営判断の支援機能もあり、経営判断が速くなりました。'
        }
      },
      {
        name: '村上 あゆみ',
        role: '研修担当',
        facility: '複数拠点を持つ法人',
        staffCount: 305,
        userCount: 510,
        icon: '📚',
        problem: '全拠点の研修データの管理と分析に時間がかかり、研修計画の検討が遅れていた',
        beforeScenario: '各拠点の研修データをExcelで管理し、分析も手作業で行っていた。分析に時間がかかり、研修計画の検討が遅れていた。',
        app: '全拠点研修管理統合アプリ',
        appFeatures: ['全拠点の研修データの一元管理', '自動分析機能', '研修計画の提案機能'],
        effects: {
          timeReduction: '月76時間',
          costReduction: '月15.2万円',
          stressReduction: '研修データの管理が効率化され、研修計画の検討が速くなった',
          story: '導入後は、全拠点の研修データが一元管理され、自動分析機能も追加されました。研修計画の提案機能もあり、研修計画の検討が速くなりました。'
        }
      },
      {
        name: '近藤 一郎',
        role: '監査対応担当',
        facility: '法人本部',
        staffCount: 285,
        userCount: 485,
        icon: '🔍',
        problem: '監査対応の準備と資料作成に時間がかかり、監査対応が非効率だった',
        beforeScenario: '監査対応の準備を手作業で行い、資料も手作業で作成していた。準備に時間がかかり、監査対応が非効率だった。',
        app: '監査対応支援アプリ',
        appFeatures: ['監査資料の自動生成', '監査対応の自動チェック', '過去の監査記録の検索機能'],
        effects: {
          timeReduction: '月90時間',
          costReduction: '月18万円',
          stressReduction: '監査対応が効率化され、準備時間が大幅に短縮された',
          story: '導入後は、監査資料が自動生成され、監査対応も自動でチェックされるように。過去の監査記録も検索でき、監査対応が効率化されました。'
        }
      },
      {
        name: '坂本 みゆき',
        role: '加算管理担当',
        facility: '複数拠点を持つ法人',
        staffCount: 315,
        userCount: 530,
        icon: '📊',
        problem: '全拠点の加算管理と申請の確認に時間がかかり、申請漏れのリスクがあった',
        beforeScenario: '各拠点の加算管理をExcelで管理し、申請の確認も手作業で行っていた。確認に時間がかかり、申請漏れのリスクがあった。',
        app: '全拠点加算管理統合アプリ',
        appFeatures: ['全拠点の加算管理の一元管理', '申請の自動チェック', '申請漏れの防止機能'],
        effects: {
          timeReduction: '月84時間',
          costReduction: '月16.8万円',
          stressReduction: '加算管理が効率化され、申請漏れのリスクがなくなった',
          story: '導入後は、全拠点の加算管理が一元管理され、申請も自動でチェックされるように。申請漏れのリスクがなくなり、安心して業務に取り組めるようになりました。'
        }
      },
      {
        name: '渡部 健太',
        role: 'DX推進担当',
        facility: '法人本部',
        staffCount: 300,
        userCount: 500,
        icon: '🚀',
        problem: 'DX推進の進捗管理と効果測定に時間がかかり、戦略の見直しが遅れていた',
        beforeScenario: 'DX推進の進捗をExcelで管理し、効果測定も手作業で行っていた。測定に時間がかかり、戦略の見直しが遅れていた。',
        app: 'DX推進管理アプリ',
        appFeatures: ['DX推進の進捗管理', '効果測定の自動化', '戦略の提案機能'],
        effects: {
          timeReduction: '月86時間',
          costReduction: '月17.2万円',
          stressReduction: 'DX推進の管理が効率化され、戦略の見直しが速くなった',
          story: '導入後は、DX推進の進捗が管理され、効果測定も自動化されるように。戦略の提案機能もあり、戦略の見直しが速くなりました。'
        }
      }
    ]
  };

  // タブ切り替え機能
  function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        
        // すべてのタブボタンとパネルを非アクティブに
        tabButtons.forEach(btn => {
          btn.classList.remove('active', 'border-clay', 'border-stone', 'border-ink', 'text-clay', 'text-stone', 'text-ink');
          btn.classList.add('border-transparent', 'text-stone/90');
          btn.setAttribute('aria-selected', 'false');
        });
        
        tabPanels.forEach(panel => {
          panel.classList.remove('active');
        });

        // 選択されたタブをアクティブに
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        button.classList.remove('border-transparent', 'text-stone/90');

        // タブの色を設定
        if (targetTab === 'lite') {
          button.classList.add('border-clay', 'text-clay');
        } else if (targetTab === 'standard') {
          button.classList.add('border-stone', 'text-stone');
        } else if (targetTab === 'pro') {
          button.classList.add('border-ink', 'text-ink');
        }

        const targetPanel = document.getElementById(`panel-${targetTab}`);
        if (targetPanel) {
          targetPanel.classList.add('active');
        }

        // ペルソナカードを生成
        generatePersonaCards(targetTab);
      });
    });
  }

  // ペルソナカードを生成
  function generatePersonaCards(plan) {
    const container = document.getElementById(`${plan}-personas`);
    if (!container) return;

    const planPersonas = personas[plan];
    if (!planPersonas) return;

    container.innerHTML = '';

    planPersonas.forEach((persona, index) => {
      const card = createPersonaCard(persona, plan, index);
      container.appendChild(card);
    });
  }

  // ペルソナカードを作成
  function createPersonaCard(persona, plan, index) {
    const card = document.createElement('div');
    card.className = 'persona-card bg-white rounded-lg shadow-lg p-6 cursor-pointer';
    card.setAttribute('data-persona-index', index);

    // プランごとの色クラスを設定
    let badgeClass = 'bg-stone/10 text-ink';
    let appTitleClass = 'text-ink';
    let appTextClass = 'text-ink';
    let effectBgClass = 'bg-stone/5';
    let effectTextClass = 'text-stone';
    let effectValueClass = 'text-ink';
    let detailClass = 'text-stone hover:text-ink';

    if (plan === 'standard') {
      badgeClass = 'bg-stone/10 text-ink';
      appTitleClass = 'text-ink';
      appTextClass = 'text-ink';
      effectBgClass = 'bg-stone/5';
      effectTextClass = 'text-clay';
      effectValueClass = 'text-ink';
      detailClass = 'text-clay hover:text-ink';
    } else if (plan === 'pro') {
      badgeClass = 'bg-stone/10 text-ink';
      appTitleClass = 'text-ink';
      appTextClass = 'text-ink';
      effectBgClass = 'bg-stone/5';
      effectTextClass = 'text-stone';
      effectValueClass = 'text-ink';
      detailClass = 'text-stone hover:text-ink';
    }

    card.innerHTML = `
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center gap-3">
          <span class="text-4xl">${persona.icon}</span>
          <div>
            <h3 class="font-bold text-lg text-ink">${persona.name}</h3>
            <p class="text-sm text-stone/90">${persona.role}</p>
          </div>
        </div>
        <span class="px-3 py-1 ${badgeClass} rounded text-xs font-semibold">${persona.facility}</span>
      </div>

      <div class="mb-4 space-y-2">
        <div class="flex items-center gap-2 text-sm text-stone/90">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <span>職員数：${persona.staffCount}名</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-stone/90">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          <span>利用者数：${persona.userCount}名</span>
        </div>
      </div>

      <div class="mb-4">
        <h4 class="font-semibold text-ink mb-2 text-sm flex items-center gap-2">
          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          導入前の課題
        </h4>
        <p class="text-sm text-stone leading-relaxed">${persona.problem}</p>
      </div>

      <div class="mb-4 bg-stone/5 rounded-lg p-3 border-l-4 ${plan === 'lite' ? 'border-clay/40' : plan === 'standard' ? 'border-stone/50' : 'border-ink/50'}">
        <h4 class="font-semibold ${appTitleClass} mb-2 text-sm">導入するアプリ</h4>
        <p class="text-sm font-semibold ${appTextClass} mb-2">${persona.app}</p>
        <ul class="text-xs text-stone space-y-1 list-disc pl-4">
          ${persona.appFeatures.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>

      <div class="border-t border-stone/15 pt-4">
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="${effectBgClass} rounded-lg p-3 text-center border-2 ${plan === 'lite' ? 'border-clay/20' : plan === 'standard' ? 'border-stone/25' : 'border-ink/20'}">
            <div class="flex items-center justify-center gap-1 mb-1">
              <svg class="w-4 h-4 ${effectTextClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-xs ${effectTextClass} font-semibold">削減時間</p>
            </div>
            <p class="text-xl font-bold ${effectValueClass}">${persona.effects.timeReduction}</p>
          </div>
          <div class="${effectBgClass} rounded-lg p-3 text-center border-2 ${plan === 'lite' ? 'border-clay/20' : plan === 'standard' ? 'border-stone/25' : 'border-ink/20'}">
            <div class="flex items-center justify-center gap-1 mb-1">
              <svg class="w-4 h-4 ${effectTextClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-xs ${effectTextClass} font-semibold">削減コスト</p>
            </div>
            <p class="text-xl font-bold ${effectValueClass}">${persona.effects.costReduction}</p>
          </div>
        </div>
        <div class="bg-stone/5 rounded-lg p-2 mt-2">
          <p class="text-xs text-stone/90 italic flex items-start gap-2">
            <svg class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>${persona.effects.stressReduction}</span>
          </p>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-stone/15">
        <details class="text-sm">
          <summary class="cursor-pointer font-semibold ${detailClass} flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            詳細を見る
          </summary>
          <div class="mt-3 space-y-3 text-xs text-stone">
            <div class="bg-stone/5 rounded-lg p-3">
              <h5 class="font-semibold mb-2 flex items-center gap-2">
                <svg class="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                導入前のシナリオ
              </h5>
              <p class="leading-relaxed">${persona.beforeScenario}</p>
            </div>
            <div class="bg-stone/5 rounded-lg p-3 border-l-4 border-clay/30">
              <h5 class="font-semibold mb-2 flex items-center gap-2 text-ink">
                <svg class="w-4 h-4 text-clay" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                導入後の変化
              </h5>
              <p class="leading-relaxed text-ink">${persona.effects.story}</p>
            </div>
          </div>
        </details>
      </div>
    `;

    return card;
  }

  // 全ペルソナを一括表示（タブなし）
  function generateAllPersonaCards() {
    const container = document.getElementById('all-personas');
    if (!container) return;

    container.innerHTML = '';
    ['lite', 'standard', 'pro'].forEach(function(plan) {
      const planPersonas = personas[plan];
      if (!planPersonas) return;
      planPersonas.forEach(function(persona, index) {
        const card = createPersonaCard(persona, plan, index);
        container.appendChild(card);
      });
    });
  }

  // 初期化
  document.addEventListener('DOMContentLoaded', function() {
    // all-personas コンテナがある場合は全件表示（plans.html新版）
    if (document.getElementById('all-personas')) {
      generateAllPersonaCards();
    } else {
      // 旧版タブ表示（互換）
      initTabs();
      generatePersonaCards('lite');
    }
  });
})();

