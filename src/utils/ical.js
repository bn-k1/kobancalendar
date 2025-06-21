// src/utils/ical.js
import ical from "ical-generator";
import { createDate, formatAsFileName, toDate } from "@/utils/date";
import { ICS_CONFIG } from "@/utils/constants";

/**
 * Extract domain name from URL
 * @param {string} url - URL string
 * @returns {string} Domain name
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "localhost";
  }
}

/**
 * Generate a unique identifier for calendar events
 * @param {dayjs} date - Event date
 * @param {string} subject - Event subject/title
 * @param {string} startTime - Event start time (HH:MM)
 * @param {string} endTime - Event end time (HH:MM)
 * @param {string} domain - Domain for the UID
 * @returns {string} Unique identifier
 */
function generateUID(
  date,
  subject = "",
  startTime = "",
  endTime = "",
  domain = "",
) {
  const dateStr = formatAsFileName(date);
  const contentHash = simpleHash(`${subject}-${startTime}-${endTime}`);
  return `${dateStr}-${contentHash}@${domain}`;
}

/**
 * Generate a simple hash for content
 * @param {string} str - String to hash
 * @returns {string} Hashed string
 */
function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16);
}

/**
 * Create an ICS calendar from events
 * @param {Array} events - Array of event objects
 * @param {string} url - Application URL for domain extraction
 * @returns {Object} ical calendar object
 */
export function createCalendar(events, url) {
  const domain = extractDomain(url);

  // Create calendar
  const calendar = ical({
    prodId: `-//${domain}//${ICS_CONFIG.PRODUCT_NAME}//${ICS_CONFIG.LANGUAGE}`,
  });

  // Add events to calendar
  events.forEach((event) => {
    const { subject, startTime, endTime, date } = event;
    const eventDate = createDate(date);

    // Create event
    const calEvent = calendar.createEvent({
      summary: subject,
      id: generateUID(eventDate, subject, startTime, endTime, domain),
    });

    // Set event time
    if (startTime && endTime) {
      const [startHour, startMinute = "00"] = startTime.split(":");
      const [endHour, endMinute = "00"] = endTime.split(":");

      const start = eventDate
        .hour(parseInt(startHour, 10))
        .minute(parseInt(startMinute, 10))
        .second(0)
        .toDate();

      const end = eventDate
        .hour(parseInt(endHour, 10))
        .minute(parseInt(endMinute, 10))
        .second(0)
        .toDate();

      calEvent.start(start);
      calEvent.end(end);
    } else {
      // All-day event
      const adjustedDate = eventDate.add(1, "day");
      calEvent.allDay(true);
      calEvent.start(adjustedDate.toDate());
      calEvent.end(adjustedDate.toDate());
    }
  });

  return calendar;
}

/**
 * Download ICS file
 * @param {string} icsContent - ICS file content
 * @param {dayjs} startDate - Range start date
 * @param {dayjs} endDate - Range end date
 */
export function downloadICS(icsContent, startDate, endDate) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  // Create filename with date range
  const startDateStr = formatAsFileName(startDate);
  const endDateStr = formatAsFileName(endDate);

  downloadLink.href = url;
  downloadLink.download = `schedule_${startDateStr}-${endDateStr}.ics`;

  // Add to document, click, and cleanup
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
