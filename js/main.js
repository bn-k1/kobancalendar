// 定数定義
const CONFIG_PATH = "./config.json";
const EVENT_CONFIG_PATH = "./config/event.json";
const HOLIDAY_PATH = "./data/holiday.csv";
const SATURDAY_PATH = "./data/saturday.csv";
const WEEKDAY_PATH = "./data/weekday.csv";
const HOLIDAYS_API = "https://holidays-jp.github.io/api/v1/";

// グローバル変数
let BASE_DATES = [];
let CURRENT_BASE_DATE;
let MAX_SCHEDULE_CYCLE;
let HOLIDAY_YEARS_RANGE; 
let holidays = {};
let customHolidays = [];
let holiday = [];
let saturday = [];
let weekday = [];
let calendar;
let eventConfig;

// イベント設定ファイルの読み込み
async function loadEventConfig() {
    try {
        const response = await fetch(EVENT_CONFIG_PATH);
        if (!response.ok) throw new Error("イベント設定ファイルの取得に失敗しました");
        eventConfig = await response.json();
    } catch (error) {
        console.error(error.message);
        alert("イベント設定ファイルの読み込みに失敗しました");
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

// 設定ファイルの読み込み
async function loadConfig() {
    try {
        const response = await fetch(CONFIG_PATH);
        if (!response.ok) throw new Error("設定ファイルの取得に失敗しました");
        const config = await response.json();
        
        // 複数の基準日を処理
        if (config.base_dates) {
            BASE_DATES = config.base_dates.map(dateStr => new Date(dateStr));
        } else if (config.base_date) {
            // 後方互換性のため
            BASE_DATES = [new Date(config.base_date)];
        } else {
            throw new Error("基準日が設定されていません");
        }
        
        // URLパラメータから基準日を取得またはデフォルト設定
        const params = new URLSearchParams(window.location.search);
        if (params.has("baseDate")) {
            CURRENT_BASE_DATE = new Date(params.get("baseDate"));
            // 有効な基準日か確認
            if (isNaN(CURRENT_BASE_DATE.getTime())) {
                CURRENT_BASE_DATE = BASE_DATES[0]; // デフォルトに戻す
            }
        } else {
            // デフォルトは最も古い基準日
            CURRENT_BASE_DATE = new Date(Math.min(...BASE_DATES.map(d => d.getTime())));
        }
        
        HOLIDAY_YEARS_RANGE = config.holiday_years_range;
        customHolidays = config.custom_holidays || [];
    } catch (error) {
        console.error(error.message);
        alert("設定ファイルの読み込みに失敗しました");
    }
}

// 基準日選択セクションを更新
function updateBaseDateSection() {
    const baseDateSelect = document.getElementById("baseDate");
    
    // 選択肢をクリア
    baseDateSelect.innerHTML = "";
    
    // 基準日の選択肢を追加
    BASE_DATES.forEach(date => {
        const option = document.createElement("option");
        const dateStr = date.toISOString().split("T")[0];
        option.value = dateStr;
        option.text = dateStr;
        baseDateSelect.appendChild(option);
    });
    
    // 現在選択されている基準日を設定
    const currentBaseDateStr = CURRENT_BASE_DATE.toISOString().split("T")[0];
    baseDateSelect.value = currentBaseDateStr;
}

// ラベルを更新
function updateLabel() {
    if (CURRENT_BASE_DATE) {
        document.getElementById("baseDateSection").style.display = "block";
        document.getElementById("startNumberSection").style.display = "block";
        document.querySelector("label[for='baseDate']").textContent = "基準日:";
        document.querySelector("label[for='startNumber']").textContent = "コマ位置:";
        document.getElementById("exportSection").style.display = "block";
    }
}

// CSVデータの読み込み
async function loadCSV(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`${filePath} の取得に失敗しました`);
        return (await response.text()).trim().split("\n");
    } catch (error) {
        console.error(error.message);
        alert(`${filePath} の読み込みに失敗しました`);
        return [];
    }
}

// 祝日データの取得
async function loadHolidays() {
    try {
        const currentYear = new Date().getFullYear();
        const cacheKey = `holidays_${currentYear}`;
        
        if (localStorage.getItem(cacheKey)) {
            holidays = JSON.parse(localStorage.getItem(cacheKey));
        } else {
            holidays = {};
            for (let year = currentYear - HOLIDAY_YEARS_RANGE; year <= currentYear + HOLIDAY_YEARS_RANGE; year++) {
                const response = await fetch(`${HOLIDAYS_API}${year}/date.json`);
                if (!response.ok) throw new Error(`祝日データの取得に失敗: ${year}`);
                const yearHolidays = await response.json();
                holidays = { ...holidays, ...yearHolidays };
            }
            localStorage.setItem(cacheKey, JSON.stringify(holidays));
        }

        customHolidays.forEach(date => {
            let [month, day] = date.split("/");
            for (let year = currentYear - HOLIDAY_YEARS_RANGE; year <= currentYear + HOLIDAY_YEARS_RANGE; year++) {
                let formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
                holidays[formattedDate] = "customholiday";
            }
        });
    } catch (error) {
        console.error(error.message);
        alert("祝日データの読み込みに失敗しました");
    }
}

async function loadData() {
    await loadConfig();
    [holiday, saturday, weekday] = await Promise.all([
        loadCSV(HOLIDAY_PATH),
        loadCSV(SATURDAY_PATH),
        loadCSV(WEEKDAY_PATH)
    ]);
    
    const holidayLength = holiday.length;
    if (holidayLength !== saturday.length || holidayLength !== weekday.length) {
        alert("エラー: CSVファイルの行数が一致しません");
        throw new Error("CSVファイルの行数が一致しません");
    }
    
    MAX_SCHEDULE_CYCLE = holidayLength;
    await loadHolidays();
}

// カレンダーの初期化
function initializeCalendar() {
    let calendarEl = document.getElementById("calendar");
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "ja",
        events: [],
        datesSet: updateCalendar,
        aspectRatio: 1.35,
        height: "auto",
        eventDidMount: ({ event, el }) => {
            let [title, stime = "", etime = ""] = event.title.split("\n");
            el.innerHTML = `
                <div class="event-title">${title}</div>
                ${stime ? `<div class="event-time">${stime}</div>` : ""}
                ${etime ? `<div class="event-time">${etime}</div>` : ""}`;
        }
    });
    calendar.render();
}

function getScheduleForDate(date, startNumber) {
    let dateStr = date.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
    let isHoliday = holidays[dateStr] !== undefined || date.getDay() === 0;
    let isSaturday = date.getDay() === 6;

    let diffDays = Math.floor((date - CURRENT_BASE_DATE) / (1000 * 60 * 60 * 24));
    let shiftIndex = ((startNumber + diffDays) % MAX_SCHEDULE_CYCLE + MAX_SCHEDULE_CYCLE) % MAX_SCHEDULE_CYCLE;

    let workData;
    if (isHoliday) {
        workData = holiday[shiftIndex];
    } else if (isSaturday) {
        workData = saturday[shiftIndex];
    } else {
        workData = weekday[shiftIndex];
    }
    
    if (!workData) return null;

    let [subject, startTime, endTime] = workData.split(",");
    return {
        dateStr,
        subject,
        startTime,
        endTime,
        isHoliday,
        isSaturday
    };
}

// カレンダーの更新
function updateCalendar() {
    if (!CURRENT_BASE_DATE || !eventConfig || holiday.length === 0 || saturday.length === 0 || weekday.length === 0) return;

    let startNumber = parseInt(document.getElementById("startNumber").value);
    let currentViewStartDate = calendar.view.activeStart;
    let currentViewEndDate = calendar.view.activeEnd;
    let events = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (
        let date = new Date(currentViewStartDate);
        date < currentViewEndDate;
        date.setDate(date.getDate() + 1)
    ) {
        let schedule = getScheduleForDate(date, startNumber);
        if (!schedule) continue;

        let { dateStr, subject, startTime, endTime, isHoliday, isSaturday } = schedule;

        const currentDate = new Date(date);
        currentDate.setHours(0, 0, 0, 0);

        let cell = document.querySelector(`[data-date='${dateStr}']`);
        if (cell) {
            cell.classList.remove("holiday", "fc-day-sat", "fc-day-sun");
            
            if (currentDate.getTime() !== today.getTime()) {
                if (isHoliday) {
                    cell.classList.add("holiday");
                }
                if (isSaturday) {
                    cell.classList.add("fc-day-sat");
                }
                if (date.getDay() === 0) {
                    cell.classList.add("fc-day-sun");
                }
            }
        }

        const { config } = getEventType(subject);
        events.push({
            title: config.showTime 
                ? `${subject}\n${startTime} - \n${endTime}`
                : subject,
            start: dateStr,
            color: config.color
        });
    }
    calendar.removeAllEvents();
    calendar.addEventSource(events);
}

// スタート番号選択の初期化
function initializeStartNumberSelection() {
    let select = document.getElementById("startNumber");
    select.innerHTML = ""; // 選択肢をクリア
    
    for (let i = 1; i <= MAX_SCHEDULE_CYCLE; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = i;
        select.appendChild(option);
    }

    let params = new URLSearchParams(window.location.search);
    if (params.has("startNumber")) {
        select.value = params.get("startNumber");
    }
}

// 基準日の変更時の処理
function handleBaseDateChange() {
    const baseDateSelect = document.getElementById("baseDate");
    CURRENT_BASE_DATE = new Date(baseDateSelect.value);
    updateURLAndGenerateSchedule();
}

// URLの更新
function updateURLAndGenerateSchedule() {
    let startNumber = document.getElementById("startNumber").value;
    let baseDateStr = CURRENT_BASE_DATE.toISOString().split("T")[0];
    window.history.pushState({}, "", `?baseDate=${baseDateStr}&startNumber=${startNumber}`);
    updateCalendar();
}

// CSVエクスポート機能
function exportCSV() {
    const months = parseInt(document.getElementById("exportMonths").value);
    const startNumber = parseInt(document.getElementById("startNumber").value);

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + months);

    let csvContent = "Subject,Start Date,Start Time,End Time\n";

    for (
        let date = new Date(startDate);
        date < endDate;
        date.setDate(date.getDate() + 1)
    ) {
        let schedule = getScheduleForDate(date, startNumber);
        if (!schedule) continue;

        let { subject, startTime, endTime } = schedule;
        let formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

        csvContent += `${subject},${formattedDate},${startTime},${endTime}\n`;
    }

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    const currentDate = new Date().toISOString().split("T")[0];
    a.href = url;
    a.download = `schedule_${currentDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// ページ読み込み時の処理
window.onload = async function () {
    await Promise.all([
        loadData(),
        loadEventConfig()
    ]);
    updateBaseDateSection();
    updateLabel();
    initializeStartNumberSelection();
    initializeCalendar();
};
