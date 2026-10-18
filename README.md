# KobanCalendar

Shift calendar for one workplace's cyclic 交番表, plus 飲みに行くンダー (find days
everyone is free). Vue 3 SPA served from GitHub Pages:
https://bn-k1.github.io/kobancalendar/ (staff manual: `manual.html`).

## Run

```bash
npm install
npm run dev     # local dev server (regenerates data/scheduleData.json first)
npm test        # also regenerates the bundle, so a broken config fails here
```

Push to `main` → GitHub Actions runs `npm test`, builds and publishes to Pages.

## Updating the schedule

Everything lives in `config/` and `data/`; `scripts/convertCsv.js` validates it
and writes `data/scheduleData.json` (generated, not committed).

- `data/<folder>/{weekday,saturday,holiday}.csv` — `subject,start,end`, no
  header, one row per slot (row 1 = slot 1). All three files have the same row
  count, which is the cycle length. No blank lines.
- `config/config.json`
  - `schedules`: generations, ascending by `from` (`YYYY-MM-DD`). A generation's
    window is `[from, next from)`; the rotation is anchored at its own `from`.
    - New table: `{ "from": "...", "data": "<folder>" }`
    - Slot positions shift, same table: `{ "from": "..." }` (inherits `data`)
    - Same anchor, table swapped mid-generation (cycle lengths must match):
      `{ "from": "...", "data": [{ "data": "a" }, { "from": "...", "data": "b" }] }`
  - `custom_holidays`: extra yearly holidays as `MM-DD`.
- `config/event.json` — color rules, first match wins (substring).
  `freeAllDay: true` counts the day as free in 飲みに行くンダー; `fallback` and
  `edited` colors are required.

Old generations can be pruned once they are two or more behind today's.

MIT license.
