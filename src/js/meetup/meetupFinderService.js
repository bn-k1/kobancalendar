// meetup/meetupFinderService.js - 飲み会可能日検索サービス
import dayjs from "dayjs";
import { getScheduleForDate, getState } from "../store/index.js";

export class MeetupFinderService {
  /**
   * 飲み会に参加可能かどうかを判定
   * @param {Object} schedule - スケジュール情報
   * @param {string} meetupStartTime - 飲み会開始時間 (HH:MM)
   * @returns {boolean} 参加可能かどうか
   */
  canAttendMeetup(schedule, meetupStartTime) {
    if (!schedule) return false;

    const { subject, endTime } = schedule;

    // 公休、法休は常に参加可能
    if (subject === "公休" || subject === "法休" || subject === "-") {
      return true;
    }

    // 勤務終了時間が設定されていない場合は参加不可
    if (!endTime) {
      return false;
    }

    // 勤務終了時間を解析
    const [endHour, endMinute = "00"] = endTime.split(":");
    const endTimeObj = dayjs()
      .hour(parseInt(endHour, 10))
      .minute(parseInt(endMinute, 10));

    // 飲み会開始時間を解析
    const [meetupHour, meetupMinute = "00"] = meetupStartTime.split(":");
    const meetupTimeObj = dayjs()
      .hour(parseInt(meetupHour, 10))
      .minute(parseInt(meetupMinute, 10));

    // 夜勤の場合（終了時間が24:00以降）は参加不可
    if (parseInt(endHour, 10) >= 24) {
      return false;
    }

    // 勤務終了時間が飲み会開始時間より前なら参加可能
    return endTimeObj.isBefore(meetupTimeObj);
  }

  /**
   * 指定された期間内で飲み会に適した日を検索
   * @param {Array} positions - 参加者のコマ位置の配列
   * @param {string} meetupStartTime - 飲み会開始時間 (HH:MM)
   * @param {dayjs} startDate - 検索開始日
   * @param {dayjs} endDate - 検索終了日
   * @returns {Object} 検索結果
   */
  findMeetupDates(positions, meetupStartTime, startDate, endDate) {
    const result = {
      allMatches: [], // 全員参加可能な日
      partialMatches: [], // 部分的に参加可能な日
    };

    // 基準日の設定
    const currentBaseDate = getState("currentBaseDate");
    const lastBaseDate = getState("lastBaseDate");

    // 日付ごとに検索
    let currentDate = dayjs(startDate);
    while (currentDate.isBefore(endDate)) {
      const dateResults = this.checkDateForPositions(
        currentDate,
        positions,
        meetupStartTime,
        currentBaseDate,
        lastBaseDate,
      );

      // 全員参加可能な場合
      if (dateResults.availablePositions.length === positions.length) {
        result.allMatches.push({
          date: currentDate,
          availableCount: dateResults.availablePositions.length,
          totalCount: positions.length,
          details: dateResults.details,
        });
      }
      // 一部参加可能な場合（最低2人以上が参加可能）
      else if (dateResults.availablePositions.length > 1) {
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
   * @param {Array} positions - コマ位置の配列
   * @param {string} meetupStartTime - 飲み会開始時間 (HH:MM)
   * @param {dayjs} currentBaseDate - 現在の基準日
   * @param {dayjs} lastBaseDate - 最終基準日
   * @returns {Object} 確認結果
   */
  checkDateForPositions(
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
      const schedule = getScheduleForDate(
        date,
        position,
        currentBaseDate,
        lastBaseDate,
      );

      // 参加可否を判定
      const isAvailable = this.canAttendMeetup(schedule, meetupStartTime);

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
}
