// src/stores/holiday.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * Holiday store - simplified to only handle state
 * All business logic is moved to the useHolidays composable
 */
export const useHolidayStore = defineStore('holiday', () => {
  // 状態
  const allHolidays = ref({});
  const holidayYearsRange = ref(5);
  const userDefinedHolidays = ref([]);

  // アクション - シンプルな状態更新のみ
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
    // 状態
    allHolidays: computed(() => allHolidays.value),
    holidayYearsRange: computed(() => holidayYearsRange.value),
    userDefinedHolidays: computed(() => userDefinedHolidays.value),
    
    // アクション
    setHolidays,
    setHolidayYearsRange,
    setUserDefinedHolidays,
  };
});
