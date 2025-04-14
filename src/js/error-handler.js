// error-handler.js - エラー処理とロギングを管理するモジュール

/**
 * アプリケーションエラーを処理する関数
 * @param {Error} error - エラーオブジェクト
 * @param {string} context - エラーが発生したコンテキスト
 * @param {boolean} showAlert - ユーザーにアラートを表示するかどうか
 */
export function handleError(error, context, showAlert = true) {
  // エラーをコンソールに記録
  console.error(`${context}:`, error);

  // ユーザーにエラーを通知
  if (showAlert) {
    alert(`${context}: ${error.message}`);
  }

  // エラー詳細をログに記録（将来的に分析できるよう）
  logError(error, context);

  return { success: false, error: error.message };
}

/**
 * エラーをログに記録する関数
 * @param {Error} error - エラーオブジェクト
 * @param {string} context - エラーが発生したコンテキスト
 * @private
 */
function logError(error, context) {
  // 将来的にはエラー追跡サービスへの送信やローカルストレージへの保存などを実装
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    message: error.message,
    stack: error.stack,
    userAgent: navigator.userAgent,
  };

  // 現時点ではコンソールにログを出力
  console.debug("Error Log:", errorLog);
}

/**
 * UIコンポーネント初期化時のエラーハンドラー
 * @param {Function} initFunction - 初期化関数
 * @returns {Function} エラーハンドリングを含む初期化関数
 */
export function withErrorHandling(initFunction) {
  return async function () {
    try {
      await initFunction.call(this);
    } catch (error) {
      handleError(error, "コンポーネントの初期化に失敗しました", true);
      this.isLoaded = false; // コンポーネントの読み込み状態を更新
    }
  };
}
