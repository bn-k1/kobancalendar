// schedule-service.js - スケジュール関連の機能を提供するモジュール
import dayjs from "dayjs";
import { handleError } from "./error-handler.js";
import { ERROR_MESSAGES, DATE_FORMATS } from "./constants.js";

// CSV形式のデータを処理する
function processCSVData(csvData) {
  return csvData.map((row) => row.join(","));
}

export async function loadScheduleData(holidayData, saturdayData, weekdayData) {
  try {
    // インポートしたCSVデータを処理
    const processedHolidayData = processCSVData(holidayData);
    const processedSaturdayData = processCSVData(saturdayData);
    const processedWeekdayData = processCSVData(weekdayData);

    const holidayLength = processedHolidayData.length;
    if (
      holidayLength !== processedSaturdayData.length ||
      holidayLength !== processedWeekdayData.length
    ) {
      throw new Error(ERROR_MESSAGES.CSV_ROWS_MISMATCH);
    }

    const rotationCycleLength = holidayLength;

    return {
      holiday: processedHolidayData,
      saturday: processedSaturdayData,
      weekday: processedWeekdayData,
      rotationCycleLength,
    };
  } catch (error) {
    return handleError(error, ERROR_MESSAGES.SCHEDULE_DATA_ERROR);
  }
}

// 特定の日付のシフトインデックスを計算
export function calculateShiftIndex(
  targetDate,
  startPosition,
  currentBaseDate,
  rotationCycleLength,
) {
  const daysDifference = targetDate.diff(currentBaseDate, "day");
  const adjustedStartPosition = startPosition - 1;

  const shiftIndex =
    (((adjustedStartPosition + daysDifference) % rotationCycleLength) +
      rotationCycleLength) %
    rotationCycleLength;

  return shiftIndex;
}

// 特定の日付のスケジュール情報を取得
export function getScheduleForDate(
  targetDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
  scheduleData,
  isHolidayFn,
) {
  const dateStr = targetDate.format(DATE_FORMATS.ISO_DATE);
  const isHolidayFlag = isHolidayFn(targetDate);
  const isSaturday = targetDate.day() === 6; // day()は0が日曜、6が土曜
  const formattedCurrentBaseDate = currentBaseDate.format(
    DATE_FORMATS.ISO_DATE,
  );
  const formattedLastBaseDate = lastBaseDate.format(DATE_FORMATS.ISO_DATE);

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
  const shiftIndex = calculateShiftIndex(
    targetDate,
    startPosition,
    currentBaseDate,
    scheduleData.rotationCycleLength,
  );

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
    shiftIndex, // シフトインデックスを結果に含める
  };
}

// 日付範囲のスケジュールを計算
export function calculateScheduleRange(
  startDate,
  endDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
  scheduleData,
  isHolidayFn,
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
      scheduleData,
      isHolidayFn,
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
