import { defineStore } from "pinia";
import { ref, computed } from "vue";
import dayjs from "dayjs";
import JapaneseHolidays from "japanese-holidays";
import { ERROR_MESSAGES, DATE_FORMATS, CUSTOM_HOLIDAY } from "@/config/constants";

export const useHolidayStore = defineStore("holiday", () => {
  // 状態
  const allHolidays = ref({});
  const holidayYearsRange = ref(5);
  const userDefinedHolidays = ref([]);

  // ゲッター
  const isHolidaysLoaded = computed(() => {
    return Object.keys(allHolidays.value).length > 0;
  });

  // アクション
  function setHolidays(holidays) {
    allHolidays.value = holidays;
  }

  function setHolidayYearsRange(range) {
    holidayYearsRange.value = range;
  }

  function setUserDefinedHolidays(holidays) {
    userDefinedHolidays.value = holidays;
  }

  // 祝日データを取得する関数
  function loadHolidays() {
    try {
      const holidays = fetchHolidays(
        holidayYearsRange.value,
        userDefinedHolidays.value,
      );
      setHolidays(holidays);
      return holidays;
    } catch (error) {
      console.error(ERROR_MESSAGES.HOLIDAYS_LOAD_ERROR, error);
      throw error;
    }
  }

  // 指定された年範囲の祝日を取得
  function fetchHolidays(yearsRange, customHolidays) {
    const currentYear = dayjs().year();
    const holidays = {};

    // 法定祝日を取得
    for (
      let year = currentYear - yearsRange;
      year <= currentYear + yearsRange;
      year++
    ) {
      const yearHolidays = JapaneseHolidays.getHolidaysOf(year);
      yearHolidays.forEach((holiday) => {
        const dateObj = dayjs(
          `${year}-${String(holiday.month).padStart(2, "0")}-${String(holiday.date).padStart(2, "0")}`,
        );
        const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
        holidays[dateStr] = holiday.name;
      });
    }

    // ユーザー定義の祝日を追加
    if (customHolidays && customHolidays.length > 0) {
      addUserDefinedHolidays(holidays, customHolidays, currentYear, yearsRange);
    }

    return holidays;
  }

  // ユーザー定義の祝日を祝日リストに追加
  function addUserDefinedHolidays(
    holidays,
    customHolidays,
    currentYear,
    yearsRange,
  ) {
    customHolidays.forEach((date) => {
      let [month, day] = date.split("-");
      for (
        let year = currentYear - yearsRange;
        year <= currentYear + yearsRange;
        year++
      ) {
        let formattedDate = `${year}-${month}-${day}`;
        if (holidays[formattedDate] === undefined) {
          holidays[formattedDate] = CUSTOM_HOLIDAY;
        }
      }
    });
  }

  // 日付が祝日かどうかを確認
  function isHoliday(date) {
    const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
    const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
    return allHolidays.value[dateStr] !== undefined || dateObj.day() === 0;
  }

  // 祝日名を取得
  function getHolidayName(date) {
    const dateObj = dayjs.isDayjs(date) ? date : dayjs(date);
    const dateStr = dateObj.format(DATE_FORMATS.ISO_DATE);
    return allHolidays.value[dateStr];
  }

  return {
    // 状態
    allHolidays,
    holidayYearsRange,
    userDefinedHolidays,

    // ゲッター
    isHolidaysLoaded,

    // アクション
    setHolidays,
    setHolidayYearsRange,
    setUserDefinedHolidays,

    // 関数
    loadHolidays,
    fetchHolidays,
    isHoliday,
    getHolidayName,
  };
});
