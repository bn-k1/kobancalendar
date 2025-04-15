// event-service.js - イベント関連の機能を提供するモジュール
import dayjs from "dayjs";
import { handleError } from "./utils.js";
import { ERROR_MESSAGES } from "./constants.js";

// イベントタイプの取得
export function getEventType(subject, eventConfig) {
  if (!eventConfig || !eventConfig.events) {
    handleError(
      new Error(ERROR_MESSAGES.EVENT_CONFIG_ERROR),
      ERROR_MESSAGES.EVENT_CONFIG_ERROR,
      false,
    );
    return {
      type: "default",
      config: eventConfig?.events?.default || {},
    };
  }

  // events オブジェクト内のすべてのイベントタイプを確認
  for (const [type, config] of Object.entries(eventConfig.events)) {
    // default 以外のイベントタイプの場合、キーワードをチェック
    if (
      type !== "default" &&
      config.keywords &&
      config.keywords.some((keyword) => subject?.includes(keyword))
    ) {
      return { type, config };
    }
  }

  // どのイベントタイプにも該当しなかった場合、default設定を返す
  return {
    type: "default",
    config: eventConfig.events.default,
  };
}

// 飲み会に参加可能かどうかを判定
export function canAttendMeetup(schedule, meetupStartTime, eventConfig) {
  if (!schedule) return false;

  const { subject, endTime } = schedule;

  // 公休、法休などの休日タイプを設定から取得
  if (eventConfig && eventConfig.events) {
    const restDayConfig = eventConfig.events.restDay;

    // 設定から取得した休日キーワードを使用して判定
    if (restDayConfig && restDayConfig.keywords) {
      if (restDayConfig.keywords.some((keyword) => subject === keyword)) {
        return true;
      }
    }
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

  // 勤務終了時間が飲み会開始時間より前なら参加可能
  return endTimeObj.isBefore(meetupTimeObj);
}
