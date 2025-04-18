import dayjs from "dayjs";
import { WEEKDAYS } from "@/config/constants";
import { useHolidayStore } from "@/stores/holiday";

/**
 * 曜日名を返す関数
 * @param {dayjs} date 日付オブジェクト
 * @returns {string} 曜日名
 */
export function getWeekdayName(date) {
  return WEEKDAYS[date.day()];
}

/**
 * 日付の曜日や祝日に応じたクラス名を返す関数
 * @param {dayjs} date 日付オブジェクト
 * @returns {string} CSSクラス名
 */
export function getDayClass(date) {
  const holidayStore = useHolidayStore();
  const day = date.day();

  if (holidayStore.isHoliday(date)) {
    return "holiday";
  }

  // 曜日による判定
  if (day === 0) return "fc-day-sun";
  if (day === 6) return "fc-day-sat";

  return "";
}

/**
 * 基準日が過去かどうかを確認する関数
 * @param {string|dayjs} selectedBaseDate 基準日
 * @returns {boolean} 過去の日付ならtrue
 */
export function isBaseDateInPast(selectedBaseDate) {
  const today = dayjs().startOf("day");
  const currentBaseDate = dayjs(selectedBaseDate);
  return currentBaseDate.isBefore(today);
}
