import { describe, it, expect } from "vitest";
import {
  MENU_MONTH_RE,
  parseMenuFilename,
  menuFilePath,
  daysInMonth,
  parseMenuText,
  serializeMenuText,
  monthLabel,
} from "@/utils/menuText";

describe("menuText helpers", () => {
  it("matches valid YYYY-MM month keys only", () => {
    expect(MENU_MONTH_RE.test("2026-07")).toBe(true);
    expect(MENU_MONTH_RE.test("2026-13")).toBe(false);
    expect(MENU_MONTH_RE.test("2026-00")).toBe(false);
    expect(MENU_MONTH_RE.test("2026-7")).toBe(false);
  });

  it("parses menu source filenames", () => {
    expect(parseMenuFilename("2026-07-a.txt")).toEqual({
      key: "2026-07",
      type: "a",
    });
    expect(parseMenuFilename("2026-07-B.txt")).toEqual({
      key: "2026-07",
      type: "b",
    });
    expect(parseMenuFilename("menu.json")).toBeNull();
    expect(parseMenuFilename("2026-07-c.txt")).toBeNull();
  });

  it("builds the repo path for a month/type", () => {
    expect(menuFilePath("2026-07", "a")).toBe("data/menu/2026-07-a.txt");
  });

  it("knows the length of a month", () => {
    expect(daysInMonth("2026-07")).toBe(31);
    expect(daysInMonth("2026-02")).toBe(28);
    expect(daysInMonth("2024-02")).toBe(29);
  });

  it("parses text into trimmed lines, dropping trailing blanks", () => {
    expect(parseMenuText("カレー\r\n定休日\n\n\n")).toEqual([
      "カレー",
      "定休日",
    ]);
    expect(parseMenuText("  唐揚げ  ")).toEqual(["唐揚げ"]);
    expect(parseMenuText("")).toEqual([]);
  });

  it("keeps interior blanks but trims trailing ones on serialize", () => {
    expect(serializeMenuText(["カレー", "", "豚カツ"])).toBe(
      "カレー\n\n豚カツ\n",
    );
    expect(serializeMenuText(["カレー", "", ""])).toBe("カレー\n");
    expect(serializeMenuText([])).toBe("");
    expect(serializeMenuText(["", ""])).toBe("");
  });

  it("round-trips text through parse then serialize", () => {
    const original = "カレー\n定休日\n豚カツ\n";
    expect(serializeMenuText(parseMenuText(original))).toBe(original);
  });

  it("formats a Japanese month label", () => {
    expect(monthLabel("2026-07")).toBe("2026年7月");
    expect(monthLabel("2026-12")).toBe("2026年12月");
  });
});
