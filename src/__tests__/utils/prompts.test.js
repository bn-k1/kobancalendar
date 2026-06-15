import { describe, it, expect } from "vitest";
import { SCHEDULE_CSV_PROMPT } from "@/utils/prompts";

describe("SCHEDULE_CSV_PROMPT", () => {
  it("extracts the prompt body between the COPY markers", () => {
    // Marker scaffolding and the English wrapper notes must be stripped out.
    expect(SCHEDULE_CSV_PROMPT).not.toMatch(/COPY FROM HERE|COPY TO HERE/);
    expect(SCHEDULE_CSV_PROMPT).not.toMatch(/Notes for the admin/);
  });

  it("contains the instructional body and the three target filenames", () => {
    expect(SCHEDULE_CSV_PROMPT).toMatch(/交番表/);
    expect(SCHEDULE_CSV_PROMPT).toMatch(/weekday\.csv/);
    expect(SCHEDULE_CSV_PROMPT).toMatch(/saturday\.csv/);
    expect(SCHEDULE_CSV_PROMPT).toMatch(/holiday\.csv/);
  });

  it("keeps the unknown-value (?) and over-24h rules that match the importer", () => {
    expect(SCHEDULE_CSV_PROMPT).toContain("?");
    expect(SCHEDULE_CSV_PROMPT).toMatch(/24時超え|25:00|24:42/);
  });

  it("is a non-trivial, trimmed string", () => {
    expect(SCHEDULE_CSV_PROMPT.length).toBeGreaterThan(500);
    expect(SCHEDULE_CSV_PROMPT).toBe(SCHEDULE_CSV_PROMPT.trimStart());
  });
});
