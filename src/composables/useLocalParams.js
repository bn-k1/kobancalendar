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

function readStoredObject(storageKey) {
  let stored;
  try {
    stored = localStorage.getItem(storageKey);
  } catch {
    return null;
  }
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return parseLegacyKeyValueString(stored);
  }
}

function writeStoredObject(storageKey, value) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeStoredObject(storageKey) {
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // noop — storage may be unavailable
  }
}

function toValidIntegerArray(values) {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => parseInt(value, 10))
    .filter((value) => !isNaN(value));
}

function readCalendarStorage() {
  const parsed = readStoredObject(CALENDAR_STORAGE_KEY);
  if (!parsed || typeof parsed !== "object") return { active: null, positions: {} };

  if (parsed.positions && typeof parsed.positions === "object") {
    const positions = {};
    for (const [key, value] of Object.entries(parsed.positions)) {
      const n = parseInt(value, 10);
      if (!isNaN(n)) positions[key] = n;
    }
    return { active: parsed.active || null, positions };
  }

  // Legacy flat shape {baseDate, startNumber}
  const legacyBase = parsed.baseDate || null;
  const legacyNum = parseInt(parsed.startNumber, 10);
  const positions = {};
  if (legacyBase && !isNaN(legacyNum)) positions[legacyBase] = legacyNum;
  return { active: legacyBase, positions };
}

export function useLocalParams() {
  function saveCalendarSelection(baseDate, startNumber) {
    if (!baseDate) return false;

    const current = readCalendarStorage();
    const positions = { ...current.positions };
    const parsedStart = parseInt(startNumber, 10);
    if (!isNaN(parsedStart)) {
      positions[baseDate] = parsedStart;
    }

    return writeStoredObject(CALENDAR_STORAGE_KEY, {
      active: baseDate,
      positions,
    });
  }

  function loadCalendarSelection() {
    const { active, positions } = readCalendarStorage();
    if (!active) return null;
    const stored = positions[active];
    const startNumber = typeof stored === "number" ? stored : null;
    return { baseDate: active, startNumber };
  }

  function loadCalendarPositionFor(baseDate) {
    if (!baseDate) return null;
    const { positions } = readCalendarStorage();
    const stored = positions[baseDate];
    return typeof stored === "number" ? stored : null;
  }

  function clearCalendarSelection() {
    removeStoredObject(CALENDAR_STORAGE_KEY);
  }

  function saveMeetupParams(baseDate, participants, startTime, period) {
    const validParticipants = toValidIntegerArray(
      participants?.map?.((p) =>
        typeof p === "object" ? p.position : p,
      ),
    );
    const parsedPeriod = parseInt(period, 10);

    if (
      !baseDate ||
      validParticipants.length === 0 ||
      !startTime ||
      isNaN(parsedPeriod)
    ) {
      return false;
    }

    return writeStoredObject(MEETUP_STORAGE_KEY, {
      baseDate,
      participants: validParticipants,
      startTime,
      period: parsedPeriod,
    });
  }

  function loadMeetupParams() {
    const parsed = readStoredObject(MEETUP_STORAGE_KEY);
    if (!parsed) return null;

    const baseDate = parsed?.baseDate;
    const startTime = parsed?.startTime;
    const period = parseInt(parsed?.period, 10);
    const participantsFromArray = toValidIntegerArray(parsed?.participants);
    const participants =
      participantsFromArray.length > 0
        ? participantsFromArray
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

  function clearMeetupParams() {
    removeStoredObject(MEETUP_STORAGE_KEY);
  }

  return {
    saveCalendarSelection,
    loadCalendarSelection,
    loadCalendarPositionFor,
    clearCalendarSelection,
    saveMeetupParams,
    loadMeetupParams,
    clearMeetupParams,
  };
}
