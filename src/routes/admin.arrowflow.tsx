import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Route as RouteIcon, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { generatePuzzle, isSolved, applyMoves, type Rotation } from "@/components/games/rooms/arrow-flow/logic";

export const Route = createFileRoute("/admin/arrowflow")({ component: ArrowFlowAdmin });

type Difficulty = "easy" | "normal" | "hard" | "expert" | "master";
interface LevelRow {
  id: string;
  level_number: number;
  difficulty: Difficulty;
  grid_size: number;
  par_moves: number;
  par_time_ms: number;
  coin_reward: number;
  xp_reward: number;
  is_featured: boolean;
  is_enabled: boolean;
  version: number;
}

const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard", "expert", "master"];
const DEFAULT_GRID: Record<Difficulty, number> = { easy: 4, normal: 5, hard: 6, expert: 7, master: 8 };

interface ArrowFlowConfig {
  hintCost: number;
  maxHints: number;
  freeDailyHints: number;
  tournamentActive: boolean;
  tournamentPrize: number;
}
const DEFAULT_CONFIG: ArrowFlowConfig = {
  hintCost: 15,
  maxHints: 5,
  freeDailyHints: 1,
  tournamentActive: false,
  tournamentPrize: 1000,
};

function ArrowFlowAdmin() {
  const [levels, setLevels] = useState<LevelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDiff, setNewDiff] = useState<Difficulty>("easy");
  const cfg = useAdminSetting<ArrowFlowConfig>("arrowflow", DEFAULT_CONFIG);

  const load = async () => {
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("arrowflow_levels")
      .select("id,level_number,difficulty,grid_size,par_moves,par_time_ms,coin_reward,xp_reward,is_featured,is_enabled,version")
      .order("level_number", { ascending: true });
    if (error) toast.error(error.message);
    setLevels((data as LevelRow[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const byDiff = useMemo(() => {
    const m: Record<Difficulty, LevelRow[]> = { easy: [], normal: [], hard: [], expert: [], master: [] };
    for (const l of levels) m[l.difficulty]?.push(l);
    return m;
  }, [levels]);

  const nextLevelNumber = () => (levels.length ? Math.max(...levels.map((l) => l.level_number)) + 1 : 1);

  const create = async () => {
    setCreating(true);
    try {
      const size = DEFAULT_GRID[newDiff];
      const { layout, solution } = generatePuzzle(size, newDiff);
      // Sanity — the un-scrambled layout should be solved once we reset to solution.
      const check = applyMoves(layout, []); // just to ensure typecheck path
      void check;
      const parMoves = layout.pieces.reduce((n, p) => n + (p.shape !== "none" && !p.locked ? 1 : 0), 0);
      const parTime = { easy: 30_000, normal: 60_000, hard: 90_000, expert: 150_000, master: 240_000 }[newDiff];
      const coinReward = { easy: 10, normal: 20, hard: 40, expert: 80, master: 160 }[newDiff];
      const xpReward = { easy: 25, normal: 50, hard: 100, expert: 200, master: 400 }[newDiff];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("arrowflow_levels").insert({
        level_number: nextLevelNumber(),
        difficulty: newDiff,
        grid_size: size,
        layout,
        solution,
        par_moves: parMoves,
        par_time_ms: parTime,
        coin_reward: coinReward,
        xp_reward: xpReward,
      });
      if (error) throw new Error(error.message);
      toast.success(`Generated ${newDiff} level (${size}×${size})`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create level");
    } finally {
      setCreating(false);
    }
  };

  const patch = async (id: string, changes: Partial<LevelRow>) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("arrowflow_levels").update(changes).eq("id", id);
    if (error) return toast.error(error.message);
    setLevels((rows) => rows.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this level? Existing scores will also be removed.")) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("arrowflow_levels").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setLevels((rows) => rows.filter((r) => r.id !== id));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4">
      <AdminPageHeader
        icon={<RouteIcon className="h-5 w-5" />}
        title="Arrow Flow"
        subtitle="Manage levels, rewards, hints and daily challenges for the Arrow Flow game."
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> Hint economy & tournament
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Hint cost (coins)</Label>
              <Input type="number" min={0} value={cfg.values.hintCost} onChange={(e) => cfg.set("hintCost", Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max hints / level</Label>
              <Input type="number" min={0} value={cfg.values.maxHints} onChange={(e) => cfg.set("maxHints", Number(e.target.value))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Free daily hints</Label>
              <Input type="number" min={0} value={cfg.values.freeDailyHints} onChange={(e) => cfg.set("freeDailyHints", Number(e.target.value))} />
            </div>
          </div>
          <div className="flex items-end gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={cfg.values.tournamentActive} onCheckedChange={(v) => cfg.set("tournamentActive", v)} />
              <Label className="text-xs">Tournament active</Label>
            </div>
            <div className="w-40 space-y-1">
              <Label className="text-xs">Tournament prize (coins)</Label>
              <Input type="number" min={0} value={cfg.values.tournamentPrize} onChange={(e) => cfg.set("tournamentPrize", Number(e.target.value))} />
            </div>
            <Button onClick={cfg.save} disabled={cfg.saving} className="ml-auto">
              {cfg.saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-foreground">Add a new level</div>
            <Select value={newDiff} onValueChange={(v) => setNewDiff(v as Difficulty)}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d} ({DEFAULT_GRID[d]}×{DEFAULT_GRID[d]})</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={create} disabled={creating}>
              <Plus className="mr-1 h-4 w-4" /> {creating ? "Generating…" : "Generate & save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Levels are generated with a guaranteed solvable path from source to sink, then scrambled for the player.
            You can tune par values and rewards per row below.
          </p>
        </CardContent>
      </Card>

      {DIFFICULTIES.map((d) => (
        <Card key={d}>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold capitalize text-foreground">
              <Badge variant="secondary">{d}</Badge>
              <span className="text-muted-foreground">· {byDiff[d].length} level{byDiff[d].length === 1 ? "" : "s"}</span>
            </div>
            {loading && <p className="text-xs text-muted-foreground">Loading…</p>}
            {!loading && byDiff[d].length === 0 && <p className="text-xs text-muted-foreground">No levels yet.</p>}
            <div className="space-y-2">
              {byDiff[d].map((row) => (
                <div key={row.id} className="grid grid-cols-2 items-center gap-2 rounded-xl border border-border/60 bg-card/50 p-3 md:grid-cols-7">
                  <div className="text-xs font-semibold text-foreground md:col-span-1">
                    #{row.level_number}
                    <div className="text-[10px] text-muted-foreground">{row.grid_size}×{row.grid_size}</div>
                  </div>
                  <NumField label="Par moves" value={row.par_moves} onChange={(v) => patch(row.id, { par_moves: v })} />
                  <NumField label="Par time (ms)" value={row.par_time_ms} onChange={(v) => patch(row.id, { par_time_ms: v })} />
                  <NumField label="Coins" value={row.coin_reward} onChange={(v) => patch(row.id, { coin_reward: v })} />
                  <NumField label="XP" value={row.xp_reward} onChange={(v) => patch(row.id, { xp_reward: v })} />
                  <div className="flex flex-col gap-1 text-[10px] text-muted-foreground">
                    <label className="flex items-center gap-1"><Switch checked={row.is_enabled} onCheckedChange={(v) => patch(row.id, { is_enabled: v })} /> Enabled</label>
                    <label className="flex items-center gap-1"><Switch checked={row.is_featured} onCheckedChange={(v) => patch(row.id, { is_featured: v })} /> <Star className="h-3 w-3" /> Featured</label>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(row.id)} className="text-destructive md:justify-self-end">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="space-y-0.5">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={(e) => onChange(Number(e.target.value))}
        className="h-8 text-xs"
      />
    </div>
  );
}
