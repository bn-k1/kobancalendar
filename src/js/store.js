// store.js - Alpine.js による状態管理の実装
import Alpine from "alpinejs";
import { createStoreService } from "./store-service.js";

// ストア初期化
export function initializeStore() {
  // 状態オブジェクトの作成 - データのみを含む
  const stateData = {
    scheduleData: {
      holiday: [],
      saturday: [],
      weekday: [],
      rotationCycleLength: 0,
    },
    baseDates: [],
    currentBaseDate: null,
    lastBaseDate: null,
    holidayYearsRange: 0,
    userDefinedHolidays: [],
    icsExportConfig: {},
    eventConfig: null,
    allHolidays: {},
  };

  // ストアサービスの作成
  const storeService = createStoreService();

  // ストアにデータと関数を登録
  Alpine.store("state", {
    ...stateData,
    ...storeService,
  });
}
