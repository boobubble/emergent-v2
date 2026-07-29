import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SeoPreviewPanels } from "@/components/admin/seo/SeoPreviewPanels";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  aiGenerateSeoField,
  bulkSeoAction,
  getSeoManagerState,
  syncSeoRoutes,
  upsertSeoGlobal,
  upsertSeoPage,
} from "@/lib/seo.functions";
import { SEO_HEALTH_LABELS, resolvePageSeo, type SeoGlobal, type SeoPageRow } from "@/lib/seo";
import {
  AlertTriangle, CheckCircle2, ExternalLink, RefreshCw, Search, Sparkles, Wand2,
} from "lucide-react";

export const Route = createFileRoute("/admin/seo")({ component: SeoManagerPage });

function SeoManagerPage() {
  const qc = useQueryClient();
  const fetchState = useServerFn(getSeoManagerState);
  const syncRoutes = useServerFn(syncSeoRoutes);
  const state = useQuery({ queryKey: ["seo-manager"], queryFn: () => fetchState({}), staleTime: 30_000 });

  useEffect(() => {
    syncRoutes({}).then((r) => {
      if (r.inserted > 0) void qc.invalidateQueries({ queryKey: ["seo-manager"] });
    }).catch(() => { /* first load */ });
  }, [syncRoutes, qc]);

  const global = state.data?.global ?? null;
  const pages = (state.data?.pages ?? []) as SeoPageRow[];
  const catalog = state.data?.catalog ?? [];
  const health = state.data?.health ?? [];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="SEO Manager"
        description="Single source of truth for global SEO, per-page metadata, sitemap, and previews."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />Sitemap</a>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <a href="/robots.txt" target="_blank" rel="noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />Robots</a>
            </Button>
            <Button size="sm" variant="outline" onClick={() => { void state.refetch(); void syncRoutes({}).then(() => qc.invalidateQueries({ queryKey: ["seo-manager"] })); }}>
              <RefreshCw className="mr-1 h-3.5 w-3.5" />Sync routes
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <Badge variant="secondary">{catalog.length} routes in catalog</Badge>
        <Badge variant="secondary">{pages.length} page configs</Badge>
        <Badge variant="secondary">{pages.filter((p) => p.auto_discovered).length} auto-discovered</Badge>
        <Badge variant="outline">{health.filter((h) => h.issues.length === 0).length} healthy pages</Badge>
      </div>

      {state.isLoading ? <Skeleton className="h-96 w-full" /> : (
        <Tabs defaultValue="global">
          <TabsList className="mb-4 flex w-full flex-wrap h-auto">
            <TabsTrigger value="global">Global SEO</TabsTrigger>
            <TabsTrigger value="pages">Page SEO</TabsTrigger>
            <TabsTrigger value="dynamic">Dynamic routes</TabsTrigger>
            <TabsTrigger value="health">SEO Health</TabsTrigger>
            <TabsTrigger value="bulk">Bulk & AI</TabsTrigger>
            <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          </TabsList>

          <TabsContent value="global"><GlobalSeoForm initial={global} onSaved={() => qc.invalidateQueries({ queryKey: ["seo-manager"] })} /></TabsContent>
          <TabsContent value="pages"><PageSeoTable pages={pages.filter((p) => !p.is_dynamic)} global={global} onSaved={() => qc.invalidateQueries({ queryKey: ["seo-manager"] })} /></TabsContent>
          <TabsContent value="dynamic"><PageSeoTable pages={pages.filter((p) => p.is_dynamic)} global={global} onSaved={() => qc.invalidateQueries({ queryKey: ["seo-manager"] })} dynamicMode /></TabsContent>
          <TabsContent value="health"><HealthPanel health={health} /></TabsContent>
          <TabsContent value="bulk"><BulkPanel pages={pages} onDone={() => qc.invalidateQueries({ queryKey: ["seo-manager"] })} /></TabsContent>
          <TabsContent value="sitemap"><SitemapPanel /></TabsContent>
        </Tabs>
      )}

      <Card>
        <CardContent className="py-4 text-sm text-muted-foreground">
          Duplicate SEO fields were removed from White Label and module settings.
          Manage all metadata here.{" "}
          <Link to="/admin/appearance" className="text-primary underline">Themes</Link> still controls logos and colors.
        </CardContent>
      </Card>
    </div>
  );
}

function GlobalSeoForm({ initial, onSaved }: { initial: SeoGlobal | null; onSaved: () => void }) {
  const save = useServerFn(upsertSeoGlobal);
  const [form, setForm] = useState<Partial<SeoGlobal>>(initial ?? {});
  useEffect(() => { if (initial) setForm(initial); }, [initial]);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof SeoGlobal, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSave() {
    setSaving(true);
    try {
      await save({ data: form });
      toast.success("Global SEO saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Global defaults</CardTitle></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        <Field label="Site name"><Input value={form.site_name ?? ""} onChange={(e) => set("site_name", e.target.value)} /></Field>
        <Field label="Site tagline"><Input value={form.site_tagline ?? ""} onChange={(e) => set("site_tagline", e.target.value)} /></Field>
        <Field label="Default title"><Input value={form.default_title ?? ""} onChange={(e) => set("default_title", e.target.value)} /></Field>
        <Field label="Canonical domain"><Input value={form.canonical_domain ?? ""} onChange={(e) => set("canonical_domain", e.target.value)} placeholder="yourdomain.com" /></Field>
        <Field label="Default description" className="sm:col-span-2"><Textarea value={form.default_description ?? ""} onChange={(e) => set("default_description", e.target.value)} rows={2} /></Field>
        <Field label="Default keywords" className="sm:col-span-2"><Input value={form.default_keywords ?? ""} onChange={(e) => set("default_keywords", e.target.value)} /></Field>
        <Field label="Robots"><Input value={form.robots ?? ""} onChange={(e) => set("robots", e.target.value)} placeholder="index,follow" /></Field>
        <Field label="Theme color"><Input value={form.theme_color ?? ""} onChange={(e) => set("theme_color", e.target.value)} /></Field>
        <Field label="Author"><Input value={form.author ?? ""} onChange={(e) => set("author", e.target.value)} /></Field>
        <Field label="Language"><Input value={form.language ?? ""} onChange={(e) => set("language", e.target.value)} /></Field>
        <Field label="Default OG image" className="sm:col-span-2"><Input value={form.default_og_image ?? ""} onChange={(e) => set("default_og_image", e.target.value)} placeholder="https://…" /></Field>
        <Field label="Twitter card">
          <Select value={form.twitter_card ?? "summary_large_image"} onValueChange={(v) => set("twitter_card", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">summary</SelectItem>
              <SelectItem value="summary_large_image">summary_large_image</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Twitter site"><Input value={form.twitter_site ?? ""} onChange={(e) => set("twitter_site", e.target.value)} placeholder="@site" /></Field>
        <Field label="Twitter creator"><Input value={form.twitter_creator ?? ""} onChange={(e) => set("twitter_creator", e.target.value)} /></Field>
        <Field label="Facebook App ID"><Input value={form.facebook_app_id ?? ""} onChange={(e) => set("facebook_app_id", e.target.value)} /></Field>
        <Field label="Google verification"><Input value={form.google_verification ?? ""} onChange={(e) => set("google_verification", e.target.value)} /></Field>
        <Field label="Bing verification"><Input value={form.bing_verification ?? ""} onChange={(e) => set("bing_verification", e.target.value)} /></Field>
        <Field label="Yandex verification"><Input value={form.yandex_verification ?? ""} onChange={(e) => set("yandex_verification", e.target.value)} /></Field>
        <Field label="Baidu verification"><Input value={form.baidu_verification ?? ""} onChange={(e) => set("baidu_verification", e.target.value)} /></Field>
        <div className="sm:col-span-2 flex justify-end"><Button onClick={handleSave} disabled={saving}>{saving ? "Saving…" : "Save global SEO"}</Button></div>
      </CardContent>
    </Card>
  );
}

function PageSeoTable({
  pages,
  global,
  onSaved,
  dynamicMode,
}: {
  pages: SeoPageRow[];
  global: SeoGlobal | null;
  onSaved: () => void;
  dynamicMode?: boolean;
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<SeoPageRow | null>(null);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return pages;
    return pages.filter((p) =>
      (p.label ?? "").toLowerCase().includes(s) ||
      (p.route_path ?? "").toLowerCase().includes(s) ||
      p.page_key.toLowerCase().includes(s),
    );
  }, [pages, q]);

  return (
    <>
      <div className="mb-3 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search pages…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Page</th>
              <th className="px-3 py-2">Route</th>
              <th className="px-3 py-2">Custom</th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.page_key} className="border-t hover:bg-muted/20">
                <td className="px-3 py-2 font-medium">{p.label ?? p.page_key}{p.auto_discovered && <Badge variant="outline" className="ml-2 text-[10px]">auto</Badge>}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{p.route_path ?? "—"}</td>
                <td className="px-3 py-2">{p.enabled ? <Badge>On</Badge> : <Badge variant="secondary">Off</Badge>}</td>
                <td className="px-3 py-2 max-w-[200px] truncate">{p.title || resolvePageSeo(p, global, { routePath: p.route_path ?? "/" }).title}</td>
                <td className="px-3 py-2 text-right"><Button size="sm" variant="outline" onClick={() => setSelected(p)}>Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PageEditorSheet page={selected} global={global} dynamicMode={dynamicMode} onClose={() => setSelected(null)} onSaved={() => { onSaved(); setSelected(null); }} />
    </>
  );
}

function PageEditorSheet({
  page,
  global,
  dynamicMode,
  onClose,
  onSaved,
}: {
  page: SeoPageRow | null;
  global: SeoGlobal | null;
  dynamicMode?: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const save = useServerFn(upsertSeoPage);
  const ai = useServerFn(aiGenerateSeoField);
  const [row, setRow] = useState<SeoPageRow | null>(page);
  useEffect(() => { setRow(page); }, [page]);

  const resolved = row ? resolvePageSeo(row, global, { routePath: row.route_path ?? "/" }) : null;
  if (!row) return null;

  const set = <K extends keyof SeoPageRow>(k: K, v: SeoPageRow[K]) => setRow((r) => r ? { ...r, [k]: v } : r);

  async function handleSave() {
    try {
      await save({ data: row });
      toast.success("Page SEO saved");
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function runAi(field: "title" | "description" | "keywords" | "og" | "json_ld") {
    if (!row) return;
    try {
      const out = await ai({ data: { pageKey: row.page_key, field } });
      setRow((r) => r ? {
        ...r,
        enabled: true,
        title: out.title ?? r.title,
        description: out.description ?? r.description,
        keywords: out.keywords ?? r.keywords,
        og_title: out.ogTitle ?? r.og_title,
        og_description: out.ogDescription ?? r.og_description,
        json_ld: out.jsonLd ?? r.json_ld,
      } : r);
      toast.success(`AI generated ${field}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    }
  }

  return (
    <Sheet open={!!page} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader><SheetTitle>{row.label ?? row.page_key}</SheetTitle></SheetHeader>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label>Enable custom SEO</Label>
            <Switch checked={row.enabled} onCheckedChange={(v) => set("enabled", v)} />
          </div>
          {dynamicMode && (
            <p className="text-xs text-muted-foreground">
              Dynamic template for <code>{row.route_path}</code>. Use placeholders like {"{name}"}, {"{title}"}, {"{username}"}, {"{excerpt}"}.
            </p>
          )}
          <div className="grid gap-3">
            <Field label="SEO title"><Input value={row.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="SEO description"><Textarea value={row.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={3} /></Field>
            <Field label="Keywords"><Input value={row.keywords ?? ""} onChange={(e) => set("keywords", e.target.value)} /></Field>
            <Field label="Canonical URL"><Input value={row.canonical_url ?? ""} onChange={(e) => set("canonical_url", e.target.value)} /></Field>
            <Field label="OG title"><Input value={row.og_title ?? ""} onChange={(e) => set("og_title", e.target.value)} /></Field>
            <Field label="OG description"><Textarea value={row.og_description ?? ""} onChange={(e) => set("og_description", e.target.value)} rows={2} /></Field>
            <Field label="OG image"><Input value={row.og_image ?? ""} onChange={(e) => set("og_image", e.target.value)} /></Field>
            <Field label="Twitter title"><Input value={row.twitter_title ?? ""} onChange={(e) => set("twitter_title", e.target.value)} /></Field>
            <Field label="Twitter description"><Textarea value={row.twitter_description ?? ""} onChange={(e) => set("twitter_description", e.target.value)} rows={2} /></Field>
            <Field label="Twitter image"><Input value={row.twitter_image ?? ""} onChange={(e) => set("twitter_image", e.target.value)} /></Field>
            <Field label="Robots"><Input value={row.robots ?? ""} onChange={(e) => set("robots", e.target.value)} placeholder="index,follow" /></Field>
            <Field label="JSON-LD"><Textarea value={row.json_ld ? JSON.stringify(row.json_ld, null, 2) : ""} onChange={(e) => { try { set("json_ld", JSON.parse(e.target.value)); } catch { /* typing */ } }} rows={4} className="font-mono text-xs" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Sitemap priority"><Input type="number" min={0} max={1} step={0.1} value={row.sitemap_priority ?? 0.5} onChange={(e) => set("sitemap_priority", Number(e.target.value))} /></Field>
              <Field label="Change frequency">
                <Select value={row.sitemap_changefreq ?? "weekly"} onValueChange={(v) => set("sitemap_changefreq", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm"><Switch checked={row.noindex} onCheckedChange={(v) => set("noindex", v)} /> NoIndex</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={row.nofollow} onCheckedChange={(v) => set("nofollow", v)} /> NoFollow</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={row.sitemap_exclude} onCheckedChange={(v) => set("sitemap_exclude", v)} /> Exclude sitemap</label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => runAi("title")}><Wand2 className="mr-1 h-3.5 w-3.5" />Title</Button>
            <Button size="sm" variant="secondary" onClick={() => runAi("description")}><Wand2 className="mr-1 h-3.5 w-3.5" />Description</Button>
            <Button size="sm" variant="secondary" onClick={() => runAi("keywords")}><Wand2 className="mr-1 h-3.5 w-3.5" />Keywords</Button>
            <Button size="sm" variant="secondary" onClick={() => runAi("og")}><Sparkles className="mr-1 h-3.5 w-3.5" />OG</Button>
            <Button size="sm" variant="secondary" onClick={() => runAi("json_ld")}><Sparkles className="mr-1 h-3.5 w-3.5" />JSON-LD</Button>
          </div>

          {resolved && <SeoPreviewPanels seo={resolved} />}
          <Button className="w-full" onClick={handleSave}>Save page SEO</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function HealthPanel({ health }: { health: { pageKey: string; routePath: string; label: string; issues: string[] }[] }) {
  const withIssues = health.filter((h) => h.issues.length > 0);
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" />SEO Health</CardTitle></CardHeader>
      <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
        {withIssues.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-green-600"><CheckCircle2 className="h-4 w-4" />All pages look good.</div>
        ) : withIssues.map((h) => (
          <div key={h.pageKey} className="rounded-lg border p-3">
            <div className="font-medium text-sm">{h.label} <span className="font-mono text-xs text-muted-foreground">{h.routePath}</span></div>
            <div className="mt-1 flex flex-wrap gap-1">
              {h.issues.map((i) => (
                <Badge key={i} variant="destructive" className="text-[10px]">{SEO_HEALTH_LABELS[i as keyof typeof SEO_HEALTH_LABELS] ?? i}</Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BulkPanel({ pages, onDone }: { pages: SeoPageRow[]; onDone: () => void }) {
  const bulk = useServerFn(bulkSeoAction);
  const [busy, setBusy] = useState<string | null>(null);

  async function run(action: "regenerate" | "keywords" | "descriptions" | "og" | "sitemap") {
    setBusy(action);
    try {
      const res = await bulk({ data: { action } });
      toast.success(action === "sitemap" ? "Sitemap regenerated" : `Updated ${(res as { updated?: number }).updated ?? 0} pages`);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk action failed");
    } finally { setBusy(null); }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Bulk actions</CardTitle></CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {([
          ["regenerate", "Bulk regenerate SEO"],
          ["keywords", "Generate keywords"],
          ["descriptions", "Generate descriptions"],
          ["og", "Generate OG metadata"],
          ["sitemap", "Regenerate sitemap"],
        ] as const).map(([action, label]) => (
          <Button key={action} variant="outline" disabled={!!busy} onClick={() => run(action)}>
            {busy === action ? "Working…" : label}
          </Button>
        ))}
        <p className="w-full text-xs text-muted-foreground mt-2">Applies to {pages.filter((p) => !p.is_dynamic).length} static pages. Dynamic routes use templates + live content.</p>
      </CardContent>
    </Card>
  );
}

function SitemapPanel() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Sitemap & robots</CardTitle></CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>Public sitemap and robots files are generated from SEO Manager page settings.</p>
        <div className="flex gap-3">
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="text-primary underline">/sitemap.xml</a>
          <a href="/robots.txt" target="_blank" rel="noreferrer" className="text-primary underline">/robots.txt</a>
        </div>
        <p className="text-xs text-muted-foreground">New routes are auto-synced when you open SEO Manager. Set priority, change frequency, and exclude per page in the Page SEO tab.</p>
      </CardContent>
    </Card>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs mb-1 block">{label}</Label>
      {children}
    </div>
  );
}
