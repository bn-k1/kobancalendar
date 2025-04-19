import { defineStore } from "pinia";
import { ref, computed } from "vue";
import dayjs from "dayjs";
import Papa from "papaparse";
import { ERROR_MESSAGES, DATE_FORMATS } from "@/config/constants";
import { useHolidayStore } from "./holiday";

export const useScheduleStore = defineStore("schedule", () => {
  // 状態
  const scheduleData = ref({
    holiday: [],
    saturday: [],
    weekday: [],
    rotationCycleLength: 0,
  });

  const baseDates = ref([]);
  const currentBaseDate = ref(null);
  const lastBaseDate = ref(null);

  // ゲッター
  const isDataLoaded = computed(() => {
    return scheduleData.value.rotationCycleLength > 0;
  });

  // アクション
  function setScheduleData(data) {
    scheduleData.value = data;
  }

  function setBaseDates(dates) {
    baseDates.value = dates;
  }

  function updateCurrentBaseDate(date) {
    currentBaseDate.value = date;
  }

  function setLastBaseDate(date) {
    lastBaseDate.value = date;
  }

  // シフトインデックスを計算（メモ化なし）
  function calculateShiftIndex(targetDate, startPosition, baseDate) {
    const daysDifference = targetDate.diff(baseDate, "day");
    const adjustedStartPosition = startPosition - 1;
    const cycleLength = scheduleData.value.rotationCycleLength;

    const shiftIndex =
      (((adjustedStartPosition + daysDifference) % cycleLength) + cycleLength) %
      cycleLength;

    return shiftIndex;
  }

  // 特定の日付のスケジュール情報を取得（メモ化なし）
  function getScheduleForDate(targetDate, startPosition, baseDateParam) {
    const holidayStore = useHolidayStore();

    // baseDateParamまたはcurrentBaseDate.valueがnullの場合の対応
    if (!baseDateParam && !currentBaseDate.value) {
      return {
        dateStr: targetDate.format(DATE_FORMATS.ISO_DATE),
        subject: "-",
        startTime: "",
        endTime: "",
        isHoliday: false,
        isSaturday: targetDate.day() === 6,
      };
    }

    const baseDate = baseDateParam || currentBaseDate.value;
    const isHolidayFlag = holidayStore.isHoliday(targetDate);
    const isSaturday = targetDate.day() === 6;
    const dateStr = targetDate.format(DATE_FORMATS.ISO_DATE);

    // lastBaseDate.valueがnullの場合の対応
    if (!lastBaseDate.value) {
      return {
        dateStr,
        subject: "-",
        startTime: "",
        endTime: "",
        isHoliday: isHolidayFlag,
        isSaturday,
      };
    }

    // 日付が基準範囲外の場合
    const baseStr = baseDate.format(DATE_FORMATS.ISO_DATE);
    const lastStr = lastBaseDate.value.format(DATE_FORMATS.ISO_DATE);

    if (
      (baseDate.unix() !== lastBaseDate.value.unix() && dateStr >= lastStr) ||
      dateStr < baseStr
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
    const shiftIndex = calculateShiftIndex(targetDate, startPosition, baseDate);

    // 曜日タイプに基づくデータ選択
    let shiftData;
    if (isHolidayFlag) {
      shiftData = scheduleData.value.holiday[shiftIndex];
    } else if (isSaturday) {
      shiftData = scheduleData.value.saturday[shiftIndex];
    } else {
      shiftData = scheduleData.value.weekday[shiftIndex];
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
      shiftIndex,
    };
  }

  // 日付範囲のスケジュールを計算
  function calculateScheduleRange(
    startDate,
    endDate,
    startPosition,
    baseDateParam,
  ) {
    const scheduleRange = [];

    let currentDate = dayjs(startDate);
    const finalEndDate = dayjs(endDate);

    while (currentDate.isBefore(finalEndDate)) {
      const scheduleInfo = getScheduleForDate(
        currentDate,
        startPosition,
        baseDateParam,
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

  // CSV形式のデータを処理する
  function processCSVData(csvData) {
    // 文字列形式のCSVデータをパース
    if (typeof csvData === "string") {
      const result = Papa.parse(csvData, {
        skipEmptyLines: true,
        dynamicTyping: false, // 文字列のままにする
        header: false,
      });

      if (result.errors && result.errors.length > 0) {
        console.error(ERROR_MESSAGES.CSV_PARSE_ERROR, result.errors);
      }

      // 各行をカンマ区切りの文字列に変換して返す（元のフォーマットと互換性を持たせる）
      return result.data.map((row) => row.join(","));
    }

    // すでに配列形式の場合（csv-loaderによって処理済み）
    if (Array.isArray(csvData)) {
      return csvData.map((row) => {
        if (Array.isArray(row)) {
          return row.join(",");
        }
        return row;
      });
    }

    console.error(ERROR_MESSAGES.UNKNOWN_CSV_FORMAT, csvData);
    return [];
  }

  // スケジュールデータを読み込む
  function loadScheduleData(holidayData, saturdayData, weekdayData) {
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

      const data = {
        holiday: processedHolidayData,
        saturday: processedSaturdayData,
        weekday: processedWeekdayData,
        rotationCycleLength: holidayLength,
      };

      setScheduleData(data);
      return data;
    } catch (error) {
      console.error(SCHEDULE_DATA_ERROR, error);
      throw error;
    }
  }

  return {
    // 状態
    scheduleData,
    baseDates,
    currentBaseDate,
    lastBaseDate,

    // ゲッター
    isDataLoaded,

    // アクション
    setScheduleData,
    setBaseDates,
    updateCurrentBaseDate,
    setLastBaseDate,

    // 関数
    calculateShiftIndex,
    getScheduleForDate,
    calculateScheduleRange,
    loadScheduleData,
  };
});
