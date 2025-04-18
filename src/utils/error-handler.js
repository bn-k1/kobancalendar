// エラーハンドリングのためのメモリストア
const shownErrors = new Map();

/**
 * エラーハンドリング関数
 * 同じエラーが複数回表示されるのを防ぎつつコンソールとUI両方にエラーを表示
 *
 * @param {Error} error エラーオブジェクト
 * @param {string} context エラーコンテキスト（どこでエラーが発生したか）
 * @param {boolean} showAlert アラートを表示するかどうか
 * @returns {Object} エラー情報
 */
export function handleError(error, context, showAlert = true) {
  // エラーをコンソールに記録
  console.error(`${context}:`, error);

  // 重複アラートを防止
  const errorKey = `${context}_${error.message}`;

  // ユーザーにエラーを通知（一度だけ）
  if (showAlert && !shownErrors.has(errorKey)) {
    shownErrors.set(errorKey, true);
    alert(`${error.message}`);
  }

  return { success: false, error: error.message };
}
