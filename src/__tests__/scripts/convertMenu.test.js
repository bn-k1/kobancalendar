// src/__tests__/scripts/convertMenu.test.js
// Unit tests for the build-time guards added to scripts/convertMenu.js.
import { describe, it, expect, vi } from "vitest";
import {
  parseFilename,
  daysInMonth,
  assertLineCountWithinMonth,
  groupMenuFilenames,
} from "../../../scripts/convertMenu.js";

describe("parseFilename()", () => {
  it("parses a well-formed menu filename", () => {
    expect(parseFilename("2026-07-a.txt")).toEqual({
      year: 2026,
      month: 7,
      type: "a",
      key: "2026-07",
    });
  });

  it("lower-cases the a/b type", () => {
    expect(parseFilename("2026-07-A.txt").type).toBe("a");
  });

  it("returns null for a filename that doesn't match the expected shape", () => {
    expect(parseFilename("readme.txt")).toBeNull();
    expect(parseFilename("2026-07.txt")).toBeNull();
  });

  it("throws for a month above 12", () => {
    expect(() => parseFilename("2026-13-a.txt")).toThrow(/month/i);
  });

  it("throws for a month of 00", () => {
    expect(() => parseFilename("2026-00-a.txt")).toThrow(/month/i);
  });
});

describe("daysInMonth()", () => {
  it("returns 31 for a 31-day month", () => {
    expect(daysInMonth(2026, 7)).toBe(31);
  });

  it("handles February in a leap year", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
  });

  it("handles February in a non-leap year", () => {
    expect(daysInMonth(2026, 2)).toBe(28);
  });
});

describe("assertLineCountWithinMonth()", () => {
  it("does not throw when line count is fewer than the days in the month", () => {
    // The normal "not filled in yet" state.
    expect(() =>
      assertLineCountWithinMonth(["a", "b", "c"], 31, "2026-07-a.txt"),
    ).not.toThrow();
  });

  it("does not throw when line count exactly equals the days in the month", () => {
    expect(() =>
      assertLineCountWithinMonth(new Array(31).fill("x"), 31, "2026-07-a.txt"),
    ).not.toThrow();
  });

  it("throws when line count exceeds the days in the month, naming the file and counts", () => {
    const lines = new Array(32).fill("x");
    expect(() =>
      assertLineCountWithinMonth(lines, 31, "2026-07-a.txt"),
    ).toThrow(/2026-07-a\.txt/);
    try {
      assertLineCountWithinMonth(lines, 31, "2026-07-a.txt");
      throw new Error("expected assertLineCountWithinMonth to throw");
    } catch (err) {
      expect(err.message).toMatch(/31/); // expected max
      expect(err.message).toMatch(/32/); // actual
    }
  });
});

describe("groupMenuFilenames()", () => {
  it("groups a/b files under the same year-month bucket", () => {
    const buckets = groupMenuFilenames([
      "2026-07-a.txt",
      "2026-07-b.txt",
      "2026-06-a.txt",
    ]);
    expect(Object.keys(buckets).sort()).toEqual(["2026-06", "2026-07"]);
    expect(buckets["2026-07"]).toEqual({
      year: 2026,
      month: 7,
      a: "2026-07-a.txt",
      b: "2026-07-b.txt",
    });
    expect(buckets["2026-06"].a).toBe("2026-06-a.txt");
    expect(buckets["2026-06"].b).toBeNull();
  });

  it("calls onSkip for unmatched filenames instead of throwing", () => {
    const onSkip = vi.fn();
    const buckets = groupMenuFilenames(["readme.txt", "2026-07-a.txt"], onSkip);
    expect(onSkip).toHaveBeenCalledWith("readme.txt");
    expect(buckets["2026-07"].a).toBe("2026-07-a.txt");
  });

  it("throws on a case-collision bucket instead of silently overwriting", () => {
    // "type" is lower-cased, so these two both target the "2026-07" / "a" slot.
    expect(() =>
      groupMenuFilenames(["2026-07-A.txt", "2026-07-a.txt"]),
    ).toThrow(/2026-07-A\.txt.*2026-07-a\.txt|2026-07-a\.txt.*2026-07-A\.txt/s);
  });
});
