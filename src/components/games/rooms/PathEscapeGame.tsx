import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock, Move, RotateCcw, Star, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useChat } from "@/lib/chat-store";
import { gamify } from "@/lib/gamification-emit";
import type { GameRuntimeProps } from "@/lib/games-registry";
import { Board } from "./path-escape/Board";
import { useEngine } from "./path-escape/useEngine";
import type { Level } from "./path-escape/logic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

async function fetchLevel(number: number): Promise<Level | null> {
  const { data } = await sb
    .from("pathescape_levels")
    .select("id, number, name, difficulty, grid_w, grid_h, layout, solution, par_moves, par_time, coin_reward, xp_reward")
    .eq("enabled", true)
    .gte("number", number)
    .order("number", { ascending: true })
    .limit(1)
    .maybeSingle();
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

  const [level, setLevel] = useState<Level | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<null | { stars: number; perfect: boolean; coins: number; xp: number; record: boolean; timeMs: number; moves: number }>(null);

  const { state, tryPlace, restart } = useEngine(level);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const highest = await fetchProgress(authUserId);
      const lvl = await fetchLevel(highest + 1);
      if (cancelled) return;
      setLevel(lvl); setLoading(false);
      if (lvl) gamify("pathescape.started", 1, { level: lvl.number });
    })();
    return () => { cancelled = true; };
  }, [authUserId]);

  useEffect(() => {
    if (state.status !== "won" || !level || !authUserId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await sb.rpc("pathescape_submit_score", {
        _level_id: level.id, _time_ms: state.timeMs, _moves: state.moves,
        _hints_used: 0, _mode: "story", _room_id: room.id, _replay_log: state.log,
      });
      if (cancelled) return;
      if (error) { toast.error(error.message || "Score rejected"); return; }
      const r = data as { stars: number; perfect: boolean; coins: number; xp: number; record_broken: boolean };
      setResult({ ...r, record: r.record_broken, timeMs: state.timeMs, moves: state.moves });
      gamify("pathescape.completed", 1, { level: level.number, stars: r.stars });
      if (r.perfect) gamify("pathescape.perfect", 1, { level: level.number });
      if (r.record_broken) gamify("pathescape.record", 1, { level: level.number });
      pushSystem(room.id, `🏆 You completed Level ${level.number} (${r.stars}★)`);
      if (r.perfect) pushSystem(room.id, `⭐ You achieved a Perfect Solve!`);
      if (r.coins > 0) pushSystem(room.id, `💎 You earned ${r.coins} Coins.`);
      if (r.record_broken) pushSystem(room.id, `🔥 You set a new personal record!`);
    })();
    return () => { cancelled = true; };
  }, [state.status, state.timeMs, state.moves, state.log, level, authUserId, pushSystem, room.id]);

  const goNext = useCallback(async () => {
    if (!level) return;
    setResult(null);
    const nxt = await fetchLevel(level.number + 1);
    if (nxt) setLevel(nxt);
    else toast.info("You've cleared every published level. New ones coming soon!");
  }, [level]);

  const boardArea = useMemo(() => {
    if (loading) return <div className="grid h-full place-items-center text-sm text-muted-foreground">Loading level…</div>;
    if (!level) return (
      <div className="grid h-full place-items-center px-6 text-center text-sm text-muted-foreground">
        No published Path Escape levels yet. Ask an admin to publish some.
      </div>
    );
    return <Board level={level} positions={state.positions} disabled={state.status !== "playing"} onMove={tryPlace} />;
  }, [loading, level, state.positions, state.status, tryPlace]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      <div className="relative min-h-0 flex-1">{boardArea}</div>

      {level && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-3 pt-3">
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-border/50 bg-background/70 px-3 py-1.5 shadow-lg backdrop-blur-md">
            <Pill icon={<Trophy className="h-3 w-3" />} label={`L${level.number}`} />
            <Pill icon={<Clock className="h-3 w-3" />} label={fmtTime(state.timeMs)} />
            <Pill icon={<Move className="h-3 w-3" />} label={`${state.moves}/${level.par_moves}`} />
            <Pill icon={<Star className="h-3 w-3" />} label={`${state.correct}/${state.total}`} />
          </div>
        </div>
      )}

      {level && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3">
          <div className="pointer-events-auto flex gap-2 rounded-full border border-border/50 bg-background/70 px-2 py-1.5 shadow-lg backdrop-blur-md">
            <Button size="sm" variant="ghost" className="rounded-full" onClick={restart}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restart
            </Button>
          </div>
        </div>
      )}

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
