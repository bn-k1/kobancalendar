// src/stores/schedule.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Schedule store - modified to handle multiple data sets
 * All business logic is moved to the useSchedule composable
 */
export const useScheduleStore = defineStore("schedule", () => {
  const scheduleDataSets = ref({
    default: {
      holiday: [],
      saturday: [],
      weekday: [],
      rotationCycleLength: 0,
    },
    next: {
      holiday: [],
      saturday: [],
      weekday: [],
      rotationCycleLength: 0,
    },
  });

  const defaultBaseDate = ref(undefined);
  const activeBaseDate = ref(undefined);
  const nextBaseDate = ref(undefined);

  const isDataLoaded = computed(() => {
    return (
      scheduleDataSets.value.default.rotationCycleLength > 0 ||
      scheduleDataSets.value.next.rotationCycleLength > 0
    );
  });

  // 後方互換性のために維持（useScheduleの中で使用する）
  function setScheduleData(data) {
    // 現在は使用しないが、後方互換性のために維持
    console.log(
      "setScheduleData is deprecated, use setScheduleDataSets instead",
    );
  }

  function setScheduleDataSets(dataSets) {
    scheduleDataSets.value = dataSets;
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
    scheduleDataSets: computed(() => scheduleDataSets.value),
    defaultBaseDate: computed(() => defaultBaseDate.value),
    activeBaseDate: computed(() => activeBaseDate.value),
    nextBaseDate: computed(() => nextBaseDate.value),

    isDataLoaded,

    setScheduleData,
    setScheduleDataSets,
    setDefaultBaseDate,
    updateActiveBaseDate,
    setNextBaseDate,
  };
});
