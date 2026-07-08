// src/__tests__/configIntegrity.test.js
//
// buildEpochs() (src/composables/useAppInitializer.js) validates
// config.schedules — ascending/unique `from`, segment rules, matching
// rotationCycleLength across segments — but it only ever runs client-side,
// at app init in the browser. `npm run build` bundles config/config.json
// without executing it, and (before this file) no test fed the real
// config/config.json through it either. That means a malformed config can
// sail through CI and only blow up on a user's first page load.
//
// This test feeds the REAL config/config.json and the REAL generated
// data/scheduleData.json through the REAL buildEpochs, so CI catches a
// broken config before deploy instead of duplicating the validation rules
// in a second, driftable place.
import { describe, it, expect } from "vitest";
import config from "@config/config.json";
import scheduleData from "@data/scheduleData.json";
import eventConfig from "@config/event.json";
import { buildEpochs } from "@/composables/useAppInitializer";
import { matchRule, resolveColor } from "@/utils/eventRules";

const MM_DD = /^\d{2}-\d{2}$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

describe("config/config.json 整合性ガード", () => {
  it("実際の config/config.json は buildEpochs を通る", () => {
    expect(() => buildEpochs(config, scheduleData)).not.toThrow();
  });

  it("config.schedules が参照するフォルダはすべて scheduleData に存在する", () => {
    const epochs = buildEpochs(config, scheduleData);
    expect(epochs.length).toBeGreaterThan(0);
    for (const epoch of epochs) {
      expect(epoch.segments.length).toBeGreaterThan(0);
      for (const segment of epoch.segments) {
        expect(scheduleData).toHaveProperty(segment.dataKey);
      }
    }
  });

  it("custom_holidays はすべて MM-DD 形式である", () => {
    const holidays = config.custom_holidays || [];
    for (const holiday of holidays) {
      expect(holiday).toMatch(MM_DD);
    }
  });
});

// config/event.json 整合性ガード
//
// src/utils/eventRules.js (matchRule/resolveColor/isFreeAllDay) reads
// eventConfig.rules[] (each with .keywords[] and .color, optionally
// .freeAllDay) and eventConfig.fallback.color — with no schema validation of
// its own (missing/malformed fields just resolve to undefined/null at
// runtime). CalendarView.vue and EditedSchedulesList.vue additionally read
// eventConfig.edited.color for the same purpose. Like config/config.json
// before configIntegrity.test.js existed, a typo here (an empty rules array,
// a rule missing keywords/color, a malformed hex string, a duplicate
// keyword that silently shadows a later rule) previously sailed through CI
// and only surfaced as a wrong/missing color in production. This feeds the
// REAL config/event.json through the actual shape eventRules.js depends on.
describe("config/event.json 整合性ガード", () => {
  it("rules は空でない配列である", () => {
    expect(Array.isArray(eventConfig.rules)).toBe(true);
    expect(eventConfig.rules.length).toBeGreaterThan(0);
  });

  it("各 rule は非空の keywords 配列（非空文字列のみ）を持つ", () => {
    for (const rule of eventConfig.rules) {
      expect(Array.isArray(rule.keywords)).toBe(true);
      expect(rule.keywords.length).toBeGreaterThan(0);
      for (const keyword of rule.keywords) {
        expect(typeof keyword).toBe("string");
        expect(keyword.length).toBeGreaterThan(0);
      }
    }
  });

  it("各 rule の color は厳密な hex カラー（#rrggbb）である", () => {
    for (const rule of eventConfig.rules) {
      expect(rule.color).toMatch(HEX_COLOR);
    }
  });

  it("rule.freeAllDay を持つ場合は真偽値である", () => {
    for (const rule of eventConfig.rules) {
      if (Object.prototype.hasOwnProperty.call(rule, "freeAllDay")) {
        expect(typeof rule.freeAllDay).toBe("boolean");
      }
    }
  });

  it("keywords は rule 間で重複しない（重複すると後続 rule が先頭一致優先で握りつぶされる）", () => {
    const seen = new Set();
    for (const rule of eventConfig.rules) {
      for (const keyword of rule.keywords) {
        expect(seen.has(keyword)).toBe(false);
        seen.add(keyword);
      }
    }
  });

  it("fallback.color は厳密な hex カラーである（resolveColor の既定色）", () => {
    expect(eventConfig.fallback?.color).toMatch(HEX_COLOR);
  });

  it("edited.color は厳密な hex カラーである（CalendarView/EditedSchedulesList が参照）", () => {
    expect(eventConfig.edited?.color).toMatch(HEX_COLOR);
  });

  it("実際の config/event.json は matchRule/resolveColor を例外なく通り、有効な色を返す", () => {
    for (const rule of eventConfig.rules) {
      for (const keyword of rule.keywords) {
        expect(() => matchRule(keyword, eventConfig)).not.toThrow();
        expect(matchRule(keyword, eventConfig)).not.toBeNull();
        expect(resolveColor(keyword, eventConfig)).toMatch(HEX_COLOR);
      }
    }
    const noMatchSubject = "どの keyword にも一致しない件名";
    expect(() => resolveColor(noMatchSubject, eventConfig)).not.toThrow();
    expect(resolveColor(noMatchSubject, eventConfig)).toMatch(HEX_COLOR);
  });
});
