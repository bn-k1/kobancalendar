// export.js - ICSエクスポート機能を提供
import dayjs from "dayjs";
import { calculateScheduleRange } from "./calc.js";

// ICSエクスポート機能
function exportICS(months, startPosition, currentBaseDate, lastBaseDate) {
  const today = dayjs().startOf("day");
  const startDate =
    currentBaseDate.isAfter(today) || currentBaseDate.isSame(today)
      ? currentBaseDate.startOf("day")
      : today;
  const endDate = startDate.add(months, "month");

  // 日付範囲の勤務スケジュールを取得
  const scheduleRange = calculateScheduleRange(
    startDate,
    endDate,
    startPosition,
    currentBaseDate,
    lastBaseDate,
  );

  // ICS フォーマットの生成
  let icsContent =
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//KobanCalendar//JP",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
    ].join("\r\n") + "\r\n";

  // タイムゾーン定義
  icsContent +=
    [
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Tokyo",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:+0900",
      "TZOFFSETTO:+0900",
      "TZNAME:JST",
      "DTSTART:19700101T000000",
      "END:STANDARD",
      "END:VTIMEZONE",
    ].join("\r\n") + "\r\n";

  // 各勤務スケジュールをICS形式のイベントに変換
  scheduleRange.forEach((schedule) => {
    const { subject, startTime, endTime } = schedule;
    const dateStr = schedule.date.format("YYYYMMDD");

    // スタート時間とエンド時間の処理
    let startDateTime = dateStr;
    let endDateTime = dateStr;
    let isAllDay = false;

    // 時間がある場合は時刻を設定、ない場合は終日イベントとして扱う
    if (startTime && endTime) {
      const startHour = startTime.split(":")[0].padStart(2, "0");
      const startMinute = startTime.split(":")[1] || "00";
      const endHour = endTime.split(":")[0].padStart(2, "0");
      const endMinute = endTime.split(":")[1] || "00";

      startDateTime += `T${startHour}${startMinute}00`;
      endDateTime += `T${endHour}${endMinute}00`;
    } else {
      isAllDay = true;
      // 終日イベントの場合、終了日は翌日を指定
      endDateTime = schedule.date.add(1, "day").format("YYYYMMDD");
    }

    // イベントの説明（Descriptionフィールド）の設定
    const description =
      startTime && endTime ? `勤務時間: ${startTime} - ${endTime}` : "";

    // VEVENT の作成
    icsContent += "BEGIN:VEVENT\r\n";
    icsContent += `SUMMARY:${escapeIcsText(subject)}\r\n`;

    if (isAllDay) {
      icsContent += `DTSTART;VALUE=DATE:${startDateTime}\r\n`;
      icsContent += `DTEND;VALUE=DATE:${endDateTime}\r\n`;
    } else {
      icsContent += `DTSTART;TZID=Asia/Tokyo:${startDateTime}\r\n`;
      icsContent += `DTEND;TZID=Asia/Tokyo:${endDateTime}\r\n`;
    }

    // UUID風の一意のIDを生成
    const uid = generateUID(schedule.date, subject);
    icsContent += `UID:${uid}\r\n`;
    icsContent += `DTSTAMP:${dayjs().format("YYYYMMDDTHHmmss")}Z\r\n`;

    if (description) {
      icsContent += `DESCRIPTION:${escapeIcsText(description)}\r\n`;
    }

    icsContent += "END:VEVENT\r\n";
  });

  // カレンダーの終了を示す
  icsContent += "END:VCALENDAR";

  // ICSファイルのダウンロード
  downloadICS(icsContent, startDate, endDate);
}

// ICS テキストエスケープ関数
function escapeIcsText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

// UID生成関数
function generateUID(date, subject) {
  const timestamp = date.unix();
  const random = Math.floor(Math.random() * 1000000);
  return `${timestamp}-${random}-koban@calendar.example.com`;
}

// ICSファイルをダウンロードするヘルパー関数
function downloadICS(icsContent, startDate, endDate) {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  // ファイル名に日付範囲を含める
  const startDateStr = startDate.format("YYYYMMDD");
  const endDateStr = endDate.add(-1, "day").format("YYYYMMDD"); // 終了日は範囲の最後の日

  downloadLink.href = url;
  downloadLink.download = `schedule_${startDateStr}-${endDateStr}.ics`;

  // ダウンロードリンクを非表示で追加してクリック
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // クリーンアップ
  setTimeout(() => {
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }, 100);
}

// エクスポート
export { exportICS };
