# 嶽ノ子 ランディングページ

これは、嶽ノ子が提供するオーダーメイド業務効率化アプリ（本サービス）のランディングページプロジェクトです。

## 概要

このランディングページは、サービスの紹介、導入事例、料金（ライト／スタンダード／プロの3プランと他サービスとの比較）、導入の流れ、お問い合わせフォームなどを提供します。
静的なHTML、CSS、JavaScriptで構築されています。

## デプロイ

このサイトはGitHub Pagesでデプロイできます。

1. このリポジトリをクローンします。
2. GitHubリポジトリの Settings > Pages に移動します。
3. デプロイ元 (Source) として `main` ブランチの `/(root)` フォルダを選択し、保存します。
4. しばらくすると `https://<ユーザー名>.github.io/landing-page/` で公開されます。

## ファイル構成

- `index.html`: メインのランディングページ
- `company.html`: 会社概要ページ
- `privacy.html`: プライバシーポリシーページ
- `terms.html`: 利用規約ページ
- `src/`:
    - `css/style.css`: スタイルシート
    - `js/app.js`: 共通UI（ナビ/スクロール/フォーム）
    - `js/pricing-constants.js`: 料金の数値マスタ（LP表記と同期）

## 連絡先

嶽ノ子
Email: kotaro.otake@takenokonoko.com
