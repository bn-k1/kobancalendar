// data-loader.js - データの読み込みを担当するモジュール

// 定数定義
const HOLIDAY_PATH = "./data/holiday.csv";
const SATURDAY_PATH = "./data/saturday.csv";
const WEEKDAY_PATH = "./data/weekday.csv";
const HOLIDAYS_API = "https://holidays-jp.github.io/api/v1/";

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

// 祝日データの取得
async function loadHolidays(holidayYearsRange, userDefinedHolidays) {
  try {
    const currentYear = new Date().getFullYear();
    allHolidays = {};

    for (
      let year = currentYear - holidayYearsRange;
      year <= currentYear + holidayYearsRange;
      year++
    ) {
      const cacheKey = `hldys_${year}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const yearHolidays = JSON.parse(cachedData);
        allHolidays = { ...allHolidays, ...yearHolidays };
      } else {
        const response = await fetch(`${HOLIDAYS_API}${year}/date.json`);
        if (!response.ok) throw new Error(`祝日データの取得に失敗: ${year}`);
        const yearHolidays = await response.json();

        localStorage.setItem(cacheKey, JSON.stringify(yearHolidays));

        allHolidays = { ...allHolidays, ...yearHolidays };
      }
    }

    userDefinedHolidays.forEach((date) => {
      let [month, day] = date.split("/");
      for (
        let year = currentYear - holidayYearsRange;
        year <= currentYear + holidayYearsRange;
        year++
      ) {
        let formattedDate = `${year}-${month}-${day}`;
        allHolidays[formattedDate] = "customholiday";
      }
    });

    return allHolidays;
  } catch (error) {
    console.error(error.message);
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
  const dateStr = date
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, "-");
  return allHolidays[dateStr] !== undefined || date.getDay() === 0;
}

// エクスポート
export { loadScheduleData, loadHolidays, isHoliday, allHolidays };
