// src/utils/ical.js
import { createDate, formatAsFileName } from "@/utils/date";
import { ICS_CONFIG } from "@/utils/constants";

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return "localhost";
  }
}

/**
 * Generate simple UID for calendar events
 */
function generateUID(date, subject, domain) {
  const dateStr = formatAsFileName(date);
  const timestamp = Date.now();
  return `${dateStr}-${timestamp}@${domain}`;
}

/**
 * Format date for ICS (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Format date for ICS all-day events (YYYYMMDD)
 */
function formatICSDateOnly(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

/**
 * Escape special characters for ICS format
 */
function escapeICSText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Create ICS calendar content from events
 */
export function createCalendar(events, url) {
  const domain = extractDomain(url);
  
  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${domain}//${ICS_CONFIG.PRODUCT_NAME}//${ICS_CONFIG.LANGUAGE}`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach((event) => {
    const { subject, startTime, endTime, date } = event;
    const eventDate = createDate(date);
    const uid = generateUID(eventDate, subject, domain);
    const escapedSubject = escapeICSText(subject);

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:${uid}`);
    icsContent.push(`SUMMARY:${escapedSubject}`);
    icsContent.push(`DTSTAMP:${formatICSDate(new Date())}`);

    if (startTime && endTime) {
      // Timed event
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

      icsContent.push(`DTSTART:${formatICSDate(start)}`);
      icsContent.push(`DTEND:${formatICSDate(end)}`);
    } else {
      // All-day event
      const adjustedDate = eventDate.add(1, "day");
      const startDate = adjustedDate.toDate();
      
      icsContent.push(`DTSTART;VALUE=DATE:${formatICSDateOnly(startDate)}`);
      icsContent.push(`DTEND;VALUE=DATE:${formatICSDateOnly(startDate)}`);
    }

    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');
  
  return {
    toString: () => icsContent.join('\r\n')
  };
}

/**
 * Download ICS file
 */
export function downloadICS(icsContent, startDate, endDate) {
  const content = typeof icsContent === 'string' ? icsContent : icsContent.toString();
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  
  const startDateStr = formatAsFileName(startDate);
  const endDateStr = formatAsFileName(endDate);
  
  downloadLink.href = url;
  downloadLink.download = `schedule_${startDateStr}-${endDateStr}.ics`;
  downloadLink.style.display = "none";
  
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}