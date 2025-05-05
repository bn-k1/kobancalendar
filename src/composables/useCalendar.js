// src/composables/useCalendar.js
import { computed } from "vue";
import { useCalendarStore } from "@/stores/calendar";
import { useSchedule } from "@/composables/useSchedule";
import { useHolidays } from "@/composables/useHolidays";
import { createDate, addDays, isBefore, parseTime } from "@/utils/date";

/**
 * Calendar functionality composable
 * Contains all calendar-related logic
 */
export function useCalendar() {
  // Get store for state management only
  const calendarStore = useCalendarStore();

  // Use other composables for business logic
  const { getScheduleForDate } = useSchedule();
  const { getHolidayName } = useHolidays();

  // Local cached references to avoid recursion
  const storeCalendarEvents = computed(() => calendarStore.calendarEvents);
  const storeStartPosition = computed(() => calendarStore.startPosition);
  const storeEventConfig = computed(() => calendarStore.eventConfig);
  const storeIcsExportConfig = computed(() => calendarStore.icsExportConfig);

  /**
   * Set the starting position (shift number)
   * @param {number} position - Position in rotation
   */
  function setStartPosition(position) {
    calendarStore.setStartPosition(position);
  }

  /**
   * Set the export months
   * @param {number} months - Number of months to export
   */
  function setExportMonths(months) {
    calendarStore.setExportMonths(months);
  }

  /**
   * Set calendar events
   * @param {Array} events - Calendar events
   */
  function setCalendarEvents(events) {
    calendarStore.setCalendarEvents(events);
  }

  /**
   * Set the ICS export configuration
   * @param {Object} config - Export configuration
   */
  function setICSExportConfig(config) {
    calendarStore.setICSExportConfig(config);
  }

  /**
   * Set the event configuration
   * @param {Object} config - Event configuration
   */
  function setEventConfig(config) {
    calendarStore.setEventConfig(config);
  }

  /**
   * Determine event type and styling based on subject
   * @param {string} subject - Event subject
   * @returns {Object} Event type and configuration
   */
  function getEventType(subject) {
    const eventConfig = storeEventConfig.value;

    if (!eventConfig || !eventConfig.events) {
      return {
        type: "default",
        config: eventConfig?.events?.default || {},
      };
    }

    // Check against all event types in config
    for (const [type, config] of Object.entries(eventConfig.events)) {
      if (
        type !== "default" &&
        config.keywords &&
        config.keywords.some((keyword) => subject?.includes(keyword))
      ) {
        return { type, config };
      }
    }

    // Default event type
    return {
      type: "default",
      config: eventConfig.events.default,
    };
  }

  /**
   * Determine if a person can attend a meetup based on their schedule
   * @param {Object} schedule - Schedule information
   * @param {string} meetupStartTime - Meetup start time (HH:MM)
   * @returns {boolean} True if can attend
   */
  function canAttendMeetup(schedule, meetupStartTime) {
    if (!schedule) return false;

    const { subject, endTime } = schedule;
    const eventConfig = storeEventConfig.value;

    // Check if this is a rest day
    if (eventConfig && eventConfig.events) {
      const restDayConfig = eventConfig.events.restDay;
      if (restDayConfig && restDayConfig.keywords) {
        if (restDayConfig.keywords.some((keyword) => subject === keyword)) {
          return true;
        }
      }
    }

    // Can't attend if no end time is set
    if (!endTime) {
      return false;
    }

    // Parse times
    const endTimeObj = parseTime(endTime);
    const meetupTimeObj = parseTime(meetupStartTime);

    // Can attend if shift ends before meetup starts
    return endTimeObj.isBefore(meetupTimeObj);
  }

  /**
   * Generate calendar events for the date range
   * @param {dayjs} startDate - Range start date
   * @param {dayjs} endDate - Range end date
   * @returns {Array} Generated events
   */
  function generateCalendarEvents(startDate, endDate) {
    const generatedEvents = [];
    const startPosition = storeStartPosition.value;

    let currentDate = createDate(startDate);
    const end = createDate(endDate);

    while (isBefore(currentDate, end)) {
      const scheduleInfo = getScheduleForDate(currentDate, startPosition);

      if (!scheduleInfo) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      const {
        dateStr,
        subject,
        startTime,
        endTime,
        isHoliday,
        isSaturday,
        shiftIndex,
      } = scheduleInfo;

      const { config } = getEventType(subject);
      generatedEvents.push({
        title: config.showTime
          ? `${subject}\n${startTime} - \n${endTime}`
          : subject,
        start: dateStr,
        color: config.color,
        extendedProps: {
          startTime,
          endTime,
          isShift: true,
          isHoliday,
          isSaturday,
          shiftIndex,
          holidayName: getHolidayName(currentDate),
        },
      });

      currentDate = addDays(currentDate, 1);
    }

    // Update events in store
    setCalendarEvents(generatedEvents);
    return generatedEvents;
  }

  return {
    // Computed state from store
    calendarEvents: storeCalendarEvents,
    startPosition: storeStartPosition,
    eventConfig: storeEventConfig,
    icsExportConfig: storeIcsExportConfig,
    isConfigLoaded: computed(() => storeEventConfig.value !== undefined),

    // Store action wrappers
    setStartPosition,
    setExportMonths,
    setCalendarEvents,
    setICSExportConfig,
    setEventConfig,

    // Business logic functions
    getEventType,
    canAttendMeetup,
    generateCalendarEvents,
  };
}
