import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, FileSpreadsheet, Loader2, Play, Upload } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { parseBulkContentIdeas } from "@/lib/content-automation/parse-bulk-ideas";
import { appendBulkText, excelRowsToBulkText, pickExcelIdeasSheetName } from "@/lib/content-automation/excel-ideas";

export const Route = createFileRoute("/admin/content-automation")({
  component: ContentAutomationPage,
});

type AutomationSettings = {
  id: number;
  blog_posts_per_day: number;
  static_pages_per_day: number;
  automation_enabled: boolean;
  updated_at: string | null;
};

type NormalizedIdea = {
  type: "blog" | "page";
  identifier: string;
  grouping: string;
  status: "pending" | "published";
  keywords: string | null;
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
  const [tab, setTab] = useState("settings");
  const [bulkText, setBulkText] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "blog" | "page">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "published">("all");
  const [runResult, setRunResult] = useState<string | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [excelMessage, setExcelMessage] = useState<string | null>(null);
  const [excelBusy, setExcelBusy] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);
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

  const settings = settingsQ.data;
  const allIdeas = ideasQ.data ?? [];
  const filtered = useMemo(
    () =>
      allIdeas
        .filter((i) => typeFilter === "all" || i.type === typeFilter)
        .filter((i) => statusFilter === "all" || i.status === statusFilter),
    [allIdeas, typeFilter, statusFilter],
  );

  async function handleExcelFile(file: File) {
    setExcelBusy(true);
    setExcelMessage(null);
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = pickExcelIdeasSheetName(workbook.SheetNames);
      if (!sheetName) {
        setExcelMessage("No valid Blog or Page rows found in this file — check the Kind column.");
        return;
      }
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const { text, imported } = excelRowsToBulkText(rows);
      if (imported === 0) {
        setExcelMessage("No valid Blog or Page rows found in this file — check the Kind column.");
        return;
      }
      setBulkText((prev) => appendBulkText(prev, text));
      toast.success(`Imported ${imported} idea${imported === 1 ? "" : "s"} into the textarea — review, then click Upload.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not read that Excel file";
      setExcelMessage(message);
    } finally {
      setExcelBusy(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  }

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
        description="Daily blog and static-page publishing from queued ideas. Cron runs at 06:00 (blog) and 07:00 (pages) UTC."
      />

      {missingSecret && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          VITE_ADMIN_API_SECRET is not set. Admin API calls will return 401 until you add it (same value as ADMIN_API_SECRET).
        </p>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="ideas">Content Ideas</TabsTrigger>
        </TabsList>

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
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField
                      label="Blog posts per day"
                      value={settings.blog_posts_per_day}
                      min={0}
                      max={20}
                      onChange={(v) => patchSettings.mutate({ blog_posts_per_day: v })}
                      hint="How many pending blog ideas to publish each cron/manual run."
                    />
                    <NumberField
                      label="Static pages per day"
                      value={settings.static_pages_per_day}
                      min={0}
                      max={50}
                      onChange={(v) => patchSettings.mutate({ static_pages_per_day: v })}
                      hint="How many pending page ideas to publish each cron/manual run."
                    />
                  </div>
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
                <p>Add content ideas below. Separate each idea with a blank line.</p>
                <p>
                  For a blog post:<br />
                  <code>Blog: &lt;title&gt;</code><br />
                  <code>About: &lt;short description&gt;</code><br />
                  <code>Keywords: &lt;comma-separated keywords, optional&gt;</code>
                </p>
                <p>
                  For a chat-room page:<br />
                  <code>Page: &lt;city or topic name&gt;</code><br />
                  <code>Country: &lt;e.g. Pakistan, India — helps categorize automatically&gt;</code><br />
                  <code>Keywords: &lt;comma-separated keywords, optional&gt;</code>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/templates/yaarzo-content-ideas-import-template.xlsx" download>
                    <Download className="mr-2 h-4 w-4" />
                    Download template
                  </a>
                </Button>
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleExcelFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={excelBusy}
                  onClick={() => excelInputRef.current?.click()}
                >
                  {excelBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
                  Import from Excel
                </Button>
              </div>
              {excelMessage && (
                <p className="text-xs text-amber-700 dark:text-amber-300">{excelMessage}</p>
              )}
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
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium">Title / Slug</th>
                        <th className="px-4 py-3 font-medium">Category / Section</th>
                        <th className="w-48 max-w-[12rem] px-4 py-3 font-medium">Keywords</th>
                        <th className="px-4 py-3 font-medium">Status</th>
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
                            <Badge variant={idea.status === "published" ? "default" : "secondary"}>
                              {idea.status === "published" ? "Published" : "Pending"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                            No ideas match these filters. Upload some, or run{" "}
                            <code>node migrate-json-to-db.cjs</code> once.
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
      </Tabs>
    </div>
  );
}
