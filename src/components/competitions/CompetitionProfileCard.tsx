import { Link } from "@tanstack/react-router";
import { Crown, Eye, Flame, Heart, Pencil, Sparkles, Trophy, Users, Vote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "./Countdown";
import type { EnrichedCompetition } from "@/lib/competitions.functions";

const statusStyle: Record<string, string> = {
  live: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  upcoming: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  completed: "bg-zinc-500/20 text-zinc-400 border-zinc-500/40",
  draft: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function prizeSummary(rewards: any): string | null {
  if (!rewards || typeof rewards !== "object") return null;
  const parts: string[] = [];
  if (rewards.coins) parts.push(`${formatNumber(Number(rewards.coins))} coins`);
  if (rewards.xp) parts.push(`${formatNumber(Number(rewards.xp))} XP`);
  if (rewards.premium_days) parts.push(`${rewards.premium_days}d premium`);
  if (rewards.custom && typeof rewards.custom === "string") parts.push(rewards.custom);
  return parts.length ? parts.join(" · ") : null;
}

export interface CompetitionProfileCardProps {
  c: EnrichedCompetition;
  onEdit?: (c: EnrichedCompetition) => void;
  trending?: boolean;
}

export function CompetitionProfileCard({ c, onEdit, trending }: CompetitionProfileCardProps) {
  const color = c.category?.color ?? "#8b5cf6";
  const prize = prizeSummary(c.rewards);
  const leading = c.top_competitors[0];
  const top3 = c.top_competitors.slice(0, 3);

  return (
    <Link
      to="/competitions/$slug"
      params={{ slug: c.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.5)]"
    >
      {/* Banner */}
      <div
        className="relative h-36 w-full overflow-hidden"
        style={{
          background: c.banner_url
            ? `url(${c.banner_url}) center/cover`
            : `linear-gradient(135deg, ${color}, ${color}80)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle at 50% 0%, ${color}55, transparent 60%)` }}
        />

        {/* Top-left: category */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          {c.category && (
            <Badge variant="outline" className="border-white/30 bg-black/40 text-[10px] uppercase tracking-wide text-white backdrop-blur">
              {c.category.name}
            </Badge>
          )}
        </div>

        {/* Top-right: status & badges */}
        <div className="absolute right-3 top-3 flex flex-wrap items-center gap-1.5">
          {c.is_featured && (
            <Badge className="gap-1 border border-amber-400/50 bg-amber-500/25 text-[10px] font-semibold uppercase text-amber-200">
              <Sparkles className="h-2.5 w-2.5" /> Featured
            </Badge>
          )}
          {trending && (
            <Badge className="gap-1 border border-rose-400/50 bg-rose-500/25 text-[10px] font-semibold uppercase text-rose-200">
              <Flame className="h-2.5 w-2.5" /> Trending
            </Badge>
          )}
          {c.status === "live" && (
            <Badge className="gap-1 border border-emerald-400/50 bg-emerald-500/25 text-[10px] font-semibold uppercase text-emerald-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live
            </Badge>
          )}
          {c.status !== "live" && (
            <Badge className={`border text-[10px] uppercase ${statusStyle[c.status]}`}>{c.status}</Badge>
          )}
          {c.is_published === false && (
            <Badge className="border border-rose-500/40 bg-rose-500/20 text-[10px] uppercase text-rose-300">Unpublished</Badge>
          )}
        </div>

        {/* Bottom: leading nominee overlay */}
        {leading && c.status !== "upcoming" && (
          <div className="absolute inset-x-3 bottom-3 flex items-center gap-2 rounded-xl border border-white/15 bg-black/50 p-2 backdrop-blur-md">
            {leading.photo_url ? (
              <img src={leading.photo_url} alt={leading.name} className="h-8 w-8 rounded-full border border-white/30 object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white">
                {leading.name?.[0] ?? "?"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-amber-300/90">
                <Crown className="h-3 w-3" /> Leading
              </div>
              <div className="truncate text-xs font-semibold text-white">{leading.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-white">{formatNumber(leading.votes)}</div>
              <div className="text-[9px] uppercase text-white/60">votes</div>
            </div>
          </div>
        )}

        {onEdit && (
          <button
            type="button"
            aria-label="Edit competition"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(c); }}
            className="absolute right-3 bottom-3 z-10 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur hover:bg-black/90"
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 text-base font-bold">{c.name}</h3>
          {c.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
          )}
        </div>

        {/* Top-3 mini preview */}
        {top3.length > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-2">
              {top3.map((t, i) => (
                <div
                  key={t.id}
                  className="relative h-7 w-7 overflow-hidden rounded-full border-2 border-background"
                  style={{ zIndex: 10 - i }}
                >
                  {t.photo_url ? (
                    <img src={t.photo_url} alt={t.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/10 text-[10px] font-bold">
                      {t.name?.[0] ?? "?"}
                    </div>
                  )}
                  {i === 0 && (
                    <div className="absolute -right-0.5 -top-0.5 rounded-full bg-amber-400 p-0.5">
                      <Crown className="h-2 w-2 text-black" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">Top {top3.length}</span>
          </div>
        )}

        {/* Prize */}
        {prize && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2 py-1.5 text-[11px] font-medium text-amber-200">
            <Trophy className="h-3 w-3" /> {prize}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-1 text-[10px] text-muted-foreground">
          <div className="flex flex-col items-center gap-0.5">
            <Users className="h-3 w-3" />
            <span className="font-semibold text-foreground">{formatNumber(c.total_participants)}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Vote className="h-3 w-3" />
            <span className="font-semibold text-foreground">{formatNumber(c.total_votes)}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Heart className="h-3 w-3" />
            <span className="font-semibold text-foreground">{formatNumber(c.follower_count)}</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <Eye className="h-3 w-3" />
            <span className="font-semibold text-foreground">{formatNumber(c.views_count ?? 0)}</span>
          </div>
        </div>

        {/* Countdown */}
        {c.status !== "completed" ? (
          <div className="rounded-xl border border-white/10 bg-black/20 p-2">
            <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              {c.status === "live" ? "Ends in" : "Starts in"}
            </div>
            <Countdown endAt={c.status === "live" ? c.end_at : c.start_at} compact />
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/20 p-2 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
            Ended {new Date(c.end_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </Link>
  );
}
