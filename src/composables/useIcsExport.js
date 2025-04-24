// src/composables/useIcsExport.js
import { ref, computed } from 'vue';
import dayjs from 'dayjs';
import { ERROR_MESSAGES } from '@/config/constants';
import { createCalendar, downloadICS } from '@/services/ical-service';
import { useCalendarStore } from '@/stores/calendar';
import { useSchedule } from '@/composables/useSchedule';

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
      
      const today = dayjs().startOf('day');
      
      // Determine start date (either base date or today, whichever is later)
      const startDate = baseDate.isAfter(today) || baseDate.isSame(today)
        ? baseDate.startOf('day')
        : today;
        
      // Calculate end date based on months parameter
      let endDate = startDate.add(months, 'month');
      
      // Use end base date as limit if it comes before calculated end date
      if (
        endBaseDate && 
        !baseDate.isSame(endBaseDate) && 
        endBaseDate.isBefore(endDate)
      ) {
        endDate = endBaseDate;
      }
      
      // Get schedule for the date range
      const scheduleRange = calculateScheduleRange(
        startDate,
        endDate,
        startPosition,
        baseDate
      );
      
      // Create the calendar
      const calendar = createCalendar(scheduleRange, calendarStore.icsExportConfig);
      
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
    exportICS
  };
}
