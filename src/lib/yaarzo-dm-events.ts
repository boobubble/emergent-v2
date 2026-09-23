/**
 * Yaarzo Supabase DM open helpers (feed, chatroom shell, notifications).
 * Single event surface for parent UI — do not use CodyChat private messages.
 */

export const YAARZO_OPEN_DM_INBOX_EVENT = "palrgo:openYaarzoDmInbox";
export const YAARZO_OPEN_MINI_DM_EVENT = "palrgo:openMiniDM";

/** Open the Yaarzo DM inbox/conversation surface (FeedDMDock on chatroom/feed). */
export function openYaarzoDmInbox(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(YAARZO_OPEN_DM_INBOX_EVENT));
}

/** Open Yaarzo DM with a specific peer (registered UUID or guest:{visitorId}). */
export function openYaarzoDmPeer(peerId: string): void {
  if (typeof window === "undefined" || !peerId || peerId === "me") return;
  window.dispatchEvent(new CustomEvent(YAARZO_OPEN_MINI_DM_EVENT, { detail: { peerId } }));
}

/** @deprecated Alias — prefer openYaarzoDmPeer */
export function openMiniDM(peerId: string): void {
  openYaarzoDmPeer(peerId);
}
