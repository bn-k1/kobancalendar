# KobanCalendar

周期的な交番表（シフト表）をWebカレンダーとして公開する、Vue 3製のSPAです。管理者がデータを設定・ビルドし、静的ホスティングで配信する想定です。

**デモ:** https://bn-k1.github.io/kobancalendar/

---

## 技術スタック

| 用途 | ライブラリ |
|------|-----------|
| UIフレームワーク | Vue 3 + Pinia |
| カレンダー | FullCalendar 6 |
| 日付処理 | dayjs + japanese-holidays |
| ビルド | Vite 6 |

---

## セットアップ

```bash
git clone https://github.com/bn-k1/kobancalendar.git
cd kobancalendar
npm install
```

---

## データ構成

### `config/config.json`

アプリ全体の設定ファイルです。必須フィールドのみの最小構成例：

```json
{
  "default_base_date": "YYYY-MM-DD",
  "custom_holidays":   ["08-12", "08-13", "12-31", "01-02"],
  "url":               "https://yourname.github.io/yourcalendar/"
}
```

運用パターンに応じて以下の任意フィールドを追加できます：

```json
{
  "old_base_date":   "YYYY-MM-DD",
  "position_shift":  31,
  "next_base_date":  "YYYY-MM-DD",
  "schedule_update": "YYYY-MM-DD"
}
```

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `default_base_date` | ✅ | シフト計算の基準日です。`(コマ位置-1 + 基準日からの日数差) % サイクル長` で当日のコマを決めます |
| `old_base_date` | - | 旧基準日です。`position_shift` と併用して移行アラートを表示できます |
| `position_shift` | - | 基準日更新時に全員へ加算するコマ数です |
| `next_base_date` | - | コマ位置移動日です。設定すると基準日選択UIが表示され、移動前後を切り替えられます。`schedule_update` とは同時に設定できません |
| `schedule_update` | - | 交番表の内容が切り替わる日付です。この日以降は `data/next/` のCSVが使われます。`next_base_date` とは同時に設定できません |
| `custom_holidays` | - | 祝日ライブラリに含まれない独自休日（`MM-DD` 形式）です。毎年繰り返し適用されます |
| `url` | - | QRコード生成に使うURLです |

### `data/default/` — 現行交番表CSV

`weekday.csv`（平日）、`saturday.csv`（土曜）、`holiday.csv`（日・祝）の3ファイルを使います。

フォーマットは `subject,startTime,endTime`（ヘッダー行なし）です。

```csv
公休,,
法休,,
早番,08:00,16:00
遅番,16:00,00:00
夜勤,00:00,08:00
```

- 行数 = サイクル長（全ファイルでそろえてください）
- 1行目が「コマ1」に対応
- 休日などで時刻不要な行は `subject,,` とします

### `data/next/` — 次期交番表CSV

`schedule_update` または `next_base_date` を使う運用時に参照されます。フォーマットは `data/default/` と同じです。

### `config/event.json` — イベント表示設定

予定名のキーワードに応じて、カレンダー上の色や時刻表示を切り替えます。

```json
{
  "events": {
    "restDay": { "keywords": ["公休", "法休"], "color": "red",          "showTime": false },
    "empty":   { "keywords": ["空"],           "color": "deepskyblue",  "showTime": false },
    "special": { "keywords": ["黄"],            "color": "orange",       "showTime": true  },
    "edited":  { "keywords": [],               "color": "magenta",      "showTime": true  },
    "default": { "keywords": [],               "color": "deepskyblue",  "showTime": true  }
  }
}
```

`edited`・`default` の `keywords` は空配列のままでOKです（アプリ内部で判定します）。

### `data/menu/` — 食堂メニュー（任意）

ファイル名: `YYYY-MM-a.txt`（A定食）、`YYYY-MM-b.txt`（B定食）

内容は1行1日のテキストです。月の1日から順に書いてください。

```
定休日
鶏肉の唐揚げ
キムチチャーハン
```

ファイルがない月は表示されません。

---

## ビルドパイプライン

CSVやJSONをアプリが直接読むのではなく、ビルド前処理で中間JSONに変換してからViteでバンドルします。

```
data/**/*.csv  ──┐
data/menu/*.txt ─┤  npm run build-prep  ├─→  data/**/default.json
config.json ─────┘  (scripts/)          ├─→  data/menu/menu.json
                                         └─→  data/qr.png
```

**`config.json` やCSVを編集したら、`npm run build-prep` を忘れずに実行してください。**

### コマンド一覧

```bash
npm run dev            # 開発サーバー起動 (http://localhost:5173)
npm run build-prep     # CSV→JSON変換 + QR生成のみ
npm run build          # build-prep + 本番ビルド → dist/
npm run build-gh-pages # build-prep + GitHub Pages用ビルド → docs/
npm run preview        # 直前のビルド結果をローカルでプレビュー

# 個別実行
npm run convert-csv    # data/**/*.csv → JSON
npm run convert-menu   # data/menu/*.txt → JSON
npm run create-qr      # config.json の url フィールドからQR生成
```

### デプロイ

| 環境 | コマンド | 配信ディレクトリ |
|------|---------|----------------|
| 任意のWebサーバー | `npm run build` | `dist/` |
| GitHub Pages | `npm run build-gh-pages` | `docs/` |

---

## 運用: スケジュール移行パターン

### パターン1 — 掲示物の貼り替え（基準日の単純更新）

コマ表自体は変わらず、基準日だけを更新する場合です。

1. `config.json` の `default_base_date` を新しい基準日に変更
2. （任意）`old_base_date` に旧基準日、`position_shift` に全員へのコマ加算数を設定
   - 設定しておくと、旧URLにアクセスしたユーザーへ新コマ位置のアラートを表示できます

### パターン2 — 各員のコマ位置のみ移動

コマ表の内容は変わらず、全員のコマ位置だけが一斉にずれる場合です。

1. `config.json` の `next_base_date` に移動日を設定
2. `data/default/` の内容を `data/next/` にコピー

> `schedule_update` は設定しません。ユーザーは基準日選択UIで移動前後を切り替えられます。

### パターン3 — 交番表の内容のみ変更

コマ番号は変わらず、各コマの勤務内容だけが変わる場合です。

1. `config.json` の `schedule_update` に変更開始日を設定
2. `data/next/` に新しいCSVを作成

> `next_base_date` は設定しません。`schedule_update` 以降は自動的に `data/next/` が参照されます。

### パターン4 — コマ位置移動 + 交番表変更の同時実施

1. `config.json` の `next_base_date` に移動日を設定
2. `data/next/` に新しいCSVを作成

> `schedule_update` は設定しません（`next_base_date` が優先されます）。

---

## 備考

- テストスイートはまだありません。動作確認は `npm run dev` で手動でお願いします。
- 本リポジトリのサンプルデータはAI生成で、特定の組織とは無関係です。
- ライセンス: MIT
