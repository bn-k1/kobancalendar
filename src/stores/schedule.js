// src/stores/schedule.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * Schedule store - simplified to only handle state
 * All business logic is moved to the useSchedule composable
 */
export const useScheduleStore = defineStore('schedule', () => {
  const scheduleData = ref({
    holiday: [],
    saturday: [],
    weekday: [],
    rotationCycleLength: 0,
  });
  const baseDates = ref([]);
  const currentBaseDate = ref(null);
  const lastBaseDate = ref(null);

  const isDataLoaded = computed(() => {
    return scheduleData.value.rotationCycleLength > 0;
  });

  function setScheduleData(data) {
    scheduleData.value = data;
  } function setBaseDates(dates) {
    baseDates.value = dates;
  }

  function updateCurrentBaseDate(date) {
    currentBaseDate.value = date;
  }

  function setLastBaseDate(date) {
    lastBaseDate.value = date;
  }

  return {
    scheduleData: computed(() => scheduleData.value),
    baseDates: computed(() => baseDates.value),
    currentBaseDate: computed(() => currentBaseDate.value),
    lastBaseDate: computed(() => lastBaseDate.value),
    
    isDataLoaded,
    
    setScheduleData,
    setBaseDates,
    updateCurrentBaseDate,
    setLastBaseDate,
  };
});
