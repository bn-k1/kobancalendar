# KobanCalendar

Personal shift calendar built from a workplace's posted cyclic 交番表, plus
飲みに行くンダー (find days a group is free).
Live at https://bn-k1.github.io/kobancalendar/ (staff manual: `manual.html`).

## What it is

- Static Vue 3 SPA on GitHub Pages. No backend, no login, no server, no cost.
- The repo holds only the 交番表 content (what each cell says, plus times).
  There are no names and no personal data. Each user's choices (their コマ,
  meetup groups, hand edits) live only in their own browser's localStorage.
- Home: pick 基準日 + your コマ → day-by-day calendar. Meetup (`#/meetup`):
  pick several コマ + a time → days when everyone is off or done by then. Users
  can override single days by hand (stored locally, colored `edited`).

## Concepts

The workplace posts two sheets; the app models both.

- **交番表** (rotation table): one row per **コマ** (slot).
  Each person moves one コマ per day and wraps from the last back to 1, so the
  コマ count is the cycle length (`rotationCycleLength`). Each コマ has separate
  entries for 平日, 土曜 and 日・祝. In the app: one `data/<folder>/`.
- **コマ位置表** (position sheet): headed "YYYY年M月D日実施", it lists which コマ
  each person is on that date. In the app: a generation's `from` (shown as 基準日).
- Staff look up their number on the コマ位置表 and pick it as 基準日のコマ位置; the
  app counts forward (and backward) one コマ per day from `from`.

## When the posted sheets change

This is the only recurring work, a few times a year. If nobody does it, the app
keeps projecting the old rotation. It will look plausible but be wrong.

### Files

Everything lives in `config/` and `data/`; `scripts/convertCsv.js` validates it
and writes `data/scheduleData.json` (generated, not committed).

- `data/<folder>/{weekday,saturday,holiday}.csv`: line N = コマ N, no header,
  no blank lines, and all three files the same line count. Each line is
  `subject,start,end`, where subject is the cell text as printed, e.g.
  `110,12:55,20:41`. Days off have empty times (`公休,,`). Times past midnight
  go past 24 (`24:42`). Two items in one cell are written `a/b`.
  The file must be UTF-8 (in Excel: "CSV UTF-8"), the subject can't be empty,
  and times are `H:MM` / `HH:MM`, both or neither.
  `holiday.csv` is used for Sundays, national holidays and `custom_holidays`,
  and wins over Saturday.
- `config/config.json`
  - `schedules`: generations, ascending by `from` (`YYYY-MM-DD`). A generation's
    window is `[from, next from)`; the rotation is anchored at its own `from`.
  - `custom_holidays`: extra yearly days, as `MM-DD`, that use `holiday.csv`.
- `config/event.json` — color rules, first match wins (substring).
  `freeAllDay: true` counts the day as free in 飲みに行くンダー; `fallback` and
  `edited` colors are required.

### What to do

Always append to `schedules`; don't edit a published generation.

| Change | Do | Staff |
|---|---|---|
| New コマ位置表 only | Append `{ "from": "<実施日>" }` (inherits the table) | Re-pick their コマ |
| New 交番表 only, same コマ count | New folder; turn the current entry's `data` into `[{ "data": "<old>" }, { "from": "<交番表実施日>", "data": "<new>" }]` | Nothing |
| Both, or コマ count changes | New folder; append `{ "from": "<実施日>", "data": "<new>" }` | Re-pick their コマ |

- Never overwrite the current folder with a new table: past dates would show
  it too. Fixing typos/times in the current table in place is fine.
- Never change a published `from`: saved positions are keyed by it, so every
  user would have to re-pick.
- Add the generation before the 実施日: Home opens the upcoming one, so staff
  can pick their new コマ early and switch between 新版 / 旧版.
- Generations two or more behind today's can be deleted. So can folders that
  no generation uses.
- Transcribing a photo of the sheet into the three CSVs is the real work.
  Check start → end against the duration printed in each cell, and re-read the
  hard cells (glare, hatching) twice.

### Publishing

Push to `main` → GitHub Actions runs `npm test`, builds and publishes to Pages
(a few minutes). A broken config fails the test and **nothing is published**;
the old site stays up. So a non-developer can safely edit the CSVs and
`config.json` in GitHub's web editor and commit to `main`. If the Actions tab
shows red, open the failed run: the error names the file and line. Afterwards,
open the site and compare a few コマ with the paper sheet.

Locally:

```bash
npm install
npm run dev     # local dev server (regenerates data/scheduleData.json first)
npm test        # also regenerates the bundle, so a broken config fails here
```

## Hosting on another GitHub account

Any free GitHub account can run its own copy:

1. Fork this repo (or "Import repository"). **Keep the name `kobancalendar`**:
   the base path `/kobancalendar/` is hard-coded in `vite.config.js` (`base`).
   Change it there if the name differs.
2. Settings → Pages → Source: **GitHub Actions**. A fork also needs Actions
   enabled (Actions tab → enable).
3. Push any commit to `main` (or Actions → run the workflow by hand). No
   secrets or tokens are needed; the workflow uses GitHub's built-in Pages
   permissions.
4. The new site is `https://<account>.github.io/kobancalendar/`. Staff must
   switch to the new URL and **re-pick their コマ**: browser storage doesn't
   carry over between sites. Share the new URL with the in-app QR/share
   button. Update the URL at the top of this file and the GitHub link in
   `src/layouts/UnifiedPageLayout.vue`.
5. From then on, follow §"When the posted sheets change".

## Code (for changes beyond data)

Vue 3 + Pinia + vue-router (hash mode) + FullCalendar + dayjs, Vite, Vitest.

- `scripts/convertCsv.js` is the only place config is validated. It runs before
  `dev` / `test` / `build`. The browser trusts its output; don't re-validate
  there.
- `src/stores/` hold raw state only, `src/composables/` hold all logic, and
  views never touch stores. `useSchedule.js` does the day → コマ → cell math.
- Home's URL hash is canonical and localStorage is a cache: `#/?b=<from>&p=N`,
  where `b` names the generation the コマ number belongs to. Meetup keeps its
  state in localStorage only (`#/meetup`, no query). Storage keys are
  `kobancalendar.savedSelection.v1`, `kobancalendar.savedMeetup.v1` (one slot
  per 基準日) and `kobancalendar_edited_schedules`. Keep their formats, or
  users lose their saved state.
- Deliberately minimal: no admin UI, no lint/coverage. Keep it small.

MIT license.
