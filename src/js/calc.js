// calc.js - スケジュール計算・データ処理に関連する機能を提供

import dayjs from "dayjs";
import { memoize } from "lodash";
import { isHoliday } from "./data-loader.js";

let scheduleData = {
  holiday: [],
  saturday: [],
  weekday: [],
  rotationCycleLength: 0,
};

// スケジュールデータの設定
function setScheduleData(shiftData) {
  scheduleData = shiftData;
  // データが変更されたのでメモ化関数のキャッシュをクリア
  getScheduleForDate.cache.clear();
}

// 任意の日付とコマ位置から勤務内容を返す - 元の実装
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

  // 日付差分から勤務位置を計算
  const daysDifference = targetDate.diff(currentBaseDate, "day");
  const adjustedStartPosition = startPosition - 1; //これしかない
  const shiftIndex =
    (((adjustedStartPosition + daysDifference) %
      scheduleData.rotationCycleLength) +
      scheduleData.rotationCycleLength) %
    scheduleData.rotationCycleLength;

  // 曜日タイプに基づくデータ選択
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
  };
}

// memoizeを使用してパフォーマンスを向上
// カスタムリゾルバを使用して複数のパラメータから一意のキーを生成
const getScheduleForDate = memoize(
  _getScheduleForDate,
  (targetDate, startPosition, currentBaseDate, lastBaseDate) => {
    return `${targetDate.format("YYYY-MM-DD")}_${startPosition}_${currentBaseDate.format(
      "YYYY-MM-DD",
    )}_${lastBaseDate.format("YYYY-MM-DD")}`;
  },
);

// 日付範囲のスケジュールデータを計算して返す
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

// エクスポート
export { setScheduleData, getScheduleForDate, calculateScheduleRange };
