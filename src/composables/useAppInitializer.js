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
 * Resolve a single config.schedules entry's `data` into one or more in-epoch
 * data segments (`[{ from, dataKey }]`, ascending by `from`).
 *
 * - string / omitted → a single segment anchored at the epoch's `from`.
 *   Omitted inherits the previous epoch's last segment (position-shift migration).
 * - array → the `schedule_update`-equivalent in-epoch table swap. The first
 *   segment is forced to the epoch's `from`; subsequent ones carry their own
 *   `from`. All segments must share the same rotationCycleLength.
 *
 * @param {Object} entry - raw config.schedules entry
 * @param {number} index - position in config.schedules
 * @param {import('dayjs').Dayjs} epochFrom - the epoch's validated `from`
 * @param {Array} resolvedEpochs - already-resolved epochs (for inheritance)
 * @param {Object} scheduleData - consolidated bundle keyed by folder name
 * @returns {Array<{from: import('dayjs').Dayjs, dataKey: string}>}
 */
function resolveSegments(
  entry,
  index,
  epochFrom,
  resolvedEpochs,
  scheduleData,
) {
  const raw = entry?.data;

  // 配列形: epoch 内データ切替（同一アンカー・回転連続）
  if (Array.isArray(raw)) {
    if (raw.length === 0) {
      throw new Error(`config.schedules[${index}] の data 配列が空です`);
    }
    const segments = raw.map((seg, si) => {
      const dataKey = seg?.data;
      if (typeof dataKey !== "string" || !dataKey) {
        throw new Error(
          `config.schedules[${index}].data[${si}] には data（CSV フォルダ名）が必要です`,
        );
      }
      if (!scheduleData[dataKey]) {
        throw new Error(
          `config.schedules が参照するデータフォルダが見つかりません: ${dataKey}`,
        );
      }
      // 先頭セグメントは世代の from に固定（後続は自前の from）
      let segFrom = epochFrom;
      if (si > 0) {
        segFrom = createDate(seg?.from);
        if (!segFrom.isValid()) {
          throw new Error(
            `config.schedules[${index}].data[${si}] の from が不正です: ${seg?.from}`,
          );
        }
      }
      return { from: segFrom, dataKey };
    });

    // セグメント from の昇順（重複も不可）
    for (let i = 1; i < segments.length; i += 1) {
      if (!segments[i].from.isAfter(segments[i - 1].from, "day")) {
        throw new Error(
          `config.schedules[${index}] の data セグメント from は昇順である必要があります`,
        );
      }
    }

    // 回転位相を維持するため、全セグメントが同一サイクル長であること
    const cycle0 = scheduleData[segments[0].dataKey]?.rotationCycleLength;
    for (const seg of segments) {
      const cycle = scheduleData[seg.dataKey]?.rotationCycleLength;
      if (cycle !== cycle0) {
        throw new Error(
          `config.schedules[${index}] の data セグメントはサイクル長が一致する必要があります` +
            `（${segments[0].dataKey}=${cycle0}, ${seg.dataKey}=${cycle}）。` +
            `epoch 内データ切替は回転位相を維持するため同一サイクル長が必須です。`,
        );
      }
    }
    return segments;
  }

  // 文字列 or 省略: 単一セグメント（従来どおり）
  let dataKey = raw;
  if (!dataKey) {
    if (index === 0) {
      throw new Error(
        "config.schedules の先頭世代は data（CSV フォルダ名）の指定が必須です",
      );
    }
    // 直前の解決済み世代の最後のセグメントから継承
    const prev = resolvedEpochs[index - 1];
    dataKey = prev?.segments[prev.segments.length - 1]?.dataKey;
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
  return [{ from: epochFrom, dataKey }];
}

/**
 * Build the sorted epoch list from config.schedules and validate it against
 * the loaded schedule data bundle.
 *
 * 正規化のルール:
 * - `data` 省略時は直前の世代の `data` を継承する（コマ位置シフトのみの移行を
 *   `{ from }` だけで書けるようにするため）。先頭世代の `data` 省略はエラー。
 * - `data` は文字列（単一フォルダ）か、`[{ data }, { from, data }, …]` の配列。
 *   配列形は「同一世代（同一アンカー・同一表示窓）の途中でデータ表だけを差し替える」
 *   旧 `schedule_update` 相当の移行を表す。回転位相を維持するため、各セグメントは
 *   同一 `rotationCycleLength` でなければならない（違反は throw）。先頭セグメントは
 *   世代の `from` に固定され、後続セグメントの `from` は昇順かつ世代の窓内に収まること。
 *   正規化結果の各世代は `segments`（`[{ from, dataKey }]`）を持ち、`dataKey` は
 *   先頭セグメント＝日付に依らない用途（サイクル長・コマ数）の代表値。
 * - `from` は昇順かつ重複が無いこと（違反は throw）。config 上の順序は信用するが、
 *   ソートで黙って吸収はしない — typo を検知するため。
 * - コマシフト移行（`data` が前世代と同一）なのに世代間の `from` 日数差が
 *   サイクル長の倍数でない場合は warn（typo の可能性大）。
 * - `from` が今日から ±FROM_SANITY_YEARS 年を超える場合は warn。
 *
 * @param {Object} config - application configuration
 * @param {Object} scheduleData - consolidated bundle keyed by folder name
 * @returns {Array<{from: import('dayjs').Dayjs, dataKey: string, segments: Array<{from: import('dayjs').Dayjs, dataKey: string}>}>}
 */
export function buildEpochs(config, scheduleData) {
  if (!Array.isArray(config.schedules) || config.schedules.length === 0) {
    throw new Error(
      "config.schedules は { from, data } を要素とする非空配列である必要があります",
    );
  }

  // config 上の順序のまま正規化する（昇順検証のためソートしない）
  const epochs = [];
  for (let index = 0; index < config.schedules.length; index += 1) {
    const entry = config.schedules[index];
    const from = createDate(entry?.from);
    if (!from.isValid()) {
      throw new Error(`config.schedules の from が不正です: ${entry?.from}`);
    }

    const segments = resolveSegments(entry, index, from, epochs, scheduleData);
    // 代表 dataKey = 先頭セグメント（日付に依らない用途で使う）
    epochs.push({ from, dataKey: segments[0].dataKey, segments });
  }

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

  // in-epoch セグメントは次世代の from より前に収まること
  // （世代 from の昇順・重複を確定させた後に検証する）
  for (let i = 0; i < epochs.length; i += 1) {
    const nextFrom = epochs[i + 1]?.from;
    if (!nextFrom) continue;
    for (const seg of epochs[i].segments) {
      if (!seg.from.isBefore(nextFrom, "day")) {
        throw new Error(
          `config.schedules[${i}] の data セグメント ${seg.from.format(
            "YYYY-MM-DD",
          )} が次世代の from ${nextFrom.format("YYYY-MM-DD")} 以降です`,
        );
      }
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
