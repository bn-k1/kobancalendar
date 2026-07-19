# KobanCalendar

周期的な交番表（シフト表）をWebカレンダーとして公開する、 Vue 3 製の SPA です。GitHub Pages で静的配信され、配信後の日々の更新は Web の管理画面だけで完結します。

- **デモ:** https://bn-k1.github.io/kobancalendar/
- **管理ガイド:** https://bn-k1.github.io/kobancalendar/admin.html
- **利用者マニュアル:** https://bn-k1.github.io/kobancalendar/manual.html

管理ガイドと利用者マニュアルは本家配信版へのリンクですが、内容は fork 先でも同一です。

---

## 自分の職場に導入する（テンプレート → ゼロコンフィグ）

コードの書き換えは不要です。ここに載せるのは**サイトを最初に配信するまでの手順**だけです。トークンの発行や、交番表・独自休日・表示ルール・食堂メニューの日々の更新といった配信後の運用は、すべて**管理ガイド**に従ってください。

1. **"Use this template" → "Create a new repository"** で自分のアカウント／組織に Public リポジトリとしてコピーする。fork でも動きますが、fork は GitHub Actions が既定で無効になるため、テンプレートからの作成を推奨します。
2. コピーした repo の **Settings → Pages → Source** を「**GitHub Actions**」にする。GitHub の設定画面を触るのはこの1回だけです。
3. 初回だけは自動起動しないため、**Actions タブ → "Deploy to GitHub Pages" → "Run workflow"** で最初の配信を手動で走らせる。緑のチェックになれば配信完了。以降は管理画面での保存のたびに CI が自動でビルド・配信します。
4. 配信された `https://<owner>.github.io/<repo>/admin.html`（自分の管理ガイド）を開き、手順に従ってトークン（classic PAT）を発行し、管理画面 `https://<owner>.github.io/<repo>/#/admin` に接続する。

運用担当者が覚える URL は自分の `#/admin` だけです。利用者に見せないためカレンダーからはリンクされていないので、ブックマークしてください。管理ガイドは管理画面の中からも開けます。利用者には配信 URL を伝えるだけでよく、利用者マニュアルはアプリ内のヘルプボタンから開けます。

URL は必ず**自分のコピーのもの**（`<owner>` / `<repo>` を読み替えたもの）を開いてください。各コピーは独立しており、本家（`bn-k1`）の管理画面から自分のリポジトリには書き込めません。

---

## 開発者向け

技術スタック、ローカル開発のセットアップ、`config/`・`data/` のファイル仕様、ビルドパイプライン、状態管理の設計は [DEVELOPMENT.md](DEVELOPMENT.md) にまとめています。導入と運用にターミナル作業は不要なので、利用者・運用担当者が読む必要はありません。

## 備考

- 本リポジトリのサンプルデータはAI生成で、特定の組織とは無関係です。
- ライセンス: MIT
