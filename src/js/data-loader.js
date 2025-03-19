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
  // csv-loaderによって配列形式で提供されるため、
  // それをテキスト行の配列に変換する
  if (Array.isArray(csvData)) {
    return csvData.map((row) => {
      // 配列の場合、各行を文字列に結合（元の形式と同じになるよう）
      if (Array.isArray(row)) {
        return row.join(",");
      }
      // オブジェクトの場合、値を取り出して結合
      else if (typeof row === "object" && row !== null) {
        return Object.values(row).join(",");
      }
      return String(row);
    });
  }
  // 既に文字列形式の場合は、行に分割
  else if (typeof csvData === "string") {
    return csvData.trim().split("\n");
  }

  return [];
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
      // その年の1月1日から12月31日まで
      const startDate = dayjs(`${year}-01-01`);
      const endDate = dayjs(`${year}-12-31`);

      // 日付を1日ずつ進めながら祝日かチェック
      let currentDay = startDate;
      while (currentDay.isSameOrBefore(endDate)) {
        const jsDate = currentDay.toDate(); // japanese-holidaysはJavaScriptのDateオブジェクトを要求
        const holidayName = JapaneseHolidays.isHoliday(jsDate);
        if (holidayName) {
          const dateStr = currentDay.format("YYYY-MM-DD");
          allHolidays[dateStr] = holidayName;
        }
        currentDay = currentDay.add(1, "day");
      }
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

// 特定の日が祝日かどうか判定 - 元の実装
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
