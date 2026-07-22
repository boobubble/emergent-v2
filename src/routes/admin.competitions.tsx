import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Trash2, Edit, Trophy, Users, Vote, Award, Pin, Star } from "lucide-react";
import { toast } from "sonner";
import {
  listCompetitions, listCategories, adminSaveCompetition, adminDeleteCompetition,
  adminFinalizeWinners, adminListAllCompetitions, adminBulkSetEntryMode,
  adminDeleteCategory,
} from "@/lib/competitions.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompetitionEditorDialog, emptyCompetition } from "@/components/competitions/CompetitionEditorDialog";
import { CategoryEditorDialog, emptyCategory } from "@/components/competitions/CategoryEditorDialog";
import { AdminCompetitionManageDialog } from "@/components/competitions/AdminCompetitionManageDialog";
import { CompetitionAnalyticsPanel } from "./admin.competition-analytics";
import { CompetitionsFeedPanel } from "./admin.competitions-feed";

export const Route = createFileRoute("/admin/competitions")({
  component: AdminCompetitionsPage,
});

const TABS = ["Competitions", "Categories", "Feed", "Analytics"] as const;
type Tab = typeof TABS[number];

function AdminCompetitionsPage() {
  const [tab, setTab] = useState<Tab>("Competitions");
  return (
    <div className="p-6">
      <div className="mb-4 flex gap-1 rounded-xl border border-border/60 bg-card p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${tab === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Competitions" && <AdminCompetitions />}
      {tab === "Categories" && <CategoriesPanel />}
      {tab === "Feed" && <CompetitionsFeedPanel />}
      {tab === "Analytics" && <CompetitionAnalyticsPanel />}
    </div>
  );
}

function CategoriesPanel() {
  const cats = useServerFn(listCategories);
  const delCat = useServerFn(adminDeleteCategory);
  const qc = useQueryClient();
  const { data: categoryList = [] } = useQuery({ queryKey: ["competition-categories"], queryFn: () => cats({}) });
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const delCatM = useMutation({
    mutationFn: (id: string) => delCat({ data: { id } }),
    onSuccess: () => { toast.success("Category deleted"); qc.invalidateQueries({ queryKey: ["competition-categories"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Competition Categories"
        description="Set default minimum engagement thresholds for Smart / Hybrid qualification per category."
        actions={<Button size="sm" onClick={() => setEditingCat(emptyCategory())}><Plus className="h-4 w-4" /> New Category</Button>}
      />
      <div className="space-y-2">
        {(categoryList as any[]).map((cat) => {
          const thr = cat.default_qualification_config?.thresholds ?? {};
          const set = Object.entries(thr).filter(([, v]) => (v as number) > 0);
          return (
            <Card key={cat.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full" style={{ background: cat.color ?? "#8b5cf6" }} />
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">/{cat.slug}</span>
                  {cat.enabled === false && <Badge variant="destructive" className="text-xs">Disabled</Badge>}
                </div>
                <div className="flex-1 text-xs text-muted-foreground">
                  {set.length === 0 ? "No default thresholds" : set.map(([k, v]) => `${k}: ${v}`).join(" · ")}
                </div>
                <Button size="icon" variant="ghost" onClick={() => setEditingCat({ ...cat, default_qualification_config: cat.default_qualification_config ?? { thresholds: {}, gates: {} } })}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => confirm(`Delete category "${cat.name}"?`) && delCatM.mutate(cat.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {(categoryList as any[]).length === 0 && <div className="text-xs text-muted-foreground">No categories yet.</div>}
      </div>
      <CategoryEditorDialog value={editingCat} onChange={setEditingCat} />
    </div>
  );
}

function AdminCompetitions() {
  const listAdmin = useServerFn(adminListAllCompetitions);
  const listPublic = useServerFn(listCompetitions);
  const cats = useServerFn(listCategories);
  const save = useServerFn(adminSaveCompetition);
  const del = useServerFn(adminDeleteCompetition);
  const finalize = useServerFn(adminFinalizeWinners);
  const bulkMode = useServerFn(adminBulkSetEntryMode);
  const delCat = useServerFn(adminDeleteCategory);
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["competitions", "admin"],
    queryFn: async () => {
      try { return await listAdmin({}); } catch { return await listPublic({}); }
    },
  });
  const { data: categoryList = [] } = useQuery({ queryKey: ["competition-categories"], queryFn: () => cats({}) });

  const [editing, setEditing] = useState<any | null>(null);
  const [editingCat, setEditingCat] = useState<any | null>(null);
  const [managing, setManaging] = useState<string | null>(null);
  const [bulkCategory, setBulkCategory] = useState<string>("all");
  const [bulkOnlyManual, setBulkOnlyManual] = useState<boolean>(true);

  const delCatM = useMutation({
    mutationFn: (id: string) => delCat({ data: { id } }),
    onSuccess: () => { toast.success("Category deleted"); qc.invalidateQueries({ queryKey: ["competition-categories"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const bulkM = useMutation({
    mutationFn: () => bulkMode({ data: {
      entry_mode: "hybrid",
      qualification_method: "top_n_week",
      category_id: bulkCategory === "all" ? null : bulkCategory,
      only_manual: bulkOnlyManual,
    } }),
    onSuccess: (r: any) => { toast.success(`Set ${r?.updated ?? 0} competition(s) to Hybrid`); qc.invalidateQueries({ queryKey: ["competitions"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const stats = useMemo(() => {
    const arr = data as any[];
    return {
      total: arr.length,
      live: arr.filter((c) => c.status === "live").length,
      participants: arr.reduce((s, c) => s + (c.total_participants ?? 0), 0),
      votes: arr.reduce((s, c) => s + (c.total_votes ?? 0), 0),
    };
  }, [data]);

  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["competitions"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const finalizeM = useMutation({
    mutationFn: (id: string) => finalize({ data: { competitionId: id } }),
    onSuccess: () => { toast.success("Winners announced"); qc.invalidateQueries({ queryKey: ["competitions"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const quickFlagM = useMutation({
    mutationFn: (v: { id: string; patch: Record<string, any> }) =>
      save({ data: { ...(data as any[]).find((c) => c.id === v.id), ...v.patch } as any }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["competitions"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Competitions"
        description="Create and manage community voting competitions."
        actions={
          <Button onClick={() => setEditing(emptyCompetition())}><Plus className="h-4 w-4" /> New Competition</Button>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total", value: stats.total, icon: Trophy },
          { label: "Live", value: stats.live, icon: Award },
          { label: "Participants", value: stats.participants, icon: Users },
          { label: "Votes", value: stats.votes, icon: Vote },
        ].map((s) => (
          <Card key={s.label}><CardContent className="flex items-center gap-3 p-4">
            <s.icon className="h-5 w-5 text-primary" />
            <div><div className="text-xs text-muted-foreground">{s.label}</div><div className="text-xl font-bold">{s.value}</div></div>
          </CardContent></Card>
        ))}
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="flex-1 min-w-[220px]">
            <div className="text-sm font-semibold">Bulk: Set to Hybrid (Top-N per week)</div>
            <div className="text-xs text-muted-foreground">Applies Hybrid entry mode. Admins can still switch any competition back to Manual later.</div>
          </div>
          <select
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={bulkCategory}
            onChange={(e) => setBulkCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {(categoryList as any[]).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            <input type="checkbox" checked={bulkOnlyManual} onChange={(e) => setBulkOnlyManual(e.target.checked)} />
            Only currently Manual
          </label>
          <Button
            size="sm"
            disabled={bulkM.isPending}
            onClick={() => {
              const scope = bulkCategory === "all" ? "ALL competitions" : "competitions in this category";
              const filter = bulkOnlyManual ? " currently set to Manual" : "";
              if (confirm(`Set ${scope}${filter} to Hybrid?`)) bulkM.mutate();
            }}
          >
            {bulkM.isPending ? "Applying…" : "Apply Hybrid"}
          </Button>
        </CardContent>
      </Card>





      <div className="space-y-2">
        {(data as any[]).map((c) => (
          <Card key={c.id}><CardContent className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{c.name}</span>
                <Badge variant="outline" className="text-xs">{c.status}</Badge>
                {c.category && <Badge variant="secondary" className="text-xs">{c.category.name}</Badge>}
                {c.is_featured && <Badge className="bg-amber-500/20 text-amber-300 text-xs"><Star className="mr-1 h-3 w-3" />Featured</Badge>}
                {c.is_pinned && <Badge className="bg-sky-500/20 text-sky-300 text-xs"><Pin className="mr-1 h-3 w-3" />Pinned</Badge>}
                {c.is_published === false && <Badge variant="destructive" className="text-xs">Unpublished</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(c.start_at).toLocaleString()} → {new Date(c.end_at).toLocaleString()} · {c.total_participants} joined · {c.total_votes} votes
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              title={c.is_featured ? "Unfeature" : "Feature"}
              onClick={() => quickFlagM.mutate({ id: c.id, patch: { is_featured: !c.is_featured } })}
            >
              <Star className={`h-4 w-4 ${c.is_featured ? "text-amber-400" : ""}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              title={c.is_pinned ? "Unpin" : "Pin"}
              onClick={() => quickFlagM.mutate({ id: c.id, patch: { is_pinned: !c.is_pinned } })}
            >
              <Pin className={`h-4 w-4 ${c.is_pinned ? "text-sky-400" : ""}`} />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setManaging(c.id)}>Manage</Button>
            {c.status !== "completed" && (
              <Button size="sm" variant="secondary" onClick={() => confirm("Finalize winners now?") && finalizeM.mutate(c.id)}>Finalize</Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => setEditing({
              ...c,
              start_at: new Date(c.start_at).toISOString().slice(0, 16),
              end_at: new Date(c.end_at).toISOString().slice(0, 16),
              rewards: c.rewards ?? {},
            })}><Edit className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => confirm(`Delete "${c.name}"?`) && delM.mutate(c.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardContent></Card>
        ))}
      </div>

      <CompetitionEditorDialog
        value={editing}
        onChange={setEditing}
        invalidateKeys={[["competitions", "admin"], ["competitions"]]}
        onSaved={({ id, isNew }) => { if (isNew) setManaging(id); }}
      />

      <AdminCompetitionManageDialog
        competitionId={managing}
        onClose={() => setManaging(null)}
      />

      <CategoryEditorDialog value={editingCat} onChange={setEditingCat} />
    </div>
  );
}
