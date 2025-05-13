// src/composables/useIcsExport.js
import { ref, computed } from "vue";
import { APP_CONFIG, ERROR_MESSAGES } from "@/utils/constants";
import { createCalendar, downloadICS } from "@/utils/ical";
import { useCalendarStore } from "@/stores/calendar";
import { useSchedule } from "@/composables/useSchedule";
import {
  createDate,
  today,
  isAfter,
  isSame,
  isBefore,
  addMonths,
  startOfDay,
} from "@/utils/date";

/**
 * ICS Export composable
 * Manages exporting calendar events to ICS format
 */
export function useIcsExport() {
  // State
  const exportMonths = ref("");
  const exportError = ref(undefined);

  // Dependencies
  const calendarStore = useCalendarStore();
  const { calculateScheduleRange } = useSchedule();

  /**
   * Export schedule to ICS format
   * @param {number} months - Number of months to export
   * @param {number} startPosition - Starting position in the rotation
   * @param {dayjs} baseDate - Base date for calculations
   * @param {dayjs} nextBaseDate - Next base date for calculations
   * @returns {boolean} Success status
   */
  function exportICS(months, startPosition, baseDate, nextBaseDate) {
    try {
      if (!startPosition) {
        alert(ERROR_MESSAGES.INVALID_STARTNUMBER);
        return;
      }

      exportError.value = undefined;

      const currentDay = startOfDay(today());
      const base = createDate(baseDate);
      const nextBase = createDate(nextBaseDate);

      // Determine start date (either base date or today, whichever is later)
      let startDate =
        isAfter(base, currentDay) || isSame(base, currentDay)
          ? startOfDay(base)
          : currentDay;

      // Calculate end date based on months parameter
      let endDate = addMonths(startDate, months);

      // Use next base date as limit if it comes before calculated end date
      if (nextBase && !isSame(base, nextBase) && isBefore(nextBase, endDate)) {
        endDate = nextBase;
      }

      startDate = startDate.date(APP_CONFIG.DEFAULT_EXPORT_STARTDAY);
      endDate = endDate.date(APP_CONFIG.DEFAULT_EXPORT_ENDDAY);

      // Get schedule for the date range
      const scheduleRange = calculateScheduleRange(
        startDate,
        endDate,
        startPosition,
        base,
      );

      // Create the calendar
      const calendar = createCalendar(
        scheduleRange,
        calendarStore.icsExportConfig,
      );

      // Download the ICS file
      downloadICS(calendar.toString(), startDate, endDate);
      return true;
    } catch (error) {
      console.error(ERROR_MESSAGES.ICS_EXPORT_ERROR, error);
      exportError.value = error;
      throw error;
    }
  }

  return {
    exportMonths,
    exportError: computed(() => exportError.value),
    hasError: computed(() => exportError.value !== undefined),

    exportICS,
  };
}
