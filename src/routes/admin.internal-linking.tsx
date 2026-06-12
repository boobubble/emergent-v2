import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Link2, RefreshCw, Plus, Trash2, Pencil, Sparkles, Search, AlertCircle, BarChart3 } from "lucide-react";
import {
  listLinkTargets, upsertLinkTarget, deleteLinkTarget, syncLinkTargets,
  suggestLinks, applyLinksToPage, getOrphanReport, getLinkAnalytics,
} from "@/lib/internal-linking.functions";

export const Route = createFileRoute("/admin/internal-linking")({ component: InternalLinkingPage });

const TYPES = ["blog","tool","game","feed_page","poll","hashtag","community_page","help_page","announcement","seo_page"] as const;
type TargetType = typeof TYPES[number];

interface Target {
  id: string;
  title: string;
  slug: string | null;
  url: string;
  description: string | null;
  keywords: string[];
  category: string | null;
  type: TargetType;
  priority: number;
  is_cornerstone: boolean;
  is_active: boolean;
}

function InternalLinkingPage() {
  return (
    <div>
      <AdminPageHeader
        title="Internal Linking & SEO Hub"
        description="Manage link targets, generate AI-style suggestions, detect orphan pages, and track click analytics."
      />
      <Tabs defaultValue="targets">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="targets"><Link2 className="mr-1.5 h-3.5 w-3.5" />Targets</TabsTrigger>
          <TabsTrigger value="suggestions"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Suggestions</TabsTrigger>
          <TabsTrigger value="orphans"><AlertCircle className="mr-1.5 h-3.5 w-3.5" />Orphans</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="mr-1.5 h-3.5 w-3.5" />Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="targets"><TargetsTab /></TabsContent>
        <TabsContent value="suggestions"><SuggestionsTab /></TabsContent>
        <TabsContent value="orphans"><OrphansTab /></TabsContent>
        <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// =================== TARGETS ===================
function TargetsTab() {
  const list = useServerFn(listLinkTargets);
  const sync = useServerFn(syncLinkTargets);
  const del = useServerFn(deleteLinkTarget);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Partial<Target> | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ["ilt"], queryFn: () => list({}) });

  const syncMut = useMutation({
    mutationFn: () => sync({}),
    onSuccess: (r: any) => { toast.success(`Synced ${r.count} targets`); qc.invalidateQueries({ queryKey: ["ilt"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Sync failed"),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["ilt"] }); },
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ((data ?? []) as Target[]).filter((t) =>
      !term || t.title.toLowerCase().includes(term) || t.url.toLowerCase().includes(term),
    );
  }, [data, q]);

  return (
    <div className="space-y-3">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or URL…" className="pl-7" />
          </div>
          <Button size="sm" variant="outline" onClick={() => syncMut.mutate()} disabled={syncMut.isPending}>
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncMut.isPending ? "animate-spin" : ""}`} />
            Auto-sync from content
          </Button>
          <Button size="sm" onClick={() => setEditing({ type: "seo_page", priority: 5, is_active: true })}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />New target
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? <Skeleton className="m-3 h-32" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Priority</TableHead>
                  <TableHead className="text-center">Cornerstone</TableHead>
                  <TableHead className="text-center">Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">No targets yet. Click "Auto-sync from content" to populate.</TableCell></TableRow>
                )}
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell><code className="text-xs text-muted-foreground">{t.url}</code></TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{t.type}</Badge></TableCell>
                    <TableCell className="text-center tabular-nums">{t.priority}</TableCell>
                    <TableCell className="text-center">{t.is_cornerstone ? "⭐" : "—"}</TableCell>
                    <TableCell className="text-center">{t.is_active ? "✓" : "—"}</TableCell>
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => setEditing(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete this target?")) delMut.mutate(t.id); }}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TargetEditor open={!!editing} initial={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function TargetEditor({ open, initial, onClose }: { open: boolean; initial: Partial<Target> | null; onClose: () => void }) {
  const save = useServerFn(upsertLinkTarget);
  const qc = useQueryClient();
  const [row, setRow] = useState<Partial<Target>>(initial ?? {});
  const [kwInput, setKwInput] = useState("");
  // Re-sync when opened with new initial
  useMemo(() => { setRow(initial ?? {}); setKwInput((initial?.keywords ?? []).join(", ")); }, [initial]);

  const mut = useMutation({
    mutationFn: () => save({ data: {
      id: row.id,
      title: row.title ?? "",
      slug: row.slug ?? null,
      url: row.url ?? "",
      description: row.description ?? null,
      keywords: kwInput.split(",").map((s) => s.trim()).filter(Boolean),
      category: row.category ?? null,
      type: (row.type ?? "seo_page") as TargetType,
      priority: row.priority ?? 5,
      is_cornerstone: !!row.is_cornerstone,
      is_active: row.is_active ?? true,
    }}),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["ilt"] }); onClose(); },
    onError: (e: any) => toast.error(e?.message ?? "Save failed"),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{row.id ? "Edit target" : "New link target"}</DialogTitle></DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title"><Input value={row.title ?? ""} onChange={(e) => setRow({ ...row, title: e.target.value })} /></Field>
          <Field label="URL (start with /)"><Input value={row.url ?? ""} onChange={(e) => setRow({ ...row, url: e.target.value })} placeholder="/indian-chat-rooms" /></Field>
          <Field label="Type">
            <Select value={row.type ?? "seo_page"} onValueChange={(v) => setRow({ ...row, type: v as TargetType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Category"><Input value={row.category ?? ""} onChange={(e) => setRow({ ...row, category: e.target.value })} /></Field>
          <Field label="Priority (1-10)"><Input type="number" min={1} max={10} value={row.priority ?? 5} onChange={(e) => setRow({ ...row, priority: Number(e.target.value) })} /></Field>
          <Field label="Slug"><Input value={row.slug ?? ""} onChange={(e) => setRow({ ...row, slug: e.target.value })} /></Field>
          <Field label="Description" className="sm:col-span-2"><Textarea rows={2} value={row.description ?? ""} onChange={(e) => setRow({ ...row, description: e.target.value })} /></Field>
          <Field label="Keywords (comma-separated)" className="sm:col-span-2">
            <Input value={kwInput} onChange={(e) => setKwInput(e.target.value)} placeholder="indian chat, india chat rooms, free chat" />
          </Field>
          <div className="flex items-center gap-2"><Switch checked={!!row.is_cornerstone} onCheckedChange={(v) => setRow({ ...row, is_cornerstone: v })} /><span className="text-sm">Cornerstone content</span></div>
          <div className="flex items-center gap-2"><Switch checked={row.is_active ?? true} onCheckedChange={(v) => setRow({ ...row, is_active: v })} /><span className="text-sm">Active</span></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending || !row.title || !row.url}>{mut.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="mb-1 block text-xs">{label}</Label>{children}</div>;
}

// =================== SUGGESTIONS ===================
function SuggestionsTab() {
  const suggest = useServerFn(suggestLinks);
  const apply = useServerFn(applyLinksToPage);
  const [content, setContent] = useState("");
  const [pageId, setPageId] = useState("");
  const [sugs, setSugs] = useState<any[]>([]);
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const suggestMut = useMutation({
    mutationFn: () => suggest({ data: { content, maxSuggestions: 30 } }),
    onSuccess: (res: any) => { setSugs(res); setPicked(new Set(res.map((_: any, i: number) => i))); toast.success(`${res.length} suggestions`); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const applyMut = useMutation({
    mutationFn: () => apply({ data: { pageId, approved: sugs.filter((_, i) => picked.has(i)).map((s) => ({ target_url: s.target_url, anchor_text: s.anchor_text })) } }),
    onSuccess: (r: any) => toast.success(`Applied ${r.applied} links to page`),
    onError: (e: any) => toast.error(e?.message ?? "Apply failed"),
  });

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader><CardTitle className="text-base">Paste content to analyze</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Paste blog post / page HTML or markdown..." />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={() => suggestMut.mutate()} disabled={!content.trim() || suggestMut.isPending}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />{suggestMut.isPending ? "Analyzing…" : "Generate suggestions"}
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <Label className="text-xs">Apply to custom page ID</Label>
              <Input value={pageId} onChange={(e) => setPageId(e.target.value)} placeholder="UUID" className="w-72" />
              <Button size="sm" variant="outline" onClick={() => applyMut.mutate()} disabled={!pageId || picked.size === 0 || applyMut.isPending}>
                Apply approved
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {sugs.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Anchor</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sugs.map((s, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Checkbox checked={picked.has(i)} onCheckedChange={(v) => {
                        const n = new Set(picked); v ? n.add(i) : n.delete(i); setPicked(n);
                      }} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{s.title}</div>
                      <code className="text-xs text-muted-foreground">{s.target_url}</code>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{s.anchor_text}</Badge></TableCell>
                    <TableCell className="max-w-md text-xs text-muted-foreground">…{s.context_snippet}…</TableCell>
                    <TableCell className="text-center tabular-nums">{s.relevance_score}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =================== ORPHANS ===================
function OrphansTab() {
  const fetch = useServerFn(getOrphanReport);
  const { data, isLoading } = useQuery({ queryKey: ["ilt-orphans"], queryFn: () => fetch({}) });

  return (
    <div className="space-y-3">
      {isLoading ? <Skeleton className="h-40" /> : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total targets" value={data?.total ?? 0} />
            <Stat label="Orphan pages (zero incoming)" value={data?.orphans.length ?? 0} />
            <Stat label="Low-link pages (1-2 incoming)" value={data?.lowLinks.length ?? 0} />
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Orphan targets</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>URL</TableHead><TableHead>Type</TableHead><TableHead className="text-center">Incoming</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(data?.orphans ?? []).map((o: any) => (
                    <TableRow key={o.url}>
                      <TableCell>{o.title}</TableCell>
                      <TableCell><code className="text-xs">{o.url}</code></TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{o.type}</Badge></TableCell>
                      <TableCell className="text-center">{o.incoming}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// =================== ANALYTICS ===================
function AnalyticsTab() {
  const fetch = useServerFn(getLinkAnalytics);
  const { data, isLoading } = useQuery({ queryKey: ["ilt-analytics"], queryFn: () => fetch({}) });
  if (isLoading) return <Skeleton className="h-40" />;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Stat label={`Clicks (${data?.windowDays ?? 30}d)`} value={data?.totalClicks ?? 0} />
        <Stat label="Tracked anchors" value={data?.topAnchors.length ?? 0} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Top linked URLs</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>URL</TableHead><TableHead className="text-right">Clicks</TableHead></TableRow></TableHeader>
              <TableBody>
                {(data?.topUrls ?? []).map((r: any) => (
                  <TableRow key={r.key}><TableCell><code className="text-xs">{r.key}</code></TableCell><TableCell className="text-right tabular-nums">{r.count}</TableCell></TableRow>
                ))}
                {(!data?.topUrls?.length) && <TableRow><TableCell colSpan={2} className="py-6 text-center text-sm text-muted-foreground">No clicks yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Top anchors</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Anchor</TableHead><TableHead className="text-right">Clicks</TableHead></TableRow></TableHeader>
              <TableBody>
                {(data?.topAnchors ?? []).map((r: any) => (
                  <TableRow key={r.key}><TableCell>{r.key}</TableCell><TableCell className="text-right tabular-nums">{r.count}</TableCell></TableRow>
                ))}
                {(!data?.topAnchors?.length) && <TableRow><TableCell colSpan={2} className="py-6 text-center text-sm text-muted-foreground">No data yet.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card><CardContent className="p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</div>
    </CardContent></Card>
  );
}
