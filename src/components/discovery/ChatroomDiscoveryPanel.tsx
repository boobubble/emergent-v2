import { useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { getChatroomDiscovery, getDiscoveryPrefs } from "@/lib/discovery/functions";
import { isModuleRolloutEnabled } from "@/lib/discovery/rollout";
import type { DiscoverableChannel, DiscoverySectionKey } from "@/lib/discovery/types";
import { cn } from "@/lib/utils";
import { useBotEvents } from "@/lib/use-bot-events";
import { BOT_EVENT_META, type BotEventKind } from "@/lib/bot-events";

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

function fmtCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

/** Live countdown text — suppress hydration mismatch from SSR/client tick drift. */
function CountdownSubtext({ text }: { text: string }) {
  return (
    <div className="truncate text-[10px] text-muted-foreground" suppressHydrationWarning>
      {text}
    </div>
  );
}

function SuggestedEventCards() {
  const { states } = useBotEvents();
  const cards = (["fish", "dig", "wine"] as BotEventKind[])
    .map((kind) => {
      const s = states[kind];
      const meta = BOT_EVENT_META[kind];
      if (!s) return null;
      const live = s.live;
      const label = meta.label.replace(" Event", "");
      return {
        key: kind,
        emoji: meta.emoji,
        title: live ? `${label} is LIVE` : `${label} Event`,
        sub: live ? `Ends in ${fmtCountdown(s.msUntilClose)}` : `Starts in ${fmtCountdown(s.msUntilOpen)}`,
        live,
        tone: live ? "from-violet-500/20 to-fuchsia-500/10" : "from-emerald-500/15 to-teal-500/5",
      };
    })
    .filter(Boolean)
    .slice(0, 2);

  if (!cards.length) return null;

  return (
    <div className="space-y-1 px-0.5">
      {cards.map((c) => c && (
        <div
          key={c.key}
          className={cn(
            "rounded-xl border border-border/50 bg-gradient-to-r px-2.5 py-2",
            c.tone,
          )}
        >
          <div className="flex items-start gap-2">
            <span className="text-base leading-none">{c.emoji}</span>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-[11px] font-bold text-foreground">{c.title}</div>
              <CountdownSubtext text={c.sub} />
            </div>
            {c.live && <span className="chat-online-dot shrink-0" style={{ width: "0.45rem", height: "0.45rem" }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

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

export function SidebarSparseSuggestions({ onGames }: { onGames?: () => void }) {
  const { states } = useBotEvents();
  const cards = (["fish", "dig"] as BotEventKind[])
    .map((kind) => {
      const s = states[kind];
      const meta = BOT_EVENT_META[kind];
      if (!s) return null;
      const label = meta.label.replace(" Event", "");
      return {
        key: kind,
        emoji: meta.emoji,
        title: s.live ? `${label} is LIVE` : label,
        sub: s.live ? `Ends in ${fmtCountdown(s.msUntilClose)}` : `Starts in ${fmtCountdown(s.msUntilOpen)}`,
        tone: s.live ? "from-violet-500/20 to-fuchsia-500/10" : "from-emerald-500/15 to-teal-500/5",
      };
    })
    .filter(Boolean);

  if (!cards.length && !onGames) return null;

  return (
    <div className="mb-2">
      <div className="sidebar-section-label flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-primary" />
        Suggested For You
      </div>
      <div className="space-y-1">
        {cards.map((c) => c && (
          <div key={c.key} className={cn("rounded-xl border border-border/50 bg-gradient-to-r px-2.5 py-1.5", c.tone)}>
            <div className="flex items-center gap-2">
              <span className="text-sm">{c.emoji}</span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[11px] font-bold">{c.title}</div>
                <CountdownSubtext text={c.sub} />
              </div>
            </div>
          </div>
        ))}
        {onGames && (
          <button
            type="button"
            onClick={onGames}
            className="flex w-full items-center gap-2 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 px-2.5 py-1.5 text-left"
          >
            <Trophy className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[11px] font-bold">Game Night</div>
              <div className="truncate text-[10px] text-muted-foreground">Play in # Games</div>
            </div>
          </button>
        )}
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
  const showSuggestions = totalChannels + localRoomCount <= 4;

  if (!user || user.isGuest || !chatroomsEnabled) return null;

  if (sections.length === 0 && !showSuggestions) return null;

  return (
    <div className="space-y-2">
      {sections.map((section) => (
        <div key={section.key}>
          <div className="sidebar-section-label">{section.title}</div>
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

      {showSuggestions && !sections.some((s) => s.key === "suggested") && (
        <div>
          <div className="sidebar-section-label flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            Suggested For You
          </div>
          <SuggestedEventCards />
          {(filter === "all" || filter === "country") && (
            <button
              type="button"
              onClick={() => onSelectChannel("games")}
              className="mt-1 flex w-full items-center gap-2 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 px-2.5 py-2 text-left transition hover:border-emerald-500/35"
            >
              <Trophy className="h-4 w-4 shrink-0 text-emerald-400" />
              <div className="min-w-0 leading-tight">
                <div className="truncate text-[11px] font-bold">Game Night</div>
                <div className="truncate text-[10px] text-muted-foreground">Play events in # Games</div>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
