import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Play, Upload } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { parseBulkContentIdeas } from "@/lib/content-automation/parse-bulk-ideas";
import {
  PendingKeywordResearchDialog,
  type PendingIdeaForResearch,
} from "@/lib/content-automation/keyword-research-input";
import { sendIdeaToContentGeneration } from "@/lib/content-automation/seo-engine.functions";
import {
  SeoCannibalizationPanel,
  SeoImagesPanel,
  SeoInventoryPanel,
  SeoJobsPanel,
  SeoKeywordsPanel,
  SeoOverviewPanel,
  SeoRefreshPanel,
  SeoVersionsPanel,
} from "@/lib/content-automation/seo-engine-admin-panels";

export const Route = createFileRoute("/admin/content-automation")({
  component: ContentAutomationPage,
});

type AutomationSettings = {
  id: number;
  blog_posts_per_day: number;
  static_pages_per_day: number;
  daily_total_limit: number;
  automation_enabled: boolean;
  auto_seo_optimization: boolean;
  auto_internal_linking: boolean;
  two_way_linking: boolean;
  cannibalization_check: boolean;
  broken_link_check: boolean;
  new_page_discovery: boolean;
  content_refresh_enabled: boolean;
  refresh_interval_days: number;
  only_update_when_meaningful: boolean;
  minimum_content_change_percent: number;
  keep_previous_versions: boolean;
  max_versions: number;
  pexels_images_enabled: boolean;
  images_per_content: number;
  prefer_landscape_images: boolean;
  image_optimization: boolean;
  image_duplicate_prevention: boolean;
  dry_run_optimization: boolean;
  migration_paused: boolean;
  updated_at: string | null;
};

type NormalizedIdea = {
  id: number;
  type: "blog" | "page";
  identifier: string;
  grouping: string;
  status: "pending" | "published";
  keywords: string | null;
  baseName: string | null;
  generationReady?: boolean;
};

function adminHeaders(): HeadersInit {
  const secret = import.meta.env.VITE_ADMIN_API_SECRET as string | undefined;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secret ?? ""}`,
  };
}

async function readJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || res.statusText };
  }
}

function ContentAutomationPage() {
  const qc = useQueryClient();
  const sendToGenerationFn = useServerFn(sendIdeaToContentGeneration);
  const [tab, setTab] = useState("ideas");
  const [bulkText, setBulkText] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "blog" | "page">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "published">("all");
  const [runResult, setRunResult] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [researchIdea, setResearchIdea] = useState<PendingIdeaForResearch | null>(null);
  const bulkTextareaRef = useRef<HTMLTextAreaElement>(null);

  const settingsQ = useQuery({
    queryKey: ["content-automation-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/automation-settings", { headers: adminHeaders() });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || res.statusText);
      return json as AutomationSettings;
    },
  });

  const ideasQ = useQuery({
    queryKey: ["content-automation-ideas"],
    queryFn: async () => {
      const res = await fetch("/api/admin/topic-ideas", { headers: adminHeaders() });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || res.statusText);
      return json as NormalizedIdea[];
    },
  });

  const patchSettings = useMutation({
    mutationFn: async (patch: Partial<AutomationSettings>) => {
      const res = await fetch("/api/admin/automation-settings", {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify(patch),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || res.statusText);
      return json as AutomationSettings;
    },
    onSuccess: (data) => {
      qc.setQueryData(["content-automation-settings"], data);
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runPublish = useMutation({
    mutationFn: async (kind: "blog" | "page") => {
      const path = kind === "blog" ? "/api/run-blog-publish" : "/api/run-static-publish";
      const res = await fetch(path, { method: "POST", headers: adminHeaders() });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || res.statusText);
      return json;
    },
    onSuccess: (json) => {
      const pretty = JSON.stringify(json, null, 2);
      setRunResult(pretty);
      window.alert(pretty);
      qc.invalidateQueries({ queryKey: ["content-automation-ideas"] });
      toast.success("Publish run finished");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadIdeas = useMutation({
    mutationFn: async (items: Array<Record<string, unknown>>) => {
      const res = await fetch("/api/admin/topic-ideas", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ items }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || res.statusText);
      return json;
    },
    onSuccess: (json) => {
      toast.success(`Uploaded — blog ${json.blogUpserted ?? 0}, pages ${json.pageUpserted ?? 0}`);
      qc.invalidateQueries({ queryKey: ["content-automation-ideas"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendToGeneration = useMutation({
    mutationFn: async (idea: NormalizedIdea) =>
      sendToGenerationFn({ data: { ideaType: idea.type, ideaId: idea.id } }),
    onSuccess: (result: { message?: string }) => {
      toast.success(result.message || "Queued for content generation (not published).");
      qc.invalidateQueries({ queryKey: ["content-automation-ideas"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const settings = settingsQ.data;
  const allIdeas = ideasQ.data ?? [];
  const filtered = useMemo(
    () =>
      allIdeas
        .filter((i) => typeFilter === "all" || i.type === typeFilter)
        .filter((i) => statusFilter === "all" || i.status === statusFilter),
    [allIdeas, typeFilter, statusFilter],
  );

  function handleBulkUpload() {
    const raw = bulkTextareaRef.current?.value ?? bulkText;
    if (import.meta.env.DEV) {
      console.log("[content-automation] bulk raw", JSON.stringify(raw));
    }
    const parsed = parseBulkContentIdeas(raw);
    if (import.meta.env.DEV) {
      console.log("[content-automation] parse result", parsed);
    }
    setParseErrors(parsed.errors.map((e) => e.reason));
    const items = [...parsed.blogItems, ...parsed.pageItems];
    if (items.length === 0) {
      toast.error(parsed.errors.length > 0 ? "Nothing valid to upload — see the warnings below" : "No ideas to upload");
      return;
    }
    uploadIdeas.mutate(items, {
      onSuccess: () => {
        if (parsed.errors.length === 0) setBulkText("");
      },
    });
  }

  const missingSecret = !import.meta.env.VITE_ADMIN_API_SECRET;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Content Automation"
        description="Unified SEO content engine: daily publish quotas, keyword targets, Pexels images, and 15-day intelligent refresh. Cron still runs at 06:00 (blog) and 07:00 (pages) UTC."
      />

      {missingSecret && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          VITE_ADMIN_API_SECRET is not set. Admin API calls will return 401 until you add it (same value as ADMIN_API_SECRET).
        </p>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="ideas">Content Ideas</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="existing">Existing</TabsTrigger>
          <TabsTrigger value="refresh">Refresh</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="versions">Versions</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="cannibalization">Cannibalization</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <SeoOverviewPanel />
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-5">
              {settingsQ.isLoading || !settings ? (
                <p className="text-sm text-muted-foreground">Loading settings…</p>
              ) : (
                <>
                  <ToggleRow
                    label="Automation enabled"
                    desc="When off, cron and Run Now both skip publishing."
                    value={settings.automation_enabled}
                    onChange={(v) => patchSettings.mutate({ automation_enabled: v })}
                    disabled={patchSettings.isPending}
                  />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <NumberField
                      label="Blog posts per day"
                      value={settings.blog_posts_per_day}
                      min={0}
                      max={20}
                      onChange={(v) => patchSettings.mutate({ blog_posts_per_day: v })}
                      hint="Default 2. Cron and Run Now share this quota."
                    />
                    <NumberField
                      label="SEO pages per day"
                      value={settings.static_pages_per_day}
                      min={0}
                      max={50}
                      onChange={(v) => patchSettings.mutate({ static_pages_per_day: v })}
                      hint="Default 3. Cron and Run Now share this quota."
                    />
                    <NumberField
                      label="Daily total limit"
                      value={settings.daily_total_limit ?? 5}
                      min={0}
                      max={20}
                      onChange={(v) => patchSettings.mutate({ daily_total_limit: v })}
                      hint="Hard cap across blogs + pages. Default 5."
                    />
                  </div>
                  <ToggleRow label="Auto SEO optimization" desc="When on, injects keyword/intent context, enforces the thin-content floor, and allows intelligent refresh rewrites. New-publish quality and link gates always run." value={settings.auto_seo_optimization} onChange={(v) => patchSettings.mutate({ auto_seo_optimization: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Auto internal linking" desc="Keep planned, inventory-validated internal links." value={settings.auto_internal_linking} onChange={(v) => patchSettings.mutate({ auto_internal_linking: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Two-way linking" desc="Add a contextual back-link on a related live item when it is genuinely useful. The update is sanitized before it is written." value={settings.two_way_linking} onChange={(v) => patchSettings.mutate({ two_way_linking: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Cannibalization check" desc="Skip new publish when an existing item already targets the same primary keyword." value={settings.cannibalization_check} onChange={(v) => patchSettings.mutate({ cannibalization_check: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Broken link check" desc="On refresh and two-way links, rewrite invented/unpublished Yaarzo URLs and abort the write if blocking link issues remain. Invented URLs are always rewritten." value={settings.broken_link_check} onChange={(v) => patchSettings.mutate({ broken_link_check: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="New page discovery" desc="Include existing published Yaarzo inventory URLs in generation context so the model can differentiate. Does not enqueue extra pages beyond the daily quota." value={settings.new_page_discovery} onChange={(v) => patchSettings.mutate({ new_page_discovery: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Content refresh" desc="15-day intelligent refresh after each cron run. Good images are kept." value={settings.content_refresh_enabled} onChange={(v) => patchSettings.mutate({ content_refresh_enabled: v })} disabled={patchSettings.isPending} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField label="Refresh interval (days)" value={settings.refresh_interval_days ?? 15} min={1} max={365} onChange={(v) => patchSettings.mutate({ refresh_interval_days: v })} />
                    <NumberField label="Minimum meaningful change %" value={settings.minimum_content_change_percent ?? 10} min={0} max={100} onChange={(v) => patchSettings.mutate({ minimum_content_change_percent: v })} hint="Threshold for evaluating a refresh, not a rewrite quota." />
                  </div>
                  <ToggleRow label="Only update when meaningful" value={settings.only_update_when_meaningful} onChange={(v) => patchSettings.mutate({ only_update_when_meaningful: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Dry-run optimization" desc="Audit and propose refresh/migration changes without writing published content." value={settings.dry_run_optimization} onChange={(v) => patchSettings.mutate({ dry_run_optimization: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Keep previous versions" desc="Snapshot live HTML before refresh, two-way link, and regenerate writes. Restore still works on versions that already exist." value={settings.keep_previous_versions} onChange={(v) => patchSettings.mutate({ keep_previous_versions: v })} disabled={patchSettings.isPending} />
                  <NumberField label="Maximum versions" value={settings.max_versions ?? 10} min={1} max={50} onChange={(v) => patchSettings.mutate({ max_versions: v })} />
                  <ToggleRow label="Pexels images" desc="One server-side Pexels image per new item. Uses PEXELS_API_KEY only on the server." value={settings.pexels_images_enabled} onChange={(v) => patchSettings.mutate({ pexels_images_enabled: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Image markup optimization" desc="Add width, height, lazy-loading, and async decoding on the selected Pexels image. Does not re-encode or download files." value={settings.image_optimization} onChange={(v) => patchSettings.mutate({ image_optimization: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Prevent duplicate Pexels photos" value={settings.image_duplicate_prevention} onChange={(v) => patchSettings.mutate({ image_duplicate_prevention: v })} disabled={patchSettings.isPending} />
                  <ToggleRow label="Pause existing-content migration" value={settings.migration_paused} onChange={(v) => patchSettings.mutate({ migration_paused: v })} disabled={patchSettings.isPending} />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => runPublish.mutate("blog")}
                      disabled={runPublish.isPending}
                    >
                      {runPublish.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                      Run Blog Publish Now
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => runPublish.mutate("page")}
                      disabled={runPublish.isPending}
                    >
                      {runPublish.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                      Run Static Pages Publish Now
                    </Button>
                  </div>
                  {runResult && (
                    <pre className="max-h-64 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">{runResult}</pre>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ideas" className="mt-4 space-y-4">
          <Card>
            <CardContent className="space-y-3 p-5">
              <h3 className="text-sm font-semibold">Bulk Add Content Ideas</h3>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  Create ideas with a main keyword — they enter the Pending List below.
                  From each pending row, open Keyword Research, then explicitly Send to Content Generation.
                  Separate each idea with a blank line.
                </p>
                <p>
                  For a blog post:<br />
                  <code>Blog: &lt;title&gt;</code><br />
                  <code>About: &lt;short description&gt;</code><br />
                  <code>Keywords: &lt;main keyword, optional extras&gt;</code>
                </p>
                <p>
                  For a chat-room page:<br />
                  <code>Page: &lt;city or topic name&gt;</code><br />
                  <code>Country: &lt;e.g. Pakistan, India — helps categorize automatically&gt;</code><br />
                  <code>Keywords: &lt;main keyword, optional extras&gt;</code>
                </p>
              </div>
              <Textarea
                ref={bulkTextareaRef}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={12}
                className="font-mono text-xs"
                placeholder={`Blog: How to Make Friends After College
About: Practical tips for building a social circle after graduating.
Keywords: make friends after college, social circle tips

Page: Rawalpindi
Country: Pakistan
Keywords: rawalpindi chat room, pakistan chat online

Page: Quetta Girls
Country: Pakistan
Type: girls`}
              />
              <Button type="button" onClick={handleBulkUpload} disabled={uploadIdeas.isPending}>
                {uploadIdeas.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload
              </Button>
            </CardContent>
          </Card>

          {parseErrors.length > 0 && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">
                {parseErrors.length} block{parseErrors.length === 1 ? "" : "s"} need fixing. Valid ideas were still uploaded.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-800 dark:text-amber-200">
                {parseErrors.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Type:</span>
            {(["all", "blog", "page"] as const).map((t) => (
              <Button
                key={t}
                size="sm"
                variant={typeFilter === t ? "default" : "outline"}
                onClick={() => setTypeFilter(t)}
              >
                {t.toUpperCase()}
              </Button>
            ))}
            <span className="ml-3 text-muted-foreground">Status:</span>
            {(["all", "pending", "published"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? "default" : "outline"}
                onClick={() => setStatusFilter(s)}
              >
                {s.toUpperCase()}
              </Button>
            ))}
            <span className="ml-auto text-xs text-muted-foreground">{filtered.length} shown</span>
          </div>

          <Card>
            <CardContent className="p-0">
              {ideasQ.isLoading ? (
                <p className="p-5 text-sm text-muted-foreground">Loading ideas…</p>
              ) : ideasQ.isError ? (
                <p className="p-5 text-sm text-destructive">{(ideasQ.error as Error).message}</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[64rem] border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Title / Slug</th>
                        <th className="px-4 py-3 font-medium">Category / Section</th>
                        <th className="w-48 max-w-[12rem] px-4 py-3 font-medium">Keywords</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((idea, idx) => (
                        <tr key={`${idea.type}-${idea.identifier}-${idx}`} className="border-b last:border-0">
                          <td className="px-4 py-2">{idea.type === "blog" ? "Blog" : "Page"}</td>
                          <td className="px-4 py-2">{idea.identifier}</td>
                          <td className="px-4 py-2 text-muted-foreground">{idea.grouping}</td>
                          <td className="w-48 max-w-[12rem] px-4 py-2">
                            {idea.keywords ? (
                              <span className="block truncate text-xs text-muted-foreground" title={idea.keywords}>
                                {idea.keywords}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-col gap-1">
                              <Badge variant={idea.status === "published" ? "default" : "secondary"}>
                                {idea.status === "published" ? "Published" : "Pending"}
                              </Badge>
                              {idea.status === "pending" && idea.generationReady ? (
                                <Badge variant="outline" className="w-fit text-[10px]">
                                  Ready for generation
                                </Badge>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {idea.status === "pending" ? (
                              <div className="flex flex-col gap-1 sm:flex-row">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    setResearchIdea({
                                      id: idea.id,
                                      type: idea.type,
                                      identifier: idea.identifier,
                                      baseName: idea.baseName,
                                      keywords: idea.keywords,
                                    })
                                  }
                                >
                                  Keyword Research
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={idea.generationReady ? "secondary" : "default"}
                                  disabled={sendToGeneration.isPending}
                                  onClick={() => sendToGeneration.mutate(idea)}
                                >
                                  {sendToGeneration.isPending ? (
                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                  ) : null}
                                  {idea.generationReady ? "Ready" : "Send to Content Generation"}
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                            No ideas match these filters. Upload content ideas with a main keyword to start.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords" className="mt-4">
          <SeoKeywordsPanel />
        </TabsContent>
        <TabsContent value="existing" className="mt-4">
          <SeoInventoryPanel />
        </TabsContent>
        <TabsContent value="refresh" className="mt-4">
          <SeoRefreshPanel />
        </TabsContent>
        <TabsContent value="images" className="mt-4">
          <SeoImagesPanel />
        </TabsContent>
        <TabsContent value="versions" className="mt-4">
          <SeoVersionsPanel />
        </TabsContent>
        <TabsContent value="jobs" className="mt-4">
          <SeoJobsPanel />
        </TabsContent>
        <TabsContent value="cannibalization" className="mt-4">
          <SeoCannibalizationPanel />
        </TabsContent>
      </Tabs>

      <PendingKeywordResearchDialog
        open={Boolean(researchIdea)}
        onOpenChange={(open) => {
          if (!open) setResearchIdea(null);
        }}
        idea={researchIdea}
      />
    </div>
  );
}
