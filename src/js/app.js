// app.js - メインアプリケーションのエントリーポイント
import { configureDayjs, setupAlpine } from "./app-initialization.js";
import { registerScheduleManager } from "./schedule-manager.js";

// Day.jsの設定
configureDayjs();

// コンポーネントの登録
registerScheduleManager();

// Alpine.jsの設定と起動
setupAlpine();
Alpine.start();
