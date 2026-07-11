import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Plus, Trash2, Edit, Trophy, Users, Vote, Award, Pin, Star, Settings as SettingsIcon } from "lucide-react";
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
import { useMyRoles } from "@/lib/use-my-role";


export const Route = createFileRoute("/admin/competitions")({
  component: AdminCompetitions,
});

const empty = () => ({
  name: "", slug: "", description: "", rules: "", banner_url: "",
  category_id: null as string | null,
  start_at: new Date().toISOString().slice(0, 16),
  end_at: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16),
  max_participants: null as number | null,
  winner_count: 1,
  status: "draft" as const,
  allow_vote_change: false,
  show_live_counts: true,
  require_approval: false,
  rewards: { coins: 0, xp: 0, badge: "", premium_days: 0, custom: "" },
  announce_channels: [] as string[],
});

function AdminCompetitions() {
  const list = useServerFn(listCompetitions);
  const cats = useServerFn(listCategories);
  const save = useServerFn(adminSaveCompetition);
  const del = useServerFn(adminDeleteCompetition);
  const finalize = useServerFn(adminFinalizeWinners);
  const getComp = useServerFn(getCompetition);
  const setStatus = useServerFn(adminSetParticipantStatus);
  const qc = useQueryClient();

  const { data = [] } = useQuery({ queryKey: ["competitions"], queryFn: () => list({}) });
  const { data: categories = [] } = useQuery({ queryKey: ["competition-categories"], queryFn: () => cats({}) });
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

  const saveM = useMutation({
    mutationFn: (v: any) => {
      const payload = { ...v };
      // convert datetime-local -> ISO
      payload.start_at = new Date(payload.start_at).toISOString();
      payload.end_at = new Date(payload.end_at).toISOString();
      if (!payload.max_participants) payload.max_participants = null;
      return save({ data: payload });
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["competitions"] }); setEditing(null); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
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

  const { data: manageData } = useQuery({
    queryKey: ["competition-manage", managing],
    queryFn: () => managing ? getComp({ data: { id: managing } }) : Promise.resolve(null),
    enabled: !!managing,
  });
  const statusM = useMutation({
    mutationFn: (v: { participantId: string; status: any }) => setStatus({ data: v }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["competition-manage", managing] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title="Competitions"
        description="Create and manage community voting competitions."
        actions={
          <Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New Competition</Button>
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
              <div className="flex items-center gap-2">
                <span className="font-semibold">{c.name}</span>
                <Badge variant="outline" className="text-xs">{c.status}</Badge>
                {c.category && <Badge variant="secondary" className="text-xs">{c.category.name}</Badge>}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(c.start_at).toLocaleString()} → {new Date(c.end_at).toLocaleString()} · {c.total_participants} joined · {c.total_votes} votes
              </div>
            </div>
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

      {/* Editor */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Competition" : "New Competition"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={editing.category_id ?? ""} onValueChange={(v) => setEditing({ ...editing, category_id: v || null })}>
                  <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                  <SelectContent>
                    {(categories as any[]).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label>Rules</Label><Textarea rows={3} value={editing.rules ?? ""} onChange={(e) => setEditing({ ...editing, rules: e.target.value })} /></div>
              <div><Label>Banner URL</Label><Input value={editing.banner_url ?? ""} onChange={(e) => setEditing({ ...editing, banner_url: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Start</Label><Input type="datetime-local" value={editing.start_at} onChange={(e) => setEditing({ ...editing, start_at: e.target.value })} /></div>
                <div><Label>End</Label><Input type="datetime-local" value={editing.end_at} onChange={(e) => setEditing({ ...editing, end_at: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Max Participants</Label><Input type="number" value={editing.max_participants ?? ""} onChange={(e) => setEditing({ ...editing, max_participants: e.target.value ? Number(e.target.value) : null })} /></div>
                <div><Label>Winners</Label><Input type="number" value={editing.winner_count ?? 1} onChange={(e) => setEditing({ ...editing, winner_count: Number(e.target.value) })} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["draft", "upcoming", "live", "completed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2"><Switch checked={editing.allow_vote_change} onCheckedChange={(v) => setEditing({ ...editing, allow_vote_change: v })} /><Label>Allow vote change</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editing.show_live_counts} onCheckedChange={(v) => setEditing({ ...editing, show_live_counts: v })} /><Label>Show live counts</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editing.require_approval} onCheckedChange={(v) => setEditing({ ...editing, require_approval: v })} /><Label>Require approval</Label></div>
              </div>
              <div className="rounded-xl border p-3">
                <div className="mb-2 text-sm font-semibold">Rewards</div>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div><Label>Coins</Label><Input type="number" value={editing.rewards?.coins ?? 0} onChange={(e) => setEditing({ ...editing, rewards: { ...editing.rewards, coins: Number(e.target.value) } })} /></div>
                  <div><Label>XP</Label><Input type="number" value={editing.rewards?.xp ?? 0} onChange={(e) => setEditing({ ...editing, rewards: { ...editing.rewards, xp: Number(e.target.value) } })} /></div>
                  <div><Label>Premium days</Label><Input type="number" value={editing.rewards?.premium_days ?? 0} onChange={(e) => setEditing({ ...editing, rewards: { ...editing.rewards, premium_days: Number(e.target.value) } })} /></div>
                  <div><Label>Badge label</Label><Input value={editing.rewards?.badge ?? ""} onChange={(e) => setEditing({ ...editing, rewards: { ...editing.rewards, badge: e.target.value } })} /></div>
                </div>
                <div className="mt-2"><Label>Custom reward</Label><Input value={editing.rewards?.custom ?? ""} onChange={(e) => setEditing({ ...editing, rewards: { ...editing.rewards, custom: e.target.value } })} /></div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => saveM.mutate(editing)} disabled={saveM.isPending || !editing?.name || !editing?.slug}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage participants */}
      <Dialog open={!!managing} onOpenChange={(o) => !o && setManaging(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Manage participants — {manageData?.competition?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            {(manageData?.participants ?? []).map((p: any) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border p-2">
                <div className="flex-1 truncate">
                  <div className="font-medium">{p.profile?.username ?? p.user_id}</div>
                  <div className="text-xs text-muted-foreground">{p.vote_count} votes · {p.status}</div>
                </div>
                <Select value={p.status} onValueChange={(v) => statusM.mutate({ participantId: p.id, status: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pending", "approved", "removed", "disqualified"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            {(manageData?.participants ?? []).length === 0 && <p className="text-sm text-muted-foreground">No participants.</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
