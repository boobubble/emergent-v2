/**
 * Lightweight client-side tracker for "Recently Played" and
 * "Continue Playing" in the Games Hub. Uses localStorage; server-side
 * progress (cloudsave, XP, achievements) is owned by GamesSDK.
 */

const KEY = "bb.gamesHub.recent.v1";

export interface RecentEntry {
  gameId: string;
  lastPlayedAt: number; // epoch ms
  hasProgress?: boolean; // true if the game has a resumable session
}

function safeRead(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(entries: RecentEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 24)));
  } catch {
    /* ignore quota errors */
  }
}

export function markGamePlayed(gameId: string, hasProgress = false): void {
  const list = safeRead().filter((e) => e.gameId !== gameId);
  list.unshift({ gameId, lastPlayedAt: Date.now(), hasProgress });
  safeWrite(list);
}

export function clearGameProgress(gameId: string): void {
  const list = safeRead().map((e) =>
    e.gameId === gameId ? { ...e, hasProgress: false } : e,
  );
  safeWrite(list);
}

export function getRecent(limit = 8): RecentEntry[] {
  return safeRead().slice(0, limit);
}

export function getContinuePlaying(limit = 8): RecentEntry[] {
  return safeRead()
    .filter((e) => e.hasProgress)
    .slice(0, limit);
}
