// src/__tests__/stores/alertModal.test.js
// Characterization tests for alertModal store
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAlertModalStore } from "@/stores/alertModal";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("useAlertModalStore 初期状態", () => {
  it("isVisible は false", () => {
    const store = useAlertModalStore();
    expect(store.isVisible).toBe(false);
  });

  it("title は 'Notification'", () => {
    const store = useAlertModalStore();
    expect(store.title).toBe("Notification");
  });

  it("message は空文字", () => {
    const store = useAlertModalStore();
    expect(store.message).toBe("");
  });

  it("suggestedNumber は null", () => {
    const store = useAlertModalStore();
    expect(store.suggestedNumber).toBeNull();
  });
});

describe("open()", () => {
  it("title と message を設定して表示状態にする", () => {
    const store = useAlertModalStore();
    store.open({ title: "テスト", message: "本文" });
    expect(store.isVisible).toBe(true);
    expect(store.title).toBe("テスト");
    expect(store.message).toBe("本文");
  });

  it("整数の suggestedNumber を設定する", () => {
    const store = useAlertModalStore();
    store.open({ suggestedNumber: 42 });
    expect(store.suggestedNumber).toBe(42);
  });

  it("整数でない suggestedNumber は null になる", () => {
    const store = useAlertModalStore();
    store.open({ suggestedNumber: 3.5 });
    expect(store.suggestedNumber).toBeNull();
  });

  it("文字列の suggestedNumber は null になる", () => {
    const store = useAlertModalStore();
    store.open({ suggestedNumber: "42" });
    expect(store.suggestedNumber).toBeNull();
  });

  it("引数なしで open() するとデフォルト値が使われる", () => {
    const store = useAlertModalStore();
    store.open();
    expect(store.isVisible).toBe(true);
    expect(store.title).toBe("Notification");
    expect(store.message).toBe("");
    expect(store.suggestedNumber).toBeNull();
  });
});

describe("close()", () => {
  it("isVisible を false に戻す", () => {
    const store = useAlertModalStore();
    store.open({ title: "テスト" });
    store.close();
    expect(store.isVisible).toBe(false);
  });

  it("suggestedNumber を null にリセットする", () => {
    const store = useAlertModalStore();
    store.open({ suggestedNumber: 10 });
    store.close();
    expect(store.suggestedNumber).toBeNull();
  });

  it("title と message は変わらない", () => {
    const store = useAlertModalStore();
    store.open({ title: "タイトル", message: "本文" });
    store.close();
    expect(store.title).toBe("タイトル");
    expect(store.message).toBe("本文");
  });
});
