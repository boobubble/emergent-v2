import { useEffect, useMemo, useRef, useState } from "react";
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

interface AnnouncementItem {
  key: string;
  priority: number; // lower = shown first
  emoji: string;
  label: string;
  suffix?: string;
  live?: boolean;
  href?: string;
}

const TIPS: AnnouncementItem[] = [
  { key: "tip-mention", priority: 90, emoji: "💬", label: "Mention friends using @username" },
  { key: "tip-streak", priority: 91, emoji: "🎁", label: "Complete daily streaks for bonus XP" },
  { key: "tip-radio", priority: 92, emoji: "📻", label: "Join today's live radio session", href: "/radio" },
  { key: "tip-vote", priority: 93, emoji: "🏆", label: "Vote in community competitions", href: "/competitions" },
  { key: "tip-post", priority: 94, emoji: "📝", label: "Share your latest post on the Feed", href: "/feed" },
];

function botEventToItem(kind: BotEventKind, s: BotEventState): AnnouncementItem {
  const meta = BOT_EVENT_META[kind];
  const short = meta.label.replace(" Event", "");
  if (s.live) {
    const endingSoon = s.msUntilClose <= 60_000;
    return {
      key: `bot-${kind}-live`,
      priority: endingSoon ? 0 : 1,
      emoji: meta.emoji,
      label: `${short} Event is LIVE${s.golden ? " ✨2×" : ""}`,
      suffix: `ends in ${fmt(s.msUntilClose)}`,
      live: true,
    };
  }
  const soon = s.msUntilOpen <= 5 * 60_000;
  return {
    key: `bot-${kind}-wait`,
    priority: soon ? 2 : 5,
    emoji: meta.emoji,
    label: `${short} Event starts in ${fmt(s.msUntilOpen)}`,
  };
}

const ROTATE_MS = 5000;

export function CommunityEventsTicker() {
  const { states, config } = useBotEvents();
  const navigate = useNavigate();

  const items = useMemo<AnnouncementItem[]>(() => {
    const list: AnnouncementItem[] = [];
    for (const k of ["fish", "dig", "wine"] as BotEventKind[]) {
      if (config[k].enabled) list.push(botEventToItem(k, states[k]));
    }
    list.push(...TIPS);
    list.sort((a, b) => a.priority - b.priority);
    return list;
  }, [states, config]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");
  const prevTopKey = useRef<string | null>(null);

  // If a new highest-priority (live) item appears, jump to it immediately.
  useEffect(() => {
    const topKey = items[0]?.key ?? null;
    if (topKey && topKey !== prevTopKey.current && items[0]?.live) {
      setIndex(0);
      setPhase("in");
    }
    prevTopKey.current = topKey;
  }, [items]);

  // Rotate every 5s with a brief fade-out/in.
  useEffect(() => {
    if (items.length <= 1) return;
    const holdId = window.setTimeout(() => {
      setPhase("out");
      const swapId = window.setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setPhase("in");
      }, 320);
      return () => window.clearTimeout(swapId);
    }, ROTATE_MS);
    return () => window.clearTimeout(holdId);
  }, [index, items.length]);

  const current = items[Math.min(index, items.length - 1)] ?? null;
  if (!current) return null;

  const clickable = !!current.href || current.key.startsWith("bot-");
  const handleClick = () => {
    if (current.href) {
      navigate({ to: current.href }).catch(() => {});
      return;
    }
    if (current.key.startsWith("bot-")) {
      window.dispatchEvent(new CustomEvent("palrgo:focus-composer"));
    }
  };

  return (
    <div
      className="community-ticker relative flex-1 min-w-0 overflow-hidden"
      aria-label="Community announcements"
    >
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={clickable ? handleClick : undefined}
          disabled={!clickable}
          key={current.key}
          className={`community-announcement group inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium leading-none backdrop-blur-md transition ${
            clickable ? "cursor-pointer hover:bg-white/10" : "cursor-default"
          } ${current.live ? "text-emerald-100 border-emerald-400/30 bg-emerald-400/10" : "text-foreground/80"} ${
            phase === "in" ? "community-announcement-in" : "community-announcement-out"
          }`}
        >
          {current.live ? (
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          ) : null}
          <span className="text-[12px] leading-none shrink-0">{current.emoji}</span>
          <span className="truncate">
            <span className={current.live ? "font-semibold" : ""}>{current.label}</span>
            {current.suffix && (
              <span className="ml-1 tabular-nums text-emerald-200/90">· {current.suffix}</span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
