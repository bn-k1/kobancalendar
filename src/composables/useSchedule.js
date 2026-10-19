// src/composables/useSchedule.js
import { computed } from "vue";
import { useScheduleStore } from "@/stores/schedule";
import { useHolidays } from "@/composables/useHolidays";
import {
  createDate,
  formatAsISODate,
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

// Every URL without `b=` was made while 2026-05-16 was the only generation.
const PRE_B_LINK_BASE_DATE = "2026-05-16";

/**
 * Epoch-based schedule lookup. See CLAUDE.md for the active/current epoch
 * distinction; `defaultBaseDate` / `nextBaseDate` are the current epoch and
 * its successor under the names the views historically used.
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

  /** Schedule data for an epoch on `target`: the in-epoch segment in effect then. */
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

  // `activeScheduleData` is the first segment (fine for rotationCycleLength,
  // which segments share); read subject/time tables through these instead.
  const activeScheduleDataForToday = computed(() =>
    dataForEpochAtDate(activeEpoch.value, today()),
  );

  function scheduleDataForDate(date) {
    return dataForEpochAtDate(activeEpoch.value, createDate(date));
  }

  /** Start of the active epoch's latest in-epoch table swap, or null. */
  const activeTableSwapDate = computed(() => {
    const segments = activeEpoch.value?.segments;
    return segments?.length > 1 ? segments[segments.length - 1].from : null;
  });

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
   * The epoch a shared/bookmarked URL's positions belong to, from its `b=`
   * (the epoch's `from`). Only the current and next epochs can be opened;
   * anything else means the URL's コマ numbers are for a generation that is no
   * longer selectable, so they must be ignored rather than reinterpreted.
   * URLs from before `b=` existed belong to PRE_B_LINK_BASE_DATE and are
   * honoured while that generation is still current or next.
   * @param {string|null} baseDateStr
   * @returns {dayjs|null}
   */
  function resolveLinkedBaseDate(baseDateStr) {
    const target = createDate(baseDateStr ?? PRE_B_LINK_BASE_DATE);
    if (!target.isValid()) return null;
    return (
      [defaultBaseDate.value, nextBaseDate.value].find(
        (d) => d && isSameDay(d, target),
      ) ?? null
    );
  }

  /** `from` of the epoch after the given one (its window's exclusive end). */
  function epochEndFor(baseDate) {
    const index = storeEpochs.value.findIndex((e) =>
      isSameDay(e.from, baseDate),
    );
    return index === -1 ? undefined : storeEpochs.value[index + 1]?.from;
  }

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
      console.error("スケジュールデータの読み込みに失敗しました", error);
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
    activeScheduleDataForToday,
    scheduleDataForDate,
    activeBaseDate,
    activeTableSwapDate,
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
    resolveLinkedBaseDate,
    epochEndFor,
    loadSchedule,
    updateActiveBaseDate,
  };
}
