import { Award, Lock } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { BADGES, TIER_COLOR } from "@/lib/achievements";

export function AchievementsPanel() {
  const { state } = useChat();
  const earned = new Set(state.me.badges || []);
  const earnedCount = earned.size;

  return (
    <div>
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Award className="h-5 w-5 text-primary" /> Achievements
      </h1>
      <div className="mt-4 rounded-2xl border border-border bg-background/50 p-4">
        <div className="text-xs text-muted-foreground">Unlocked</div>
        <div className="text-3xl font-bold">
          {earnedCount} <span className="text-sm text-muted-foreground">/ {BADGES.length}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(earnedCount / BADGES.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {BADGES.map((b) => {
          const has = earned.has(b.id);
          return (
            <div
              key={b.id}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${has ? `bg-gradient-to-br ${TIER_COLOR[b.tier]}` : "border-border bg-white/[0.02] text-muted-foreground"}`}
            >
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-2xl ${has ? "bg-black/20" : "bg-white/5"}`}
              >
                {has ? b.emoji : <Lock className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {b.name}
                  <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {b.tier}
                  </span>
                </div>
                <div className="text-xs opacity-80">{b.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
