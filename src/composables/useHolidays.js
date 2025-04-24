// src/composables/useHolidays.js
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import JapaneseHolidays from 'japanese-holidays';
import { useHolidayStore } from '@/stores/holiday';
import { DATE_FORMATS, CUSTOM_HOLIDAY } from '@/config/constants';

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
  const storeUserDefinedHolidays = computed(() => holidayStore.userDefinedHolidays);
  
  /**
   * Check if a date is a holiday
   * @param {dayjs|Date|string} date - Date to check
   * @returns {boolean} True if holiday
   */
  function isHoliday(date) {
    const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
    const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
    // Sunday is always treated as holiday
    return storeHolidays.value[dateStr] !== undefined || dateObj.day() === 0;
  }
  
  /**
   * Get holiday name for a date
   * @param {dayjs|Date|string} date - Date to check
   * @returns {string|undefined} Holiday name if exists
   */
  function getHolidayName(date) {
    const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
    const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
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
  function addUserDefinedHolidays(holidays, customHolidays, currentYear, yearsRange) {
    customHolidays.forEach((date) => {
      let [month, day] = date.split("-");
      for (let year = currentYear - yearsRange; year <= currentYear + yearsRange; year++) {
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
    const currentYear = dayjs().year();
    const holidays = {};
    
    // Get official holidays from JapaneseHolidays library
    for (let year = currentYear - yearsRange; year <= currentYear + yearsRange; year++) {
      const yearHolidays = JapaneseHolidays.getHolidaysOf(year);
      yearHolidays.forEach((holiday) => {
        const dateObj = dayjs(
          `${year}-${String(holiday.month).padStart(2, "0")}-${String(holiday.date).padStart(2, "0")}`
        );
        const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
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
        storeUserDefinedHolidays.value
      );
      holidayStore.setHolidays(holidays);
      return holidays;
    } catch (error) {
      console.error('Failed to load holidays:', error);
      throw error;
    }
  }
  
  return {
    // Computed state from store
    allHolidays: storeHolidays,
    holidayYearsRange: storeHolidayYearsRange,
    userDefinedHolidays: storeUserDefinedHolidays,
    isHolidaysLoaded: computed(() => Object.keys(storeHolidays.value).length > 0),
    
    // All logic functions
    isHoliday,
    getHolidayName,
    setHolidayYearsRange,
    setUserDefinedHolidays,
    addUserDefinedHolidays,
    fetchHolidays,
    loadHolidays
  };
}
