import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Trophy, Flame } from "lucide-react";
import { useChat } from "@/lib/chat-store";

import { useAuth } from "@/lib/auth-store";
import { Avatar } from "@/components/chat/Avatar";
import { BADGE_MAP } from "@/lib/achievements";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Palrgo" },
      { name: "description", content: "Top members by XP and daily streaks on Palrgo." },
      { property: "og:title", content: "Leaderboard — Palrgo" },
      { property: "og:description", content: "Top members by XP and daily streaks on Palrgo." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { user } = useAuth();
  const { state, adjustPoints } = useChat();
  const [tab, setTab] = useState<"xp" | "streak">("xp");
  if (user?.isGuest) return <GuestBlock label="Leaderboard" />;
  const all = Object.values(state.users).filter(u => !u.isGuest && !u.isBot);
  const ranked = tab === "xp"
    ? [...all].sort((a, b) => b.xp - a.xp).slice(0, 25)
    : [...all].sort((a, b) => (b.streak ?? 0) - (a.streak ?? 0) || (b.longestStreak ?? 0) - (a.longestStreak ?? 0)).slice(0, 25);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/80 px-6 py-3 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to chat
        </Link>
        <h1 className="flex items-center gap-2 text-lg font-semibold"><Trophy className="h-5 w-5 text-warning" /> Leaderboard</h1>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <div className="mb-4 flex gap-1 rounded-full border border-border bg-card p-1">
          <button
            onClick={() => setTab("xp")}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "xp" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"}`}
          >
            <Trophy className="mr-1 inline h-3 w-3" /> Top XP
          </button>
          <button
            onClick={() => setTab("streak")}
            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "streak" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/5"}`}
          >
            <Flame className="mr-1 inline h-3 w-3" /> Top Streaks
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card">
          {ranked.map((u, i) => (
            <div key={u.id} className="flex items-center gap-3 border-b border-border/50 p-3 last:border-b-0 hover:bg-muted/30">
              <div className="w-6 text-center font-bold text-muted-foreground">{i + 1}</div>
              <Avatar user={u} size={36} />
              <div className="min-w-0 flex-1">
                <Link to="/u/$username" params={{ username: u.name }} className="flex items-center gap-1 truncate text-sm font-medium hover:underline">
                  {u.name}
                  {u.isBot && <span className="rounded bg-accent/20 px-1 text-[10px] font-bold uppercase text-accent">Bot</span>}
                  {(u.badges || []).slice(0, 3).map(bid => {
                    const b = BADGE_MAP[bid]; if (!b) return null;
                    return <span key={bid} title={b.name} className="text-xs">{b.emoji}</span>;
                  })}
                </Link>
                <div className="text-xs text-muted-foreground">Lv {u.level} · 🔥 {u.streak ?? 0}</div>
              </div>
              {tab === "xp" ? (
                <div className="font-mono text-sm text-accent">{u.xp} XP</div>
              ) : (
                <div className="font-mono text-sm text-orange-400">{u.streak ?? 0}d</div>
              )}
              <div className="flex gap-1">
                <button onClick={() => adjustPoints(u.id, -10)} className="grid h-6 w-6 place-items-center rounded bg-muted text-xs hover:bg-destructive/30" title="-10 XP">−</button>
                <button onClick={() => adjustPoints(u.id, 10)} className="grid h-6 w-6 place-items-center rounded bg-muted text-xs hover:bg-primary/30" title="+10 XP">+</button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[10px] text-muted-foreground">Adjust points with +/−. Streaks rise by signing in on consecutive days.</p>
      </main>
    </div>
  );
}

function GuestBlock({ label }: { label: string }) {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
      <div className="max-w-sm rounded-3xl border border-border bg-card p-8">
        <div className="text-3xl">👤</div>
        <h1 className="mt-3 text-lg font-bold">{label} isn't available for guests</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create an account to earn XP, badges and appear on the leaderboard.</p>
        <Link to="/" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          <ArrowLeft className="h-4 w-4" /> Back to chat
        </Link>
      </div>
    </div>
  );
}
