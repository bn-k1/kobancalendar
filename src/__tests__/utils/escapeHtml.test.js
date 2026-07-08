// src/__tests__/utils/escapeHtml.test.js
import { describe, it, expect } from "vitest";
import { escapeHtml } from "@/utils/escapeHtml";

describe("escapeHtml()", () => {
  it("escapes all five HTML metacharacters", () => {
    expect(escapeHtml("&")).toBe("&amp;");
    expect(escapeHtml("<")).toBe("&lt;");
    expect(escapeHtml(">")).toBe("&gt;");
    expect(escapeHtml('"')).toBe("&quot;");
    expect(escapeHtml("'")).toBe("&#39;");
  });

  it("escapes & before the entities it introduces (no double-escaping)", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  it("escapes a full XSS payload", () => {
    expect(escapeHtml('<img src=x onerror="alert(1)">')).toBe(
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;",
    );
  });

  it("leaves strings without metacharacters untouched", () => {
    expect(escapeHtml("08:00")).toBe("08:00");
    expect(escapeHtml("早番")).toBe("早番");
  });

  it("coerces non-string values to strings", () => {
    expect(escapeHtml(123)).toBe("123");
    expect(escapeHtml(true)).toBe("true");
  });

  it("handles empty and nullish values", () => {
    expect(escapeHtml("")).toBe("");
    expect(escapeHtml(null)).toBe("null");
    expect(escapeHtml(undefined)).toBe("undefined");
  });
});
