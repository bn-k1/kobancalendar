// src/__tests__/composables/useLocalParams.test.js
import { describe, it, expect } from "vitest";
import { useLocalParams } from "@/composables/useLocalParams";

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
      const { saveCalendarSelection, loadCalendarSelection, clearCalendarSelection } =
        useLocalParams();
      saveCalendarSelection("2025-11-16", 42);
      clearCalendarSelection();
      expect(loadCalendarSelection()).toBeNull();
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

    it("clearMeetupParams removes stored data", () => {
      const { saveMeetupParams, loadMeetupParams, clearMeetupParams } = useLocalParams();
      saveMeetupParams("2025-11-16", [1, 2], "19:00", 30);
      clearMeetupParams();
      expect(loadMeetupParams()).toBeNull();
    });
  });
});
