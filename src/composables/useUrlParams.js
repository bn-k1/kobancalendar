// src/composables/useUrlParams.js
import { createDate, formatAsISODate, isSameDay } from "@/utils/date";
import { ERROR_MESSAGES } from "@/utils/constants";

/**
 * URL parameters handling composable
 * Handles retrieving and updating URL parameters for both views
 */
export function useUrlParams() {

  /**
   * Update URL parameters without reloading the page
   * @param {Object} params - Parameters to update
   */
  function updateURLParams(params) {
    const url = new URL(window.location);

    // Update or add each parameter
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
	url.searchParams.set(key, value);
      } else {
	url.searchParams.delete(key);
      }
    });

    // Update history without reloading
    window.history.pushState({}, "", url);
  }

  /**
   * Get a URL parameter value
   * @param {string} paramName - Parameter name
   * @param {*} defaultValue - Default value if parameter doesn't exist
   * @returns {string} Parameter value or default
   */
  function getURLParam(paramName, defaultValue = null) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has(paramName) ? urlParams.get(paramName) : defaultValue;
  }

  /**
   * Get and validate a date parameter from URL
   */

  function getDateParam(paramName, defaultValue, validDates = []) {
    const dateStr = getURLParam(paramName);

    if (!dateStr) {
      return defaultValue;
    }

    const dateObj = createDate(dateStr);

    // Check date validity
    if (!dateObj.isValid()) {
      console.error(`${ERROR_MESSAGES.INVALID_URL_PARAM}: ${paramName}`);
      return defaultValue;
    }

    // Validate against allowed dates if provided
    if (validDates.length > 0) {
      const dateExists = validDates.some((date) => isSameDay(date, dateObj));

      if (!dateExists) {
	alert(ERROR_MESSAGES.INVALID_BASE_DATE);
	return defaultValue;
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
    updateURLParams({
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

    updateURLParams({
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
