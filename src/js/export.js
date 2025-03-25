// export.js - CSVエクスポート機能を提供
import dayjs from "dayjs";
import { calculateScheduleRange } from "./calc.js";

// CSVエクスポート機能
function exportCSV(months, startPosition, currentBaseDate, lastBaseDate) {
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

  // CSVヘッダーの作成
  let csvContent = "Subject,Start Date,Start Time,End Time\n";

  // 各勤務スケジュールをCSV行に変換
  scheduleRange.forEach((schedule) => {
    const { subject, startTime, endTime } = schedule;
    const formattedDate = schedule.date.format("YYYY/MM/DD");

    // 各フィールドを引用符で囲む（カンマを含む場合の対策）
    const escapedSubject = `"${subject.replace(/"/g, '""')}"`;
    csvContent += `${escapedSubject},${formattedDate},${startTime},${endTime}\n`;
  });

  // CSVファイルのダウンロード
  downloadCSV(csvContent);
}

// CSVファイルをダウンロードするヘルパー関数
function downloadCSV(csvContent) {
  // UTF-8のBOMを付加
  const BOM = new Uint8Array([0xef, 0xbb, 0xbf]);

  // Blobを生成（BOMを先頭に付加）
  const blob = new Blob([BOM, csvContent], { type: "text/csv;charset=utf-8" });

  // IE11対応のためにWindowsコードページ932（Shift-JIS）を使用しない
  // 代わりにUTF-8 with BOMを使用する

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  const currentDateStr = dayjs().format("YYYY-MM-DD");

  downloadLink.href = url;
  downloadLink.download = `schedule_${currentDateStr}.csv`;

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
export { exportCSV };
