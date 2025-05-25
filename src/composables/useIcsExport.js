// src/composables/useIcsExport.js
import { ref, computed } from "vue";
import { ERROR_MESSAGES } from "@/utils/constants";
import { createCalendar, downloadICS } from "@/utils/ical";
import { useSchedule } from "@/composables/useSchedule";
import { createDate, isSame, isBefore, addDays } from "@/utils/date";

/**
 * ICS Export composable
 * Manages exporting calendar events to ICS format
 */
export function useIcsExport() {
  // State
  const exportError = ref(undefined);

  // Dependencies
  const { calculateScheduleRange } = useSchedule();

  /**
   * Export schedule to ICS format
   * @param {number} startPosition - Starting position in the rotation
   * @param {dayjs} baseDate - Base date for calculations
   * @param {dayjs} nextBaseDate - Next base date for calculations
   * @param {dayjs} startDate - Export start date
   * @param {dayjs} endDate - Export end date
   * @param {string} url - Application URL for domain extraction
   * @returns {boolean} Success status
   */
  function exportICS(
    startPosition,
    baseDate,
    nextBaseDate,
    startDate,
    endDate,
    url,
  ) {
    try {
      if (!startPosition) {
        alert(ERROR_MESSAGES.INVALID_STARTNUMBER);
        return false;
      }

      exportError.value = undefined;

      const start = createDate(startDate);
      const end = createDate(endDate);
      const base = createDate(baseDate);
      const nextBase = createDate(nextBaseDate);

      // Adjust end date to one day after the selected end date for inclusive range
      const adjustedEndDate = addDays(end, 1);

      // If we have a different next base date and the range crosses it, limit to next base date
      let finalEndDate = adjustedEndDate;
      if (
        nextBase &&
        !isSame(base, nextBase) &&
        isBefore(nextBase, adjustedEndDate)
      ) {
        finalEndDate = nextBase;
      }

      // Get schedule for the date range
      const scheduleRange = calculateScheduleRange(
        start,
        finalEndDate,
        startPosition,
        base,
      );

      // Create the calendar
      const calendar = createCalendar(scheduleRange, url);

      // Download the ICS file
      downloadICS(calendar.toString(), start, end);
      return true;
    } catch (error) {
      console.error(ERROR_MESSAGES.ICS_EXPORT_ERROR, error);
      exportError.value = error;
      throw error;
    }
  }

  return {
    exportError: computed(() => exportError.value),
    hasError: computed(() => exportError.value !== undefined),
    exportICS,
  };
}
