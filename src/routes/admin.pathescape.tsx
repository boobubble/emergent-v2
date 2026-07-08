import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, Trash2, Edit, Compass, Star, CheckCircle2, XCircle, Upload, Download, Play, Zap } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  adminListLevels, adminSaveLevel, adminDeleteLevel, adminBulkSetEnabled,
  adminValidateLevel, adminLevelStats,
} from "@/lib/pathescape.functions";
import type { Dir } from "@/lib/pathescape-solver";

export const Route = createFileRoute("/admin/pathescape")({
  component: AdminPathEscape,
});

const DIFFICULTIES = ["easy", "normal", "hard", "expert", "master", "nightmare"] as const;

type EditingLevel = {
  id?: string;
  number: number;
  name: string;
  difficulty: typeof DIFFICULTIES[number];
  grid_w: number;
  grid_h: number;
  pieces: Array<{ id: string; r: number; c: number; dir: Dir }>; // 1-cell pieces (MVP)
  solution: Array<{ id: string; r: number; c: number }>;
  par_moves: number;
  par_time: number;
  coin_reward: number;
  xp_reward: number;
  lives: number;
  enabled: boolean;
  featured: boolean;
  admin_notes: string;
};

const blankLevel = (nextNumber: number): EditingLevel => ({
  number: nextNumber,
  name: `Level ${nextNumber}`,
  difficulty: "easy",
  grid_w: 5,
  grid_h: 5,
  pieces: [],
  solution: [],
  par_moves: 6,
  par_time: 60,
  coin_reward: 10,
  xp_reward: 20,
  lives: 3,
  enabled: true,
  featured: false,
  admin_notes: "",
});

function levelToPayload(l: EditingLevel) {
  return {
    grid_w: l.grid_w,
    grid_h: l.grid_h,
    layout: {
      pieces: l.pieces.map(p => ({
        id: p.id,
        startR: p.r,
        startC: p.c,
        cells: [{ r: 0, c: 0, dir: p.dir }],
      })),
    },
    solution: {
      pieces: l.solution.map(s => ({ id: s.id, r: s.r, c: s.c })),
    },
  };
}

function rowToEditing(row: any): EditingLevel {
  const pieces = (row.layout?.pieces ?? []).map((p: any) => ({
    id: p.id,
    r: p.startR,
    c: p.startC,
    dir: (p.cells?.[0]?.dir ?? "R") as Dir,
  }));
  const solution = (row.solution?.pieces ?? []).map((s: any) => ({ id: s.id, r: s.r, c: s.c }));
  return {
    id: row.id,
    number: row.number,
    name: row.name,
    difficulty: row.difficulty,
    grid_w: row.grid_w,
    grid_h: row.grid_h,
    pieces,
    solution,
    par_moves: row.par_moves,
    par_time: row.par_time,
    coin_reward: row.coin_reward,
    xp_reward: row.xp_reward,
    lives: row.lives,
    enabled: row.enabled,
    featured: row.featured,
    admin_notes: row.admin_notes ?? "",
  };
}

function AdminPathEscape() {
  const listFn = useServerFn(adminListLevels);
  const saveFn = useServerFn(adminSaveLevel);
  const delFn = useServerFn(adminDeleteLevel);
  const bulkFn = useServerFn(adminBulkSetEnabled);
  const validateFn = useServerFn(adminValidateLevel);
  const statsFn = useServerFn(adminLevelStats);
  const qc = useQueryClient();

  const { data: levels = [] } = useQuery({ queryKey: ["pe-admin-levels"], queryFn: () => listFn({}) });
  const { data: stats = {} } = useQuery({ queryKey: ["pe-admin-stats"], queryFn: () => statsFn({}) });
  const [editing, setEditing] = useState<EditingLevel | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const nextNumber = useMemo(() => {
    const arr = levels as any[];
    return arr.length ? Math.max(...arr.map(l => l.number)) + 1 : 1;
  }, [levels]);

  const filtered = useMemo(() => {
    const arr = levels as any[];
    if (filter === "all") return arr;
    if (filter === "enabled") return arr.filter(l => l.enabled);
    if (filter === "disabled") return arr.filter(l => !l.enabled);
    return arr.filter(l => l.difficulty === filter);
  }, [levels, filter]);

  const summary = useMemo(() => {
    const arr = levels as any[];
    return {
      total: arr.length,
      enabled: arr.filter(l => l.enabled).length,
      featured: arr.filter(l => l.featured).length,
    };
  }, [levels]);

  const saveM = useMutation({
    mutationFn: (v: EditingLevel & { skip_validate?: boolean }) => {
      const payload = levelToPayload(v);
      return saveFn({
        data: {
          id: v.id,
          number: v.number,
          name: v.name,
          difficulty: v.difficulty,
          grid_w: v.grid_w,
          grid_h: v.grid_h,
          layout: payload.layout,
          solution: payload.solution,
          par_moves: v.par_moves,
          par_time: v.par_time,
          coin_reward: v.coin_reward,
          xp_reward: v.xp_reward,
          lives: v.lives,
          enabled: v.enabled,
          featured: v.featured,
          admin_notes: v.admin_notes || null,
          skip_validate: v.skip_validate,
        },
      });
    },
    onSuccess: () => { toast.success("Level saved"); qc.invalidateQueries({ queryKey: ["pe-admin-levels"] }); setEditing(null); },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["pe-admin-levels"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const bulkM = useMutation({
    mutationFn: (v: { ids: string[]; enabled: boolean }) => bulkFn({ data: v }),
    onSuccess: () => { toast.success("Updated"); setSelected(new Set()); qc.invalidateQueries({ queryKey: ["pe-admin-levels"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(levels, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pathescape-levels-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const text = await file.text();
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error("Expected an array of levels");
      for (const row of arr) {
        const e = rowToEditing({ ...row, id: undefined });
        // eslint-disable-next-line no-await-in-loop
        await saveM.mutateAsync({ ...e, skip_validate: false });
      }
      toast.success(`Imported ${arr.length} levels`);
    } catch (e: any) {
      toast.error(e?.message ?? "Import failed");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title="Path Escape — Levels"
        description="Design, validate and publish levels for the Path Escape puzzle game."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportJson}><Download className="mr-1 h-4 w-4" /> Export</Button>
            <label className="cursor-pointer">
              <input type="file" accept="application/json" hidden onChange={e => e.target.files?.[0] && importJson(e.target.files[0])} />
              <Button variant="outline" asChild><span><Upload className="mr-1 h-4 w-4" /> Import</span></Button>
            </label>
            <Button onClick={() => setEditing(blankLevel(nextNumber))}>
              <Plus className="mr-1 h-4 w-4" /> New Level
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total", value: summary.total, icon: Compass },
          { label: "Enabled", value: summary.enabled, icon: CheckCircle2 },
          { label: "Featured", value: summary.featured, icon: Star },
          { label: "Next #", value: nextNumber, icon: Zap },
        ].map(s => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <s.icon className="h-5 w-5 text-primary" />
            <div><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-xl font-bold">{s.value}</div></div>
          </CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="levels">
        <TabsList>
          <TabsTrigger value="levels">Levels</TabsTrigger>
          <TabsTrigger value="schedule">Daily / Weekly</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
                {DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            {selected.size > 0 && (
              <>
                <Badge variant="secondary">{selected.size} selected</Badge>
                <Button size="sm" variant="outline" onClick={() => bulkM.mutate({ ids: [...selected], enabled: true })}>Enable</Button>
                <Button size="sm" variant="outline" onClick={() => bulkM.mutate({ ids: [...selected], enabled: false })}>Disable</Button>
              </>
            )}
          </div>

          <div className="space-y-2">
            {filtered.map((l: any) => {
              const st = (stats as any)[l.id];
              return (
                <Card key={l.id}>
                  <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    <input
                      type="checkbox"
                      checked={selected.has(l.id)}
                      onChange={e => {
                        const s = new Set(selected);
                        if (e.target.checked) s.add(l.id); else s.delete(l.id);
                        setSelected(s);
                      }}
                    />
                    <div className="min-w-[220px] flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">#{l.number} · {l.name}</span>
                        <Badge variant="outline" className="text-xs">{l.difficulty}</Badge>
                        <Badge variant={l.enabled ? "default" : "secondary"} className="text-xs">
                          {l.enabled ? "enabled" : "disabled"}
                        </Badge>
                        {l.featured && <Badge className="text-xs">featured</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {l.grid_w}×{l.grid_h} · {(l.layout?.pieces?.length ?? 0)} pieces · par {l.par_moves} moves / {l.par_time}s
                        {st && ` · ${st.plays} plays · avg ★${st.avgStars.toFixed(1)}`}
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(rowToEditing(l))}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => confirm(`Delete "${l.name}"?`) && delM.mutate(l.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No levels match this filter.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <ScheduleTab levels={levels as any[]} />
        </TabsContent>



        <TabsContent value="analytics" className="space-y-2">
          {(levels as any[]).map((l: any) => {
            const st = (stats as any)[l.id];
            return (
              <Card key={l.id}><CardContent className="flex items-center justify-between p-3 text-sm">
                <div>#{l.number} · {l.name}</div>
                <div className="text-muted-foreground">
                  {st ? `${st.plays} plays · avg ★${st.avgStars.toFixed(2)} · best ${st.bestMoves}m / ${(st.bestTime / 1000).toFixed(1)}s` : "no plays yet"}
                </div>
              </CardContent></Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {editing && (
        <LevelEditor
          value={editing}
          onCancel={() => setEditing(null)}
          onSave={(v, skip) => saveM.mutate({ ...v, skip_validate: skip })}
          validate={async (v) => validateFn({ data: levelToPayload(v) })}
        />
      )}
    </div>
  );
}

// ---------- Visual Level Editor ----------
type Tool = { kind: "piece"; dir: Dir } | { kind: "target" } | { kind: "erase" };
const DIR_ARROW: Record<Dir, string> = { U: "↑", D: "↓", L: "←", R: "→" };

function LevelEditor({
  value, onCancel, onSave, validate,
}: {
  value: EditingLevel;
  onCancel(): void;
  onSave(v: EditingLevel, skipValidate: boolean): void;
  validate(v: EditingLevel): Promise<{ solvable: boolean; minMoves: number; error?: string }>;
}) {
  const [l, setL] = useState<EditingLevel>(value);
  const [tool, setTool] = useState<Tool>({ kind: "piece", dir: "R" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [validation, setValidation] = useState<{ solvable: boolean; minMoves: number; error?: string } | null>(null);
  const [validating, setValidating] = useState(false);

  const genId = () => {
    const used = new Set(l.pieces.map(p => p.id));
    let i = 1;
    while (used.has(`p${i}`)) i++;
    return `p${i}`;
  };

  const cellClick = (r: number, c: number) => {
    if (tool.kind === "erase") {
      setL(x => ({
        ...x,
        pieces: x.pieces.filter(p => !(p.r === r && p.c === c)),
        solution: x.solution.filter(s => !(s.r === r && s.c === c)),
      }));
      return;
    }
    if (tool.kind === "target") {
      if (!selectedId) { toast.error("Select a piece first (click one below)"); return; }
      setL(x => ({
        ...x,
        solution: [
          ...x.solution.filter(s => s.id !== selectedId),
          { id: selectedId, r, c },
        ],
      }));
      return;
    }
    // place piece
    if (l.pieces.some(p => p.r === r && p.c === c)) {
      toast.error("Cell already has a piece");
      return;
    }
    const id = genId();
    setL(x => ({ ...x, pieces: [...x.pieces, { id, r, c, dir: (tool as any).dir }] }));
    setSelectedId(id);
  };

  const doValidate = async () => {
    setValidating(true);
    try {
      if (l.pieces.length === 0) { setValidation({ solvable: false, minMoves: 0, error: "No pieces placed" }); return; }
      if (l.solution.length !== l.pieces.length) {
        setValidation({ solvable: false, minMoves: 0, error: "Every piece needs a solution target" }); return;
      }
      const res = await validate(l);
      setValidation(res);
      if (res.solvable && res.minMoves > 0) {
        setL(x => ({ ...x, par_moves: Math.max(x.par_moves, res.minMoves) }));
      }
    } catch (e: any) {
      setValidation({ solvable: false, minMoves: 0, error: e?.message ?? "Validation failed" });
    } finally {
      setValidating(false);
    }
  };

  return (
    <Dialog open onOpenChange={o => !o && onCancel()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>{l.id ? `Edit Level #${l.number}` : `New Level #${l.number}`}</DialogTitle></DialogHeader>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          {/* ---- Grid canvas ---- */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {(["U", "R", "D", "L"] as Dir[]).map(d => (
                <Button
                  key={d}
                  size="sm"
                  variant={tool.kind === "piece" && tool.dir === d ? "default" : "outline"}
                  onClick={() => setTool({ kind: "piece", dir: d })}
                >
                  {DIR_ARROW[d]} Piece
                </Button>
              ))}
              <Button
                size="sm"
                variant={tool.kind === "target" ? "default" : "outline"}
                onClick={() => setTool({ kind: "target" })}
              >
                <Star className="mr-1 h-3 w-3" /> Target
              </Button>
              <Button
                size="sm"
                variant={tool.kind === "erase" ? "default" : "outline"}
                onClick={() => setTool({ kind: "erase" })}
              >
                <XCircle className="mr-1 h-3 w-3" /> Erase
              </Button>
            </div>

            <div
              className="grid gap-1 rounded-lg bg-muted/30 p-2"
              style={{ gridTemplateColumns: `repeat(${l.grid_w}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: l.grid_h * l.grid_w }).map((_, i) => {
                const r = Math.floor(i / l.grid_w);
                const c = i % l.grid_w;
                const piece = l.pieces.find(p => p.r === r && p.c === c);
                const target = l.solution.find(s => s.r === r && s.c === c);
                const isSel = piece && piece.id === selectedId;
                return (
                  <button
                    key={i}
                    onClick={() => cellClick(r, c)}
                    className={
                      "relative aspect-square rounded-md border-2 text-lg transition-all " +
                      (piece
                        ? isSel ? "border-primary bg-primary/20" : "border-border bg-card"
                        : target
                          ? "border-dashed border-primary/60 bg-primary/5"
                          : "border-border/40 bg-background hover:bg-muted")
                    }
                  >
                    {piece && (
                      <span className="absolute inset-0 flex items-center justify-center font-bold">
                        {DIR_ARROW[piece.dir]}
                      </span>
                    )}
                    {target && (
                      <span className="absolute right-0.5 top-0.5 text-[9px] font-semibold text-primary">
                        ★{target.id}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {l.pieces.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs">Pieces (click to select for target placement)</Label>
                <div className="flex flex-wrap gap-1">
                  {l.pieces.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedId(p.id); setTool({ kind: "target" }); }}
                      className={
                        "rounded border px-2 py-1 text-xs " +
                        (selectedId === p.id ? "border-primary bg-primary/10" : "border-border")
                      }
                    >
                      {p.id} {DIR_ARROW[p.dir]} ({p.r},{p.c})
                      {l.solution.some(s => s.id === p.id) && <span className="ml-1 text-primary">★</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={doValidate} disabled={validating}>
                <Play className="mr-1 h-3 w-3" /> {validating ? "Solving…" : "Validate"}
              </Button>
              {validation && (
                validation.solvable
                  ? <span className="flex items-center gap-1 text-xs text-emerald-500"><CheckCircle2 className="h-3 w-3" /> Solvable in {validation.minMoves} moves</span>
                  : <span className="flex items-center gap-1 text-xs text-destructive"><XCircle className="h-3 w-3" /> {validation.error ?? "Not solvable"}</span>
              )}
            </div>
          </div>

          {/* ---- Meta panel ---- */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Number</Label><Input type="number" value={l.number} onChange={e => setL({ ...l, number: Number(e.target.value) })} /></div>
              <div>
                <Label>Difficulty</Label>
                <Select value={l.difficulty} onValueChange={(v: any) => setL({ ...l, difficulty: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIFFICULTIES.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Name</Label><Input value={l.name} onChange={e => setL({ ...l, name: e.target.value })} /></div>

            <div className="grid grid-cols-2 gap-2">
              <div><Label>Grid W</Label><Input type="number" min={3} max={12} value={l.grid_w} onChange={e => setL({ ...l, grid_w: Math.max(3, Math.min(12, Number(e.target.value))) })} /></div>
              <div><Label>Grid H</Label><Input type="number" min={3} max={12} value={l.grid_h} onChange={e => setL({ ...l, grid_h: Math.max(3, Math.min(12, Number(e.target.value))) })} /></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div><Label>Par moves</Label><Input type="number" value={l.par_moves} onChange={e => setL({ ...l, par_moves: Number(e.target.value) })} /></div>
              <div><Label>Par time (s)</Label><Input type="number" value={l.par_time} onChange={e => setL({ ...l, par_time: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Coin reward</Label><Input type="number" value={l.coin_reward} onChange={e => setL({ ...l, coin_reward: Number(e.target.value) })} /></div>
              <div><Label>XP reward</Label><Input type="number" value={l.xp_reward} onChange={e => setL({ ...l, xp_reward: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Lives</Label><Input type="number" value={l.lives} onChange={e => setL({ ...l, lives: Number(e.target.value) })} /></div>

            <div className="flex items-center justify-between"><Label>Enabled</Label><Switch checked={l.enabled} onCheckedChange={v => setL({ ...l, enabled: v })} /></div>
            <div className="flex items-center justify-between"><Label>Featured</Label><Switch checked={l.featured} onCheckedChange={v => setL({ ...l, featured: v })} /></div>

            <div><Label>Admin notes</Label><Textarea rows={3} value={l.admin_notes} onChange={e => setL({ ...l, admin_notes: e.target.value })} /></div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="secondary" onClick={() => onSave(l, true)}>Save (skip validation)</Button>
          <Button onClick={() => onSave(l, false)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
