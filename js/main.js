// 定数定
const CONFIG_PATH = "./config.json";
const HOLIDAY_PATH = "./data/holiday.csv";
const SATURDAY_PATH = "./data/saturday.csv";
const WEEKDAY_PATH = "./data/weekday.csv";
const HOLIDAYS_API = "https://holidays-jp.github.io/api/v1/";

// グローバル変数
let BASE_DATE;
let MAX_SCHEDULE_CYCLE;
let HOLIDAY_YEARS_RANGE; 
let holidays = {};
let customHolidays = [];
let holiday = [];
let saturday = [];
let weekday = [];
let calendar;


// 設定ファイルの読み込み
async function loadConfig() {
    try {
        const response = await fetch(CONFIG_PATH);
        if (!response.ok) throw new Error("設定ファイルの取得に失敗しました");
        const config = await response.json();
        BASE_DATE = new Date(config.base_date);
	HOLIDAY_YEARS_RANGE = config.holiday_years_range;
        customHolidays = config.custom_holidays || [];
    } catch (error) {
        console.error(error.message);
        alert("設定ファイルの読み込みに失敗しました");
    }
}

// ラベルを更新
function updateLabel() {
    if (BASE_DATE) {
        let baseDateStr = BASE_DATE.toISOString().split("T")[0];
	document.getElementById("startNumberSection").style.display = "block";
        document.querySelector("label[for='startNumber']").textContent = `${baseDateStr} 時点でのコマ位置:`;
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
        holidays = {};

        for (let year = currentYear - HOLIDAY_YEARS_RANGE; year <= currentYear + HOLIDAY_YEARS_RANGE; year++) {
            const response = await fetch(`${HOLIDAYS_API}${year}/date.json`);
            if (!response.ok) throw new Error(`祝日データの取得に失敗しました: ${year}`);
            const yearHolidays = await response.json();
            holidays = { ...holidays, ...yearHolidays };
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
    document.getElementById("exportSection").style.display = "block";
}

function getScheduleForDate(date, startNumber) {
    let dateStr = date.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
    let isHoliday = holidays[dateStr] !== undefined || date.getDay() === 0;
    let isSaturday = date.getDay() === 6;

    let diffDays = Math.floor((date - BASE_DATE) / (1000 * 60 * 60 * 24));
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
    };
}

// カレンダーの更新
function updateCalendar() {
    if (!BASE_DATE || holiday.length === 0 || saturday.length === 0 || weekday.length === 0) return;

    let startNumber = parseInt(document.getElementById("startNumber").value);
    let currentViewStartDate = calendar.view.activeStart;
    let currentViewEndDate = calendar.view.activeEnd;
    let events = [];

    for (
        let date = new Date(currentViewStartDate);
        date < currentViewEndDate;
        date.setDate(date.getDate() + 1)
    ) {
        let schedule = getScheduleForDate(date, startNumber);
        if (!schedule) continue;

        let { dateStr, subject, startTime, endTime, isHoliday } = schedule;

        if (isHoliday) {
            let cell = document.querySelector(`[data-date='${dateStr}']`);
            if (cell) {
                cell.classList.add("holiday");
            }
        }

        events.push({
            title: (subject.includes("公休") || subject.includes("法休") || subject.includes("空"))
                ? `${subject}`
                : `${subject}\n${startTime} - \n${endTime}`,
            start: dateStr,
            color: subject.includes("公休") || subject.includes("法休") ? "indianred"
                   : subject.includes("黄") ? "gold"
                   : "skyblue",
        });
    }
    calendar.removeAllEvents();
    calendar.addEventSource(events);
}

// スタート番号選択の初期化
function initializeStartNumberSelection() {
    let select = document.getElementById("startNumber");
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

// URLの更新
function updateURLAndGenerateSchedule() {
    let startNumber = document.getElementById("startNumber").value;
    window.history.pushState({}, "", `?startNumber=${startNumber}`);
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
        console.log(`${subject},${formattedDate},${startTime},${endTime}`);
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
    await loadData();
    updateLabel(); // ここでラベルを更新
    initializeStartNumberSelection();
    initializeCalendar();
};

