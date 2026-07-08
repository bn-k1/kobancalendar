// src/__tests__/setup.js
// Test environment setup - localStorage mock for happy-dom
import { beforeEach, vi } from "vitest";

// happy-dom の localStorage は Storage interface を実装していないため
// 完全な mock に置き換える。
//
// `failing` は「次にどのメソッドを呼んだら throw するか」を保持する追加機能。
// production コード（useLocalParams.js の readStoredObject/writeStoredObject/
// removeStoredObject、stores/editedSchedules.js、composables/useAdminToken.js）
// は Safari プライベートブラウズや QuotaExceededError で localStorage が例外を
// 投げるケースを catch して握りつぶす設計になっている。その catch 分岐を実際に
// テストするには mock 自体が意図的に throw できる必要がある。デフォルトでは何も
// failing に入っておらず、既存テストの挙動は変えない。
const store = {};
let failing = new Set();

function throwIfFailing(method) {
  if (failing.has(method)) {
    const error = new Error(`simulated localStorage.${method}() failure`);
    error.name = "QuotaExceededError";
    throw error;
  }
}

const storageMock = {
  getItem(key) {
    throwIfFailing("getItem");
    return store[key] !== undefined ? store[key] : null;
  },
  setItem(key, value) {
    throwIfFailing("setItem");
    store[key] = String(value);
  },
  removeItem(key) {
    throwIfFailing("removeItem");
    delete store[key];
  },
  clear() {
    Object.keys(store).forEach((k) => delete store[k]);
  },
  get length() {
    return Object.keys(store).length;
  },
  key(i) {
    return Object.keys(store)[i] ?? null;
  },
};

vi.stubGlobal("localStorage", storageMock);

/**
 * Make one or more localStorage methods throw on every subsequent call, to
 * exercise the storage-failure catch branches production code carries for
 * Safari private-mode / QuotaExceededError. Automatically reset before every
 * test by the global beforeEach below — no manual cleanup required, but
 * calling restoreStorage() explicitly is fine too.
 *
 * @param {...("getItem"|"setItem"|"removeItem")} methods defaults to all three
 */
export function makeStorageFail(...methods) {
  failing = new Set(
    methods.length > 0 ? methods : ["getItem", "setItem", "removeItem"],
  );
}

/** Stop simulating storage failures (also done automatically each test). */
export function restoreStorage() {
  failing = new Set();
}

beforeEach(() => {
  restoreStorage();
  localStorage.clear();
});
