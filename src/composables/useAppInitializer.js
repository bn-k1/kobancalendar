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
 */
export function useAppInitializer() {
  const isLoaded = ref(false);

  const { setEventConfig, setICSExportConfig } = useCalendar();
  const { loadScheduleData, setDefaultBaseDate, setNextBaseDate } =
    useSchedule();

  const { setHolidayYearsRange, setUserDefinedHolidays, loadHolidays } =
    useHolidays();

  /**
   * Initialize the application with configuration data
   */
  async function initializeApp(data) {
    const {
      defaultHolidayData,
      defaultSaturdayData,
      defaultWeekdayData,
      nextHolidayData,
      nextSaturdayData,
      nextWeekdayData,
      config,
      eventConfig,
    } = data;

    try {
      // Holiday configuration
      setHolidayYearsRange(APP_CONFIG.DEFAULT_HOLIDAY_YEARS);
      setUserDefinedHolidays(config.custom_holidays || []);
      loadHolidays();

      // Calendar configuration
      setEventConfig(eventConfig);
      setICSExportConfig(config.info);

      // Load schedule data:
      const scheduleData = loadScheduleData(
        {
          holiday: defaultHolidayData,
          saturday: defaultSaturdayData,
          weekday: defaultWeekdayData,
        },
        {
          holiday: nextHolidayData,
          saturday: nextSaturdayData,
          weekday: nextWeekdayData,
        },
      );

      // Process base dates
      const defaultBaseDateObj = createDate(config.default_base_date);
      setDefaultBaseDate(defaultBaseDateObj);

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
