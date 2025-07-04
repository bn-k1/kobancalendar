// src/stores/schedule.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

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
  
  const scheduleUpdateDate = ref(undefined);

  const isDataLoaded = computed(() => {
    return (
      scheduleDataSets.value.default.rotationCycleLength > 0 ||
      scheduleDataSets.value.next.rotationCycleLength > 0
    );
  });

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

  function setScheduleUpdateDate(date) {
    scheduleUpdateDate.value = date;
  }

  return {
    scheduleDataSets: computed(() => scheduleDataSets.value),
    defaultBaseDate: computed(() => defaultBaseDate.value),
    activeBaseDate: computed(() => activeBaseDate.value),
    nextBaseDate: computed(() => nextBaseDate.value),
    scheduleUpdateDate: computed(() => scheduleUpdateDate.value),

    isDataLoaded,

    setScheduleDataSets,
    setDefaultBaseDate,
    updateActiveBaseDate,
    setNextBaseDate,
    setScheduleUpdateDate,
  };
});
