// src/composables/useAppInitializer.js
import { ref } from "vue";
import { useCalendar } from "./useCalendar";
import { useSchedule } from "./useSchedule";
import { useHolidays } from "./useHolidays";
import { createDate } from "@/utils/date";
import { APP_CONFIG } from "@/utils/constants";

/**
 * Turn the build-resolved epochs from data/scheduleData.json into dayjs form.
 * Validation already happened in scripts/convertCsv.js.
 */
export function buildEpochs(rawEpochs) {
  return rawEpochs.map(({ from, segments }) => ({
    from: createDate(from),
    dataKey: segments[0].data,
    segments: segments.map((seg) => ({
      from: createDate(seg.from),
      dataKey: seg.data,
    })),
  }));
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
   * @param {Object} data.scheduleData - data/scheduleData.json ({ epochs, data })
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
    const activeScheduleData = loadSchedule(
      buildEpochs(scheduleData.epochs),
      scheduleData.data,
    );

    isLoaded.value = true;

    return { activeScheduleData };
  }

  return {
    isLoaded,
    initializeApp,
  };
}
