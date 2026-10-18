// Build-time config validation (scripts/convertCsv.js) and the real config files.
import { describe, it, expect } from "vitest";
import config from "@config/config.json";
import eventConfig from "@config/event.json";
import {
  findBlankLines,
  resolveEpochs,
  checkSegmentCycles,
} from "../../scripts/convertCsv.js";

describe("findBlankLines", () => {
  it.each([
    ["a\nb\n", []],
    ["a\nb", []],
    ["a\n\nb\n", [2]],
    ["a\nb\n\n", [3]],
    ["a\r\n\r\nb", [2]],
  ])("%j -> %j", (csv, lines) => {
    expect(findBlankLines(csv)).toEqual(lines);
  });
});

describe("resolveEpochs", () => {
  it("data 省略は直前世代の最後のフォルダを継承する", () => {
    const epochs = resolveEpochs([
      {
        from: "2026-01-01",
        data: [{ data: "a" }, { from: "2026-02-01", data: "b" }],
      },
      { from: "2026-04-01" },
    ]);
    expect(epochs[1].segments).toEqual([{ from: "2026-04-01", data: "b" }]);
  });

  it.each([
    ["空", []],
    ["先頭世代の data 省略", [{ from: "2026-01-01" }]],
    ["from の形式", [{ from: "2026/01/01", data: "a" }]],
    [
      "from が降順",
      [
        { from: "2026-05-01", data: "a" },
        { from: "2026-01-01", data: "a" },
      ],
    ],
    [
      "from が重複",
      [
        { from: "2026-01-01", data: "a" },
        { from: "2026-01-01", data: "a" },
      ],
    ],
    [
      "セグメントが降順",
      [
        {
          from: "2026-01-01",
          data: [{ data: "a" }, { from: "2025-12-01", data: "b" }],
        },
      ],
    ],
    [
      "セグメントが次世代にはみ出す",
      [
        {
          from: "2026-01-01",
          data: [{ data: "a" }, { from: "2026-06-01", data: "b" }],
        },
        { from: "2026-05-01", data: "b" },
      ],
    ],
  ])("%s は throw", (_, schedules) => {
    expect(() => resolveEpochs(schedules)).toThrow();
  });

  it("セグメント間でサイクル長が違えば throw", () => {
    const epochs = resolveEpochs([
      {
        from: "2026-01-01",
        data: [{ data: "a" }, { from: "2026-02-01", data: "b" }],
      },
    ]);
    expect(() =>
      checkSegmentCycles(epochs, {
        a: { rotationCycleLength: 3 },
        b: { rotationCycleLength: 4 },
      }),
    ).toThrow();
  });
});

describe("実際の config", () => {
  it("custom_holidays は MM-DD", () => {
    for (const day of config.custom_holidays ?? [])
      expect(day).toMatch(/^\d{2}-\d{2}$/);
  });

  it("event.json の色はすべて #rrggbb、keyword は非空で重複なし", () => {
    const colors = [
      ...eventConfig.rules.map((r) => r.color),
      eventConfig.fallback.color,
      eventConfig.edited.color,
    ];
    for (const color of colors) expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    const keywords = eventConfig.rules.flatMap((r) => r.keywords);
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords.every(Boolean)).toBe(true);
    expect(new Set(keywords).size).toBe(keywords.length);
  });
});
