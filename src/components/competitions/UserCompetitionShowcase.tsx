import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Award, Coins, Crown, Flame, Heart, Medal, Sparkles, Star,
  Trophy, TrendingUp, Users, Vote, Zap,
} from "lucide-react";
import { getUserCompetitionShowcase } from "@/lib/competitions.functions";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n ?? 0);
}

const eventLabel: Record<string, { emoji: string; text: string }> = {
  competition_vote: { emoji: "🗳", text: "Voted" },
  competition_follow: { emoji: "❤️", text: "Followed" },
  competition_join: { emoji: "🎯", text: "Joined" },
  competition_share: { emoji: "🔗", text: "Shared" },
  competition_win_1st: { emoji: "🏆", text: "Won 1st" },
  competition_win_2nd: { emoji: "🥈", text: "Runner-up" },
  competition_win_3rd: { emoji: "🥉", text: "Third place" },
  competition_win: { emoji: "🏆", text: "Won" },
};

export function UserCompetitionShowcase({ username }: { username: string }) {
  const fetchShowcase = useServerFn(getUserCompetitionShowcase);
  const { data, isLoading } = useQuery({
    queryKey: ["user-competition-showcase", username.toLowerCase()],
    queryFn: () => fetchShowcase({ data: { username } }),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <section>
        <SectionHeader />
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-xs text-muted-foreground">
          Loading competitions…
        </div>
      </section>
    );
  }
  if (!data?.profile) return null;

  const { totals, badges, showcase, currentLive, recentAwards, timeline, recentActivity } = data;
  const hasAnything =
    totals.joined > 0 || totals.votes_received > 0 || badges.length > 0 || currentLive.length > 0;

  return (
    <section className="space-y-5">
      <SectionHeader />

      {!hasAnything && (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-muted-foreground">
          <Trophy className="mx-auto mb-2 h-6 w-6 opacity-40" />
          Not competing yet. Join a competition to start building a legacy.
        </div>
      )}

      {/* Showcase strip */}
      {showcase.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {showcase.map((s, i) => (
            <Link
              key={i}
              to="/competitions/$slug"
              params={{ slug: s.competition?.slug ?? "" }}
              className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-fuchsia-500/5 to-transparent p-3 transition-all hover:border-amber-400/40"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-lg shadow-lg">
                {s.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold uppercase tracking-wide text-amber-200">{s.label}</div>
                {s.extra && <div className="truncate text-[10px] text-muted-foreground">{s.extra}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Totals grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniStat icon={<Trophy className="h-3 w-3" />} label="Joined" value={fmt(totals.joined)} />
        <MiniStat icon={<Crown className="h-3 w-3 text-amber-400" />} label="Wins" value={fmt(totals.wins)} tint="text-amber-300" />
        <MiniStat icon={<Medal className="h-3 w-3 text-slate-300" />} label="Runner-ups" value={fmt(totals.runner_ups)} />
        <MiniStat icon={<Award className="h-3 w-3 text-orange-400" />} label="3rd Places" value={fmt(totals.third_places)} />
        <MiniStat icon={<Vote className="h-3 w-3" />} label="Votes recv" value={fmt(totals.votes_received)} />
        <MiniStat icon={<Heart className="h-3 w-3 text-rose-400" />} label="Followers" value={fmt(totals.followers_earned)} />
        <MiniStat icon={<TrendingUp className="h-3 w-3 text-emerald-400" />} label="Best Rank" value={totals.best_rank ? `#${totals.best_rank}` : "—"} />
        <MiniStat icon={<Sparkles className="h-3 w-3 text-amber-300" />} label="Featured" value={fmt(totals.featured_count)} />
        <MiniStat icon={<Flame className="h-3 w-3 text-rose-500" />} label="Live now" value={fmt(totals.live_count)} />
        <MiniStat icon={<Users className="h-3 w-3" />} label="Following" value={fmt(totals.following_count)} />
        <MiniStat icon={<Coins className="h-3 w-3 text-yellow-400" />} label="Coins earned" value={fmt(totals.coins_earned)} />
        <MiniStat icon={<Zap className="h-3 w-3 text-fuchsia-400" />} label="XP earned" value={fmt(totals.xp_earned)} />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Award className="h-3 w-3" /> Competition Badges ({badges.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-gradient-to-r ${b.tint} px-2.5 py-1 text-[11px] font-semibold text-black shadow-sm`}
                title={b.name}
              >
                <span>{b.emoji}</span> {b.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Currently competing */}
      {currentLive.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Currently competing
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {currentLive.map((c) => (
              <Link
                key={c.id}
                to="/competitions/$slug"
                params={{ slug: c.competition?.slug ?? "" }}
                className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-2.5 hover:border-emerald-400/40"
              >
                {c.photo_url ? (
                  <img src={c.photo_url} alt="" className="h-9 w-9 rounded-full border border-white/20 object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-white/10" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{c.competition?.name ?? "Competition"}</div>
                  <div className="text-[10px] text-muted-foreground">{fmt(c.vote_count)} votes</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent awards */}
      {(recentAwards as any[]).length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Trophy className="h-3 w-3 text-amber-400" /> Recent awards
          </h3>
          <div className="space-y-1.5">
            {(recentAwards as any[]).map((a) => (
              <Link
                key={a.id}
                to="/competitions/$slug"
                params={{ slug: a.competition?.slug ?? "" }}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-2.5 hover:border-white/20"
              >
                <div className="text-lg">{a.place === 1 ? "🏆" : a.place === 2 ? "🥈" : a.place === 3 ? "🥉" : "🏅"}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold">{a.competition?.name ?? "Competition"}</div>
                  <div className="text-[10px] text-muted-foreground">
                    #{a.place} · {new Date(a.awarded_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Zap className="h-3 w-3" /> Recent activity
          </h3>
          <div className="space-y-1">
            {recentActivity.map((e, i) => {
              const info = eventLabel[e.event_type] ?? { emoji: "•", text: e.event_type };
              return (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 text-[11px]">
                  <span>{info.emoji}</span>
                  <span className="flex-1 truncate">{info.text}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(e.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            <Star className="h-3 w-3 text-amber-400" /> Competition timeline
          </h3>
          <div className="relative pl-4">
            <div className="absolute bottom-0 left-1 top-0 w-px bg-gradient-to-b from-amber-500/40 via-white/10 to-transparent" />
            <div className="space-y-2">
              {timeline.map((t, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[14px] top-2 h-2 w-2 rounded-full bg-amber-400" />
                  <Link
                    to="/competitions/$slug"
                    params={{ slug: t.competition?.slug ?? "" }}
                    className="block rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 hover:border-white/20"
                  >
                    <div className="flex items-center gap-2 text-[11px]">
                      {t.kind === "award" ? (
                        <span className="font-semibold text-amber-300">
                          {t.place === 1 ? "🏆 Champion" : t.place === 2 ? "🥈 Runner Up" : t.place === 3 ? "🥉 Third" : `🏅 #${t.place}`}
                        </span>
                      ) : (
                        <span className="font-semibold text-sky-300">🎯 Joined</span>
                      )}
                      <span className="truncate">{t.competition?.name ?? "Competition"}</span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(t.at).toLocaleDateString()}
                      {t.kind === "join" && (t as any).vote_count > 0 ? ` · ${fmt((t as any).vote_count)} votes` : ""}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function SectionHeader() {
  return (
    <h2 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      <Trophy className="h-3.5 w-3.5 text-amber-400" /> Competition Showcase
    </h2>
  );
}

function MiniStat({ icon, label, value, tint }: { icon: React.ReactNode; label: string; value: string; tint?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className={`mt-0.5 text-sm font-bold ${tint ?? ""}`}>{value}</div>
    </div>
  );
}
