// calendar.js - カレンダー管理関連の機能
import { Calendar } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Alpine from "alpinejs";
import dayjs from "dayjs";

// カレンダーの初期化
export function initializeCalendar() {
  const calendarEl = document.getElementById("calendar");

  const calendar = new Calendar(calendarEl, {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: "dayGridMonth",
    locale: "ja",
    events: [],
    datesSet: () => updateCalendar(calendar),
    aspectRatio: 1.35,
    height: "auto",

    // セルのカスタマイズ
    dayCellDidMount: (info) => {
      const { date, el } = info;
      customizeDayCell(date, el);
    },

    // イベントコンテンツのカスタマイズ
    eventContent: createEventContentRenderer(),
  });

  calendar.render();

  // 月が変わった時にも日付セルのスタイルを適用
  calendar.on("datesSet", () => {
    applyDayCellStyles(calendar);
  });

  return calendar;
}

// カレンダーの更新
export function updateCalendar(
  calendar,
  startPosition = 1,
  currentBaseDate = Alpine.store("state").currentBaseDate,
  lastBaseDate = Alpine.store("state").lastBaseDate,
) {
  if (!calendar) return;

  // 設定が読み込まれていることを確認
  if (!Alpine.store("state").isConfigLoaded()) {
    console.warn(
      "設定が完全に読み込まれていません。カレンダー更新をスキップします。",
    );
    return;
  }

  const viewStartDate = dayjs(calendar.view.activeStart);
  const viewEndDate = dayjs(calendar.view.activeEnd);

  // イベントデータを一度にまとめて準備
  const calendarEvents = generateCalendarEvents(
    viewStartDate,
    viewEndDate,
    startPosition,
    currentBaseDate,
    lastBaseDate,
  );

  // イベントの一括更新
  calendar.removeAllEvents();
  calendar.addEventSource(calendarEvents);
}

// 日付セルのスタイル適用
function customizeDayCell(date, el) {
  const dateObj = dayjs(date);

  // 土曜、日曜、祝日のスタイルを設定
  if (Alpine.store("state").isHoliday(dateObj)) {
    el.classList.add("holiday");
  }
  if (dateObj.day() === 6) {
    // 土曜日
    el.classList.add("fc-day-sat");
  }
  if (dateObj.day() === 0) {
    // 日曜日
    el.classList.add("fc-day-sun");
  }

  // 今日の日付をハイライト
  if (dateObj.isSame(dayjs().startOf("day"), "day")) {
    el.classList.add("today-highlight");
  }
}

// カレンダー内のすべての日付セルにスタイルを適用
function applyDayCellStyles(calendar) {
  if (!calendar) return;

  // 現在表示されているすべての日付セルを取得
  const dayCells = document.querySelectorAll(".fc-daygrid-day");

  dayCells.forEach((cell) => {
    // データ属性から日付を取得
    const dateStr = cell.getAttribute("data-date");
    if (dateStr) {
      const date = dayjs(dateStr);
      customizeDayCell(date, cell);
    }
  });
}

// イベントコンテンツレンダラーを作成
function createEventContentRenderer() {
  return (arg) => {
    let [title, startTime = "", endTime = ""] = arg.event.title.split("\n");

    // extendedPropsからデバッグ情報を取得
    const { shiftIndex } = arg.event.extendedProps;
    const dateObj = dayjs(arg.event.start);

    // 祝日名を取得
    const holidayName = Alpine.store("state").getHolidayName(dateObj);

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

// 日付範囲のイベントデータを生成
function generateCalendarEvents(
  viewStartDate,
  viewEndDate,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  const calendarEvents = [];

  let currentDate = viewStartDate;
  while (currentDate.isBefore(viewEndDate)) {
    const scheduleInfo = Alpine.store("state").getScheduleForDate(
      currentDate,
      startPosition,
      currentBaseDate,
      lastBaseDate,
    );

    if (!scheduleInfo) {
      currentDate = currentDate.add(1, "day");
      continue;
    }

    const {
      dateStr,
      subject,
      startTime,
      endTime,
      isHoliday,
      isSaturday,
      shiftIndex,
    } = scheduleInfo;

    try {
      // イベントの準備
      const { config } = Alpine.store("state").getEventType(subject);
      calendarEvents.push({
        title: config.showTime
          ? `${subject}\n${startTime} - \n${endTime}`
          : subject,
        start: dateStr,
        color: config.color,
        // 追加のメタデータ
        extendedProps: {
          startTime,
          endTime,
          isShift: true,
          isHoliday,
          isSaturday,
          shiftIndex,
        },
      });
    } catch (error) {
      console.error(
        `日付 ${dateStr} のイベント処理中にエラーが発生しました:`,
        error,
      );
      // エラーが発生しても処理を続行
    }

    currentDate = currentDate.add(1, "day");
  }

  return calendarEvents;
}
