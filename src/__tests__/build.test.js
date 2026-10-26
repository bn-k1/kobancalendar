// Build-time config validation (scripts/convertCsv.js) and the real config files.
import { describe, it, expect } from "vitest";
import config from "@config/config.json";
import eventConfig from "@config/event.json";
import {
  findBlankLines,
  parseCsv,
  decodeUtf8,
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

describe("parseCsv", () => {
  it("勤務名と時刻を読む（日跨ぎは 24 超え、休みは時刻なし）", () => {
    expect(parseCsv("110,12:55,24:41\n公休,,\n")).toEqual([
      { s: "110", sT: "12:55", eT: "24:41" },
      { s: "公休" },
    ]);
  });

  it("超・中休・深夜P を分とポイントで読む（途中の列は空でもよい）", () => {
    expect(
      parseCsv("134,15:59,24:42,-0:29,,36\nT1/2,07:39,22:04,,1:58\n予備,13:25,21:55,0:00\n"),
    ).toEqual([
      { s: "134", sT: "15:59", eT: "24:42", c: -29, n: 36 },
      { s: "T1/2", sT: "07:39", eT: "22:04", k: 118 },
      { s: "予備", sT: "13:25", eT: "21:55", c: 0 },
    ]);
  });

  it.each([
    ["カンマだけの行", "110,8:30,17:00\n,,\n"],
    ["時刻のない行の超", "公休,,,0:10\n"],
    ["超の打ち間違い", "110,8:30,17:00,-1:2\n"],
    ["中休にマイナス", "110,8:30,17:00,,-1:00\n"],
    ["深夜P が整数でない", "110,8:30,17:00,,,2.5\n"],
    ["列が多すぎる", "110,8:30,17:00,,,,x\n"],
    ["空白だけの行", "110,8:30,17:00\n  \n"],
    ["ヘッダ行", "勤務,開始,終了\n110,8:30,17:00\n"],
    ["時刻の打ち間違い", "110,8:3O,17:00\n"],
    ["時刻の片方だけ", "110,8:30,\n"],
  ])("%s は throw", (_, csv) => {
    expect(() => parseCsv(csv)).toThrow();
  });
});

describe("decodeUtf8", () => {
  it("UTF-8 は通し、BOM は落とす", () => {
    const bytes = new TextEncoder().encode("\uFEFF公休,,");
    expect(decodeUtf8(bytes)).toBe("公休,,");
  });

  it("CP932 は throw", () => {
    // 「公休」 in Shift_JIS/CP932
    expect(() => decodeUtf8(new Uint8Array([0x8c, 0xf6, 0x8b, 0x78]))).toThrow();
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
    ["from が存在しない日付", [{ from: "2026-02-30", data: "a" }]],
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
