// src/composables/useHolidays.js
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import JapaneseHolidays from 'japanese-holidays';
import { ERROR_MESSAGES, DATE_FORMATS, CUSTOM_HOLIDAY } from '@/config/constants';

/**
 * Holiday management composable
 * Handles loading, storing and checking holidays
 */
export function useHolidays() {
  // State
  const allHolidays = ref({});
  const holidayYearsRange = ref(5);
  const userDefinedHolidays = ref([]);
  
  /**
   * Set holidays data
   */
  function setHolidays(holidays) {
    allHolidays.value = holidays;
  }
  
  /**
   * Set the range of years to include for holidays
   */
  function setHolidayYearsRange(range) {
    holidayYearsRange.value = range;
  }
  
  /**
   * Set user-defined holidays
   */
  function setUserDefinedHolidays(holidays) {
    userDefinedHolidays.value = holidays;
  }
  
  /**
   * Load holidays for the configured year range
   */
  function loadHolidays() {
    try {
      const holidays = fetchHolidays(
        holidayYearsRange.value,
        userDefinedHolidays.value
      );
      setHolidays(holidays);
      return holidays;
    } catch (error) {
      console.error(ERROR_MESSAGES.HOLIDAYS_LOAD_ERROR, error);
      throw error;
    }
  }
  
  /**
   * Fetch holidays for a given year range
   */
  function fetchHolidays(yearsRange, customHolidays) {
    const currentYear = dayjs().year();
    const holidays = {};
    
    // Get official holidays from Japanese Holidays library
    for (
      let year = currentYear - yearsRange;
      year <= currentYear + yearsRange;
      year++
    ) {
      const yearHolidays = JapaneseHolidays.getHolidaysOf(year);
      yearHolidays.forEach((holiday) => {
        const dateObj = dayjs(
          `${year}-${String(holiday.month).padStart(2, "0")}-${String(
            holiday.date
          ).padStart(2, "0")}`
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
   * Add user-defined holidays to the holidays object
   */
  function addUserDefinedHolidays(
    holidays,
    customHolidays,
    currentYear,
    yearsRange
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
   * Check if a date is a holiday
   */
  function isHoliday(date) {
    const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
    const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
    return allHolidays.value[dateStr] !== undefined || dateObj.day() === 0;
  }
  
  /**
   * Get holiday name for a date
   */
  function getHolidayName(date) {
    const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
    const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
    return allHolidays.value[dateStr];
  }
  
  return {
    // State
    allHolidays: computed(() => allHolidays.value),
    holidayYearsRange: computed(() => holidayYearsRange.value),
    userDefinedHolidays: computed(() => userDefinedHolidays.value),
    isHolidaysLoaded: computed(() => Object.keys(allHolidays.value).length > 0),
    
    // Methods
    setHolidays,
    setHolidayYearsRange,
    setUserDefinedHolidays,
    loadHolidays,
    fetchHolidays,
    isHoliday,
    getHolidayName
  };
}