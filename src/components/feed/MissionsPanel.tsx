import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Coins, Sparkles, Trophy, Check, Flame, Gift, Volume2, VolumeX } from "lucide-react";
import { getTodayMissions, claimMission } from "@/lib/missions.functions";
import { getMyCreatorRank } from "@/lib/creator.functions";

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

type Burst = { id: number; missionId: string; coins: number };

const SOUND_KEY = "missions:sound";
const COLORS = ["#fbbf24", "#f472b6", "#a78bfa", "#34d399", "#60a5fa", "#fb7185"];

function playClaimSound() {
  try {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new Ctx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.08;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
    setTimeout(() => ctx.close(), 800);
  } catch (e) {
    console.warn("claim sound failed", e);
  }
}

export function MissionsPanel() {
  const fetchMissions = useServerFn(getTodayMissions);
  const claim = useServerFn(claimMission);
  const fetchRank = useServerFn(getMyCreatorRank);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [rank, setRank] = useState<{ score: number; title: string; chip: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const burstId = useRef(0);

  useEffect(() => {
    try {
      const v = localStorage.getItem(SOUND_KEY);
      if (v !== null) setSoundOn(v === "1");
    } catch { /* ignore */ }
  }, []);

  function toggleSound() {
    setSoundOn(s => {
      const next = !s;
      try { localStorage.setItem(SOUND_KEY, next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }

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

  const inFlight = useRef<Set<string>>(new Set());

  async function onClaim(id: string) {
    // Guard: block double-claim from rapid clicks, in-flight requests, or already-claimed state
    if (inFlight.current.has(id)) return;
    if (claiming === id) return;
    const target = missions.find(m => m.id === id);
    if (!target) return;
    if (target.claimed) {
      toast.info("Already claimed");
      return;
    }
    if (!target.completed) {
      toast.error("Mission not yet complete");
      return;
    }

    inFlight.current.add(id);
    setClaiming(id);

    // Optimistic: mark claimed immediately
    setMissions(prev => prev.map(m => m.id === id ? { ...m, claimed: true, completed: true } : m));

    // Fire burst + sound
    const bId = ++burstId.current;
    setBursts(b => [...b, { id: bId, missionId: id, coins: target.coins }]);
    if (soundOn) playClaimSound();
    setTimeout(() => setBursts(b => b.filter(x => x.id !== bId)), 1400);

    try {
      await claim({ data: { missionId: id } });
      toast.success(`Claimed +${target.coins} coins`);
      // Refresh rank/coins quietly
      void load();
    } catch (e) {
      console.error("claim failed", e);
      const msg = e instanceof Error ? e.message : "Couldn't claim reward. Please try again.";
      toast.error(msg);
      // Rollback optimistic state + clear burst
      setMissions(prev => prev.map(m => m.id === id ? { ...m, claimed: false } : m));
      setBursts(b => b.filter(x => x.id !== bId));
    } finally {
      inFlight.current.delete(id);
      setClaiming(null);
    }
  }

  const total = missions.length;
  const done = missions.filter(m => m.claimed).length;
  const overallPct = total ? Math.round((done / total) * 100) : 0;
  const totalCoins = missions.reduce((s, m) => s + (m.claimed ? 0 : m.coins), 0);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 p-[1px] shadow-[0_20px_60px_-15px_rgba(99,102,241,0.5)]">
      {/* glow orbs */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-fuchsia-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-indigo-500/30 blur-3xl" />

      <div className="relative rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-slate-950/90 via-indigo-950/80 to-slate-950/90 p-4 backdrop-blur-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 via-fuchsia-500 to-indigo-500 shadow-lg shadow-fuchsia-500/40">
              <Sparkles className="h-4.5 w-4.5 text-white" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-tight text-white">Daily Missions</h3>
              <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-300/80">Resets in 24h</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {rank && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 px-2.5 py-1 text-[10px] font-bold text-amber-200 ring-1 ring-amber-400/30">
                <Trophy className="h-3 w-3" /> {rank.title}
              </span>
            )}
            <button
              type="button"
              onClick={toggleSound}
              title={soundOn ? "Mute claim sound" : "Unmute claim sound"}
              aria-label={soundOn ? "Mute claim sound" : "Unmute claim sound"}
              className="grid h-7 w-7 place-items-center rounded-full bg-white/5 text-white/70 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
            >
              {soundOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>


        {/* Overall progress */}
        {!loading && total > 0 && (
          <div className="mb-4 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 backdrop-blur">
            <div className="mb-2 flex items-center justify-between text-[11px]">
              <span className="font-bold text-white/90">{done}/{total} completed</span>
              <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                <Coins className="h-3 w-3" /> {totalCoins} to earn
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 shadow-[0_0_10px_rgba(217,70,239,0.6)] transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-300" />
          </div>
        ) : (
          <ul className="space-y-2">
            {missions.map((m) => {
              const pct = Math.min(100, Math.round((m.progress / m.target) * 100));
              const isClaimed = m.claimed;
              const isReady = m.completed && !m.claimed;
              return (
                <li
                  key={m.id}
                  className={`group relative overflow-hidden rounded-2xl p-3 ring-1 transition-all ${
                    isClaimed
                      ? "bg-emerald-500/5 ring-emerald-500/20"
                      : isReady
                      ? "bg-gradient-to-r from-amber-500/15 via-fuchsia-500/10 to-transparent ring-amber-400/40 shadow-lg shadow-amber-500/10"
                      : "bg-white/5 ring-white/10 hover:bg-white/[0.07] hover:ring-white/20"
                  }`}
                >
                  {isReady && (
                    <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2.5s_ease-in-out_infinite]" />
                  )}
                  {bursts.filter(b => b.missionId === m.id).map(b => (
                    <div key={b.id} className="pointer-events-none absolute inset-0 z-10">
                      {/* glow ring */}
                      <div className="absolute inset-0 rounded-2xl ring-2 ring-amber-300/70 animate-[claim-glow_1.2s_ease-out_forwards] shadow-[0_0_30px_rgba(251,191,36,0.7)]" />
                      {/* floating +coins */}
                      <div className="absolute right-3 top-1 text-xs font-extrabold text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] animate-[float-up_1.2s_ease-out_forwards]">
                        +{b.coins} 🪙
                      </div>
                      {/* confetti particles */}
                      {Array.from({ length: 14 }).map((_, i) => {
                        const angle = (i / 14) * Math.PI * 2;
                        const dist = 40 + Math.random() * 30;
                        const dx = Math.cos(angle) * dist;
                        const dy = Math.sin(angle) * dist;
                        const color = COLORS[i % COLORS.length];
                        return (
                          <span
                            key={i}
                            className="absolute left-6 top-1/2 h-1.5 w-1.5 rounded-sm animate-[confetti_1.1s_ease-out_forwards]"
                            style={{
                              backgroundColor: color,
                              ["--dx" as string]: `${dx}px`,
                              ["--dy" as string]: `${dy}px`,
                              animationDelay: `${i * 12}ms`,
                            } as React.CSSProperties}
                          />
                        );
                      })}
                    </div>
                  ))}
                  <div className="flex items-center gap-3">
                    <div className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl shadow-inner ${
                      isClaimed
                        ? "bg-emerald-500/20 ring-1 ring-emerald-400/30"
                        : isReady
                        ? "bg-gradient-to-br from-amber-400/30 to-fuchsia-500/30 ring-1 ring-amber-300/40"
                        : "bg-white/5 ring-1 ring-white/10"
                    }`}>
                      <span className={isClaimed ? "grayscale opacity-60" : ""}>{m.icon}</span>
                      {isReady && (
                        <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-amber-400 ring-2 ring-slate-950">
                          <Flame className="h-2.5 w-2.5 text-slate-900" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-sm font-bold ${isClaimed ? "text-white/50 line-through" : "text-white"}`}>
                        {m.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="truncate text-[11px] text-white/60">{m.description}</span>
                      </div>
                    </div>
                    {isClaimed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                        <Check className="h-3 w-3" /> Claimed
                      </span>
                    ) : isReady ? (
                      <button
                        onClick={() => onClaim(m.id)}
                        disabled={claiming === m.id}
                        className="group/btn relative inline-flex items-center gap-1 overflow-hidden rounded-full bg-gradient-to-r from-amber-400 via-fuchsia-500 to-indigo-500 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-lg shadow-fuchsia-500/40 ring-1 ring-white/20 transition-all hover:scale-105 hover:shadow-fuchsia-500/60 disabled:opacity-60"
                      >
                        {claiming === m.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Gift className="h-3 w-3" />
                        )}
                        Claim +{m.coins}
                      </button>
                    ) : (
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-300/80">
                          <Coins className="h-2.5 w-2.5" />+{m.coins}
                        </span>
                        <span className="text-[10px] font-semibold text-white/50">{m.progress}/{m.target}</span>
                      </div>
                    )}
                  </div>
                  {!isClaimed && (
                    <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isReady
                            ? "bg-gradient-to-r from-amber-400 to-fuchsia-500 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                            : "bg-gradient-to-r from-indigo-400 to-fuchsia-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes claim-glow {
          0% { opacity: 0; transform: scale(0.92); }
          30% { opacity: 1; transform: scale(1.02); }
          100% { opacity: 0; transform: scale(1.06); }
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(8px) scale(0.8); }
          25% { opacity: 1; transform: translateY(-2px) scale(1.15); }
          100% { opacity: 0; transform: translateY(-28px) scale(1); }
        }
        @keyframes confetti {
          0% { opacity: 0; transform: translate(0,0) scale(0.5) rotate(0deg); }
          15% { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1) rotate(540deg); }
        }
      `}</style>
    </div>
  );
}
