// src/composables/useHolidays.js
import { computed } from "vue";
import JapaneseHolidays from "japanese-holidays";
import { useHolidayStore } from "@/stores/holiday";
import { ERROR_MESSAGES, CUSTOM_HOLIDAY } from "@/utils/constants";
import { createDate, formatAsISODate, isSunday } from "@/utils/date";

/**
 * Holiday management composable
 * Contains all holiday-related logic
 */
export function useHolidays() {
  // Get holiday store for state management only
  const holidayStore = useHolidayStore();

  // Local cached references to avoid recursion
  const storeHolidays = computed(() => holidayStore.allHolidays);
  const storeHolidayYearsRange = computed(() => holidayStore.holidayYearsRange);
  const storeUserDefinedHolidays = computed(
    () => holidayStore.userDefinedHolidays,
  );

  /**
   * Check if a date is a holiday
   * @param {dayjs|Date|string} date - Date to check
   * @returns {boolean} True if holiday
   */
  function isHoliday(date) {
    const dateObj = createDate(date);
    const dateStr = formatAsISODate(dateObj);
    // Sunday is always treated as holiday
    return storeHolidays.value[dateStr] !== undefined || isSunday(dateObj);
  }

  /**
   * Get holiday name for a date
   * @param {dayjs|Date|string} date - Date to check
   * @returns {string|undefined} Holiday name if exists
   */
  function getHolidayName(date) {
    const dateObj = createDate(date);
    const dateStr = formatAsISODate(dateObj);
    return storeHolidays.value[dateStr];
  }

  /**
   * Set holiday years range
   * @param {number} range - Number of years before/after current year
   */
  function setHolidayYearsRange(range) {
    holidayStore.setHolidayYearsRange(range);
  }

  /**
   * Set user-defined holidays
   * @param {Array} holidays - Array of holiday date strings (MM-DD format)
   */
  function setUserDefinedHolidays(holidays) {
    holidayStore.setUserDefinedHolidays(holidays);
  }

  /**
   * Add user-defined holidays to holidays object
   * @param {Object} holidays - Holidays object to update
   * @param {Array} customHolidays - Custom holiday dates
   * @param {number} currentYear - Current year
   * @param {number} yearsRange - Years range
   */
  function addUserDefinedHolidays(
    holidays,
    customHolidays,
    currentYear,
    yearsRange,
  ) {
    customHolidays.forEach((date) => {
      let [month, day] = date.split("-");
      for (
        let year = currentYear - yearsRange;
        year <= currentYear + yearsRange;
        year++
      ) {
        let formattedDate = `${year}-${month}-${day}`;
        if (holidays[formattedDate] === undefined) {
          holidays[formattedDate] = CUSTOM_HOLIDAY;
        }
      }
    });
  }

  /**
   * Fetch holidays for a given year range
   * @param {number} yearsRange - Years before/after current year
   * @param {Array} customHolidays - Custom holiday dates
   * @returns {Object} Holidays object
   */
  function fetchHolidays(yearsRange, customHolidays) {
    const currentYear = createDate().year();
    const holidays = {};

    // Get official holidays from JapaneseHolidays library
    for (
      let year = currentYear - yearsRange;
      year <= currentYear + yearsRange;
      year++
    ) {
      const yearHolidays = JapaneseHolidays.getHolidaysOf(year);
      yearHolidays.forEach((holiday) => {
        const dateObj = createDate(
          `${year}-${String(holiday.month).padStart(2, "0")}-${String(holiday.date).padStart(2, "0")}`,
        );
        const dateStr = formatAsISODate(dateObj);
        holidays[dateStr] = holiday.name;
      });
    }

    // Add user-defined holidays
    if (customHolidays && customHolidays.length > 0) {
      addUserDefinedHolidays(holidays, customHolidays, currentYear, yearsRange);
    }

    return holidays;
  }

  /**
   * Load holidays data
   * @returns {Object} Loaded holidays
   */
  function loadHolidays() {
    try {
      const holidays = fetchHolidays(
        storeHolidayYearsRange.value,
        storeUserDefinedHolidays.value,
      );
      holidayStore.setHolidays(holidays);
      return holidays;
    } catch (error) {
      console.error(ERROR_MESSAGES.HOLIDAYS_LOAD_ERROR, error);
      throw error;
    }
  }

  return {
    // Computed state from store
    allHolidays: storeHolidays,
    holidayYearsRange: storeHolidayYearsRange,
    userDefinedHolidays: storeUserDefinedHolidays,
    isHolidaysLoaded: computed(
      () => Object.keys(storeHolidays.value).length > 0,
    ),

    // All logic functions
    isHoliday,
    getHolidayName,
    setHolidayYearsRange,
    setUserDefinedHolidays,
    addUserDefinedHolidays,
    fetchHolidays,
    loadHolidays,
  };
}
