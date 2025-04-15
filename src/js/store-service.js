// store-service.js - ストア関連のビジネスロジックを提供するサービス
import { isHoliday, getHolidayName } from "./holiday-service.js";
import {
  calculateShiftIndex,
  getScheduleForDate,
  calculateScheduleRange,
} from "./schedule-service.js";
import { getEventType } from "./event-service.js";

// ストアのビジネスロジックを提供するサービスを作成する
export function createStoreService() {
  return {
    // 現在の基準日を更新する
    updateCurrentBaseDate(newBaseDate) {
      this.currentBaseDate = newBaseDate;
      return this.currentBaseDate;
    },

    // 設定が読み込まれているかを確認する
    isConfigLoaded() {
      return this.eventConfig !== null;
    },

    // スケジュールデータを設定する
    setScheduleData(data) {
      this.scheduleData = data;
    },

    // 祝日データを設定する
    setHolidays(holidays) {
      this.allHolidays = holidays;
    },

    // 日付が祝日かどうかを判定する
    isHoliday(date) {
      return isHoliday(date, this.allHolidays);
    },

    // 祝日名を取得する
    getHolidayName(date) {
      return getHolidayName(date, this.allHolidays);
    },

    // イベントタイプを取得する
    getEventType(subject) {
      return getEventType(subject, this.eventConfig);
    },

    // シフトインデックスを計算する
    calculateShiftIndex(targetDate, startPosition, currentBaseDate) {
      return calculateShiftIndex(
        targetDate,
        startPosition,
        currentBaseDate,
        this.scheduleData.rotationCycleLength,
      );
    },

    // 特定の日付のスケジュール情報を取得する
    getScheduleForDate(
      targetDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    ) {
      return getScheduleForDate(
        targetDate,
        startPosition,
        currentBaseDate,
        lastBaseDate,
        this.scheduleData,
        this.isHoliday.bind(this),
      );
    },

    // 日付範囲のスケジュールを計算する
    calculateScheduleRange(
      startDate,
      endDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    ) {
      return calculateScheduleRange(
        startDate,
        endDate,
        startPosition,
        currentBaseDate,
        lastBaseDate,
        this.scheduleData,
        this.isHoliday.bind(this),
      );
    },
  };
}
