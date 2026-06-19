import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Coins, Star, Gift, Sparkles, Trophy, Flame, Zap } from "lucide-react";
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
      .channel(`rewards-w-${meId}-${Math.random().toString(36).slice(2, 8)}`)
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
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950 p-[1px] shadow-[0_20px_60px_-15px_rgba(251,191,36,0.45)]">
      {/* glow orbs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl" />

      <div className="relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-950/90 via-amber-950/70 to-slate-950/90 p-4 backdrop-blur-xl">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 shadow-lg shadow-amber-500/40">
              <Trophy className="h-4 w-4 text-white drop-shadow" />
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight text-white">Rewards</h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-amber-300/80">Your treasury</p>
            </div>
          </div>
          {lp.level > 1 && rank.title !== "Newcomer" && (
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ring-white/10 ${rank.chip}`}>{rank.title}</span>
          )}
        </div>

        {/* Level + balances */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-2.5 ring-1 ring-white/10">
            <div className="text-[9px] font-bold uppercase tracking-wider text-white/50">Level</div>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="bg-gradient-to-br from-amber-200 to-orange-400 bg-clip-text text-2xl font-black leading-none text-transparent">{lp.level}</span>
              <span className="text-[10px] font-bold text-white/40">/ {lp.level + 1}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 p-2.5 ring-1 ring-amber-400/20">
            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-300/80">
              <Coins className="h-2.5 w-2.5" /> Coins
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-base font-extrabold text-amber-200 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
              {coins.toLocaleString()}
            </div>
          </div>
        </div>

        {/* XP progress */}
        <div className="mb-3 rounded-2xl bg-white/5 p-2.5 ring-1 ring-white/10">
          <div className="mb-1.5 flex items-center justify-between text-[10px]">
            <span className="inline-flex items-center gap-1 font-bold text-white/80">
              <Zap className="h-2.5 w-2.5 text-amber-300" /> {xp.toLocaleString()} XP
            </span>
            <span className="font-semibold text-white/50">{lp.intoLevel}/{lp.toNext}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.6)] transition-all duration-700"
              style={{ width: `${lp.pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px]">
            <span className="text-white/50">to Lv {lp.level + 1}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-1.5 py-0.5 font-bold text-rose-300 ring-1 ring-rose-400/30">
              <Flame className="h-2.5 w-2.5" /> {streak}d streak
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={onOpenChest}
            className="group relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/5 p-2.5 ring-1 ring-pink-400/30 transition-all hover:scale-[1.04] hover:ring-pink-300/60 hover:shadow-lg hover:shadow-pink-500/30"
          >
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-pink-400 to-rose-600 shadow shadow-pink-500/40 transition group-hover:rotate-6">
              <Gift className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-extrabold text-white/90">Daily</span>
          </button>
          <button
            onClick={onOpenSpin}
            className="group relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/5 p-2.5 ring-1 ring-violet-400/30 transition-all hover:scale-[1.04] hover:ring-violet-300/60 hover:shadow-lg hover:shadow-violet-500/30"
          >
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-400 to-fuchsia-600 shadow shadow-violet-500/40 transition group-hover:rotate-180 duration-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-extrabold text-white/90">Spin</span>
          </button>
          <button
            onClick={onOpenShop}
            className="group relative flex flex-col items-center gap-1 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/5 p-2.5 ring-1 ring-amber-400/30 transition-all hover:scale-[1.04] hover:ring-amber-300/60 hover:shadow-lg hover:shadow-amber-500/30"
          >
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-600 shadow shadow-amber-500/40 transition group-hover:-rotate-6">
              <Coins className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-extrabold text-white/90">Shop</span>
          </button>
        </div>
      </div>
    </div>
  );
}
