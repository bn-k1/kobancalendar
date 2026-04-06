// src/__tests__/utils/constants.test.js
// Characterization tests for constants - documents fixed values
import { describe, it, expect } from "vitest";
import {
  TIMEZONE,
  APP_CONFIG,
  DATE_FORMATS,
  WEEKDAYS,
  LONG_PRESS_DURATION,
  CUSTOM_HOLIDAY,
  TIMEOPTIONS,
  PERIODOPTIONS,
  ERROR_MESSAGES,
  EDITED_SCHEDULE_EMPTY_NOTICE,
} from "@/utils/constants";

describe("TIMEZONE", () => {
  it("Asia/Tokyo に設定されている", () => {
    expect(TIMEZONE).toBe("Asia/Tokyo");
  });
});

describe("APP_CONFIG", () => {
  it("デフォルト祝日年数は 5", () => {
    expect(APP_CONFIG.DEFAULT_HOLIDAY_YEARS).toBe(5);
  });

  it("デフォルト検索期間は 30 日", () => {
    expect(APP_CONFIG.DEFAULT_SEARCH_PERIOD).toBe(30);
  });

  it("デフォルト集合時刻は 17:00", () => {
    expect(APP_CONFIG.DEFAULT_MEETUP_START_TIME).toBe("17:00");
  });
});

describe("DATE_FORMATS", () => {
  it("ISO_DATE は YYYY-MM-DD", () => {
    expect(DATE_FORMATS.ISO_DATE).toBe("YYYY-MM-DD");
  });

  it("DISPLAY_DATE は YYYY/MM/DD", () => {
    expect(DATE_FORMATS.DISPLAY_DATE).toBe("YYYY/MM/DD");
  });

  it("FILE_NAME_DATE は YYYYMMDD", () => {
    expect(DATE_FORMATS.FILE_NAME_DATE).toBe("YYYYMMDD");
  });
});

describe("WEEKDAYS", () => {
  it("7 要素の配列", () => {
    expect(WEEKDAYS).toHaveLength(7);
  });

  it("インデックス 0 が日曜", () => {
    expect(WEEKDAYS[0]).toBe("日");
  });

  it("インデックス 6 が土曜", () => {
    expect(WEEKDAYS[6]).toBe("土");
  });

  it("全曜日が揃っている", () => {
    expect(WEEKDAYS).toEqual(["日", "月", "火", "水", "木", "金", "土"]);
  });
});

describe("LONG_PRESS_DURATION", () => {
  it("500ms に設定されている", () => {
    expect(LONG_PRESS_DURATION).toBe(500);
  });
});

describe("CUSTOM_HOLIDAY", () => {
  it("設定祝日 という文字列", () => {
    expect(CUSTOM_HOLIDAY).toBe("設定祝日");
  });
});

describe("TIMEOPTIONS", () => {
  it("12:00 から始まる", () => {
    expect(TIMEOPTIONS[0]).toBe("12:00");
  });

  it("22:00 で終わる", () => {
    expect(TIMEOPTIONS[TIMEOPTIONS.length - 1]).toBe("22:00");
  });

  it("11 個の選択肢がある", () => {
    expect(TIMEOPTIONS).toHaveLength(11);
  });
});

describe("PERIODOPTIONS", () => {
  it("3 つの期間選択肢がある", () => {
    expect(PERIODOPTIONS).toHaveLength(3);
  });

  it("value は文字列の日数", () => {
    expect(PERIODOPTIONS[0].value).toBe("30");
    expect(PERIODOPTIONS[1].value).toBe("60");
    expect(PERIODOPTIONS[2].value).toBe("90");
  });

  it("text は日本語ラベル", () => {
    expect(PERIODOPTIONS[0].text).toBe("1ヶ月");
    expect(PERIODOPTIONS[1].text).toBe("2ヶ月");
    expect(PERIODOPTIONS[2].text).toBe("3ヶ月");
  });
});

describe("ERROR_MESSAGES", () => {
  it("必須エラーキーが存在する", () => {
    const required = [
      "INIT_FAILED",
      "NO_BASE_DATE",
      "INVALID_BASE_DATE",
      "INVALID_STARTNUMBER",
      "CONFIG_NOT_LOADED",
      "SCHEDULE_DATA_ERROR",
      "HOLIDAYS_LOAD_ERROR",
      "NO_PARTICIPANTS",
    ];
    required.forEach((key) => {
      expect(ERROR_MESSAGES[key]).toBeTruthy();
      expect(typeof ERROR_MESSAGES[key]).toBe("string");
    });
  });
});

describe("EDITED_SCHEDULE_EMPTY_NOTICE", () => {
  it("長押し案内文が設定されている", () => {
    expect(EDITED_SCHEDULE_EMPTY_NOTICE).toBe("長押しで予定を編集できます。");
  });
});
