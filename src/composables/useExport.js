// src/composables/useExport.js
import { createEvents } from 'ics';
import { formatAsISODate, createDate } from '@/utils/date';
import { EXPORT_CONFIG, ERROR_MESSAGES } from '@/utils/constants';

/**
 * Export functionality composable
 * Handles exporting calendar events to ICS format
 */
export function useExport() {
  /**
   * Convert calendar event to ICS event format
   * @param {Object} event - Calendar event object
   * @returns {Object} ICS event object
   */
  function convertToICSEvent(event) {
    const startDate = createDate(event.start);
    
    // Extract year, month, day for ICS format
    const start = [
      startDate.year(),
      startDate.month() + 1, // ICS months are 1-indexed
      startDate.date(),
    ];
    
    // Parse time if available
    let startTime = undefined;
    let endTime = undefined;
    
    if (event.extendedProps && event.extendedProps.startTime) {
      const [hours, minutes] = event.extendedProps.startTime.split(':');
      startTime = [parseInt(hours, 10), parseInt(minutes, 10)];
    }
    
    if (event.extendedProps && event.extendedProps.endTime) {
      const [hours, minutes] = event.extendedProps.endTime.split(':');
      endTime = [parseInt(hours, 10), parseInt(minutes, 10)];
    }
    
    // Build ICS event object
    const icsEvent = {
      title: event.title.split('\n')[0], // Use first line as title
      start: startTime ? [...start, ...startTime] : start,
      startInputType: 'local',
      startOutputType: 'local',
    };
    
    // Add end time if available
    if (endTime) {
      icsEvent.end = [...start, ...endTime];
      icsEvent.endInputType = 'local';
      icsEvent.endOutputType = 'local';
    } else {
      // All-day event
      icsEvent.duration = { days: 1 };
    }
    
    // Add description
    const description = [];
    if (event.extendedProps) {
      if (event.extendedProps.holidayName) {
        description.push(event.extendedProps.holidayName);
      }
      if (event.extendedProps.shiftIndex !== undefined) {
        description.push(`${EXPORT_CONFIG.SHIFT_INDEX_PREFIX}${event.extendedProps.shiftIndex + 1}`);
      }
    }
    
    if (description.length > 0) {
      icsEvent.description = description.join('\n');
    }
    
    // Add categories
    if (event.color) {
      icsEvent.categories = [event.color];
    }
    
    return icsEvent;
  }
  
  /**
   * Export calendar events to ICS file
   * @param {Array} events - Array of calendar events
   * @param {dayjs} startDate - Export start date
   * @param {dayjs} endDate - Export end date
   */
  async function exportToICS(events, startDate, endDate) {
    try {
      // Convert events to ICS format
      const icsEvents = events.map(convertToICSEvent);
      
      // Create ICS file
      const { error, value } = createEvents(icsEvents);
      
      if (error) {
        console.error(ERROR_MESSAGES.EXPORT_FAILED, error);
        alert(ERROR_MESSAGES.EXPORT_FAILED);
        return;
      }
      
      // Generate filename
      const filename = `${EXPORT_CONFIG.FILENAME_PREFIX}_${formatAsISODate(startDate)}_${formatAsISODate(endDate)}.ics`;
      
      // Create blob and download
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(ERROR_MESSAGES.EXPORT_FAILED, error);
      alert(ERROR_MESSAGES.EXPORT_FAILED);
    }
  }
  
  return {
    convertToICSEvent,
    exportToICS,
  };
}