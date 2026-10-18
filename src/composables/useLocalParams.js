const CALENDAR_STORAGE_KEY = "kobancalendar.savedSelection.v1";
const MEETUP_STORAGE_KEY = "kobancalendar.savedMeetup.v1";

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
    return null;
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

function toValidIntegerArray(values) {
  if (!Array.isArray(values)) return [];

  return values
    .map((value) => parseInt(value, 10))
    .filter((value) => !isNaN(value));
}

function normalizeMeetupSet(raw) {
  if (!raw || typeof raw !== "object") return null;

  const startTime = raw.startTime;
  const period = parseInt(raw.period, 10);
  const participants = toValidIntegerArray(raw.participants);

  if (!startTime || isNaN(period) || participants.length === 0) return null;

  return { participants, startTime, period };
}

function readMeetupStorage() {
  const parsed = readStoredObject(MEETUP_STORAGE_KEY);
  if (!parsed || typeof parsed !== "object") return { active: null, sets: {} };

  const sets = {};
  for (const [key, value] of Object.entries(parsed.sets || {})) {
    const normalized = normalizeMeetupSet(value);
    if (normalized) sets[key] = normalized;
  }
  return { active: parsed.active || null, sets };
}

function readCalendarStorage() {
  const parsed = readStoredObject(CALENDAR_STORAGE_KEY);
  if (!parsed || typeof parsed !== "object")
    return { active: null, positions: {} };

  const positions = {};
  for (const [key, value] of Object.entries(parsed.positions || {})) {
    const n = parseInt(value, 10);
    if (!isNaN(n)) positions[key] = n;
  }
  return { active: parsed.active || null, positions };
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

  // A stale `active` pointer (baseDate no longer matches any known epoch)
  // must only reset the pointer — the `positions` map for other, still-valid
  // baseDates (e.g. a sibling generation's slot) must survive. Wiping the
  // whole key here would silently forget everyone else's saved position too.
  function clearCalendarSelection() {
    const { positions } = readCalendarStorage();
    writeStoredObject(CALENDAR_STORAGE_KEY, { active: null, positions });
  }

  function saveMeetupParams(baseDate, participants, startTime, period) {
    const validParticipants = toValidIntegerArray(
      participants?.map?.((p) => (typeof p === "object" ? p.position : p)),
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

    const current = readMeetupStorage();
    const sets = { ...current.sets };
    sets[baseDate] = {
      participants: validParticipants,
      startTime,
      period: parsedPeriod,
    };

    return writeStoredObject(MEETUP_STORAGE_KEY, { active: baseDate, sets });
  }

  function loadMeetupParamsFor(baseDate) {
    if (!baseDate) return null;
    const { sets } = readMeetupStorage();
    const set = sets[baseDate];
    if (!set) return null;
    return {
      baseDate,
      participants: set.participants.map((position) => ({ position })),
      startTime: set.startTime,
      period: set.period,
    };
  }

  function loadMeetupParams() {
    const { active } = readMeetupStorage();
    return active ? loadMeetupParamsFor(active) : null;
  }

  // Same reasoning as clearCalendarSelection: only the pointer is stale, the
  // per-baseDate `sets` map (e.g. the other version's search config) is not.
  function clearMeetupParams() {
    const { sets } = readMeetupStorage();
    writeStoredObject(MEETUP_STORAGE_KEY, { active: null, sets });
  }

  return {
    saveCalendarSelection,
    loadCalendarSelection,
    loadCalendarPositionFor,
    clearCalendarSelection,
    saveMeetupParams,
    loadMeetupParams,
    loadMeetupParamsFor,
    clearMeetupParams,
  };
}
