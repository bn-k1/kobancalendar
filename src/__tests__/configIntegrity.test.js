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
import { buildEpochs } from "@/composables/useAppInitializer";

const MM_DD = /^\d{2}-\d{2}$/;

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
