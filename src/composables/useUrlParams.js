// URL params: canonical (hash query) と legacy (pre-hash search) の両方を扱う。
//
// canonical:
//   Home   #/?p=N  /  #/?v=old&p=N
//   Meetup #/meetup?ps=1,7,12&t=19:00&d=120
//
// legacy (旧ブックマーク互換、read のみ):
//   ?baseDate=YYYY-MM-DD&startNumber=N#/

const LEGACY_PARAM_KEYS = ["baseDate", "startNumber"];

const HOME_PATH = "/";
const MEETUP_PATH = "/meetup";

function getHashRoute() {
  const raw = window.location.hash || "";
  if (!raw || raw === "#" || raw === "#/") {
    return { path: HOME_PATH, query: new URLSearchParams() };
  }
  const stripped = raw.startsWith("#") ? raw.slice(1) : raw;
  const qIdx = stripped.indexOf("?");
  if (qIdx === -1) {
    return { path: stripped || HOME_PATH, query: new URLSearchParams() };
  }
  return {
    path: stripped.slice(0, qIdx) || HOME_PATH,
    query: new URLSearchParams(stripped.slice(qIdx + 1)),
  };
}

function writeHashQuery(updater) {
  const { path, query } = getHashRoute();
  updater(query);
  const qs = query.toString();
  const newHash = qs ? `#${path}?${qs}` : `#${path}`;
  window.history.replaceState(
    {},
    "",
    `${window.location.pathname}${window.location.search}${newHash}`,
  );
}

function parseIntOrNull(value) {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

export function useUrlParams() {
  function hasLegacyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return LEGACY_PARAM_KEYS.some((key) => params.has(key));
  }

  function readLegacyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const out = {};
    for (const key of LEGACY_PARAM_KEYS) {
      if (params.has(key)) out[key] = params.get(key);
    }
    return out;
  }

  function clearUrl() {
    const hash =
      window.location.hash && window.location.hash !== "#"
        ? window.location.hash
        : "#/";
    window.history.replaceState({}, "", `${window.location.pathname}${hash}`);
  }

  function calculateNewPosition(
    currentStartNumber,
    positionShift,
    rotationCycleLength,
  ) {
    if (!currentStartNumber || !positionShift || !rotationCycleLength)
      return null;
    const shifted = currentStartNumber + positionShift;
    return shifted > rotationCycleLength
      ? shifted - rotationCycleLength
      : shifted;
  }

  // ----- canonical: Home -----

  function readCanonicalCalendar() {
    const { path, query } = getHashRoute();
    if (path !== HOME_PATH) return { position: null, version: null };
    return {
      position: parseIntOrNull(query.get("p")),
      version: query.get("v") === "old" ? "old" : null,
    };
  }

  function writeCalendarUrl({ position, version } = {}) {
    writeHashQuery((q) => {
      if (typeof position === "number" && !isNaN(position)) {
        q.set("p", String(position));
      } else {
        q.delete("p");
      }
      if (version === "old") {
        q.set("v", "old");
      } else {
        q.delete("v");
      }
    });
  }

  function clearCalendarUrl() {
    writeHashQuery((q) => {
      q.delete("p");
      q.delete("v");
    });
  }

  // ----- canonical: Meetup -----

  function readCanonicalMeetup() {
    const { path, query } = getHashRoute();
    if (path !== MEETUP_PATH) return null;
    const rawPs = query.get("ps");
    const rawT = query.get("t");
    const rawD = query.get("d");
    if (!rawPs || !rawT || rawD == null) return null;
    const participants = rawPs
      .split(",")
      .map((s) => parseIntOrNull(s))
      .filter((n) => n != null);
    const period = parseIntOrNull(rawD);
    if (participants.length === 0 || period == null) return null;
    return { participants, startTime: rawT, period };
  }

  function writeMeetupUrl({ participants, startTime, period } = {}) {
    writeHashQuery((q) => {
      const ps = (participants || [])
        .map((p) => (typeof p === "object" ? p?.position : p))
        .map((v) => parseIntOrNull(v))
        .filter((n) => n != null);
      if (ps.length > 0) q.set("ps", ps.join(","));
      else q.delete("ps");

      if (startTime) q.set("t", startTime);
      else q.delete("t");

      const d = parseIntOrNull(period);
      if (d != null) q.set("d", String(d));
      else q.delete("d");
    });
  }

  function clearMeetupUrl() {
    writeHashQuery((q) => {
      q.delete("ps");
      q.delete("t");
      q.delete("d");
    });
  }

  return {
    // legacy
    hasLegacyUrlParams,
    readLegacyUrlParams,
    clearUrl,
    calculateNewPosition,
    // canonical
    readCanonicalCalendar,
    writeCalendarUrl,
    clearCalendarUrl,
    readCanonicalMeetup,
    writeMeetupUrl,
    clearMeetupUrl,
  };
}
