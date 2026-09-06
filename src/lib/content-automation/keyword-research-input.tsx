import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatResearchSource } from "@/lib/content-automation/parse-research-paste";
import {
  getKeywordResearchMeta,
  previewKeywordResearch,
  saveKeywordResearch,
} from "@/lib/content-automation/seo-engine.functions";

type OpportunityRow = {
  contentType: "blog" | "page";
  proposedTitle: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  longTailKeywords: string[];
  cluster: string | null;
  searchIntent: string;
  sources: string[];
  searchVolume: number | null;
  action: string;
  cannibalizationStatus: string;
  existingUrl: string | null;
  existingTitle: string | null;
  priority: number;
  relatedUrls: string[];
};

type PreviewResult = {
  source: string;
  sources: string[];
  clustersFound: number;
  keywordsFound: number;
  duplicatesRemoved: number;
  primary: string[];
  secondary: string[];
  longTail: string[];
  opportunities: OpportunityRow[];
  newOpportunities: number;
  mergedOpportunities: number;
  cannibalizationRisks: number;
  errors: string[];
};

function actionLabel(action: string): string {
  if (action === "new_content") return "NEW CONTENT";
  if (action === "merge_existing") return "MERGE INTO EXISTING";
  if (action === "use_as_secondary") return "USE AS SECONDARY";
  if (action === "skip_cannibalization") return "SKIP - CANNIBALIZATION RISK";
  return action;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="text-xl font-semibold tabular-nums">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function KeywordResearchInput() {
  const qc = useQueryClient();
  const previewFn = useServerFn(previewKeywordResearch);
  const saveFn = useServerFn(saveKeywordResearch);
  const metaFn = useServerFn(getKeywordResearchMeta);
  const [clusterText, setClusterText] = useState("");
  const [ideasText, setIdeasText] = useState("");
  const [extraText, setExtraText] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [clusterFilter, setClusterFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const metaQ = useQuery({
    queryKey: ["keyword-research-meta"],
    queryFn: () => metaFn({}),
  });

  const payload = { clusterText, ideasText, extraText };
  const previewMut = useMutation({
    mutationFn: () => previewFn({ data: payload }),
    onSuccess: (res) => {
      setPreview(res as PreviewResult);
      if ((res as PreviewResult).keywordsFound === 0) {
        toast.error("No usable keywords found in the pasted text.");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const saveMut = useMutation({
    mutationFn: () => saveFn({ data: payload }),
    onSuccess: (res) => {
      const saved = res as PreviewResult & { keywordUpsert?: { created: number; merged: number }; queued?: { blogUpserted: number; pageUpserted: number } };
      toast.success(
        `Saved ${saved.keywordUpsert?.created ?? 0} new keywords, merged ${saved.keywordUpsert?.merged ?? 0}. Pending queue updated — nothing published.`,
      );
      setPreview(null);
      setClusterText("");
      setIdeasText("");
      setExtraText("");
      qc.invalidateQueries({ queryKey: ["keyword-research-meta"] });
      qc.invalidateQueries({ queryKey: ["content-automation-ideas"] });
      qc.invalidateQueries({ queryKey: ["seo-engine-overview"] });
      qc.invalidateQueries({ queryKey: ["seo-engine-keywords"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const opportunities = preview?.opportunities ?? [];
  const filtered = useMemo(() => {
    return opportunities.filter((row) => {
      if (sourceFilter !== "all" && !row.sources.includes(sourceFilter)) return false;
      if (clusterFilter !== "all" && (row.cluster || "") !== clusterFilter) return false;
      if (typeFilter !== "all" && row.contentType !== typeFilter) return false;
      if (intentFilter !== "all" && row.searchIntent !== intentFilter) return false;
      if (statusFilter !== "all" && row.action !== statusFilter) return false;
      if (priorityFilter === "high" && row.priority < 60) return false;
      if (priorityFilter === "medium" && (row.priority < 35 || row.priority >= 60)) return false;
      if (priorityFilter === "low" && row.priority >= 35) return false;
      return true;
    });
  }, [opportunities, sourceFilter, clusterFilter, typeFilter, intentFilter, statusFilter, priorityFilter]);

  const clusterNames = [...new Set(opportunities.map((o) => o.cluster).filter(Boolean))] as string[];
  const meta = metaQ.data;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <Stat label="Keyword Clusters" value={meta?.keywordClusters ?? 0} />
        <Stat label="Total Keywords" value={meta?.totalKeywords ?? 0} />
        <Stat label="New Opportunities" value={preview?.newOpportunities ?? 0} />
        <Stat label="Pending Content" value={meta?.pendingContent ?? 0} />
        <Stat label="Cannibalization Risks" value={preview?.cannibalizationRisks ?? 0} />
        <Stat label="Keywords Used" value={meta?.keywordsUsed ?? 0} />
        <Stat label="Keywords Not Yet Used" value={meta?.keywordsUnused ?? 0} />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div>
            <h3 className="text-sm font-semibold">Keyword Research Input</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste RyRob clusters, Neil Patel / Ubersuggest keyword ideas, or extra keywords. Parsing is tolerant of tables, tabs, CSV, headings, and messy spacing. Review the preview, then save into the existing SEO Content Engine. Nothing is published from this screen.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Keyword Cluster</label>
              <p className="text-xs text-muted-foreground">
                Raw paste from <a className="underline" href="https://www.ryrob.com/keyword-cluster/" target="_blank" rel="noreferrer">RyRob Keyword Cluster</a>.
              </p>
              <Textarea
                value={clusterText}
                onChange={(e) => setClusterText(e.target.value)}
                rows={10}
                className="min-h-40 font-mono text-xs"
                placeholder={"Cluster: Indian Chat Room (Informational)\n- indian chat room\n- india chat room\n- free indian chat room to make friends"}
              />
              <Button type="button" variant="secondary" disabled={previewMut.isPending || !clusterText.trim()} onClick={() => previewMut.mutate()}>
                {previewMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Parse Keyword Cluster
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Keyword Ideas</label>
              <p className="text-xs text-muted-foreground">
                Raw paste from <a className="underline" href="https://app.neilpatel.com/en/keyword-ideas" target="_blank" rel="noreferrer">Neil Patel Keyword Ideas</a> or Ubersuggest tables.
              </p>
              <Textarea
                value={ideasText}
                onChange={(e) => setIdeasText(e.target.value)}
                rows={10}
                className="min-h-40 font-mono text-xs"
                placeholder={"Keyword\tVolume\tSEO Difficulty\tCPC\tPaid Difficulty\nindian chat room\t2900\t35\t0.42\t18"}
              />
              <Button type="button" variant="secondary" disabled={previewMut.isPending || !ideasText.trim()} onClick={() => previewMut.mutate()}>
                {previewMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Parse Keyword Ideas
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Keywords</label>
            <p className="text-xs text-muted-foreground">
              Extra Ubersuggest or manual keywords. Comma-separated, newline-separated, or one keyword per line.
            </p>
            <Textarea
              value={extraText}
              onChange={(e) => setExtraText(e.target.value)}
              rows={5}
              className="font-mono text-xs"
              placeholder={"indian chat rooms\nfree indian chat room\nchat with indian people"}
            />
            <Button type="button" variant="secondary" disabled={previewMut.isPending || !extraText.trim()} onClick={() => previewMut.mutate()}>
              {previewMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Keywords
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <h3 className="text-sm font-semibold">Keyword Research Preview</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Source: {preview.sources.map(formatResearchSource).join(", ") || "—"} · Clusters found: {preview.clustersFound} · Keywords found: {preview.keywordsFound} · Duplicates removed: {preview.duplicatesRemoved}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="Clusters" value={preview.clustersFound} />
              <Stat label="Keywords" value={preview.keywordsFound} />
              <Stat label="New" value={preview.newOpportunities} />
              <Stat label="Merged" value={preview.mergedOpportunities} />
              <Stat label="Cannibalization risks" value={preview.cannibalizationRisks} />
            </div>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <div className="mb-1 font-medium">Primary Keywords</div>
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                  {preview.primary.slice(0, 8).map((k) => <li key={k}>{k}</li>)}
                  {preview.primary.length === 0 && <li>None detected</li>}
                </ul>
              </div>
              <div>
                <div className="mb-1 font-medium">Secondary Keywords</div>
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                  {preview.secondary.slice(0, 8).map((k) => <li key={k}>{k}</li>)}
                  {preview.secondary.length === 0 && <li>None detected</li>}
                </ul>
              </div>
              <div>
                <div className="mb-1 font-medium">Long-tail Keywords</div>
                <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                  {preview.longTail.slice(0, 8).map((k) => <li key={k}>{k}</li>)}
                  {preview.longTail.length === 0 && <li>None detected</li>}
                </ul>
              </div>
            </div>
            {preview.errors.length > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-300">{preview.errors.join(" · ")}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => saveMut.mutate()} disabled={saveMut.isPending || preview.keywordsFound === 0}>
                {saveMut.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Add to SEO Engine
              </Button>
              <Button type="button" variant="outline" onClick={() => setPreview(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {preview && (
        <Card>
          <CardContent className="space-y-3 p-5">
            <h3 className="text-sm font-semibold">Review Opportunities</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {[
                ["Source", sourceFilter, setSourceFilter, ["all", ...preview.sources]],
                ["Cluster", clusterFilter, setClusterFilter, ["all", ...clusterNames]],
                ["Content Type", typeFilter, setTypeFilter, ["all", "page", "blog"]],
                ["Intent", intentFilter, setIntentFilter, ["all", ...new Set(opportunities.map((o) => o.searchIntent))]],
                ["Status", statusFilter, setStatusFilter, ["all", "new_content", "merge_existing", "use_as_secondary", "skip_cannibalization"]],
                ["Priority", priorityFilter, setPriorityFilter, ["all", "high", "medium", "low"]],
              ].map(([label, value, setter, options]) => (
                <label key={String(label)} className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">{String(label)}</span>
                  <select
                    className="rounded-md border bg-background px-2 py-1"
                    value={String(value)}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                  >
                    {(options as string[]).map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[72rem] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-3 py-2">Content Type</th>
                    <th className="px-3 py-2">Proposed Title</th>
                    <th className="px-3 py-2">Primary Keyword</th>
                    <th className="px-3 py-2">Cluster</th>
                    <th className="px-3 py-2">Intent</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Cannibalization</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Volume</th>
                    <th className="px-3 py-2">Related pages</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={`${row.primaryKeyword}-${row.proposedTitle}`} className="border-b align-top last:border-0">
                      <td className="px-3 py-2">{row.contentType === "blog" ? "Blog" : "SEO page"}</td>
                      <td className="px-3 py-2">{row.proposedTitle}</td>
                      <td className="px-3 py-2">{row.primaryKeyword}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.cluster || "—"}</td>
                      <td className="px-3 py-2">{row.searchIntent}</td>
                      <td className="px-3 py-2 tabular-nums">{row.priority}</td>
                      <td className="px-3 py-2">
                        <Badge variant={row.action === "skip_cannibalization" ? "destructive" : "secondary"}>
                          {actionLabel(row.action)}
                        </Badge>
                        <div className="mt-1 max-w-xs text-xs text-muted-foreground">{row.cannibalizationStatus}</div>
                      </td>
                      <td className="px-3 py-2 text-xs">{row.sources.map(formatResearchSource).join(", ")}</td>
                      <td className="px-3 py-2">{row.searchVolume ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {row.relatedUrls.slice(0, 3).join(" ") || "—"}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">No opportunities match these filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {(meta?.batches?.length ?? 0) > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="px-5 pt-5">
              <h3 className="text-sm font-semibold">Import batch history</h3>
              <p className="mt-1 text-xs text-muted-foreground">Re-pasting the same research updates existing keywords instead of creating duplicates.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[48rem] text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="px-5 py-2">Date</th>
                    <th className="px-3 py-2">Source</th>
                    <th className="px-3 py-2">Keywords</th>
                    <th className="px-3 py-2">Clusters</th>
                    <th className="px-3 py-2">Duplicates</th>
                    <th className="px-3 py-2">New</th>
                    <th className="px-3 py-2">Merged</th>
                  </tr>
                </thead>
                <tbody>
                  {(meta?.batches ?? []).map((batch: Record<string, unknown>) => (
                    <tr key={String(batch.id)} className="border-b last:border-0">
                      <td className="px-5 py-2 text-xs">{String(batch.created_at || "").slice(0, 10)}</td>
                      <td className="px-3 py-2">{(batch.sources as string[] | undefined)?.map(formatResearchSource).join(", ") || formatResearchSource(String(batch.source || ""))}</td>
                      <td className="px-3 py-2">{String(batch.keywords_found ?? 0)}</td>
                      <td className="px-3 py-2">{String(batch.clusters_found ?? 0)}</td>
                      <td className="px-3 py-2">{String(batch.duplicates_removed ?? 0)}</td>
                      <td className="px-3 py-2">{String(batch.new_count ?? 0)}</td>
                      <td className="px-3 py-2">{String(batch.merged_count ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
