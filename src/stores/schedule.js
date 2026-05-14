// src/stores/schedule.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Schedule store — raw state only.
 *
 * The schedule is modeled as an append-only list of *epochs*. Each epoch has a
 * start date (`from`) and points to a folder of shift-table data (`dataKey`).
 * An epoch's display window runs from its `from` up to (but not including) the
 * next epoch's `from`. There is no separate "default/next" duality and no
 * "schedule update" mode — every transition is just another epoch.
 */
export const useScheduleStore = defineStore("schedule", () => {
  // [{ from: dayjs, dataKey: string }], sorted ascending by `from`
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
