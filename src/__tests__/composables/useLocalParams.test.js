// src/__tests__/composables/useLocalParams.test.js
import { describe, it, expect, afterEach } from "vitest";
import { useLocalParams } from "@/composables/useLocalParams";
import { makeStorageFail, restoreStorage } from "../setup";

describe("useLocalParams", () => {
  describe("calendar selection", () => {
    it("round-trips a full (baseDate, startNumber) pair", () => {
      const { saveCalendarSelection, loadCalendarSelection } = useLocalParams();
      saveCalendarSelection("2025-11-16", 42);
      expect(loadCalendarSelection()).toEqual({
        baseDate: "2025-11-16",
        startNumber: 42,
      });
    });

    it("saves baseDate alone when startNumber is null", () => {
      const { saveCalendarSelection, loadCalendarSelection } = useLocalParams();
      saveCalendarSelection("2025-11-16", null);
      expect(loadCalendarSelection()).toEqual({
        baseDate: "2025-11-16",
        startNumber: null,
      });
    });

    it("returns null when no baseDate has been saved", () => {
      const { loadCalendarSelection } = useLocalParams();
      expect(loadCalendarSelection()).toBeNull();
    });

    it("refuses to save without a baseDate", () => {
      const { saveCalendarSelection, loadCalendarSelection } = useLocalParams();
      expect(saveCalendarSelection("", 3)).toBe(false);
      expect(loadCalendarSelection()).toBeNull();
    });

    it("clear removes the saved selection", () => {
      const {
        saveCalendarSelection,
        loadCalendarSelection,
        clearCalendarSelection,
      } = useLocalParams();
      saveCalendarSelection("2025-11-16", 42);
      clearCalendarSelection();
      expect(loadCalendarSelection()).toBeNull();
    });

    it("clearing a stale active pointer preserves other baseDates' positions", () => {
      const {
        saveCalendarSelection,
        loadCalendarSelection,
        loadCalendarPositionFor,
        clearCalendarSelection,
      } = useLocalParams();
      saveCalendarSelection("2025-11-16", 42);
      saveCalendarSelection("2026-05-16", 7);
      clearCalendarSelection();
      // Only the active pointer is gone...
      expect(loadCalendarSelection()).toBeNull();
      // ...the per-baseDate slots (e.g. a sibling generation's position) survive.
      expect(loadCalendarPositionFor("2025-11-16")).toBe(42);
      expect(loadCalendarPositionFor("2026-05-16")).toBe(7);
    });

    it("remembers a separate position per baseDate", () => {
      const {
        saveCalendarSelection,
        loadCalendarSelection,
        loadCalendarPositionFor,
      } = useLocalParams();
      saveCalendarSelection("2025-11-16", 42);
      saveCalendarSelection("2026-05-16", 7);
      expect(loadCalendarSelection()).toEqual({
        baseDate: "2026-05-16",
        startNumber: 7,
      });
      expect(loadCalendarPositionFor("2025-11-16")).toBe(42);
      expect(loadCalendarPositionFor("2026-05-16")).toBe(7);
      expect(loadCalendarPositionFor("1999-01-01")).toBeNull();
    });

    it("switching active baseDate without a number preserves the prior position map", () => {
      const {
        saveCalendarSelection,
        loadCalendarSelection,
        loadCalendarPositionFor,
      } = useLocalParams();
      saveCalendarSelection("2025-11-16", 42);
      saveCalendarSelection("2026-05-16", null);
      expect(loadCalendarSelection()).toEqual({
        baseDate: "2026-05-16",
        startNumber: null,
      });
      expect(loadCalendarPositionFor("2025-11-16")).toBe(42);
    });

    it("parses legacy key=value&key=value fallback format", () => {
      localStorage.setItem(
        "kobancalendar.savedSelection.v1",
        "baseDate=2025-11-16&startNumber=12",
      );
      const { loadCalendarSelection } = useLocalParams();
      expect(loadCalendarSelection()).toEqual({
        baseDate: "2025-11-16",
        startNumber: 12,
      });
    });
  });

  describe("meetup params", () => {
    it("accepts participants as a list of {position} objects", () => {
      const { saveMeetupParams, loadMeetupParams } = useLocalParams();
      saveMeetupParams(
        "2025-11-16",
        [{ position: 1 }, { position: "5" }, { position: "abc" }],
        "19:00",
        "30",
      );
      expect(loadMeetupParams()).toEqual({
        baseDate: "2025-11-16",
        participants: [{ position: 1 }, { position: 5 }],
        startTime: "19:00",
        period: 30,
      });
    });

    it("accepts participants as a plain number array", () => {
      const { saveMeetupParams, loadMeetupParams } = useLocalParams();
      saveMeetupParams("2025-11-16", [1, 2, 3], "19:00", 60);
      expect(loadMeetupParams()).toEqual({
        baseDate: "2025-11-16",
        participants: [{ position: 1 }, { position: 2 }, { position: 3 }],
        startTime: "19:00",
        period: 60,
      });
    });

    it("refuses to save with no valid participants", () => {
      const { saveMeetupParams, loadMeetupParams } = useLocalParams();
      expect(
        saveMeetupParams("2025-11-16", [{ position: "x" }], "19:00", 30),
      ).toBe(false);
      expect(loadMeetupParams()).toBeNull();
    });

    it("remembers a separate set per baseDate", () => {
      const { saveMeetupParams, loadMeetupParams, loadMeetupParamsFor } =
        useLocalParams();
      saveMeetupParams("2025-11-16", [1, 2], "19:00", 30);
      saveMeetupParams("2026-05-16", [3, 4, 5], "20:30", 60);

      expect(loadMeetupParams()).toEqual({
        baseDate: "2026-05-16",
        participants: [{ position: 3 }, { position: 4 }, { position: 5 }],
        startTime: "20:30",
        period: 60,
      });
      expect(loadMeetupParamsFor("2025-11-16")).toEqual({
        baseDate: "2025-11-16",
        participants: [{ position: 1 }, { position: 2 }],
        startTime: "19:00",
        period: 30,
      });
      expect(loadMeetupParamsFor("1999-01-01")).toBeNull();
    });

    it("saving one baseDate preserves another's set", () => {
      const { saveMeetupParams, loadMeetupParamsFor } = useLocalParams();
      saveMeetupParams("2025-11-16", [1, 2], "19:00", 30);
      saveMeetupParams("2026-05-16", [9], "21:00", 45);
      expect(loadMeetupParamsFor("2025-11-16")).toEqual({
        baseDate: "2025-11-16",
        participants: [{ position: 1 }, { position: 2 }],
        startTime: "19:00",
        period: 30,
      });
    });

    it("clearMeetupParams removes stored data", () => {
      const { saveMeetupParams, loadMeetupParams, clearMeetupParams } =
        useLocalParams();
      saveMeetupParams("2025-11-16", [1, 2], "19:00", 30);
      clearMeetupParams();
      expect(loadMeetupParams()).toBeNull();
    });

    it("clearing a stale active pointer preserves other baseDates' sets", () => {
      const {
        saveMeetupParams,
        loadMeetupParams,
        loadMeetupParamsFor,
        clearMeetupParams,
      } = useLocalParams();
      saveMeetupParams("2025-11-16", [1, 2], "19:00", 30);
      saveMeetupParams("2026-05-16", [9], "21:00", 45);
      clearMeetupParams();
      // Only the active pointer is gone...
      expect(loadMeetupParams()).toBeNull();
      // ...the per-baseDate sets (e.g. a sibling generation's search config) survive.
      expect(loadMeetupParamsFor("2025-11-16")).toEqual({
        baseDate: "2025-11-16",
        participants: [{ position: 1 }, { position: 2 }],
        startTime: "19:00",
        period: 30,
      });
      expect(loadMeetupParamsFor("2026-05-16")).toEqual({
        baseDate: "2026-05-16",
        participants: [{ position: 9 }],
        startTime: "21:00",
        period: 45,
      });
    });
  });

  // readStoredObject/writeStoredObject each wrap a localStorage call in
  // try/catch (Safari private-mode / QuotaExceededError survival). These tests
  // exercise those catch branches directly instead of leaving them as untested
  // dead code.
  describe("storage failure fallback (Safari private mode / QuotaExceededError)", () => {
    afterEach(() => {
      restoreStorage();
    });

    it("writeStoredObject's catch: saveCalendarSelection returns false and does not throw when setItem fails", () => {
      const { saveCalendarSelection } = useLocalParams();
      makeStorageFail("setItem");
      let result;
      expect(() => {
        result = saveCalendarSelection("2025-11-16", 42);
      }).not.toThrow();
      expect(result).toBe(false);
    });

    it("readStoredObject's catch: loadCalendarSelection returns null when getItem fails", () => {
      const { saveCalendarSelection, loadCalendarSelection } = useLocalParams();
      saveCalendarSelection("2025-11-16", 42);
      makeStorageFail("getItem");
      let result;
      expect(() => {
        result = loadCalendarSelection();
      }).not.toThrow();
      expect(result).toBeNull();
    });

    // clearCalendarSelection resets only the `active` pointer, so it reads then
    // writes; both wrapped calls must survive a throwing Storage.
    it("writeStoredObject's catch: clearCalendarSelection does not throw when setItem fails", () => {
      const { saveCalendarSelection, clearCalendarSelection } =
        useLocalParams();
      saveCalendarSelection("2025-11-16", 42);
      makeStorageFail("setItem");
      expect(() => clearCalendarSelection()).not.toThrow();
    });

    it("readStoredObject's catch: clearCalendarSelection does not throw when getItem fails", () => {
      const { clearCalendarSelection } = useLocalParams();
      makeStorageFail("getItem");
      expect(() => clearCalendarSelection()).not.toThrow();
    });

    it("writeStoredObject's catch: saveMeetupParams returns false and does not throw when setItem fails", () => {
      const { saveMeetupParams } = useLocalParams();
      makeStorageFail("setItem");
      let result;
      expect(() => {
        result = saveMeetupParams("2025-11-16", [1, 2], "19:00", 30);
      }).not.toThrow();
      expect(result).toBe(false);
    });

    it("readStoredObject's catch: loadMeetupParams returns null when getItem fails", () => {
      const { saveMeetupParams, loadMeetupParams } = useLocalParams();
      saveMeetupParams("2025-11-16", [1, 2], "19:00", 30);
      makeStorageFail("getItem");
      let result;
      expect(() => {
        result = loadMeetupParams();
      }).not.toThrow();
      expect(result).toBeNull();
    });

    it("writeStoredObject's catch: clearMeetupParams does not throw when setItem fails", () => {
      const { saveMeetupParams, clearMeetupParams } = useLocalParams();
      saveMeetupParams("2025-11-16", [1, 2], "19:00", 30);
      makeStorageFail("setItem");
      expect(() => clearMeetupParams()).not.toThrow();
    });

    it("readStoredObject's catch: clearMeetupParams does not throw when getItem fails", () => {
      const { clearMeetupParams } = useLocalParams();
      makeStorageFail("getItem");
      expect(() => clearMeetupParams()).not.toThrow();
    });
  });
});
