// calendar/initialization.js - カレンダー初期化関連の機能

import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { getHolidayName } from "../store/index.js";
import { applyDayCellStyles, customizeDayCell } from "./cellStyle.js";
import { setCalendarInstance } from "./calendarService.js";

// カレンダーの初期化
function initializeCalendar(updateCallback) {
  let calendarElement = document.getElementById("calendar");

  const calendar = new Calendar(calendarElement, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    locale: "ja",
    events: [],
    datesSet: updateCallback,
    aspectRatio: 1.35,
    height: "auto",

    // FullCalendarのAPIを使用してセルの表示をカスタマイズ
    dayCellDidMount: function (info) {
      const { date, el } = info;
      customizeDayCell(date, el);
    },

    // イベントコンテンツのカスタマイズ
    eventContent: createEventContentRenderer(),
  });

  calendar.render();

  // 月が変わった時にも日付セルのスタイルを適用するための処理
  calendar.on("datesSet", function () {
    applyDayCellStyles();
  });

  // カレンダーインスタンスを保存
  setCalendarInstance(calendar);

  return calendar;
}

// イベントコンテンツレンダラーを作成する関数
function createEventContentRenderer() {
  return (arg) => {
    let [title, startTime = "", endTime = ""] = arg.event.title.split("\n");

    // extendedPropsからデバッグ情報を取得
    const { shiftIndex } = arg.event.extendedProps;
    const dateObj = dayjs(arg.event.start);

    // 祝日名を取得
    const holidayName = getHolidayName(dateObj);

    // デバッグ情報の文字列を作成（土日の表示は排除）
    const metaInfo = holidayName
      ? `${shiftIndex + 1} ${holidayName}`
      : `${shiftIndex + 1}`;

    return {
      html: `
        <div class="event-title">${title}</div>
        ${startTime ? `<div class="event-time">${startTime}</div>` : ""}
        ${endTime ? `<div class="event-time">${endTime}</div>` : ""}
        <div class="event-meta">${metaInfo}</div>
      `,
    };
  };
}

export { initializeCalendar };
