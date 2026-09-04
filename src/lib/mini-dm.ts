import type { User } from "./chat-types";
import { dmChannelFor, isRemoteDmChannel } from "./dm-utils";

/** Stub shown while chat-store has not merged the remote profile yet. */
export function placeholderMiniDmPeer(peerId: string): User {
  return {
    id: peerId,
    name: "User",
    avatarColor: "oklch(0.62 0.02 250)",
    status: "offline",
    xp: 0,
    level: 1,
  };
}

/**
 * Desktop mini-DMs often open before chat-store.users has the peer.
 * MembersPanel already has them via useRemoteProfiles — use that first,
 * then a placeholder so the window can mount without a hook-order crash.
 */
export function resolveMiniDmPeer(
  peerId: string,
  storeUsers: Record<string, User | undefined>,
  remoteProfiles: Record<string, User | undefined>,
  channelId: string | null,
): User | undefined {
  return (
    storeUsers[peerId] ??
    remoteProfiles[peerId] ??
    (channelId ? placeholderMiniDmPeer(peerId) : undefined)
  );
}

/**
 * Mini-DM windows do not call startDM / setActive (that would steal the
 * public room). History fetch must still include those DM channel ids.
 */
export function extraRemoteDmChannelsToFetch(
  authUserId: string | null | undefined,
  watchedChannels: readonly string[],
): string[] {
  if (!authUserId) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const ch of watchedChannels) {
    if (!ch || seen.has(ch)) continue;
    if (!isRemoteDmChannel(ch, authUserId)) continue;
    seen.add(ch);
    out.push(ch);
  }
  return out;
}

/** Build the DM channel id for a remote-profile peer UUID. */
export function miniDmChannelForPeer(
  authUserId: string | null | undefined,
  peerId: string,
): string | null {
  return dmChannelFor(authUserId ?? null, peerId);
}
