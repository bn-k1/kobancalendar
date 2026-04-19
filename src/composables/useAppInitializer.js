// src/composables/useAppInitializer.js
import { ref } from "vue";
import { useCalendar } from "./useCalendar";
import { useSchedule } from "./useSchedule";
import { useHolidays } from "./useHolidays";
import { createDate } from "@/utils/date";
import { APP_CONFIG } from "@/utils/constants";

/**
 * Shared application initialization logic
 * Centralized the setup code used by both views
 */
export function useAppInitializer() {
  const isLoaded = ref(false);

  const { setEventConfig } = useCalendar();
  const {
    loadScheduleData,
    setDefaultBaseDate,
    setNextBaseDate,
    setScheduleUpdateDate
  } = useSchedule();

  const { setHolidayYearsRange, setUserDefinedHolidays, loadHolidays } =
    useHolidays();

  /**
   * next_base_date と schedule_update は運用モードが異なるため同時指定は不可
   */
  function validateConfig(config) {
    if (config.next_base_date && config.schedule_update) {
      throw new Error(
        "config.next_base_date と config.schedule_update は同時に指定できません",
      );
    }
  }

  /**
   * Initialize the application with configuration data
   * @param {Object} data - Application data object
   * @param {Object} data.defaultScheduleData - Default schedule data from consolidated JSON
   * @param {Object} data.nextScheduleData - Next schedule data from consolidated JSON
   * @param {Object} data.config - Application configuration
   * @param {Object} data.eventConfig - Event configuration
   */
  async function initializeApp(data) {
    const { defaultScheduleData, nextScheduleData, config, eventConfig } = data;

    validateConfig(config);

    // Holiday configuration
    setHolidayYearsRange(APP_CONFIG.DEFAULT_HOLIDAY_YEARS);
    setUserDefinedHolidays(config.custom_holidays || []);
    loadHolidays();

    // Calendar configuration
    setEventConfig(eventConfig);

    // Load schedule data from consolidated JSON format
    const scheduleData = loadScheduleData(
      defaultScheduleData,
      nextScheduleData,
    );

    // Process base dates
    const defaultBaseDateObj = createDate(config.default_base_date);
    setDefaultBaseDate(defaultBaseDateObj);

    // Set next base date only if configured; otherwise leave undefined
    if (config.next_base_date) {
      const nextBaseDateObj = createDate(config.next_base_date);
      setNextBaseDate(nextBaseDateObj);
    }

    // Set schedule update date if available
    if (config.schedule_update) {
      const scheduleUpdateDateObj = createDate(config.schedule_update);
      if (scheduleUpdateDateObj.isValid()) {
        setScheduleUpdateDate(scheduleUpdateDateObj);
      }
    }

    isLoaded.value = true;

    return {
      scheduleData,
      defaultBaseDate: defaultBaseDateObj,
    };
  }

  return {
    isLoaded,
    initializeApp,
  };
}
