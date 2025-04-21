// src/stores/calendar.js (Refactored)
import { defineStore } from 'pinia';
import { useCalendar } from '@/composables/useCalendar';

/**
 * Calendar store - now a thin wrapper around the useCalendar composable
 * This maintains backward compatibility while allowing transition to composable pattern
 */
export const useCalendarStore = defineStore('calendar', () => {
  // Use the calendar composable for implementation details
  const { 
    calendarEvents,
    startPosition,
    eventConfig,
    icsExportConfig,
    isConfigLoaded,
    setStartPosition,
    setCalendarEvents,
    setICSExportConfig,
    setEventConfig,
    getEventType,
    canAttendMeetup,
    generateCalendarEvents
  } = useCalendar();

  return {
    // Expose the same interface as the original store
    // State
    calendarEvents,
    startPosition,
    eventConfig,
    icsExportConfig,
    
    // Getters
    isConfigLoaded,
    
    // Actions
    setStartPosition,
    setCalendarEvents,
    setICSExportConfig,
    setEventConfig,
    getEventType,
    canAttendMeetup,
    generateCalendarEvents
  };
});