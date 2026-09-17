import { parseIrcPmChannel } from "@/lib/irc-pm-utils";
import { isUuid } from "@/lib/dm-utils";
import type { IrcChatMember, IrcChatMessage } from "@/lib/irc-chat";

/** Stable accent hue from IRC nick for avatar fallbacks. */
export function nickAvatarHue(nick: string): number {
  let hash = 0;
  for (let i = 0; i < nick.length; i += 1) {
    hash = nick.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

export function nickInitial(nick: string): string {
  const trimmed = nick.trim();
  if (!trimmed) return "?";
  return trimmed.charAt(0).toUpperCase();
}

export function formatRoomLabel(name: string): string {
  const trimmed = name.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

/** Room slug for composer placeholder (keeps # prefix). */
export function roomComposerPlaceholder(roomName: string): string {
  return `Message ${formatRoomLabel(roomName)}`;
}

export function dmComposerPlaceholder(peerNick: string): string {
  const nick = peerNick.trim();
  return nick ? `Message ${nick}` : "Write a message…";
}

/** Compact time for DM sidebar rows (from message ts). */
export function formatSidebarTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return formatMessageTime(ts);
  }
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);
}

export function formatMessageTime(ts: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function formatMessageDate(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  }).format(d);
}

const MESSAGE_GROUP_GAP_MS = 5 * 60 * 1000;

export type IrcMessageListItem =
  | { type: "date"; label: string; key: string }
  | {
      type: "message";
      msg: IrcChatMessage;
      own: boolean;
      showMeta: boolean;
    };

export function buildMessageListItems(
  messages: IrcChatMessage[],
  selfNick: string | null,
): IrcMessageListItem[] {
  const items: IrcMessageListItem[] = [];
  let lastDateKey = "";
  let prevNick: string | null = null;
  let prevTs = 0;

  for (const msg of messages) {
    const dateKey = new Date(msg.ts).toDateString();
    if (dateKey !== lastDateKey) {
      items.push({
        type: "date",
        label: formatMessageDate(msg.ts),
        key: `date-${dateKey}`,
      });
      lastDateKey = dateKey;
      prevNick = null;
      prevTs = 0;
    }

    const own = Boolean(
      selfNick && msg.nick.toLowerCase() === selfNick.toLowerCase(),
    );
    const sameGroup =
      prevNick !== null &&
      msg.nick.toLowerCase() === prevNick.toLowerCase() &&
      msg.ts - prevTs < MESSAGE_GROUP_GAP_MS;

    items.push({
      type: "message",
      msg,
      own,
      showMeta: !sameGroup,
    });
    prevNick = msg.nick;
    prevTs = msg.ts;
  }

  return items;
}

export type IrcDmThreadSummary = {
  peerNick: string;
  lastMessage: IrcChatMessage | null;
};

export function listDmThreads(
  privateMessages: Record<string, IrcChatMessage[]>,
): IrcDmThreadSummary[] {
  const threads: IrcDmThreadSummary[] = [];

  for (const [channelId, msgs] of Object.entries(privateMessages)) {
    const peerNick = parseIrcPmChannel(channelId);
    if (!peerNick || msgs.length === 0) continue;
    const sorted = [...msgs].sort((a, b) => a.ts - b.ts);
    threads.push({
      peerNick,
      lastMessage: sorted[sorted.length - 1] ?? null,
    });
  }

  threads.sort(
    (a, b) => (b.lastMessage?.ts ?? 0) - (a.lastMessage?.ts ?? 0),
  );
  return threads;
}

export function countDmUnread(
  messages: IrcChatMessage[],
  selfNick: string | null,
  lastReadTs: number,
): number {
  if (!selfNick) return 0;
  const self = selfNick.toLowerCase();
  return messages.filter(
    (m) => m.ts > lastReadTs && m.nick.toLowerCase() !== self,
  ).length;
}

export function profileUserIdForMember(member: IrcChatMember): string | null {
  if (member.isGuest) return null;
  if (member.userId.startsWith("visitor_") || member.userId.startsWith("irc:")) {
    return null;
  }
  return isUuid(member.userId) ? member.userId : null;
}

/**
 * Sidebar online count: NAMES/presence when available; IRC LIST `memberCount` otherwise.
 * Active room always uses live membership length (never stale LIST while viewing that room).
 */
export function displayRoomOnlineCount(
  roomId: string,
  membersByRoom: Record<string, IrcChatMember[]>,
  listMemberCount: number | undefined,
  isActiveRoom: boolean,
): number | null {
  const live = membersByRoom[roomId];
  if (isActiveRoom) {
    return live?.length ?? 0;
  }
  if (live && live.length > 0) {
    return live.length;
  }
  return listMemberCount ?? null;
}

export function findMemberByNick(
  membersByRoom: Record<string, IrcChatMember[]>,
  nick: string,
): IrcChatMember | null {
  const target = nick.toLowerCase();
  for (const list of Object.values(membersByRoom)) {
    const hit = list.find((m) => m.nick.toLowerCase() === target);
    if (hit) return hit;
  }
  return null;
}
