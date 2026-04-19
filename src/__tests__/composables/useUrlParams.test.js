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
});
