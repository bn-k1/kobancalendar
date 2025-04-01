// calendar/utils.js - カレンダー関連のユーティリティ関数

import dayjs from "dayjs";

// 日付をカレンダーフォーマットに変換
function formatDateForCalendar(date) {
  return dayjs(date).format("YYYY-MM-DD");
}

// 曜日文字列を取得 (0=日曜, 1=月曜, ..., 6=土曜)
function getDayOfWeekString(date) {
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  return dayNames[dayjs(date).day()];
}

// 2つの日付間の日数を計算
function daysBetween(startDate, endDate) {
  const start = dayjs(startDate).startOf("day");
  const end = dayjs(endDate).startOf("day");
  return end.diff(start, "day");
}

// 範囲内の日付配列を生成
function generateDateRange(startDate, endDate) {
  const result = [];
  let current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isBefore(end) || current.isSame(end, "day")) {
    result.push(current);
    current = current.add(1, "day");
  }

  return result;
}

export {
  formatDateForCalendar,
  getDayOfWeekString,
  daysBetween,
  generateDateRange,
};
