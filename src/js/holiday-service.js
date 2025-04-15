// holiday-service.js - 祝日関連の機能を提供するモジュール
import Alpine from "alpinejs";
import dayjs from "dayjs";
import JapaneseHolidays from "japanese-holidays";
import { handleError } from "./utils.js";
import { ERROR_MESSAGES, DATE_FORMATS, CUSTOM_HOLIDAY } from "./constants.js";

// 祝日データの取得（japanese-holidaysを使用）
export function loadHolidays() {
  try {
    // storeから必要な値を取得
    const store = Alpine.store("state");
    const holidayYearsRange = store.holidayYearsRange;
    const userDefinedHolidays = store.userDefinedHolidays;

    const allHolidays = fetchHolidays(holidayYearsRange, userDefinedHolidays);

    // ストアに祝日データを設定
    store.setHolidays(allHolidays);
    return allHolidays;
  } catch (error) {
    return handleError(error, ERROR_MESSAGES.HOLIDAYS_LOAD_ERROR, false);
  }
}

// 指定された年範囲の祝日を取得
export function fetchHolidays(holidayYearsRange, userDefinedHolidays) {
  const currentYear = dayjs().year();
  const allHolidays = {};

  // 法定祝日を取得
  for (
    let year = currentYear - holidayYearsRange;
    year <= currentYear + holidayYearsRange;
    year++
  ) {
    const holidays = JapaneseHolidays.getHolidaysOf(year);
    holidays.forEach((holiday) => {
      const dateObj = dayjs(
        `${year}-${String(holiday.month).padStart(2, "0")}-${String(
          holiday.date,
        ).padStart(2, "0")}`,
      );
      const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
      allHolidays[dateStr] = holiday.name;
    });
  }

  // ユーザー定義の祝日を追加
  if (userDefinedHolidays && userDefinedHolidays.length > 0) {
    addUserDefinedHolidays(
      allHolidays,
      userDefinedHolidays,
      currentYear,
      holidayYearsRange,
    );
  }

  return allHolidays;
}

// ユーザー定義の祝日を祝日リストに追加
export function addUserDefinedHolidays(
  allHolidays,
  userDefinedHolidays,
  currentYear,
  holidayYearsRange,
) {
  userDefinedHolidays.forEach((date) => {
    let [month, day] = date.split("-");
    for (
      let year = currentYear - holidayYearsRange;
      year <= currentYear + holidayYearsRange;
      year++
    ) {
      let formattedDate = `${year}-${month}-${day}`;
      if (allHolidays[formattedDate] === undefined) {
        allHolidays[formattedDate] = CUSTOM_HOLIDAY;
      }
    }
  });
}

// 日付が祝日かどうかをチェック
export function isHoliday(date, holidays) {
  const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
  const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
  return holidays[dateStr] !== undefined || dateObj.day() === 0;
}

// 祝日名を取得
export function getHolidayName(date, holidays) {
  const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
  const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
  return holidays[dateStr];
}
