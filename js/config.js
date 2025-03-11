// config.js - 設定関連の機能を提供するモジュール

// 定数定義
const CONFIG_PATH = "./config/config.json";
const EVENT_CONFIG_PATH = "./config/event.json";

// 設定情報を保持する変数
let BASE_DATES = [];
let CURRENT_BASE_DATE;
let LAST_BASE_DATE;
let HOLIDAY_YEARS_RANGE;
let customHolidays = [];
let eventConfig;

// 設定ファイルの読み込み
async function loadConfig() {
    try {
        const response = await fetch(CONFIG_PATH);
        if (!response.ok) throw new Error("設定ファイルの取得に失敗しました");
        const config = await response.json();

        if (config.base_dates) {
            BASE_DATES = config.base_dates.map(dateStr => new Date(dateStr)).sort((a, b) => a - b);
        } else if (config.base_date) {
            BASE_DATES = [new Date(config.base_date)];
        } else {
            throw new Error("基準日が設定されていません");
        }

        const params = new URLSearchParams(window.location.search);
        if (params.has("baseDate")) {
            CURRENT_BASE_DATE = new Date(params.get("baseDate"));
            if (isNaN(CURRENT_BASE_DATE.getTime())) {
                CURRENT_BASE_DATE = BASE_DATES[0];
            }
        } else {
            CURRENT_BASE_DATE = BASE_DATES[0];
        }

        LAST_BASE_DATE = BASE_DATES[BASE_DATES.length - 1];

        HOLIDAY_YEARS_RANGE = config.holiday_years_range;
        customHolidays = config.custom_holidays || [];
        
        return {
            BASE_DATES,
            CURRENT_BASE_DATE,
            LAST_BASE_DATE,
            HOLIDAY_YEARS_RANGE,
            customHolidays
        };
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// イベント設定ファイルの読み込み
async function loadEventConfig() {
    try {
        const response = await fetch(EVENT_CONFIG_PATH);
        if (!response.ok) throw new Error("イベント設定ファイルの取得に失敗しました");
        eventConfig = await response.json();
        return eventConfig;
    } catch (error) {
        console.error(error.message);
        throw error;
    }
}

// イベントの種類を判定
function getEventType(subject) {
    for (const [type, config] of Object.entries(eventConfig.specialEvents)) {
        if (config.keywords.some(keyword => subject.includes(keyword))) {
            return { type, config };
        }
    }
    return { type: 'default', config: eventConfig.defaultEvent };
}

// 設定を更新する
function updateCurrentBaseDate(newBaseDate) {
    CURRENT_BASE_DATE = newBaseDate;
    return CURRENT_BASE_DATE;
}

// URLのクエリパラメータを更新
function updateURLParams(baseDate, startNumber) {
    const baseDateStr = baseDate.toISOString().split("T")[0];
    window.history.pushState({}, "", `?baseDate=${baseDateStr}&startNumber=${startNumber}`);
}

// エクスポート
export {
    loadConfig,
    loadEventConfig,
    getEventType,
    updateCurrentBaseDate,
    updateURLParams,
    BASE_DATES,
    CURRENT_BASE_DATE,
    LAST_BASE_DATE,
    customHolidays
};