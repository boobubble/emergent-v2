import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PartyPopper, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  FUN_CATEGORIES,
  FUN_META,
  loadFunZoneSummary,
  type FunCategory,
  type FunZoneSummaryEntry,
} from "@/lib/competition-memes";
import { useAppSettings } from "@/lib/app-settings";

/**
 * 🎉 Fun Zone — premium summary block for a competition. Reads Feed posts
 * (posts_safe) filtered by category + competition_id. Feed owns the content.
 * Each card links to the dedicated fun-type page for full browsing.
 */
export function FunZone({
  competitionId,
  competitionSlug,
}: {
  competitionId: string;
  competitionSlug: string;
}) {
  const { modules } = useAppSettings();
  const [summary, setSummary] = useState<Record<FunCategory, FunZoneSummaryEntry> | null>(null);

  useEffect(() => {
    if (!modules.funZone) return;
    let alive = true;
    const load = () => loadFunZoneSummary(competitionId).then((s) => { if (alive) setSummary(s); });
    load();
    const ch = supabase
      .channel(`fun-zone-${competitionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts", filter: `competition_id=eq.${competitionId}` },
        () => load(),
      )
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [competitionId, modules.funZone]);

  if (!modules.funZone) return null;

  const enabledCats = FUN_CATEGORIES.filter((c) => {
    if (c === "meme") return modules.funZoneMemes !== false;
    if (c === "fan_art") return modules.funZoneFanArts !== false;
    if (c === "poster") return modules.funZonePosters !== false;
    if (c === "fan_edit") return modules.funZoneFanEdits !== false;
    return true;
  });
  if (enabledCats.length === 0) return null;

  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-fuchsia-500/5 to-transparent p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-black text-white sm:text-base">
          <PartyPopper className="h-4 w-4 text-amber-300" /> Fun Zone
        </h2>
        <span className="text-[11px] uppercase tracking-wider text-white/60">Community-powered</span>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {enabledCats.map((cat) => {
          const meta = FUN_META[cat];
          const entry = summary?.[cat];
          const count = entry?.count ?? 0;
          const thumb = entry?.thumb;
          const isVideo = thumb && /\.(mp4|webm)$/i.test(thumb);
          return (
            <Link
              key={cat}
              to="/competitions/$slug/fun/$type"
              params={{ slug: competitionSlug, type: meta.slug }}
              className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${meta.accent} p-3 transition hover:border-white/25 hover:shadow-lg`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-black/40">
                {thumb ? (
                  isVideo ? (
                    <video src={thumb} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <img src={thumb} alt={meta.plural} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                  )
                ) : (
                  <div className="grid h-full w-full place-items-center text-4xl">{meta.emoji}</div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">{count} {count === 1 ? "post" : "posts"}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm font-bold text-white">
                  {meta.emoji} {meta.plural}
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-white/60 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
