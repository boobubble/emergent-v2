import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BadgeCheck, Sparkles, Vote, VenetianMask, Newspaper, ArrowRight, BellOff, X } from "lucide-react";
import {
  getAssistantFeedRecommendations,
  triggerWelcomeIfNeeded,
  triggerMissionDigestIfNeeded,
  getBoobubblePublic,
  type AssistantRecommendation,
} from "@/lib/boobubble.functions";
import { useAuth } from "@/lib/auth-store";

const DISMISS_KEY = "boobubble:feed-rec:dismissed-at";

export function BoobubbleAssistantWidget() {
  const { user } = useAuth();
  const fetchRecs = useServerFn(getAssistantFeedRecommendations);
  const triggerWelcome = useServerFn(triggerWelcomeIfNeeded);
  const triggerMissions = useServerFn(triggerMissionDigestIfNeeded);
  const fetchPublic = useServerFn(getBoobubblePublic);

  const [items, setItems] = useState<AssistantRecommendation[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  // Fire welcome + mission digest triggers on first authenticated mount
  useEffect(() => {
    if (!user?.id || user.isGuest) return;
    triggerWelcome({}).catch(() => {});
    triggerMissions({}).catch(() => {});
  }, [user?.id, user?.isGuest, triggerWelcome, triggerMissions]);

  // Local dismissal (per 24h)
  useEffect(() => {
    try {
      const ts = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
      if (ts && Date.now() - ts < 24 * 60 * 60 * 1000) setDismissed(true);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user?.id || user.isGuest || dismissed) { setLoading(false); return; }
    let alive = true;
    Promise.all([fetchPublic({}), fetchRecs({})])
      .then(([pub, recs]) => {
        if (!alive) return;
        setEnabled(Boolean(pub?.enabled && pub?.feed_recs_enabled));
        setItems(recs.items ?? []);
      })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [user?.id, user?.isGuest, dismissed, fetchPublic, fetchRecs]);

  if (!user?.id || user.isGuest || dismissed || !enabled) return null;
  if (loading) return null;
  if (items.length === 0) return null;

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
    setDismissed(true);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-3 shadow-[0_8px_24px_-16px_oklch(0_0_0/0.4)]">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" aria-hidden />
      <div className="mb-2 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/20 text-primary">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-primary">
          BooBubble Assistant
          <BadgeCheck className="h-3.5 w-3.5 text-sky-400" aria-label="Official" />
        </span>
        <button
          type="button"
          onClick={dismiss}
          className="ml-auto rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Dismiss recommendations"
          title="Hide for today"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mb-2 text-[11px] text-muted-foreground">Real picks from the community — refreshed for you.</p>
      <ul className="space-y-1.5">
        {items.slice(0, 5).map((it) => (
          <RecItem key={`${it.kind}:${it.id}`} item={it} />
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between text-[11px]">
        <Link to="/account" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <BellOff className="h-3 w-3" /> Manage assistant
        </Link>
      </div>
    </div>
  );
}

function RecItem({ item }: { item: AssistantRecommendation }) {
  const Icon =
    item.kind === "poll" ? Vote : item.kind === "confession" ? VenetianMask : Newspaper;
  const href =
    item.kind === "confession"
      ? "/confessions"
      : item.slug
      ? `/feed/${item.slug}`
      : `/feed`;
  return (
    <li>
      <Link
        to={href}
        className="group flex items-center gap-2 rounded-lg border border-transparent bg-background/40 px-2 py-1.5 text-xs hover:border-primary/30 hover:bg-background"
      >
        <Icon className="h-3.5 w-3.5 shrink-0 text-primary/70" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-medium text-foreground">{item.title || "View"}</span>
          {item.author_username && (
            <span className="truncate text-[10px] text-muted-foreground">@{item.author_username}</span>
          )}
        </span>
        {item.thumbnail_url && (
          <img src={item.thumbnail_url} alt="" loading="lazy" className="h-7 w-7 shrink-0 rounded object-cover" />
        )}
        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    </li>
  );
}
