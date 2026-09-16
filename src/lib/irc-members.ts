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

/** Prefer gateway-assigned IRC nick, then guest-chosen nickname. */
export function resolveGuestIrcNick(opts: {
  ircNick?: string | null;
  nickname?: string | null;
}): string | null {
  const nick = opts.ircNick?.trim() || opts.nickname?.trim();
  return nick || null;
}

export function stripPlaceholderMeFromMembers(
  members: string[],
  selfVisitorId?: string | null,
): string[] {
  const withoutMe = members.filter((id) => id !== "me");
  if (!selfVisitorId) return withoutMe;
  return withoutMe.includes(selfVisitorId)
    ? withoutMe
    : addIrcMember(withoutMe, selfVisitorId);
}

/**
 * Merge IRC NAMES snapshot into room members while preserving local bots
 * and replacing the placeholder `me` id with the guest visitor id when known.
 */
export function mergeIrcNamesSnapshotMembers(
  existingMembers: string[],
  entries: IrcRoomMember[],
  botMemberIds: Iterable<string> = [],
  selfVisitorId?: string | null,
): string[] {
  const bots = new Set(botMemberIds);
  const preservedBots = existingMembers.filter((id) => bots.has(id));
  const ircMembers = mergeIrcNamesMembers(
    existingMembers.filter((id) => id !== "me" && !bots.has(id)),
    entries,
  );
  const merged = [...ircMembers, ...preservedBots];
  return stripPlaceholderMeFromMembers(merged, selfVisitorId);
}

export function applyGuestIrcIdentity<
  S extends {
    me: User;
    users: Record<string, User>;
    rooms: Record<string, { members: string[] } & Record<string, unknown>>;
  },
>(
  state: S,
  visitorId: string,
  nick: string,
  isIrcLiveRoom: (roomId: string) => boolean,
): S {
  const entry: IrcRoomMember = { nick, userId: visitorId, isGuest: true };
  const memberId = memberIdForIrcEntry(entry);
  const guestUser = buildIrcMemberUser(entry, memberId);
  const me = { ...state.me, name: nick, isGuest: true };
  const users = { ...state.users, me, [memberId]: guestUser };
  const rooms = { ...state.rooms } as S["rooms"];

  for (const [roomId, room] of Object.entries(state.rooms)) {
    if (!isIrcLiveRoom(roomId)) continue;
    rooms[roomId] = {
      ...room,
      members: stripPlaceholderMeFromMembers(room.members, memberId),
    } as S["rooms"][string];
  }

  return { ...state, me, users, rooms };
}
