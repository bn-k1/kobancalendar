// src/stores/schedule.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Schedule store - simplified to only handle state
 * All business logic is moved to the useSchedule composable
 */
export const useScheduleStore = defineStore("schedule", () => {
  const scheduleData = ref({
    holiday: [],
    saturday: [],
    weekday: [],
    rotationCycleLength: 0,
  });
  const defaultBaseDate = ref(undefined);
  const activeBaseDate = ref(undefined);
  const nextBaseDate = ref(undefined);

  const isDataLoaded = computed(() => {
    return scheduleData.value.rotationCycleLength > 0;
  });

  function setScheduleData(data) {
    scheduleData.value = data;
  }
  function setDefaultBaseDate(date) {
    defaultBaseDate.value = date;
  }

  function updateActiveBaseDate(date) {
    activeBaseDate.value = date;
  }

  function setNextBaseDate(date) {
    nextBaseDate.value = date;
  }

  return {
    scheduleData: computed(() => scheduleData.value),
    defaultBaseDate: computed(() => defaultBaseDate.value),
    activeBaseDate: computed(() => activeBaseDate.value),
    nextBaseDate: computed(() => nextBaseDate.value),

    isDataLoaded,

    setScheduleData,
    setDefaultBaseDate,
    updateActiveBaseDate,
    setNextBaseDate,
  };
});
