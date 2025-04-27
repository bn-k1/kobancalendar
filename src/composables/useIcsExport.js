// src/composables/useIcsExport.js
import { ref, computed } from "vue";
import { ERROR_MESSAGES } from "@/utils/constants";
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
  const exportMonths = ref(1);
  const exportError = ref(null);

  // Dependencies
  const calendarStore = useCalendarStore();
  const { calculateScheduleRange } = useSchedule();

  /**
   * Set the number of months to export
   */
  function setExportMonths(months) {
    exportMonths.value = months;
  }

  /**
   * Export schedule to ICS format
   * @param {number} months - Number of months to export
   * @param {number} startPosition - Starting position in the rotation
   * @param {dayjs} baseDate - Base date for calculations
   * @param {dayjs} endBaseDate - End base date for calculations
   * @returns {boolean} Success status
   */
  function exportICS(months, startPosition, baseDate, endBaseDate) {
    try {
      exportError.value = null;

      const currentDay = startOfDay(today());
      const base = createDate(baseDate);
      const endBase = createDate(endBaseDate);

      // Determine start date (either base date or today, whichever is later)
      const startDate =
        isAfter(base, currentDay) || isSame(base, currentDay)
          ? startOfDay(base)
          : currentDay;

      // Calculate end date based on months parameter
      let endDate = addMonths(startDate, months);

      // Use end base date as limit if it comes before calculated end date
      if (endBase && !isSame(base, endBase) && isBefore(endBase, endDate)) {
        endDate = endBase;
      }

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
    hasError: computed(() => exportError.value !== null),

    // Methods
    setExportMonths,
    exportICS,
  };
}
