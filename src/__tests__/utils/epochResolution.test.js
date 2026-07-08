// src/__tests__/utils/epochResolution.test.js
import { describe, it, expect } from "vitest";
import dayjs from "dayjs";
import { currentEpochIndex } from "@/utils/epochResolution";

const epochs = [
  { from: "2025-11-16" },
  { from: "2026-05-16" },
  { from: "2026-08-01" },
];

describe("currentEpochIndex()", () => {
  it("today が中間の世代の後なら、その世代の index を返す", () => {
    expect(currentEpochIndex(epochs, dayjs("2026-06-01"))).toBe(1);
  });

  it("today が最初の世代より前でも、フォールバックで index 0 を返す（-1 ではない）", () => {
    expect(currentEpochIndex(epochs, dayjs("2020-01-01"))).toBe(0);
  });

  it("today が最後の世代以降なら、最後の index を返す", () => {
    expect(currentEpochIndex(epochs, dayjs("2030-01-01"))).toBe(2);
  });

  it("today がちょうど from と同じ日なら、その世代を current とする", () => {
    expect(currentEpochIndex(epochs, dayjs("2026-05-16"))).toBe(1);
  });

  it("dayjs でも文字列でも from を扱える", () => {
    const mixed = [{ from: dayjs("2025-11-16") }, { from: "2026-05-16" }];
    expect(currentEpochIndex(mixed, dayjs("2026-06-01"))).toBe(1);
  });
});
