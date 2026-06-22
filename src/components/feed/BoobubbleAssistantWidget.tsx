import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles,
  ArrowRight,
  X,
  RefreshCw,
  Heart,
  Flame,
  Wand2,
  SlidersHorizontal,
  Newspaper,
  Vote,
  VenetianMask,
} from "lucide-react";
import {
  getAssistantFeedRecommendations,
  triggerWelcomeIfNeeded,
  triggerMissionDigestIfNeeded,
  triggerRewardDigestIfNeeded,
  triggerEventAnnouncementIfNeeded,
  triggerSecurityDigestIfNeeded,
  getFriendSuggestions,
  getBoobubblePublic,
  type AssistantRecommendation,
  type FriendSuggestion,
} from "@/lib/boobubble.functions";
import { useAuth } from "@/lib/auth-store";

const DISMISS_KEY = "boobubble:feed-rec:dismissed-at";

const CATEGORY_META: Record<
  AssistantRecommendation["kind"],
  { label: string; icon: React.ReactNode; tone: string; bg: string; text: string; ring: string }
> = {
  post: {
    label: "Post",
    icon: <Newspaper className="h-3 w-3" />,
    tone: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
    bg: "bg-violet-500/10",
    text: "text-violet-300",
    ring: "ring-violet-500/20",
  },
  poll: {
    label: "Poll",
    icon: <Vote className="h-3 w-3" />,
    tone: "from-amber-500/20 via-orange-500/10 to-transparent",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    ring: "ring-amber-500/20",
  },
  confession: {
    label: "Confession",
    icon: <VenetianMask className="h-3 w-3" />,
    tone: "from-emerald-500/20 via-teal-500/10 to-transparent",
    bg: "bg-emerald-500/10",
    text: "text-emerald-300",
    ring: "ring-emerald-500/20",
  },
};

export function BoobubbleAssistantWidget() {
  const { user } = useAuth();
  const fetchRecs = useServerFn(getAssistantFeedRecommendations);
  const triggerWelcome = useServerFn(triggerWelcomeIfNeeded);
  const triggerMissions = useServerFn(triggerMissionDigestIfNeeded);
  const triggerRewards = useServerFn(triggerRewardDigestIfNeeded);
  const triggerEvent = useServerFn(triggerEventAnnouncementIfNeeded);
  const triggerSecurity = useServerFn(triggerSecurityDigestIfNeeded);
  const fetchFriends = useServerFn(getFriendSuggestions);
  const fetchPublic = useServerFn(getBoobubblePublic);

  const [items, setItems] = useState<AssistantRecommendation[]>([]);
  const [friends, setFriends] = useState<FriendSuggestion[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  // Fire all idempotent triggers on first authenticated mount
  useEffect(() => {
    if (!user?.id || user.isGuest) return;
    triggerWelcome({}).catch(() => {});
    triggerMissions({}).catch(() => {});
    triggerRewards({}).catch(() => {});
    triggerEvent({}).catch(() => {});
    triggerSecurity({}).catch(() => {});
  }, [user?.id, user?.isGuest, triggerWelcome, triggerMissions, triggerRewards, triggerEvent, triggerSecurity]);

  // Local dismissal (per 24h)
  useEffect(() => {
    try {
      const ts = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (ts && Date.now() - ts < 24 * 60 * 60 * 1000) setDismissed(true);
    } catch { /* ignore */ }
  }, []);

  const load = useCallback(() => {
    if (!user?.id || user.isGuest || dismissed) { setLoading(false); return; }
    let alive = true;
    Promise.all([fetchPublic({}), fetchRecs({}), fetchFriends({})])
      .then(([pub, recs, fr]) => {
        if (!alive) return;
        setEnabled(Boolean(pub?.enabled && pub?.feed_recs_enabled));
        setItems(recs.items ?? []);
        setFriends(fr.items ?? []);
        setRefreshTick((t) => t + 1);
      })
      .catch(() => { if (alive) { setItems([]); setFriends([]); } })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user?.id, user?.isGuest, dismissed, fetchPublic, fetchRecs, fetchFriends]);

  useEffect(() => { load(); }, [load]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    load();
    setTimeout(() => setRefreshing(false), 800);
  }, [load]);

  // Auto-refresh on a timer, paused when off-screen or tab hidden
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(
    typeof document !== "undefined" ? !document.hidden : true,
  );
  const REFRESH_MS = 60_000;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [dismissed, enabled, loading]);

  useEffect(() => {
    const onVis = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (!inView || !tabVisible || dismissed || !enabled) return;
    if (!user?.id || user.isGuest) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setRefreshing(true);
      load();
      window.setTimeout(() => setRefreshing(false), 800);
    }, REFRESH_MS);
    return () => window.clearInterval(id);
  }, [inView, tabVisible, dismissed, enabled, user?.id, user?.isGuest, load]);


  if (!user?.id || user.isGuest || dismissed || !enabled) return null;
  if (loading && items.length === 0 && friends.length === 0) return null;
  if (items.length === 0 && friends.length === 0) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    setDismissed(true);
  };

  return (
    <div ref={containerRef} className="ai-border-glow relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950 via-purple-950 to-slate-950 p-[1px]">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-violet-500/25 blur-3xl" />

      <div className="relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-950/80 via-violet-950/70 to-slate-950/80 p-4 backdrop-blur-xl">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="ai-orb-breathe relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-400 via-fuchsia-400 to-purple-500 shadow-lg shadow-fuchsia-500/30">
              <Wand2 className="h-4.5 w-4.5 text-white" />
              <span
                className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-slate-950 ${
                  inView && tabVisible
                    ? refreshing
                      ? "bg-fuchsia-400 animate-ping"
                      : "bg-emerald-400 animate-pulse"
                    : "bg-white/30"
                }`}
              />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight text-white">AI Picks For You</h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-violet-300/80">
                {inView && tabVisible ? (refreshing ? "Refreshing…" : "Live · auto-refresh") : "Paused"}
              </p>

            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={refresh}
              title="Refresh picks"
              aria-label="Refresh picks"
              className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
              aria-label="Dismiss recommendations"
              title="Hide for today"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Subtitle */}
        <p className="mb-3 text-[11px] text-white/50">
          Real picks from the community — refreshed for you.
        </p>

        {/* Recommendation cards */}
        {items.length > 0 && (
          <div className="space-y-2">
            {items.slice(0, 5).map((it, idx) => (
              <RecCard key={`${it.kind}:${it.id}`} item={it} index={idx} />
            ))}
          </div>
        )}

        {/* Friend suggestions */}
        {friends.length > 0 && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold text-white/60">
              <Sparkles className="h-3 w-3 text-violet-400" /> People you may know
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {friends.slice(0, 4).map((f) => (
                <Link
                  key={f.id}
                  to="/u/$username"
                  params={{ username: f.username }}
                  className="group flex min-w-[140px] flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:-translate-y-0.5 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-violet-500/10"
                >
                  {f.avatar_url ? (
                    <img
                      src={f.avatar_url}
                      alt=""
                      loading="lazy"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10 group-hover:ring-violet-400/40 transition"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-bold text-white">
                      {f.username.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[100px] truncate text-[11px] font-semibold text-white/90">
                    @{f.username}
                  </span>
                  <span className="text-[10px] text-white/40">{f.mutual_count} mutual</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <Link
            to="/feed"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-white/50 transition hover:text-violet-300"
          >
            See more picks <ArrowRight className="h-3 w-3" />
          </Link>
          <Link
            to="/account"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-white/50 transition hover:text-violet-300"
          >
            <SlidersHorizontal className="h-3 w-3" /> Personalize feed
          </Link>
        </div>
      </div>
    </div>
  );
}

function RecCard({ item, index }: { item: AssistantRecommendation; index: number }) {
  const meta = CATEGORY_META[item.kind];
  const href =
    item.kind === "confession"
      ? "/confessions"
      : item.slug
      ? `/feed/${item.slug}`
      : `/feed`;

  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent p-2.5 transition hover:-translate-y-0.5 hover:border-white/10 hover:shadow-lg hover:shadow-violet-500/10 hover:bg-white/[0.05]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      {/* Thumbnail or icon */}
      {item.thumbnail_url ? (
        <div className="relative shrink-0">
          <img
            src={item.thumbnail_url}
            alt=""
            loading="lazy"
            className="h-12 w-12 rounded-xl object-cover ring-1 ring-white/10 group-hover:ring-violet-400/30 transition"
          />
          <div className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-slate-950 ring-1 ring-white/20">
            <span className="text-[9px] leading-none">{meta.icon}</span>
          </div>
        </div>
      ) : (
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${meta.tone} ring-1 ${meta.ring}`}>
          <span className={meta.text}>{meta.icon}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${meta.bg} ${meta.text}`}>
            {meta.icon}
            {meta.label}
          </span>
          {item.reaction_count !== null && item.reaction_count > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-white/40">
              <Heart className="h-2.5 w-2.5 text-rose-400/70" /> {item.reaction_count}
            </span>
          )}
          {item.score > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-white/40">
              <Flame className="h-2.5 w-2.5 text-amber-400/70" /> {Math.round(item.score)}
            </span>
          )}
        </div>
        <span className="truncate text-[12px] font-semibold text-white/90 group-hover:text-white transition">
          {item.title || "View"}
        </span>
        {item.author_username && (
          <span className="truncate text-[10px] text-white/40">
            @{item.author_username}
          </span>
        )}
      </div>

      {/* Arrow */}
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/20 opacity-0 transition group-hover:translate-x-0.5 group-hover:text-white/60 group-hover:opacity-100" />
    </Link>
  );
}
