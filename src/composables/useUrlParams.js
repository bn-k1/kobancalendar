// Legacy URL support — the app persists state in localStorage, not URLs.
// Bookmarks from before that change may still carry ?baseDate=&startNumber=,
// so HomeView reads them once on mount and then clears the query string.

const LEGACY_PARAM_KEYS = ["baseDate", "startNumber"];

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
    const hash = window.location.hash && window.location.hash !== "#"
      ? window.location.hash
      : "#/";
    window.history.replaceState({}, "", `${window.location.pathname}${hash}`);
  }

  function calculateNewPosition(currentStartNumber, positionShift, rotationCycleLength) {
    if (!currentStartNumber || !positionShift || !rotationCycleLength) return null;
    const shifted = currentStartNumber + positionShift;
    return shifted > rotationCycleLength ? shifted - rotationCycleLength : shifted;
  }

  return {
    hasLegacyUrlParams,
    readLegacyUrlParams,
    clearUrl,
    calculateNewPosition,
  };
}
