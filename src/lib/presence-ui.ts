import { SYSTEM_PRESENCE_AUTHOR } from "./chat-bot-triggers";

/** Room presence is chat-stream only — never popup/toast. */
export const PRESENCE_UI_CHAT_STREAM_ONLY = true;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Real auth users only — excludes local bot ids (bot-echo, etc.). */
export function isRealPresenceUserId(userId: string): boolean {
  return UUID_RE.test(userId);
}

export function formatPresenceLineText(kind: "join" | "leave", userName: string): string {
  const name = userName.trim() || "Someone";
  return kind === "join" ? `${name} joined the room` : `${name} left the room`;
}

/** Presence join/leave must never surface as popup/toast UI. */
export function shouldShowPresencePopup(): boolean {
  return false;
}

export function isPresenceSystemMessage(authorId: string, kind?: string): boolean {
  return kind === "system" && authorId === SYSTEM_PRESENCE_AUTHOR;
}
