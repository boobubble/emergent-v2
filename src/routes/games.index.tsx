import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Trophy,
  Sparkles,
  Play,
  History,
  Target,
  Award,
  BarChart3,
  Flame,
  Gamepad2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { listGames, listFeatured, getGame, type HubGame } from "@/lib/games-hub-registry";
import { getRecent, getContinuePlaying, type RecentEntry } from "@/lib/games-hub-tracking";

export const Route = createFileRoute("/games/")({
  head: () => ({
    meta: [
      { title: "Games Hub — Play, earn XP, unlock achievements" },
      { name: "description", content: "Featured games, daily challenges, achievements and leaderboards, all in one place." },
      { property: "og:title", content: "Games Hub" },
      { property: "og:description", content: "Featured games, daily challenges, achievements and leaderboards." },
    ],
  }),
  component: GamesHub,
});

interface AchievementRow {
  achievement_id: string;
  unlocked_at: string;
  gam_achievements: { title: string | null; icon: string | null; rarity: string | null } | null;
}
interface DailyMission { id: string; title: string; description: string | null; reward_xp: number | null; reward_coins: number | null; }
interface LeaderRow { user_id: string; total: number; profile: { username: string | null; avatar_url: string | null; avatar_color: string | null } | null; }

function GamesHub() {
  const { user } = useAuth();

  if (!user || user.isGuest) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div className="max-w-sm">
          <Gamepad2 className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h1 className="text-xl font-bold">Sign in to enter the Games Hub</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track progress, unlock achievements, and climb the leaderboard.
          </p>
          <Link to="/" className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            Back
          </Link>
        </div>
      </div>
    );
  }

  return <HubInner userId={user.id} />;
}

function HubInner({ userId }: { userId: string }) {
  const games = useMemo(() => listGames(), []);
  const featured = useMemo(() => listFeatured(), []);
  const [recent, setRecent] = useState<RecentEntry[]>([]);
  const [continueList, setContinueList] = useState<RecentEntry[]>([]);
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);
  const [stats, setStats] = useState<{ sessions: number; saves: number; achievements: number; totalXp: number } | null>(null);
  const [challenges, setChallenges] = useState<DailyMission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRecent(getRecent());
    setContinueList(getContinuePlaying());
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [achRes, savesRes, xpRes, sessionRes, missionsRes, boardRes] = await Promise.all([
        supabase
          .from("gam_user_achievements")
          .select("achievement_id, unlocked_at, gam_achievements(title, icon, rarity)")
          .eq("user_id", userId)
          .order("unlocked_at", { ascending: false })
          .limit(12),
        supabase.from("game_saves").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase
          .from("gam_event_log")
          .select("payload")
          .eq("user_id", userId)
          .eq("event_type", "game.xp"),
        supabase
          .from("gam_event_log")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .in("event_type", ["game.started", "game.finished"]),
        supabase
          .from("daily_missions")
          .select("id, title, description, reward_xp, reward_coins")
          .limit(4),
        supabase
          .from("gam_event_log")
          .select("user_id, payload")
          .eq("event_type", "game.score")
          .gte("created_at", since)
          .limit(500),
      ]);

      if (cancelled) return;

      setAchievements((achRes.data ?? []) as never);

      const totalXp = (xpRes.data ?? []).reduce((sum: number, row: { payload: unknown }) => {
        const p = row.payload as { amount?: number } | null;
        return sum + (typeof p?.amount === "number" ? p.amount : 0);
      }, 0);

      setStats({
        sessions: sessionRes.count ?? 0,
        saves: savesRes.count ?? 0,
        achievements: achRes.data?.length ?? 0,
        totalXp,
      });

      setChallenges((missionsRes.data ?? []) as never);

      // Aggregate scores per user for the leaderboard
      const byUser = new Map<string, number>();
      for (const row of (boardRes.data ?? []) as { user_id: string; payload: unknown }[]) {
        const p = row.payload as { score?: number } | null;
        const score = typeof p?.score === "number" ? p.score : 0;
        byUser.set(row.user_id, Math.max(byUser.get(row.user_id) ?? 0, score));
      }
      const topIds = Array.from(byUser.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
      let profiles: Record<string, LeaderRow["profile"]> = {};
      if (topIds.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, username, avatar_url, avatar_color")
          .in("id", topIds.map(([id]) => id));
        profiles = Object.fromEntries((profs ?? []).map((p: { id: string; username: string | null; avatar_url: string | null; avatar_color: string | null }) => [p.id, { username: p.username, avatar_url: p.avatar_url, avatar_color: p.avatar_color }]));
      }
      setLeaderboard(topIds.map(([id, total]) => ({ user_id: id, total, profile: profiles[id] ?? null })));

      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="rounded-full p-2 hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">Games Hub</h1>
            <p className="text-xs text-muted-foreground">Featured games · Achievements · Leaderboards</p>
          </div>
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-4 pt-6">
        {/* Featured Games */}
        {featured.length > 0 && (
          <Section icon={<Sparkles className="h-4 w-4 text-primary" />} title="Featured Games">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((g) => <FeaturedCard key={g.id} game={g} large />)}
            </div>
          </Section>
        )}

        {/* Continue Playing */}
        {continueList.length > 0 && (
          <Section icon={<Play className="h-4 w-4 text-emerald-400" />} title="Continue Playing">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {continueList.map((e) => {
                const g = getGame(e.gameId);
                if (!g) return null;
                return <FeaturedCard key={g.id} game={g} subtitle="Resume your session" />;
              })}
            </div>
          </Section>
        )}

        {/* Recently Played */}
        {recent.length > 0 && (
          <Section icon={<History className="h-4 w-4 text-sky-400" />} title="Recently Played">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recent.map((e) => {
                const g = getGame(e.gameId);
                if (!g) return null;
                return (
                  <Link
                    key={g.id}
                    to={g.entryPoint}
                    className="group flex min-w-[180px] flex-col rounded-xl border border-border bg-card p-3 hover:border-primary"
                  >
                    <MiniBanner game={g} />
                    <div className="mt-2 text-sm font-bold">{g.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(e.lastPlayedAt).toLocaleDateString()}</div>
                  </Link>
                );
              })}
            </div>
          </Section>
        )}

        {/* All Games (auto-rendered from registry) */}
        <Section icon={<Gamepad2 className="h-4 w-4 text-primary" />} title="All Games">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((g) => <FeaturedCard key={g.id} game={g} />)}
          </div>
        </Section>

        {/* Statistics + Achievements */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Section icon={<BarChart3 className="h-4 w-4 text-primary" />} title="My Statistics">
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Sessions" value={stats?.sessions ?? 0} loading={loading} />
              <StatTile label="Cloud Saves" value={stats?.saves ?? 0} loading={loading} />
              <StatTile label="Achievements" value={stats?.achievements ?? 0} loading={loading} />
              <StatTile label="Total XP" value={stats?.totalXp ?? 0} loading={loading} suffix=" XP" />
            </div>
          </Section>

          <Section icon={<Award className="h-4 w-4 text-amber-400" />} title="Achievements">
            <div className="rounded-2xl border border-border bg-card p-3">
              {loading && <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>}
              {!loading && achievements.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No achievements yet — play a game to start collecting.
                </div>
              )}
              <div className="space-y-1">
                {achievements.slice(0, 6).map((a) => (
                  <div key={a.achievement_id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-400">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{a.gam_achievements?.title ?? a.achievement_id}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.gam_achievements?.rarity ?? "common"} · {new Date(a.unlocked_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* Daily Challenges + Leaderboards */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Section icon={<Flame className="h-4 w-4 text-rose-400" />} title="Daily Challenges">
            <div className="space-y-2">
              {loading && <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">Loading…</div>}
              {!loading && challenges.length === 0 && (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  No active challenges today.
                </div>
              )}
              {challenges.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-rose-500/15 text-rose-400">
                    <Target className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">{c.title}</div>
                    {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                  </div>
                  <div className="text-right text-xs font-bold text-primary">
                    {c.reward_xp ? `+${c.reward_xp} XP` : ""}
                    {c.reward_coins ? <div className="text-amber-400">+{c.reward_coins} 🪙</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section icon={<Trophy className="h-4 w-4 text-amber-500" />} title="Leaderboards · 7d">
            <div className="space-y-1 rounded-2xl border border-border bg-card p-2">
              {loading && <div className="py-6 text-center text-sm text-muted-foreground">Loading…</div>}
              {!loading && leaderboard.length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">No scores this week yet.</div>
              )}
              {leaderboard.map((r, i) => (
                <div key={r.user_id} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5">
                  <div className="w-6 text-center text-sm font-bold text-muted-foreground">{i + 1}</div>
                  <div
                    className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ background: r.profile?.avatar_color || "#666" }}
                  >
                    {r.profile?.avatar_url
                      ? <img src={r.profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                      : (r.profile?.username?.[0]?.toUpperCase() ?? "?")}
                  </div>
                  <div className="flex-1 text-sm font-medium">{r.profile?.username || "Player"}</div>
                  <div className="text-sm font-bold text-primary">{r.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function MiniBanner({ game }: { game: HubGame }) {
  const Icon = game.icon;
  if (game.banner) {
    return <img src={game.banner} alt="" className="h-20 w-full rounded-lg object-cover" />;
  }
  return (
    <div className={`grid h-20 w-full place-items-center rounded-lg bg-gradient-to-br ${game.accent ?? "from-primary/60 to-primary/20"}`}>
      <Icon className="h-8 w-8 text-white/90" />
    </div>
  );
}

function FeaturedCard({ game, large, subtitle }: { game: HubGame; large?: boolean; subtitle?: string }) {
  const Icon = game.icon;
  return (
    <Link
      to={game.entryPoint}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
    >
      <div className={`relative ${large ? "h-32" : "h-24"} w-full overflow-hidden`}>
        {game.banner ? (
          <img src={game.banner} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${game.accent ?? "from-primary/60 to-primary/20"}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute bottom-2 left-3 flex items-center gap-2 text-white">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 backdrop-blur">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-sm font-bold drop-shadow">{game.name}</div>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-xs text-muted-foreground">{subtitle ?? game.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-wider">
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">{game.category}</span>
          {game.supportsCloudSave && <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-400">Cloud save</span>}
          {game.supportsAchievements && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-400">Achievements</span>}
          {game.supportsLeaderboards && <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-400">Leaderboards</span>}
        </div>
      </div>
    </Link>
  );
}

function StatTile({ label, value, loading, suffix }: { label: string; value: number; loading: boolean; suffix?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-bold">
        {loading ? "…" : value.toLocaleString()}{!loading && suffix ? suffix : ""}
      </div>
    </div>
  );
}
