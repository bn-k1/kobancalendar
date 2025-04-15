// constants.js - アプリケーション全体で使用される定数を定義
export const APP_CONFIG = {
  DEFAULT_EXPORT_MONTHS: 1,
  DEFAULT_START_POSITION: 1,
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

export const CUSTOM_HOLIDAY = "設定祝日";

export const ERROR_MESSAGES = {
  INIT_FAILED: "アプリケーションの初期化に失敗しました",
  CSV_ROWS_MISMATCH: "CSVファイルの行数が一致しません",
  NO_BASE_DATE: "基準日が設定されていません",
  INVALID_BASE_DATE: "無効な基準日です",
  INVALID_STARTNUMBER: "無効なコマ位置です",
  INVALID_URL_PARAM: "無効なURLパラメータです",
  PARAM_OUT_OF_RANGE: "パラメータが有効範囲外です",
  CONFIG_NOT_LOADED: "設定が完全に読み込まれていません",
  CONFIG_LOAD_ERROR: "設定の取得に失敗しました",
  EVENT_CONFIG_LOAD_ERROR: "イベント設定ファイルの読み込みに失敗しました",
  EVENT_CONFIG_ERROR: "イベント設定が読み込まれていないか無効です",
  SCHEDULE_DATA_ERROR: "スケジュールデータの読み込みに失敗しました",
  HOLIDAYS_LOAD_ERROR: "祝日データの取得に失敗しました",
  ICS_EXPORT_ERROR: "ICSファイルのエクスポート中にエラーが発生しました",
  NO_PARTICIPANTS: "参加者を1人以上選択してください",
  GOAHEAD: "行ってらっしゃいませ",
};
