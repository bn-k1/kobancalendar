// src/__tests__/composables/useEditedSchedules.test.js
// Characterization tests for useEditedSchedules composable
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useEditedSchedules } from "@/composables/useEditedSchedules";
import { makeStorageFail, restoreStorage } from "../setup";

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
    const edited = useEditedSchedules();
    expect(edited.editedSchedules.value).toEqual({});
  });

  it("isInitialized は false", () => {
    const edited = useEditedSchedules();
    expect(edited.isInitialized.value).toBe(false);
  });

  it("isEditsHidden は false", () => {
    const edited = useEditedSchedules();
    expect(edited.isEditsHidden.value).toBe(false);
  });

  it("editedSchedulesList は空配列", () => {
    const edited = useEditedSchedules();
    expect(edited.editedSchedulesList.value).toEqual([]);
  });

  it("hasAnyEdits は false", () => {
    const edited = useEditedSchedules();
    expect(edited.hasAnyEdits.value).toBe(false);
  });
});

describe("initEditedSchedules()", () => {
  it("localStorage が空のとき editedSchedules は空オブジェクトになる", () => {
    const edited = useEditedSchedules();
    edited.initEditedSchedules();
    expect(edited.editedSchedules.value).toEqual({});
    expect(edited.isInitialized.value).toBe(true);
  });

  it("2 回目以降の呼び出しは何もしない", () => {
    const edited = useEditedSchedules();
    edited.initEditedSchedules();
    // 最初の初期化後に手動でデータを変更
    edited.saveEditedSchedule("2025-11-20", { subject: "テスト" });
    // 再度呼んでも上書きされない
    edited.initEditedSchedules();
    expect(edited.hasEditedSchedule("2025-11-20")).toBe(true);
  });
});

describe("saveEditedSchedule() / hasEditedSchedule() / getEditedSchedule()", () => {
  it("日付文字列でスケジュールを保存・取得できる", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", {
      subject: "早番",
      startTime: "08:00",
      endTime: "16:00",
    });
    expect(edited.hasEditedSchedule("2025-11-20")).toBe(true);
    const s = edited.getEditedSchedule("2025-11-20");
    expect(s.subject).toBe("早番");
    expect(s.startTime).toBe("08:00");
    expect(s.endTime).toBe("16:00");
  });

  it("存在しない日付は hasEditedSchedule が false を返す", () => {
    const edited = useEditedSchedules();
    expect(edited.hasEditedSchedule("2025-11-20")).toBe(false);
  });

  it("存在しない日付は getEditedSchedule が undefined を返す", () => {
    const edited = useEditedSchedules();
    expect(edited.getEditedSchedule("2025-11-20")).toBeUndefined();
  });

  it("subject が undefined のときは空文字に正規化される", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", {});
    const s = edited.getEditedSchedule("2025-11-20");
    expect(s.subject).toBe("");
    expect(s.startTime).toBe("");
    expect(s.endTime).toBe("");
  });

  it("localStorage に JSON 形式で保存される", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", { subject: "公休" });
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw);
    expect(parsed["2025-11-20"].subject).toBe("公休");
  });
});

describe("removeEditedSchedule()", () => {
  it("指定した日付のスケジュールを削除する", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", { subject: "早番" });
    edited.removeEditedSchedule("2025-11-20");
    expect(edited.hasEditedSchedule("2025-11-20")).toBe(false);
  });

  it("存在しない日付を削除しても何も起きない", () => {
    const edited = useEditedSchedules();
    expect(() => edited.removeEditedSchedule("2099-01-01")).not.toThrow();
  });

  it("最後の1件を削除すると localStorage キーが消える", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", { subject: "早番" });
    edited.removeEditedSchedule("2025-11-20");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("clearAllEditedSchedules()", () => {
  it("全スケジュールを削除する", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", { subject: "早番" });
    edited.saveEditedSchedule("2025-11-21", { subject: "公休" });
    edited.clearAllEditedSchedules();
    expect(edited.editedSchedules.value).toEqual({});
    expect(edited.hasAnyEdits.value).toBe(false);
  });

  it("localStorage からも削除される", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", { subject: "早番" });
    edited.clearAllEditedSchedules();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe("loadFromStorage()", () => {
  it("JSON 形式のデータを正しく読み込む", () => {
    const data = {
      "2025-11-20": { subject: "早番", startTime: "08:00", endTime: "16:00" },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    const edited = useEditedSchedules();
    edited.loadFromStorage();
    expect(edited.getEditedSchedule("2025-11-20")?.subject).toBe("早番");
  });

  it("レガシー CSV 形式も読み込める", () => {
    // CSV: dateStr,subject,startTime,endTime
    const csv = "2025-11-20,公休,,\n2025-11-21,早番,08:00,16:00";
    localStorage.setItem(STORAGE_KEY, csv);
    const edited = useEditedSchedules();
    edited.loadFromStorage();
    expect(edited.getEditedSchedule("2025-11-20")?.subject).toBe("公休");
    expect(edited.getEditedSchedule("2025-11-21")?.subject).toBe("早番");
  });

  it("localStorage が空のとき editedSchedules は空になる", () => {
    const edited = useEditedSchedules();
    edited.loadFromStorage();
    expect(edited.editedSchedules.value).toEqual({});
  });
});

describe("setEditsHidden()", () => {
  it("true を設定すると isEditsHidden が true になる", () => {
    const edited = useEditedSchedules();
    edited.setEditsHidden(true);
    expect(edited.isEditsHidden.value).toBe(true);
  });

  it("false を設定すると isEditsHidden が false になる", () => {
    const edited = useEditedSchedules();
    edited.setEditsHidden(true);
    edited.setEditsHidden(false);
    expect(edited.isEditsHidden.value).toBe(false);
  });

  it("true のとき localStorage に 'on' を保存する", () => {
    const edited = useEditedSchedules();
    edited.setEditsHidden(true);
    expect(localStorage.getItem(HIDDEN_KEY)).toBe("on");
  });

  it("false のとき localStorage に 'off' を保存する", () => {
    const edited = useEditedSchedules();
    edited.setEditsHidden(false);
    expect(localStorage.getItem(HIDDEN_KEY)).toBe("off");
  });

  it("loadHiddenFromStorage で 'on' を読み込むと isEditsHidden が true になる", () => {
    localStorage.setItem(HIDDEN_KEY, "on");
    const edited = useEditedSchedules();
    edited.initEditedSchedules();
    expect(edited.isEditsHidden.value).toBe(true);
  });
});

describe("editedSchedulesList (computed)", () => {
  it("日付順にソートされた配列を返す", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-22", { subject: "B" });
    edited.saveEditedSchedule("2025-11-20", { subject: "A" });
    edited.saveEditedSchedule("2025-11-21", { subject: "C" });
    const list = edited.editedSchedulesList.value;
    expect(list[0].dateStr).toBe("2025-11-20");
    expect(list[1].dateStr).toBe("2025-11-21");
    expect(list[2].dateStr).toBe("2025-11-22");
  });

  it("各要素に displayDate と weekday が含まれる", () => {
    const edited = useEditedSchedules();
    // 2025-11-20 は木曜
    edited.saveEditedSchedule("2025-11-20", { subject: "早番" });
    const item = edited.editedSchedulesList.value[0];
    expect(item.displayDate).toBe("2025/11/20");
    expect(item.weekday).toBe("木");
    expect(item.subject).toBe("早番");
  });

  it("空のとき空配列を返す", () => {
    const edited = useEditedSchedules();
    expect(edited.editedSchedulesList.value).toEqual([]);
  });
});

describe("hasAnyEdits (computed)", () => {
  it("スケジュールが存在すると true", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", { subject: "早番" });
    expect(edited.hasAnyEdits.value).toBe(true);
  });

  it("全削除後は false", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", { subject: "早番" });
    edited.clearAllEditedSchedules();
    expect(edited.hasAnyEdits.value).toBe(false);
  });
});

// loadFromStorage/loadHiddenFromStorage/setEditsHidden/saveToStorage each
// wrap their localStorage call in try/catch and log via console.error (Safari
// private-mode / QuotaExceededError survival). These tests exercise those
// catch branches directly and assert exactly what they promise: no throw,
// and — for reads — a safe default; for writes — the in-memory state is kept
// even though persistence silently failed (fire-and-forget saveToStorage).
describe("localStorage 障害時のフォールバック（Safari プライベートブラウズ等）", () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    restoreStorage();
    errorSpy.mockRestore();
  });

  it("loadFromStorage: getItem が失敗しても例外を投げず editedSchedules は空になる", () => {
    const edited = useEditedSchedules();
    makeStorageFail("getItem");
    expect(() => edited.loadFromStorage()).not.toThrow();
    expect(edited.editedSchedules.value).toEqual({});
  });

  it("initEditedSchedules: getItem が失敗しても例外を投げず isEditsHidden は false のまま、isInitialized は true になる", () => {
    const edited = useEditedSchedules();
    makeStorageFail("getItem");
    expect(() => edited.initEditedSchedules()).not.toThrow();
    expect(edited.isEditsHidden.value).toBe(false);
    expect(edited.isInitialized.value).toBe(true);
  });

  it("saveEditedSchedule: setItem が失敗しても例外を投げず、メモリ上の編集は保持される（永続化のみ失敗）", () => {
    const edited = useEditedSchedules();
    makeStorageFail("setItem");
    expect(() =>
      edited.saveEditedSchedule("2025-11-20", { subject: "早番" }),
    ).not.toThrow();
    expect(edited.hasEditedSchedule("2025-11-20")).toBe(true);
  });

  it("removeEditedSchedule: 削除後の保存で removeItem が失敗しても例外を投げず、メモリ上は削除済みになる", () => {
    const edited = useEditedSchedules();
    edited.saveEditedSchedule("2025-11-20", { subject: "早番" });
    makeStorageFail("removeItem");
    expect(() => edited.removeEditedSchedule("2025-11-20")).not.toThrow();
    expect(edited.hasEditedSchedule("2025-11-20")).toBe(false);
  });

  it("setEditsHidden: setItem が失敗しても例外を投げず isEditsHidden は更新される", () => {
    const edited = useEditedSchedules();
    makeStorageFail("setItem");
    expect(() => edited.setEditsHidden(true)).not.toThrow();
    expect(edited.isEditsHidden.value).toBe(true);
  });
});
