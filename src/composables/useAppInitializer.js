// src/composables/useAppInitializer.js
import { ref } from "vue";
import { useCalendar } from "./useCalendar";
import { useSchedule } from "./useSchedule";
import { useHolidays } from "./useHolidays";
import { createDate } from "@/utils/date";
import { APP_CONFIG } from "@/utils/constants";

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
   * Build the sorted epoch list from config.schedules and validate it against
   * the loaded schedule data bundle.
   * @param {Object} config - application configuration
   * @param {Object} scheduleData - consolidated bundle keyed by folder name
   * @returns {Array<{from: import('dayjs').Dayjs, dataKey: string}>}
   */
  function buildEpochs(config, scheduleData) {
    if (!Array.isArray(config.schedules) || config.schedules.length === 0) {
      throw new Error(
        "config.schedules は { from, data } を要素とする非空配列である必要があります",
      );
    }

    const epochs = config.schedules.map((entry) => {
      const from = createDate(entry.from);
      if (!from.isValid()) {
        throw new Error(`config.schedules の from が不正です: ${entry?.from}`);
      }
      if (!entry.data || !scheduleData[entry.data]) {
        throw new Error(
          `config.schedules が参照するデータフォルダが見つかりません: ${entry?.data}`,
        );
      }
      return { from, dataKey: entry.data };
    });

    // config 上の順序は信用せず from 昇順で並べ替える
    epochs.sort((a, b) => a.from.valueOf() - b.from.valueOf());
    return epochs;
  }

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
