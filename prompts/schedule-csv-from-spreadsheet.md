# Prompt — generate the 3 shift-table CSVs from an office spreadsheet

Paste the prompt below into a browser LLM (ChatGPT, Claude, Gemini …) **together
with the office roster file** (`.xls` / `.xlsx` / `.pdf`). It asks the model to
emit the exact three CSVs this app builds from: `weekday.csv`, `saturday.csv`,
`holiday.csv`.

Why this shape: the app's importer (`src/composables/useScheduleImport.js`) and
`scripts/convertCsv.js` accept **only** rows of `subject,startTime,endTime`, one
row per rotation slot (コマ), no header, and require all three files to have the
**same** row count. Overnight shifts use over-24h times (e.g. `25:05`), which the
importer now accepts (hours `00`–`47`). Anything the model cannot read must come
back as `?` so the admin fixes it in the editor instead of trusting a guess.

The prompt is written so it does NOT depend on this particular office's layout —
it states the target format precisely and tells the model how to map a typical
交番表 roster onto it. Tweak the "Source layout" section if your sheet differs.

---------------------------------------------------------------------------
COPY FROM HERE
---------------------------------------------------------------------------

あなたは交番表（cyclic shift schedule）のデータ変換アシスタントです。
添付した交番表ファイル（Excel または PDF）を読み取り、下記フォーマットの
**CSV を3つ**だけ生成してください。憶測で値を埋めることは禁止です。読めない・
確信が持てない箇所は必ず `?` を入れてください。

## 出力する3ファイル
`weekday.csv`（平日）, `saturday.csv`（土曜）, `holiday.csv`（日曜・祝日）。

## 各CSVの厳密な仕様
- 1行 = 1コマ（ローテーションの1スロット）。コマ番号の昇順で、1行目 = コマ1。
- 列は必ず3つ、カンマ区切り： `勤務名,開始時刻,終了時刻`
  - ヘッダ行なし。引用符なし。余分な空白なし。各行ちょうどカンマ2個。
- **3ファイルの行数は完全に一致**させること（コマ数 N が同じ）。最後に N を報告。
- 時刻は24時間表記の `HH:MM`、ゼロ埋め（例 `05:18`, `12:55`）。
  - 日跨ぎ勤務は **24時超え表記**をそのまま使う（例 退勤が翌1時なら `25:00`、
    翌0:42 なら `24:42`）。`24` を引いて `23:59` に丸めたりしないこと。時は `00`〜`47`。
- 休み・空きコマは勤務名のみで、開始・終了は**両方とも空**：
  - 例 `公休,,` / `法休,,` / `空,,`（"公休" "法休" "空" 等の非勤務ラベルはそのまま）。

## ソース（交番表）の読み取り方
典型的な交番表は次の構造です。あなたの添付ファイルに合わせて解釈してください。
- 横方向の見出し（1, 2, 3, …）が**コマ番号**。ブロックごとに折り返して N コマまで続く。
- 各コマに2段の割り当て行がある：
  - 「平日」段 → `weekday.csv` の該当コマ。
  - 「土・日・祝」段 → `saturday.csv` の該当コマ。
  - `holiday.csv` は原則 `saturday.csv` と同じ。ただしセル付近に
    「日・祝は空コマ」「日祝→空」等の注記があるコマだけ、`holiday.csv` 側を
    `空,,` に差し替える（または注記どおりの時刻に変える）。注記が無いコマは
    土曜と同じ値を複製する。
- **勤務名（subject）** = コマ欄の路線/業務コード。`110`, `T809/810`, `黄815`,
  `W101/102`, `101/102`, `A予備`, `P予備` のように、スラッシュや接頭字
  （T, 黄, W, J 等）も含めてそのまま転記。`❶` のような装飾記号は除く。
  判別不能なら `?`。
- **開始時刻** = そのコマの「出（出勤）」の値。もし1日の小数（例 `0.538`）で
  入っていたら時刻に変換： 時 = floor(値×24)、分 = round((値×24 − 時)×60)、
  ゼロ埋め（例 `0.538` → `12:55`、`0.221` → `05:18`）。
- **終了時刻** = そのコマの「退（退勤）」の値。既に `HH:MM`。24時超えは**そのまま**。
- 「中休」「つなぎ」「拘」「超」等の行は時刻ではなく内訳情報なので、開始/終了には**使わない**。

## 不明値の扱い（最重要）
- 勤務名・開始・終了のいずれかが確信を持って読めない場合、その項目を `?` にする。
  例： `128,?,23:06` ／ コマ全体が不明なら `?,?,?`。
- 絶対に時刻を捏造しないこと。`?` のままにして人間に委ねる。

## 出力フォーマット
1. まず `weekday.csv`、次に `saturday.csv`、最後に `holiday.csv` を、それぞれ
   **独立した```のコードブロック**で出力（ブロック内はCSV本文のみ、ファイル名は
   ブロックの直前に書く）。
2. 3ブロックの後に、箇条書きで：
   - コマ数 N（3ファイルとも一致していること）。
   - `?` を入れた箇所の一覧（どのファイルの何行目・なぜ読めなかったか）。
   - 行った仮定・曖昧だった点（土日と祝の差、注記の解釈など）。

それでは添付ファイルを読み取り、上記に従って3つのCSVを生成してください。

---------------------------------------------------------------------------
COPY TO HERE
---------------------------------------------------------------------------

## Worked examples (for your own sanity-check, not part of the prompt)

From a real `交番表` sheet, slot 6 on a weekday shows duty `134`, 出 `0.666`,
退 `24:42` → CSV row `134,15:59,24:42`. Slot 3 shows `110`, 出 `0.538`,
退 `20:41` → `110,12:55,20:41`. An off slot → `公休,,`. A holiday-only blank
where the sheet notes 日祝は空コマ → that row becomes `空,,` in `holiday.csv`
while `saturday.csv` keeps the duty.

## After import
Drop the three CSVs into the admin importer (Phase 4). Replace every `?` with the
real value before committing — the importer rejects malformed times, and `?`
rows will fail validation on purpose so nothing half-read reaches a build.
