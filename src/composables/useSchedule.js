// src/composables/useSchedule.js
import { computed } from "vue";
import { useScheduleStore } from "@/stores/schedule";
import { useHolidays } from "@/composables/useHolidays";
import { ERROR_MESSAGES } from "@/utils/constants";
import {
  createDate,
  formatAsISODate,
  isBefore,
  addDays,
  today,
  isSameDay,
  isSameOrAfter,
} from "@/utils/date";

const EMPTY_SCHEDULE_DATA = {
  holiday: [],
  saturday: [],
  weekday: [],
  rotationCycleLength: 0,
};

/**
 * Schedule management composable.
 *
 * The schedule is an append-only list of *epochs* (`{ from, dataKey, segments }`).
 * The epoch the user is viewing is the "active" epoch; it determines the
 * calculation anchor, the visible date window `[from, nextEpoch.from)` and which
 * folder of shift-table data is used. An epoch may carry multiple `segments`
 * (`schedule_update` equivalent): the rotation anchor (`from`) stays fixed while
 * the looked-up data table swaps on a date inside the window. The "current" epoch is the latest epoch whose `from`
 * is on or before today — it is the default selection, and `defaultBaseDate` /
 * `nextBaseDate` below expose it (and its successor) under the names the views
 * historically used.
 */
export function useSchedule() {
  const scheduleStore = useScheduleStore();
  const { isHoliday } = useHolidays();

  const storeEpochs = computed(() => scheduleStore.epochs);
  const storeScheduleData = computed(() => scheduleStore.scheduleData);
  const storeActiveEpochIndex = computed(() => scheduleStore.activeEpochIndex);

  /** Schedule data for a given epoch (empty placeholder when absent). */
  function dataForEpoch(epoch) {
    if (!epoch) return EMPTY_SCHEDULE_DATA;
    return storeScheduleData.value[epoch.dataKey] || EMPTY_SCHEDULE_DATA;
  }

  /**
   * Schedule data for an epoch *at a specific date*. When an epoch declares
   * multiple in-epoch data segments (the `schedule_update` case — one rotation
   * anchor, the table swaps on a date), the segment in effect on `target` wins.
   * Single-segment epochs — and hand-built `{ from, dataKey }` epochs without a
   * `segments` array — fall back to the representative data.
   */
  function dataForEpochAtDate(epoch, target) {
    if (!epoch) return EMPTY_SCHEDULE_DATA;
    const segments = epoch.segments;
    if (!Array.isArray(segments) || segments.length <= 1) {
      return dataForEpoch(epoch);
    }
    const dateStr = formatAsISODate(target);
    let chosen = segments[0];
    for (const seg of segments) {
      if (dateStr >= formatAsISODate(seg.from)) chosen = seg;
      else break;
    }
    return storeScheduleData.value[chosen.dataKey] || EMPTY_SCHEDULE_DATA;
  }

  const activeEpoch = computed(
    () => storeEpochs.value[storeActiveEpochIndex.value] || null,
  );

  const activeScheduleData = computed(() => dataForEpoch(activeEpoch.value));

  /** The active epoch's anchor date. */
  const activeBaseDate = computed(() => activeEpoch.value?.from);

  /**
   * Index of the "current" epoch — the latest epoch whose `from` is on or
   * before today. Falls back to the first epoch when today predates all of them.
   */
  function currentEpochIndex() {
    const epochs = storeEpochs.value;
    const todayDate = today();
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

  // The current epoch (default selection / "旧版" toggle target) and its
  // immediate successor (the "新版" toggle target), exposed under legacy names.
  const defaultBaseDate = computed(
    () => storeEpochs.value[currentEpochIndex()]?.from,
  );
  const nextBaseDate = computed(
    () => storeEpochs.value[currentEpochIndex() + 1]?.from,
  );

  /**
   * Calculate the rotation shift index for a given date.
   * @param {dayjs} targetDate
   * @param {number} startPosition - 1-based position in the rotation
   * @param {dayjs} baseDate - anchor date for the calculation
   * @param {Object} scheduleData - schedule data providing rotationCycleLength
   * @returns {number} shift index (0-based)
   */
  function calculateShiftIndex(
    targetDate,
    startPosition,
    baseDate,
    scheduleData,
  ) {
    const target = createDate(targetDate);
    const base = createDate(baseDate);
    const daysDifference = target.diff(base, "day");
    const adjustedStartPosition = startPosition - 1;
    const cycleLength = scheduleData.rotationCycleLength;

    return (
      (((adjustedStartPosition + daysDifference) % cycleLength) + cycleLength) %
      cycleLength
    );
  }

  /**
   * Get the schedule for a specific date, evaluated against the active epoch.
   * Dates outside the active epoch's window `[from, nextEpoch.from)` return
   * undefined.
   * @param {dayjs} targetDate
   * @param {number} startPosition
   * @returns {Object|undefined}
   */
  function getScheduleForDate(targetDate, startPosition) {
    const epoch = activeEpoch.value;
    if (!epoch) return undefined;

    const target = createDate(targetDate);
    const dateStr = formatAsISODate(target);

    // Lower bound: the active epoch's anchor date.
    if (dateStr < formatAsISODate(epoch.from)) return undefined;

    // Upper bound: the next epoch's anchor date (exclusive), when there is one.
    const following = storeEpochs.value[storeActiveEpochIndex.value + 1];
    if (following && dateStr >= formatAsISODate(following.from)) {
      return undefined;
    }

    const scheduleData = dataForEpochAtDate(epoch, target);
    const isHolidayFlag = isHoliday(target);
    const isSaturday = target.day() === 6;

    const shiftIndex = calculateShiftIndex(
      target,
      startPosition,
      epoch.from,
      scheduleData,
    );

    let shiftData;
    if (isHolidayFlag) {
      shiftData = scheduleData.holiday[shiftIndex];
    } else if (isSaturday) {
      shiftData = scheduleData.saturday[shiftIndex];
    } else {
      shiftData = scheduleData.weekday[shiftIndex];
    }

    if (!shiftData) return undefined;

    return {
      dateStr,
      subject: shiftData.s,
      startTime: shiftData.sT || "",
      endTime: shiftData.eT || "",
      isHoliday: isHolidayFlag,
      isSaturday,
      shiftIndex,
    };
  }

  /**
   * Calculate the schedule for a date range (endDate exclusive).
   * @param {dayjs} startDate
   * @param {dayjs} endDate
   * @param {number} startPosition
   * @returns {Array}
   */
  function calculateScheduleRange(startDate, endDate, startPosition) {
    const scheduleRange = [];
    let currentDate = createDate(startDate);
    const finalEndDate = createDate(endDate);

    while (isBefore(currentDate, finalEndDate)) {
      const scheduleInfo = getScheduleForDate(currentDate, startPosition);

      if (scheduleInfo) {
        scheduleRange.push({
          date: currentDate,
          ...scheduleInfo,
        });
      }

      currentDate = addDays(currentDate, 1);
    }

    return scheduleRange;
  }

  /**
   * Load the epoch timeline and schedule data into the store. The active epoch
   * defaults to the current epoch (latest `from` on or before today).
   * @param {Array<{from: dayjs, dataKey: string}>} epochs
   * @param {Object} scheduleData - consolidated bundle keyed by folder name
   * @returns {Object} the active epoch's schedule data
   */
  function loadSchedule(epochs, scheduleData) {
    try {
      scheduleStore.setScheduleData(scheduleData);
      scheduleStore.setEpochs(epochs);
      scheduleStore.setActiveEpochIndex(currentEpochIndex());
      return activeScheduleData.value;
    } catch (error) {
      console.error(ERROR_MESSAGES.SCHEDULE_DATA_ERROR, error);
      throw error;
    }
  }

  /**
   * Switch the active epoch to the one anchored at the given date.
   * Unknown dates are ignored (the active epoch is left unchanged).
   * @param {dayjs|string|Date} date
   */
  function updateActiveBaseDate(date) {
    const target = createDate(date);
    if (!target.isValid()) return;
    const index = storeEpochs.value.findIndex((epoch) =>
      isSameDay(epoch.from, target),
    );
    if (index !== -1) {
      scheduleStore.setActiveEpochIndex(index);
    }
  }

  return {
    // Reactive state
    epochs: storeEpochs,
    activeScheduleData,
    activeBaseDate,
    defaultBaseDate,
    nextBaseDate,
    isDataLoaded: computed(
      () => activeScheduleData.value.rotationCycleLength > 0,
    ),
    rotationCycleLength: computed(
      () => activeScheduleData.value.rotationCycleLength,
    ),

    // Business logic
    calculateShiftIndex,
    getScheduleForDate,
    calculateScheduleRange,
    loadSchedule,
    updateActiveBaseDate,
  };
}
