import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAnnouncements, listWidgets } from "@/lib/broadcaster.functions";
import { listCompetitionsEnriched } from "@/lib/competitions.functions";
import type { User } from "@/lib/chat-types";
import {
  useRemoteProfileDirectory,
  useRemoteProfiles,
} from "@/lib/use-remote-profiles";
import { useCodyChatRoomMeta } from "./codychat-room-meta";

export type CodyCommunityMember = User & { isOfficial?: boolean };

export function useCodyChatCommunity() {
  const room = useCodyChatRoomMeta();
  const { profiles, loading: profilesLoading } = useRemoteProfiles();
  const { profiles: rawDirectory } = useRemoteProfileDirectory();
  const fetchWidgets = useServerFn(listWidgets);
  const fetchAnnouncements = useServerFn(listAnnouncements);
  const fetchCompetitions = useServerFn(listCompetitionsEnriched);

  const widgetsQuery = useQuery({
    queryKey: ["codychat-radio-widgets"],
    queryFn: () => fetchWidgets(),
    staleTime: 60_000,
  });

  const tickerQuery = useQuery({
    queryKey: ["codychat-radio-ticker"],
    queryFn: () => fetchAnnouncements({ data: { kind: "ticker", activeOnly: true } }),
    staleTime: 30_000,
  });

  const competitionsQuery = useQuery({
    queryKey: ["codychat-competitions"],
    queryFn: () => fetchCompetitions({ data: {} }),
    staleTime: 60_000,
  });

  const onlineMembers = useMemo(() => {
    const list: CodyCommunityMember[] = [];
    for (const id in profiles) {
      const u = profiles[id];
      if (u.isBot || u.isGuest) continue;
      if (u.status !== "online") continue;
      const raw = rawDirectory[id];
      list.push({ ...u, isOfficial: !!raw?.is_official });
    }
    list.sort((a, b) => (b.level ?? 0) - (a.level ?? 0) || a.name.localeCompare(b.name));
    return list;
  }, [profiles, rawDirectory]);

  const officialOnline = useMemo(
    () => onlineMembers.filter((m) => m.isOfficial),
    [onlineMembers],
  );

  const enabledWidgets = useMemo(
    () => (widgetsQuery.data ?? []).filter((w) => w.enabled),
    [widgetsQuery.data],
  );

  const liveCompetitions = useMemo(
    () =>
      (competitionsQuery.data ?? []).filter((c) => c.status === "live"),
    [competitionsQuery.data],
  );

  const topicLabels = useMemo(() => {
    const fromTicker = (tickerQuery.data ?? [])
      .map((t) => t.title?.trim())
      .filter(Boolean) as string[];
    if (fromTicker.length > 0) return fromTicker;
    return [room.roomTitle];
  }, [tickerQuery.data, room.roomTitle]);

  return {
    room,
    onlineMembers,
    officialOnline,
    onlineCount: onlineMembers.length,
    profilesLoading,
    enabledWidgets,
    liveCompetitions,
    topicLabels,
    widgetsLoading: widgetsQuery.isLoading,
  };
}

export function useMemberSearchFilter(members: CodyCommunityMember[]) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q));
  }, [members, query]);
  return { query, setQuery, filtered };
}
