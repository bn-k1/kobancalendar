// src/stores/calendar.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Calendar store - simplified to only handle state
 * All business logic is moved to the useCalendar composable
 */
export const useCalendarStore = defineStore("calendar", () => {
  const startPosition = ref(undefined);
  const exportMonths = ref(undefined);
  const calendarEvents = ref([]);
  const icsExportConfig = ref({});
  const eventConfig = ref(undefined);

  const isConfigLoaded = computed(() => {
    return eventConfig.value !== undefined;
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
