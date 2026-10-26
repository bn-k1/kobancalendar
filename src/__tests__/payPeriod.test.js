// Pay-period bounds and per-period totals of 拘束・超・中休・深夜P.
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useSchedule } from "@/composables/useSchedule";
import { useCalendar } from "@/composables/useCalendar";
import { useEditedSchedules } from "@/composables/useEditedSchedules";
import {
  usePayPeriod,
  payPeriodFor,
  payPeriodClosingIn,
  formatMinutes,
  bindingMinutes,
} from "@/composables/usePayPeriod";
import { buildEpochs } from "@/composables/useAppInitializer";
import { formatAsISODate } from "@/utils/date";

// 3-slot rotation, same on every day type: 早 (negative 超, 中休), T
// (positive 超, 中休), 公休. 遅 is a diagram in the table that the rotation never hits
// on its own, so it only shows up through a hand edit.
const day = () => [
  { s: "早", sT: "06:00", eT: "15:00", c: -30, k: 120 },
  { s: "T1/2", sT: "07:00", eT: "21:00", c: 335, k: 118 },
  { s: "公休" },
];
const table = {
  holiday: day(),
  saturday: day(),
  weekday: [
    ...day().slice(0, 2),
    { s: "遅", sT: "15:59", eT: "24:42", c: -29, n: 36 },
  ],
  rotationCycleLength: 3,
};

function load(from = "2026-01-01") {
  useSchedule().loadSchedule(
    buildEpochs([{ from, segments: [{ from, data: "a" }] }]),
    { a: table },
  );
  useCalendar().setStartPosition(1);
  useEditedSchedules().initEditedSchedules();
}

beforeEach(() => setActivePinia(createPinia()));

const iso = ({ start, end }) => [formatAsISODate(start), formatAsISODate(end)];

describe("payPeriodFor", () => {
  it.each([
    ["2026-02-01", "2026-01-16", "2026-02-15"],
    ["2026-02-15", "2026-01-16", "2026-02-15"],
    ["2026-02-16", "2026-02-16", "2026-03-15"],
    ["2026-01-10", "2025-12-16", "2026-01-15"],
    ["2025-12-20", "2025-12-16", "2026-01-15"],
  ])("%s → %s ~ %s", (date, start, end) => {
    expect(iso(payPeriodFor(date))).toEqual([start, end]);
  });

  it.each(["2026-10-01", "2026-10-15", "2026-10-31"])(
    "%s の月は 9/16 ~ 10/15",
    (date) => {
      expect(iso(payPeriodClosingIn(date))).toEqual([
        "2026-09-16",
        "2026-10-15",
      ]);
    },
  );
});

describe("formatMinutes / bindingMinutes", () => {
  it.each([
    [0, "0:00"],
    [-72, "-1:12"],
    [605, "10:05"],
  ])("%i → %s", (m, s) => expect(formatMinutes(m)).toBe(s));

  it("24時超えの退勤と、手入力の翌日退勤", () => {
    expect(bindingMinutes("15:59", "24:42")).toBe(523);
    expect(bindingMinutes("15:59", "00:42")).toBe(523);
  });
});

describe("summarizePeriod", () => {
  // 2026-01-01 (Thu) = コマ1, so Jan 16 – Feb 15 (31 days) starts on コマ1:
  // 早 ×11, T ×10, and the 3rd slot ×10 = 遅 on 5 平日 (1/21, 27, 30,
  // 2/2, 5) and 公休 on 4 土日 + 2/11 (建国記念の日, holiday table).
  it("マイナスの超は 0、中休は時間の合計", () => {
    load();
    expect(usePayPeriod().summarizePeriod(payPeriodFor("2026-01-20"))).toEqual({
      workDays: 26,
      binding: 11 * 540 + 10 * 840 + 5 * 523,
      overtime: 10 * 335,
      midBreak: 11 * 120 + 10 * 118,
      nightPoints: 5 * 36,
      unknownOvertimeDays: 0,
      noTableDays: 0,
    });
  });

  it("手で差し替えた仕業も表から数字を引く", () => {
    load();
    const { saveEditedSchedule } = useEditedSchedules();
    const { dayMetrics } = usePayPeriod();
    // 2026-01-05 (Mon) = コマ2 = T; swap to 遅. (1/2 is a custom holiday.)
    saveEditedSchedule("2026-01-05", {
      subject: "遅",
      startTime: "15:59",
      endTime: "24:42",
    });
    expect(dayMetrics("2026-01-05")).toMatchObject({
      binding: 523,
      overtime: -29,
      nightPoints: 36,
    });
  });

  it("時刻を変えた差し替えは超が不明", () => {
    load();
    useEditedSchedules().saveEditedSchedule("2026-01-05", {
      subject: "遅",
      startTime: "15:00",
      endTime: "24:42",
    });
    const day = usePayPeriod().dayMetrics("2026-01-05");
    expect(day.overtime).toBeUndefined();
    expect(day.nightPoints).toBe(0);
  });

  it("自分で入力した超勤・中休は表より優先", () => {
    load();
    useEditedSchedules().saveEditedSchedule("2026-01-05", {
      subject: "研修",
      startTime: "09:00",
      endTime: "18:00",
      overtime: 60,
      midBreak: 45,
    });
    expect(usePayPeriod().dayMetrics("2026-01-05")).toMatchObject({
      binding: 540,
      overtime: 60,
      midBreak: 45,
    });
    // Survives a reload from localStorage.
    setActivePinia(createPinia());
    load();
    expect(useEditedSchedules().getEditedSchedule("2026-01-05")).toMatchObject({
      overtime: 60,
      midBreak: 45,
    });
  });

  it("世代の前は表がない日として数える", () => {
    load("2026-01-20");
    const total = usePayPeriod().summarizePeriod(payPeriodFor("2026-01-20"));
    expect(total.noTableDays).toBe(4);
  });
});

describe("periodHasMetrics", () => {
  it("超・中休・深夜P の列がある表なら true", () => {
    load();
    expect(usePayPeriod().periodHasMetrics(payPeriodFor("2026-01-20"))).toBe(
      true,
    );
  });

  it("予定名・開始・終了だけの表なら false", () => {
    const plain = day().map(({ s, sT, eT }) => ({ s, sT, eT }));
    useSchedule().loadSchedule(
      buildEpochs([
        { from: "2026-01-01", segments: [{ from: "2026-01-01", data: "p" }] },
      ]),
      {
        p: {
          holiday: plain,
          saturday: plain,
          weekday: plain,
          rotationCycleLength: 3,
        },
      },
    );
    expect(usePayPeriod().periodHasMetrics(payPeriodFor("2026-01-20"))).toBe(
      false,
    );
  });
});
