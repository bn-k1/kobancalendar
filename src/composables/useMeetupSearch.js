// src/composables/useMeetupSearch.js
import { ref } from 'vue';
import dayjs from 'dayjs';
import { useScheduleStore } from '@/stores/schedule';
import { useCalendar } from '@/composables/useCalendar';

/**
 * Meetup search composable
 * Finds available dates for meetups based on participant availability
 */
export function useMeetupSearch() {
  // State
  const searchResults = ref({
    allMatches: [],
    partialMatches: [],
  });
  
  // Dependencies
  const scheduleStore = useScheduleStore();
  const { canAttendMeetup } = useCalendar();

  /**
   * Find dates where participants can attend a meetup
   * @param {Array} positions - List of participant positions
   * @param {string} meetupStartTime - Start time for the meetup (HH:MM)
   * @param {dayjs} startDate - Start date for the search
   * @param {dayjs} endDate - End date for the search
   * @returns {Object} Search results with all matches and partial matches
   */
  function findMeetupDates(positions, meetupStartTime, startDate, endDate) {
    const result = {
      allMatches: [],
      partialMatches: [],
    };

    // Search each date in the range
    let currentDate = dayjs(startDate);
    while (currentDate.isBefore(endDate)) {
      const dateResults = checkDateForPositions(
        currentDate,
        positions,
        meetupStartTime
      );

      // All participants can attend
      if (dateResults.availablePositions.length === positions.length) {
        result.allMatches.push({
          date: currentDate,
          availableCount: dateResults.availablePositions.length,
          totalCount: positions.length,
          details: dateResults.details,
        });
      }
      // Some participants can attend
      else if (dateResults.availablePositions.length > 0) {
        result.partialMatches.push({
          date: currentDate,
          availableCount: dateResults.availablePositions.length,
          totalCount: positions.length,
          details: dateResults.details,
        });
      }

      currentDate = currentDate.add(1, "day");
    }

    // Sort results
    result.allMatches.sort((a, b) => a.date.unix() - b.date.unix());
    result.partialMatches.sort((a, b) => {
      // First by number of available participants (descending)
      if (b.availableCount !== a.availableCount) {
        return b.availableCount - a.availableCount;
      }
      // Then by date (ascending)
      return a.date.unix() - b.date.unix();
    });

    searchResults.value = result;
    return result;
  }

  /**
   * Check a specific date for participant availability
   * @param {dayjs} date - Date to check
   * @param {Array} positions - List of participant positions
   * @param {string} meetupStartTime - Start time for the meetup (HH:MM)
   * @returns {Object} Results with available positions and details
   */
  function checkDateForPositions(date, positions, meetupStartTime) {
    const result = {
      availablePositions: [],
      details: [],
    };

    for (const position of positions) {
      // Get schedule for this position on this date
      const schedule = scheduleStore.getScheduleForDate(date, position);

      // Check if this participant can attend
      const isAvailable = canAttendMeetup(schedule, meetupStartTime);

      // Record details
      result.details.push({
        position,
        schedule,
        isAvailable,
      });

      // Add to available positions if they can attend
      if (isAvailable) {
        result.availablePositions.push(position);
      }
    }

    return result;
  }

  return {
    searchResults,
    findMeetupDates,
    checkDateForPositions,
  };
}