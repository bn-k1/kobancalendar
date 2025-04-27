// src/composables/useMeetupSearch.js
import { ref } from "vue";
import { useSchedule } from "@/composables/useSchedule";
import { useCalendar } from "@/composables/useCalendar";
import { createDate, addDays, isBefore, toUnix } from "@/utils/date";

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
  const { getScheduleForDate } = useSchedule();
  const { canAttendMeetup } = useCalendar();

  /**
   * Find dates where participants can attend a meetup
   */
  function findMeetupDates(positions, meetupStartTime, startDate, endDate) {
    const result = {
      allMatches: [],
      partialMatches: [],
    };

    // Search each date in the range
    let currentDate = createDate(startDate);
    const end = createDate(endDate);

    while (isBefore(currentDate, end)) {
      const dateResults = checkDateForPositions(
        currentDate,
        positions,
        meetupStartTime,
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

      currentDate = addDays(currentDate, 1);
    }

    // Sort results
    result.allMatches.sort((a, b) => toUnix(a.date) - toUnix(b.date));
    result.partialMatches.sort((a, b) => {
      // First by number of available participants (descending)
      if (b.availableCount !== a.availableCount) {
        return b.availableCount - a.availableCount;
      }
      // Then by date (ascending)
      return toUnix(a.date) - toUnix(b.date);
    });

    searchResults.value = result;
    return result;
  }

  /**
   * Check a specific date for participant availability
   */
  function checkDateForPositions(date, positions, meetupStartTime) {
    const result = {
      availablePositions: [],
      details: [],
    };

    for (const position of positions) {
      // Get schedule for this position on this date
      const schedule = getScheduleForDate(date, position);

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
