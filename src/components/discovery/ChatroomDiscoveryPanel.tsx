import { useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { getChatroomDiscovery, getDiscoveryPrefs } from "@/lib/discovery/functions";
import { isModuleRolloutEnabled } from "@/lib/discovery/rollout";
import type { DiscoverableChannel, DiscoverySectionKey } from "@/lib/discovery/types";
import { cn } from "@/lib/utils";

export type SidebarRoomFilter = "all" | "joined" | "country" | "interests";

type Props = {
  joinedChannelIds: string[];
  activeChannelId: string;
  filter: SidebarRoomFilter;
  onSelectChannel: (id: string) => void;
  /** Fallback local rooms when discovery is sparse */
  localRoomCount?: number;
  /** When local lobby/games are rendered separately, skip duplicate joined section */
  suppressJoinedSection?: boolean;
};

const SECTION_LABELS: Partial<Record<DiscoverySectionKey, string>> = {
  joined: "Joined Channels",
  popular_country: "Country Rooms",
  by_interests: "Interest Rooms",
  trending: "Suggested For You",
  global_public: "Suggested For You",
};

function RoomRow({
  ch,
  active,
  onSelect,
}: {
  ch: DiscoverableChannel;
  active: boolean;
  onSelect: () => void;
}) {
  const isGame = ch.kind === "game";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "premium-nav-item group/room min-h-8 w-full gap-1.5 px-2 py-1",
        active && "premium-nav-item-active sidebar-room-active",
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-left">
        {isGame ? (
          <Gamepad2 className={cn("h-3 w-3 shrink-0", active ? "text-primary" : "text-primary/70")} />
        ) : (
          <span className={cn("text-sm leading-none", active ? "text-primary" : "opacity-45")}>#</span>
        )}
        <span className="truncate text-[12px]">{ch.name}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[10px] tabular-nums text-muted-foreground">
        <span className="chat-online-dot" aria-hidden style={{ width: "0.4rem", height: "0.4rem" }} />
        <span className="font-semibold">{Math.max(ch.memberCount, 0)}</span>
      </span>
    </button>
  );
}

export type SparseSuggestionRoom = {
  id: string;
  name: string;
  kind?: "chat" | "game";
  memberCount?: number;
};

export function SidebarSparseSuggestions({
  rooms,
  activeChannelId,
  onSelect,
}: {
  rooms: SparseSuggestionRoom[];
  activeChannelId: string;
  onSelect: (id: string) => void;
}) {
  if (!rooms.length) return null;

  return (
    <div className="mb-2">
      <div className="sidebar-section-label flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-primary" />
        Suggested For You
      </div>
      <div className="space-y-0.5">
        {rooms.map((room) => {
          const active = activeChannelId === room.id;
          const isGame = room.kind === "game";
          return (
            <button
              key={room.id}
              type="button"
              onClick={() => onSelect(room.id)}
              className={cn(
                "premium-nav-item group/room min-h-8 w-full gap-1.5 px-2 py-1",
                active && "premium-nav-item-active sidebar-room-active",
              )}
            >
              <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-left">
                {isGame ? (
                  <Gamepad2 className={cn("h-3 w-3 shrink-0", active ? "text-primary" : "text-primary/70")} />
                ) : (
                  <span className={cn("text-sm leading-none", active ? "text-primary" : "opacity-45")}>#</span>
                )}
                <span className="truncate text-[12px]">{room.name}</span>
              </span>
              {room.memberCount != null && (
                <span className="flex shrink-0 items-center gap-1 text-[10px] tabular-nums text-muted-foreground">
                  <span className="chat-online-dot" aria-hidden style={{ width: "0.4rem", height: "0.4rem" }} />
                  <span className="font-semibold">{Math.max(room.memberCount, 0)}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ChatroomDiscoveryPanel({
  joinedChannelIds,
  activeChannelId,
  filter,
  onSelectChannel,
  localRoomCount = 0,
  suppressJoinedSection = false,
}: Props) {
  const { user } = useAuth();
  const fetchDiscovery = useServerFn(getChatroomDiscovery);
  const fetchPrefs = useServerFn(getDiscoveryPrefs);
  const prefsQ = useQuery({
    queryKey: ["discovery-prefs"],
    queryFn: () => fetchPrefs(),
    enabled: Boolean(user && !user.isGuest),
    staleTime: 60_000,
  });

  const chatroomsEnabled = prefsQ.data?.config
    ? isModuleRolloutEnabled(prefsQ.data.config, "chatrooms")
    : false;

  const q = useQuery({
    queryKey: ["chatroom-discovery", joinedChannelIds.join(",")],
    queryFn: () => fetchDiscovery({ data: { joinedChannelIds } }),
    enabled: Boolean(user && !user.isGuest && chatroomsEnabled),
    staleTime: 60_000,
  });

  const sections = useMemo(() => {
    const raw = q.data?.sections ?? [];
    const merged = new Map<string, { key: string; title: string; channels: DiscoverableChannel[] }>();

    for (const section of raw) {
      let show = true;
      if (filter === "joined" && section.key !== "joined") show = false;
      if (filter === "country" && section.key !== "popular_country") show = false;
      if (filter === "interests" && section.key !== "by_interests") show = false;
      if (!show || section.channels.length === 0) continue;
      if (suppressJoinedSection && section.key === "joined") continue;

      const title = SECTION_LABELS[section.key as DiscoverySectionKey] ?? section.title;
      const bucketKey =
        section.key === "trending" || section.key === "global_public"
          ? "suggested"
          : section.key;

      const existing = merged.get(bucketKey);
      if (existing) {
        const ids = new Set(existing.channels.map((c) => c.id));
        for (const ch of section.channels) {
          if (!ids.has(ch.id)) existing.channels.push(ch);
        }
      } else {
        merged.set(bucketKey, { key: bucketKey, title, channels: [...section.channels] });
      }
    }

    return Array.from(merged.values());
  }, [q.data?.sections, filter, suppressJoinedSection]);

  const totalChannels = sections.reduce((n, s) => n + s.channels.length, 0);
  void totalChannels;
  void localRoomCount;

  if (!user || user.isGuest || !chatroomsEnabled) return null;
  if (sections.length === 0) return null;

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div key={section.key}>
          <div className="sidebar-section-label flex items-center gap-1">
            {section.key === "suggested" && <Sparkles className="h-3 w-3 text-primary" />}
            {section.title}
          </div>
          <div className="space-y-0.5">
            {section.channels.map((ch) => (
              <RoomRow
                key={ch.id}
                ch={ch}
                active={activeChannelId === ch.id}
                onSelect={() => onSelectChannel(ch.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
