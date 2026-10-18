// happy-dom's localStorage doesn't implement Storage; swap in a plain one.
import { beforeEach, vi } from "vitest";

const store = new Map();
vi.stubGlobal("localStorage", {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear(),
});

beforeEach(() => store.clear());
