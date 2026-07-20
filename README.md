# 嶽ノ子 ランディングページ

介護現場向けオーダーメイド業務アプリ「嶽ノ子」のランディングページです。静的 HTML + `assets/hig.css` で構成されています。

## デザインシステム

- **本番正本**: `index.html` および各サブページ（通常 HTML）
- **デザイン CSS**: [`assets/hig.css`](assets/hig.css) — dc 暖色トークン + Apple HIG 準拠（system font、44px タッチターゲット、skip-link、`:focus-visible`、`prefers-reduced-motion`）
- **参考のみ**: [`index.dc.html`](index.dc.html) — Dynamic Canvas 形式の参考デザイン（本番では使用しません）

共通 nav / footer は各 HTML に `<!-- SITE SHELL v2 -->` マーカー付きで同一ブロックを埋め込んでいます。

## ページ一覧

| ファイル | 内容 |
|---------|------|
| `index.html` | メイン LP |
| `manager.html` 他 FOR 系 4 | ターゲット別 LP |
| `sample-app.html` | 見本アプリ |
| `business-improvement.html` | 業務改善支援 |
| `subsidy-app.html` | 国の補助金 |
| `company.html` | 運営者情報 |
| `privacy.html` / `terms.html` / `conflict-of-interest.html` | 法務 |

## デプロイ

GitHub Pages: Settings → Pages → `main` ブランチ `/ (root)` を選択。

## 連絡先

嶽ノ子 — kotaro.otake@takenokonoko.com
