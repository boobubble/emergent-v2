import { useEffect, useMemo, useState } from "react";
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
  { id: "post",     title: "Create a post",        emoji: "✍️", goal: 1, xp: 30, reward: "+30 XP" },
  { id: "react5",   title: "React to 5 posts",     emoji: "❤️", goal: 5, xp: 20, reward: "+20 XP" },
  { id: "comment3", title: "Comment on 3 posts",   emoji: "💬", goal: 3, xp: 25, reward: "+25 XP" },
  { id: "friend",   title: "Add a friend",         emoji: "🤝", goal: 1, xp: 35, reward: "+35 XP · badge" },
  { id: "login",    title: "Keep your login streak", emoji: "🔥", goal: 1, xp: 15, reward: "+15 XP · streak shield" },
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

function readProgress(meId: string): Progress {
  if (typeof window === "undefined") return { date: todayKey(), values: {}, claimed: {} };
  try {
    const raw = localStorage.getItem(`dc:${meId}`);
    if (!raw) return { date: todayKey(), values: {}, claimed: {} };
    const p = JSON.parse(raw) as Progress;
    if (p.date !== todayKey()) return { date: todayKey(), values: {}, claimed: {} };
    return p;
  } catch {
    return { date: todayKey(), values: {}, claimed: {} };
  }
}

function writeProgress(meId: string, p: Progress) {
  try { localStorage.setItem(`dc:${meId}`, JSON.stringify(p)); } catch { /* noop */ }
}

export function DailyChallengesWidget({ meId }: { meId: string }) {
  const challenges = useMemo(pickDailyChallenges, []);
  const [progress, setProgress] = useState<Progress>(() => readProgress(meId));
  const [celebrate, setCelebrate] = useState<ChallengeId | null>(null);
  const [resetIn, setResetIn] = useState<string>("");

  // Live countdown to midnight
  useEffect(() => {
    function tick() {
      const now = new Date();
      const end = new Date(now); end.setHours(24, 0, 0, 0);
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
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const iso = start.toISOString();

      const [posts, reacts, comments, friends] = await Promise.all([
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", meId).gte("created_at", iso),
        supabase.from("reactions").select("id", { count: "exact", head: true }).eq("user_id", meId).gte("created_at", iso),
        supabase.from("comments").select("id", { count: "exact", head: true }).eq("author_id", meId).gte("created_at", iso),
        supabase.from("friendships").select("id", { count: "exact", head: true }).eq("status", "accepted").or(`sender_id.eq.${meId},receiver_id.eq.${meId}`).gte("updated_at", iso),
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
      .channel(`dc-${meId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "posts", filter: `author_id=eq.${meId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions", filter: `user_id=eq.${meId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `author_id=eq.${meId}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "friendships" }, load)
      .subscribe();
    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, [meId]);

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
  const totalXp = challenges.filter((c) => (progress.values[c.id] ?? 0) >= c.goal).reduce((s, c) => s + c.xp, 0);
  const overallPct = Math.round((completed / challenges.length) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-yellow-500" /> Daily Challenges
        </h3>
        <span className="text-[10px] font-medium text-muted-foreground">Resets in {resetIn}</span>
      </div>

      {/* Summary */}
      <div className="mt-2 flex items-center gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">{completed}</span>
          <span className="text-xs text-muted-foreground">/ {challenges.length}</span>
        </div>
        <div className="flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-yellow-500 transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
        <span className="inline-flex items-center gap-0.5 rounded-full bg-yellow-500/15 px-2 py-0.5 text-[11px] font-bold text-yellow-600 dark:text-yellow-400">
          <Zap className="h-3 w-3" /> {totalXp}
        </span>
      </div>

      {/* List */}
      <ul className="mt-3 space-y-2">
        {challenges.map((c) => {
          const v = Math.min(progress.values[c.id] ?? 0, c.goal);
          const done = v >= c.goal;
          const pct = Math.round((v / c.goal) * 100);
          return (
            <li
              key={c.id}
              className={`group rounded-2xl border p-2.5 transition-all ${
                done
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-background/50 hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none">{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`truncate text-[13px] font-medium ${done ? "text-foreground" : "text-foreground/90"}`}>
                      {c.title}
                    </p>
                    {done ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        <Check className="h-2.5 w-2.5" /> Done
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground">{v}/{c.goal}</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-accent">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${done ? "bg-primary" : "bg-primary/70"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground">{c.reward}</span>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Streak hint */}
      <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
        <Flame className="h-3 w-3 text-orange-500" />
        Complete all to earn a streak bonus
      </div>

      {/* Completion animation */}
      {celebrate && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-background/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-1 rounded-2xl bg-card px-5 py-4 shadow-lg border border-primary/30 animate-in zoom-in-95 duration-300">
            <Sparkles className="h-7 w-7 text-yellow-500 animate-pulse" />
            <p className="text-sm font-bold">Challenge complete!</p>
            <p className="text-[11px] text-muted-foreground">
              +{challenges.find((c) => c.id === celebrate)?.xp ?? 0} XP earned
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
