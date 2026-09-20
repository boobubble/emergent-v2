import { useMemo } from "react";
import {
  CHAT_REQUESTED_ROOM_KEY,
  YAARZO_GLOBAL_ROOM_ID,
} from "@/lib/auth-entry";

export function humanizeRoomId(roomId: string): string {
  const id = roomId.trim();
  if (!id) return "Chatroom";
  if (id === YAARZO_GLOBAL_ROOM_ID) return "Yaarzo Global";
  return id
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

/** Read requested room without clearing sessionStorage (SSO may still consume on load). */
export function peekRequestedChatRoomId(): string | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const v = sessionStorage.getItem(CHAT_REQUESTED_ROOM_KEY);
    return v?.trim() || null;
  } catch {
    return null;
  }
}

export type CodyChatRoomMeta = {
  roomId: string;
  roomTitle: string;
  roomSubtitle: string;
};

export function useCodyChatRoomMeta(): CodyChatRoomMeta {
  return useMemo(() => {
    const roomId = peekRequestedChatRoomId() ?? YAARZO_GLOBAL_ROOM_ID;
    const roomTitle = humanizeRoomId(roomId);
    const roomSubtitle =
      roomId === YAARZO_GLOBAL_ROOM_ID
        ? "Public chat on Yaarzo — meet, chat, and connect."
        : `Chatroom · ${roomId}`;
    return { roomId, roomTitle, roomSubtitle };
  }, []);
}
