// src/composables/useCalendar.js
import { computed } from "vue";
import { useCalendarStore } from "@/stores/calendar";
import { useSchedule } from "@/composables/useSchedule";
import { useHolidays } from "@/composables/useHolidays";
import { useEditedSchedules } from "@/composables/useEditedSchedules";
import { createDate, addDays, isBefore, parseTime, formatAsISODate } from "@/utils/date";

// Pink/magenta color for edited schedules - distinct from existing colors
const EDITED_COLOR = "#e91e63";

/**
 * Calendar functionality composable
 * Contains all calendar-related logic
 */
export function useCalendar() {
  const calendarStore = useCalendarStore();

  const { getScheduleForDate } = useSchedule();
  const { getHolidayName } = useHolidays();
  const { getEditedSchedule, isEditsHidden } = useEditedSchedules();

  const storeCalendarEvents = computed(() => calendarStore.calendarEvents);
  const storeStartPosition = computed(() => calendarStore.startPosition);
  const storeEventConfig = computed(() => calendarStore.eventConfig);

  function setStartPosition(position) {
    calendarStore.setStartPosition(position);
  }

  function setExportMonths(months) {
    calendarStore.setExportMonths(months);
  }

  function setCalendarEvents(events) {
    calendarStore.setCalendarEvents(events);
  }

  function setEventConfig(config) {
    calendarStore.setEventConfig(config);
  }

  /**
   * Determine event type and styling based on subject
   * @param {string} subject - Event subject
   * @param {boolean} isEdited - Whether this is an edited schedule
   * @returns {Object} Event type and configuration
   */
  function getEventType(subject, isEdited = false) {
    if (isEdited) {
      return {
        type: "edited",
        config: {
          color: EDITED_COLOR,
          showTime: true,
        },
      };
    }

    const eventConfig = storeEventConfig.value;

    if (!eventConfig || !eventConfig.events) {
      return {
        type: "default",
        config: eventConfig?.events?.default || {},
      };
    }

    for (const [type, config] of Object.entries(eventConfig.events)) {
      if (
        type !== "default" &&
        config.keywords &&
        config.keywords.some((keyword) => subject?.includes(keyword))
      ) {
        return { type, config };
      }
    }

    return {
      type: "default",
      config: eventConfig.events.default,
    };
  }

  /**
   * Determine if a person can attend a meetup based on their schedule
   */
  function canAttendMeetup(schedule, meetupStartTime) {
    if (!schedule) return false;

    const { subject, endTime } = schedule;
    const eventConfig = storeEventConfig.value;

    if (eventConfig && eventConfig.events) {
      const restDayConfig = eventConfig.events.restDay;
      if (restDayConfig && restDayConfig.keywords) {
        if (restDayConfig.keywords.some((keyword) => subject === keyword)) {
          return true;
        }
      }
    }

    if (!endTime) {
      return false;
    }

    const endTimeObj = parseTime(endTime);
    const meetupTimeObj = parseTime(meetupStartTime);

    return endTimeObj.isBefore(meetupTimeObj);
  }

  /**
   * Generate calendar events for the date range
   */
  function generateCalendarEvents(startDate, endDate) {
    const generatedEvents = [];
    const startPosition = storeStartPosition.value;

    let currentDate = createDate(startDate);
    const end = createDate(endDate);

    while (isBefore(currentDate, end)) {
      const dateStr = formatAsISODate(currentDate);
      
      // Check for edited schedule first (highest priority), unless hidden
      const editedSchedule = isEditsHidden.value ? null : getEditedSchedule(dateStr);
      
      if (editedSchedule) {
        const scheduleInfo = getScheduleForDate(currentDate, startPosition);
        const shiftIndex = scheduleInfo?.shiftIndex ?? 0;
        
        const { config } = getEventType(editedSchedule.subject, true);
        const title = config.showTime && (editedSchedule.startTime || editedSchedule.endTime)
          ? `${editedSchedule.subject}\n${editedSchedule.startTime} - \n${editedSchedule.endTime}`
          : editedSchedule.subject;

        generatedEvents.push({
          title,
          start: dateStr,
          color: config.color,
          extendedProps: {
            startTime: editedSchedule.startTime,
            endTime: editedSchedule.endTime,
            isShift: true,
            isHoliday: scheduleInfo?.isHoliday || false,
            isSaturday: scheduleInfo?.isSaturday || false,
            shiftIndex,
            holidayName: getHolidayName(currentDate),
            isEdited: true,
            editedSubject: editedSchedule.subject,
          },
        });
      } else {
        const scheduleInfo = getScheduleForDate(currentDate, startPosition);

        if (!scheduleInfo) {
          currentDate = addDays(currentDate, 1);
          continue;
        }

        const {
          subject,
          startTime,
          endTime,
          isHoliday,
          isSaturday,
          shiftIndex,
        } = scheduleInfo;

        const { config } = getEventType(subject, false);
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
            isEdited: false,
          },
        });
      }

      currentDate = addDays(currentDate, 1);
    }

    setCalendarEvents(generatedEvents);
    return generatedEvents;
  }

  return {
    calendarEvents: storeCalendarEvents,
    startPosition: storeStartPosition,
    eventConfig: storeEventConfig,
    isConfigLoaded: computed(() => storeEventConfig.value !== undefined),

    setStartPosition,
    setExportMonths,
    setCalendarEvents,
    setEventConfig,

    getEventType,
    canAttendMeetup,
    generateCalendarEvents,
  };
}
