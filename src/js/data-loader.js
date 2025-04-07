// data-loader.js - データの読み込みを担当するモジュール
import Alpine from "alpinejs";
import dayjs from "dayjs";
import JapaneseHolidays from "japanese-holidays";

// CSVデータはimportからパスを適宜調整
import holidayData from "@data/holiday.csv";
import saturdayData from "@data/saturday.csv";
import weekdayData from "@data/weekday.csv";

// CSV形式のデータを処理する
function processCSVData(csvData) {
  return csvData.map((row) => row.join(","));
}

// 祝日データの取得（japanese-holidaysを使用）
export async function loadHolidays() {
  try {
    // storeから必要な値を取得
    const store = Alpine.store("state");
    const holidayYearsRange = store.holidayYearsRange;
    const userDefinedHolidays = store.userDefinedHolidays;

    const currentYear = dayjs().year();
    const allHolidays = {};

    // 指定された年範囲の祝日を取得
    for (
      let year = currentYear - holidayYearsRange;
      year <= currentYear + holidayYearsRange;
      year++
    ) {
      const holidays = JapaneseHolidays.getHolidaysOf(year);
      holidays.forEach((holiday) => {
        const dateObj = dayjs(
          `${year}-${String(holiday.month).padStart(2, "0")}-${String(holiday.date).padStart(2, "0")}`,
        );
        const dateStr = dateObj.format("YYYY-MM-DD");
        allHolidays[dateStr] = holiday.name;
      });
    }

    // ユーザー定義の祝日を追加
    if (userDefinedHolidays && userDefinedHolidays.length > 0) {
      userDefinedHolidays.forEach((date) => {
        let [month, day] = date.split("-");
        for (
          let year = currentYear - holidayYearsRange;
          year <= currentYear + holidayYearsRange;
          year++
        ) {
          let formattedDate = `${year}-${month}-${day}`;
          if (allHolidays[formattedDate] === undefined) {
            allHolidays[formattedDate] = "設定祝日";
          }
        }
      });
    }

    // ストアに祝日データを設定
    store.setHolidays(allHolidays);
    return allHolidays;
  } catch (error) {
    console.error("祝日データの取得に失敗しました:", error);
    return {};
  }
}

// スケジュールデータの読み込み
export async function loadScheduleData() {
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
