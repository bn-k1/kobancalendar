// src/utils/epochResolution.js
// Pure "which generation is live today" logic, factored out so the admin
// ScheduleManager.vue can agree with the runtime exactly. The source of truth
// is currentEpochIndex() inside src/composables/useSchedule.js — that version
// closes over the Pinia schedule store and today(), so it isn't reusable from
// a plain admin component without dragging store setup along. This module is
// the same algorithm parametrized over plain (epochs, todayDate) instead, so
// it has no store/Pinia dependency and can be imported directly.
import { isSameOrAfter, today } from "@/utils/date";

/**
 * Index of the "current" epoch — the latest epoch whose `from` is on or
 * before `todayDate`. Falls back to index 0 when `todayDate` predates every
 * epoch's `from` (never -1: an epoch is always serving the live site once the
 * list is non-empty, even if every epoch's `from` is in the future). Assumes
 * `epochs` is sorted ascending by `from`, matching the append-only invariant
 * the rest of the app enforces.
 *
 * @param {Array<{from: dayjs|string}>} epochs
 * @param {dayjs} [todayDate] - defaults to today()
 * @returns {number} 0 when `epochs` is empty too; callers with a possibly
 *   empty list must guard that case themselves since there is no valid index.
 */
export function currentEpochIndex(epochs, todayDate = today()) {
  let index = 0;
  for (let i = 0; i < epochs.length; i += 1) {
    if (isSameOrAfter(todayDate, epochs[i].from)) {
      index = i;
    } else {
      break;
    }
  }
  return index;
}
