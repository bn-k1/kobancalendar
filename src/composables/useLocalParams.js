// src/composables/useLocalParams.js
const CALENDAR_STORAGE_KEY = "kobancalendar.savedSelection.v1";
const MEETUP_STORAGE_KEY = "kobancalendar.savedMeetup.v1";

function parsePositions(positionsText) {
  if (!positionsText) return [];

  return positionsText
    .split(",")
    .map((value) => parseInt(value, 10))
    .filter((value) => !isNaN(value));
}

function parseLegacyKeyValueString(stored) {
  if (!stored) return {};

  return stored.split("&").reduce((result, pair) => {
    const [rawKey, rawValue = ""] = pair.split("=");
    if (!rawKey) return result;

    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue);
    result[key] = value;
    return result;
  }, {});
}

export function useLocalParams() {
  function saveCalendarSelection(baseDate, startNumber) {
    if (!baseDate || !startNumber) return false;

    localStorage.setItem(
      CALENDAR_STORAGE_KEY,
      JSON.stringify({ baseDate, startNumber }),
    );
    return true;
  }

  function loadCalendarSelection() {
    const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!stored) return null;

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch {
      parsed = parseLegacyKeyValueString(stored);
    }

    const baseDate = parsed?.baseDate;
    const startNumber = parseInt(parsed?.startNumber, 10);

    if (!baseDate || isNaN(startNumber)) {
      return null;
    }

    return { baseDate, startNumber };
  }

  function saveMeetupParams(baseDate, participants, startTime, period) {
    const validParticipants = participants
      .map((participant) => parseInt(participant.position, 10))
      .filter((position) => !isNaN(position));

    if (!baseDate || validParticipants.length === 0 || !startTime || !period) {
      return false;
    }

    localStorage.setItem(
      MEETUP_STORAGE_KEY,
      JSON.stringify({
        baseDate,
        participants: validParticipants,
        startTime,
        period: parseInt(period, 10),
      }),
    );
    return true;
  }

  function loadMeetupParams() {
    const stored = localStorage.getItem(MEETUP_STORAGE_KEY);
    if (!stored) return null;

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch {
      parsed = parseLegacyKeyValueString(stored);
    }

    const baseDate = parsed?.baseDate;
    const startTime = parsed?.startTime;
    const period = parseInt(parsed?.period, 10);
    const participants = Array.isArray(parsed?.participants)
      ? parsed.participants
          .map((value) => parseInt(value, 10))
          .filter((value) => !isNaN(value))
      : parsePositions(parsed?.participants);

    if (
      !baseDate ||
      !startTime ||
      isNaN(period) ||
      participants.length === 0
    ) {
      return null;
    }

    return {
      baseDate,
      startTime,
      period,
      participants: participants.map((position) => ({ position })),
    };
  }

  return {
    saveCalendarSelection,
    loadCalendarSelection,
    saveMeetupParams,
    loadMeetupParams,
  };
}
