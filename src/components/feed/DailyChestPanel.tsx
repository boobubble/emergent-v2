import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Gift, Check, Flame, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { claimDailyChest, getMyInventory } from "@/lib/rewards.functions";

const REWARDS = [20, 25, 30, 40, 50, 75, 150];

export function DailyChestPanel({ onBack }: { onBack: () => void }) {
  const claim = useServerFn(claimDailyChest);
  const fetchInv = useServerFn(getMyInventory);
  const [streak, setStreak] = useState(0);
  const [claimedToday, setClaimedToday] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    void fetchInv().then(r => {
      if (r?.profile) setStreak(r.profile.streak ?? 0);
    });
  }, [fetchInv]);

  // Best-effort: probe if today is already claimed by attempting and reading flag without committing.
  // (We rely on the server's idempotent response.)
  useEffect(() => { setClaimedToday(false); }, []);

  const dayInCycle = ((streak - 1 + 7) % 7) + 1;

  async function onClaim() {
    setClaiming(true);
    try {
      const res = await claim();
      if (res.alreadyClaimed) {
        setClaimedToday(true);
        toast.info("Already claimed today — come back tomorrow!");
      } else {
        setStreak(res.streak ?? streak);
        setClaimedToday(true);
        toast.success(`+${res.coins} 🪙 Daily reward (Day ${res.dayInCycle})`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not claim");
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Gift className="h-5 w-5 text-pink-500" /> Daily Chest
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">Sign in every day to climb the reward ladder. Day 7 = big chest!</p>

      <div className="mt-4 rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1 font-semibold"><Flame className="h-3.5 w-3.5 text-orange-500" /> Streak: {streak}d</span>
          <span className="text-muted-foreground">Today: Day {dayInCycle}</span>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {REWARDS.map((amt, i) => {
            const day = i + 1;
            const isToday = day === dayInCycle;
            const isPast = day < dayInCycle;
            return (
              <div
                key={day}
                className={`rounded-xl border p-2 text-center ${isToday ? "border-primary bg-primary/10 ring-2 ring-primary" : isPast ? "border-border bg-muted/30 opacity-60" : "border-border bg-background/50"}`}
              >
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Day {day}</div>
                <div className="my-1 text-lg">{day === 7 ? "🎁" : "🪙"}</div>
                <div className="text-[10px] font-bold">+{amt}</div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClaim}
          disabled={claiming || claimedToday}
          className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {claimedToday ? <><Check className="mr-1 inline h-4 w-4" /> Claimed today</> : claiming ? "Claiming…" : `Claim Day ${dayInCycle} reward`}
        </button>
      </div>
    </div>
  );
}
