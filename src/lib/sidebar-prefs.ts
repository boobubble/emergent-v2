/** Client-only UI preference for chatroom left sidebar open/closed. */
export const SIDEBAR_OPEN_STORAGE_KEY = "palrgo:sidebarOpen";

const VALID = new Set(["0", "1"]);

export function readSidebarOpenPreference(isMobile: boolean): boolean {
  if (typeof window === "undefined") return !isMobile;
  try {
    const saved = window.localStorage.getItem(SIDEBAR_OPEN_STORAGE_KEY);
    if (saved === "1") return true;
    if (saved === "0") return false;
    if (saved != null && saved !== "" && !VALID.has(saved)) {
      return !isMobile;
    }
  } catch {
    // private mode / blocked storage
  }
  return !isMobile;
}

export function writeSidebarOpenPreference(open: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIDEBAR_OPEN_STORAGE_KEY, open ? "1" : "0");
  } catch {
    // ignore
  }
}

export function clearSidebarOpenPreference(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SIDEBAR_OPEN_STORAGE_KEY);
  } catch {
    // ignore
  }
}
