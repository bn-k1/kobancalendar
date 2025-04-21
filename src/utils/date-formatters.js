// src/utils/date-formatters.js
import dayjs from 'dayjs';
import { DATE_FORMATS, WEEKDAYS } from '@/config/constants';

/**
 * Format date as ISO string (YYYY-MM-DD)
 * @param {dayjs|Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatAsISODate(date) {
  return dayjs(date).format(DATE_FORMATS.ISO_DATE);
}

/**
 * Format date for display (YYYY/MM/DD)
 * @param {dayjs|Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatAsDisplayDate(date) {
  return dayjs(date).format(DATE_FORMATS.DISPLAY_DATE);
}

/**
 * Format date for filenames (YYYYMMDD)
 * @param {dayjs|Date|string} date - Date to format
 * @returns {string} Formatted date
 */
export function formatAsFileName(date) {
  return dayjs(date).format(DATE_FORMATS.FILE_NAME_DATE);
}

/**
 * Get Japanese weekday name
 * @param {dayjs|Date|string} date - Date
 * @returns {string} Weekday name in Japanese
 */
export function getWeekdayName(date) {
  return WEEKDAYS[dayjs(date).day()];
}

/**
 * Get date classes for styling (holiday, saturday, sunday)
 * @param {dayjs|Date|string} date - Date
 * @param {Function} isHolidayFn - Function to check if date is a holiday
 * @returns {string} CSS class names
 */
export function getDateClasses(date, isHolidayFn) {
  const dateObj = dayjs(date);
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
 * @param {dayjs} date - Date to check
 * @param {dayjs} startDate - Start of range
 * @param {dayjs} endDate - End of range
 * @returns {boolean} True if date is in range
 */
export function isDateInRange(date, startDate, endDate) {
  return date.isAfter(startDate) && date.isBefore(endDate);
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
 * @param {dayjs} startDate - Start date
 * @param {dayjs} endDate - End date
 * @returns {number} Number of days
 */
export function daysBetween(startDate, endDate) {
  return endDate.diff(startDate, 'day');
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