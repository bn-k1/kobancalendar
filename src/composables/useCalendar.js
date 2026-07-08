// src/composables/useCalendar.js
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useCalendarStore } from "@/stores/calendar";
import { useSchedule } from "@/composables/useSchedule";
import { useHolidays } from "@/composables/useHolidays";
import { useEditedSchedules } from "@/stores/editedSchedules";
import {
  createDate,
  addDays,
  isBefore,
  parseTime,
  formatAsISODate,
} from "@/utils/date";
import { matchRule, shouldShowTime, isFreeAllDay } from "@/utils/eventRules";

/**
 * Calendar functionality composable
 * Contains all calendar-related logic
 */
export function useCalendar() {
  const calendarStore = useCalendarStore();

  const { getScheduleForDate } = useSchedule();
  const { getHolidayName } = useHolidays();
  const editedSchedulesStore = useEditedSchedules();
  const { getEditedSchedule } = editedSchedulesStore;
  const { isEditsHidden } = storeToRefs(editedSchedulesStore);

  const storeCalendarEvents = computed(() => calendarStore.calendarEvents);
  const storeStartPosition = computed(() => calendarStore.startPosition);
  const storeEventConfig = computed(() => calendarStore.eventConfig);

  function setStartPosition(position) {
    calendarStore.setStartPosition(position);
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
    const eventConfig = storeEventConfig.value;

    if (isEdited) {
      return {
        type: "edited",
        config: { color: eventConfig?.edited?.color },
      };
    }

    const rule = matchRule(subject, eventConfig);
    if (rule) {
      return { type: rule.id, config: { color: rule.color } };
    }

    return {
      type: "default",
      config: { color: eventConfig?.fallback?.color },
    };
  }

  /**
   * Determine if a person can attend a meetup based on their schedule
   */
  function canAttendMeetup(schedule, meetupStartTime) {
    if (!schedule) return false;

    const { subject, endTime } = schedule;
    const eventConfig = storeEventConfig.value;

    if (isFreeAllDay(subject, eventConfig)) {
      return true;
    }

    if (!endTime) {
      return false;
    }

    const endTimeObj = parseTime(endTime);
    const meetupTimeObj = parseTime(meetupStartTime);

    return endTimeObj.isBefore(meetupTimeObj);
  }

  /**
   * Build the event title string, appending the time range when present.
   * @param {string} subject
   * @param {string} startTime
   * @param {string} endTime
   * @returns {string}
   */
  function buildEventTitle(subject, startTime, endTime) {
    if (shouldShowTime(startTime, endTime)) {
      return `${subject}\n${startTime} - \n${endTime}`;
    }
    return subject;
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
      const editedSchedule = isEditsHidden.value
        ? null
        : getEditedSchedule(dateStr);

      if (editedSchedule) {
        const scheduleInfo = getScheduleForDate(currentDate, startPosition);
        const shiftIndex = scheduleInfo?.shiftIndex ?? 0;

        const { config } = getEventType(editedSchedule.subject, true);
        const title = buildEventTitle(
          editedSchedule.subject,
          editedSchedule.startTime,
          editedSchedule.endTime,
        );

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
            note: editedSchedule.note || "",
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
          title: buildEventTitle(subject, startTime, endTime),
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
    setCalendarEvents,
    setEventConfig,

    getEventType,
    canAttendMeetup,
    generateCalendarEvents,
  };
}
