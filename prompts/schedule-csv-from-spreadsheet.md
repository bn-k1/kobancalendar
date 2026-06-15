# Prompt — generate the 3 shift-table CSVs from ANY office roster

Paste the prompt below into a browser LLM (ChatGPT, Claude, Gemini …) **together
with the office roster file** (`.xls` / `.xlsx` / `.pdf` / photo). It asks the
model to emit the exact three CSVs this app builds from: `weekday.csv`,
`saturday.csv`, `holiday.csv`.

Design goal: **format-agnostic.** Offices lay their 交番表 out very differently —
slots as rows or columns, transposed grids, 縦書き (vertical) text, 2 vs 3 vs 4
day-type splits, times written as `HH:MM` / ranges / decimals / 翌-notation. The
prompt therefore pins only the **output contract** (rigid) and teaches the model
to read *any* roster by its **meaning** (a cyclic コマ rotation), not by a fixed
layout. It runs in 3 passes — declare the detected structure, emit the CSVs,
report assumptions — so misreads surface instead of hiding.

Why this exact output: the importer (`src/composables/useScheduleImport.js`) and
`scripts/convertCsv.js` accept only `subject,startTime,endTime` rows, one per
rotation slot (コマ), no header, with all three files the **same** row count.
Overnight shifts use over-24h times (e.g. `25:05`, hours `00`–`47`). Anything the
model cannot read must come back as `?` so the admin fixes it instead of trusting
a guess — `?` rows fail validation on purpose, so nothing half-read reaches a build.

---------------------------------------------------------------------------
COPY FROM HERE
---------------------------------------------------------------------------

あなたは交番表（cyclic shift schedule）のデータ変換の専門家です。
これから添付する交番表（Excel / PDF / 画像のいずれか）を読み取り、後述する
**3つのCSV**に変換します。営業所ごとにレイアウトは大きく異なります — 縦書き、
行と列が入れ替わった表、2区分／3区分／4区分など。**見た目のレイアウトに依存せず、
「交番表とは何か」という意味から読み取って**ください。憶測で値を作ることは固く
禁止します。読めない・確信が持てない箇所は必ず `?` にしてください。

## まず「交番表」の本質（レイアウトに依存しない定義）
- 交番表は**コマ（rotation slot）の循環列**です。職員は日が変わるごとに次のコマへ
  進み、最後のコマの次は先頭コマへ戻ります（append-only の循環）。
- 各コマには、その日の**曜日区分**に応じた勤務が割り当てられます。区分は通常
  「平日／土曜／日祝」。営業所により「平日／休日」の2区分や、別表記のこともあります。
- 各勤務には**勤務名・開始時刻・終了時刻**があります。休み／空きのコマは勤務名のみ
  で時刻はありません。
- あなたの仕事は、この「コマ × 曜日区分」の表を、下記3ファイルに写し取ることです。

## 出力の厳密な規約（ここは固定。レイアウトが何であれ必ず守る）
出力は3ファイル： `weekday.csv`（平日）, `saturday.csv`（土曜）, `holiday.csv`（日祝）。
各ファイル共通：
- 1行 = 1コマ。**コマの循環順**で、1行目 = コマ1。
- 列はちょうど3つ、カンマ区切り： `勤務名,開始時刻,終了時刻`（ヘッダ無し・引用符無し・
  余分な空白無し・各行カンマちょうど2個）。
- **3ファイルの行数は完全一致**（コマ数 N が同じ）。
- 時刻は24時間 `HH:MM` ゼロ埋め（例 `05:18`, `12:55`）。
  - 日跨ぎ勤務は **24時超え表記**をそのまま使う（翌1:00→`25:00`、翌0:42→`24:42`）。
    `24` を引いて丸めない。時は `00`〜`47`。
- 休み・空きコマは勤務名のみ、開始・終了は**両方空**（例 `公休,,` `法休,,` `空,,`）。
  非勤務ラベル（公休/法休/週休/明け/非番/空 など）は原文のまま勤務名に入れる。

## どんなレイアウトでも読むための手順
**1. 向き・配置を見極める。** コマが縦に並ぶか横に並ぶか、表が転置されているか、
   文字が縦書きかを最初に判断する。必要なら頭の中で回転・転置して読む。最終的な
   出力は「コマ＝行」で揃える（ソースでコマが列なら列を行に読み替える）。

**2. 曜日区分を見つけ、3ファイルへ対応づける。** 区分の表現は様々（別の列・別の表・
   別シート・色分け・見出し・注記など）。検出した区分数に応じて以下で必ず3ファイル化する：
   - 平日／土曜／日祝 の3区分 → そのまま weekday / saturday / holiday。
   - 平日／休日 の2区分 → weekday=平日、saturday と holiday は両方「休日」。
   - 平日／土／日／祝 の4区分 → weekday=平日、saturday=土、holiday=日（日と祝が
     食い違うなら祝を優先、もしくは注記に従う）。
   - 区分が1種類しかない → 3ファイルとも同一内容。
   - 「土と同じだが日祝のみ◯◯」等の注記があるコマは、その注記分だけ holiday を
     差し替える（注記が無いコマは saturday を複製）。
   - どの場合も**必ず3ファイル・同一行数**で出す。採用した対応づけは最後に明記する。

**3. 各コマの勤務名・開始・終了を取り出す。**
   - 勤務名：路線/業務コードや勤務記号を原文のまま（スラッシュ・接頭字・英数字も保持）。
     装飾記号（丸数字・★など意味の無い飾り）は除く。読めなければ `?`。
   - 開始・終了：表記は様々 — `HH:MM`、`5:18〜18:48` の範囲、`出/退`・`始/終`・
     `出勤/退勤` のラベル付き、1日の小数（例 `0.538`＝12:55。時=floor(値×24)、
     分=round((値×24−時)×60)）、`翌1:00` のような翌日表記（→`25:00`）。どの表記でも
     `HH:MM`（24時超え可）に正規化する。「中休/拘束/超過/つなぎ」等の内訳値は時刻
     ではないので使わない。
   - 休み・空きは時刻を空にする。

**4. 不明値は必ず `?`（最重要）。** 勤務名・開始・終了のどれかが確信を持って読めなければ
   その項目を `?` にする（例 `128,?,23:06`、コマ全体不明なら `?,?,?`）。時刻を捏造しない。
   コマ数や区分構造が判別できないときも、勝手に決めず最善の解釈と不明点を明記する。

## 回答フォーマット（3パス）
**パス1 — 構造の宣言：** 出力の前に、読み取った構造を短く説明する。
（向き／コマがどこにどう並ぶか／検出した曜日区分と3ファイルへの対応／時刻の表記法／
推定コマ数 N。）
**パス2 — CSV出力：** `weekday.csv` → `saturday.csv` → `holiday.csv` の順に、それぞれ
**独立したコードブロック**で（ブロック内はCSV本文のみ、ファイル名はブロック直前に記載）。
3ファイルの行数は一致させる。
**パス3 — レポート：** 箇条書きで、(a) コマ数 N、(b) `?` を入れた箇所一覧（ファイル・
行・理由）、(c) 行った仮定・曖昧点（区分の対応づけ、注記の解釈、向きの判断など）。

それでは添付ファイルを読み取り、パス1から順に進めてください。

---------------------------------------------------------------------------
COPY TO HERE
---------------------------------------------------------------------------

## Notes for the admin (not part of the prompt)

- **It's a teaching prompt, not a parser.** It deliberately makes the model
  *declare* what it saw (pass 1) before emitting rows, so a wrong orientation or
  day-type guess is visible at the top instead of silently baked into 130 rows.
- **One worked layout, for intuition only:** a horizontal sheet where each コマ has
  a 平日 row and a 土・日・祝 row, with 出 as a day-fraction and 退 as `HH:MM`:
  slot with duty `134`, 出 `0.666`, 退 `24:42` → `134,15:59,24:42`; an off slot →
  `公休,,`; a holiday-only blank noted 日祝は空コマ → `空,,` in `holiday.csv` only.
  Your office's sheet may look nothing like this — that's expected; the prompt
  reads by meaning, not by this layout.
- **After import:** replace every `?` with the real value before committing. The
  importer rejects malformed times and `?` rows on purpose, so nothing half-read
  reaches a build.
- If a particular office's format keeps tripping the model, add one line to pass 2
  describing that office's quirk (e.g. "この表は縦書きで、コマは右列から左へ進む")
  — a single concrete hint beats rewriting the whole prompt.
