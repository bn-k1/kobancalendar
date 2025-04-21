// src/stores/holiday.js (Refactored)
import { defineStore } from 'pinia';
import { useHolidays } from '@/composables/useHolidays';

/**
 * Holiday store - now a thin wrapper around the useHolidays composable
 * This maintains backward compatibility while allowing transition to composable pattern
 */
export const useHolidayStore = defineStore('holiday', () => {
  // Use the holidays composable for implementation details
  const {
    allHolidays,
    holidayYearsRange,
    userDefinedHolidays,
    isHolidaysLoaded,
    setHolidays,
    setHolidayYearsRange,
    setUserDefinedHolidays,
    loadHolidays,
    fetchHolidays,
    isHoliday,
    getHolidayName
  } = useHolidays();

  return {
    // Expose the same interface as the original store
    // State
    allHolidays,
    holidayYearsRange,
    userDefinedHolidays,
    
    // Getters
    isHolidaysLoaded,
    
    // Actions
    setHolidays,
    setHolidayYearsRange,
    setUserDefinedHolidays,
    loadHolidays,
    fetchHolidays,
    isHoliday,
    getHolidayName
  };
});