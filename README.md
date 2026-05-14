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

アプリ全体の設定ファイルです。最小構成例：

```json
{
  "schedules": [
    { "from": "YYYY-MM-DD", "data": "default" }
  ],
  "custom_holidays": ["08-12", "08-13", "12-31", "01-02"],
  "url": "https://yourname.github.io/yourcalendar/"
}
```

| フィールド | 必須 | 説明 |
|-----------|------|------|
| `schedules` | ✅ | 交番表の「世代」を時系列に並べた配列です。詳細は下記 |
| `custom_holidays` | - | 祝日ライブラリに含まれない独自休日（`MM-DD` 形式）です。毎年繰り返し適用されます |
| `url` | - | QRコード生成に使うURLです |

#### `schedules` — 交番表の世代リスト

交番表の移行履歴を、追記専用（append-only）の配列で表します。各要素（＝世代）は：

| キー | 説明 |
|------|------|
| `from` | その世代が有効になる日（`YYYY-MM-DD`）。配列は `from` 昇順 |
| `data` | その世代の交番表CSVが入るフォルダ名（`data/<data>/`）。中身が変わらない移行なら前の世代と同じフォルダを指す |

- ある世代の表示窓は `[from, 次の世代の from)`。最後の世代は `[from, ∞)`。
- シフト計算の基準日は、いま表示している世代の `from` です（`(コマ位置-1 + 基準日からの日数差) % サイクル長` で当日のコマを決めます）。
- 「いまの世代」＝ `from` が今日以前で最後の世代。新規ユーザーや共有URLの受け手はこの世代で開きます。
- 未来の世代があれば基準日選択UIに「新版」として並び、移行日前にプレビューできます。
- 過去の世代の `from` を保存しているユーザーには、移行アラート（現世代の `from` までの日数差ぶんコマ位置をずらした候補）が表示されます。

### `data/<folder>/` — 交番表CSV

`schedules[].data` が参照するフォルダです（例: `data/default/`）。各フォルダは `weekday.csv`（平日）、`saturday.csv`（土曜）、`holiday.csv`（日・祝）の3ファイルを持ちます。

フォーマットは `subject,startTime,endTime`（ヘッダー行なし）です。

```csv
公休,,
法休,,
早番,08:00,16:00
遅番,16:00,00:00
夜勤,00:00,08:00
```

- 行数 = サイクル長（同一フォルダの3ファイルでそろえてください）
- 1行目が「コマ1」に対応
- 休日などで時刻不要な行は `subject,,` とします
- `schedules` が参照するフォルダは必ず完全な3ファイルを持つ必要があります（空フォルダはビルドエラー）

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
data/<folder>/*.csv ──┐                       ├─→  data/scheduleData.json
data/menu/*.txt ──────┤  npm run build-prep   ├─→  data/menu/menu.json
config.json ──────────┘  (scripts/)           └─→  data/qr.png
```

`convert-csv` は `config.json` の `schedules[].data` で参照されるフォルダだけを変換し、`data/scheduleData.json`（フォルダ名をキーにした統合バンドル）を出力します。

**`config.json` やCSVを編集したら、`npm run build-prep` を忘れずに実行してください。**

### コマンド一覧

```bash
npm run dev            # 開発サーバー起動 (http://localhost:5173)
npm run build-prep     # CSV→JSON変換 + QR生成のみ
npm run build          # build-prep + 本番ビルド → dist/
npm run build-gh-pages # build-prep + GitHub Pages用ビルド → docs/
npm run preview        # 直前のビルド結果をローカルでプレビュー

# 個別実行
npm run convert-csv    # config.schedules が参照する CSV → data/scheduleData.json
npm run convert-menu   # data/menu/*.txt → JSON
npm run create-qr      # config.json の url フィールドからQR生成
```

### デプロイ

| 環境 | コマンド | 配信ディレクトリ |
|------|---------|----------------|
| 任意のWebサーバー | `npm run build` | `dist/` |
| GitHub Pages | `npm run build-gh-pages` | `docs/` |

---

## 運用: スケジュールの移行

交番表が変わるとき（掲示物の貼り替え、コマ位置の一斉移動、勤務内容の変更）は、種類を問わず **`schedules` 配列に世代を1つ追記するだけ** です。

```json
{
  "schedules": [
    { "from": "2025-11-16", "data": "default" },
    { "from": "2026-05-16", "data": "default" }
  ]
}
```

1. `config.json` の `schedules` に `{ "from": 移行日, "data": フォルダ名 }` を追記する。
2. **交番表の中身が変わらない場合**（基準日の更新／コマ位置の一斉移動）→ `data` は前の世代と同じフォルダ名を指す。
3. **交番表の中身が変わる場合** → `data/<新フォルダ>/` に新しいCSV3点を用意し、`data` にそのフォルダ名を指定する。
4. `npm run build-prep`（または `npm run build` / `build-gh-pages`）を実行する。

これだけで、移行日以降は新しい世代が「いまの世代」になり、移行日前は基準日選択UIに「新版」としてプレビュー表示されます。過去の世代を保存しているユーザーには、コマ位置の移行アラートが自動で出ます（コマ位置のずれ＝世代間の日数差として算出）。

> 古くなった世代は配列に残しておけば移行アラートの基準として機能し続けます。表示UIには「いまの世代」と隣接する世代しか出ないため、配列が伸びても画面は煩雑になりません。十分に古い世代は、参照しているデータフォルダごと手動で整理して構いません。

---

## 状態の保存

ユーザー選択（基準日・コマ位置・飲み会検索条件）は URL ではなく `localStorage` に保存されます。

| キー | 形状 | 内容 |
|------|------|------|
| `kobancalendar.savedSelection.v1` | `{ active, positions: { [baseDate]: number } }` | Home のコマ位置。版ごとに別々の位置を記憶 |
| `kobancalendar.savedMeetup.v1` | `{ active, sets: { [baseDate]: { participants, startTime, period } } }` | 飲みに行くンダーの検索条件。版ごとに別々の set を記憶 |

- `active` は最後に開いていた baseDate（ISO 文字列）。次回ロード時に復元されます。
- 旧版では `?baseDate=...&startNumber=...` といった URL クエリでも受け付けます（HomeView が1度だけ読み取って localStorage に移し、URL をクリア）。
- Meetup は専用の保存データが無い場合、Home の localStorage から現在の baseDate に対応する位置を拾って初期参加者として利用します。

## 備考

- テスト: npm test
- 本リポジトリのサンプルデータはAI生成で、特定の組織とは無関係です。
- ライセンス: MIT
