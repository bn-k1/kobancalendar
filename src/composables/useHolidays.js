// src/composables/useHolidays.js
import JapaneseHolidays from "japanese-holidays";
import config from "@config/config.json";
import { createDate, isSunday } from "@/utils/date";

export const CUSTOM_HOLIDAY = "設定祝日";

// config.custom_holidays: MM-DD days off every year (validated at build).
const customHolidays = new Set(config.custom_holidays ?? []);

/**
 * Holiday lookup, computed per date: national holidays (振替・国民の休日
 * included) from japanese-holidays, then config.custom_holidays. No store
 * and no precomputed year window, so any date works.
 */
export function useHolidays() {
  /**
   * @param {dayjs|Date|string} date
   * @returns {string|undefined} holiday name; a national holiday wins over a
   *   custom one on the same day
   */
  function getHolidayName(date) {
    const d = createDate(date);
    return (
      JapaneseHolidays.isHoliday(d.toDate()) ??
      (customHolidays.has(d.format("MM-DD")) ? CUSTOM_HOLIDAY : undefined)
    );
  }

  /**
   * Sundays count as holidays too (they use the holiday table).
   * @param {dayjs|Date|string} date
   * @returns {boolean}
   */
  function isHoliday(date) {
    return isSunday(createDate(date)) || getHolidayName(date) !== undefined;
  }

  return { isHoliday, getHolidayName };
}
