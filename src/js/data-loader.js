// data-loader.js - データの読み込みを担当するモジュール

import JapaneseHolidays from 'japanese-holidays';

// 定数定義
const HOLIDAY_PATH = "./data/holiday.csv";
const SATURDAY_PATH = "./data/saturday.csv";
const WEEKDAY_PATH = "./data/weekday.csv";

let allHolidays = {};

// CSVデータの読み込み
async function loadCSV(filePath) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`${filePath} の取得に失敗しました`);
    return (await response.text()).trim().split("\n");
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

// 祝日データの取得（japanese-holidaysを使用）
async function loadHolidays(holidayYearsRange, userDefinedHolidays) {
  try {
    const currentYear = new Date().getFullYear();
    allHolidays = {};

    // 指定された年範囲の祝日を取得
    for (
      let year = currentYear - holidayYearsRange;
      year <= currentYear + holidayYearsRange;
      year++
    ) {
      // その年の1月1日から12月31日まで
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      
      // 日付を1日ずつ進めながら祝日かチェック
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const holidayName = JapaneseHolidays.isHoliday(d);
        if (holidayName) {
	  const dateStr = d.toISOString().split('T')[0];
          allHolidays[dateStr] = holidayName;
        }
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
        let formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        allHolidays[formattedDate] = "customholiday";
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
    const [holidayData, saturdayData, weekdayData] = await Promise.all([
      loadCSV(HOLIDAY_PATH),
      loadCSV(SATURDAY_PATH),
      loadCSV(WEEKDAY_PATH),
    ]);

    const holidayLength = holidayData.length;
    if (
      holidayLength !== saturdayData.length ||
      holidayLength !== weekdayData.length
    ) {
      throw new Error("CSVファイルの行数が一致しません");
    }

    const rotationCycleLength = holidayLength;

    return {
      holiday: holidayData,
      saturday: saturdayData,
      weekday: weekdayData,
      rotationCycleLength,
    };
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}

// 特定の日が祝日かどうか判定
function isHoliday(date) {
  const dateStr = date.toISOString().split('T')[0];
  return allHolidays[dateStr] !== undefined || date.getDay() === 0;
}

// エクスポート
export { loadScheduleData, loadHolidays, isHoliday, allHolidays };

