import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, RotateCcw, Trophy, CloudUpload, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-store";
import { getGame } from "@/lib/games-hub-registry";
import { markGamePlayed, clearGameProgress } from "@/lib/games-hub-tracking";
import { createBooBubbleGamesSDK } from "@/lib/games-sdk-adapters";
import type { GamesSDK } from "../../packages/games-sdk";

export const Route = createFileRoute("/games/premium-2048")({
  head: () => ({
    meta: [
      { title: "Premium 2048 — Games Hub" },
      { name: "description", content: "Slide, combine, and reach 2048. Auto-saved progress, achievements, and leaderboards." },
    ],
  }),
  component: Premium2048Page,
});

// ---------------------------------------------------------------------------
// Core 2048 engine (pure)
// ---------------------------------------------------------------------------
type Grid = number[][];
const SIZE = 4;
const GAME_ID = "premium-2048";

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}
function cloneGrid(g: Grid): Grid { return g.map((r) => r.slice()); }
function addRandomTile(g: Grid): Grid {
  const empties: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (g[r][c] === 0) empties.push([r, c]);
  if (!empties.length) return g;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
}
function slideRow(row: number[]): { row: number[]; gained: number; changed: boolean } {
  const filtered = row.filter((v) => v !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      out.push(merged);
      gained += merged;
      i++;
    } else out.push(filtered[i]);
  }
  while (out.length < SIZE) out.push(0);
  const changed = out.some((v, i) => v !== row[i]);
  return { row: out, gained, changed };
}
type Direction = "left" | "right" | "up" | "down";
function move(grid: Grid, dir: Direction): { grid: Grid; gained: number; moved: boolean } {
  const g = cloneGrid(grid);
  let gained = 0; let moved = false;
  const rows: number[][] = [];
  for (let i = 0; i < SIZE; i++) {
    let line: number[];
    if (dir === "left") line = g[i].slice();
    else if (dir === "right") line = g[i].slice().reverse();
    else if (dir === "up") line = [g[0][i], g[1][i], g[2][i], g[3][i]];
    else line = [g[3][i], g[2][i], g[1][i], g[0][i]];
    const { row, gained: rg, changed } = slideRow(line);
    if (changed) moved = true;
    gained += rg;
    rows.push(row);
  }
  const out = emptyGrid();
  for (let i = 0; i < SIZE; i++) {
    const row = rows[i];
    if (dir === "left") out[i] = row;
    else if (dir === "right") out[i] = row.slice().reverse();
    else if (dir === "up") for (let j = 0; j < SIZE; j++) out[j][i] = row[j];
    else for (let j = 0; j < SIZE; j++) out[SIZE - 1 - j][i] = row[j];
  }
  return { grid: out, gained, moved };
}
function hasMoves(g: Grid): boolean {
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) {
      if (g[r][c] === 0) return true;
      if (c + 1 < SIZE && g[r][c] === g[r][c + 1]) return true;
      if (r + 1 < SIZE && g[r][c] === g[r + 1][c]) return true;
    }
  return false;
}
function maxTile(g: Grid): number {
  let m = 0;
  for (const row of g) for (const v of row) if (v > m) m = v;
  return m;
}
function newGame(): { grid: Grid; score: number; best: number } {
  let g = emptyGrid();
  g = addRandomTile(g);
  g = addRandomTile(g);
  return { grid: g, score: 0, best: 0 };
}

// Colors per tile
const TILE_STYLES: Record<number, string> = {
  0: "bg-white/5 text-transparent",
  2: "bg-amber-50 text-stone-800",
  4: "bg-amber-100 text-stone-800",
  8: "bg-orange-300 text-white",
  16: "bg-orange-400 text-white",
  32: "bg-orange-500 text-white",
  64: "bg-red-500 text-white",
  128: "bg-yellow-400 text-white",
  256: "bg-yellow-500 text-white",
  512: "bg-yellow-600 text-white",
  1024: "bg-fuchsia-500 text-white",
  2048: "bg-emerald-500 text-white",
};
function tileClass(v: number): string {
  return TILE_STYLES[v] ?? "bg-violet-600 text-white";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
function Premium2048Page() {
  const { user } = useAuth();
  const router = useRouter();
  const game = getGame(GAME_ID);

  if (!user || user.isGuest) {
    return (
      <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
        <div className="max-w-sm">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Sign in to play</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in so your progress, score, and achievements sync across devices.</p>
          <Link to="/" className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Back</Link>
        </div>
      </div>
    );
  }

  return <Board userId={user.id} title={game?.name ?? "Premium 2048"} onBack={() => router.navigate({ to: "/games" })} />;
}

function Board({ userId, title, onBack }: { userId: string; title: string; onBack: () => void }) {
  const [{ grid, score }, setState] = useState<{ grid: Grid; score: number }>(() => {
    const n = newGame();
    return { grid: n.grid, score: n.score };
  });

  const [best, setBest] = useState(0);
  const [busy, setBusy] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [milestoneReached, setMilestoneReached] = useState(0);
  const sdkRef = useRef<GamesSDK | null>(null);

  // SDK boot
  useEffect(() => {
    sdkRef.current = createBooBubbleGamesSDK({ gameId: GAME_ID, version: "1.0.0" });
  }, []);

  const persist = useCallback((next: { grid: Grid; score: number; best: number }) => {
    const sdk = sdkRef.current;
    if (!sdk) return;
    // Fire-and-forget cloudsave; local fallback is inside the adapter.
    sdk.saveGame("auto", next).catch(() => {});
    markGamePlayed(GAME_ID, true);
  }, []);

  // Load saved game
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const sdk = sdkRef.current ?? createBooBubbleGamesSDK({ gameId: GAME_ID, version: "1.0.0" });
      sdkRef.current = sdk;
      const res = await sdk.loadGame<{ grid?: Grid; score?: number; best?: number }>("auto");
      if (cancelled) return;
      if (res.ok && res.data?.data) {
        const saved = res.data.data;
        if (saved.grid) {
          setState({ grid: saved.grid, score: saved.score ?? 0 });
          setBest(saved.best ?? saved.score ?? 0);
          setMilestoneReached(maxTile(saved.grid));
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Report Game Started once per mount
  useEffect(() => {
    const sdk = sdkRef.current;
    if (!sdk || sessionActive) return;
    sdk.gameStarted?.({}).catch(() => {});
    setSessionActive(true);
  }, [sessionActive]);

  const handleMove = useCallback((dir: Direction) => {
    if (busy) return;
    setState((prev) => {
      const { grid: g2, gained, moved } = move(prev.grid, dir);
      if (!moved) return prev;
      const g3 = addRandomTile(g2);
      const newScore = prev.score + gained;
      const nextBest = Math.max(best, newScore);
      const highest = maxTile(g3);

      setBest(nextBest);
      persist({ grid: g3, score: newScore, best: nextBest });

      // Milestone / achievements via SDK
      const sdk = sdkRef.current;
      if (sdk && highest > milestoneReached) {
        setMilestoneReached(highest);
        if ([128, 256, 512, 1024, 2048].includes(highest)) {
          sdk.reportHighestTile?.({ tile: highest }).catch(() => {});
        }
        if (highest === 2048) {
          sdk.onMilestoneTile?.({ tile: 2048 }).catch(() => {});
          toast.success("🎉 You reached 2048!");
        }
      }

      // Game over
      if (!hasMoves(g3)) {
        setTimeout(() => {
          if (sdk) {
            sdk.gameFinished?.({ score: newScore }).catch(() => {});
            sdk.submitScore?.({ score: newScore }).catch(() => {});
            if (newScore > best) sdk.onNewBestScore?.({ score: newScore }).catch(() => {});
          }
          toast("Game over", { description: `Score ${newScore.toLocaleString()}` });
        }, 250);
      }

      return { grid: g3, score: newScore };
    });
  }, [busy, best, milestoneReached, persist]);



  // Keyboard controls
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const map: Record<string, Direction> = {
        ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
        a: "left", d: "right", w: "up", s: "down",
      };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      handleMove(dir);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleMove]);

  // Touch (swipe) controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? "right" : "left");
    else handleMove(dy > 0 ? "down" : "up");
  };

  async function handleReset() {
    if (!confirm("Start a new game? Your current progress will be cleared.")) return;
    setBusy(true);
    try {
      const fresh = newGame();
      setState({ grid: fresh.grid, score: 0 });
      setMilestoneReached(0);
      setSessionActive(false);
      clearGameProgress(GAME_ID);
      const sdk = sdkRef.current;
      if (sdk) await sdk.deleteSave({ gameId: GAME_ID, userId, slot: "auto" }).catch(() => {});
    } finally { setBusy(false); }
  }

  const highest = useMemo(() => maxTile(grid), [grid]);

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="rounded-full p-2 hover:bg-white/5"><ArrowLeft className="h-4 w-4" /></button>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">{title}</h1>
            <p className="text-xs text-muted-foreground">Swipe or use arrow keys · Auto-saved</p>
          </div>
          <button onClick={handleReset} disabled={busy} className="rounded-full bg-secondary p-2 text-secondary-foreground hover:opacity-90 disabled:opacity-50" title="New game">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-4 px-4 pt-6">
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Score" value={score} icon={<Sparkles className="h-4 w-4 text-primary" />} />
          <StatCard label="Best" value={best} icon={<Trophy className="h-4 w-4 text-amber-400" />} />
          <StatCard label="Max Tile" value={highest} icon={<CloudUpload className="h-4 w-4 text-emerald-400" />} />
        </div>

        <div
          className="mx-auto grid aspect-square w-full max-w-[440px] grid-cols-4 gap-2 rounded-2xl bg-stone-800/40 p-2 select-none"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {grid.flat().map((v, i) => (
            <div
              key={i}
              className={`grid place-items-center rounded-lg text-2xl font-black transition-all sm:text-3xl ${tileClass(v)}`}
            >
              {v === 0 ? "" : v}
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Combine matching tiles to reach 2048. Progress auto-saves to the cloud.
        </p>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className="mt-1 text-xl font-bold">{value.toLocaleString()}</div>
    </div>
  );
}
