// src/composables/useUrlParams.js
import {
  getURLParam,
  updateURLParams as updateParams,
} from "@/utils/url-params";
import { createDate, formatAsISODate, isSameDay } from "@/utils/date";
import { ERROR_MESSAGES } from "@/utils/constants";

/**
 * URL parameters handling composable
 * Handles retrieving and updating URL parameters for both views
 */
export function useUrlParams() {
  /**
   * Get and validate a date parameter from URL
   */
  function getDateParam(paramName, defaultDate, validDates = []) {
    const dateParam = getURLParam(paramName, null);
    if (!dateParam) return defaultDate;

    const dateObj = createDate(dateParam);
    if (!dateObj.isValid()) {
      console.error(`${ERROR_MESSAGES.INVALID_URL_PARAM}: ${paramName}`);
      return defaultDate;
    }

    // Validate against allowed dates if provided
    if (validDates.length > 0) {
      const isValid = validDates.some((date) => isSameDay(date, dateObj));
      if (!isValid) {
        console.error(ERROR_MESSAGES.INVALID_BASE_DATE);
        return defaultDate;
      }
    }

    return dateObj;
  }

  /**
   * Get a number parameter from URL
   */
  function getNumberParam(paramName, defaultValue, min = null, max = null) {
    const valueStr = getURLParam(paramName);
    if (!valueStr) return defaultValue;

    const value = parseInt(valueStr, 10);
    if (isNaN(value)) {
      console.error(`${ERROR_MESSAGES.INVALID_URL_PARAM}: ${paramName}`);
      return defaultValue;
    }

    if (min !== null && value < min) {
      console.error(ERROR_MESSAGES.PARAM_OUT_OF_RANGE);
      return defaultValue;
    }

    if (max !== null && value > max) {
      console.error(ERROR_MESSAGES.PARAM_OUT_OF_RANGE);
      return defaultValue;
    }

    return value;
  }

  /**
   * Get a string parameter from URL
   */
  function getStringParam(paramName, defaultValue) {
    return getURLParam(paramName, defaultValue);
  }

  /**
   * Get participant positions from URL parameter
   */
  function getParticipantsFromParams() {
    const participantsParam = getURLParam("participants", "");
    if (!participantsParam) return [{ position: "" }];

    const positions = participantsParam
      .split(",")
      .map((p) => parseInt(p, 10))
      .filter((p) => !isNaN(p));

    return positions.length > 0
      ? positions.map((position) => ({ position }))
      : [{ position: "" }];
  }

  /**
   * Update URL parameters for calendar view
   */
  function updateCalendarParams(baseDate, startNumber) {
    updateParams({
      baseDate: formatAsISODate(baseDate),
      startNumber,
    });
  }

  /**
   * Update URL parameters for meetup view
   */
  function updateMeetupParams(baseDate, participants, otherParams = {}) {
    const validParticipants = participants
      .filter((p) => p.position)
      .map((p) => p.position)
      .join(",");

    updateParams({
      baseDate: formatAsISODate(baseDate),
      participants: validParticipants,
      ...otherParams,
    });
  }

  return {
    getDateParam,
    getNumberParam,
    getStringParam,
    getParticipantsFromParams,
    updateCalendarParams,
    updateMeetupParams,
  };
}
