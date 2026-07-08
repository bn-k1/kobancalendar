// src/__tests__/scripts/convertCsv.test.js
// Unit tests for the build-time guards added to scripts/convertCsv.js.
import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  findBlankLines,
  findCaseInsensitiveMatch,
  parseCSVToScheduleObjects,
  resolveEpochs,
  validateEpochStructure,
} from "../../../scripts/convertCsv.js";

describe("findBlankLines()", () => {
  it("returns an empty array for content with no blank lines", () => {
    expect(findBlankLines("a,b,c\nd,e,f\n")).toEqual([]);
  });

  it("does not flag the single trailing newline artifact as a blank line", () => {
    expect(findBlankLines("a,b,c\n")).toEqual([]);
  });

  it("does not flag a file with no trailing newline at all", () => {
    expect(findBlankLines("a,b,c\nd,e,f")).toEqual([]);
  });

  it("finds a genuinely-empty line in the middle of the file", () => {
    expect(findBlankLines("a,b,c\n\nd,e,f\n")).toEqual([2]);
  });

  it("finds a blank line beyond the normal end-of-file newline", () => {
    // Two trailing newlines = one normal EOF terminator + one real blank line.
    expect(findBlankLines("a,b,c\nd,e,f\n\n")).toEqual([3]);
  });

  it("does not flag a whitespace-only line (Papa keeps that as a 1-column row)", () => {
    expect(findBlankLines("a,b,c\n   \nd,e,f\n")).toEqual([]);
  });
});

describe("findCaseInsensitiveMatch()", () => {
  let tmpDir;

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true });
  });

  it("finds a case-insensitive match when the exact name does not exist", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "kobancalendar-test-"));
    mkdirSync(join(tmpDir, "default"));
    expect(findCaseInsensitiveMatch(tmpDir, "Default")).toBe("default");
  });

  it("returns null when the exact name already exists (not a mismatch)", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "kobancalendar-test-"));
    mkdirSync(join(tmpDir, "default"));
    expect(findCaseInsensitiveMatch(tmpDir, "default")).toBeNull();
  });

  it("returns null when there is no match at all", () => {
    tmpDir = mkdtempSync(join(tmpdir(), "kobancalendar-test-"));
    mkdirSync(join(tmpDir, "default"));
    expect(findCaseInsensitiveMatch(tmpDir, "missing")).toBeNull();
  });
});

describe("parseCSVToScheduleObjects()", () => {
  it("trims whitespace from the subject column", () => {
    const rows = parseCSVToScheduleObjects("  勤務A  ,09:00,17:00\n");
    expect(rows[0].s).toBe("勤務A");
  });
});

describe("resolveEpochs() + validateEpochStructure() — structural config guards", () => {
  const bundle = (cycleLengths) =>
    Object.fromEntries(
      Object.entries(cycleLengths).map(([name, rotationCycleLength]) => [
        name,
        { holiday: [], saturday: [], weekday: [], rotationCycleLength },
      ]),
    );

  it("passes for a valid single-epoch config", () => {
    const epochs = resolveEpochs({
      schedules: [{ from: "2026-01-01", data: "default" }],
    });
    expect(() =>
      validateEpochStructure(epochs, bundle({ default: 130 })),
    ).not.toThrow();
  });

  it("throws when top-level `from` is not ascending", () => {
    const epochs = resolveEpochs({
      schedules: [
        { from: "2026-05-01", data: "default" },
        { from: "2026-01-01", data: "default" },
      ],
    });
    expect(() =>
      validateEpochStructure(epochs, bundle({ default: 130 })),
    ).toThrow(/昇順/);
  });

  it("throws when top-level `from` is duplicated", () => {
    const epochs = resolveEpochs({
      schedules: [
        { from: "2026-01-01", data: "default" },
        { from: "2026-01-01", data: "default" },
      ],
    });
    expect(() =>
      validateEpochStructure(epochs, bundle({ default: 130 })),
    ).toThrow(/重複/);
  });

  it("throws when in-epoch data segments have mismatched rotationCycleLength", () => {
    const epochs = resolveEpochs({
      schedules: [
        {
          from: "2026-01-01",
          data: [{ data: "default" }, { from: "2026-03-01", data: "rev" }],
        },
      ],
    });
    expect(() =>
      validateEpochStructure(epochs, bundle({ default: 130, rev: 100 })),
    ).toThrow(/サイクル長/);
  });

  it("throws when in-epoch data segments are not ascending", () => {
    const epochs = resolveEpochs({
      schedules: [
        {
          from: "2026-01-01",
          data: [
            { data: "default" },
            { from: "2026-03-01", data: "rev" },
            { from: "2026-02-01", data: "default" },
          ],
        },
      ],
    });
    expect(() =>
      validateEpochStructure(epochs, bundle({ default: 130, rev: 130 })),
    ).toThrow(/昇順/);
  });

  it("throws when an in-epoch segment falls on/after the next epoch's from", () => {
    const epochs = resolveEpochs({
      schedules: [
        {
          from: "2026-01-01",
          data: [{ data: "default" }, { from: "2026-06-01", data: "rev" }],
        },
        { from: "2026-05-01", data: "rev" },
      ],
    });
    expect(() =>
      validateEpochStructure(epochs, bundle({ default: 130, rev: 130 })),
    ).toThrow(/次世代の from/);
  });
});
