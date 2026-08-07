import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  SIDEBAR_OPEN_STORAGE_KEY,
  clearSidebarOpenPreference,
  readSidebarOpenPreference,
  writeSidebarOpenPreference,
} from "@/lib/sidebar-prefs";

function installStorageMock() {
  const store = new Map<string, string>();
  const ls = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
    clear: () => { store.clear(); },
  };
  vi.stubGlobal("window", { localStorage: ls });
  return store;
}

describe("sidebar-prefs", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    installStorageMock();
  });

  it("returns true for saved open value", () => {
    window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, "1");
    expect(readSidebarOpenPreference(false)).toBe(true);
  });

  it("returns false for saved closed value", () => {
    window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, "0");
    expect(readSidebarOpenPreference(false)).toBe(false);
  });

  it("defaults desktop to open when preference missing", () => {
    expect(readSidebarOpenPreference(false)).toBe(true);
  });

  it("defaults mobile to closed when preference missing", () => {
    expect(readSidebarOpenPreference(true)).toBe(false);
  });

  it("ignores corrupted saved values", () => {
    window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, "maybe");
    expect(readSidebarOpenPreference(false)).toBe(true);
    expect(readSidebarOpenPreference(true)).toBe(false);
  });

  it("writes valid preference values", () => {
    writeSidebarOpenPreference(false);
    expect(window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY)).toBe("0");
    writeSidebarOpenPreference(true);
    expect(window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY)).toBe("1");
  });

  it("clears preference key", () => {
    writeSidebarOpenPreference(true);
    clearSidebarOpenPreference();
    expect(window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY)).toBeNull();
  });

  it("handles blocked localStorage reads", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => { throw new Error("blocked"); },
        setItem: () => undefined,
        removeItem: () => undefined,
        clear: () => undefined,
      },
    });
    expect(readSidebarOpenPreference(false)).toBe(true);
  });
});
