// src/composables/useCalendar.js
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { useScheduleStore } from '@/stores/schedule';
import { useHolidayStore } from '@/stores/holiday';

/**
 * Calendar functionality composable
 * Handles calendar event generation and manipulation
 */
export function useCalendar() {
  // Internal refs
  const calendarEvents = ref([]);
  const startPosition = ref(1);
  const eventConfig = ref(null);
  const icsExportConfig = ref({});
  
  // Store references
  const scheduleStore = useScheduleStore();
  const holidayStore = useHolidayStore();

  /**
   * Set the starting position (shift number)
   */
  function setStartPosition(position) {
    startPosition.value = position;
  }

  /**
   * Set the event configuration
   */
  function setEventConfig(config) {
    eventConfig.value = config;
  }

  /**
   * Set the ICS export configuration
   */
  function setICSExportConfig(config) {
    icsExportConfig.value = config;
  }

  /**
   * Determine event type and styling based on subject
   */
  function getEventType(subject) {
    if (!eventConfig.value || !eventConfig.value.events) {
      return {
        type: "default",
        config: eventConfig.value?.events?.default || {},
      };
    }

    // Check against all event types in config
    for (const [type, config] of Object.entries(eventConfig.value.events)) {
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
      config: eventConfig.value.events.default,
    };
  }

  /**
   * Determine if a person can attend a meetup based on their schedule
   */
  function canAttendMeetup(schedule, meetupStartTime) {
    if (!schedule) return false;

    const { subject, endTime } = schedule;

    // Check if this is a rest day
    if (eventConfig.value && eventConfig.value.events) {
      const restDayConfig = eventConfig.value.events.restDay;
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
    const [endHour, endMinute = "00"] = endTime.split(":");
    const endTimeObj = dayjs()
      .hour(parseInt(endHour, 10))
      .minute(parseInt(endMinute, 10));

    const [meetupHour, meetupMinute = "00"] = meetupStartTime.split(":");
    const meetupTimeObj = dayjs()
      .hour(parseInt(meetupHour, 10))
      .minute(parseInt(meetupMinute, 10));

    // Can attend if shift ends before meetup starts
    return endTimeObj.isBefore(meetupTimeObj);
  }

  /**
   * Generate calendar events for the date range
   */
  function generateCalendarEvents(startDate, endDate) {
    const generatedEvents = [];

    let currentDate = dayjs(startDate);
    while (currentDate.isBefore(endDate)) {
      const scheduleInfo = scheduleStore.getScheduleForDate(
        currentDate,
        startPosition.value,
      );

      if (!scheduleInfo) {
        currentDate = currentDate.add(1, "day");
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
          holidayName: holidayStore.getHolidayName(currentDate),
        },
      });
      currentDate = currentDate.add(1, "day");
    }

    calendarEvents.value = generatedEvents;
    return generatedEvents;
  }

  return {
    calendarEvents,
    startPosition,
    eventConfig: computed(() => eventConfig.value),
    icsExportConfig: computed(() => icsExportConfig.value),
    isConfigLoaded: computed(() => eventConfig.value !== null),
    
    // Methods
    setStartPosition,
    setEventConfig,
    setICSExportConfig,
    getEventType,
    canAttendMeetup,
    generateCalendarEvents,
  };
}