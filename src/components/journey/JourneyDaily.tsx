import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Coins, Sparkles, Check, Gift, Flame, Trophy, Target, Zap, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTodayMissions, claimMission } from "@/lib/missions.functions";
import { getTodayChallenges, claimChallenge } from "@/lib/daily-challenges.functions";

type MissionItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  progress: number;
  xp: number;
  coins: number;
  completed: boolean;
  claimed: boolean;
};

type ChallengeItem = {
  id: "post" | "react5" | "comment3" | "friend" | "login";
  title: string;
  description: string;
  howTo: string[];
  emoji: string;
  goal: number;
  progress: number;
  xp: number;
  coins: number;
  completed: boolean;
  claimed: boolean;
};

type Selected =
  | { kind: "mission"; item: MissionItem }
  | { kind: "challenge"; item: ChallengeItem };

const HOW_TO_FOR_MISSION: Record<string, string[]> = {
  react_5: ["Open the Feed", "Tap ❤ on 5 different posts"],
  comment_3: ["Open any Feed post", "Leave a comment on 3 different posts"],
  chat_10: ["Open a chat room or DM", "Send 10 messages today"],
  post_1: ["Open the composer at the top of the Feed", "Publish 1 post"],
  engage_15: [
    "Publish or revive a post today",
    "Others react to or comment on it",
    "Reach 15 total engagements across your posts",
  ],
};

export function JourneyDaily({ meId }: { meId: string }) {
  const fetchMissions = useServerFn(getTodayMissions);
  const claimMissionFn = useServerFn(claimMission);
  const fetchChallenges = useServerFn(getTodayChallenges);
  const claimChallengeFn = useServerFn(claimChallenge);

  const [missions, setMissions] = useState<MissionItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Selected | null>(null);

  const load = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([fetchMissions(), fetchChallenges()]);
      setMissions(m.missions as MissionItem[]);
      setChallenges(c.challenges as ChallengeItem[]);
      setStreak(c.streak ?? 0);
      setLongestStreak(c.longestStreak ?? 0);
    } catch (e) {
      console.error("journey daily load failed", e);
    } finally {
      setLoading(false);
    }
  }, [fetchMissions, fetchChallenges]);

  useEffect(() => { void load(); }, [load, meId]);

  // Keep the selected item in sync with fresh data
  useEffect(() => {
    if (!selected) return;
    if (selected.kind === "mission") {
      const fresh = missions.find((m) => m.id === selected.item.id);
      if (fresh && fresh !== selected.item) setSelected({ kind: "mission", item: fresh });
    } else {
      const fresh = challenges.find((c) => c.id === selected.item.id);
      if (fresh && fresh !== selected.item) setSelected({ kind: "challenge", item: fresh });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missions, challenges]);

  async function onClaimMission(id: string) {
    const target = missions.find((m) => m.id === id);
    if (!target || target.claimed || !target.completed) return;
    setClaimingId(id);
    setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, claimed: true } : m)));
    try {
      const res = await claimMissionFn({ data: { missionId: id } });
      toast.success(`+${res.xp} XP · +${res.coins} coins`);
      void load();
    } catch (e) {
      setMissions((prev) => prev.map((m) => (m.id === id ? { ...m, claimed: false } : m)));
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaimingId(null);
    }
  }

  async function onClaimChallenge(id: ChallengeItem["id"]) {
    const target = challenges.find((c) => c.id === id);
    if (!target || target.claimed || !target.completed) return;
    setClaimingId(id);
    setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, claimed: true } : c)));
    try {
      const res = await claimChallengeFn({ data: { challengeId: id } });
      toast.success(`+${res.xp} XP · +${res.coins} coins`);
      void load();
    } catch (e) {
      setChallenges((prev) => prev.map((c) => (c.id === id ? { ...c, claimed: false } : c)));
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaimingId(null);
    }
  }

  const missionDone = missions.filter((m) => m.claimed).length;
  const challengeDone = challenges.filter((c) => c.completed).length;
  const totalXpAvailable = useMemo(
    () =>
      missions.filter((m) => !m.claimed).reduce((s, m) => s + m.xp, 0) +
      challenges.filter((c) => !c.claimed).reduce((s, c) => s + c.xp, 0),
    [missions, challenges],
  );

  if (loading) {
    return (
      <div className="flex justify-center rounded-3xl border border-border bg-background/50 py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      {/* Summary strip */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StripStat icon={<Target className="h-3.5 w-3.5" />} label="Missions" value={`${missionDone}/${missions.length}`} tone="from-indigo-500/20 to-fuchsia-500/10" />
        <StripStat icon={<Trophy className="h-3.5 w-3.5" />} label="Challenges" value={`${challengeDone}/${challenges.length}`} tone="from-amber-500/20 to-rose-500/10" />
        <StripStat icon={<Flame className="h-3.5 w-3.5" />} label="Streak" value={`${streak}d${longestStreak > streak ? ` · best ${longestStreak}` : ""}`} tone="from-orange-500/20 to-red-500/10" />
        <StripStat icon={<Zap className="h-3.5 w-3.5" />} label="XP up for grabs" value={`+${totalXpAvailable}`} tone="from-amber-500/20 to-yellow-500/10" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {/* Missions column */}
        <Column
          title="Daily Missions"
          subtitle="Resets every 24h"
          accent="from-indigo-500/25 via-fuchsia-500/15 to-transparent"
          badgeIcon={<Sparkles className="h-3.5 w-3.5" />}
        >
          <ul className="space-y-2">
            {missions.map((m) => (
              <ItemCard
                key={m.id}
                icon={m.icon}
                title={m.title}
                subtitle={m.description}
                progress={m.progress}
                goal={m.target}
                xp={m.xp}
                coins={m.coins}
                completed={m.completed}
                claimed={m.claimed}
                claiming={claimingId === m.id}
                onOpen={() => setSelected({ kind: "mission", item: m })}
                onClaim={() => onClaimMission(m.id)}
              />
            ))}
          </ul>
        </Column>

        {/* Challenges column */}
        <Column
          title="Daily Challenges"
          subtitle="Scale with your level"
          accent="from-amber-500/25 via-rose-500/15 to-transparent"
          badgeIcon={<Trophy className="h-3.5 w-3.5" />}
        >
          <ul className="space-y-2">
            {challenges.map((c) => (
              <ItemCard
                key={c.id}
                icon={c.emoji}
                title={c.title}
                subtitle={c.description}
                progress={c.progress}
                goal={c.goal}
                xp={c.xp}
                coins={c.coins}
                completed={c.completed}
                claimed={c.claimed}
                claiming={claimingId === c.id}
                onOpen={() => setSelected({ kind: "challenge", item: c })}
                onClaim={() => onClaimChallenge(c.id)}
              />
            ))}
          </ul>
        </Column>
      </div>

      {/* Detail modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          {selected && (
            <DetailModal
              selection={selected}
              claiming={claimingId === selected.item.id}
              onClaim={() => {
                if (selected.kind === "mission") void onClaimMission(selected.item.id);
                else void onClaimChallenge(selected.item.id);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StripStat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${tone} p-2.5`}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}

function Column({ title, subtitle, accent, badgeIcon, children }: { title: string; subtitle: string; accent: string; badgeIcon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br ${accent} p-4`}>
      <div className="mb-3 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-background/70 text-primary shadow-sm">{badgeIcon}</div>
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function ItemCard({
  icon, title, subtitle, progress, goal, xp, coins, completed, claimed, claiming, onOpen, onClaim,
}: {
  icon: string;
  title: string;
  subtitle: string;
  progress: number;
  goal: number;
  xp: number;
  coins: number;
  completed: boolean;
  claimed: boolean;
  claiming: boolean;
  onOpen: () => void;
  onClaim: () => void;
}) {
  const pct = Math.min(100, Math.round((progress / Math.max(goal, 1)) * 100));
  const ready = completed && !claimed;
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
          claimed
            ? "border-emerald-500/30 bg-emerald-500/5"
            : ready
              ? "border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-fuchsia-500/10 to-transparent shadow-sm hover:shadow-md"
              : "border-border bg-background/50 hover:bg-accent/40"
        }`}
      >
        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl ${claimed ? "bg-emerald-500/15" : ready ? "bg-amber-500/20" : "bg-muted"}`}>
          <span className={claimed ? "opacity-60 grayscale" : ""}>{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className={`truncate text-sm font-bold ${claimed ? "text-muted-foreground line-through" : ""}`}>{title}</div>
            {claimed ? (
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                <Check className="h-3 w-3" /> Claimed
              </span>
            ) : ready ? (
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                <Gift className="h-3 w-3" /> Ready
              </span>
            ) : (
              <span className="ml-auto shrink-0 text-[10px] font-semibold text-muted-foreground">
                {progress}/{goal}
              </span>
            )}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{subtitle}</div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted/60">
            <div
              className={`h-full transition-all duration-500 ${
                claimed
                  ? "bg-emerald-500/60"
                  : ready
                    ? "bg-gradient-to-r from-amber-400 to-fuchsia-500"
                    : "bg-primary/70"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[10px] font-semibold text-muted-foreground">
            <span className="inline-flex items-center gap-0.5 text-amber-500"><Zap className="h-3 w-3" /> +{xp} XP</span>
            <span className="inline-flex items-center gap-0.5 text-amber-500"><Coins className="h-3 w-3" /> +{coins}</span>
            <span className="ml-auto inline-flex items-center gap-0.5 text-primary opacity-0 transition-opacity group-hover:opacity-100">
              Details <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </button>
      {ready && (
        <div className="mt-1.5 flex justify-end">
          <button
            type="button"
            onClick={onClaim}
            disabled={claiming}
            className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 px-3 py-1 text-[11px] font-extrabold text-white shadow hover:brightness-110 disabled:opacity-60"
          >
            {claiming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Gift className="h-3 w-3" />}
            Claim +{xp} XP
          </button>
        </div>
      )}
    </li>
  );
}

function DetailModal({ selection, claiming, onClaim }: { selection: Selected; claiming: boolean; onClaim: () => void }) {
  const item = selection.item;
  const goal = selection.kind === "mission" ? (item as MissionItem).target : (item as ChallengeItem).goal;
  const emoji = selection.kind === "mission" ? (item as MissionItem).icon : (item as ChallengeItem).emoji;
  const howTo =
    selection.kind === "challenge"
      ? (item as ChallengeItem).howTo
      : HOW_TO_FOR_MISSION[item.id] ?? ["Complete this action across the platform.", "Progress updates automatically."];
  const pct = Math.min(100, Math.round((item.progress / Math.max(goal, 1)) * 100));
  const ready = item.completed && !item.claimed;

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400/30 to-fuchsia-500/30 text-2xl">{emoji}</div>
          <div className="min-w-0">
            <DialogTitle className="text-base">{item.title}</DialogTitle>
            <DialogDescription className="text-xs">
              {selection.kind === "mission" ? "Daily mission" : "Daily challenge"} · resets at midnight UTC
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        <p className="text-sm text-muted-foreground">{item.description}</p>

        <div className="rounded-2xl border border-border bg-muted/30 p-3">
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold">
            <span>Progress</span>
            <span>{item.progress}/{goal}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className={`h-full ${item.claimed ? "bg-emerald-500" : ready ? "bg-gradient-to-r from-amber-400 to-fuchsia-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">How to complete</div>
          <ol className="space-y-1.5 text-sm">
            {howTo.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{i + 1}</span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-amber-400/30 bg-amber-500/5 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">Reward on claim</div>
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="inline-flex items-center gap-1 text-amber-600"><Zap className="h-3.5 w-3.5" /> +{item.xp} XP</span>
            <span className="inline-flex items-center gap-1 text-amber-600"><Coins className="h-3.5 w-3.5" /> +{item.coins}</span>
          </div>
        </div>

        {item.claimed ? (
          <div className="inline-flex w-full items-center justify-center gap-1 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            <Check className="h-4 w-4" /> Already claimed today
          </div>
        ) : ready ? (
          <button
            type="button"
            onClick={onClaim}
            disabled={claiming}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-60"
          >
            {claiming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
            Claim +{item.xp} XP · +{item.coins} coins
          </button>
        ) : (
          <div className="rounded-full bg-muted px-4 py-2 text-center text-xs font-semibold text-muted-foreground">
            Complete the steps above to unlock this reward.
          </div>
        )}
      </div>
    </>
  );
}
