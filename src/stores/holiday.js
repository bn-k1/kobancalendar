// src/stores/holiday.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Holiday store - simplified to only handle state
 * All business logic is moved to the useHolidays composable
 */
export const useHolidayStore = defineStore("holiday", () => {
  const allHolidays = ref({});
  const holidayYearsRange = ref(undefined);
  const userDefinedHolidays = ref([]);

  function setHolidays(holidays) {
    allHolidays.value = holidays;
  }

  function setHolidayYearsRange(range) {
    holidayYearsRange.value = range;
  }

  function setUserDefinedHolidays(holidays) {
    userDefinedHolidays.value = holidays;
  }

  return {
    allHolidays: computed(() => allHolidays.value),
    holidayYearsRange: computed(() => holidayYearsRange.value),
    userDefinedHolidays: computed(() => userDefinedHolidays.value),

    setHolidays,
    setHolidayYearsRange,
    setUserDefinedHolidays,
  };
});
