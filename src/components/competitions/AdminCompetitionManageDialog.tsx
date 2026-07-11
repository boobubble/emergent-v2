import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2, RotateCcw, Download, Users, Vote, Eye, Trophy, Crown } from "lucide-react";
import {
  getCompetition,
  adminSetParticipantStatus,
  adminListCompetitorVotes,
  adminDeleteCompetitorVote,
  adminResetCompetitionVotes,
  getCompetitionAnalytics,
  adminSetManualWinners,
  adminFinalizeWinners,
} from "@/lib/competitions.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminCompetitorSortableGrid } from "./AdminCompetitorSortableGrid";
import { CompetitorEditorDialog, emptyCompetitor, type CompetitorDraft } from "./CompetitorEditorDialog";
import type { Competitor } from "./CompetitorGrid";

function downloadCSV(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) { toast.error("Nothing to export"); return; }
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function AdminCompetitionManageDialog({
  competitionId,
  onClose,
}: {
  competitionId: string | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const getComp = useServerFn(getCompetition);
  const setStatus = useServerFn(adminSetParticipantStatus);
  const listVotes = useServerFn(adminListCompetitorVotes);
  const delVote = useServerFn(adminDeleteCompetitorVote);
  const resetAll = useServerFn(adminResetCompetitionVotes);
  const getAnalytics = useServerFn(getCompetitionAnalytics);
  const setWinners = useServerFn(adminSetManualWinners);
  const finalize = useServerFn(adminFinalizeWinners);
  const [voteFilter, setVoteFilter] = useState("");
  const [nomineeDraft, setNomineeDraft] = useState<CompetitorDraft | null>(null);

  const { data: manage } = useQuery({
    queryKey: ["competition-manage", competitionId],
    queryFn: () => (competitionId ? getComp({ data: { id: competitionId } }) : Promise.resolve(null)),
    enabled: !!competitionId,
  });

  const { data: votes = [] } = useQuery({
    queryKey: ["competition-votes", competitionId],
    queryFn: () => (competitionId ? listVotes({ data: { competitionId } }) : Promise.resolve([])),
    enabled: !!competitionId,
  });

  const { data: analytics } = useQuery({
    queryKey: ["competition-analytics", competitionId],
    queryFn: () => (competitionId ? getAnalytics({ data: { competitionId } }) : Promise.resolve(null)),
    enabled: !!competitionId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["competition-manage", competitionId] });
    qc.invalidateQueries({ queryKey: ["competition-votes", competitionId] });
    qc.invalidateQueries({ queryKey: ["competition-analytics", competitionId] });
    qc.invalidateQueries({ queryKey: ["competitions"] });
  };

  const statusM = useMutation({
    mutationFn: (v: { participantId: string; status: any }) => setStatus({ data: v }),
    onSuccess: () => { toast.success("Updated"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const delVoteM = useMutation({
    mutationFn: (voteId: string) => delVote({ data: { voteId } }),
    onSuccess: () => { toast.success("Vote removed"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const resetM = useMutation({
    mutationFn: () => resetAll({ data: { competitionId: competitionId! } }),
    onSuccess: () => { toast.success("All votes reset"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const finalizeM = useMutation({
    mutationFn: () => finalize({ data: { competitionId: competitionId! } }),
    onSuccess: () => { toast.success("Winners announced"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const winnersM = useMutation({
    mutationFn: (winners: Array<{ user_id: string; place: number; badge_label?: string | null }>) =>
      setWinners({ data: { competitionId: competitionId!, winners, markCompleted: true } }),
    onSuccess: () => { toast.success("Winners saved"); invalidate(); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const comp = (manage as any)?.competition;
  const competitors = ((manage as any)?.competitors ?? []) as any[];
  const participants = ((manage as any)?.participants ?? []) as any[];
  const awards = ((manage as any)?.awards ?? []) as any[];

  const filteredVotes = useMemo(() => {
    const q = voteFilter.trim().toLowerCase();
    if (!q) return votes as any[];
    return (votes as any[]).filter((v) =>
      (v.voter?.username ?? v.voter_id ?? "").toLowerCase().includes(q) ||
      (v.competitor?.name ?? "").toLowerCase().includes(q)
    );
  }, [votes, voteFilter]);

  const [manualWinners, setManualWinners] = useState<Record<number, string>>({});
  const setPlace = (place: number, competitorId: string) =>
    setManualWinners((p) => ({ ...p, [place]: competitorId }));

  const submitManual = () => {
    const entries = Object.entries(manualWinners)
      .map(([place, cid]) => {
        const cc = competitors.find((c) => c.id === cid);
        const userId = cc?.linked_user_id;
        if (!userId) return null;
        return { place: Number(place), user_id: userId, badge_label: `${comp?.name} — #${place}` };
      })
      .filter(Boolean) as any[];
    if (entries.length === 0) { toast.error("Pick competitors linked to a user"); return; }
    winnersM.mutate(entries);
  };

  return (
    <Dialog open={!!competitionId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader><DialogTitle>Manage — {comp?.name}</DialogTitle></DialogHeader>

        <Tabs defaultValue="analytics">
          <TabsList className="flex-wrap">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="nominees">Nominees ({competitors.length})</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="votes">Votes ({votes.length})</TabsTrigger>
            <TabsTrigger value="winners">Winners</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Views", value: analytics?.total_views ?? 0, icon: Eye },
                { label: "Participants", value: analytics?.total_participants ?? 0, icon: Users },
                { label: "Competitors", value: analytics?.total_competitors ?? 0, icon: Trophy },
                { label: "Votes", value: analytics?.total_votes ?? 0, icon: Vote },
                { label: "Unique voters", value: analytics?.unique_voters ?? 0, icon: Users },
                {
                  label: "Conversion",
                  value:
                    analytics && (analytics as any).total_views
                      ? `${Math.round(((analytics as any).unique_voters / (analytics as any).total_views) * 100)}%`
                      : "—",
                  icon: Vote,
                },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <s.icon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                      <div className="text-xl font-bold">{s.value}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {(analytics as any)?.leading_competitor_name && (
              <Card className="mt-3">
                <CardContent className="flex items-center gap-3 p-4">
                  <Crown className="h-5 w-5 text-amber-400" />
                  <div>
                    <div className="text-xs text-muted-foreground">Leading competitor</div>
                    <div className="font-semibold">
                      {(analytics as any).leading_competitor_name} · {(analytics as any).leading_competitor_votes ?? 0} votes
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="nominees" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Drag rows to reorder. Featured/pinned nominees surface on the detail page.
              </p>
              <Button
                size="sm"
                onClick={() =>
                  competitionId && setNomineeDraft(emptyCompetitor(competitionId, competitors.length))
                }
              >
                <Plus className="mr-1 h-4 w-4" /> Add nominee
              </Button>
            </div>
            {competitionId && (
              <AdminCompetitorSortableGrid
                competitionId={competitionId}
                competitors={competitors as Competitor[]}
                onEdit={(c) => setNomineeDraft({ ...(c as unknown as CompetitorDraft) })}
                invalidateKey={["competition-manage", competitionId]}
              />
            )}
          </TabsContent>

          <TabsContent value="participants" className="mt-4 space-y-2">

            {participants.length === 0 && <p className="text-sm text-muted-foreground">No participants yet.</p>}
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border p-2">
                <div className="flex-1 truncate">
                  <div className="font-medium">{p.profile?.username ?? p.user_id}</div>
                  <div className="text-xs text-muted-foreground">{p.vote_count} votes · {p.status}</div>
                </div>
                <Select value={p.status} onValueChange={(v) => statusM.mutate({ participantId: p.id, status: v })}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pending", "approved", "removed", "disqualified"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="votes" className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                placeholder="Search voter or competitor…"
                value={voteFilter}
                onChange={(e) => setVoteFilter(e.target.value)}
                className="max-w-sm"
              />
              <Button
                size="sm"
                variant="destructive"
                onClick={() => confirm("Reset ALL votes on this competition?") && resetM.mutate()}
              >
                <RotateCcw className="mr-1 h-4 w-4" /> Reset all votes
              </Button>
            </div>
            <div className="rounded-xl border">
              <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 border-b bg-white/5 p-2 text-xs font-semibold text-muted-foreground">
                <div>Voter</div><div>Competitor</div><div>When</div><div></div>
              </div>
              {filteredVotes.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">No votes match.</div>
              )}
              {filteredVotes.map((v: any) => (
                <div key={v.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2 border-b p-2 text-sm">
                  <div className="truncate">{v.voter?.username ?? v.voter_id.slice(0, 8)}</div>
                  <div className="truncate">{v.competitor?.name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => confirm("Remove this vote?") && delVoteM.mutate(v.id)}
                    aria-label="Delete vote"
                  >
                    <Trash2 className="h-4 w-4 text-rose-400" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="winners" className="mt-4 space-y-4">
            <div className="rounded-xl border p-3">
              <div className="mb-2 text-sm font-semibold">Automatic (top by participant votes)</div>
              <Button size="sm" variant="secondary" onClick={() => finalizeM.mutate()} disabled={finalizeM.isPending}>
                <Crown className="mr-1 h-4 w-4" /> Finalize automatically
              </Button>
            </div>
            <div className="rounded-xl border p-3">
              <div className="mb-2 text-sm font-semibold">Manual winners</div>
              <p className="mb-3 text-xs text-muted-foreground">
                Pick a competitor for each place. Only competitors linked to a user account can be awarded.
              </p>
              <div className="space-y-2">
                {[1, 2, 3].slice(0, comp?.winner_count ?? 1).map((place) => (
                  <div key={place} className="flex items-center gap-2">
                    <Badge variant="outline" className="w-14 justify-center">#{place}</Badge>
                    <Select
                      value={manualWinners[place] ?? ""}
                      onValueChange={(v) => setPlace(place, v)}
                    >
                      <SelectTrigger className="flex-1"><SelectValue placeholder="Choose competitor" /></SelectTrigger>
                      <SelectContent>
                        {competitors.map((c) => (
                          <SelectItem key={c.id} value={c.id} disabled={!c.linked_user_id}>
                            {c.name}{c.linked_user_id ? "" : " (no linked user)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Button size="sm" onClick={submitManual} disabled={winnersM.isPending}>
                  Save winners & mark completed
                </Button>
              </div>
            </div>
            {awards.length > 0 && (
              <div className="rounded-xl border p-3">
                <div className="mb-2 text-sm font-semibold">Current winners</div>
                {awards.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2 text-sm">
                    <Badge>#{a.place}</Badge>
                    <span>{a.profile?.username ?? a.user_id.slice(0, 8)}</span>
                    {a.badge_label && <span className="text-xs text-muted-foreground">· {a.badge_label}</span>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Download CSV files. Open in Excel or Google Sheets.
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              <Button
                variant="outline"
                onClick={() =>
                  downloadCSV(`${comp?.slug}-competitors.csv`,
                    competitors.map((c) => ({
                      id: c.id, name: c.name, votes: c.vote_count,
                      hidden: c.is_hidden ? "yes" : "no",
                      disqualified: c.is_disqualified ? "yes" : "no",
                      linked_user: c.linked_profile?.username ?? "",
                    })))
                }
              >
                <Download className="mr-1 h-4 w-4" /> Competitors CSV
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadCSV(`${comp?.slug}-votes.csv`,
                    (votes as any[]).map((v) => ({
                      id: v.id, voter: v.voter?.username ?? v.voter_id,
                      competitor: v.competitor?.name ?? v.competitor_id,
                      at: v.created_at,
                    })))
                }
              >
                <Download className="mr-1 h-4 w-4" /> Votes CSV
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadCSV(`${comp?.slug}-participants.csv`,
                    participants.map((p) => ({
                      id: p.id, user: p.profile?.username ?? p.user_id,
                      status: p.status, votes: p.vote_count,
                      joined_at: p.joined_at,
                    })))
                }
              >
                <Download className="mr-1 h-4 w-4" /> Participants CSV
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  downloadCSV(`${comp?.slug}-winners.csv`,
                    awards.map((a: any) => ({
                      place: a.place, user: a.profile?.username ?? a.user_id,
                      badge: a.badge_label ?? "", awarded_at: a.awarded_at,
                    })))
                }
              >
                <Download className="mr-1 h-4 w-4" /> Winners CSV
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
