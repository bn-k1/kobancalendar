export const TIMEZONE = "Asia/Tokyo";
export const APP_CONFIG = {
  DEFAULT_HOLIDAY_YEARS: 5,
  DEFAULT_SEARCH_PERIOD: 30,
  DEFAULT_MEETUP_START_TIME: "17:00",
};

export const DATE_FORMATS = {
  ISO_DATE: "YYYY-MM-DD",
  DISPLAY_DATE: "YYYY/MM/DD",
};

export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export const CALENDAR_CONFIG = {
  DEFAULT_ASPECT_RATIO: 1.35,
  HEIGHT: "auto",
  LOCALE: "ja",
  INITIAL_VIEW: "dayGridMonth",
};

export const LONG_PRESS_DURATION = 500;

export const CUSTOM_HOLIDAY = "設定祝日";

export const TIMEOPTIONS = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

export const PERIODOPTIONS = [
  { value: "30", text: "1ヶ月" },
  { value: "60", text: "2ヶ月" },
  { value: "90", text: "3ヶ月" },
];

export const ERROR_MESSAGES = {
  INIT_FAILED: "アプリケーションの初期化に失敗しました",
  NO_BASE_DATE: "URLパラメータに基準日が含まれていません",
  SCHEDULE_DATA_ERROR: "スケジュールデータの読み込みに失敗しました",
  HOLIDAYS_LOAD_ERROR: "祝日データの取得に失敗しました",
  NO_PARTICIPANTS: "参加者を1人以上選択してください",
  GOAHEAD: "行ってらっしゃいませ",
};

export const EDITED_SCHEDULE_EMPTY_NOTICE =
  "既存の予定を長押しして編集できます。";
