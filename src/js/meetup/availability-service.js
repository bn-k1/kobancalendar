// meetup/availability-service.js - 参加可否判定機能
import Alpine from "alpinejs";
import dayjs from "dayjs";
import { canAttendMeetup } from "../event-service.js";

/**
 * 飲み会可能日検索機能
 * @param {Array} positions - 参加者のポジション（コマ位置）
 * @param {string} meetupStartTime - 飲み会開始時間
 * @param {dayjs} startDate - 検索開始日
 * @param {dayjs} endDate - 検索終了日
 * @param {string} selectedBaseDate - 選択された基準日
 * @param {dayjs} lastBaseDate - 最終基準日
 * @param {Function} checkDateFn - 日付チェック関数
 * @returns {Object} 検索結果
 */
export function findMeetupDates(
  positions,
  meetupStartTime,
  startDate,
  endDate,
  selectedBaseDate,
  lastBaseDate,
  checkDateFn,
) {
  const result = {
    allMatches: [], // 全員参加可能な日
    partialMatches: [], // 部分的に参加可能な日
  };

  // 日付ごとに検索
  let currentDate = dayjs(startDate);
  while (currentDate.isBefore(endDate)) {
    const dateResults = checkDateFn(currentDate, positions, meetupStartTime);

    // 全員参加可能な場合
    if (dateResults.availablePositions.length === positions.length) {
      result.allMatches.push({
        date: currentDate,
        availableCount: dateResults.availablePositions.length,
        totalCount: positions.length,
        details: dateResults.details,
      });
    }
    // 一部参加可能な場合（最低1人以上が参加可能）
    else if (dateResults.availablePositions.length > 0) {
      result.partialMatches.push({
        date: currentDate,
        availableCount: dateResults.availablePositions.length,
        totalCount: positions.length,
        details: dateResults.details,
      });
    }

    currentDate = currentDate.add(1, "day");
  }

  // 日付でソート
  result.allMatches.sort((a, b) => a.date.unix() - b.date.unix());
  result.partialMatches.sort((a, b) => {
    // まず参加可能人数で降順、同じ場合は日付で昇順
    if (b.availableCount !== a.availableCount) {
      return b.availableCount - a.availableCount;
    }
    return a.date.unix() - b.date.unix();
  });

  return result;
}

/**
 * 特定の日付について、各コマ位置の参加可否を確認
 * @param {dayjs} date - 確認する日付
 * @param {Array} positions - 確認するポジション（コマ位置）
 * @param {string} meetupStartTime - 飲み会開始時間
 * @param {dayjs} currentBaseDate - 現在の基準日
 * @param {dayjs} lastBaseDate - 最終基準日
 * @returns {Object} 確認結果
 */
export function checkDateForPositions(
  date,
  positions,
  meetupStartTime,
  currentBaseDate,
  lastBaseDate,
) {
  const result = {
    availablePositions: [],
    details: [],
  };

  for (const position of positions) {
    // その日のスケジュールを取得
    const schedule = Alpine.store("state").getScheduleForDate(
      date,
      position,
      currentBaseDate,
      lastBaseDate,
    );

    // 参加可否を判定
    const isAvailable = canAttendMeetup(
      schedule,
      meetupStartTime,
      Alpine.store("state").eventConfig,
    );

    // 詳細情報を記録
    result.details.push({
      position,
      schedule,
      isAvailable,
    });

    // 参加可能なら記録
    if (isAvailable) {
      result.availablePositions.push(position);
    }
  }

  return result;
}
