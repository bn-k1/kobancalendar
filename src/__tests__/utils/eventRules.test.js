// src/__tests__/utils/eventRules.test.js
// Characterization tests for the ordered rule-array event config schema
import { describe, it, expect } from "vitest";
import {
  matchRule,
  resolveColor,
  shouldShowTime,
  isFreeAllDay,
} from "@/utils/eventRules";

// config/event.json と同等のイベント設定（ordered rule-array 形式）
const EVENT_CONFIG = {
  rules: [
    {
      keywords: ["公休", "法休"],
      color: "#e53935",
      freeAllDay: true,
    },
    { keywords: ["黄"], color: "#fb8c00" },
    { keywords: ["空"], color: "#00bfff" },
  ],
  fallback: { color: "#00bfff" },
  edited: { color: "#e040fb" },
};

describe("matchRule()", () => {
  it("keywords が subject の部分文字列なら一致する", () => {
    expect(matchRule("公休", EVENT_CONFIG)?.color).toBe("#e53935");
    expect(matchRule("法休（振替）", EVENT_CONFIG)?.color).toBe("#e53935");
  });

  it("先頭から順に最初に一致した rule が勝つ（順序依存）", () => {
    const config = {
      rules: [
        { keywords: ["番"], color: "a" },
        { keywords: ["黄番"], color: "b" },
      ],
    };
    // "黄番" は両方の keywords に部分一致するが、先に定義された rule が勝つ
    expect(matchRule("黄番", config)?.color).toBe("a");
  });

  it("どの rule にも一致しない場合は null", () => {
    expect(matchRule("早番", EVENT_CONFIG)).toBeNull();
  });

  it("subject が空/未定義なら null", () => {
    expect(matchRule("", EVENT_CONFIG)).toBeNull();
    expect(matchRule(undefined, EVENT_CONFIG)).toBeNull();
  });

  it("rules が配列でない/存在しない場合は null", () => {
    expect(matchRule("公休", {})).toBeNull();
    expect(matchRule("公休", undefined)).toBeNull();
  });
});

describe("resolveColor()", () => {
  it("一致した rule の color を返す", () => {
    expect(resolveColor("黄番", EVENT_CONFIG)).toBe("#fb8c00");
  });

  it("一致しない場合は fallback.color を返す", () => {
    expect(resolveColor("早番", EVENT_CONFIG)).toBe("#00bfff");
  });
});

describe("shouldShowTime()", () => {
  it("startTime か endTime のどちらかがあれば true", () => {
    expect(shouldShowTime("08:00", "")).toBe(true);
    expect(shouldShowTime("", "16:00")).toBe(true);
    expect(shouldShowTime("08:00", "16:00")).toBe(true);
  });

  it("startTime も endTime も無ければ false", () => {
    expect(shouldShowTime("", "")).toBe(false);
    expect(shouldShowTime(undefined, undefined)).toBe(false);
  });
});

describe("isFreeAllDay()", () => {
  it("公休 以外の keywords の rule でも freeAllDay: true なら true になる", () => {
    const config = {
      rules: [
        {
          keywords: ["非番"],
          color: "#000",
          freeAllDay: true,
        },
      ],
    };
    expect(isFreeAllDay("非番", config)).toBe(true);
  });

  it("freeAllDay が無い rule に一致した場合は false", () => {
    expect(isFreeAllDay("黄番", EVENT_CONFIG)).toBe(false);
  });

  it("どの rule にも一致しない場合は false", () => {
    expect(isFreeAllDay("早番", EVENT_CONFIG)).toBe(false);
  });
});
