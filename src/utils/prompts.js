// Single source of truth for the "spreadsheet → 3 CSVs" AI prompt.
//
// The canonical, human-readable prompt (with usage notes for the admin) lives
// in prompts/schedule-csv-from-spreadsheet.md. The admin UI must hand out the
// exact same text, so instead of duplicating it here we import that file raw and
// slice out the body between the COPY markers. Edit the prompt in ONE place (the
// .md) and both the doc reader and the in-app copy button stay in sync.

import promptDoc from "../../prompts/schedule-csv-from-spreadsheet.md?raw";

// Body sits between the dashed "COPY FROM HERE" / "COPY TO HERE" fences.
function extractPromptBody(md) {
  const m = md.match(/COPY FROM HERE[^\n]*\n-+\n([\s\S]*?)\n-+\nCOPY TO HERE/);
  if (!m) {
    throw new Error(
      "schedule-csv prompt: COPY FROM HERE / COPY TO HERE markers not found",
    );
  }
  return m[1].trim() + "\n";
}

export const SCHEDULE_CSV_PROMPT = extractPromptBody(promptDoc);
