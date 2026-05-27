import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trophy, Flame, Coins } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "@/components/chat/Avatar";
import { BADGE_MAP } from "@/lib/achievements";
import { rankFor } from "@/lib/ranks";

export function LeaderboardPanel() {
  const { state } = useChat();
  const [tab, setTab] = useState<"xp" | "streak" | "coins">("xp");
  const all = Object.values(state.users).filter((u) => !u.isGuest && !u.isBot);
  const ranked =
    tab === "xp"
      ? [...all].sort((a, b) => b.xp - a.xp).slice(0, 25)
      : tab === "coins"
        ? [...all].sort((a, b) => (b.coins ?? 0) - (a.coins ?? 0)).slice(0, 25)
        : [...all]
            .sort(
              (a, b) =>
                (b.streak ?? 0) - (a.streak ?? 0) ||
                (b.longestStreak ?? 0) - (a.longestStreak ?? 0),
            )
            .slice(0, 25);

  return (
    <div>
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Trophy className="h-5 w-5 text-yellow-500" /> Leaderboard
      </h1>

      <div className="mt-4 mb-3 flex gap-1 rounded-full border border-border bg-background/50 p-1">
        <button
          onClick={() => setTab("xp")}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "xp" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
        >
          <Trophy className="mr-1 inline h-3 w-3" /> Top XP
        </button>
        <button
          onClick={() => setTab("streak")}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold ${tab === "streak" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
        >
          <Flame className="mr-1 inline h-3 w-3" /> Top Streaks
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-background/50">
        {ranked.map((u, i) => (
          <div
            key={u.id}
            className="flex items-center gap-3 border-b border-border/50 p-3 last:border-b-0 hover:bg-muted/30"
          >
            <div className="w-6 text-center font-bold text-muted-foreground">{i + 1}</div>
            <Avatar user={u} size={36} />
            <div className="min-w-0 flex-1">
              <Link
                to="/u/$username"
                params={{ username: u.name }}
                className="flex items-center gap-1 truncate text-sm font-medium hover:underline"
              >
                {u.name}
                {(u.badges || []).slice(0, 3).map((bid) => {
                  const b = BADGE_MAP[bid];
                  if (!b) return null;
                  return (
                    <span key={bid} title={b.name} className="text-xs">
                      {b.emoji}
                    </span>
                  );
                })}
              </Link>
              <div className="text-xs text-muted-foreground">
                Lv {u.level} · 🔥 {u.streak ?? 0}
              </div>
            </div>
            {tab === "xp" ? (
              <div className="font-mono text-sm text-primary">{u.xp} XP</div>
            ) : (
              <div className="font-mono text-sm text-orange-400">{u.streak ?? 0}d</div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        Streaks rise by signing in on consecutive days.
      </p>
    </div>
  );
}
