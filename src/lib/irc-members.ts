/**
 * IRC-driven public room membership (NAMES + JOIN/PART/QUIT/KICK/NICK).
 * Single source of truth for usesIrcLive() rooms — no Supabase guest merge.
 */

import type { User } from "./chat-types";
import { ircPmPeerId } from "./irc-pm-utils";

export type IrcRoomMember = {
  nick: string;
  userId: string;
  isGuest?: boolean;
};

export type IrcMembershipPresenceEvent = {
  event: "join" | "part" | "quit" | "kick" | "nick";
  nick: string;
  room?: string;
  newNick?: string;
  reason?: string;
};

const AVATAR_COLORS = [
  "oklch(0.62 0.12 250)",
  "oklch(0.62 0.12 150)",
  "oklch(0.62 0.12 50)",
  "oklch(0.62 0.12 320)",
];

export function memberIdForIrcEntry(entry: {
  nick: string;
  userId?: string | null;
  isGuest?: boolean;
}): string {
  const uid = entry.userId?.trim();
  if (uid && !uid.startsWith("irc:")) return uid;
  return ircPmPeerId(entry.nick);
}

export function nickFromMemberId(
  memberId: string,
  users: Record<string, User | undefined>,
): string | null {
  const user = users[memberId];
  if (user?.name) return user.name;
  if (memberId.startsWith("irc:")) return memberId.slice(4);
  return null;
}

function avatarForId(id: string): string {
  const idx =
    Math.abs(id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) %
    AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export function buildIrcMemberUser(
  entry: IrcRoomMember,
  memberId: string,
): User {
  return {
    id: memberId,
    name: entry.nick,
    avatarColor: avatarForId(memberId),
    status: "online",
    lastSeen: Date.now(),
    isGuest: Boolean(entry.isGuest || memberId.startsWith("visitor_")),
    xp: 0,
    level: 1,
  };
}

export function mergeIrcNamesMembers(
  existing: string[],
  entries: IrcRoomMember[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const entry of entries) {
    const id = memberIdForIrcEntry(entry);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function addIrcMember(existing: string[], memberId: string): string[] {
  if (existing.includes(memberId)) return existing;
  return [...existing, memberId];
}

export function removeIrcMember(existing: string[], memberId: string): string[] {
  return existing.filter((id) => id !== memberId);
}

export function removeIrcMemberFromAllRooms<
  R extends { members: string[] },
>(rooms: Record<string, R>, memberId: string, liveRoomIds: Set<string>): Record<string, R> {
  const next: Record<string, R> = { ...rooms };
  for (const [roomId, room] of Object.entries(rooms)) {
    if (!liveRoomIds.has(roomId)) continue;
    if (!room.members.includes(memberId)) continue;
    next[roomId] = {
      ...room,
      members: room.members.filter((id) => id !== memberId),
    };
  }
  return next;
}

export function renameIrcMemberInRoom(
  members: string[],
  oldMemberId: string,
  newMemberId: string,
): string[] {
  if (oldMemberId === newMemberId) return members;
  const without = members.filter((id) => id !== oldMemberId);
  if (without.includes(newMemberId)) return without;
  return [...without, newMemberId];
}
