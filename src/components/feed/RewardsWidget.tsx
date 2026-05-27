import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Coins, Star, Gift, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { rankFor, levelProgress } from "@/lib/ranks";
import { getMyInventory } from "@/lib/rewards.functions";

interface Props {
  meId: string;
  onOpenChest?: () => void;
  onOpenSpin?: () => void;
  onOpenShop?: () => void;
}

export function RewardsWidget({ meId, onOpenChest, onOpenSpin, onOpenShop }: Props) {
  const fetchInv = useServerFn(getMyInventory);
  const [coins, setCoins] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);

  async function refresh() {
    try {
      const r = await fetchInv();
      if (r?.profile) {
        setCoins(r.profile.coins ?? 0);
        setXp(r.profile.xp ?? 0);
        setStreak(r.profile.streak ?? 0);
      }
    } catch (e) { console.error(e); }
  }

  useEffect(() => {
    if (!meId) return;
    void refresh();
    const ch = supabase
      .channel(`rewards-w-${meId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${meId}` }, (payload) => {
        const n = payload.new as { coins?: number; xp?: number; streak?: number };
        if (typeof n.coins === "number") setCoins(n.coins);
        if (typeof n.xp === "number") setXp(n.xp);
        if (typeof n.streak === "number") setStreak(n.streak);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]);

  const lp = levelProgress(xp);
  const rank = rankFor(lp.level);

  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-yellow-500" /> Rewards
        </div>
        <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${rank.chip}`}>{rank.title}</span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-muted-foreground">Level</div>
          <div className="text-xl font-bold leading-none">{lp.level}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
            <Coins className="h-3.5 w-3.5" /> {coins}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Star className="h-3 w-3" /> {xp} XP
          </div>
        </div>
      </div>

      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-gradient-to-r from-primary to-yellow-500 transition-all" style={{ width: `${lp.pct}%` }} />
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{lp.intoLevel}/{lp.toNext} to Lv {lp.level + 1}</span>
        <span>🔥 {streak}d</span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5">
        <button onClick={onOpenChest} className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-background/50 p-2 text-[10px] font-semibold hover:bg-accent">
          <Gift className="h-4 w-4 text-pink-500" /> Daily
        </button>
        <button onClick={onOpenSpin} className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-background/50 p-2 text-[10px] font-semibold hover:bg-accent">
          <Sparkles className="h-4 w-4 text-violet-500" /> Spin
        </button>
        <button onClick={onOpenShop} className="flex flex-col items-center gap-0.5 rounded-xl border border-border bg-background/50 p-2 text-[10px] font-semibold hover:bg-accent">
          <Coins className="h-4 w-4 text-amber-500" /> Shop
        </button>
      </div>
    </div>
  );
}
