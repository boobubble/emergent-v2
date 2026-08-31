import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Play, Upload } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { NumberField, ToggleRow } from "@/components/admin/SettingsSection";

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
      setBulkText("");
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
    const lines = bulkText.split("\n").filter((l) => l.trim());
    const items: Array<Record<string, unknown>> = [];
    const invalid: string[] = [];

    for (const line of lines) {
      const parts = line.split("|").map((s) => s.trim());
      const type = parts[0]?.toLowerCase();
      if (type === "blog") {
        if (!parts[1] || !parts[2]) {
          invalid.push(line);
          continue;
        }
        items.push({
          type: "blog",
          title: parts[1],
          categorySlug: parts[2],
          metaDescription: parts[3] || "",
        });
      } else if (type === "page") {
        if (!parts[1] || !parts[2] || !parts[3]) {
          invalid.push(line);
          continue;
        }
        items.push({
          type: "page",
          slug: parts[1],
          section: parts[2],
          baseName: parts[3],
          lookupCity: parts[4] || null,
          lookupCountryHint: parts[5] || null,
        });
      } else {
        invalid.push(line);
      }
    }

    if (invalid.length > 0) {
      toast.error(`${invalid.length} line(s) skipped — each line must start with "blog" or "page"`);
    }
    if (items.length === 0) {
      toast.error("No valid ideas to upload");
      return;
    }
    uploadIdeas.mutate(items);
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
              <p className="text-xs text-muted-foreground">
                Format — one per line:<br />
                <code>blog | Title | categorySlug | metaDescription</code><br />
                <code>page | slug | section | baseName | lookupCity | lookupCountryHint</code>
              </p>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={6}
                className="font-mono text-xs"
                placeholder={"blog | How to Make Friends After College | social-network | Practical tips...\npage | rawalpindi-chat-room | pakistan_city | rawalpindi | Rawalpindi | Pakistan"}
              />
              <Button onClick={handleBulkUpload} disabled={uploadIdeas.isPending}>
                {uploadIdeas.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload
              </Button>
            </CardContent>
          </Card>

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
                        <th className="px-4 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((idea, idx) => (
                        <tr key={`${idea.type}-${idea.identifier}-${idx}`} className="border-b last:border-0">
                          <td className="px-4 py-2">{idea.type === "blog" ? "Blog" : "Page"}</td>
                          <td className="px-4 py-2">{idea.identifier}</td>
                          <td className="px-4 py-2 text-muted-foreground">{idea.grouping}</td>
                          <td className="px-4 py-2">
                            <Badge variant={idea.status === "published" ? "default" : "secondary"}>
                              {idea.status === "published" ? "Published" : "Pending"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
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
