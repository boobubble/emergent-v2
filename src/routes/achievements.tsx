import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Lock, ArrowLeft } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { BADGES, TIER_COLOR } from "@/lib/achievements";

export const Route = createFileRoute("/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements" },
      { name: "description", content: "Track your unlocked badges and progress across Palrgo achievements." },
      { property: "og:title", content: "Achievements" },
      { property: "og:description", content: "Track your unlocked badges and progress across Palrgo achievements." },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { user } = useAuth();
  const { state } = useChat();
  if (user?.isGuest) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center text-foreground">
        <div className="max-w-sm rounded-3xl border border-border bg-card p-8">
          <div className="text-3xl">👤</div>
          <h1 className="mt-3 text-lg font-bold">Achievements aren't available for guests</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create an account to unlock badges and track progress.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <ArrowLeft className="h-4 w-4" /> Back to chat
          </Link>
        </div>
      </div>
    );
  }
  const earned = new Set(state.me.badges || []);
  const earnedCount = earned.size;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to chat
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Award className="h-6 w-6 text-primary" /> Achievements
        </h1>
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="text-xs text-muted-foreground">Unlocked</div>
          <div className="text-3xl font-bold">
            {earnedCount} <span className="text-sm text-muted-foreground">/ {BADGES.length}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${(earnedCount / BADGES.length) * 100}%` }} />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {BADGES.map(b => {
            const has = earned.has(b.id);
            return (
              <div
                key={b.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${has ? `bg-gradient-to-br ${TIER_COLOR[b.tier]}` : "border-border bg-white/[0.02] text-muted-foreground"}`}
              >
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-2xl ${has ? "bg-black/20" : "bg-white/5"}`}>
                  {has ? b.emoji : <Lock className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {b.name}
                    <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">{b.tier}</span>
                  </div>
                  <div className="text-xs opacity-80">{b.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
