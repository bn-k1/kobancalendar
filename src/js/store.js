// store.js - Alpine.js によるストア実装
import Alpine from "alpinejs";
import dayjs from "dayjs";
import { isHoliday, getHolidayName } from "./holiday-service.js";
import {
  calculateShiftIndex,
  getScheduleForDate,
  calculateScheduleRange,
} from "./schedule-service.js";
import { getEventType } from "./event-service.js";
import { ERROR_MESSAGES } from "./constants.js";

// ストア初期化
export function initializeStore() {
  Alpine.store("state", {
    // データ
    scheduleData: {
      holiday: [],
      saturday: [],
      weekday: [],
      rotationCycleLength: 0,
    },
    baseDates: [],
    currentBaseDate: null,
    lastBaseDate: null,
    holidayYearsRange: 0,
    userDefinedHolidays: [],
    icsExportConfig: {},
    eventConfig: null,
    allHolidays: {},

    // メソッド
    updateCurrentBaseDate(newBaseDate) {
      this.currentBaseDate = newBaseDate;
      return this.currentBaseDate;
    },

    isConfigLoaded() {
      return this.eventConfig !== null;
    },

    setScheduleData(data) {
      this.scheduleData = data;
    },

    setHolidays(holidays) {
      this.allHolidays = holidays;
    },

    isHoliday(date) {
      return isHoliday(date, this.allHolidays);
    },

    getHolidayName(date) {
      return getHolidayName(date, this.allHolidays);
    },

    getEventType(subject) {
      return getEventType(subject, this.eventConfig);
    },

    calculateShiftIndex(targetDate, startPosition, currentBaseDate) {
      return calculateShiftIndex(
        targetDate,
        startPosition,
        currentBaseDate,
        this.scheduleData.rotationCycleLength,
      );
    },

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
  });
}
