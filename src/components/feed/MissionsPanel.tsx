import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Coins, Sparkles, Trophy } from "lucide-react";
import { getTodayMissions, claimMission } from "@/lib/missions.functions";
import { getMyCreatorRank } from "@/lib/creator.functions";
import { creatorRankFor } from "@/lib/economy-config";

type Mission = {
  id: string;
  title: string;
  description: string;
  target: number;
  coins: number;
  xp: number;
  icon: string;
  progress: number;
  completed: boolean;
  claimed: boolean;
};

export function MissionsPanel() {
  const fetchMissions = useServerFn(getTodayMissions);
  const claim = useServerFn(claimMission);
  const fetchRank = useServerFn(getMyCreatorRank);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [rank, setRank] = useState<{ score: number; title: string; chip: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  async function load() {
    try {
      const [m, r] = await Promise.all([fetchMissions(), fetchRank()]);
      setMissions(m.missions);
      setRank({ score: r.score, title: r.rank.title, chip: r.rank.chip });
    } catch (e) {
      console.error("missions load failed", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  async function onClaim(id: string) {
    setClaiming(id);
    try {
      await claim({ data: { missionId: id } });
      await load();
    } catch (e) {
      console.error("claim failed", e);
    } finally {
      setClaiming(null);
    }
  }

  const nextRank = rank ? (() => {
    const cur = creatorRankFor(rank.score);
    const idx = ["Newcomer","Rising Creator","Trending Creator","Viral Creator","Elite Poster","Legendary"].indexOf(cur.title);
    return idx >= 0 && idx < 5 ? null : null;
  })() : null;

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" /> Daily Missions
        </h3>
        {rank && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${rank.chip}`}>
            <Trophy className="h-3 w-3" /> {rank.title}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : (
        <ul className="space-y-2">
          {missions.map((m) => {
            const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
            return (
              <li key={m.id} className="rounded-2xl bg-accent/40 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg leading-none">{m.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{m.title}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{m.description}</div>
                  </div>
                  {m.claimed ? (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">Claimed</span>
                  ) : m.completed ? (
                    <button
                      onClick={() => onClaim(m.id)}
                      disabled={claiming === m.id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      {claiming === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Coins className="h-3 w-3" />}
                      +{m.coins}
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-muted-foreground">{m.progress}/{m.target}</span>
                  )}
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background">
                  <div
                    className={`h-full transition-all ${m.completed ? "bg-emerald-500" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
