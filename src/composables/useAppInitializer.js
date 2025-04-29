// src/composables/useAppInitializer.js
import { ref } from "vue";
import { useCalendar } from "./useCalendar";
import { useSchedule } from "./useSchedule";
import { useHolidays } from "./useHolidays";
import { createDate } from "@/utils/date";
import { APP_CONFIG, ERROR_MESSAGES } from "@/utils/constants";

/**
 * Shared application initialization logic
 * Centralizes the setup code used by both views
 */
export function useAppInitializer() {
  const isLoaded = ref(false);

  const { setEventConfig, setICSExportConfig } = useCalendar();
  const {
    loadScheduleData,
    setBaseDates,
    setLastBaseDate,
    updateCurrentBaseDate,
  } = useSchedule();

  const { setHolidayYearsRange, setUserDefinedHolidays, loadHolidays } =
    useHolidays();

  /**
   * Initialize the application with configuration data
   */
  async function initializeApp(data) {
    const { holidayData, saturdayData, weekdayData, config, eventConfig } =
      data;

    try {
      // Holiday configuration
      setHolidayYearsRange(APP_CONFIG.DEFAULT_HOLIDAY_YEARS);
      setUserDefinedHolidays(config.custom_holidays || []);
      loadHolidays();

      // Calendar configuration
      setEventConfig(eventConfig);
      setICSExportConfig(config.info);

      // Load schedule data
      const scheduleData = loadScheduleData(
        holidayData,
        saturdayData,
        weekdayData,
      );

      // Process base dates
      const configBaseDates = config.base_dates
        .map((dateStr) => createDate(dateStr))
        .sort((a, b) => a.unix() - b.unix());

      setBaseDates(configBaseDates);
      setLastBaseDate(configBaseDates[configBaseDates.length - 1]);

      isLoaded.value = true;

      return {
        scheduleData,
        baseDates: configBaseDates,
      };
    } catch (error) {
      console.error(ERROR_MESSAGES.INIT_FAILED, error);
      return false;
    }
  }

  /**
   * Set the current base date
   */
  function setCurrentBaseDate(baseDate, availableDates) {
    const validBaseDate =
      availableDates.find((date) =>
        createDate(date).isSame(createDate(baseDate), "day"),
      ) || availableDates[0];

    updateCurrentBaseDate(validBaseDate);
    return validBaseDate;
  }

  return {
    isLoaded,
    initializeApp,
    setCurrentBaseDate,
  };
}
