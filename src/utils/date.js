// src/utils/date.js
// Centralized date utility for all date-related operations
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isSameOrBeforePlugin from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfterPlugin from 'dayjs/plugin/isSameOrAfter';
import { DATE_FORMATS, WEEKDAYS } from '@/utils/constants';

// プラグインの設定 - 順序が重要
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBeforePlugin);
dayjs.extend(isSameOrAfterPlugin);
dayjs.tz.setDefault('Asia/Tokyo');

/**
 * Create a dayjs object for a date
 * @param {dayjs|Date|string} date - Date to convert
 * @returns {dayjs} dayjs object
 */
export function createDate(date) {
  return dayjs.isDayjs(date) ? date : dayjs(date);
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 * @param {dayjs|Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatAsISODate(date) {
  return createDate(date).format(DATE_FORMATS.ISO_DATE);
}

/**
 * Format date for display (YYYY/MM/DD)
 * @param {dayjs|Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatAsDisplayDate(date) {
  return createDate(date).format(DATE_FORMATS.DISPLAY_DATE);
}

/**
 * Format date for filenames (YYYYMMDD)
 * @param {dayjs|Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatAsFileName(date) {
  return createDate(date).format(DATE_FORMATS.FILE_NAME_DATE);
}

/**
 * Get Japanese weekday name
 * @param {dayjs|Date|string} date - Date
 * @returns {string} Weekday name in Japanese
 */
export function getWeekdayName(date) {
  return WEEKDAYS[createDate(date).day()];
}

/**
 * Get date classes for styling (holiday, saturday, sunday)
 * @param {dayjs|Date|string} date - Date
 * @param {Function} isHolidayFn - Function to check if date is a holiday
 * @returns {string} CSS class names
 */
export function getDateClasses(date, isHolidayFn) {
  const dateObj = createDate(date);
  const day = dateObj.day();
  const classes = [];
  
  // Check for holiday
  if (isHolidayFn && isHolidayFn(dateObj)) {
    classes.push('holiday');
  }
  
  // Check for weekend
  if (day === 0) {
    classes.push('fc-day-sun');
  } else if (day === 6) {
    classes.push('fc-day-sat');
  }
  
  // Check for today
  if (dateObj.isSame(dayjs().startOf('day'), 'day')) {
    classes.push('today-highlight');
  }
  
  return classes.join(' ');
}

/**
 * Check if date is within a valid range
 * @param {dayjs|Date|string} date - Date to check
 * @param {dayjs|Date|string} startDate - Start of range
 * @param {dayjs|Date|string} endDate - End of range
 * @returns {boolean} True if date is in range
 */
export function isDateInRange(date, startDate, endDate) {
  const dateObj = createDate(date);
  const start = createDate(startDate);
  const end = createDate(endDate);
  return dateObj.isAfter(start) && dateObj.isBefore(end);
}

/**
 * Format time (HH:MM)
 * @param {string} timeStr - Time string
 * @returns {string} Formatted time
 */
export function formatTime(timeStr) {
  if (!timeStr) return '';
  
  const [hours, minutes = '00'] = timeStr.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

/**
 * Calculate date difference in days
 * @param {dayjs|Date|string} startDate - Start date
 * @param {dayjs|Date|string} endDate - End date
 * @returns {number} Number of days
 */
export function daysBetween(startDate, endDate) {
  return createDate(endDate).diff(createDate(startDate), 'day');
}

/**
 * Parse time string to dayjs object
 * @param {string} timeStr - Time string (HH:MM)
 * @returns {dayjs} dayjs object
 */
export function parseTime(timeStr) {
  if (!timeStr) return null;
  
  const [hours, minutes = '00'] = timeStr.split(':');
  return dayjs()
    .hour(parseInt(hours, 10))
    .minute(parseInt(minutes, 10))
    .second(0);
}

/**
 * Compare two dates for equality (ignoring time)
 * @param {dayjs|Date|string} date1 - First date
 * @param {dayjs|Date|string} date2 - Second date
 * @returns {boolean} True if dates are the same day
 */
export function isSameDay(date1, date2) {
  return createDate(date1).isSame(createDate(date2), 'day');
}

/**
 * Check if a date is before another (ignoring time)
 * @param {dayjs|Date|string} date1 - First date
 * @param {dayjs|Date|string} date2 - Second date
 * @returns {boolean} True if date1 is before date2
 */
export function isBefore(date1, date2) {
  return createDate(date1).isBefore(createDate(date2), 'day');
}

/**
 * Check if a date is after another (ignoring time)
 * @param {dayjs|Date|string} date1 - First date
 * @param {dayjs|Date|string} date2 - Second date
 * @returns {boolean} True if date1 is after date2
 */
export function isAfter(date1, date2) {
  return createDate(date1).isAfter(createDate(date2), 'day');
}

/**
 * Check if a date is same or before another (ignoring time)
 * @param {dayjs|Date|string} date1 - First date
 * @param {dayjs|Date|string} date2 - Second date
 * @returns {boolean} True if date1 is same as or before date2
 */
export function isSameOrBefore(date1, date2) {
  return createDate(date1).isSameOrBefore(createDate(date2), 'day');
}

/**
 * Check if a date is same or after another (ignoring time)
 * @param {dayjs|Date|string} date1 - First date
 * @param {dayjs|Date|string} date2 - Second date
 * @returns {boolean} True if date1 is same as or after date2
 */
export function isSameOrAfter(date1, date2) {
  return createDate(date1).isSameOrAfter(createDate(date2), 'day');
}

/**
 * Check if two dates are the same (can specify units)
 * @param {dayjs|Date|string} date1 - First date
 * @param {dayjs|Date|string} date2 - Second date
 * @param {string} unit - Unit of precision (e.g., 'day', 'month', 'year')
 * @returns {boolean} True if dates are the same at specified precision
 */
export function isSame(date1, date2, unit = 'day') {
  return createDate(date1).isSame(createDate(date2), unit);
}

/**
 * Get today's date as a dayjs object (start of day)
 * @returns {dayjs} Today at start of day
 */
export function today() {
  return dayjs().startOf('day');
}

/**
 * Add days to a date
 * @param {dayjs|Date|string} date - Base date
 * @param {number} days - Number of days to add
 * @returns {dayjs} New date
 */
export function addDays(date, days) {
  return createDate(date).add(days, 'day');
}

/**
 * Add months to a date
 * @param {dayjs|Date|string} date - Base date
 * @param {number} months - Number of months to add
 * @returns {dayjs} New date
 */
export function addMonths(date, months) {
  return createDate(date).add(months, 'month');
}

/**
 * Set a date to the start of day
 * @param {dayjs|Date|string} date - Date to modify
 * @returns {dayjs} Date set to start of day
 */
export function startOfDay(date) {
  return createDate(date).startOf('day');
}

/**
 * Get day of week (0-6, where 0 is Sunday)
 * @param {dayjs|Date|string} date - Date to check
 * @returns {number} Day of week
 */
export function getDayOfWeek(date) {
  return createDate(date).day();
}

/**
 * Check if date is a weekend
 * @param {dayjs|Date|string} date - Date to check
 * @returns {boolean} True if weekend
 */
export function isWeekend(date) {
  const day = getDayOfWeek(date);
  return day === 0 || day === 6;
}

/**
 * Check if date is a Saturday
 * @param {dayjs|Date|string} date - Date to check
 * @returns {boolean} True if Saturday
 */
export function isSaturday(date) {
  return getDayOfWeek(date) === 6;
}

/**
 * Check if date is a Sunday
 * @param {dayjs|Date|string} date - Date to check
 * @returns {boolean} True if Sunday
 */
export function isSunday(date) {
  return getDayOfWeek(date) === 0;
}

/**
 * Convert a date to JavaScript Date object
 * @param {dayjs|Date|string} date - Date to convert
 * @returns {Date} JavaScript Date object
 */
export function toDate(date) {
  return createDate(date).toDate();
}

/**
 * Get Unix timestamp for a date
 * @param {dayjs|Date|string} date - Date to convert
 * @returns {number} Unix timestamp
 */
export function toUnix(date) {
  return createDate(date).unix();
}
