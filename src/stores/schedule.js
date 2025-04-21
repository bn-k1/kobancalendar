// src/stores/schedule.js (Refactored)
import { defineStore } from 'pinia';
import { useSchedule } from '@/composables/useSchedule';

/**
 * Schedule store - now a thin wrapper around the useSchedule composable
 * This maintains backward compatibility while allowing transition to composable pattern
 */
export const useScheduleStore = defineStore('schedule', () => {
  // Use the schedule composable for implementation details
  const {
    scheduleData,
    baseDates,
    currentBaseDate,
    lastBaseDate,
    isDataLoaded,
    rotationCycleLength,
    setBaseDates,
    updateCurrentBaseDate,
    setLastBaseDate,
    setCurrentBaseDate,
    calculateShiftIndex,
    getScheduleForDate,
    calculateScheduleRange,
    loadScheduleData
  } = useSchedule();

  return {
    // Expose the same interface as the original store
    // State
    scheduleData,
    baseDates,
    currentBaseDate,
    lastBaseDate,
    
    // Getters
    isDataLoaded,
    
    // Actions
    setBaseDates,
    updateCurrentBaseDate,
    setLastBaseDate,
    setCurrentBaseDate,
    calculateShiftIndex,
    getScheduleForDate,
    calculateScheduleRange,
    loadScheduleData
  };
});