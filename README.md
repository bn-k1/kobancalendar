# KobanCalendar

## 概要

- 交番表に基づいた勤務スケジュールを自動生成・閲覧するためのツールです。

## 使い方

1. 組織の公表した「基準日」と、それに対応したユーザーの「コマ位置」を選択します。
2. 交番表データに対応した勤務日程が月ごとに表示されます。
3. アドレス(URL)が変わるので、ブラウザのメニューからホーム画面に追加、あるいはブックマークします。
4. いつでも勤務日程を確認できます。

- 下段の「エクスポート」からschedule~.icsというファイルをダウンロードして開けば、いつも使っているカレンダーアプリに予定を取り込むことができます。

## 注意点

- 基準日とコマ位置の組み合わせが正しいことを確認してご使用下さい。

## インストール手順(管理者用)

1. リポジトリをクローンします。

   ```bash
   git clone https://github.com/bn-k1/kobancalendar.git
   cd kobancalendar
   ```

2. 依存パッケージをインストールします。

   ```bash
   npm install
   ```

3. `config.json`ファイルを設定します。

   ```json
   {
     "base_dates": ["YYYY-MM-DD", "YYYY-MM-DD"],
     "holiday_years_range": 2,
     "custom_holidays": ["MM-DD", "MM-DD"]
   }
   ```

   - `base_dates`: シフト計算の基準日（YYYY-MM-DD形式）。複数登録可能。単一でも動作します。一番前の要素がデフォルトです。
   - `holiday_years_range`: 祝日データ取得年数。
   - `custom_holidays`: 独自に設定するカスタム祝日の配列。

4. `data/`の.csv（`weekday.csv`:平日,`saturday.csv`:土曜,`holiday.csv`:日祝）を編集します。フォーマットは以下のとおりです。全てのファイルの行数は同じある必要があります。Subject,StartTime,EndTimeの形式で、交番表のコマ数=.csvの行数になるように記述してください。

   ```csv
   早番,08:00,16:00
   遅番,16:00,00:00
   夜勤,00:00,08:00
   ```

5. `event.json`の公休、空、などを色分けしたい文字列に置き換えてください。

6. アプリケーションを実行します。

   ```bash
   # 開発サーバー起動
   npm start

   # または本番ビルド
   npm run build
   ```

   ブラウザで`http://localhost:8080`にアクセスすると、カレンダーが表示されます。

   またはビルドして`dist/index.html`をウェブサーバーで配信。

## デモ

- [https://bn-k1.github.io/kobancalendar/](https://bn-k1.github.io/kobancalendar/)

## 備考

- 本リポジトリの交番表データはAIによって生成されたサンプルです。特定の組織や企業とは関係ありません。

## ライセンス

- MIT License
