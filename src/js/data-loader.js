// data-loader.js - データの読み込みを担当するモジュール

import dayjs from "dayjs";
import JapaneseHolidays from "japanese-holidays";
import { memoize } from "lodash";
import holidayData from "@data/holiday.csv";
import saturdayData from "@data/saturday.csv";
import weekdayData from "@data/weekday.csv";

let allHolidays = {};

// CSV形式のデータを処理する
function processCSVData(csvData) {
  return csvData.map((row) => row.join(","));
}

// 祝日データの取得（japanese-holidaysを使用）
async function loadHolidays(holidayYearsRange, userDefinedHolidays) {
  try {
    const currentYear = dayjs().year();
    allHolidays = {};

    // 指定された年範囲の祝日を取得
    for (
      let year = currentYear - holidayYearsRange;
      year <= currentYear + holidayYearsRange;
      year++
    ) {
      const holidays = JapaneseHolidays.getHolidaysOf(year);

      holidays.forEach((holiday) => {
        const dateObj = dayjs(holiday.date);
        const dateStr = dateObj.format("YYYY-MM-DD");
        allHolidays[dateStr] = holiday.name;
      });
    }

    // ユーザー定義の祝日を追加
    userDefinedHolidays.forEach((date) => {
      let [month, day] = date.split("/");
      for (
        let year = currentYear - holidayYearsRange;
        year <= currentYear + holidayYearsRange;
        year++
      ) {
        let formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        if (allHolidays[formattedDate] === undefined) {
          allHolidays[formattedDate] = "customholiday";
        }
      }
    });

    return allHolidays;
  } catch (error) {
    console.error("祝日データの取得に失敗しました:", error);
    return {};
  }
}

// スケジュールデータの読み込み
async function loadScheduleData() {
  try {
    // インポートしたCSVデータを処理
    const processedHolidayData = processCSVData(holidayData);
    const processedSaturdayData = processCSVData(saturdayData);
    const processedWeekdayData = processCSVData(weekdayData);

    const holidayLength = processedHolidayData.length;
    if (
      holidayLength !== processedSaturdayData.length ||
      holidayLength !== processedWeekdayData.length
    ) {
      throw new Error("CSVファイルの行数が一致しません");
    }

    const rotationCycleLength = holidayLength;

    return {
      holiday: processedHolidayData,
      saturday: processedSaturdayData,
      weekday: processedWeekdayData,
      rotationCycleLength,
    };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// 特定の日が祝日かどうか判定
function _isHoliday(date) {
  const dateStr = date.format("YYYY-MM-DD");
  return allHolidays[dateStr] !== undefined || date.day() === 0; // day()は0が日曜
}

// memoizeを使用してパフォーマンスを向上
// dayjs オブジェクトをキーとして扱えるよう、日付文字列に変換してからmemoize
const isHoliday = memoize(
  (date) => _isHoliday(date),
  (date) => date.format("YYYY-MM-DD"),
);

// エクスポート
export { loadScheduleData, loadHolidays, isHoliday, allHolidays };
