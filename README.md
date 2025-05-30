# KobanCalendar

## 概要

- 交番表に基づいた勤務スケジュールを自動生成・閲覧するためのツールです。

## 使い方

1. 組織の公表した「基準日」時点での「コマ位置」を選択します。
2. 基準日以降の勤務日程が月ごとに表示されます。
3. アドレス(URL)が変わるので、ブラウザのメニューからブックマーク、または`リロード`してからホーム画面に追加します。
4. いつでも勤務日程を確認できます。

## 機能

- 下段の「エクスポート」からschedule~.icsというファイルをダウンロードして開けば、いつも使っているカレンダーアプリに予定を取り込むことができます。
- カレンダーのみの表示で印刷できます。
- 同僚の方と飲みに行きたいときはフッターのビールのアイコンをクリックしてみましょう。
- QRコードのボタンを押して、職場のみんなに広めましょう。

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
     "default_base_date": "YYYY-MM-DD",
     "next_base_date": "YYYY-MM-DD",
     "custom_holidays": ["MM-DD", "MM-DD"],
     "url": "https://bn-k1.github.io/kobancalendar/"
   }
   ```

   - `default_base_date`: シフト計算の基準日。
   - `next_base_date`: コマ位置の入れ替え予定日。next_base_dateを設定することで入れ替え以降のスケジュールを確認できます。設定しなくても動作します。
   - `custom_holidays`: 独自に設定するカスタム祝日の配列。毎年のお盆休みや年末年始の休みなど。
   - `url`にはURLを記述します。QRコードと.icsのPRODID,UIDに使います。

4. `data/default`以下の.csv（`weekday.csv`:平日,`saturday.csv`:土曜,`holiday.csv`:日祝）を編集します。

   subject,startTime,endTimeの形式で、ヘッダーなし、交番表のコマ数=.csvの行数になるように記述してください。全てのファイルの行数は同じある必要があります。

   ```csv
   遅番,16:00,00:00
   早番,08:00,16:00
   法休,,
   夜勤,00:00,08:00
   ```

   next_base_date以降、交番表データが変わる場合、`data/next`以下の.csvを同じように編集します。変わらない場合、`data/default`の.csvを`data/next`にコピーします。next_base_dateが設定されていない、あるいはまだ次の交番表が存在しない場合は何も置く必要はありません。

5. .csvを.jsonに変換、及びQRコードを生成します。

   ```bash
   npm run prebuild
   ```

6. `event.json`の公休、空、などを色分けしたい文字列に置き換えてください。

7. アプリケーションを実行します。

   ```bash
   # 開発サーバー起動
   npm run dev

   # または本番ビルド
   npm run build
   ```

   ブラウザで`http://localhost:5173`にアクセス。

   またはビルドして`dist/`をウェブサーバーで配信。

## デモ

- [https://bn-k1.github.io/kobancalendar/](https://bn-k1.github.io/kobancalendar/)

## 備考

- 本リポジトリの交番表データはAIによって生成されたサンプルです。特定の組織や企業とは関係ありません。

## ライセンス

- MIT License
