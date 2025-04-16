// store/events.js - イベントタイプ関連の機能
import { getState } from "./state.js";

/**
 * イベントの種類を判定
 * @param {string} subject - イベント名/件名
 * @returns {Object} イベントタイプと設定
 */
function getEventType(subject) {
  const eventConfig = getState("eventConfig");

  if (!eventConfig || !eventConfig.events) {
    console.error("イベント設定が読み込まれていないか無効です");
    return { type: "default", config: eventConfig?.events?.default || {} };
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

export { getEventType };
