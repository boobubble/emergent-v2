/** In-chatroom Yaarzo page overlay (iframe stays mounted on /chatroom). */

export const CHATROOM_SHELL_PANEL_KEY = "yaarzo" as const;

export type ChatroomShellPanelId =
  | "home"
  | "feed"
  | "find-friends"
  | "poetry"
  | "competitions"
  | "confessions";

export type ChatroomRouteSearch = {
  guest?: "1";
  yaarzo?: ChatroomShellPanelId;
  tab?: string;
  u?: string;
};

const PANEL_IDS = new Set<string>([
  "home",
  "feed",
  "find-friends",
  "poetry",
  "competitions",
  "confessions",
]);

export function parseChatroomShellPanelId(raw: unknown): ChatroomShellPanelId | undefined {
  if (typeof raw !== "string" || !PANEL_IDS.has(raw)) return undefined;
  return raw as ChatroomShellPanelId;
}

export function parseChatroomRouteSearch(search: Record<string, unknown>): ChatroomRouteSearch {
  const guest =
    search.guest === "1" || search.guest === 1 || search.guest === true ? ("1" as const) : undefined;
  const yaarzo = parseChatroomShellPanelId(search[CHATROOM_SHELL_PANEL_KEY]);
  const tab = typeof search.tab === "string" && search.tab.trim() ? search.tab.trim() : undefined;
  const u = typeof search.u === "string" && search.u.trim() ? search.u.trim() : undefined;
  return { guest, yaarzo, tab, u };
}

export function buildChatroomSearch(
  base: ChatroomRouteSearch,
  panel: ChatroomShellPanelId | null,
  opts?: { tab?: string; u?: string },
): ChatroomRouteSearch {
  const next: ChatroomRouteSearch = { guest: base.guest };
  if (panel) {
    next.yaarzo = panel;
    if (opts?.tab) next.tab = opts.tab;
    if (opts?.u) next.u = opts.u;
  }
  return next;
}

const GUEST_ALLOWED_SHELL_PANELS = new Set<ChatroomShellPanelId>([
  "find-friends",
  "poetry",
  "competitions",
  "confessions",
]);

/** Cody native guests may open public shell panels; protected items prompt auth only. */
export function isGuestProtectedShellPanel(panel: ChatroomShellPanelId): boolean {
  return !GUEST_ALLOWED_SHELL_PANELS.has(panel);
}

const GUEST_PROTECTED_NAV_PATHS = new Set([
  "/battle-hub",
  "/leaderboard",
  "/communities",
  "/radio",
  "/games",
]);

export function isGuestProtectedNavPath(path: string): boolean {
  return GUEST_PROTECTED_NAV_PATHS.has(path);
}

/** Feed shell tabs that require sign-in when opened from chatroom nav. */
export function isGuestProtectedFeedTab(tab?: string): boolean {
  if (!tab) return true;
  return ["trending", "notifications", "account", "foryou", "latest", "friends", "saved"].includes(
    tab,
  );
}

export function shellPanelTitle(id: ChatroomShellPanelId): string {
  switch (id) {
    case "home":
      return "Home";
    case "feed":
      return "Feed";
    case "find-friends":
      return "Find Friends";
    case "poetry":
      return "Poetry Hub";
    case "competitions":
      return "Competitions";
    case "confessions":
      return "Confessions";
    default:
      return "Yaarzo";
  }
}
