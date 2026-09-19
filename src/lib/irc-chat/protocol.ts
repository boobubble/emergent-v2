import type { IrcChatMember, IrcChatPresenceEvent } from "./types";
import { parseIrcPresenceLine } from "../irc-presence";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidMessageId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

export function parseOptionalReplyToMessageId(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (!isValidMessageId(value)) return undefined;
  return String(value).trim();
}

export function isValidIrcUserId(value: string): boolean {
  if (!value) return false;
  if (UUID_RE.test(value)) return true;
  if (value.startsWith("visitor_")) return true;
  if (value.startsWith("irc:")) return true;
  return false;
}

export function asNonEmptyString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type GatewayFrame = {
  type?: string;
  event?: string;
  room?: string;
  messageId?: string;
  replyToMessageId?: string;
  nick?: string;
  userId?: string;
  text?: string;
  message?: string;
  error?: string;
  line?: string;
  ircNick?: string;
  members?: unknown;
  recipientNick?: string;
  code?: string;
};

export function parseGatewayFrame(raw: string): GatewayFrame | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as GatewayFrame) : null;
  } catch {
    return null;
  }
}

export type ParsedGatewayEvent =
  | { kind: "connected" }
  | { kind: "authenticated"; userId: string; ircNick: string }
  | { kind: "room_joined"; room: string }
  | { kind: "room_parted"; room: string }
  | { kind: "room_names"; room: string; members: IrcChatMember[] }
  | {
      kind: "public_message";
      room: string;
      messageId: string;
      nick: string;
      userId: string;
      text: string;
      replyToMessageId?: string;
    }
  | {
      kind: "public_message_sent";
      room: string;
      messageId: string;
      nick: string;
      userId: string;
      text: string;
      replyToMessageId?: string;
    }
  | { kind: "pm_message"; messageId: string; nick: string; text: string }
  | { kind: "pm_sent"; messageId: string; recipientNick: string; text: string }
  | { kind: "presence"; event: IrcChatPresenceEvent }
  | { kind: "error"; code: string; message: string };

export function parseGatewayEvent(frame: GatewayFrame): ParsedGatewayEvent | null {
  if (!frame.type) return null;

  if (frame.type === "gateway" && frame.event === "connected") {
    return { kind: "connected" };
  }

  if (frame.type === "gateway" && frame.event === "authenticated") {
    const userId = asNonEmptyString(frame.userId);
    const ircNick = asNonEmptyString(frame.ircNick);
    if (!userId || !ircNick) return null;
    return { kind: "authenticated", userId, ircNick };
  }

  if (frame.type === "room.joined") {
    const room = asNonEmptyString(frame.room);
    return room ? { kind: "room_joined", room } : null;
  }

  if (frame.type === "room.parted") {
    const room = asNonEmptyString(frame.room);
    return room ? { kind: "room_parted", room } : null;
  }

  if (frame.type === "room.names") {
    const room = asNonEmptyString(frame.room);
    const members = parseRoomNamesMembers(frame.members);
    if (!room || !members) return null;
    return { kind: "room_names", room, members };
  }

  if (frame.type === "message") {
    const room = asNonEmptyString(frame.room);
    const messageId = asNonEmptyString(frame.messageId);
    const nick = asNonEmptyString(frame.nick);
    const userId = asNonEmptyString(frame.userId);
    const text = typeof frame.text === "string" ? frame.text.trim() : "";
    if (!room || !isValidMessageId(messageId) || !nick || !isValidIrcUserId(userId) || !text) {
      return null;
    }
    const replyToMessageId = parseOptionalReplyToMessageId(frame.replyToMessageId);
    return { kind: "public_message", room, messageId, nick, userId, text, replyToMessageId };
  }

  if (frame.type === "message.sent") {
    const room = asNonEmptyString(frame.room);
    const messageId = asNonEmptyString(frame.messageId);
    const nick = asNonEmptyString(frame.nick);
    const userId = asNonEmptyString(frame.userId);
    const text = typeof frame.text === "string" ? frame.text.trim() : "";
    if (!room || !isValidMessageId(messageId) || !nick || !userId || !text) return null;
    const replyToMessageId = parseOptionalReplyToMessageId(
      (frame as GatewayFrame).replyToMessageId,
    );
    return { kind: "public_message_sent", room, messageId, nick, userId, text, replyToMessageId };
  }

  if (frame.type === "pm.message") {
    const messageId = asNonEmptyString(frame.messageId);
    const nick = asNonEmptyString(frame.nick);
    const text = typeof frame.text === "string" ? frame.text.trim() : "";
    if (!isValidMessageId(messageId) || !nick || !text) return null;
    return { kind: "pm_message", messageId, nick, text };
  }

  if (frame.type === "pm.sent") {
    const messageId = asNonEmptyString(frame.messageId);
    const recipientNick = asNonEmptyString(frame.recipientNick);
    const text = typeof frame.text === "string" ? frame.text.trim() : "";
    if (!isValidMessageId(messageId) || !recipientNick || !text) return null;
    return { kind: "pm_sent", messageId, recipientNick, text };
  }

  if (frame.type === "irc" && typeof frame.line === "string") {
    const parsed = parseIrcPresenceLine(frame.line);
    if (!parsed) return null;
    return {
      kind: "presence",
      event: {
        room: parsed.room ?? "",
        event: parsed.event,
        nick: parsed.nick,
        reason: parsed.reason,
        newNick: parsed.newNick,
      },
    };
  }

  if (frame.type === "error") {
    return {
      kind: "error",
      code: asNonEmptyString(frame.code) || "GATEWAY_ERROR",
      message:
        asNonEmptyString(frame.message) ||
        asNonEmptyString(frame.error) ||
        "Gateway error",
    };
  }

  return null;
}

function parseRoomNamesMembers(raw: unknown): IrcChatMember[] | null {
  if (!Array.isArray(raw)) return null;
  const parsed: IrcChatMember[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const entry = row as IrcChatMember;
    const nick = asNonEmptyString(entry.nick);
    const userId = asNonEmptyString(entry.userId);
    if (!nick || !userId) continue;
    parsed.push({
      nick,
      userId,
      isGuest: Boolean(entry.isGuest),
    });
  }
  return parsed;
}

import type { IrcChatAuth, IrcChatGuestAuth } from "./auth";

export type OutgoingAuthFrame =
  | { type: "auth"; token: string }
  | { type: "auth"; guest: IrcChatGuestAuth };

export function buildAuthFrame(auth: IrcChatAuth, token: string): OutgoingAuthFrame {
  if (auth.kind === "guest") {
    return { type: "auth", guest: auth.guest };
  }
  return { type: "auth", token };
}

export function buildJoinFrame(room: string): { type: "room.join"; room: string } {
  return { type: "room.join", room: room.trim() };
}

export function buildPartFrame(room: string): { type: "room.part"; room: string } {
  return { type: "room.part", room: room.trim() };
}

export function buildPublicSendFrame(
  room: string,
  messageId: string,
  text: string,
  replyToMessageId?: string,
): {
  type: "message.send";
  room: string;
  messageId: string;
  text: string;
  replyToMessageId?: string;
} {
  const frame = {
    type: "message.send" as const,
    room: room.trim(),
    messageId: messageId.trim(),
    text: text.trim(),
  };
  const reply = parseOptionalReplyToMessageId(replyToMessageId);
  return reply ? { ...frame, replyToMessageId: reply } : frame;
}

export function buildPmSendFrame(
  recipientNick: string,
  messageId: string,
  text: string,
): { type: "pm.send"; recipientNick: string; messageId: string; text: string } {
  return {
    type: "pm.send",
    recipientNick: recipientNick.trim(),
    messageId: messageId.trim(),
    text: text.trim(),
  };
}
