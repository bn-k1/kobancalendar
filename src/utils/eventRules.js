// src/utils/eventRules.js
// Rule matching for config/event.json's ordered rule-array schema

/**
 * Find the first rule whose keywords appear in the subject. Rules are ordered;
 * first match wins. Returns null when nothing matches.
 */
export function matchRule(subject, eventConfig) {
  const rules = eventConfig?.rules;
  if (!Array.isArray(rules) || !subject) return null;
  return (
    rules.find((rule) =>
      (rule.keywords || []).some((keyword) => subject.includes(keyword)),
    ) ?? null
  );
}

/**
 * Resolve the display color for a schedule subject.
 */
export function resolveColor(subject, eventConfig) {
  const rule = matchRule(subject, eventConfig);
  return rule?.color ?? eventConfig?.fallback?.color;
}

/**
 * Times are the single source of truth for whether a title shows a time range.
 */
export function shouldShowTime(startTime, endTime) {
  return Boolean(startTime || endTime);
}

/**
 * True when the matched rule marks the whole day as free.
 */
export function isFreeAllDay(subject, eventConfig) {
  return matchRule(subject, eventConfig)?.freeAllDay === true;
}
