// src/composables/useSchedule.js
import { computed } from 'vue';
import dayjs from 'dayjs';
import Papa from 'papaparse';
import { useScheduleStore } from '@/stores/schedule';
import { useHolidayStore } from '@/stores/holiday';
import { ERROR_MESSAGES, DATE_FORMATS } from '@/config/constants';

/**
 * Schedule management composable
 * Contains all schedule-related logic
 */
export function useSchedule() {
  // Get stores for state management only
  const scheduleStore = useScheduleStore();
  const holidayStore = useHolidayStore();
  
  // Local cached references to avoid recursion
  const storeScheduleData = computed(() => scheduleStore.scheduleData);
  const storeBaseDates = computed(() => scheduleStore.baseDates);
  const storeCurrentBaseDate = computed(() => scheduleStore.currentBaseDate);
  const storeLastBaseDate = computed(() => scheduleStore.lastBaseDate);
  
  /**
   * Calculate shift index for a given date
   * @param {dayjs} targetDate - Target date
   * @param {number} startPosition - Starting position in rotation
   * @param {dayjs} baseDate - Base date for calculation
   * @returns {number} Shift index
   */
  function calculateShiftIndex(targetDate, startPosition, baseDate) {
    const daysDifference = targetDate.diff(baseDate, "day");
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
    // baseDateParam or currentBaseDate is required
    if (!baseDateParam && !storeCurrentBaseDate.value) {
      return {
        dateStr: targetDate.format(DATE_FORMATS.ISO_DATE),
        subject: "-",
        startTime: "",
        endTime: "",
        isHoliday: false,
        isSaturday: targetDate.day() === 6,
      };
    }

    const baseDate = baseDateParam || storeCurrentBaseDate.value;
    const isHolidayFlag = isHoliday(targetDate);
    const isSaturday = targetDate.day() === 6;
    const dateStr = targetDate.format(DATE_FORMATS.ISO_DATE);

    // Ensure lastBaseDate is set
    if (!storeLastBaseDate.value) {
      return {
        dateStr,
        subject: "-",
        startTime: "",
        endTime: "",
        isHoliday: isHolidayFlag,
        isSaturday,
      };
    }

    // Check if date is within valid range
    const baseStr = baseDate.format(DATE_FORMATS.ISO_DATE);
    const lastStr = storeLastBaseDate.value.format(DATE_FORMATS.ISO_DATE);

    if (
      (baseDate.unix() !== storeLastBaseDate.value.unix() && dateStr >= lastStr) ||
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

    // Calculate shift index
    const shiftIndex = calculateShiftIndex(targetDate, startPosition, baseDate);

    // Get appropriate data based on date type
    let shiftData;
    if (isHolidayFlag) {
      shiftData = storeScheduleData.value.holiday[shiftIndex];
    } else if (isSaturday) {
      shiftData = storeScheduleData.value.saturday[shiftIndex];
    } else {
      shiftData = storeScheduleData.value.weekday[shiftIndex];
    }

    if (!shiftData) return null;

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
   * Check if a date is a holiday
   * @param {dayjs} date - Date to check
   * @returns {boolean} True if holiday
   */
  function isHoliday(date) {
    const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
    const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
    const allHolidays = holidayStore.allHolidays;
    return allHolidays[dateStr] !== undefined || dateObj.day() === 0;
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
    baseDateParam
  ) {
    const scheduleRange = [];

    let currentDate = dayjs(startDate);
    const finalEndDate = dayjs(endDate);

    while (currentDate.isBefore(finalEndDate)) {
      const scheduleInfo = getScheduleForDate(
        currentDate,
        startPosition,
        baseDateParam
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

  /**
   * Process CSV data for schedules
   * @param {string|Array} csvData - CSV data
   * @returns {Array} Processed data
   */
  function processCSVData(csvData) {
    // Parse string CSV data
    if (typeof csvData === "string") {
      const result = Papa.parse(csvData, {
        skipEmptyLines: true,
        dynamicTyping: false,
        header: false,
      });

      if (result.errors && result.errors.length > 0) {
        console.error(ERROR_MESSAGES.CSV_PARSE_ERROR, result.errors);
      }

      // Convert parsed rows to comma-separated strings
      return result.data.map((row) => row.join(","));
    }

    // Handle array format (already processed by csv-loader)
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

  /**
   * Load schedule data from CSV
   * @param {string|Array} holidayData - Holiday CSV data
   * @param {string|Array} saturdayData - Saturday CSV data
   * @param {string|Array} weekdayData - Weekday CSV data
   * @returns {Object} Loaded schedule data
   */
  function loadScheduleData(holidayData, saturdayData, weekdayData) {
    try {
      // Process CSV data
      const processedHolidayData = processCSVData(holidayData);
      const processedSaturdayData = processCSVData(saturdayData);
      const processedWeekdayData = processCSVData(weekdayData);

      // Validate CSV data
      const holidayLength = processedHolidayData.length;
      if (
        holidayLength !== processedSaturdayData.length ||
        holidayLength !== processedWeekdayData.length
      ) {
        throw new Error(ERROR_MESSAGES.CSV_ROWS_MISMATCH);
      }

      // Create data object
      const data = {
        holiday: processedHolidayData,
        saturday: processedSaturdayData,
        weekday: processedWeekdayData,
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
   * Set base dates
   * @param {Array} dates - Array of base dates
   */
  function setBaseDates(dates) {
    scheduleStore.setBaseDates(dates);
  }

  /**
   * Update current base date
   * @param {dayjs} date - New base date
   */
  function updateCurrentBaseDate(date) {
    scheduleStore.updateCurrentBaseDate(date);
  }

  /**
   * Set last base date
   * @param {dayjs} date - Last base date
   */
  function setLastBaseDate(date) {
    scheduleStore.setLastBaseDate(date);
  }

  /**
   * Set the current base date based on parameters and configuration
   * @param {dayjs} baseDate - Date from params
   * @param {Array} availableBaseDates - Available base dates
   * @returns {dayjs} Valid base date
   */
  function setCurrentBaseDate(baseDate, availableBaseDates) {
    try {
      const validBaseDate =
        availableBaseDates.find(
          (date) =>
            date.format(DATE_FORMATS.ISO_DATE) ===
            baseDate?.format(DATE_FORMATS.ISO_DATE)
        ) || availableBaseDates[0];

      updateCurrentBaseDate(validBaseDate);
      return validBaseDate;
    } catch (error) {
      console.error(ERROR_MESSAGES.BASEDATE_CONFIGURATION_ERROR, error);
      return availableBaseDates[0];
    }
  }

  return {
    // Computed state from store
    scheduleData: storeScheduleData,
    baseDates: storeBaseDates,
    currentBaseDate: storeCurrentBaseDate,
    lastBaseDate: storeLastBaseDate,
    isDataLoaded: computed(() => storeScheduleData.value.rotationCycleLength > 0),
    rotationCycleLength: computed(() => storeScheduleData.value.rotationCycleLength),

    // All business logic functions
    calculateShiftIndex,
    getScheduleForDate,
    calculateScheduleRange,
    processCSVData,
    loadScheduleData,
    setBaseDates,
    updateCurrentBaseDate,
    setLastBaseDate,
    setCurrentBaseDate
  };
}
