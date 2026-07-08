// src/__tests__/stores/editedSchedules.test.js
// Characterization tests for editedSchedules store (raw state only —
// business logic is covered in __tests__/composables/useEditedSchedules.test.js)
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useEditedSchedulesStore } from "@/stores/editedSchedules";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("useEditedSchedulesStore 初期状態", () => {
  it("editedSchedules は空オブジェクト", () => {
    const store = useEditedSchedulesStore();
    expect(store.editedSchedules).toEqual({});
  });

  it("isInitialized は false", () => {
    const store = useEditedSchedulesStore();
    expect(store.isInitialized).toBe(false);
  });

  it("isEditsHidden は false", () => {
    const store = useEditedSchedulesStore();
    expect(store.isEditsHidden).toBe(false);
  });

  it("hasAnyEdits は false", () => {
    const store = useEditedSchedulesStore();
    expect(store.hasAnyEdits).toBe(false);
  });
});

describe("setEditedSchedules()", () => {
  it("オブジェクトをそのままセットできる", () => {
    const store = useEditedSchedulesStore();
    store.setEditedSchedules({
      "2025-11-20": { subject: "早番", startTime: "", endTime: "", note: "" },
    });
    expect(store.editedSchedules["2025-11-20"].subject).toBe("早番");
  });

  it("非空になると hasAnyEdits が true になる", () => {
    const store = useEditedSchedulesStore();
    store.setEditedSchedules({ "2025-11-20": { subject: "早番" } });
    expect(store.hasAnyEdits).toBe(true);
  });

  it("オブジェクトでない値は空オブジェクトに正規化される", () => {
    const store = useEditedSchedulesStore();
    store.setEditedSchedules(null);
    expect(store.editedSchedules).toEqual({});
  });

  it("配列は空オブジェクトに正規化される", () => {
    const store = useEditedSchedulesStore();
    store.setEditedSchedules([1, 2, 3]);
    expect(store.editedSchedules).toEqual({});
  });
});

describe("setIsInitialized()", () => {
  it("true をセットできる", () => {
    const store = useEditedSchedulesStore();
    store.setIsInitialized(true);
    expect(store.isInitialized).toBe(true);
  });

  it("truthy でない値も boolean に正規化される", () => {
    const store = useEditedSchedulesStore();
    store.setIsInitialized(0);
    expect(store.isInitialized).toBe(false);
  });
});

describe("setIsEditsHidden()", () => {
  it("true をセットできる", () => {
    const store = useEditedSchedulesStore();
    store.setIsEditsHidden(true);
    expect(store.isEditsHidden).toBe(true);
  });

  it("truthy でない値も boolean に正規化される", () => {
    const store = useEditedSchedulesStore();
    store.setIsEditsHidden(null);
    expect(store.isEditsHidden).toBe(false);
  });
});
