import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getAllSeo, upsertSeo, getSeoTargetsSummary } from "@/lib/admin.functions";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/seo")({ component: SeoPage });

const STATIC_PAGES = [
  { key: "home", label: "Homepage", path: "/" },
  { key: "chatrooms", label: "Chatrooms", path: "/chat" },
  { key: "feed", label: "Feed", path: "/feed" },
  { key: "profiles", label: "Profiles", path: "/profile" },
  { key: "games", label: "Games", path: "/games" },
  { key: "friends", label: "Find Friends", path: "/friends" },
];

type SeoRow = {
  page_key: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card: string | null;
};

function emptySeo(key: string): SeoRow {
  return { page_key: key, title: "", description: "", keywords: "", og_title: "", og_description: "", og_image: "", twitter_card: "summary_large_image" };
}

function SeoPage() {
  const fetchAll = useServerFn(getAllSeo);
  const fetchSummary = useServerFn(getSeoTargetsSummary);
  const all = useQuery({ queryKey: ["admin", "seo"], queryFn: () => fetchAll({}), staleTime: 60_000 });
  const summary = useQuery({ queryKey: ["admin", "seo-summary"], queryFn: () => fetchSummary({}), staleTime: 60_000 });

  const [customKey, setCustomKey] = useState("");

  const byKey: Record<string, SeoRow> = {};
  for (const row of (all.data ?? []) as SeoRow[]) byKey[row.page_key] = row;

  const customRows = (all.data ?? []).filter((r) => !STATIC_PAGES.some((p) => p.key === r.page_key));

  return (
    <div>
      <AdminPageHeader
        title="SEO"
        description="Manage metadata for static pages and dynamic content."
      />

      <Tabs defaultValue="static">
        <TabsList className="mb-4 flex w-full flex-wrap">
          <TabsTrigger value="static">Static pages</TabsTrigger>
          <TabsTrigger value="dynamic">Dynamic content</TabsTrigger>
          <TabsTrigger value="custom">Custom pages</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>

        <TabsContent value="static" className="space-y-3">
          {all.isLoading ? <Skeleton className="h-40 w-full" /> : STATIC_PAGES.map((p) => (
            <SeoEditor key={p.key} title={p.label} path={p.path} initial={byKey[p.key] ?? emptySeo(p.key)} />
          ))}
        </TabsContent>

        <TabsContent value="dynamic">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Dynamic SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Metadata for rooms, profiles, posts, and games is generated automatically per page from live content. You can override the default template strings below.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryStat label="Rooms" value={summary.data?.rooms} />
                <SummaryStat label="Profiles" value={summary.data?.profiles} />
                <SummaryStat label="Public posts" value={summary.data?.publicPosts} />
                <SummaryStat label="Games" value={summary.data?.games} />
              </div>
              {["dynamic:room", "dynamic:profile", "dynamic:post", "dynamic:game"].map((k) => (
                <SeoEditor key={k}
                  title={k.replace("dynamic:", "Template · ")}
                  path={`{${k.split(":")[1]}.slug}`}
                  helper="Use placeholders like {name}, {title}, {username}, {excerpt}."
                  initial={byKey[k] ?? emptySeo(k)}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Add custom page</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input placeholder="page key (e.g. about, pricing)" value={customKey} onChange={(e) => setCustomKey(e.target.value)} className="max-w-xs" />
                <Button
                  size="sm"
                  disabled={!customKey.trim()}
                  onClick={() => {
                    if (customKey.trim()) {
                      byKey[customKey.trim()] = emptySeo(customKey.trim());
                      setCustomKey("");
                      all.refetch();
                    }
                  }}
                >Add</Button>
              </div>
            </CardContent>
          </Card>
          {customRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom pages yet.</p>
          ) : (
            customRows.map((r) => <SeoEditor key={r.page_key} title={r.page_key} path={`/${r.page_key}`} initial={r as SeoRow} />)
          )}
        </TabsContent>

        <TabsContent value="sitemap">
          <Card>
            <CardHeader><CardTitle className="text-base">Sitemap & indexing</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Sitemap URL</span>
                <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-primary underline">/sitemap.xml</a>
              </div>
              <div className="flex items-center justify-between">
                <span>Robots</span>
                <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-primary underline">/robots.txt</a>
              </div>
              <p className="text-xs text-muted-foreground">Sitemap entries are generated from your live routes and public content. Disable indexing for specific pages with the editor above (set keywords field to <code>noindex</code>).</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-md border border-border/60 p-3">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value ?? 0}</div>
    </div>
  );
}

function SeoEditor({ title, path, initial, helper }: { title: string; path: string; initial: SeoRow; helper?: string }) {
  const save = useServerFn(upsertSeo);
  const qc = useQueryClient();
  const [row, setRow] = useState<SeoRow>(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setRow(initial), [initial.page_key]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (k: keyof SeoRow, v: string) => setRow((r) => ({ ...r, [k]: v }));

  async function handleSave() {
    setSaving(true);
    try {
      await save({ data: {
        page_key: row.page_key,
        title: row.title || null,
        description: row.description || null,
        keywords: row.keywords || null,
        og_title: row.og_title || null,
        og_description: row.og_description || null,
        og_image: row.og_image || null,
        twitter_card: row.twitter_card || "summary_large_image",
      }});
      toast.success(`Saved · ${row.page_key}`);
      qc.invalidateQueries({ queryKey: ["admin", "seo"] });
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally { setSaving(false); }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <Badge variant="outline" className="font-mono text-[10px]">{path}</Badge>
        </div>
        {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field label="Meta title" max={60}>
          <Input value={row.title ?? ""} maxLength={120} onChange={(e) => update("title", e.target.value)} placeholder="Tab title shown in browsers" />
        </Field>
        <Field label="Keywords">
          <Input value={row.keywords ?? ""} maxLength={500} onChange={(e) => update("keywords", e.target.value)} placeholder="comma, separated, keywords" />
        </Field>
        <Field label="Meta description" max={160} className="sm:col-span-2">
          <Textarea value={row.description ?? ""} maxLength={300} onChange={(e) => update("description", e.target.value)} rows={2} placeholder="Shown in search results" />
        </Field>
        <Field label="Open Graph title">
          <Input value={row.og_title ?? ""} maxLength={120} onChange={(e) => update("og_title", e.target.value)} />
        </Field>
        <Field label="OG image URL">
          <Input value={row.og_image ?? ""} maxLength={500} onChange={(e) => update("og_image", e.target.value)} placeholder="https://…" />
        </Field>
        <Field label="OG description" className="sm:col-span-2">
          <Textarea value={row.og_description ?? ""} maxLength={300} onChange={(e) => update("og_description", e.target.value)} rows={2} />
        </Field>
        <Field label="Twitter card">
          <Select value={row.twitter_card ?? "summary_large_image"} onValueChange={(v) => update("twitter_card", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">summary</SelectItem>
              <SelectItem value="summary_large_image">summary_large_image</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-end justify-end sm:col-span-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children, max, className }: { label: string; children: React.ReactNode; max?: number; className?: string }) {
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        {max && <span className="text-[10px] text-muted-foreground">Recommended ≤ {max}</span>}
      </div>
      {children}
    </div>
  );
}
