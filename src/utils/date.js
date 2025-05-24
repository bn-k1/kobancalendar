// src/utils/date.js
// Centralized date utility with optimized methods
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBeforePlugin from "dayjs/plugin/isSameOrBefore";
import isSameOrAfterPlugin from "dayjs/plugin/isSameOrAfter";
import { TIMEZONE, DATE_FORMATS, WEEKDAYS } from "@/utils/constants";

// Setup plugins - order matters
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBeforePlugin);
dayjs.extend(isSameOrAfterPlugin);
dayjs.tz.setDefault(TIMEZONE);

/**
 * Create a dayjs object for a date
 */
export function createDate(date) {
  return dayjs.isDayjs(date) ? date : dayjs(date);
}

/**
 * Format date with specified format
 */
export function formatDate(date, format) {
  return createDate(date).format(format);
}

/**
 * Format date as ISO string (YYYY-MM-DD)
 */
export function formatAsISODate(date) {
  return formatDate(date, DATE_FORMATS.ISO_DATE);
}

/**
 * Format date for display (YYYY/MM/DD)
 */
export function formatAsDisplayDate(date) {
  return formatDate(date, DATE_FORMATS.DISPLAY_DATE);
}

/**
 * Format date for filenames (YYYYMMDD)
 */
export function formatAsFileName(date) {
  return formatDate(date, DATE_FORMATS.FILE_NAME_DATE);
}

/**
 * Get Japanese weekday name
 */
export function getWeekdayName(date) {
  return WEEKDAYS[createDate(date).day()];
}

/**
 * Comparison functions
 */
export function isSameDay(date1, date2) {
  return createDate(date1).isSame(createDate(date2), "day");
}

export function isBefore(date1, date2) {
  return createDate(date1).isBefore(createDate(date2), "day");
}

export function isAfter(date1, date2) {
  return createDate(date1).isAfter(createDate(date2), "day");
}

export function isSameOrBefore(date1, date2) {
  return createDate(date1).isSameOrBefore(createDate(date2), "day");
}

export function isSameOrAfter(date1, date2) {
  return createDate(date1).isSameOrAfter(createDate(date2), "day");
}

export function isSame(date1, date2, unit = "day") {
  return createDate(date1).isSame(createDate(date2), unit);
}

/**
 * Date generation functions
 */
export function today() {
  return dayjs().startOf("day");
}

/**
 * Date modification functions
 */
export function addDays(date, days) {
  return createDate(date).add(days, "day");
}

export function addMonths(date, months) {
  return createDate(date).add(months, "month");
}

export function startOfDay(date) {
  return createDate(date).startOf("day");
}

/**
 * Day of week functions
 */
export function getDayOfWeek(date) {
  return createDate(date).day();
}

export function isWeekend(date) {
  const day = getDayOfWeek(date);
  return day === 0 || day === 6;
}

export function isSaturday(date) {
  return getDayOfWeek(date) === 6;
}

export function isSunday(date) {
  return getDayOfWeek(date) === 0;
}

/**
 * Conversion functions
 */
export function toDate(date) {
  return createDate(date).toDate();
}

export function toUnix(date) {
  return createDate(date).unix();
}

/**
 * Time parsing
 */
export function parseTime(timeStr) {
  if (!timeStr) return undefined;

  const [hours, minutes = "00"] = timeStr.split(":");
  return dayjs()
    .hour(parseInt(hours, 10))
    .minute(parseInt(minutes, 10))
    .second(0);
}
