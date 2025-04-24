// src/stores/schedule.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

/**
 * Schedule store - simplified to only handle state
 * All business logic is moved to the useSchedule composable
 */
export const useScheduleStore = defineStore('schedule', () => {
  // 状態
  const scheduleData = ref({
    holiday: [],
    saturday: [],
    weekday: [],
    rotationCycleLength: 0,
  });
  const baseDates = ref([]);
  const currentBaseDate = ref(null);
  const lastBaseDate = ref(null);

  // ゲッター
  const isDataLoaded = computed(() => {
    return scheduleData.value.rotationCycleLength > 0;
  });

  // アクション - シンプルな状態更新のみ
  function setScheduleData(data) {
    scheduleData.value = data;
  }

  function setBaseDates(dates) {
    baseDates.value = dates;
  }

  function updateCurrentBaseDate(date) {
    currentBaseDate.value = date;
  }

  function setLastBaseDate(date) {
    lastBaseDate.value = date;
  }

  return {
    // 状態
    scheduleData: computed(() => scheduleData.value),
    baseDates: computed(() => baseDates.value),
    currentBaseDate: computed(() => currentBaseDate.value),
    lastBaseDate: computed(() => lastBaseDate.value),
    
    // ゲッター
    isDataLoaded,
    
    // アクション
    setScheduleData,
    setBaseDates,
    updateCurrentBaseDate,
    setLastBaseDate,
  };
});
