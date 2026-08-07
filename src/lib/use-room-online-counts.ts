import { useMemo } from "react";

export function roomOnlineCountsFromMembers(
  channelIds: string[],
  membersByChannel: Record<string, string[] | undefined>,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const id of channelIds) {
    counts[id] = membersByChannel[id]?.length ?? 0;
  }
  return counts;
}

/** Member-based counts — avoids duplicate Supabase room-presence subscriptions. */
export function useRoomOnlineCounts(
  channelIds: string[],
  membersByChannel: Record<string, string[] | undefined>,
): Record<string, number> {
  const key = channelIds.slice().sort().join(",");
  return useMemo(
    () => roomOnlineCountsFromMembers(channelIds, membersByChannel),
    [key, membersByChannel],
  );
}
