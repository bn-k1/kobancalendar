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
  isSameDay,
} from "@/utils/date";

/**
 * Schedule management composable
 * Contains all schedule-related logic
 * Updated to work with consolidated JSON format
 */
export function useSchedule() {
  // Get stores for state management only
  const scheduleStore = useScheduleStore();

  // Dependencies
  const { isHoliday } = useHolidays();

  // Local cached references to avoid recursion
  const storeScheduleDataSets = computed(() => scheduleStore.scheduleDataSets);
  const storeDefaultBaseDate = computed(() => scheduleStore.defaultBaseDate);
  const storeActiveBaseDate = computed(() => scheduleStore.activeBaseDate);
  const storeNextBaseDate = computed(() => scheduleStore.nextBaseDate);

  const storeScheduleData = computed(() => {
    if (!storeActiveBaseDate.value || !storeNextBaseDate.value) {
      return storeScheduleDataSets.value.default;
    }

    return isSameDay(storeActiveBaseDate.value, storeNextBaseDate.value)
      ? storeScheduleDataSets.value.next
      : storeScheduleDataSets.value.default;
  });

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

    const currentScheduleData = isSameDay(baseDate, storeNextBaseDate.value)
      ? storeScheduleDataSets.value.next
      : storeScheduleDataSets.value.default;

    // Calculate shift index
    const shiftIndex = calculateShiftIndex(target, startPosition, baseDate);

    // Get appropriate data based on date type
    let shiftData;
    if (isHolidayFlag) {
      shiftData = currentScheduleData.holiday[shiftIndex];
    } else if (isSaturday) {
      shiftData = currentScheduleData.saturday[shiftIndex];
    } else {
      shiftData = currentScheduleData.weekday[shiftIndex];
    }

    if (!shiftData) return undefined;

    // Return schedule data directly (no more split() processing needed)
    return {
      dateStr,
      subject: shiftData.s,
      startTime: shiftData.sT || "",
      endTime: shiftData.eT || "",
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
   * Load schedule data from consolidated JSON format
   * @param {Object} defaultData - Default schedule data object
   * @param {Object} nextData - Next schedule data object
   * @returns {Object} Loaded active schedule data
   */
  function loadScheduleData(defaultData, nextData) {
    try {
      const {
        holiday: defaultHoliday,
        saturday: defaultSaturday,
        weekday: defaultWeekday,
        rotationCycleLength: defaultCycleLength,
      } = defaultData;
      const {
        holiday: nextHoliday,
        saturday: nextSaturday,
        weekday: nextWeekday,
        rotationCycleLength: nextCycleLength,
      } = nextData;

      // Create data sets with validated data
      const dataSets = {
        default: {
          holiday: defaultData.holiday,
          saturday: defaultData.saturday,
          weekday: defaultData.weekday,
          rotationCycleLength: defaultData.rotationCycleLength,
        },
        next: {
          holiday: nextData.holiday,
          saturday: nextData.saturday,
          weekday: nextData.weekday,
          rotationCycleLength: nextData.rotationCycleLength,
        },
      };

      // Update store
      scheduleStore.setScheduleDataSets(dataSets);

      // Return the current active data set based on the active base date
      return storeScheduleData.value;
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
    const newDate = createDate(date);
    scheduleStore.updateActiveBaseDate(newDate);
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
    scheduleDataSets: storeScheduleDataSets,
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
