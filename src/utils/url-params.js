// src/utils/url-params.js
import { ERROR_MESSAGES, DATE_FORMATS } from '@/config/constants';
import { 
  createDate, 
  formatAsISODate, 
  isSameDay 
} from '@/utils/date';

/**
 * Update URL parameters without reloading the page
 * @param {Object} params - Parameters to update
 */
export function updateURLParams(params) {
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
export function getURLParam(paramName, defaultValue = null) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(paramName) ? urlParams.get(paramName) : defaultValue;
}

/**
 * Get and validate a date parameter
 * @param {string} paramName - Parameter name
 * @param {dayjs} defaultValue - Default date
 * @param {Array} validDates - Array of valid dates for validation
 * @returns {dayjs} Date object
 */
export function getDateParam(paramName, defaultValue, validDates = []) {
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
    const dateExists = validDates.some(
      (date) => isSameDay(date, dateObj)
    );

    if (!dateExists) {
      alert(ERROR_MESSAGES.INVALID_BASE_DATE);
      return defaultValue;
    }
  }

  return dateObj;
}

/**
 * Get and validate a number parameter
 * @param {string} paramName - Parameter name
 * @param {number} defaultValue - Default value
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} Number value
 */
export function getNumberParam(
  paramName,
  defaultValue,
  min = null,
  max = null
) {
  const valueStr = getURLParam(paramName);

  if (!valueStr) {
    return defaultValue;
  }

  const value = parseInt(valueStr, 10);

  // Check if valid number
  if (isNaN(value)) {
    console.error(`${ERROR_MESSAGES.INVALID_URL_PARAM}: ${paramName}`);
    return defaultValue;
  }

  // Check min boundary
  if (min !== null && value < min) {
    alert(ERROR_MESSAGES.INVALID_STARTNUMBER);
    return defaultValue;
  }

  // Check max boundary
  if (max !== null && value > max) {
    alert(ERROR_MESSAGES.INVALID_STARTNUMBER);
    return defaultValue;
  }

  return value;
}