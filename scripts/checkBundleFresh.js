// scripts/checkBundleFresh.js
/**
 * Stale build-bundle guard.
 *
 * The app reads generated JSON bundles (data/scheduleData.json,
 * data/menu/menu.json), never the raw CSV/TXT sources. If config/config.json or
 * anything under data/ is staged for commit but the generated bundles have not
 * been regenerated, the commit would ship sources and bundles out of sync.
 *
 * This script is meant to run as a pre-commit hook. It inspects the git index:
 *  - If a "source" path is staged (config/config.json, data/<folder>/*.csv,
 *    data/menu/*.txt) but no corresponding generated bundle is staged, it warns
 *    and exits non-zero (blocks the commit).
 *  - Run with `--warn-only` to print the warning but exit 0.
 *
 * Re-run `npm run build-prep` (or `npm run build` / `build-gh-pages` /
 * `npm run release`) and stage the regenerated bundles to clear it.
 */

import { execSync } from "child_process";

const WARN_ONLY = process.argv.includes("--warn-only");

/** Staged paths (relative to repo root), index vs HEAD. */
function stagedFiles() {
  const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    encoding: "utf8",
  });
  return out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function main() {
  let staged;
  try {
    staged = stagedFiles();
  } catch {
    // git が無い等 — フックとして失敗させない
    return 0;
  }

  const isScheduleSource = (p) =>
    p === "config/config.json" ||
    (/^data\/.+\.csv$/.test(p) && !p.startsWith("data/menu/"));
  const isMenuSource = (p) => /^data\/menu\/.+\.txt$/.test(p);

  const scheduleSourceStaged = staged.some(isScheduleSource);
  const menuSourceStaged = staged.some(isMenuSource);

  const scheduleBundleStaged = staged.includes("data/scheduleData.json");
  const menuBundleStaged = staged.includes("data/menu/menu.json");

  const problems = [];
  if (scheduleSourceStaged && !scheduleBundleStaged) {
    problems.push(
      "config/config.json か data/<folder>/*.csv が staged ですが " +
        "data/scheduleData.json が staged されていません。",
    );
  }
  if (menuSourceStaged && !menuBundleStaged) {
    problems.push(
      "data/menu/*.txt が staged ですが data/menu/menu.json が " +
        "staged されていません。",
    );
  }

  if (problems.length === 0) return 0;

  const label = WARN_ONLY ? "⚠️  警告" : "❌ コミット中断";
  console.error(`\n${label}: 生成バンドルが stale の可能性があります`);
  for (const p of problems) console.error(`   - ${p}`);
  console.error(
    "\n   `npm run build-prep` を実行し、生成バンドルを stage し直してください。",
  );
  console.error(
    "   （バンドルを意図的に変えない場合は --no-verify でスキップできます）\n",
  );

  return WARN_ONLY ? 0 : 1;
}

process.exit(main());
