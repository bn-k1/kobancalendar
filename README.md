# KobanCalendar

## 概要
交番表に基づいた勤務スケジュールを自動生成・管理するためのツールです。  


## 交番表とは 
交番表とは、特定の作業を行う担当者の勤務順を決めたローテーション表 である。
各担当者には基準日を起点とした番号が割り振られ、毎日次の番号のシフトを担当する。
例えば、基準日に「83番」の勤務を担当した人は、翌日「84番」の勤務を担当する。
番号が最後まで進むと、翌日は最初の番号に戻る（循環する）。
各勤務には作業内容・開始時間・終了時間が記載され、個々のスケジュールが明確になる。
交番表を使うことで、組織全体の業務を円滑に回すことができる。


## インストール手順

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
     "custom_holidays": ["08/15", "12/30"]
   }
   ```

   - `base_dates`: シフト計算の基準日（YYYY-MM-DD形式）。複数登録可能。単一でも動作します。
   - `holiday_years_range`: 祝日データ取得年数。
   - `custom_holidays`: 独自に設定するカスタム祝日の配列。

4. `data/`の.csv（`weekday.csv`:平日,`saturday.csv`:土曜,`holiday.csv`:日祝）を編集します。フォーマットは以下のとおりです。全てのファイルの行数は同じある必要があります。

   ```csv
   Subject,StartTime,EndTime
   早番,08:00,16:00
   遅番,16:00,00:00
   夜勤,00:00,08:00
   ```


5. アプリケーションを実行します。

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


## 注意点

本リポジトリのデータはAIによって生成されたサンプルです。特定の組織や企業とは関係ありません。


## ライセンス

- MIT License

