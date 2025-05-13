// src/composables/useSchedule.js
import { computed } from "vue";
import { useScheduleStore } from "@/stores/schedule";
import { useHolidays } from "@/composables/useHolidays";
import { ERROR_MESSAGES } from "@/utils/constants";
import {
  createDate,
  formatAsISODate,
  isBefore,
  addDays,
  toUnix,
} from "@/utils/date";

/**
 * Schedule management composable
 * Contains all schedule-related logic
 */
export function useSchedule() {
  // Get stores for state management only
  const scheduleStore = useScheduleStore();

  // Dependencies
  const { isHoliday } = useHolidays();

  // Local cached references to avoid recursion
  const storeScheduleData = computed(() => scheduleStore.scheduleData);
  const storeDefaultBaseDate = computed(() => scheduleStore.defaultBaseDate);
  const storeActiveBaseDate = computed(() => scheduleStore.activeBaseDate);
  const storeNextBaseDate = computed(() => scheduleStore.nextBaseDate);

  /**
   * Calculate shift index for a given date
   * @param {dayjs} targetDate - Target date
   * @param {number} startPosition - Starting position in rotation
   * @param {dayjs} baseDate - Base date for calculation
   * @returns {number} Shift index
   */
  function calculateShiftIndex(targetDate, startPosition, baseDate) {
    const target = createDate(targetDate);
    const base = createDate(baseDate);
    const daysDifference = target.diff(base, "day");
    const adjustedStartPosition = startPosition - 1;
    const cycleLength = storeScheduleData.value.rotationCycleLength;

    const shiftIndex =
      (((adjustedStartPosition + daysDifference) % cycleLength) + cycleLength) %
      cycleLength;

    return shiftIndex;
  }

  /**
   * Get schedule for a specific date
   * @param {dayjs} targetDate - Date to get schedule for
   * @param {number} startPosition - Starting position
   * @param {dayjs} baseDateParam - Optional override for base date
   * @returns {Object} Schedule information
   */
  function getScheduleForDate(targetDate, startPosition, baseDateParam) {
    const target = createDate(targetDate);

    const baseDate = baseDateParam
      ? createDate(baseDateParam)
      : storeActiveBaseDate.value;
    const isHolidayFlag = isHoliday(target);
    const isSaturday = target.day() === 6;
    const dateStr = formatAsISODate(target);

    // Check if date is within valid range
    const baseStr = formatAsISODate(baseDate);
    const nextStr = formatAsISODate(storeNextBaseDate.value);

    if (
      (toUnix(baseDate) !== toUnix(storeNextBaseDate.value) &&
        dateStr >= nextStr) ||
      dateStr < baseStr
    ) {
      return {};
    }

    // Calculate shift index
    const shiftIndex = calculateShiftIndex(target, startPosition, baseDate);

    // Get appropriate data based on date type
    let shiftData;
    if (isHolidayFlag) {
      shiftData = storeScheduleData.value.holiday[shiftIndex];
    } else if (isSaturday) {
      shiftData = storeScheduleData.value.saturday[shiftIndex];
    } else {
      shiftData = storeScheduleData.value.weekday[shiftIndex];
    }

    if (!shiftData) return undefined;

    // Parse schedule data
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

  /**
   * Calculate schedule for a date range
   * @param {dayjs} startDate - Range start date
   * @param {dayjs} endDate - Range end date
   * @param {number} startPosition - Starting position
   * @param {dayjs} baseDateParam - Optional override for base date
   * @returns {Array} Schedule range
   */
  function calculateScheduleRange(
    startDate,
    endDate,
    startPosition,
    baseDateParam,
  ) {
    const scheduleRange = [];
    let currentDate = createDate(startDate);
    const finalEndDate = createDate(endDate);

    while (isBefore(currentDate, finalEndDate)) {
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

      currentDate = addDays(currentDate, 1);
    }

    return scheduleRange;
  }

  /**
   * Load schedule data from pre-parsed JSON
   * @param {Array} holidayData - Holiday data array
   * @param {Array} saturdayData - Saturday data array
   * @param {Array} weekdayData - Weekday data array
   * @returns {Object} Loaded schedule data
   */
  function loadScheduleData(holidayData, saturdayData, weekdayData) {
    try {
      // Validate data
      const holidayLength = holidayData.length;
      if (
        holidayLength !== saturdayData.length ||
        holidayLength !== weekdayData.length
      ) {
        throw new Error(ERROR_MESSAGES.JSON_ROWS_MISMATCH);
      }

      // Create data object
      const data = {
        holiday: holidayData,
        saturday: saturdayData,
        weekday: weekdayData,
        rotationCycleLength: holidayLength,
      };

      // Update store
      scheduleStore.setScheduleData(data);
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.SCHEDULE_DATA_ERROR, error);
      throw error;
    }
  }

  /**
   * Set default base date
   * @param {dayjs} date - Default base date
   */
  function setDefaultBaseDate(date) {
    scheduleStore.setDefaultBaseDate(date);
  }

  /**
   * Update active base date
   * @param {dayjs} date - New active base date
   */
  function updateActiveBaseDate(date) {
    scheduleStore.updateActiveBaseDate(createDate(date));
  }

  /**
   * Set next base date
   * @param {dayjs} date - Next base date
   */
  function setNextBaseDate(date) {
    scheduleStore.setNextBaseDate(createDate(date));
  }

  return {
    // Computed state from store
    scheduleData: storeScheduleData,
    defaultBaseDate: storeDefaultBaseDate,
    activeBaseDate: storeActiveBaseDate,
    nextBaseDate: storeNextBaseDate,
    isDataLoaded: computed(
      () => storeScheduleData.value.rotationCycleLength > 0,
    ),
    rotationCycleLength: computed(
      () => storeScheduleData.value.rotationCycleLength,
    ),

    // All business logic functions
    calculateShiftIndex,
    getScheduleForDate,
    calculateScheduleRange,
    loadScheduleData,
    setDefaultBaseDate,
    updateActiveBaseDate,
    setNextBaseDate,
  };
}
