// src/__tests__/setup.js
// Test environment setup - localStorage mock for happy-dom
import { vi } from "vitest";

// happy-dom の localStorage は Storage interface を実装していないため
// 完全な mock に置き換える
const createStorageMock = () => {
  const store = {};
  return {
    getItem(key) {
      return store[key] !== undefined ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
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
};

vi.stubGlobal("localStorage", createStorageMock());
