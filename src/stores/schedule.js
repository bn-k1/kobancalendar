// src/stores/schedule.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

// Schedule store — raw state only (epoch model: see CLAUDE.md).
export const useScheduleStore = defineStore("schedule", () => {
  // [{ from: dayjs, dataKey: string, segments?: [{ from, dataKey }] }],
  // sorted ascending by `from`
  const epochs = ref([]);
  // { [dataKey]: { holiday, saturday, weekday, rotationCycleLength } }
  const scheduleData = ref({});
  // index into `epochs` of the epoch the user is currently viewing
  const activeEpochIndex = ref(0);

  const isDataLoaded = computed(() =>
    Object.values(scheduleData.value).some(
      (data) => data && data.rotationCycleLength > 0,
    ),
  );

  function setEpochs(list) {
    epochs.value = Array.isArray(list) ? list : [];
  }

  function setScheduleData(data) {
    scheduleData.value = data && typeof data === "object" ? data : {};
  }

  function setActiveEpochIndex(index) {
    activeEpochIndex.value = index;
  }

  return {
    epochs: computed(() => epochs.value),
    scheduleData: computed(() => scheduleData.value),
    activeEpochIndex: computed(() => activeEpochIndex.value),

    isDataLoaded,

    setEpochs,
    setScheduleData,
    setActiveEpochIndex,
  };
});
