// src/composables/useAppInitializer.js
import { ref } from "vue";
import { useCalendar } from "./useCalendar";
import { useSchedule } from "./useSchedule";
import { useHolidays } from "./useHolidays";
import { createDate, today } from "@/utils/date";
import { APP_CONFIG } from "@/utils/constants";

// from が極端な未来/過去だと typo を疑う閾値（年）
const FROM_SANITY_YEARS = 10;

/**
 * Build the sorted epoch list from config.schedules and validate it against
 * the loaded schedule data bundle.
 *
 * 正規化のルール:
 * - `data` 省略時は直前の世代の `data` を継承する（コマ位置シフトのみの移行を
 *   `{ from }` だけで書けるようにするため）。先頭世代の `data` 省略はエラー。
 * - `from` は昇順かつ重複が無いこと（違反は throw）。config 上の順序は信用するが、
 *   ソートで黙って吸収はしない — typo を検知するため。
 * - コマシフト移行（`data` が前世代と同一）なのに世代間の `from` 日数差が
 *   サイクル長の倍数でない場合は warn（typo の可能性大）。
 * - `from` が今日から ±FROM_SANITY_YEARS 年を超える場合は warn。
 *
 * @param {Object} config - application configuration
 * @param {Object} scheduleData - consolidated bundle keyed by folder name
 * @returns {Array<{from: import('dayjs').Dayjs, dataKey: string}>}
 */
export function buildEpochs(config, scheduleData) {
  if (!Array.isArray(config.schedules) || config.schedules.length === 0) {
    throw new Error(
      "config.schedules は { from, data } を要素とする非空配列である必要があります",
    );
  }

  // config 上の順序のまま正規化する（昇順検証のためソートしない）
  const epochs = config.schedules.map((entry, index) => {
    const from = createDate(entry.from);
    if (!from.isValid()) {
      throw new Error(`config.schedules の from が不正です: ${entry?.from}`);
    }

    // data 省略時は直前の世代から継承（先頭は省略不可）
    let dataKey = entry?.data;
    if (!dataKey) {
      if (index === 0) {
        throw new Error(
          "config.schedules の先頭世代は data（CSV フォルダ名）の指定が必須です",
        );
      }
      dataKey = config.schedules[index - 1]?.data;
      // 直前も省略だった場合は遡って解決する
      for (let i = index - 1; i >= 0 && !dataKey; i -= 1) {
        dataKey = config.schedules[i]?.data;
      }
      if (!dataKey) {
        throw new Error(
          `config.schedules[${index}] の data を継承できません（先行する世代に data がありません）`,
        );
      }
    }

    if (!scheduleData[dataKey]) {
      throw new Error(
        `config.schedules が参照するデータフォルダが見つかりません: ${dataKey}`,
      );
    }
    return { from, dataKey };
  });

  // from の昇順・重複検証（sort で黙って吸収しない）
  for (let i = 1; i < epochs.length; i += 1) {
    const prev = epochs[i - 1].from;
    const curr = epochs[i].from;
    if (curr.isSame(prev, "day")) {
      throw new Error(
        `config.schedules の from が重複しています: ${curr.format("YYYY-MM-DD")}`,
      );
    }
    if (curr.isBefore(prev, "day")) {
      throw new Error(
        `config.schedules の from は昇順である必要があります: ${prev.format(
          "YYYY-MM-DD",
        )} の後に ${curr.format("YYYY-MM-DD")} が来ています`,
      );
    }
  }

  // コマシフト移行（data 継承＝前世代と同一）なのに日数差がサイクル長の倍数でない
  for (let i = 1; i < epochs.length; i += 1) {
    const prev = epochs[i - 1];
    const curr = epochs[i];
    if (prev.dataKey !== curr.dataKey) continue;
    const cycleLength = scheduleData[curr.dataKey]?.rotationCycleLength;
    if (!cycleLength) continue;
    const diff = curr.from.diff(prev.from, "day");
    if (diff % cycleLength !== 0) {
      console.warn(
        `[config.schedules] ${prev.from.format("YYYY-MM-DD")} → ` +
          `${curr.from.format("YYYY-MM-DD")} は同じデータ（${curr.dataKey}）を` +
          `指すコマシフト移行ですが、日数差 ${diff} がサイクル長 ${cycleLength} の` +
          `倍数ではありません。from の typo を疑ってください。`,
      );
    }
  }

  // from が極端な未来/過去なら warn
  const now = today();
  for (const epoch of epochs) {
    const yearsDiff = Math.abs(epoch.from.diff(now, "year", true));
    if (yearsDiff > FROM_SANITY_YEARS) {
      console.warn(
        `[config.schedules] from が今日から ${yearsDiff.toFixed(1)} 年離れています: ` +
          `${epoch.from.format("YYYY-MM-DD")}。typo を疑ってください。`,
      );
    }
  }

  return epochs;
}

/**
 * Shared application initialization logic.
 * Centralizes the setup code used by both views.
 */
export function useAppInitializer() {
  const isLoaded = ref(false);

  const { setEventConfig } = useCalendar();
  const { loadSchedule } = useSchedule();

  const { setHolidayYearsRange, setUserDefinedHolidays, loadHolidays } =
    useHolidays();

  /**
   * Initialize the application with configuration data.
   * @param {Object} data
   * @param {Object} data.scheduleData - consolidated bundle keyed by folder name
   * @param {Object} data.config - application configuration
   * @param {Object} data.eventConfig - event configuration
   */
  async function initializeApp(data) {
    const { scheduleData, config, eventConfig } = data;

    // Holiday configuration
    setHolidayYearsRange(APP_CONFIG.DEFAULT_HOLIDAY_YEARS);
    setUserDefinedHolidays(config.custom_holidays || []);
    loadHolidays();

    // Calendar configuration
    setEventConfig(eventConfig);

    // Build + load the epoch timeline
    const epochs = buildEpochs(config, scheduleData);
    const activeScheduleData = loadSchedule(epochs, scheduleData);

    isLoaded.value = true;

    return { activeScheduleData };
  }

  return {
    isLoaded,
    initializeApp,
  };
}
