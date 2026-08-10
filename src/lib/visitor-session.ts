/**
 * Client-only ephemeral guest chat session (sessionStorage).
 * Never touches Supabase Auth or profiles.
 */

import { GUEST_CHAT_SETTING_KEY } from "@/lib/guest-chat-config";

const STORAGE_KEY = "yaarzo_guest_chat_session_v1";

export interface GuestChatClientSession {
  visitorId: string;
  nickname: string;
  displayName: string;
  startedAt: number;
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function readGuestChatSession(): GuestChatClientSession | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestChatClientSession;
    if (!parsed?.visitorId || !parsed?.displayName || !parsed?.nickname) return null;
    if (!String(parsed.visitorId).startsWith("visitor_")) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeGuestChatSession(session: GuestChatClientSession): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch { /* ignore quota */ }
}

export function clearGuestChatSession(): void {
  if (!canUseStorage()) return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

export function newVisitorId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `visitor_${rand}`;
}

export { STORAGE_KEY as GUEST_CHAT_SESSION_STORAGE_KEY, GUEST_CHAT_SETTING_KEY };