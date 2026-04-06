// src/__tests__/stores/editedSchedules.test.js
// Characterization tests for editedSchedules store
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useEditedSchedules } from "@/stores/editedSchedules";

const STORAGE_KEY = "kobancalendar_edited_schedules";
const HIDDEN_KEY = "kobancalendar_edited_schedules_hidden";

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(HIDDEN_KEY);
}

beforeEach(() => {
  setActivePinia(createPinia());
  clearStorage();
});

afterEach(() => {
  clearStorage();
});

describe("初期状態", () => {
  it("editedSchedules は空オブジェクト", () => {
    const store = useEditedSchedules();
    expect(store.editedSchedules).toEqual({});
  });

  it("isInitialized は false", () => {
    const store = useEditedSchedules();
    expect(store.isInitialized).toBe(false);
  });

  it("isEditsHidden は false", () => {
    const store = useEditedSchedules();
    expect(store.isEditsHidden).toBe(false);
  });

  it("editedSchedulesList は空配列", () => {
    const store = useEditedSchedules();
    expect(store.editedSchedulesList).toEqual([]);
  });

  it("hasAnyEdits は false", () => {
    const store = useEditedSchedules();
    expect(store.hasAnyEdits).toBe(false);
  });
});

describe("initEditedSchedules()", () => {
  it("localStorage が空のとき editedSchedules は空オブジェクトになる", () => {
    const store = useEditedSchedules();
    store.initEditedSchedules();
    expect(store.editedSchedules).toEqual({});
    expect(store.isInitialized).toBe(true);
  });

  it("2 回目以降の呼び出しは何もしない", () => {
    const store = useEditedSchedules();
    store.initEditedSchedules();
    // 最初の初期化後に手動でデータを変更
    store.saveEditedSchedule("2025-11-20", { subject: "テスト" });
    // 再度呼んでも上書きされない
    store.initEditedSchedules();
    expect(store.hasEditedSchedule("2025-11-20")).toBe(true);
  });
});

describe("saveEditedSchedule() / hasEditedSchedule() / getEditedSchedule()", () => {
  it("日付文字列でスケジュールを保存・取得できる", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-20", {
      subject: "早番",
      startTime: "08:00",
      endTime: "16:00",
    });
    expect(store.hasEditedSchedule("2025-11-20")).toBe(true);
    const s = store.getEditedSchedule("2025-11-20");
    expect(s.subject).toBe("早番");
    expect(s.startTime).toBe("08:00");
    expect(s.endTime).toBe("16:00");
  });

  it("存在しない日付は hasEditedSchedule が false を返す", () => {
    const store = useEditedSchedules();
    expect(store.hasEditedSchedule("2025-11-20")).toBe(false);
  });

  it("存在しない日付は getEditedSchedule が undefined を返す", () => {
    const store = useEditedSchedules();
    expect(store.getEditedSchedule("2025-11-20")).toBeUndefined();
  });

  it("subject が undefined のときは空文字に正規化される", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-20", {});
    const s = store.getEditedSchedule("2025-11-20");
    expect(s.subject).toBe("");
    expect(s.startTime).toBe("");
    expect(s.endTime).toBe("");
  });

  it("localStorage に JSON 形式で保存される", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-20", { subject: "公休" });
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    expect(parsed["2025-11-20"].subject).toBe("公休");
  });
});

describe("removeEditedSchedule()", () => {
  it("指定した日付のスケジュールを削除する", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-20", { subject: "早番" });
    store.removeEditedSchedule("2025-11-20");
    expect(store.hasEditedSchedule("2025-11-20")).toBe(false);
  });

  it("存在しない日付を削除しても何も起きない", () => {
    const store = useEditedSchedules();
    expect(() => store.removeEditedSchedule("2099-01-01")).not.toThrow();
  });

  it("最後の1件を削除すると localStorage キーが消える", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-20", { subject: "早番" });
    store.removeEditedSchedule("2025-11-20");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("clearAllEditedSchedules()", () => {
  it("全スケジュールを削除する", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-20", { subject: "早番" });
    store.saveEditedSchedule("2025-11-21", { subject: "公休" });
    store.clearAllEditedSchedules();
    expect(store.editedSchedules).toEqual({});
    expect(store.hasAnyEdits).toBe(false);
  });

  it("localStorage からも削除される", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-20", { subject: "早番" });
    store.clearAllEditedSchedules();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("loadFromStorage()", () => {
  it("JSON 形式のデータを正しく読み込む", () => {
    const data = {
      "2025-11-20": { subject: "早番", startTime: "08:00", endTime: "16:00" },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const store = useEditedSchedules();
    store.loadFromStorage();
    expect(store.getEditedSchedule("2025-11-20")?.subject).toBe("早番");
  });

  it("レガシー CSV 形式も読み込める", () => {
    // CSV: dateStr,subject,startTime,endTime
    const csv = "2025-11-20,公休,,\n2025-11-21,早番,08:00,16:00";
    localStorage.setItem(STORAGE_KEY, csv);
    const store = useEditedSchedules();
    store.loadFromStorage();
    expect(store.getEditedSchedule("2025-11-20")?.subject).toBe("公休");
    expect(store.getEditedSchedule("2025-11-21")?.subject).toBe("早番");
  });

  it("localStorage が空のとき editedSchedules は空になる", () => {
    const store = useEditedSchedules();
    store.loadFromStorage();
    expect(store.editedSchedules).toEqual({});
  });
});

describe("setEditsHidden()", () => {
  it("true を設定すると isEditsHidden が true になる", () => {
    const store = useEditedSchedules();
    store.setEditsHidden(true);
    expect(store.isEditsHidden).toBe(true);
  });

  it("false を設定すると isEditsHidden が false になる", () => {
    const store = useEditedSchedules();
    store.setEditsHidden(true);
    store.setEditsHidden(false);
    expect(store.isEditsHidden).toBe(false);
  });

  it("true のとき localStorage に 'on' を保存する", () => {
    const store = useEditedSchedules();
    store.setEditsHidden(true);
    expect(localStorage.getItem(HIDDEN_KEY)).toBe("on");
  });

  it("false のとき localStorage に 'off' を保存する", () => {
    const store = useEditedSchedules();
    store.setEditsHidden(false);
    expect(localStorage.getItem(HIDDEN_KEY)).toBe("off");
  });

  it("loadHiddenFromStorage で 'on' を読み込むと isEditsHidden が true になる", () => {
    localStorage.setItem(HIDDEN_KEY, "on");
    const store = useEditedSchedules();
    store.initEditedSchedules();
    expect(store.isEditsHidden).toBe(true);
  });
});

describe("editedSchedulesList (computed)", () => {
  it("日付順にソートされた配列を返す", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-22", { subject: "B" });
    store.saveEditedSchedule("2025-11-20", { subject: "A" });
    store.saveEditedSchedule("2025-11-21", { subject: "C" });
    const list = store.editedSchedulesList;
    expect(list[0].dateStr).toBe("2025-11-20");
    expect(list[1].dateStr).toBe("2025-11-21");
    expect(list[2].dateStr).toBe("2025-11-22");
  });

  it("各要素に displayDate と weekday が含まれる", () => {
    const store = useEditedSchedules();
    // 2025-11-20 は木曜
    store.saveEditedSchedule("2025-11-20", { subject: "早番" });
    const item = store.editedSchedulesList[0];
    expect(item.displayDate).toBe("2025/11/20");
    expect(item.weekday).toBe("木");
    expect(item.subject).toBe("早番");
  });

  it("空のとき空配列を返す", () => {
    const store = useEditedSchedules();
    expect(store.editedSchedulesList).toEqual([]);
  });
});

describe("hasAnyEdits (computed)", () => {
  it("スケジュールが存在すると true", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-20", { subject: "早番" });
    expect(store.hasAnyEdits).toBe(true);
  });

  it("全削除後は false", () => {
    const store = useEditedSchedules();
    store.saveEditedSchedule("2025-11-20", { subject: "早番" });
    store.clearAllEditedSchedules();
    expect(store.hasAnyEdits).toBe(false);
  });
});
