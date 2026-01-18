export const TIMEZONE = "Asia/Tokyo";
export const APP_CONFIG = {
  DEFAULT_HOLIDAY_YEARS: 5,
  DEFAULT_SEARCH_PERIOD: 30,
  DEFAULT_MEETUP_START_TIME: "17:00",
};

export const DATE_FORMATS = {
  ISO_DATE: "YYYY-MM-DD",
  DISPLAY_DATE: "YYYY/MM/DD",
  FILE_NAME_DATE: "YYYYMMDD",
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
  CALENDAR_IS_NOT_INITIALIZED_YET: "カレンダーがまだ初期化されていません",
  JSON_ROWS_MISMATCH: "CSVファイルの行数が一致しません",
  UNKNOWN_CSV_FORMAT: "不明な形式のCSVです",
  NO_BASE_DATE: "URLパラメータに基準日が含まれていません",
  BASEDATE_CONFIGURATION_ERROR: "基準日設定失敗",
  INVALID_BASE_DATE: "またもや掲示板に貼ってあるコマ位置の表が新しくなりましたので、それを見て登録しなおしてください",
  INVALID_STARTNUMBER: "無効なコマ位置です",
  INVALID_URL_PARAM: "無効なURLパラメータです",
  PARAM_OUT_OF_RANGE: "パラメータが有効範囲外です",
  CONFIG_NOT_LOADED: "設定が完全に読み込まれていません",
  CONFIG_LOAD_ERROR: "設定の取得に失敗しました",
  EVENT_CONFIG_ERROR: "イベント設定が読み込まれていないか無効です",
  SCHEDULE_DATA_ERROR: "スケジュールデータの読み込みに失敗しました",
  NO_NEXT_SCHEDULE_DATA: "次回基準日用のスケジュールデータがありません",
  HOLIDAYS_LOAD_ERROR: "祝日データの取得に失敗しました",
  NO_PARTICIPANTS: "参加者を1人以上選択してください",
  GOAHEAD: "行ってらっしゃいませ",
};

export const EDITED_SCHEDULE_EMPTY_NOTICE = "長押しで予定を編集できます。";
