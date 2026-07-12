import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Trash2, Edit, Trophy, Users, Vote, Award, Pin, Star } from "lucide-react";
import { toast } from "sonner";
import {
  listCompetitions, listCategories, adminSaveCompetition, adminDeleteCompetition,
  adminFinalizeWinners, adminListAllCompetitions,
} from "@/lib/competitions.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompetitionEditorDialog, emptyCompetition } from "@/components/competitions/CompetitionEditorDialog";
import { AdminCompetitionManageDialog } from "@/components/competitions/AdminCompetitionManageDialog";

export const Route = createFileRoute("/admin/competitions")({
  component: AdminCompetitions,
});

function AdminCompetitions() {
  const listAdmin = useServerFn(adminListAllCompetitions);
  const listPublic = useServerFn(listCompetitions);
  const cats = useServerFn(listCategories);
  const save = useServerFn(adminSaveCompetition);
  const del = useServerFn(adminDeleteCompetition);
  const finalize = useServerFn(adminFinalizeWinners);
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["competitions", "admin"],
    queryFn: async () => {
      try { return await listAdmin({}); } catch { return await listPublic({}); }
    },
  });
  useQuery({ queryKey: ["competition-categories"], queryFn: () => cats({}) });

  const [editing, setEditing] = useState<any | null>(null);
  const [managing, setManaging] = useState<string | null>(null);

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
    <div className="space-y-6 p-6">
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
    </div>
  );
}
