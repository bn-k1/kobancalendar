// src/composables/useAppInitializer.js
import { ref } from "vue";
import { useCalendar } from "./useCalendar";
import { useSchedule } from "./useSchedule";
import { useHolidays } from "./useHolidays";
import { createDate } from "@/utils/date";
import { APP_CONFIG, ERROR_MESSAGES } from "@/utils/constants";

/**
 * Shared application initialization logic
 * Centralized the setup code used by both views
 * Updated to work with consolidated JSON format
 */
export function useAppInitializer() {
  const isLoaded = ref(false);

  const { setEventConfig } = useCalendar();
  const {
    loadScheduleData,
    setDefaultBaseDate,
    setNextBaseDate,
    setScheduleUpdateDate,
  } = useSchedule();

  const { setHolidayYearsRange, setUserDefinedHolidays, loadHolidays } =
    useHolidays();

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

    try {
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

      if (config.schedule_update) {
        setScheduleUpdateDate(createDate(config.schedule_update));
      }

      // Set next base date if available
      if (config.next_base_date) {
        const nextBaseDateObj = createDate(config.next_base_date);
        setNextBaseDate(nextBaseDateObj);
      } else {
        // If no next_base_date, use default_base_date
        setNextBaseDate([]);
      }

      isLoaded.value = true;

      return {
        scheduleData,
        defaultBaseDate: defaultBaseDateObj,
      };
    } catch (error) {
      console.error(ERROR_MESSAGES.INIT_FAILED, error);
      return false;
    }
  }

  return {
    isLoaded,
    initializeApp,
  };
}
