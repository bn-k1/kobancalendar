// src/__tests__/composables/useAppInitializer.test.js
// Tests for buildEpochs — epoch normalization & sanity checks
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { buildEpochs } from "@/composables/useAppInitializer";

// サイクル長 5 のダミーバンドル（フォルダ名キー）
const makeBundle = (folders = ["default"]) =>
  Object.fromEntries(
    folders.map((name) => [
      name,
      { holiday: [], saturday: [], weekday: [], rotationCycleLength: 5 },
    ]),
  );

const iso = (epoch) => epoch.from.format("YYYY-MM-DD");

describe("buildEpochs() — 基本", () => {
  it("schedules が非配列/空ならエラー", () => {
    expect(() => buildEpochs({}, makeBundle())).toThrow(/非空配列/);
    expect(() => buildEpochs({ schedules: [] }, makeBundle())).toThrow(
      /非空配列/,
    );
  });

  it("from が不正ならエラー", () => {
    expect(() =>
      buildEpochs(
        { schedules: [{ from: "not-a-date", data: "default" }] },
        makeBundle(),
      ),
    ).toThrow(/from が不正/);
  });

  it("参照フォルダがバンドルに無ければエラー", () => {
    expect(() =>
      buildEpochs(
        { schedules: [{ from: "2026-01-01", data: "missing" }] },
        makeBundle(),
      ),
    ).toThrow(/データフォルダが見つかりません/);
  });

  it("正常な単一世代を { from, dataKey } に正規化する", () => {
    const epochs = buildEpochs(
      { schedules: [{ from: "2026-01-01", data: "default" }] },
      makeBundle(),
    );
    expect(epochs).toHaveLength(1);
    expect(iso(epochs[0])).toBe("2026-01-01");
    expect(epochs[0].dataKey).toBe("default");
  });
});

describe("buildEpochs() — data 継承（項目1）", () => {
  it("data 省略時は直前の世代から継承する", () => {
    const epochs = buildEpochs(
      {
        schedules: [
          { from: "2026-01-01", data: "default" },
          { from: "2026-01-06" }, // data 省略 → default を継承
        ],
      },
      makeBundle(),
    );
    expect(epochs[1].dataKey).toBe("default");
  });

  it("data 省略が連続しても遡って継承する", () => {
    const epochs = buildEpochs(
      {
        schedules: [
          { from: "2026-01-01", data: "default" },
          { from: "2026-01-06" },
          { from: "2026-01-11" },
        ],
      },
      makeBundle(),
    );
    expect(epochs.map((e) => e.dataKey)).toEqual([
      "default",
      "default",
      "default",
    ]);
  });

  it("data を明示すれば新フォルダ（内容が変わる移行）として扱う", () => {
    const epochs = buildEpochs(
      {
        schedules: [
          { from: "2026-01-01", data: "default" },
          { from: "2026-08-01", data: "rev2026h2" },
        ],
      },
      makeBundle(["default", "rev2026h2"]),
    );
    expect(epochs[1].dataKey).toBe("rev2026h2");
  });

  it("先頭世代の data 省略はエラー", () => {
    expect(() =>
      buildEpochs({ schedules: [{ from: "2026-01-01" }] }, makeBundle()),
    ).toThrow(/先頭世代は data/);
  });
});

describe("buildEpochs() — from の sanity check（項目3）", () => {
  it("from が降順ならエラー", () => {
    expect(() =>
      buildEpochs(
        {
          schedules: [
            { from: "2026-05-01", data: "default" },
            { from: "2026-01-01", data: "default" },
          ],
        },
        makeBundle(),
      ),
    ).toThrow(/昇順/);
  });

  it("from が重複ならエラー", () => {
    expect(() =>
      buildEpochs(
        {
          schedules: [
            { from: "2026-01-01", data: "default" },
            { from: "2026-01-01", data: "default" },
          ],
        },
        makeBundle(),
      ),
    ).toThrow(/重複/);
  });

  describe("warn 系（throw せず継続）", () => {
    let warnSpy;
    beforeEach(() => {
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
      warnSpy.mockRestore();
      vi.useRealTimers();
    });

    it("コマシフト移行で日数差がサイクル長の倍数でないと warn", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00+09:00"));
      // cycle=5、日数差 3 は倍数でない
      buildEpochs(
        {
          schedules: [
            { from: "2026-01-01", data: "default" },
            { from: "2026-01-04" }, // 継承＝コマシフト移行、diff=3
          ],
        },
        makeBundle(),
      );
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls.flat().join(" ")).toMatch(/サイクル長/);
    });

    it("コマシフト移行で日数差がサイクル長の倍数なら warn しない", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00+09:00"));
      // cycle=5、日数差 10 は倍数
      buildEpochs(
        {
          schedules: [
            { from: "2026-01-01", data: "default" },
            { from: "2026-01-11" },
          ],
        },
        makeBundle(),
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("data が変わる移行は倍数チェックの対象外（warn しない）", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00+09:00"));
      buildEpochs(
        {
          schedules: [
            { from: "2026-01-01", data: "default" },
            { from: "2026-01-04", data: "rev2026h2" }, // diff=3 でも別フォルダ
          ],
        },
        makeBundle(["default", "rev2026h2"]),
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("from が極端な未来なら warn", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00+09:00"));
      buildEpochs(
        { schedules: [{ from: "2050-01-01", data: "default" }] },
        makeBundle(),
      );
      expect(warnSpy.mock.calls.flat().join(" ")).toMatch(/年離れています/);
    });

    it("from が極端な過去なら warn", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00+09:00"));
      buildEpochs(
        { schedules: [{ from: "2000-01-01", data: "default" }] },
        makeBundle(),
      );
      expect(warnSpy.mock.calls.flat().join(" ")).toMatch(/年離れています/);
    });

    it("from が常識的な範囲なら warn しない", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-01T00:00:00+09:00"));
      buildEpochs(
        { schedules: [{ from: "2026-06-01", data: "default" }] },
        makeBundle(),
      );
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });
});
