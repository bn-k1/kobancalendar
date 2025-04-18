import dayjs from "dayjs";
import ical from "ical-generator";
import { DATE_FORMATS } from "@/config/constants";
import { useScheduleStore } from "@/stores/schedule";
import { useCalendarStore } from "@/stores/calendar";

// ICSエクスポート機能
export function exportICS(
  months,
  startPosition,
  currentBaseDate,
  lastBaseDate,
) {
  try {
    const scheduleStore = useScheduleStore();
    const calendarStore = useCalendarStore();

    const today = dayjs().startOf("day");
    const startDate =
      currentBaseDate.isAfter(today) || currentBaseDate.isSame(today)
        ? currentBaseDate.startOf("day")
        : today;
    const endDate = startDate.add(months, "month");

    // 日付範囲の勤務スケジュールを取得
    const scheduleRange = scheduleStore.calculateScheduleRange(
      startDate,
      endDate,
      startPosition,
      currentBaseDate,
    );

    // 設定から値を取得
    const icsConfig = calendarStore.icsExportConfig;

    // ical-generatorを使用してカレンダーを作成
    const calendar = ical({
      name: icsConfig.calendar_name,
      timezone: icsConfig.timezone,
      prodId: {
        company: icsConfig.company,
        product: icsConfig.product,
        language: icsConfig.language,
      },
    });

    // 各勤務スケジュールをカレンダーイベントに変換
    scheduleRange.forEach((schedule) => {
      const { subject, startTime, endTime, date } = schedule;
      const eventDate = date;
      const event = calendar.createEvent({
        summary: subject,
        uid: generateUID(
          date,
          subject,
          startTime,
          endTime,
          icsConfig.uid_domain,
        ),
      });

      // 時間がある場合は時刻を設定、ない場合は終日イベントとして扱う
      if (startTime && endTime) {
        const [startHour, startMinute = "00"] = startTime.split(":");
        const [endHour, endMinute = "00"] = endTime.split(":");

        const start = eventDate
          .hour(parseInt(startHour, 10))
          .minute(parseInt(startMinute, 10))
          .second(0)
          .toDate();

        const end = eventDate
          .hour(parseInt(endHour, 10))
          .minute(parseInt(endMinute, 10))
          .second(0)
          .toDate();

        event.start(start);
        event.end(end);
      } else {
        // 終日イベントの設定
        event.allDay(true);
        event.start(eventDate.toDate());
      }
    });

    // ICSファイルをダウンロード
    downloadICS(calendar.toString(), startDate, endDate);
    return true;
  } catch (error) {
    console.error("ICSファイルのエクスポート中にエラーが発生しました", error);
    throw error;
  }
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
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

// UID生成関数 - 同一スケジュールには常に同じUIDを返すように改善
function generateUID(
  date,
  subject = "",
  startTime = "",
  endTime = "",
  domain = null,
) {
  const calendarStore = useCalendarStore();
  // ドメインが指定されていない場合はICS設定から取得
  const uidDomain = domain || calendarStore.icsExportConfig.uid_domain;
  const dateStr = date.format(DATE_FORMATS.FILE_NAME_DATE);
  const contentHash = simpleHash(`${subject}-${startTime}-${endTime}`);
  return `${dateStr}-${contentHash}@${uidDomain}`;
}

function simpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16);
}
