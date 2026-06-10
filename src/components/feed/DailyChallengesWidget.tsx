import { useEffect, useId, useMemo, useState } from "react";
import { Trophy, Check, Zap, Flame, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type ChallengeId = "post" | "react5" | "comment3" | "friend" | "login";

interface Challenge {
  id: ChallengeId;
  title: string;
  emoji: string;
  goal: number;
  xp: number;
  reward: string;
}

const POOL: Challenge[] = [
  { id: "post", title: "Create a post", emoji: "✍️", goal: 1, xp: 30, reward: "+30 XP" },
  { id: "react5", title: "React to 5 posts", emoji: "❤️", goal: 5, xp: 20, reward: "+20 XP" },
  { id: "comment3", title: "Comment on 3 posts", emoji: "💬", goal: 3, xp: 25, reward: "+25 XP" },
  { id: "friend", title: "Add a friend", emoji: "🤝", goal: 1, xp: 35, reward: "+35 XP · badge" },
  {
    id: "login",
    title: "Keep your login streak",
    emoji: "🔥",
    goal: 1,
    xp: 15,
    reward: "+15 XP · streak shield",
  },
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayIndex(): number {
  const d = new Date();
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = (d.getTime() - start.getTime()) / 86400000;
  return Math.floor(diff);
}

/** Pick 3 rotating + 1 fixed (login streak) challenges based on day index */
function pickDailyChallenges(): Challenge[] {
  const idx = dayIndex();
  const rotating = POOL.filter((c) => c.id !== "login");
  const out: Challenge[] = [];
  for (let i = 0; i < 3; i++) out.push(rotating[(idx + i) % rotating.length]);
  out.push(POOL.find((c) => c.id === "login")!);
  return out;
}

interface Progress {
  date: string;
  values: Partial<Record<ChallengeId, number>>;
  claimed: Partial<Record<ChallengeId, boolean>>;
}

function emptyProgress(): Progress {
  return { date: todayKey(), values: {}, claimed: {} };
}

function normalizeProgress(value: Partial<Progress> | null | undefined): Progress {
  if (!value || value.date !== todayKey()) return emptyProgress();
  const values = value.values && typeof value.values === "object" ? value.values : {};
  const claimed = value.claimed && typeof value.claimed === "object" ? value.claimed : {};
  return { date: todayKey(), values, claimed };
}

function readProgress(meId: string): Progress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(`dc:${meId}`);
    if (!raw) return emptyProgress();
    return normalizeProgress(JSON.parse(raw) as Partial<Progress>);
  } catch {
    return emptyProgress();
  }
}

function writeProgress(meId: string, p: Progress) {
  try {
    localStorage.setItem(`dc:${meId}`, JSON.stringify(p));
  } catch {
    /* noop */
  }
}

/** Scale challenges by user level: harder goals + bigger XP rewards as you level up. */
function scaleChallenges(base: Challenge[], level: number): Challenge[] {
  const tier = Math.max(1, Math.floor((Math.min(level, 999) - 1) / 5) + 1); // +1 every 5 levels
  return base.map((c) => {
    // Login stays a single daily check-in, but its reward scales.
    const goal = c.id === "login" ? 1 : Math.ceil(c.goal * (1 + (tier - 1) * 0.5));
    const xp = Math.round(c.xp * (1 + (tier - 1) * 0.35));
    const reward = c.reward.replace(/\+\d+\s*XP/, `+${xp} XP`);
    return { ...c, goal, xp, reward };
  });
}

export function DailyChallengesWidget({ meId }: { meId: string }) {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [level, setLevel] = useState<number>(1);
  const challenges = useMemo(() => scaleChallenges(pickDailyChallenges(), level), [level]);
  const [progress, setProgress] = useState<Progress>(() => readProgress(meId));
  const [celebrate, setCelebrate] = useState<ChallengeId | null>(null);
  const [resetIn, setResetIn] = useState<string>("");

  // Load user level (and keep it in sync with profile updates)
  useEffect(() => {
    if (!meId) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("level")
      .eq("id", meId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.level) setLevel(data.level);
      });
    const ch = supabase
      .channel(`dc-lvl-${meId}-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${meId}` },
        (payload) => {
          const lv = (payload.new as { level?: number })?.level;
          if (typeof lv === "number") setLevel(lv);
        },
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [meId, instanceId]);

  // Live countdown to midnight
  useEffect(() => {
    function tick() {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const ms = end.getTime() - now.getTime();
      const h = Math.floor(ms / 3_600_000);
      const m = Math.floor((ms % 3_600_000) / 60_000);
      setResetIn(`${h}h ${m}m`);
    }
    tick();
    const i = setInterval(tick, 60_000);
    return () => clearInterval(i);
  }, []);

  // Sync progress from backend (today only)
  useEffect(() => {
    if (!meId) return;
    let cancelled = false;
    async function load() {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const iso = start.toISOString();

      const [posts, reacts, comments, friends] = await Promise.all([
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", meId)
          .gte("created_at", iso),
        supabase
          .from("reactions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", meId)
          .gte("created_at", iso),
        supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("author_id", meId)
          .gte("created_at", iso),
        supabase
          .from("friendships")
          .select("id", { count: "exact", head: true })
          .eq("status", "accepted")
          .or(`sender_id.eq.${meId},receiver_id.eq.${meId}`)
          .gte("created_at", iso),
      ]);

      if (cancelled) return;
      setProgress((prev) => {
        const next: Progress = { ...prev, date: todayKey(), values: { ...prev.values } };
        next.values.post = posts.count ?? 0;
        next.values.react5 = reacts.count ?? 0;
        next.values.comment3 = comments.count ?? 0;
        next.values.friend = friends.count ?? 0;
        next.values.login = 1; // visiting today completes it
        writeProgress(meId, next);
        return next;
      });
    }
    load();
    const ch = supabase
      .channel(`dc-${meId}-${instanceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts", filter: `author_id=eq.${meId}` },
        load,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reactions", filter: `user_id=eq.${meId}` },
        load,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `author_id=eq.${meId}` },
        load,
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, load)
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [meId, instanceId]);

  // Trigger celebration when a challenge crosses completion (unclaimed)
  useEffect(() => {
    for (const c of challenges) {
      const v = progress.values[c.id] ?? 0;
      if (v >= c.goal && !progress.claimed[c.id]) {
        setCelebrate(c.id);
        const next: Progress = { ...progress, claimed: { ...progress.claimed, [c.id]: true } };
        writeProgress(meId, next);
        setProgress(next);
        setTimeout(() => setCelebrate((s) => (s === c.id ? null : s)), 1800);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.values, challenges, meId]);

  const completed = challenges.filter((c) => (progress.values[c.id] ?? 0) >= c.goal).length;
  const totalXp = challenges
    .filter((c) => (progress.values[c.id] ?? 0) >= c.goal)
    .reduce((s, c) => s + c.xp, 0);
  const overallPct = Math.round((completed / challenges.length) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-950 via-rose-950 to-slate-950 p-[1px] shadow-[0_20px_60px_-15px_rgba(244,114,182,0.45)]">
      {/* glow orbs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-400/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-rose-500/25 blur-3xl" />

      <div className="relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-950/90 via-rose-950/70 to-slate-950/90 p-4 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-fuchsia-500 shadow-lg shadow-rose-500/40">
              <Trophy className="h-4 w-4 text-white" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-300 ring-2 ring-slate-950 animate-pulse" />
            </div>
            <div>
              <h3 className="flex items-center gap-1.5 text-sm font-extrabold tracking-tight text-white">
                Daily Challenges
                <span className="rounded-full bg-gradient-to-r from-amber-400/30 to-rose-400/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 ring-1 ring-amber-300/30">Lv {level}</span>
              </h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-rose-300/80">Resets in {resetIn}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/20 to-yellow-400/20 px-2.5 py-1 text-[11px] font-extrabold text-amber-200 ring-1 ring-amber-400/30">
            <Zap className="h-3 w-3" /> {totalXp}
          </span>
        </div>

        {/* Summary */}
        <div className="mt-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur">
          <div className="mb-2 flex items-center justify-between text-[11px]">
            <span className="font-bold text-white/90">
              <span className="text-base font-extrabold text-white">{completed}</span>
              <span className="text-white/60"> / {challenges.length} complete</span>
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-300">
              <Sparkles className="h-3 w-3" /> {overallPct}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500 shadow-[0_0_10px_rgba(244,114,182,0.6)] transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* List */}
        <ul className="mt-3 space-y-2">
          {challenges.map((c) => {
            const v = Math.min(progress.values[c.id] ?? 0, c.goal);
            const isDone = v >= c.goal;
            const pct = Math.round((v / c.goal) * 100);
            return (
              <li
                key={c.id}
                className={`group relative overflow-hidden rounded-2xl p-3 ring-1 transition-all ${
                  isDone
                    ? "bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent ring-emerald-400/30"
                    : "bg-white/5 ring-white/10 hover:bg-white/[0.07] hover:ring-white/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl shadow-inner ${
                    isDone
                      ? "bg-emerald-500/20 ring-1 ring-emerald-400/30"
                      : "bg-gradient-to-br from-amber-400/15 to-rose-500/15 ring-1 ring-white/10"
                  }`}>
                    <span>{c.emoji}</span>
                    {isDone && (
                      <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 ring-2 ring-slate-950">
                        <Check className="h-2.5 w-2.5 text-slate-900" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`truncate text-sm font-bold ${isDone ? "text-white/70" : "text-white"}`}>
                        {c.title}
                      </p>
                      {isDone ? (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                          <Check className="h-2.5 w-2.5" /> Done
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] font-semibold text-white/50">
                          {v}/{c.goal}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDone
                              ? "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                              : "bg-gradient-to-r from-amber-400 to-rose-400"
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                        />
                      </div>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300/90">
                        <Zap className="h-2.5 w-2.5" /> {c.reward}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Streak hint */}
        <div className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-[10px] font-semibold text-white/70 ring-1 ring-white/10">
          <Flame className="h-3 w-3 text-orange-400" />
          Complete all for a streak bonus
        </div>

        {/* Completion animation */}
        {celebrate && (
          <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative flex flex-col items-center gap-1 rounded-3xl border border-amber-300/40 bg-gradient-to-br from-amber-500/20 via-rose-500/20 to-fuchsia-500/20 px-6 py-5 shadow-[0_0_40px_rgba(251,191,36,0.5)] animate-in zoom-in-95 duration-300">
              <Sparkles className="h-8 w-8 text-amber-300 animate-pulse drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
              <p className="text-base font-extrabold text-white">Challenge complete!</p>
              <p className="text-[11px] font-bold text-amber-200">
                +{challenges.find((c) => c.id === celebrate)?.xp ?? 0} XP earned
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
