import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PartyPopper, ArrowRight, Sparkles, MessageCircle, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  FUN_CATEGORIES,
  FUN_META,
  BADGE_META,
  loadFunZoneSummary,
  type FunCategory,
  type FunZoneSummary,
} from "@/lib/competition-memes";
import { useAppSettings } from "@/lib/app-settings";
import { isNavigableSlug } from "@/lib/route-slug";

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/**
 * 🎉 Fun Zone — premium summary block for a competition. Reads Feed posts
 * (posts_safe) filtered by category + competition_id in a single query and
 * derives per-category stats, engagement badges, and a mixed highlights strip.
 */
export function FunZone({
  competitionId,
  competitionSlug,
}: {
  competitionId: string;
  competitionSlug: string;
}) {
  const { modules } = useAppSettings();
  const [summary, setSummary] = useState<FunZoneSummary | null>(null);

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

  const enabledCats = useMemo(() => FUN_CATEGORIES.filter((c) => {
    if (c === "meme") return modules.funZoneMemes !== false;
    if (c === "fan_art") return modules.funZoneFanArts !== false;
    if (c === "poster") return modules.funZonePosters !== false;
    if (c === "fan_edit") return modules.funZoneFanEdits !== false;
    return true;
  }), [modules]);

  if (!modules.funZone) return null;
  if (enabledCats.length === 0) return null;
  if (!isNavigableSlug(competitionSlug)) return null;

  const perCat = summary?.perCategory;
  const highlights = (summary?.highlights ?? []).filter((h) => enabledCats.includes(h.category));

  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-gradient-to-br from-amber-500/10 via-fuchsia-500/5 to-transparent p-4">
      {/* Live stats bar */}
      <div className="mb-3 grid grid-cols-4 gap-2">
        {enabledCats.map((cat) => {
          const meta = FUN_META[cat];
          const entry = perCat?.[cat];
          return (
            <Link
              key={`stat-${cat}`}
              to="/competitions/$slug/fun/$type"
              params={{ slug: competitionSlug, type: meta.slug }}
              search={{ nominee: "" }}
              className="rounded-xl border border-white/10 bg-black/30 px-2 py-1.5 text-center transition hover:border-white/25"
            >
              <div className="text-base leading-none">{meta.emoji}</div>
              <div className="mt-0.5 text-sm font-black tabular-nums text-white">{entry?.count ?? 0}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60">{meta.plural}</div>
            </Link>
          );
        })}
      </div>

      <header className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-black text-white sm:text-base">
          <PartyPopper className="h-4 w-4 text-amber-300" /> Fun Zone
        </h2>
        <span className="text-[11px] uppercase tracking-wider text-white/60">Community-powered</span>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {enabledCats.map((cat) => {
          const meta = FUN_META[cat];
          const entry = perCat?.[cat];
          const count = entry?.count ?? 0;
          const thumb = entry?.thumb;
          const isVideo = thumb && /\.(mp4|webm)$/i.test(thumb);
          const badge = entry?.badge ? BADGE_META[entry.badge] : null;
          const empty = count === 0;

          return (
            <Link
              key={cat}
              to="/competitions/$slug/fun/$type"
              params={{ slug: competitionSlug, type: meta.slug }}
              search={{ nominee: "" }}
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
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 text-center">
                    <div className="text-3xl">{meta.emoji}</div>
                    <p className="text-[11px] font-medium leading-snug text-white/70">Be the first fan to support this battle.</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white">
                      <Sparkles className="h-2.5 w-2.5" /> {meta.cta}
                    </span>
                  </div>
                )}
                {badge && !empty && (
                  <div className={`absolute left-2 top-2 rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${badge.className}`}>
                    {badge.emoji} {badge.label}
                  </div>
                )}
                {!empty && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-white/80">{count} {count === 1 ? "post" : "posts"}</div>
                  </div>
                )}
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

      {/* Community Highlights carousel */}
      {highlights.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white/80">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-300" /> Community Highlights
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-white/50">Top from every category</span>
          </div>
          <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {highlights.map((h) => {
              const meta = FUN_META[h.category];
              const media = h.media_urls.find((u) => /\.(jpe?g|png|gif|webp|avif|mp4|webm)$/i.test(u)) ?? h.media_urls[0] ?? null;
              const isVid = media && /\.(mp4|webm)$/i.test(media);
              const permalink = `/feed/${h.slug ?? h.id}`;
              return (
                <Link
                  key={h.id}
                  to={permalink}
                  className="group relative flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 transition hover:border-white/25"
                >
                  <div className="relative aspect-[4/5] w-full bg-black/50">
                    {media ? (
                      isVid ? (
                        <video src={media} className="h-full w-full object-cover" muted playsInline />
                      ) : (
                        <img src={media} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                      )
                    ) : (
                      <div className="grid h-full w-full place-items-center text-3xl">{meta.emoji}</div>
                    )}
                    <div className="absolute left-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                      {meta.emoji} {meta.label}
                    </div>
                  </div>
                  <div className="p-1.5">
                    {h.text && <p className="line-clamp-1 text-[11px] font-medium text-white/90">{h.text}</p>}
                    <div className="mt-0.5 flex items-center justify-between text-[10px] text-white/60">
                      <span className="inline-flex items-center gap-2 tabular-nums">
                        <span className="inline-flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" />{h.reaction_count}</span>
                        <span className="inline-flex items-center gap-0.5"><MessageCircle className="h-2.5 w-2.5" />{h.comment_count}</span>
                      </span>
                      <span>{timeAgo(h.created_at)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
