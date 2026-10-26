// src/composables/usePayPeriod.js
import { useCalendarStore } from "@/stores/calendar";
import { useSchedule } from "@/composables/useSchedule";
import { useEditedSchedules } from "@/composables/useEditedSchedules";
import { createDate, addDays, isBefore, formatAsISODate } from "@/utils/date";

// 賃金は15日締め: a period runs from the 16th to the next month's 15th.
const CUTOFF_DAY = 15;

function toMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * 拘束 = 退勤 − 出勤, in minutes. Tables write past-midnight 退勤 past 24;
 * hand edits can only pick 0–23, so an earlier 退勤 means the next day.
 */
export function bindingMinutes(startTime, endTime) {
  const minutes = toMinutes(endTime) - toMinutes(startTime);
  return minutes < 0 ? minutes + 24 * 60 : minutes;
}

/** Minutes → `H:MM`, with a leading `-` when negative. */
export function formatMinutes(minutes) {
  const sign = minutes < 0 ? "-" : "";
  const abs = Math.abs(minutes);
  return `${sign}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, "0")}`;
}

/**
 * The pay period containing `date`.
 * @returns {{start: dayjs, end: dayjs}} both inclusive
 */
export function payPeriodFor(date) {
  const d = createDate(date).startOf("day");
  const start =
    d.date() > CUTOFF_DAY
      ? d.date(CUTOFF_DAY + 1)
      : d.subtract(1, "month").date(CUTOFF_DAY + 1);
  return { start, end: start.add(1, "month").date(CUTOFF_DAY) };
}

/** The pay period closing in the month containing `date` (Oct → 9/16 ~ 10/15). */
export function payPeriodClosingIn(date) {
  return payPeriodFor(createDate(date).date(CUTOFF_DAY));
}

/**
 * Per-day 拘束・超・中休・深夜P and their pay-period totals, for the selected
 * コマ with hand edits applied (unless edits are hidden), like the calendar.
 */
export function usePayPeriod() {
  const calendarStore = useCalendarStore();
  const { getScheduleForDate, lookupMetrics, scheduleDataForDate } =
    useSchedule();
  const { getEditedSchedule, isEditsHidden } = useEditedSchedules();

  /**
   * @returns {Object|null} null when no コマ is selected or the day has no
   *   table (outside the viewed generation) and no edit. `binding` is set
   *   only on work days; `overtime` / `midBreak` are undefined when unknown.
   */
  function dayMetrics(date) {
    const position = calendarStore.startPosition;
    if (!Number.isInteger(position)) return null;

    const dateStr = formatAsISODate(date);
    const edited = isEditsHidden.value ? null : getEditedSchedule(dateStr);
    let day;
    if (edited) {
      day = {
        subject: edited.subject,
        startTime: edited.startTime,
        endTime: edited.endTime,
        nightPoints: 0,
        ...lookupMetrics(
          date,
          edited.subject,
          edited.startTime,
          edited.endTime,
        ),
      };
      // Hand-typed 超勤 / 中休 win over the table's.
      if (edited.overtime !== undefined) day.overtime = edited.overtime;
      if (edited.midBreak !== undefined) day.midBreak = edited.midBreak;
    } else {
      day = getScheduleForDate(date, position);
      if (!day) return null;
    }

    const isWork = !!(day.startTime && day.endTime);
    return {
      subject: day.subject,
      startTime: day.startTime,
      endTime: day.endTime,
      binding: isWork ? bindingMinutes(day.startTime, day.endTime) : undefined,
      overtime: isWork ? day.overtime : undefined,
      midBreak: isWork ? day.midBreak : undefined,
      nightPoints: isWork ? day.nightPoints : 0,
    };
  }

  /**
   * Totals over `[start, end]` (inclusive). A day's negative 超 counts as 0
   * (the union's rule: it is not deducted); work days without a known 超
   * are counted in `unknownOvertimeDays` instead.
   */
  function summarizePeriod({ start, end }) {
    const total = {
      workDays: 0,
      binding: 0,
      overtime: 0,
      midBreak: 0,
      nightPoints: 0,
      unknownOvertimeDays: 0,
      noTableDays: 0,
    };
    for (
      let d = createDate(start);
      !isBefore(createDate(end), d);
      d = addDays(d, 1)
    ) {
      const day = dayMetrics(d);
      if (!day) {
        total.noTableDays += 1;
        continue;
      }
      if (day.binding === undefined) continue;
      total.workDays += 1;
      total.binding += day.binding;
      total.nightPoints += day.nightPoints;
      total.midBreak += day.midBreak ?? 0;
      if (day.overtime === undefined) total.unknownOvertimeDays += 1;
      else total.overtime += Math.max(0, day.overtime);
    }
    return total;
  }

  /**
   * Whether the tables in effect over the period carry any 超・中休・深夜P
   * column. They are optional; without them the totals mean nothing.
   */
  function periodHasMetrics({ start, end }) {
    return [start, end].some((date) => {
      const data = scheduleDataForDate(date);
      return ["weekday", "saturday", "holiday"].some((type) =>
        data[type].some(
          (row) => row.c !== undefined || row.k !== undefined || row.n,
        ),
      );
    });
  }

  return { dayMetrics, summarizePeriod, periodHasMetrics };
}
