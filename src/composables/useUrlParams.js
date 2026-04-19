const LEGACY_PARAM_KEYS = [
  "baseDate",
  "startNumber",
  "participants",
  "startTime",
  "period",
];

function getNormalizedHash(hash = window.location.hash) {
  if (!hash || hash === "#") {
    return "#/";
  }
  return hash;
}

/**
 * Legacy URL support.
 *
 * The app no longer writes to the URL — state lives in localStorage via
 * useLocalParams. But URLs generated before this change may still be in
 * circulation (bookmarks, shared links), so on first load a view reads any
 * recognized query params once and then clears them.
 */
export function useUrlParams() {
  function hasLegacyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    for (const key of LEGACY_PARAM_KEYS) {
      if (params.has(key)) return true;
    }
    return false;
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
    const hash = getNormalizedHash();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${hash}`,
    );
  }

  /**
   * Shift a rotation position by `positionShift`, wrapping within the cycle.
   * Used when migrating state saved against `old_base_date`.
   */
  function calculateNewPosition(
    currentStartNumber,
    positionShift,
    rotationCycleLength,
  ) {
    if (!currentStartNumber || !positionShift || !rotationCycleLength) {
      return null;
    }

    let newPosition = currentStartNumber + positionShift;
    if (newPosition > rotationCycleLength) {
      newPosition = newPosition - rotationCycleLength;
    }
    return newPosition;
  }

  return {
    hasLegacyUrlParams,
    readLegacyUrlParams,
    clearUrl,
    calculateNewPosition,
  };
}
