import { isUuid } from "@/lib/dm-utils";
import type { RemoteProfile } from "@/lib/use-remote-profiles";
import type { IrcChatMember, IrcChatState } from "@/lib/irc-chat";
import { profileUserIdForMember } from "./irc-chat-ui";

export type IrcOfflineDirectoryProfile = {
  userId: string;
  username: string;
  avatarUrl?: string;
  avatarColor: string;
};

/**
 * Registered Yaarzo user ids currently represented on IRC (trusted member.userId mapping only).
 * Supabase profile/presence data is never used for online truth.
 */
export function collectIrcOnlineRegisteredUserIds(
  membersByRoom: IrcChatState["members"],
  selfApplicationUserId: string | null,
): Set<string> {
  const ids = new Set<string>();
  for (const list of Object.values(membersByRoom)) {
    for (const member of list) {
      const profileId = profileUserIdForMember(member);
      if (profileId) ids.add(profileId.toLowerCase());
    }
  }
  if (selfApplicationUserId && isUuid(selfApplicationUserId)) {
    ids.add(selfApplicationUserId.toLowerCase());
  }
  return ids;
}

function isPersistentRegisteredProfile(p: RemoteProfile): boolean {
  if (p.is_bot) return false;
  if (/^guest-/i.test(p.username ?? "")) return false;
  return isUuid(p.id);
}

/**
 * Persistent registered directory minus IRC-online registered identities (by user id only).
 */
export function listOfflineRegisteredProfiles(
  rawProfiles: Record<string, RemoteProfile>,
  ircOnlineRegisteredUserIds: Set<string>,
  query: string,
): IrcOfflineDirectoryProfile[] {
  const q = query.trim().toLowerCase();
  const rows: IrcOfflineDirectoryProfile[] = [];

  for (const p of Object.values(rawProfiles)) {
    if (!isPersistentRegisteredProfile(p)) continue;
    const userId = p.id.toLowerCase();
    if (ircOnlineRegisteredUserIds.has(userId)) continue;
    const username = (p.username || "User").trim();
    if (q && !username.toLowerCase().includes(q)) continue;
    rows.push({
      userId: p.id,
      username,
      avatarUrl: p.avatar_url ?? undefined,
      avatarColor: p.avatar_color || "220 48% 42%",
    });
  }

  rows.sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: "base" }));
  return rows;
}

export function filterIrcOnlineMembers(
  members: IrcChatMember[],
  query: string,
  profilesById?: Record<string, RemoteProfile>,
): IrcChatMember[] {
  const q = query.trim().toLowerCase();
  if (!q) return members;
  return members.filter((m) => {
    if (m.nick.toLowerCase().includes(q)) return true;
    const profileId = profileUserIdForMember(m);
    if (!profileId || !profilesById) return false;
    const username = profilesById[profileId]?.username?.toLowerCase();
    return Boolean(username && username.includes(q));
  });
}

/** Stable display order for member list (nick, case-insensitive). */
export function sortIrcMembersForDisplay(members: IrcChatMember[]): IrcChatMember[] {
  return [...members].sort((a, b) =>
    a.nick.localeCompare(b.nick, undefined, { sensitivity: "base" }),
  );
}
