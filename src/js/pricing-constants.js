/**
 * LP料金表示のマスタ（index.html の表記と同期すること）
 * 価格改定時はここを更新し、index.html 内の同額表記を揃える。
 */
window.LP_PRICING = {
  version: '2026-04',
  comparison: {
    packagedCareSoftwareMonthly: '月額 約1万円前後から',
    contractorInitial: '初期 数百万円規模になりやすい',
    oursInitial: 220000,
    oursMonthly: 33000,
  },
  initialWorkHours: {
    hearing: { min: 3, max: 5, label: 'ヒアリング・課題整理' },
    prototype: { min: 8, max: 15, label: '試作作成' },
    revision: { min: 6, max: 10, label: '修正対応' },
    test: { min: 4, max: 8, label: 'テスト' },
    rollout: { min: 2, max: 4, label: '導入・説明' },
    coordination: { min: 3, max: 5, label: '連絡・調整' },
    totalMin: 26,
    totalMax: 47,
  },
  monthlyMaintHours: { min: 2, max: 8 },
  overtime: {
    perHourMin: 8000,
    perHourMax: 12000,
    meetingPer30MinMin: 5000,
    meetingPer30MinMax: 10000,
  },
  plans: {
    lite: {
      key: 'lite',
      name: 'ライト',
      initial: 220000,
      monthly: 33000,
      scaleHours: '約30〜40時間規模',
    },
    standard: {
      key: 'standard',
      name: 'スタンダード',
      initial: 550000,
      monthly: 55000,
      scaleHours: '約60〜90時間規模',
    },
    pro: {
      key: 'pro',
      name: 'プロ',
      initialFrom: 1100000,
      monthlyFrom: 120000,
      scaleHours: '100時間以上規模',
    },
  },
};
