// src/stores/calendar.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";

/**
 * Calendar store - simplified to only handle state
 * All business logic is moved to the useCalendar composable
 */
export const useCalendarStore = defineStore("calendar", () => {
  const startPosition = ref(undefined);
  const calendarEvents = ref([]);
  const eventConfig = ref(undefined);

  const isConfigLoaded = computed(() => {
    return eventConfig.value !== undefined;
  });

  function setStartPosition(position) {
    startPosition.value = position;
  }

  function setCalendarEvents(events) {
    calendarEvents.value = events;
  }

  function setEventConfig(config) {
    eventConfig.value = config;
  }

  return {
    startPosition,
    calendarEvents,
    eventConfig,

    isConfigLoaded,

    setStartPosition,
    setCalendarEvents,
    setEventConfig,
  };
});
