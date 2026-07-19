# KobanCalendar

周期的な交番表（シフト表）をWebカレンダーとして公開する、 Vue 3 製の SPA です。GitHub Pages で静的配信され、配信後の日々の更新は Web の管理画面だけで完結します。

- **デモ:** https://bn-k1.github.io/kobancalendar/
- **導入ガイド:** https://bn-k1.github.io/kobancalendar/setup.html
- **管理ガイド:** https://bn-k1.github.io/kobancalendar/admin.html
- **利用者マニュアル:** https://bn-k1.github.io/kobancalendar/manual.html

各ガイドは本家配信版へのリンクですが、内容は fork 先でも同一です。

---

## 自分の職場に導入する

コードの書き換えは不要です。テンプレートからのコピー → 配信 → トークン発行までの手順は、非エンジニア向けに噛み砕いた**[導入ガイド](https://bn-k1.github.io/kobancalendar/setup.html)**にまとめてあります。配信後の日々の更新（交番表・独自休日・表示ルール・食堂メニュー）は**[管理ガイド](https://bn-k1.github.io/kobancalendar/admin.html)**へ。

運用担当者が覚える URL は自分の `#/admin` だけです。利用者に見せないためカレンダーからはリンクされていないので、ブックマークしてください。利用者には配信 URL を伝えるだけでよく、利用者マニュアルはアプリ内のヘルプボタンから開けます。各コピーは独立しており、本家（`bn-k1`）の管理画面から自分のリポジトリには書き込めません。

---

## 開発者向け

技術スタック、ローカル開発のセットアップ、`config/`・`data/` のファイル仕様、ビルドパイプライン、状態管理の設計は [DEVELOPMENT.md](DEVELOPMENT.md) にまとめています。導入と運用にターミナル作業は不要なので、利用者・運用担当者が読む必要はありません。

## 備考

- 本リポジトリのサンプルデータはAI生成で、特定の組織とは無関係です。
- ライセンス: MIT
