// src/composables/useSchedule.js
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import Papa from 'papaparse';
import { useHolidayStore } from '@/stores/holiday';
import { ERROR_MESSAGES, DATE_FORMATS } from '@/config/constants';

/**
 * Schedule management composable
 * Handles schedule data loading, calculation, and querying
 */
export function useSchedule() {
  // State
  const scheduleData = ref({
    holiday: [],
    saturday: [],
    weekday: [],
    rotationCycleLength: 0,
  });
  
  const baseDates = ref([]);
  const currentBaseDate = ref(null);
  const lastBaseDate = ref(null);
  
  // Store dependencies
  const holidayStore = useHolidayStore();

  /**
   * Calculate shift index for a given date
   */
  function calculateShiftIndex(targetDate, startPosition, baseDate) {
    const daysDifference = targetDate.diff(baseDate, "day");
    const adjustedStartPosition = startPosition - 1;
    const cycleLength = scheduleData.value.rotationCycleLength;

    const shiftIndex =
      (((adjustedStartPosition + daysDifference) % cycleLength) + cycleLength) %
      cycleLength;

    return shiftIndex;
  }

  /**
   * Get schedule for a specific date
   */
  function getScheduleForDate(targetDate, startPosition, baseDateParam) {
    // baseDateParam or currentBaseDate.value is required
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

    // Ensure lastBaseDate.value is set
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

    // Check if date is within valid range
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

    // Calculate shift index
    const shiftIndex = calculateShiftIndex(targetDate, startPosition, baseDate);

    // Get appropriate data based on date type
    let shiftData;
    if (isHolidayFlag) {
      shiftData = scheduleData.value.holiday[shiftIndex];
    } else if (isSaturday) {
      shiftData = scheduleData.value.saturday[shiftIndex];
    } else {
      shiftData = scheduleData.value.weekday[shiftIndex];
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
   * Calculate schedule for a date range
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

      // Update schedule data
      const data = {
        holiday: processedHolidayData,
        saturday: processedSaturdayData,
        weekday: processedWeekdayData,
        rotationCycleLength: holidayLength,
      };

      scheduleData.value = data;
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.SCHEDULE_DATA_ERROR, error);
      throw error;
    }
  }

  /**
   * Set base dates
   */
  function setBaseDates(dates) {
    baseDates.value = dates;
  }

  /**
   * Update current base date
   */
  function updateCurrentBaseDate(date) {
    currentBaseDate.value = date;
  }

  /**
   * Set last base date
   */
  function setLastBaseDate(date) {
    lastBaseDate.value = date;
  }

  /**
   * Set the current base date based on parameters and configuration
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
    // State
    scheduleData: computed(() => scheduleData.value),
    baseDates: computed(() => baseDates.value),
    currentBaseDate: computed(() => currentBaseDate.value),
    lastBaseDate: computed(() => lastBaseDate.value),
    isDataLoaded: computed(() => scheduleData.value.rotationCycleLength > 0),
    rotationCycleLength: computed(() => scheduleData.value.rotationCycleLength),

    // Methods
    setBaseDates,
    updateCurrentBaseDate,
    setLastBaseDate,
    setCurrentBaseDate,
    calculateShiftIndex,
    getScheduleForDate,
    calculateScheduleRange,
    loadScheduleData,
    processCSVData,
  };
}