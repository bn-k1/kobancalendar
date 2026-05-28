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
