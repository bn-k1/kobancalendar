// src/stores/calendar.js
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { CALENDAR_CONFIG, APP_CONFIG } from '@/utils/constants';

/**
 * Calendar store - simplified to only handle state
 * All business logic is moved to the useCalendar composable
 */
export const useCalendarStore = defineStore('calendar', () => {
  const calendarConfig = ref({
    ...CALENDAR_CONFIG,
  });
  const startPosition = ref(APP_CONFIG.DEFAULT_START_POSITION);
  const exportMonths = ref(APP_CONFIG.DEFAULT_EXPORT_MONTHS);
  const calendarEvents = ref([]);
  const icsExportConfig = ref({});
  const eventConfig = ref(null);

  const isConfigLoaded = computed(() => {
    return eventConfig.value !== null;
  });

  function setStartPosition(position) {
    startPosition.value = position;
  }

  function setExportMonths(months) {
    exportMonths.value = months;
  }

  function setCalendarEvents(events) {
    calendarEvents.value = events;
  }

  function setICSExportConfig(config) {
    icsExportConfig.value = config;
  }

  function setEventConfig(config) {
    eventConfig.value = config;
  }

  return {
    calendarConfig,
    startPosition,
    exportMonths,
    calendarEvents,
    icsExportConfig,
    eventConfig,

    isConfigLoaded,

    setStartPosition,
    setExportMonths,
    setCalendarEvents,
    setICSExportConfig,
    setEventConfig,
  };
});
