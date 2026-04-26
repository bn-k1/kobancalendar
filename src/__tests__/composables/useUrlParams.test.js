// src/__tests__/composables/useUrlParams.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { useUrlParams } from "@/composables/useUrlParams";

function setLocation(pathname, search = "", hash = "") {
  window.history.replaceState({}, "", `${pathname}${search}${hash}`);
}

describe("useUrlParams", () => {
  beforeEach(() => {
    setLocation("/", "", "#/");
  });

  describe("hasLegacyUrlParams", () => {
    it("returns false when no query string", () => {
      const { hasLegacyUrlParams } = useUrlParams();
      expect(hasLegacyUrlParams()).toBe(false);
    });

    it("returns false when only unknown params present", () => {
      setLocation("/", "?foo=bar", "#/");
      const { hasLegacyUrlParams } = useUrlParams();
      expect(hasLegacyUrlParams()).toBe(false);
    });

    it("returns true when a recognized legacy param is present", () => {
      setLocation("/", "?baseDate=2025-11-16", "#/");
      const { hasLegacyUrlParams } = useUrlParams();
      expect(hasLegacyUrlParams()).toBe(true);
    });

    it("recognizes all legacy keys", () => {
      const keys = ["baseDate", "startNumber"];
      for (const key of keys) {
        setLocation("/", `?${key}=x`, "#/");
        const { hasLegacyUrlParams } = useUrlParams();
        expect(hasLegacyUrlParams(), key).toBe(true);
      }
    });

    it("ignores retired meetup params", () => {
      for (const key of ["participants", "startTime", "period"]) {
        setLocation("/", `?${key}=x`, "#/");
        const { hasLegacyUrlParams } = useUrlParams();
        expect(hasLegacyUrlParams(), key).toBe(false);
      }
    });
  });

  describe("readLegacyUrlParams", () => {
    it("returns only recognized keys as raw strings", () => {
      setLocation(
        "/",
        "?baseDate=2025-11-16&startNumber=5&foo=bar&participants=1,2",
        "#/",
      );
      const { readLegacyUrlParams } = useUrlParams();
      expect(readLegacyUrlParams()).toEqual({
        baseDate: "2025-11-16",
        startNumber: "5",
      });
    });
  });

  describe("clearUrl", () => {
    it("strips query params but keeps hash route", () => {
      setLocation("/", "?baseDate=2025-11-16&startNumber=5", "#/meetup");
      const { clearUrl } = useUrlParams();
      clearUrl();
      expect(window.location.search).toBe("");
      expect(window.location.hash).toBe("#/meetup");
    });

    it("normalizes empty hash to #/", () => {
      setLocation("/", "?baseDate=2025-11-16", "");
      const { clearUrl } = useUrlParams();
      clearUrl();
      expect(window.location.hash).toBe("#/");
    });
  });

  describe("calculateNewPosition", () => {
    const { calculateNewPosition } = useUrlParams();

    it("adds the shift within the cycle", () => {
      expect(calculateNewPosition(5, 10, 130)).toBe(15);
    });

    it("wraps around when the sum exceeds cycle length", () => {
      expect(calculateNewPosition(120, 31, 130)).toBe(21);
    });

    it("returns null on missing inputs", () => {
      expect(calculateNewPosition(null, 10, 130)).toBeNull();
      expect(calculateNewPosition(5, null, 130)).toBeNull();
      expect(calculateNewPosition(5, 10, null)).toBeNull();
    });
  });

  describe("readCanonicalCalendar", () => {
    it("reads p from hash query on home path", () => {
      setLocation("/", "", "#/?p=12");
      const { readCanonicalCalendar } = useUrlParams();
      expect(readCanonicalCalendar()).toEqual({ position: 12, version: null });
    });

    it("reads v=old when present", () => {
      setLocation("/", "", "#/?v=old&p=8");
      const { readCanonicalCalendar } = useUrlParams();
      expect(readCanonicalCalendar()).toEqual({ position: 8, version: "old" });
    });

    it("returns null position for non-numeric p", () => {
      setLocation("/", "", "#/?p=abc");
      const { readCanonicalCalendar } = useUrlParams();
      expect(readCanonicalCalendar().position).toBeNull();
    });

    it("returns nulls when path is not home", () => {
      setLocation("/", "", "#/meetup?p=12");
      const { readCanonicalCalendar } = useUrlParams();
      expect(readCanonicalCalendar()).toEqual({
        position: null,
        version: null,
      });
    });

    it("returns nulls on bare home", () => {
      setLocation("/", "", "#/");
      const { readCanonicalCalendar } = useUrlParams();
      expect(readCanonicalCalendar()).toEqual({
        position: null,
        version: null,
      });
    });
  });

  describe("writeCalendarUrl", () => {
    it("sets p in hash query and preserves home path", () => {
      setLocation("/", "", "#/");
      const { writeCalendarUrl } = useUrlParams();
      writeCalendarUrl({ position: 7 });
      expect(window.location.hash).toBe("#/?p=7");
    });

    it("sets both v=old and p when version is 'old'", () => {
      setLocation("/", "", "#/");
      const { writeCalendarUrl } = useUrlParams();
      writeCalendarUrl({ position: 3, version: "old" });
      const params = new URLSearchParams(window.location.hash.split("?")[1]);
      expect(params.get("p")).toBe("3");
      expect(params.get("v")).toBe("old");
    });

    it("removes p when position is null", () => {
      setLocation("/", "", "#/?p=5");
      const { writeCalendarUrl } = useUrlParams();
      writeCalendarUrl({ position: null });
      expect(window.location.hash).toBe("#/");
    });

    it("removes v when version is null", () => {
      setLocation("/", "", "#/?v=old&p=5");
      const { writeCalendarUrl } = useUrlParams();
      writeCalendarUrl({ position: 5, version: null });
      expect(window.location.hash).toBe("#/?p=5");
    });

    it("uses replaceState (does not grow history)", () => {
      setLocation("/", "", "#/");
      const lengthBefore = window.history.length;
      const { writeCalendarUrl } = useUrlParams();
      writeCalendarUrl({ position: 1 });
      writeCalendarUrl({ position: 2 });
      writeCalendarUrl({ position: 3 });
      expect(window.history.length).toBe(lengthBefore);
    });

    it("preserves the current path when called from /meetup", () => {
      setLocation("/", "", "#/meetup");
      const { writeCalendarUrl } = useUrlParams();
      writeCalendarUrl({ position: 9 });
      expect(window.location.hash).toBe("#/meetup?p=9");
    });
  });

  describe("clearCalendarUrl", () => {
    it("removes p and v but keeps the path", () => {
      setLocation("/", "", "#/?v=old&p=12");
      const { clearCalendarUrl } = useUrlParams();
      clearCalendarUrl();
      expect(window.location.hash).toBe("#/");
    });

    it("preserves unrelated query params", () => {
      setLocation("/", "", "#/?p=12&foo=bar");
      const { clearCalendarUrl } = useUrlParams();
      clearCalendarUrl();
      expect(window.location.hash).toBe("#/?foo=bar");
    });
  });

  describe("readCanonicalMeetup", () => {
    it("reads ps/t/d from /meetup", () => {
      setLocation("/", "", "#/meetup?ps=1,7,12&t=19:00&d=120");
      const { readCanonicalMeetup } = useUrlParams();
      expect(readCanonicalMeetup()).toEqual({
        participants: [1, 7, 12],
        startTime: "19:00",
        period: 120,
      });
    });

    it("returns null when path is not /meetup", () => {
      setLocation("/", "", "#/?ps=1,7&t=19:00&d=120");
      const { readCanonicalMeetup } = useUrlParams();
      expect(readCanonicalMeetup()).toBeNull();
    });

    it("returns null when ps is missing", () => {
      setLocation("/", "", "#/meetup?t=19:00&d=120");
      const { readCanonicalMeetup } = useUrlParams();
      expect(readCanonicalMeetup()).toBeNull();
    });

    it("returns null when t is missing", () => {
      setLocation("/", "", "#/meetup?ps=1,7&d=120");
      const { readCanonicalMeetup } = useUrlParams();
      expect(readCanonicalMeetup()).toBeNull();
    });

    it("returns null when d is missing", () => {
      setLocation("/", "", "#/meetup?ps=1,7&t=19:00");
      const { readCanonicalMeetup } = useUrlParams();
      expect(readCanonicalMeetup()).toBeNull();
    });

    it("filters out non-numeric participants", () => {
      setLocation("/", "", "#/meetup?ps=1,abc,7&t=19:00&d=60");
      const { readCanonicalMeetup } = useUrlParams();
      expect(readCanonicalMeetup().participants).toEqual([1, 7]);
    });

    it("returns null when all participants are non-numeric", () => {
      setLocation("/", "", "#/meetup?ps=abc,xyz&t=19:00&d=60");
      const { readCanonicalMeetup } = useUrlParams();
      expect(readCanonicalMeetup()).toBeNull();
    });
  });

  describe("writeMeetupUrl", () => {
    it("sets ps/t/d in hash query", () => {
      setLocation("/", "", "#/meetup");
      const { writeMeetupUrl } = useUrlParams();
      writeMeetupUrl({
        participants: [1, 7, 12],
        startTime: "19:00",
        period: 120,
      });
      const params = new URLSearchParams(window.location.hash.split("?")[1]);
      expect(params.get("ps")).toBe("1,7,12");
      expect(params.get("t")).toBe("19:00");
      expect(params.get("d")).toBe("120");
    });

    it("accepts participant objects with .position", () => {
      setLocation("/", "", "#/meetup");
      const { writeMeetupUrl } = useUrlParams();
      writeMeetupUrl({
        participants: [{ position: 3 }, { position: 8 }],
        startTime: "20:00",
        period: 60,
      });
      const params = new URLSearchParams(window.location.hash.split("?")[1]);
      expect(params.get("ps")).toBe("3,8");
    });

    it("removes ps when participants is empty", () => {
      setLocation("/", "", "#/meetup?ps=1,2&t=19:00&d=60");
      const { writeMeetupUrl } = useUrlParams();
      writeMeetupUrl({ participants: [], startTime: "19:00", period: 60 });
      const params = new URLSearchParams(window.location.hash.split("?")[1]);
      expect(params.has("ps")).toBe(false);
    });

    it("uses replaceState (does not grow history)", () => {
      setLocation("/", "", "#/meetup");
      const lengthBefore = window.history.length;
      const { writeMeetupUrl } = useUrlParams();
      writeMeetupUrl({ participants: [1], startTime: "19:00", period: 60 });
      writeMeetupUrl({ participants: [1, 2], startTime: "19:00", period: 60 });
      expect(window.history.length).toBe(lengthBefore);
    });
  });

  describe("clearMeetupUrl", () => {
    it("removes ps, t, d", () => {
      setLocation("/", "", "#/meetup?ps=1,2&t=19:00&d=60");
      const { clearMeetupUrl } = useUrlParams();
      clearMeetupUrl();
      expect(window.location.hash).toBe("#/meetup");
    });
  });
});
