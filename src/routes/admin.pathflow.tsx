import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Plus, Save, Trash2, Upload } from "lucide-react";
import { Piece } from "@/components/games/rooms/path-flow/Piece";
import type { Level, PieceDef } from "@/components/games/rooms/path-flow/logic";

export const Route = createFileRoute("/admin/pathflow")({ component: PathFlowAdmin });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

interface Row extends Level { enabled: boolean; featured: boolean; version: number }

const DIFFICULTIES = ["easy", "normal", "hard", "expert", "master"] as const;

function emptyLevel(number: number): Row {
  const layout = {
    pieces: [
      { id: "p1", cells: [{ r: 0, c: 0, dir: "R" }, { r: 0, c: 1, dir: "R" }], startR: 0, startC: 0 } as PieceDef,
      { id: "p2", cells: [{ r: 0, c: 0, dir: "D" }, { r: 1, c: 0, dir: "D" }], startR: 3, startC: 4 } as PieceDef,
    ],
  };
  const solution = { pieces: [{ id: "p1", r: 2, c: 1 }, { id: "p2", r: 2, c: 3 }] };
  return {
    id: "", number, difficulty: "easy",
    grid_w: 5, grid_h: 5, layout, solution,
    par_moves: 4, par_time: 30, coin_reward: 5, xp_reward: 10,
    enabled: true, featured: false, version: 1,
  };
}

function PathFlowAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [json, setJson] = useState("");

  async function reload() {
    setLoading(true);
    const { data, error } = await sb.from("pathflow_levels").select("*").order("number", { ascending: true });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setRows((data ?? []) as Row[]);
  }

  useEffect(() => { void reload(); }, []);

  useEffect(() => {
    if (editing) setJson(JSON.stringify({ layout: editing.layout, solution: editing.solution }, null, 2));
  }, [editing?.id, editing?.number]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    if (!editing) return;
    let parsed: { layout: Level["layout"]; solution: Level["solution"] };
    try { parsed = JSON.parse(json); }
    catch { toast.error("Invalid JSON"); return; }
    const payload = {
      number: editing.number,
      difficulty: editing.difficulty,
      grid_w: editing.grid_w,
      grid_h: editing.grid_h,
      layout: parsed.layout,
      solution: parsed.solution,
      par_moves: editing.par_moves,
      par_time: editing.par_time,
      coin_reward: editing.coin_reward,
      xp_reward: editing.xp_reward,
      enabled: editing.enabled,
      featured: editing.featured,
      version: editing.version,
    };
    const q = editing.id
      ? sb.from("pathflow_levels").update(payload).eq("id", editing.id)
      : sb.from("pathflow_levels").insert(payload);
    const { error } = await q;
    if (error) { toast.error(error.message); return; }
    toast.success("Level saved");
    setEditing(null);
    await reload();
  }

  async function remove(id: string) {
    if (!confirm("Delete this level?")) return;
    const { error } = await sb.from("pathflow_levels").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    await reload();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "pathflow-levels.json"; a.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File) {
    const text = await file.text();
    let arr: Row[] = [];
    try { arr = JSON.parse(text); } catch { toast.error("Invalid JSON"); return; }
    for (const r of arr) {
      const { error } = await sb.from("pathflow_levels").upsert({
        number: r.number, difficulty: r.difficulty, grid_w: r.grid_w, grid_h: r.grid_h,
        layout: r.layout, solution: r.solution, par_moves: r.par_moves, par_time: r.par_time,
        coin_reward: r.coin_reward, xp_reward: r.xp_reward,
        enabled: r.enabled ?? true, featured: r.featured ?? false, version: r.version ?? 1,
      }, { onConflict: "number" });
      if (error) { toast.error(error.message); return; }
    }
    toast.success(`Imported ${arr.length} levels`);
    await reload();
  }

  const preview = useMemo(() => {
    if (!editing) return null;
    try {
      const parsed = JSON.parse(json) as { layout: Level["layout"] };
      return parsed.layout?.pieces ?? [];
    } catch { return null; }
  }, [json, editing]);

  return (
    <div className="p-4 sm:p-6">
      <AdminPageHeader
        title="Path Flow"
        description="Manage levels, rewards, hints and daily challenges."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportJson}>
              <Download className="mr-1.5 h-4 w-4" /> Export JSON
            </Button>
            <label className="inline-flex">
              <input type="file" accept="application/json" hidden
                onChange={e => e.target.files?.[0] && importJson(e.target.files[0])} />
              <Button asChild variant="outline" size="sm"><span><Upload className="mr-1.5 h-4 w-4" /> Import</span></Button>
            </label>
            <Button size="sm" onClick={() => setEditing(emptyLevel((rows.at(-1)?.number ?? 0) + 1))}>
              <Plus className="mr-1.5 h-4 w-4" /> New level
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No levels yet — create the first one.</div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map(r => (
                <li key={r.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Level {r.number}</span>
                      <Badge variant="secondary" className="capitalize">{r.difficulty}</Badge>
                      {r.featured && <Badge className="bg-primary/20 text-primary">Featured</Badge>}
                      {!r.enabled && <Badge variant="outline">Disabled</Badge>}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {r.grid_w}×{r.grid_h} · {r.layout.pieces.length} pieces · par {r.par_moves}m / {r.par_time}s · {r.coin_reward}c, {r.xp_reward}xp
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(r.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3" onClick={() => setEditing(null)}>
          <div className="w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-card p-5 max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <h2 className="mb-3 text-lg font-semibold">{editing.id ? `Edit Level ${editing.number}` : "New Level"}</h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Number"><Input type="number" value={editing.number}
                onChange={e => setEditing({ ...editing, number: Number(e.target.value) || 0 })} /></Field>
              <Field label="Difficulty">
                <Select value={editing.difficulty} onValueChange={v => setEditing({ ...editing, difficulty: v as Level["difficulty"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Grid W"><Input type="number" value={editing.grid_w}
                onChange={e => setEditing({ ...editing, grid_w: Number(e.target.value) || 5 })} /></Field>
              <Field label="Grid H"><Input type="number" value={editing.grid_h}
                onChange={e => setEditing({ ...editing, grid_h: Number(e.target.value) || 5 })} /></Field>
              <Field label="Par moves"><Input type="number" value={editing.par_moves}
                onChange={e => setEditing({ ...editing, par_moves: Number(e.target.value) || 0 })} /></Field>
              <Field label="Par time (s)"><Input type="number" value={editing.par_time}
                onChange={e => setEditing({ ...editing, par_time: Number(e.target.value) || 0 })} /></Field>
              <Field label="Coins"><Input type="number" value={editing.coin_reward}
                onChange={e => setEditing({ ...editing, coin_reward: Number(e.target.value) || 0 })} /></Field>
              <Field label="XP"><Input type="number" value={editing.xp_reward}
                onChange={e => setEditing({ ...editing, xp_reward: Number(e.target.value) || 0 })} /></Field>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <Switch checked={editing.enabled} onCheckedChange={v => setEditing({ ...editing, enabled: v })} /> Enabled
              </label>
              <label className="flex items-center gap-2">
                <Switch checked={editing.featured} onCheckedChange={v => setEditing({ ...editing, featured: v })} /> Featured (daily pool)
              </label>
            </div>

            <div className="mt-4">
              <Label>Layout & Solution (JSON)</Label>
              <Textarea value={json} onChange={e => setJson(e.target.value)} className="mt-1 h-56 font-mono text-xs" />
              <p className="mt-1 text-xs text-muted-foreground">
                <code>{`{"layout":{"pieces":[{"id":"p1","cells":[{"r":0,"c":0,"dir":"R"}],"startR":0,"startC":0}]},"solution":{"pieces":[{"id":"p1","r":2,"c":0}]}}`}</code>
              </p>
            </div>

            {preview && preview.length > 0 && (
              <div className="mt-3 rounded-lg border border-border bg-background/50 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</div>
                <div className="flex flex-wrap gap-3">
                  {preview.map(p => <Piece key={p.id} piece={p} cellSize={28} />)}
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}><Save className="mr-1.5 h-4 w-4" /> Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
