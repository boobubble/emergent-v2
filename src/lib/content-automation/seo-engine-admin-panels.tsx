import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  getSeoEngineOverview,
  importKeywordCsv,
  listSeoEngineData,
  restoreSeoVersion,
  retryPexelsImage,
  retrySeoJob,
  runSeoMigrationBatch,
  syncSeoInventoryNow,
} from "@/lib/content-automation/seo-engine.functions";

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function SeoOverviewPanel() {
  const fetchOverview = useServerFn(getSeoEngineOverview);
  const q = useQuery({
    queryKey: ["seo-engine-overview"],
    queryFn: () => fetchOverview({}),
  });
  if (q.isLoading || !q.data) return <p className="text-sm text-muted-foreground">Loading overview…</p>;
  const d = q.data;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Blogs published today" value={d.blogsToday} />
      <Stat label="SEO pages published today" value={d.pagesToday} />
      <Stat label="Total today" value={d.totalToday} />
      <Stat label="Remaining today" value={d.quota.totalRemaining} />
      <Stat label="Refreshes due" value={d.dueRefresh} />
      <Stat label="Refreshed today" value={d.refreshedToday} />
      <Stat label="Failed jobs" value={d.failedJobs} />
      <Stat label="Image failures" value={d.imageFailures} />
      <Stat label="Pending keywords" value={d.pendingKeywords} />
      <Stat label="Cannibalization warnings" value={d.cannibalOpen} />
      <Stat label="Inventory items" value={d.inventoryTotal} />
      <Stat label="Migration pending" value={d.migrationPending} />
      <Stat label="Keyword clusters" value={d.keywordClusters ?? 0} />
      <Stat label="Total keywords" value={d.totalKeywords ?? 0} />
      <Stat label="Keywords used" value={d.keywordsUsed ?? 0} />
      <Stat label="Keywords not yet used" value={d.keywordsUnused ?? 0} />
      <Stat label="Pending content" value={d.pendingContent ?? 0} />
    </div>
  );
}

export function SeoKeywordsPanel() {
  const list = useServerFn(listSeoEngineData);
  const importCsv = useServerFn(importKeywordCsv);
  const qc = useQueryClient();
  const [csv, setCsv] = useState("");
  const q = useQuery({
    queryKey: ["seo-engine-keywords"],
    queryFn: () => list({ data: { view: "keywords" } }),
  });
  const upload = useMutation({
    mutationFn: () => importCsv({ data: { csv } }),
    onSuccess: (res) => {
      toast.success(`Imported ${res.upserted} keywords`);
      qc.invalidateQueries({ queryKey: ["seo-engine-keywords"] });
      qc.invalidateQueries({ queryKey: ["seo-engine-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const rows = (q.data as { keywords?: Array<Record<string, unknown>> } | undefined)?.keywords ?? [];
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="text-sm font-semibold">Ubersuggest CSV import</h3>
          <p className="text-xs text-muted-foreground">
            Optional fallback. Prefer Keyword Research Input on the Content Ideas tab for RyRob, Neil Patel, and Ubersuggest pastes. Required column: Keyword. Optional: Search Volume, SEO Difficulty, CPC, Competition, Intent.
          </p>
          <Textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={8} className="font-mono text-xs" placeholder={"Keyword,Search Volume,SEO Difficulty,CPC,Intent\nindian chat room,5400,38,0.42,local"} />
          <Button onClick={() => upload.mutate()} disabled={upload.isPending || !csv.trim()}>
            {upload.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import CSV
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Keyword</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Volume</th>
                  <th className="px-4 py-2">Intent</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.id)} className="border-t">
                    <td className="px-4 py-2">{String(row.keyword)}</td>
                    <td className="px-4 py-2">{String(row.keyword_type)}</td>
                    <td className="px-4 py-2">{row.search_volume == null ? "—" : String(row.search_volume)}</td>
                    <td className="px-4 py-2">{String(row.search_intent ?? "—")}</td>
                    <td className="px-4 py-2"><Badge variant="secondary">{String(row.status)}</Badge></td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No keyword targets yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DataTable({ view }: { view: "jobs" | "images" | "versions" | "refresh" | "cannibalization" | "inventory" }) {
  const list = useServerFn(listSeoEngineData);
  const retryJob = useServerFn(retrySeoJob);
  const retryImage = useServerFn(retryPexelsImage);
  const restore = useServerFn(restoreSeoVersion);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["seo-engine-data", view],
    queryFn: () => list({ data: { view } }),
  });
  const data = q.data as Record<string, Array<Record<string, unknown>>> | undefined;
  const rows = data?.jobs ?? data?.images ?? data?.versions ?? data?.reports ?? data?.warnings ?? data?.inventory ?? [];

  return (
    <Card>
      <CardContent className="p-0">
        <div className="max-h-[28rem] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Item</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Detail</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const id = String(row.id ?? "");
                const title = String(row.title ?? row.keyword ?? row.slug ?? row.search_query ?? row.job_key ?? id);
                const status = String(row.status ?? row.image_status ?? row.migration_status ?? "—");
                const detail = String(row.last_error ?? row.error ?? row.change_summary ?? row.report_text ?? row.recommended_action ?? row.photographer_name ?? "").slice(0, 160);
                return (
                  <tr key={id} className="border-t align-top">
                    <td className="px-4 py-2">{title}</td>
                    <td className="px-4 py-2"><Badge variant="secondary">{status}</Badge></td>
                    <td className="px-4 py-2 text-xs text-muted-foreground whitespace-pre-wrap">{detail || "—"}</td>
                    <td className="px-4 py-2">
                      {view === "jobs" && status === "failed" && (
                        <Button size="sm" variant="outline" onClick={async () => {
                          const res = await retryJob({ data: { jobId: id } });
                          if (res.ok) toast.success(res.executed ? "Retry executed" : `Retry ${res.reason || "completed"}`);
                          else toast.error(res.reason || "Retry failed");
                          qc.invalidateQueries({ queryKey: ["seo-engine-data", view] });
                          qc.invalidateQueries({ queryKey: ["seo-engine-overview"] });
                        }}>Retry</Button>
                      )}
                      {view === "images" && status === "failed" && row.source_id && (
                        <Button size="sm" variant="outline" onClick={async () => {
                          await retryImage({
                            data: {
                              contentType: (row.content_type as "blog" | "page") || "page",
                              sourceId: String(row.source_id),
                              topic: String(row.search_query || title),
                            },
                          });
                          toast.success("Image retry finished");
                          qc.invalidateQueries({ queryKey: ["seo-engine-data", view] });
                        }}>Retry</Button>
                      )}
                      {view === "versions" && (
                        <Button size="sm" variant="outline" onClick={async () => {
                          if (!window.confirm("Restore this version? The current live copy will be snapshotted first. Slug/URL stay the same.")) return;
                          await restore({ data: { versionId: id } });
                          toast.success("Version restored");
                        }}>Restore</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Nothing here yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function SeoJobsPanel() {
  return <DataTable view="jobs" />;
}
export function SeoImagesPanel() {
  return <DataTable view="images" />;
}
export function SeoVersionsPanel() {
  return <DataTable view="versions" />;
}
export function SeoRefreshPanel() {
  const migrate = useServerFn(runSeoMigrationBatch);
  const sync = useServerFn(syncSeoInventoryNow);
  const qc = useQueryClient();
  const run = useMutation({
    mutationFn: (dryRun: boolean) => migrate({ data: { limit: 5, dryRun, syncFirst: true } }),
    onSuccess: (res) => {
      toast.success(`Processed ${res.processed} item${res.processed === 1 ? "" : "s"}`);
      qc.invalidateQueries({ queryKey: ["seo-engine-data"] });
      qc.invalidateQueries({ queryKey: ["seo-engine-overview"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => sync({}).then(() => toast.success("Inventory synced"))}>Sync inventory</Button>
        <Button variant="outline" onClick={() => run.mutate(true)} disabled={run.isPending}>Dry-run migration</Button>
        <Button onClick={() => {
          if (!window.confirm("Run a live optimization batch on pending inventory items?")) return;
          run.mutate(false);
        }} disabled={run.isPending}>
          {run.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Start migration batch
        </Button>
      </div>
      <DataTable view="refresh" />
    </div>
  );
}
export function SeoCannibalizationPanel() {
  return <DataTable view="cannibalization" />;
}
export function SeoInventoryPanel() {
  return <DataTable view="inventory" />;
}
