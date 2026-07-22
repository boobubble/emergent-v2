import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminSaveCompetition, listCategories } from "@/lib/competitions.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const emptyCompetition = () => ({
  name: "", slug: "", description: "", rules: "", banner_url: "",
  category_id: null as string | null,
  start_at: new Date().toISOString().slice(0, 16),
  end_at: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 16),
  max_participants: null as number | null,
  winner_count: 1,
  status: "upcoming" as "draft" | "upcoming" | "live" | "completed",
  layout_style: "auto" as "auto" | "vs_battle" | "podium" | "tournament" | "leaderboard",
  allow_vote_change: false,
  show_live_counts: true,
  require_approval: false,
  rewards: { coins: 0, xp: 0, badge: "", premium_days: 0, custom: "" },
  announce_channels: [] as string[],
  is_published: true,
  enable_voting: true,
  enable_reactions: true,
  enable_comments: true,
  enable_sharing: true,
  enable_join: true,
  hide_results_until_end: false,
  auto_close_voting: true,
  is_featured: false,
  is_pinned: false,
  allow_multiple_votes: false,
  max_votes_per_user: 1,
  allow_guest_voting: false,
  allow_anonymous_voting: false,
  entry_mode: "hybrid" as "manual" | "smart" | "hybrid",
  qualification_method: "top_n_week" as null | "fixed" | "top_n_week" | "top_n_month" | "top_percent" | "approval",
  qualification_config: {} as Record<string, any>,
  auto_approve: true,
});


interface Props {
  value: any | null;
  onChange: (v: any | null) => void;
  onSaved?: (result: { id: string; isNew: boolean }) => void;
  invalidateKeys?: string[][];
}

export function CompetitionEditorDialog({ value, onChange, onSaved, invalidateKeys = [["competitions"]] }: Props) {
  const cats = useServerFn(listCategories);
  const save = useServerFn(adminSaveCompetition);
  const qc = useQueryClient();
  const { data: categories = [] } = useQuery({ queryKey: ["competition-categories"], queryFn: () => cats({}) });

  const saveM = useMutation({
    mutationFn: (v: any) => {
      const payload = { ...v };
      payload.start_at = new Date(payload.start_at).toISOString();
      payload.end_at = new Date(payload.end_at).toISOString();
      if (!payload.max_participants) payload.max_participants = null;
      return save({ data: payload });
    },
    onSuccess: (res: any, vars: any) => {
      toast.success("Saved");
      invalidateKeys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      const savedId = res?.id ?? vars?.id;
      const isNew = !vars?.id;
      onChange(null);
      if (savedId) onSaved?.({ id: savedId, isNew });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const editing = value;
  const set = (patch: any) => onChange({ ...editing, ...patch });

  return (
    <Dialog open={!!editing} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editing?.id ? "Edit Competition" : "New Competition"}</DialogTitle></DialogHeader>
        {editing && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={editing.name} onChange={(e) => set({ name: e.target.value })} /></div>
              <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => set({ slug: e.target.value })} /></div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={editing.category_id ?? ""} onValueChange={(v) => set({ category_id: v || null })}>
                <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                <SelectContent>
                  {(categories as any[]).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => set({ description: e.target.value })} /></div>
            <div><Label>Rules</Label><Textarea rows={3} value={editing.rules ?? ""} onChange={(e) => set({ rules: e.target.value })} /></div>
            <div><Label>Banner URL</Label><Input value={editing.banner_url ?? ""} onChange={(e) => set({ banner_url: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start</Label><Input type="datetime-local" value={editing.start_at} onChange={(e) => set({ start_at: e.target.value })} /></div>
              <div><Label>End</Label><Input type="datetime-local" value={editing.end_at} onChange={(e) => set({ end_at: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Max Participants</Label><Input type="number" value={editing.max_participants ?? ""} onChange={(e) => set({ max_participants: e.target.value ? Number(e.target.value) : null })} /></div>
              <div><Label>Winners</Label><Input type="number" value={editing.winner_count ?? 1} onChange={(e) => set({ winner_count: Number(e.target.value) })} /></div>
              <div>
                <Label>Status</Label>
                <Select value={editing.status} onValueChange={(v) => set({ status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["draft", "upcoming", "live", "completed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Competition Layout</Label>
              <Select value={editing.layout_style ?? "auto"} onValueChange={(v) => set({ layout_style: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (recommended)</SelectItem>
                  <SelectItem value="vs_battle">VS Battle (2 nominees)</SelectItem>
                  <SelectItem value="podium">Podium (3 nominees)</SelectItem>
                  <SelectItem value="tournament">Tournament Grid (4–8)</SelectItem>
                  <SelectItem value="leaderboard">Live Leaderboard (9+)</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-1 text-[11px] text-muted-foreground">
                Auto picks the best layout based on how many nominees you add.
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2"><Switch checked={editing.allow_vote_change} onCheckedChange={(v) => set({ allow_vote_change: v })} /><Label>Allow vote change</Label></div>
              <div className="flex items-center gap-2"><Switch checked={editing.show_live_counts} onCheckedChange={(v) => set({ show_live_counts: v })} /><Label>Show live counts</Label></div>
              <div className="flex items-center gap-2"><Switch checked={editing.require_approval} onCheckedChange={(v) => set({ require_approval: v })} /><Label>Require approval</Label></div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <div>
                <Label className="text-sm font-semibold">Published</Label>
                <div className="text-xs text-muted-foreground">When off, this competition is hidden from users.</div>
              </div>
              <Switch checked={editing.is_published ?? true} onCheckedChange={(v) => set({ is_published: v })} />
            </div>
            <div className="rounded-xl border p-3">
              <div className="mb-2 text-sm font-semibold">Feature toggles</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 md:grid-cols-3">
                {([
                  ["enable_voting", "Voting"],
                  ["enable_reactions", "Reactions"],
                  ["enable_comments", "Comments"],
                  ["enable_sharing", "Sharing"],
                  ["enable_join", "Join"],
                  ["hide_results_until_end", "Hide results until end"],
                  ["auto_close_voting", "Auto-close voting at end"],
                  ["is_featured", "Featured"],
                  ["is_pinned", "Pin to top"],
                  ["allow_multiple_votes", "Allow multiple votes"],
                  ["allow_guest_voting", "Guest voting"],
                  ["allow_anonymous_voting", "Anonymous voting"],
                ] as const).map(([k, label]) => (
                  <div key={k} className="flex items-center gap-2">
                    <Switch checked={!!editing[k]} onCheckedChange={(v) => set({ [k]: v })} />
                    <Label className="text-xs">{label}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-3 max-w-[200px]">
                <Label className="text-xs">Max votes per user</Label>
                <Input
                  type="number"
                  min={1}
                  value={editing.max_votes_per_user ?? 1}
                  onChange={(e) => set({ max_votes_per_user: Math.max(1, Number(e.target.value) || 1) })}
                />
              </div>
            </div>
            <div className="rounded-xl border p-3 space-y-3">
              <div className="text-sm font-semibold">Entry & Qualification</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Entry Mode</Label>
                  <Select value={editing.entry_mode ?? "hybrid"} onValueChange={(v) => set({ entry_mode: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="smart">Smart Automatic</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editing.entry_mode !== "manual" && (
                  <div>
                    <Label>Qualification Method</Label>
                    <Select value={editing.qualification_method ?? ""} onValueChange={(v) => set({ qualification_method: v || null })}>
                      <SelectTrigger><SelectValue placeholder="Choose method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Threshold</SelectItem>
                        <SelectItem value="top_n_week">Top N This Week</SelectItem>
                        <SelectItem value="top_n_month">Top N This Month</SelectItem>
                        <SelectItem value="top_percent">Top % by Engagement</SelectItem>
                        <SelectItem value="approval">Admin Approval</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {editing.entry_mode !== "manual" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Source Module</Label>
                      <Select
                        value={editing.qualification_config?.source?.module ?? "feed"}
                        onValueChange={(v) => set({ qualification_config: { ...editing.qualification_config, source: { ...(editing.qualification_config?.source ?? {}), module: v } } })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feed">Feed</SelectItem>
                          <SelectItem value="poetry">Poetry</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Feed Category (optional)</Label>
                      <Select
                        value={editing.qualification_config?.source?.category ?? "any"}
                        onValueChange={(v) => set({ qualification_config: { ...editing.qualification_config, source: { ...(editing.qualification_config?.source ?? {}), category: v === "any" ? undefined : v } } })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="meme">Meme</SelectItem>
                          <SelectItem value="fan_art">Fan Art</SelectItem>
                          <SelectItem value="poster">Poster</SelectItem>
                          <SelectItem value="fan_edit">Fan Edit</SelectItem>
                          <SelectItem value="voice">Voice</SelectItem>
                          <SelectItem value="reel">Reel</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="photo">Photo</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="profile_picture">Profile Picture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {(editing.qualification_method === "fixed" || editing.qualification_method === "approval") && (
                    <div className="grid grid-cols-3 gap-3">
                      {(["likes", "comments", "shares", "views", "reads", "bookmarks"] as const).map((k) => (
                        <div key={k}>
                          <Label className="capitalize text-xs">Min {k}</Label>
                          <Input
                            type="number" min={0}
                            value={editing.qualification_config?.thresholds?.[k] ?? ""}
                            onChange={(e) => set({ qualification_config: { ...editing.qualification_config, thresholds: { ...(editing.qualification_config?.thresholds ?? {}), [k]: e.target.value ? Number(e.target.value) : undefined } } })}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {(editing.qualification_method === "top_n_week" || editing.qualification_method === "top_n_month") && (
                    <div className="max-w-[200px]">
                      <Label>Top N</Label>
                      <Input
                        type="number" min={1}
                        value={editing.qualification_config?.top_n ?? 10}
                        onChange={(e) => set({ qualification_config: { ...editing.qualification_config, top_n: Math.max(1, Number(e.target.value) || 10) } })}
                      />
                    </div>
                  )}
                  {editing.qualification_method === "top_percent" && (
                    <div className="max-w-[200px]">
                      <Label>Top % (1-100)</Label>
                      <Input
                        type="number" min={1} max={100}
                        value={editing.qualification_config?.top_percent ?? 5}
                        onChange={(e) => set({ qualification_config: { ...editing.qualification_config, top_percent: Math.min(100, Math.max(1, Number(e.target.value) || 5)) } })}
                      />
                    </div>
                  )}
                  <div className="rounded-lg border border-white/5 p-3">
                    <div className="mb-2 text-xs font-semibold text-muted-foreground">Additional gates (AND)</div>
                    <div className="grid grid-cols-3 gap-3">
                      {(["min_likes", "min_account_age_days", "min_followers", "min_content_age_hours"] as const).map((k) => (
                        <div key={k}>
                          <Label className="text-xs">{k.replace(/_/g, " ")}</Label>
                          <Input
                            type="number" min={0}
                            value={editing.qualification_config?.gates?.[k] ?? ""}
                            onChange={(e) => set({ qualification_config: { ...editing.qualification_config, gates: { ...(editing.qualification_config?.gates ?? {}), [k]: e.target.value ? Number(e.target.value) : undefined } } })}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={editing.auto_approve ?? true} onCheckedChange={(v) => set({ auto_approve: v })} />
                    <Label className="text-xs">Auto-approve qualified entries (off = require admin approval)</Label>
                  </div>
                </>
              )}
            </div>
            <div className="rounded-xl border p-3">
              <div className="mb-2 text-sm font-semibold">Rewards</div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                <div><Label>Coins</Label><Input type="number" value={editing.rewards?.coins ?? 0} onChange={(e) => set({ rewards: { ...editing.rewards, coins: Number(e.target.value) } })} /></div>
                <div><Label>XP</Label><Input type="number" value={editing.rewards?.xp ?? 0} onChange={(e) => set({ rewards: { ...editing.rewards, xp: Number(e.target.value) } })} /></div>
                <div><Label>Premium days</Label><Input type="number" value={editing.rewards?.premium_days ?? 0} onChange={(e) => set({ rewards: { ...editing.rewards, premium_days: Number(e.target.value) } })} /></div>
                <div><Label>Badge label</Label><Input value={editing.rewards?.badge ?? ""} onChange={(e) => set({ rewards: { ...editing.rewards, badge: e.target.value } })} /></div>
              </div>
              <div className="mt-2"><Label>Custom reward</Label><Input value={editing.rewards?.custom ?? ""} onChange={(e) => set({ rewards: { ...editing.rewards, custom: e.target.value } })} /></div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onChange(null)}>Cancel</Button>
          <Button onClick={() => saveM.mutate(editing)} disabled={saveM.isPending || !editing?.name || !editing?.slug}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
