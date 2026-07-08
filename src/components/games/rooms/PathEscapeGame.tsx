import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Move, RotateCcw, Star, Trophy, Calendar, Flame, Infinity as InfIcon, Award, ChevronLeft, Heart, Lightbulb, Ghost, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChat } from "@/lib/chat-store";
import { gamify } from "@/lib/gamification-emit";
import type { GameRuntimeProps } from "@/lib/games-registry";
import { Board } from "./path-escape/Board";
import { useEngine } from "./path-escape/useEngine";
import type { Level, PiecePos } from "./path-escape/logic";
import { useLives } from "./path-escape/useLives";
import { getCurrentDaily, getCurrentWeekly, getEndlessLevel, getLeaderboard } from "@/lib/pathescape-modes.functions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

interface MoveLog { pieceId: string; from: PiecePos; to: PiecePos; t: number }

export type Mode = "story" | "daily" | "weekly" | "endless" | "practice";

async function fetchStoryLevel(after: number): Promise<Level | null> {
  const { data } = await sb
    .from("pathescape_levels")
    .select("id, number, name, difficulty, grid_w, grid_h, layout, solution, par_moves, par_time, coin_reward, xp_reward")
    .eq("enabled", true).gte("number", after).order("number", { ascending: true }).limit(1).maybeSingle();
  return (data as Level | null) ?? null;
}
async function fetchProgress(userId: string | null): Promise<number> {
  if (!userId) return 0;
  const { data } = await sb.from("pathescape_progress").select("highest_level").eq("user_id", userId).maybeSingle();
  return (data?.highest_level as number) ?? 0;
}
const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export default function PathEscapeGame({ room }: GameRuntimeProps) {
  const { pushSystem, authUserId } = useChat() as unknown as {
    pushSystem: (channelId: string, text: string) => void;
    authUserId: string | null;
  };
  const dailyFn = useServerFn(getCurrentDaily);
  const weeklyFn = useServerFn(getCurrentWeekly);
  const endlessFn = useServerFn(getEndlessLevel);
  const lbFn = useServerFn(getLeaderboard);

  const [mode, setMode] = useState<Mode | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { stars: number; perfect: boolean; coins: number; xp: number; record: boolean; timeMs: number; moves: number }>(null);
  const [showLB, setShowLB] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintSolution, setHintSolution] = useState<Level["solution"] | null>(null);
  const [ghost, setGhost] = useState<null | { positions: Record<string, PiecePos> }>(null);
  const [ghostPlaying, setGhostPlaying] = useState(false);

  const lives = useLives(authUserId);
  const { state, tryPlace, restart } = useEngine(level);

  const { data: daily } = useQuery({ queryKey: ["pe-daily"], queryFn: () => dailyFn({}), staleTime: 60_000 });
  const { data: weekly } = useQuery({ queryKey: ["pe-weekly"], queryFn: () => weeklyFn({}), staleTime: 60_000 });
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["pe-lb", level?.id],
    queryFn: () => level ? lbFn({ data: { levelId: level.id, limit: 25 } }) : Promise.resolve([]),
    enabled: !!level && showLB,
  });

  const loadForMode = useCallback(async (m: Mode) => {
    setLoading(true); setResult(null);
    try {
      if (m === "story") {
        const highest = await fetchProgress(authUserId);
        setLevel(await fetchStoryLevel(highest + 1));
      } else if (m === "daily") {
        setLevel((daily as any)?.level ?? null);
      } else if (m === "weekly") {
        setLevel((weekly as any)?.level ?? null);
      } else if (m === "endless") {
        if (!authUserId) { toast.error("Sign in to play Endless"); setMode(null); return; }
        const lvl = await endlessFn({});
        setLevel((lvl as unknown as Level | null) ?? null);
      } else if (m === "practice") {
        // random enabled level, no rewards
        const { data } = await sb.from("pathescape_levels")
          .select("id, number, name, difficulty, grid_w, grid_h, layout, solution, par_moves, par_time, coin_reward, xp_reward")
          .eq("enabled", true).limit(50);
        const arr = ((data as unknown) as Level[]) ?? [];
        setLevel(arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);
      }
    } finally { setLoading(false); }
  }, [authUserId, daily, weekly, endlessFn]);

  useEffect(() => {
    if (!mode) return;
    setHintsUsed(0); setHintSolution(null);
    loadForMode(mode);
    gamify(`pathescape.${mode}.started`, 1);
  }, [mode, loadForMode]);

  // Consume a life on new level (scored modes only)
  useEffect(() => {
    if (!level || !mode || mode === "practice" || !authUserId) return;
    lives.consume().then(ok => { if (!ok) { setMode(null); setLevel(null); } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level?.id]);

  useEffect(() => {
    if (state.status !== "won" || !level || !authUserId || !mode) return;
    if (mode === "practice") {
      setResult({ stars: 3, perfect: state.moves <= level.par_moves, coins: 0, xp: 0, record: false, timeMs: state.timeMs, moves: state.moves });
      pushSystem(room.id, `🧪 Practice: solved Level ${level.number} in ${state.moves} moves`);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await sb.rpc("pathescape_submit_score", {
        _level_id: level.id, _time_ms: state.timeMs, _moves: state.moves,
        _hints_used: hintsUsed, _mode: mode, _room_id: room.id, _replay_log: state.log,
      });
      if (cancelled) return;
      if (error) { toast.error(error.message || "Score rejected"); return; }
      const r = data as { stars: number; perfect: boolean; coins: number; xp: number; record_broken: boolean };
      setResult({ ...r, record: r.record_broken, timeMs: state.timeMs, moves: state.moves });
      gamify(`pathescape.${mode}.completed`, 1, { level: level.number, stars: r.stars });
      if (r.perfect) gamify("pathescape.perfect", 1, { level: level.number });
      const label = mode === "daily" ? "Daily" : mode === "weekly" ? "Weekly" : mode === "endless" ? "Endless" : "Level";
      pushSystem(room.id, `🏆 ${label} · Level ${level.number} (${r.stars}★)`);
      if (r.coins > 0) pushSystem(room.id, `💎 +${r.coins} Coins`);
      if (r.record_broken) pushSystem(room.id, `🔥 New personal record!`);
    })();
    return () => { cancelled = true; };
  }, [state.status, state.timeMs, state.moves, state.log, level, authUserId, mode, pushSystem, room.id, hintsUsed]);

  const buyHint = useCallback(async () => {
    if (!level || !authUserId) { toast.error("Sign in to use hints"); return; }
    const { data, error } = await sb.rpc("pathescape_buy_hint", { _level_id: level.id, _hint_type: "reveal_piece", _cost: 10 });
    if (error) { toast.error(error.message || "Not enough coins"); return; }
    const sol = (data?.solution ?? level.solution) as Level["solution"];
    // Snap one un-solved piece into place
    const target = sol.pieces.find(sp => {
      const p = state.positions[sp.id];
      return !p || p.r !== sp.r || p.c !== sp.c;
    });
    if (target) {
      const ok = tryPlace(target.id, { r: target.r, c: target.c });
      if (!ok) { setHintSolution(sol); toast.info("Hint revealed — path is blocked, clear it first"); return; }
    }
    setHintsUsed(n => n + 1);
    setHintSolution(sol);
    toast.success("Hint used (−10💎)");
  }, [level, authUserId, state.positions, tryPlace]);

  // Ghost replay playback
  useEffect(() => {
    if (!ghost || !level) return;
    setGhostPlaying(true);
  }, [ghost, level]);

  const goNext = useCallback(async () => {
    if (!mode) return;
    setResult(null);
    if (mode === "story" && level) {
      const nxt = await fetchStoryLevel(level.number + 1);
      if (nxt) setLevel(nxt); else toast.info("You've cleared every published level.");
    } else {
      await loadForMode(mode);
    }
  }, [mode, level, loadForMode]);

  // ---- Mode picker ----
  if (!mode) {
    return <ModePicker daily={daily as any} weekly={weekly as any} onPick={setMode} />;
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      <div className="relative min-h-0 flex-1">
        {loading ? (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading level…</div>
        ) : !level ? (
          <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
            No level available for this mode yet.
          </div>
        ) : (
          <Board
            level={level}
            positions={ghost && ghostPlaying ? ghost.positions : state.positions}
            disabled={state.status !== "playing" || ghostPlaying}
            onMove={tryPlace}
            hintSolution={hintSolution ?? undefined}
          />
        )}
      </div>

      {/* Top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-between px-3 pt-3">
        <div className="pointer-events-auto">
          <Button size="sm" variant="ghost" className="rounded-full bg-background/70 backdrop-blur-md" onClick={() => { setMode(null); setLevel(null); }}>
            <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Modes
          </Button>
        </div>
        {level && (
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/50 bg-background/70 px-3 py-1.5 shadow-lg backdrop-blur-md">
            <Pill icon={<ModeIcon mode={mode} />} label={modeLabel(mode)} />
            <Pill icon={<Trophy className="h-3 w-3" />} label={`L${level.number}`} />
            <Pill icon={<Clock className="h-3 w-3" />} label={fmtTime(state.timeMs)} />
            <Pill icon={<Move className="h-3 w-3" />} label={`${state.moves}/${level.par_moves}`} />
            <Pill icon={<Star className="h-3 w-3" />} label={`${state.correct}/${state.total}`} />
            {authUserId && mode !== "practice" && (
              <Pill icon={<Heart className="h-3 w-3 fill-red-500 text-red-500" />} label={`${lives.lives}/${lives.max}`} />
            )}
          </div>
        )}
        <div className="w-16" />
      </div>

      {/* Floating controls */}
      {level && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3">
          <div className="pointer-events-auto flex gap-2 rounded-full border border-border/50 bg-background/70 px-2 py-1.5 shadow-lg backdrop-blur-md">
            <Button size="sm" variant="ghost" className="rounded-full" onClick={restart} disabled={ghostPlaying}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restart
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={buyHint} disabled={ghostPlaying || state.status !== "playing"}>
              <Lightbulb className="mr-1 h-3.5 w-3.5" /> Hint · 10💎
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setShowLB(true)}>
              <Award className="mr-1 h-3.5 w-3.5" /> Board
            </Button>
            {authUserId && mode !== "practice" && lives.lives === 0 && (
              <Button size="sm" variant="default" className="rounded-full" onClick={lives.refill}>
                Refill · 50💎
              </Button>
            )}
            {ghostPlaying && (
              <Button size="sm" variant="secondary" className="rounded-full" onClick={() => { setGhost(null); setGhostPlaying(false); restart(); }}>
                Stop Ghost
              </Button>
            )}
          </div>
        </div>
      )}
        <div className="w-16" />
      </div>

      {/* Floating controls */}
      {level && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3">
          <div className="pointer-events-auto flex gap-2 rounded-full border border-border/50 bg-background/70 px-2 py-1.5 shadow-lg backdrop-blur-md">
            <Button size="sm" variant="ghost" className="rounded-full" onClick={restart}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restart
            </Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setShowLB(true)}>
              <Award className="mr-1 h-3.5 w-3.5" /> Leaderboard
            </Button>
          </div>
        </div>
      )}

      {/* Result */}
      <Dialog open={!!result} onOpenChange={o => !o && setResult(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {result?.perfect ? "Perfect!" : "Level Complete"}
            </DialogTitle>
          </DialogHeader>
          <div className="my-2 flex justify-center gap-2">
            {[1, 2, 3].map(i => (
              <Star key={i} className={"h-9 w-9 " + ((result?.stars ?? 0) >= i ? "fill-primary text-primary" : "text-muted-foreground/40")} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-lg bg-muted/50 p-2"><div className="text-muted-foreground">Time</div><div className="font-semibold">{fmtTime(result?.timeMs ?? 0)}</div></div>
            <div className="rounded-lg bg-muted/50 p-2"><div className="text-muted-foreground">Moves</div><div className="font-semibold">{result?.moves ?? 0}</div></div>
            <div className="rounded-lg bg-muted/50 p-2"><div className="text-muted-foreground">Coins</div><div className="font-semibold">+{result?.coins ?? 0}</div></div>
            <div className="rounded-lg bg-muted/50 p-2"><div className="text-muted-foreground">XP</div><div className="font-semibold">+{result?.xp ?? 0}</div></div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => { setResult(null); restart(); }}>Replay</Button>
            <Button className="flex-1" onClick={goNext}>Next</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Leaderboard */}
      <Dialog open={showLB} onOpenChange={setShowLB}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Leaderboard — {level?.name}</DialogTitle></DialogHeader>
          <div className="max-h-96 space-y-1 overflow-y-auto">
            {(leaderboard as any[]).length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">No scores yet — be the first!</div>
            )}
            {(leaderboard as any[]).map(r => (
              <div key={r.user_id} className="flex items-center gap-3 rounded-lg bg-muted/30 p-2 text-sm">
                <span className="w-6 text-center font-bold text-muted-foreground">#{r.rank}</span>
                <span className="flex-1 truncate">{r.username ?? "player"}</span>
                <span className="text-xs text-muted-foreground">{r.stars}★ · {r.moves}m · {fmtTime(r.time_ms)}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function modeLabel(m: Mode) { return { story: "Story", daily: "Daily", weekly: "Weekly", endless: "Endless", practice: "Practice" }[m]; }
function ModeIcon({ mode }: { mode: Mode }) {
  const c = "h-3 w-3";
  if (mode === "daily") return <Calendar className={c} />;
  if (mode === "weekly") return <Flame className={c} />;
  if (mode === "endless") return <InfIcon className={c} />;
  if (mode === "practice") return <Star className={c} />;
  return <Trophy className={c} />;
}

function ModePicker({ daily, weekly, onPick }: { daily: any; weekly: any; onPick(m: Mode): void }) {
  const cards: Array<{ mode: Mode; title: string; sub: string; icon: React.ReactNode; enabled: boolean }> = [
    { mode: "story", title: "Story", sub: "Play through every published level in order", icon: <Trophy className="h-5 w-5" />, enabled: true },
    { mode: "daily", title: "Daily Challenge", sub: daily?.level ? `#${daily.level.number} · ${daily.level.name} · +${daily.coin_reward}💎` : "New puzzle every day", icon: <Calendar className="h-5 w-5" />, enabled: !!daily?.level },
    { mode: "weekly", title: "Weekly Tournament", sub: weekly?.level ? `#${weekly.level.number} · ${weekly.level.name} · +${weekly.coin_reward}💎` : "One tough puzzle per week", icon: <Flame className="h-5 w-5" />, enabled: !!weekly?.level },
    { mode: "endless", title: "Endless", sub: "Random unsolved levels, forever", icon: <InfIcon className="h-5 w-5" />, enabled: true },
    { mode: "practice", title: "Practice", sub: "Random level · no rewards or leaderboard", icon: <Star className="h-5 w-5" />, enabled: true },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <div className="mx-auto w-full max-w-lg space-y-3">
        <div className="text-center">
          <div className="text-2xl font-bold">Path Escape</div>
          <div className="text-sm text-muted-foreground">Choose a mode</div>
        </div>
        {cards.map(c => (
          <button
            key={c.mode}
            disabled={!c.enabled}
            onClick={() => onPick(c.mode)}
            className={"group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all " +
              (c.enabled
                ? "border-border bg-card hover:border-primary hover:bg-primary/5"
                : "cursor-not-allowed border-border/40 bg-muted/20 opacity-60")}
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
              {c.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{c.title}</div>
              <div className="truncate text-xs text-muted-foreground">{c.sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1 text-[11px] font-medium tabular-nums">
      {icon}{label}
    </span>
  );
}
