// main.js - アプリケーションのエントリーポイント

import { 
    loadConfig, 
    loadEventConfig, 
    updateCurrentBaseDate, 
    updateURLParams, 
    BASE_DATES, 
    CURRENT_BASE_DATE, 
    LAST_BASE_DATE 
} from './config.js';

import { 
    loadScheduleData, 
    loadHolidays 
} from './data-loader.js';

import { 
    setScheduleData, 
    initializeCalendar, 
    updateCalendar, 
    exportCSV 
} from './schedule.js';

import { 
    updateBaseDateSection, 
    updateLabel, 
    initializeStartNumberSelection 
} from './ui.js';

// グローバル設定変数
let configData;
let scheduleData;

// カレンダー更新用のコールバック関数
function handleCalendarUpdate() {
    updateCalendar(CURRENT_BASE_DATE, LAST_BASE_DATE);
}

// 基準日の変更時の処理
function handleBaseDateChange() {
    const baseDateSelect = document.getElementById("baseDate");
    updateCurrentBaseDate(new Date(baseDateSelect.value));
    updateURLAndGenerateSchedule();
}

// URLの更新
function updateURLAndGenerateSchedule() {
    const startNumber = document.getElementById("startNumber").value;
    updateURLParams(CURRENT_BASE_DATE, startNumber);
    handleCalendarUpdate();
}

// CSVエクスポート処理のハンドラー
function handleExportCSV() {
    const months = parseInt(document.getElementById("exportMonths").value);
    const startNumber = parseInt(document.getElementById("startNumber").value);
    exportCSV(months, startNumber, CURRENT_BASE_DATE, LAST_BASE_DATE);
}

// イベントリスナーの設定
function setupEventListeners() {
    document.getElementById("baseDate").addEventListener("change", handleBaseDateChange);
    document.getElementById("startNumber").addEventListener("change", updateURLAndGenerateSchedule);
    document.getElementById("exportButton").addEventListener("click", handleExportCSV);
}

// アプリケーションの初期化
async function initializeApp() {
   try {
        // 設定の読み込み
        configData = await loadConfig();
        const eventConfig = await loadEventConfig();
        
        // スケジュールデータの読み込み
        scheduleData = await loadScheduleData();
        setScheduleData(scheduleData);
        
        // 祝日データの読み込み
        await loadHolidays(configData.HOLIDAY_YEARS_RANGE, configData.customHolidays);
        
        // UIの初期化
        updateBaseDateSection(BASE_DATES, CURRENT_BASE_DATE);
        updateLabel(CURRENT_BASE_DATE);
        initializeStartNumberSelection(scheduleData.MAX_SCHEDULE_CYCLE);
        
        // カレンダーの初期化
        initializeCalendar(handleCalendarUpdate);
        
        // イベントリスナーの設定
        setupEventListeners();

    } catch (error) {
        console.error("アプリケーションの初期化に失敗しました:", error);
    }
}

// ページ読み込み時の処理
window.onload = initializeApp;
