// store/schedule.js - スケジュール計算関連の機能
import dayjs from "dayjs";
import { getState } from "./index.js";
import { initializeCache } from "./state.js";
import { isHoliday } from "./holidays.js";

/**
 * シフトインデックスを計算する関数
 * @param {dayjs} targetDate - 対象日付
 * @param {number} startPosition - 開始位置
 * @param {dayjs} currentBaseDate - 現在の基準日
 * @returns {number} 計算されたシフトインデックス
 */
function calculateShiftIndex(targetDate, startPosition, currentBaseDate) {
  const daysDifference = targetDate.diff(currentBaseDate, "day");
  const adjustedStartPosition = startPosition - 1;
  const rotationCycleLength = getState("scheduleData").rotationCycleLength;

  const shiftIndex =
    (((adjustedStartPosition + daysDifference) % rotationCycleLength) +
      rotationCycleLength) %
    rotationCycleLength;

  return shiftIndex;
}

/**
 * 任意の日付とコマ位置から勤務内容を返す
 * @param {dayjs} targetDate - 対象日付
 * @param {number} startPosition - 開始位置
 * @param {dayjs} currentBaseDate - 現在の基準日
 * @param {dayjs} lastBaseDate - 最終基準日
 * @returns {Object|null} スケジュール情報
 */
function _getScheduleForDate(
  targetDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  const dateStr = targetDate.format("YYYY-MM-DD");
  const isHolidayFlag = isHoliday(targetDate);
  const isSaturday = targetDate.day() === 6; // day()は0が日曜、6が土曜
  const formattedCurrentBaseDate = currentBaseDate.format("YYYY-MM-DD");
  const formattedLastBaseDate = lastBaseDate.format("YYYY-MM-DD");

  // 日付が基準範囲外の場合
  if (
    (currentBaseDate.unix() !== lastBaseDate.unix() &&
      dateStr >= formattedLastBaseDate) ||
    dateStr < formattedCurrentBaseDate
  ) {
    return {
      dateStr,
      subject: "-",
      startTime: "",
      endTime: "",
      isHoliday: isHolidayFlag,
      isSaturday,
    };
  }

  // 日付差分から勤務位置を計算（calculateShiftIndex関数を使用）
  const shiftIndex = calculateShiftIndex(
    targetDate,
    startPosition,
    currentBaseDate,
  );

  // 曜日タイプに基づくデータ選択
  const scheduleData = getState("scheduleData");
  let shiftData;
  if (isHolidayFlag) {
    shiftData = scheduleData.holiday[shiftIndex];
  } else if (isSaturday) {
    shiftData = scheduleData.saturday[shiftIndex];
  } else {
    shiftData = scheduleData.weekday[shiftIndex];
  }

  if (!shiftData) return null;

  const [subject, startTime, endTime] = shiftData.split(",");
  return {
    dateStr,
    subject,
    startTime,
    endTime,
    isHoliday: isHolidayFlag,
    isSaturday,
    shiftIndex, // シフトインデックスを結果に含める
  };
}

/**
 * スケジュール情報を取得（キャッシュ対応）
 * @param {dayjs} targetDate - 対象日付
 * @param {number} startPosition - 開始位置
 * @param {dayjs} currentBaseDate - 現在の基準日
 * @param {dayjs} lastBaseDate - 最終基準日
 * @returns {Object|null} スケジュール情報
 */
function getScheduleForDate(
  targetDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  // キャッシュが初期化されていなければ初期化
  const scheduleCache = getState("scheduleCache");
  if (!scheduleCache) {
    initializeCache();
  }

  const key = `${targetDate.format("YYYY-MM-DD")}_${startPosition}_${currentBaseDate.format(
    "YYYY-MM-DD",
  )}_${lastBaseDate.format("YYYY-MM-DD")}`;

  if (!scheduleCache.has(key)) {
    const result = _getScheduleForDate(
      targetDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    );
    scheduleCache.set(key, result);
  }

  return scheduleCache.get(key);
}

/**
 * 日付範囲のスケジュールデータを計算して返す
 * @param {string|dayjs} startDate - 開始日
 * @param {string|dayjs} endDate - 終了日
 * @param {number} startPosition - 開始位置
 * @param {dayjs} currentBaseDate - 現在の基準日
 * @param {dayjs} lastBaseDate - 最終基準日
 * @returns {Array} スケジュール情報の配列
 */
function calculateScheduleRange(
  startDate,
  endDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  const scheduleRange = [];

  let currentDate = dayjs(startDate);
  const finalEndDate = dayjs(endDate);

  while (currentDate.isBefore(finalEndDate)) {
    const scheduleInfo = getScheduleForDate(
      currentDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    );

    if (scheduleInfo) {
      scheduleRange.push({
        date: currentDate,
        ...scheduleInfo,
      });
    }

    currentDate = currentDate.add(1, "day");
  }

  return scheduleRange;
}

export { calculateShiftIndex, getScheduleForDate, calculateScheduleRange };
