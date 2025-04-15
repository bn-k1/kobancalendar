// date-utils.js - 日付操作関連のユーティリティ関数
import dayjs from "dayjs";
import { WEEKDAYS } from "./constants.js";
import Alpine from "alpinejs";

// 曜日名を返す関数
export function getWeekdayName(date) {
  return WEEKDAYS[date.day()];
}

// 日付の曜日や祝日に応じたクラス名を返す関数
export function getDayClass(date) {
  const day = date.day();

  if (Alpine.store("state") && Alpine.store("state").isHoliday(date)) {
    return "holiday";
  }

  // 曜日による判定
  if (day === 0) return "fc-day-sun";
  if (day === 6) return "fc-day-sat";

  return "";
}

// 基準日が過去かどうかを確認する関数
export function isBaseDateInPast(selectedBaseDate) {
  const today = dayjs().startOf("day");
  const currentBaseDate = dayjs(selectedBaseDate);
  return currentBaseDate.isBefore(today);
}
