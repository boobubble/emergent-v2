import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAppSettings } from "@/lib/app-settings";
import {
  DISCOVERY_WIDGETS_DEFAULTS,
  mergeDiscoveryWidgetsConfig,
  type DiscoveryWidgetItem,
  type DiscoveryWidgetKey,
} from "@/lib/discovery-widgets-config";

const STORAGE_KEY = "discovery-widgets:v1";

interface Stats {
  impressions: Partial<Record<DiscoveryWidgetKey, number>>;
  clicks: Partial<Record<DiscoveryWidgetKey, number>>;
}

function loadStats(): Stats {
  if (typeof window === "undefined") return { impressions: {}, clicks: {} };
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "") as Stats;
  } catch {
    return { impressions: {}, clicks: {} };
  }
}

function saveStats(s: Stats) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

/**
 * ModuleDiscoveryWidget — reusable feed widget promoting a platform module.
 *
 * Picks the best module to show at this feed slot based on:
 *  - Admin-configured priority & enabled flag
 *  - Impression count (rotation: less-seen wins)
 *  - Visit history (already-clicked → reduced weight)
 *
 * The parent controls placement (insertion frequency); this component
 * chooses which module to promote at its position and de-duplicates
 * across consecutive slots via the `slotIndex` prop.
 */
export function ModuleDiscoveryWidget({ slotIndex = 0 }: { slotIndex?: number }) {
  const { raw } = useAppSettings();
  const config = useMemo(
    () => mergeDiscoveryWidgetsConfig(raw?.discovery_widgets),
    [raw],
  );

  const [stats, setStats] = useState<Stats>(() => loadStats());

  // Track keys already shown this session in earlier slots — avoid repeats.
  const [sessionShown] = useState<Set<string>>(() => new Set());

  const item = useMemo<DiscoveryWidgetItem | null>(() => {
    if (!config.enabled) return null;
    const pool = config.items.filter((it) => it.enabled);
    if (pool.length === 0) return null;
    // Weight = priority * impression-decay * visited-penalty
    const scored = pool.map((it) => {
      const imps = stats.impressions[it.key] ?? 0;
      const clicks = stats.clicks[it.key] ?? 0;
      const visitedPenalty = clicks > 0 ? 0.35 : 1.5;
      const weight = (it.priority || 1) * (1 / (1 + imps * 0.6)) * visitedPenalty;
      return { it, weight };
    });
    // Deterministic pick per slotIndex using a rotating offset so consecutive
    // slots don't collide.
    scored.sort((a, b) => b.weight - a.weight);
    // Filter items shown earlier this session in a nearby slot.
    const fresh = scored.filter((s) => !sessionShown.has(s.it.key));
    const winner = (fresh[0] ?? scored[0]).it;
    // Rotate a bit by slotIndex to avoid the same top item always.
    const rotated = scored[(slotIndex) % scored.length]?.it ?? winner;
    // Prefer rotated when it's still reasonably weighted, else winner.
    const pick = sessionShown.has(rotated.key) ? winner : rotated;
    return pick;
  }, [config, stats, slotIndex, sessionShown]);

  useEffect(() => {
    if (!item) return;
    sessionShown.add(item.key);
    setStats((prev) => {
      const next: Stats = {
        impressions: { ...prev.impressions, [item.key]: (prev.impressions[item.key] ?? 0) + 1 },
        clicks: { ...prev.clicks },
      };
      saveStats(next);
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item?.key]);

  if (!item) return null;

  const onClick = () => {
    setStats((prev) => {
      const next: Stats = {
        impressions: { ...prev.impressions },
        clicks: { ...prev.clicks, [item.key]: (prev.clicks[item.key] ?? 0) + 1 },
      };
      saveStats(next);
      return next;
    });
  };

  return (
    <div className="feed-card group relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/[0.06] via-background to-background p-4 shadow-sm transition hover:border-primary/40 hover:shadow-[0_10px_30px_-15px_var(--primary-glow,rgba(139,92,246,0.55))]">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-70"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl"
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary/25 to-primary/5 text-2xl ring-1 ring-inset ring-primary/25">
          <span aria-hidden>{item.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-foreground">{item.title}</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary ring-1 ring-inset ring-primary/25">
              <Sparkles className="h-2.5 w-2.5" /> Discover
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">
            {item.description}
          </p>
          <div className="mt-2.5">
            <Link
              to={item.to}
              onClick={onClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-[0_6px_18px_-6px_var(--primary-glow,rgba(139,92,246,0.7))] transition hover:brightness-110 active:scale-95"
            >
              {item.ctaText} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { DISCOVERY_WIDGETS_DEFAULTS };
