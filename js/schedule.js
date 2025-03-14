// schedule.js - スケジュール計算とカレンダー表示に関連する機能を提供

import { getEventType } from './config.js';
import { isHoliday, holidays } from './data-loader.js';

let calendar;
let scheduleData = {
    holiday: [],
    saturday: [],
    weekday: [],
    MAX_SCHEDULE_CYCLE: 0
};

// スケジュールデータの設定
function setScheduleData(data) {
    scheduleData = data;
}

// カレンダーの初期化
function initializeCalendar(updateCallback) {
    let calendarEl = document.getElementById("calendar");
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "ja",
        events: [],
        datesSet: updateCallback,
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
    return calendar;
}

// 任意の日付とコマ位置から勤務内容を返す
function getScheduleForDate(date, startNumber, currentBaseDate, lastBaseDate) {
    let dateStr = date.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
    let holidayFlag = isHoliday(date);
    let isSaturday = date.getDay() === 6;

    const formattedLastBaseDate = lastBaseDate.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");
    const formattedCurrentBaseDate = currentBaseDate.toLocaleDateString("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-");

    if ((currentBaseDate.getTime() !== lastBaseDate.getTime() && dateStr >= formattedLastBaseDate) || dateStr < formattedCurrentBaseDate) {
        return { dateStr, subject: "-", startTime: "", endTime: "", isHoliday: holidayFlag, isSaturday };
    }

    let diffDays = Math.floor((date - currentBaseDate) / (1000 * 60 * 60 * 24));
    let shiftIndex = ((startNumber + diffDays) % scheduleData.MAX_SCHEDULE_CYCLE + scheduleData.MAX_SCHEDULE_CYCLE) % scheduleData.MAX_SCHEDULE_CYCLE;

    let workData;
    if (holidayFlag) {
        workData = scheduleData.holiday[shiftIndex];
    } else if (isSaturday) {
        workData = scheduleData.saturday[shiftIndex];
    } else {
        workData = scheduleData.weekday[shiftIndex];
    }

    if (!workData) return null;

    let [subject, startTime, endTime] = workData.split(",");
    return {
        dateStr,
        subject,
        startTime,
        endTime,
        isHoliday: holidayFlag,
        isSaturday
    };
}

// カレンダーの更新
function updateCalendar(currentBaseDate, lastBaseDate) {
    if (!currentBaseDate || scheduleData.holiday.length === 0 || scheduleData.saturday.length === 0 || scheduleData.weekday.length === 0) return;

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
        let schedule = getScheduleForDate(date, startNumber, currentBaseDate, lastBaseDate);
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

// CSVエクスポート機能
function exportCSV(months, startNumber, currentBaseDate, lastBaseDate) {
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
        let schedule = getScheduleForDate(date, startNumber, currentBaseDate, lastBaseDate);
        if (!schedule) continue;

        let { subject, startTime, endTime } = schedule;
        let formattedDate = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;

        csvContent += `${subject},${formattedDate},${startTime},${endTime}\n`;
    }

    const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([BOM, csvContent], { type: "text/csv;charset=utf-8" });
    
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

// エクスポート
export {
    setScheduleData,
    initializeCalendar,
    updateCalendar,
    getScheduleForDate,
    exportCSV
};
