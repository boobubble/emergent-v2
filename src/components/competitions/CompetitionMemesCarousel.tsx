import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Laugh, MessageCircle, Heart, ArrowRight } from "lucide-react";
import { useCompetitionRealtimeEffect } from "@/lib/competition-realtime";
import { listCompetitionMemes } from "@/lib/competition-memes";
import type { FeedPost } from "@/lib/feed-types";
import { isNavigableSlug } from "@/lib/route-slug";

/**
 * 😂 Trending Battle Memes — compact horizontal carousel that reads Feed
 * posts where category='meme' and competition_id=<id>, ranked by
 * engagement. Feed owns the content; this only filters/displays.
 */
export function CompetitionMemesCarousel({
  competitionId,
  competitionSlug,
  nomineeId,
  limit = 10,
}: {
  competitionId: string;
  competitionSlug: string;
  nomineeId?: string | null;
  limit?: number;
}) {
  const [memes, setMemes] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const data = await listCompetitionMemes({ competitionId, nomineeId, limit });
      if (alive) { setMemes(data); setLoading(false); }
    }
    void load();
    return () => { alive = false; };
  }, [competitionId, nomineeId, limit]);

  useCompetitionRealtimeEffect(!!competitionId, (supabase) => {
    const load = () => listCompetitionMemes({ competitionId, nomineeId, limit }).then((data) => setMemes(data));
    const ch = supabase
      .channel(`comp-memes-${competitionId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts", filter: `competition_id=eq.${competitionId}` },
        () => load(),
      )
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [competitionId, nomineeId, limit]);

  if (loading && memes.length === 0) return null;
  if (!isNavigableSlug(competitionSlug)) return null;

  const viewAllTo = nomineeId
    ? `/competitions/${competitionSlug}/memes?nominee=${nomineeId}`
    : `/competitions/${competitionSlug}/memes`;

  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <header className="mb-3 flex items-center justify-between">
        <h2 className="inline-flex items-center gap-2 text-sm font-black text-white sm:text-base">
          <Laugh className="h-4 w-4 text-amber-300" /> Trending Battle Memes
        </h2>
        <Link
          to="/competitions/$slug/memes"
          params={{ slug: competitionSlug }}
          search={{ nominee: nomineeId ?? "" }}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      {memes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-xs text-white/60">
          No memes yet. Post one from the Feed and tag this competition!
        </div>
      ) : (
        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
          {memes.map((m) => {
            const img = (m.media_urls ?? []).find((u) => /\.(jpe?g|png|gif|webp|avif)$/i.test(u)) ?? m.media_urls?.[0];
            const feedSlug = m.slug || m.id;
            const cardClassName =
              "group relative w-40 shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:w-48";
            const cardBody = (
              <>
                {img ? (
                  /\.(mp4|webm)$/i.test(img) ? (
                    <video src={img} className="h-40 w-full object-cover sm:h-48" muted playsInline />
                  ) : (
                    <img src={img} alt="" className="h-40 w-full object-cover transition group-hover:scale-105 sm:h-48" loading="lazy" />
                  )
                ) : (
                  <div className="grid h-40 w-full place-items-center bg-gradient-to-br from-fuchsia-500/20 to-amber-500/20 p-3 text-center text-xs text-white/80 sm:h-48">
                    {(m.text || "Meme").slice(0, 120)}
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/80 to-transparent p-2 text-[11px] font-semibold text-white">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" />{m.reaction_count ?? 0}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{m.comment_count ?? 0}</span>
                </div>
              </>
            );

            if (!isNavigableSlug(feedSlug)) {
              return (
                <div key={m.id} className={cardClassName}>
                  {cardBody}
                </div>
              );
            }

            return (
              <Link
                key={m.id}
                to="/feed/$slug"
                params={{ slug: feedSlug }}
                className={cardClassName}
              >
                {cardBody}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
