import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useBotEvents } from "@/lib/use-bot-events";
import { BOT_EVENT_META, type BotEventKind, type BotEventState } from "@/lib/bot-events";

// -------- helpers --------
function fmt(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h}h ${String(mm).padStart(2, "0")}m`;
  }
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

interface TickerItem {
  key: string;
  priority: number; // lower = shown first
  emoji: string;
  label: string;
  suffix?: string;
  live?: boolean;
  href?: string;
}

const TIPS: TickerItem[] = [
  { key: "tip-mention", priority: 90, emoji: "💬", label: "Mention friends using @username" },
  { key: "tip-streak", priority: 91, emoji: "🎁", label: "Complete daily streaks for bonus XP" },
  { key: "tip-radio", priority: 92, emoji: "📻", label: "Join today's live radio session", href: "/radio" },
  { key: "tip-vote", priority: 93, emoji: "🏆", label: "Vote in community competitions", href: "/competitions" },
  { key: "tip-post", priority: 94, emoji: "📝", label: "Share your latest post on the Feed", href: "/feed" },
];

function botEventToItem(kind: BotEventKind, s: BotEventState): TickerItem {
  const meta = BOT_EVENT_META[kind];
  const short = meta.label.replace(" Event", "");
  if (s.live) {
    const endingSoon = s.msUntilClose <= 60_000;
    return {
      key: `bot-${kind}-live-${s.cycleId}`,
      priority: endingSoon ? 0 : 1,
      emoji: meta.emoji,
      label: `${short} Event LIVE${s.golden ? " ✨2×" : ""}`,
      suffix: `ends in ${fmt(s.msUntilClose)}`,
      live: true,
    };
  }
  const soon = s.msUntilOpen <= 5 * 60_000;
  return {
    key: `bot-${kind}-wait-${s.cycleId}`,
    priority: soon ? 2 : 5,
    emoji: meta.emoji,
    label: `${short} starts in ${fmt(s.msUntilOpen)}`,
  };
}

// -------- item render --------
function TickerCell({ item, onClick }: { item: TickerItem; onClick?: () => void }) {
  const clickable = !!onClick;
  const Comp: "button" | "span" = clickable ? "button" : "span";
  return (
    <Comp
      type={clickable ? "button" : undefined}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none transition ${
        clickable ? "cursor-pointer hover:bg-white/10" : ""
      } ${item.live ? "text-emerald-100" : "text-foreground/80"}`}
    >
      {item.live ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
      ) : (
        <span className="text-[12px] leading-none">{item.emoji}</span>
      )}
      <span className="whitespace-nowrap">
        {item.live && <span className="mr-1">{item.emoji}</span>}
        <span className={item.live ? "font-semibold" : ""}>{item.label}</span>
        {item.suffix && (
          <span className="ml-1 tabular-nums text-emerald-200/90">· {item.suffix}</span>
        )}
      </span>
    </Comp>
  );
}

// -------- ticker --------
export function CommunityEventsTicker() {
  const { states, config } = useBotEvents();
  const navigate = useNavigate();

  const items = useMemo<TickerItem[]>(() => {
    const list: TickerItem[] = [];
    for (const k of ["fish", "dig", "wine"] as BotEventKind[]) {
      if (config[k].enabled) list.push(botEventToItem(k, states[k]));
    }
    // Always append a couple of tips as low-priority fillers so the ticker
    // never looks empty.
    list.push(...TIPS);
    list.sort((a, b) => a.priority - b.priority);
    return list;
  }, [states, config]);

  const handleClick = (item: TickerItem) => {
    if (item.href) {
      navigate({ to: item.href }).catch(() => { /* ignore */ });
      return;
    }
    // For bot events, ping the chat so the input focuses on the command.
    if (item.key.startsWith("bot-")) {
      window.dispatchEvent(new CustomEvent("palrgo:focus-composer"));
    }
  };

  // Duplicate items twice for a seamless CSS marquee loop.
  const loop = [...items, ...items];

  return (
    <div
      className="community-ticker group relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]"
      aria-label="Community events ticker"
    >
      <div className="community-ticker-track flex w-max items-center gap-3 whitespace-nowrap will-change-transform group-hover:[animation-play-state:paused]">
        {loop.map((item, i) => (
          <span key={`${item.key}-${i}`} className="inline-flex items-center gap-3">
            <TickerCell
              item={item}
              onClick={item.href || item.key.startsWith("bot-") ? () => handleClick(item) : undefined}
            />
            <span aria-hidden className="text-muted-foreground/50">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
