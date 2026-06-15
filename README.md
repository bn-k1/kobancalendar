# KobanCalendar

周期的な交番表（シフト表）をWebカレンダーとして公開する、Vue 3製のSPAです。管理者がデータを設定・ビルドし、静的ホスティングで配信する想定です。

**デモ:** https://bn-k1.github.io/kobancalendar/

---

## 技術スタック

| 用途             | ライブラリ                |
| ---------------- | ------------------------- |
| UIフレームワーク | Vue 3 + Pinia             |
| カレンダー       | FullCalendar 6            |
| 日付処理         | dayjs + japanese-holidays |
| ビルド           | Vite 6                    |

---

## セットアップ

```bash
git clone https://github.com/bn-k1/kobancalendar.git
cd kobancalendar
npm install
```

---

## 他営業所での導入（fork → ゼロコンフィグ）

別の営業所が自分のカレンダーを立ち上げるのに、コードの書き換えは不要です。GitHub 上の操作だけで完結します。

1. **このリポジトリを fork**（または "Use this template"）して自分のアカウント／組織にコピーする。
2. fork した repo の **Settings → Pages → Source** を「**GitHub Actions**」にする（初回のみ手動。これだけは GitHub の管理画面操作）。push すると CI が自動でビルド・配信する。base path（`/<repo>/`）や QR、フッターの GitHub リンクは実行中の URL から自動導出されるので、URL の直書きは要らない。
3. 配信された `https://<owner>.github.io/<repo>/#/admin` を開き、fine-grained PAT（対象 repo の **Contents: Read and write**）を貼って「保存して接続テスト」。接続できれば管理 UI が出る。

あとは管理画面だけで運用できる：

- **交番表 → CSV 変換プロンプト**：掲示物（Excel・PDF・写真）を ChatGPT / Claude / Gemini に渡し、admin の「プロンプトをコピー」で得たプロンプトと一緒に投げると、`weekday` / `saturday` / `holiday` の3つの CSV が返る（API・課金は不要）。
- **交番表の管理**：その3 CSV を「世代」として追加・編集・削除する。サンプルの `data/default` は AI 生成のダミーなので、最初の世代を自分のデータで追加すれば置き換わる。
- **独自休日**：会社の独自休（盆暮れ等）を MM-DD で編集する。

---

## データ構成

### `config/config.json`

アプリ全体の設定ファイルです。最小構成例：

```json
{
  "schedules": [{ "from": "YYYY-MM-DD", "data": "default" }],
  "custom_holidays": ["08-12", "08-13", "12-31", "01-02"]
}
```

| フィールド        | 必須 | 説明                                                                                                                                                                                                          |
| ----------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `schedules`       | ✅   | 交番表の「世代」を時系列に並べた配列です。詳細は下記                                                                                                                                                          |
| `custom_holidays` | -    | 祝日ライブラリに含まれない独自休日（`MM-DD` 形式）です。毎年繰り返し適用されます                                                                                                                              |
| `url`             | -    | 通常は不要です。GitHub Pages の base path はリポジトリ名から、QRコードはアプリが実行時に自分の `window.location` から自動生成します。独自ドメイン等で base path を上書きしたい場合のみ、配信先URLを指定します |

#### `schedules` — 交番表の世代リスト

交番表の移行履歴を、追記専用（append-only）の配列で表します。各要素（＝世代）は：

| キー   | 説明                                                                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `from` | その世代が有効になる日（`YYYY-MM-DD`）。配列は `from` 昇順・重複不可（違反はビルドエラー）                                                                      |
| `data` | その世代の交番表CSVが入るフォルダ名（`data/<data>/`）。**省略すると直前の世代の `data` を継承します**（コマ位置シフトのみの移行）。先頭世代の `data` は省略不可 |

- ある世代の表示窓は `[from, 次の世代の from)`。最後の世代は `[from, ∞)`。
- シフト計算の基準日は、いま表示している世代の `from` です（`(コマ位置-1 + 基準日からの日数差) % サイクル長` で当日のコマを決めます）。
- 「いまの世代」＝ `from` が今日以前で最後の世代。新規ユーザーや共有URLの受け手はこの世代で開きます。
- 未来の世代があれば基準日選択UIに「新版」として並び、移行日前にプレビューできます。

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
    "restDay": {
      "keywords": ["公休", "法休"],
      "color": "red",
      "showTime": false
    },
    "empty": { "keywords": ["空"], "color": "deepskyblue", "showTime": false },
    "special": { "keywords": ["黄"], "color": "orange", "showTime": true },
    "edited": { "keywords": [], "color": "magenta", "showTime": true },
    "default": { "keywords": [], "color": "deepskyblue", "showTime": true }
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
data/<folder>/*.csv ──┐  npm run build-prep   ├─→  data/scheduleData.json
data/menu/*.txt ──────┘  (scripts/)           └─→  data/menu/menu.json
```

`convert-csv` は `config.json` の `schedules[].data` で参照されるフォルダだけを変換し、`data/scheduleData.json`（フォルダ名をキーにした統合バンドル）を出力します。

これらの生成物（`data/scheduleData.json` / `data/menu/menu.json` / `docs/`）は **git にコミットしません**（`.gitignore` 済み）。GitHub Actions が push のたびにビルドして配信するため、手元で `build-prep` を走らせるのはローカル確認用です。QRコードはビルド不要で、アプリが実行時に自分のURLから生成します。

### コマンド一覧

```bash
npm run dev            # 開発サーバー起動 (http://localhost:5173)。predev で build-prep を自動実行
npm run build-prep     # CSV/TXT → JSON 変換のみ
npm run build          # build-prep + 本番ビルド → dist/
npm run build-gh-pages # build-prep + GitHub Pages用ビルド → docs/（CIが使用）
npm run release        # build-prep → build → build-gh-pages を一括実行
npm run preview        # 直前のビルド結果をローカルでプレビュー

# 個別実行
npm run convert-csv    # config.schedules が参照する CSV → data/scheduleData.json
npm run convert-menu   # data/menu/*.txt → JSON
```

### 自動ビルド・配信（GitHub Actions）

`main` に push すると `.github/workflows/deploy.yml` が走り、`build-prep` → テスト → `build-gh-pages` を実行して GitHub Pages へ配信します。生成バンドルや `docs/` をコミットする必要はありません（CIが毎回作り直します）。

初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を「**GitHub Actions**」に設定してください。

### デプロイ

| 環境              | 方法                                                  | 配信ディレクトリ    | base path                          |
| ----------------- | ----------------------------------------------------- | ------------------- | ---------------------------------- |
| GitHub Pages      | `main` への push（GitHub Actions が自動ビルド・配信） | `docs/`（CIが生成） | リポジトリ名から自動（`/<repo>/`） |
| 任意のWebサーバー | `npm run build`                                       | `dist/`             | `/`（ルート配信）                  |

GitHub Pages の base path はリポジトリ名から自動導出されます（CIが `BASE_PATH` 環境変数で注入。例: リポジトリ名が `kobancalendar` なら `/kobancalendar/`）。リポジトリをフォークして別の営業所で配信する場合、設定の書き換えは不要です。独自ドメイン等で base path を上書きしたいときだけ `config.json` に `url` を指定してください（`src/` 側は `import.meta.env.BASE_URL` を参照するため直書きは不要）。

---

## 運用: スケジュールの移行

交番表が変わるとき（掲示物の貼り替え、コマ位置の一斉移動、勤務内容の変更）は、種類を問わず **`schedules` 配列に世代を1つ追記するだけ** です。

```json
{
  "schedules": [
    { "from": "2026-05-16", "data": "default" },
    { "from": "2026-08-01", "data": "rev2026h2" }
  ]
}
```

1. `config.json` の `schedules` に世代を1つ追記する。
2. **交番表の中身が変わらない場合**（基準日の更新／コマ位置の一斉移動）→ `data` を**省略**する。直前の世代の `data`（CSVフォルダ）を継承します。
   - 例: `{ "from": "2026-05-16" }` … コマ位置シフトのみ（前世代のCSVをそのまま使う）
3. **交番表の中身が変わる場合** → `data/<新フォルダ>/` に新しいCSV3点を用意し、`data` にそのフォルダ名を指定する。
   - 例: `{ "from": "2026-08-01", "data": "rev2026h2" }` … 交番表の内容が変わる移行
4. `npm run build-prep`（または `npm run build` / `build-gh-pages` / `npm run release`）を実行する。

これだけで、移行日以降は新しい世代が「いまの世代」になり、移行日前は基準日選択UIに「新版」としてプレビュー表示されます。

> ビルド時、`from` の昇順・重複はチェックされます（違反はビルドエラー）。コマ位置シフト移行（`data` 継承）なのに世代間の日数差がサイクル長の倍数でない場合や、`from` が極端な未来/過去の場合は警告が出ます — `from` の typo を疑ってください。

> 古い世代は剪定して構いません。表示UIは「いまの世代」と隣接世代しか出さず、過去世代は実行時には参照されない（current epoch を特定するためだけに使われる）ため、追記し続けるか／適宜剪定するかは運用判断です。どの `schedules[].data` からも参照されていない `data/` 配下のフォルダは、ビルド時に「整理候補」として警告が出ます（自動削除はしません）。

---

## 状態の保存

ユーザー選択（コマ位置・飲み会検索条件）は **URL のハッシュクエリ** に反映され、同時に `localStorage` にも保存されます。URL は共有可能な正（canonical）、`localStorage` は再訪時のキャッシュ、という役割分担です。

| ビュー           | URL 形式                                |
| ---------------- | --------------------------------------- |
| Home             | `#/?p=N`（旧版表示時は `#/?v=old&p=N`） |
| 飲みに行くンダー | `#/meetup?ps=1,7,12&t=19:00&d=120`      |

基準日（baseDate）は URL に載せません（`config.schedules` が基準日の真実です）。

| localStorage キー                 | 形状                                                                    | 内容                                                    |
| --------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| `kobancalendar.savedSelection.v1` | `{ active, positions: { [baseDate]: number } }`                         | Home のコマ位置。世代ごとに別々の位置を記憶             |
| `kobancalendar.savedMeetup.v1`    | `{ active, sets: { [baseDate]: { participants, startTime, period } } }` | 飲みに行くンダーの検索条件。世代ごとに別々の set を記憶 |

- `active` は最後に開いていた baseDate（ISO 文字列）。`positions` / `sets` のうち「どの世代の値か」を指すポインタです。
- 起動時は **URL ハッシュクエリ → localStorage → config 既定値** の順に解決し、確定後は URL と localStorage の両方へ同期します（履歴を汚さない `replaceState` ベース）。
- 飲みに行くンダーは専用の保存データが無い場合、Home の localStorage から同じ baseDate のコマ位置を拾って初期参加者として利用します。

## 備考

- テスト: npm test
- 本リポジトリのサンプルデータはAI生成で、特定の組織とは無関係です。
- ライセンス: MIT
