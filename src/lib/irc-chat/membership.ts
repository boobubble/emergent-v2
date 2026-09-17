import type { IrcChatMember, IrcChatPresenceEvent } from "./types";
import { IRC_PRESENCE_DEDUP_MS } from "./constants";

export function dedupeMembers(members: IrcChatMember[]): IrcChatMember[] {
  const seen = new Set<string>();
  const out: IrcChatMember[] = [];
  for (const member of members) {
    const key = member.userId.trim() || member.nick.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(member);
  }
  return out;
}

export function applyRoomNamesSnapshot(
  _current: IrcChatMember[],
  snapshot: IrcChatMember[],
): IrcChatMember[] {
  return dedupeMembers(snapshot);
}

export function memberKey(member: IrcChatMember): string {
  return member.userId.trim() || member.nick.trim();
}

export function applyPresenceEvent(
  members: IrcChatMember[],
  event: IrcChatPresenceEvent,
  fallbackRoom: string,
): IrcChatMember[] {
  const room = event.room || fallbackRoom;
  if (!room && event.event !== "quit" && event.event !== "nick") {
    return members;
  }

  switch (event.event) {
    case "join":
      return dedupeMembers([
        ...members,
        {
          nick: event.nick,
          userId: inferUserIdFromNick(event.nick),
        },
      ]);
    case "part":
    case "kick":
      return members.filter((m) => m.nick !== event.nick);
    case "quit":
      return members.filter((m) => m.nick !== event.nick);
    case "nick": {
      const newNick = event.newNick?.trim();
      if (!newNick) return members;
      return members.map((m) =>
        m.nick === event.nick
          ? {
              ...m,
              nick: newNick,
              userId: m.userId.startsWith("irc:") ? `irc:${newNick}` : m.userId,
            }
          : m,
      );
    }
    default:
      return members;
  }
}

function inferUserIdFromNick(nick: string): string {
  return `irc:${nick.trim()}`;
}

export function presenceDedupKey(event: IrcChatPresenceEvent, room: string): string {
  return `${room || "*"}:${event.event}:${event.nick}:${event.newNick || ""}`;
}

export function shouldSkipPresenceDedup(
  dedup: Map<string, number>,
  key: string,
  now = Date.now(),
  windowMs = IRC_PRESENCE_DEDUP_MS,
): boolean {
  const last = dedup.get(key);
  if (last !== undefined && now - last < windowMs) return true;
  dedup.set(key, now);
  return false;
}
