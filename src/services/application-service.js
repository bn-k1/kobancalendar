// src/services/application-service.js
import dayjs from "dayjs";
import { useScheduleStore } from "@/stores/schedule";
import { useHolidayStore } from "@/stores/holiday";
import { useCalendarStore } from "@/stores/calendar";
import { ERROR_MESSAGES , DATE_FORMATS } from "@/config/constants";

/**
 * アプリケーション初期化サービス
 * 両方のビュー（HomeView と MeetupView）で共通する初期化処理を提供
 */
export async function initializeApplication(configData, eventConfigData, holidayData, saturdayData, weekdayData) {
  try {
    const scheduleStore = useScheduleStore();
    const holidayStore = useHolidayStore();
    const calendarStore = useCalendarStore();
    
    // 基準日の設定
    const configBaseDates = configData.base_dates
      .map((dateStr) => dayjs(dateStr))
      .sort((a, b) => a.unix() - b.unix());
    scheduleStore.setBaseDates(configBaseDates);
    
    // 最後の基準日を設定
    scheduleStore.setLastBaseDate(configBaseDates[configBaseDates.length - 1]);
    
    // 祝日設定
    holidayStore.setHolidayYearsRange(configData.holiday_years_range || 5);
    holidayStore.setUserDefinedHolidays(configData.custom_holidays || []);
    
    // ICSエクスポート設定
    calendarStore.setICSExportConfig(configData.info);
    
    // イベント設定
    calendarStore.setEventConfig(eventConfigData);
    
    // スケジュールデータの読み込み
    const data = scheduleStore.loadScheduleData(
      holidayData,
      saturdayData,
      weekdayData
    );
    
    // 祝日データの読み込み
    holidayStore.loadHolidays();
    
    return {
      success: true,
      data: {
        baseDates: configBaseDates,
        scheduleData: data
      }
    };
  } catch (error) {
    console.error(ERROR_MESSAGES.INIT_FAILED, error);
  }
}

/**
 * URLパラメータや設定に基づいて現在の基準日を設定
 */
export function setCurrentBaseDate(baseDate, baseDates) {
  const scheduleStore = useScheduleStore();
  
  try {
    const validBaseDate = baseDates.find(
      date => date.format(DATE_FORMATS.ISO_DATE) === baseDate?.format(DATE_FORMATS.ISO_DATE)
    ) || baseDates[0];
    
    scheduleStore.updateCurrentBaseDate(validBaseDate);
    return validBaseDate;
  } catch (error) {
    console.error(ERROR_MESSAGES.BASEDATE_CONFIGURATION_ERROR, error);
    return baseDates[0];
  }
}
