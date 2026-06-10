import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminToggle } from "@/components/admin/AdminToggle";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  listPages, savePage, deletePage, exportPages, importPages,
  listRedirects, saveRedirect, deleteRedirect, slugify,
} from "@/lib/pages.functions";
import {
  exportAs, parseImport, detectFormatFromName, downloadFile,
  type ExportFormat, type PageRecord,
} from "@/lib/pages-io";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  Plus, Pencil, Trash2, Download, Upload, ExternalLink, Eye, Star,
  ArrowRightLeft, FileText,
} from "lucide-react";

export const Route = createFileRoute("/admin/pages")({ component: PagesAdmin });

type PageRow = PageRecord & {
  id: string;
  views: number;
  updated_at: string;
  published_at: string | null;
};

const LAYOUTS: { value: "boxed" | "full"; label: string; hint: string }[] = [
  { value: "boxed", label: "Boxed container", hint: "Centered max-width article (classic blog/landing)" },
  { value: "full", label: "Full width", hint: "Edge-to-edge layout for custom designs" },
];

const SIDEBAR_OPTIONS: { value: "none" | "ads" | "feed"; label: string }[] = [
  { value: "none", label: "None" },
  { value: "ads", label: "Ads slot" },
  { value: "feed", label: "Feed menu" },
];

function emptyPage(): PageRow {
  return {
    id: "",
    slug: "",
    title: "",
    content: "",
    excerpt: "",
    tags: [],
    status: "draft",
    featured: false,
    layout: "boxed",
    sidebar_left: "none",
    sidebar_right: "none",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    canonical_url: "",
    noindex: false,
    nofollow: false,
    views: 0,
    updated_at: "",
    published_at: null,
  };
}

function PagesAdmin() {
  const fetchList = useServerFn(listPages);
  const fetchRedirects = useServerFn(listRedirects);
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  // Editor moved to /admin/pages/edit/:id — opened in a new tab.

  const pagesQ = useQuery({
    queryKey: ["admin", "pages", q],
    queryFn: () => fetchList({ data: { q: q || undefined } }),
    staleTime: 30_000,
  });
  const redirectsQ = useQuery({
    queryKey: ["admin", "redirects"],
    queryFn: () => fetchRedirects({}),
    staleTime: 60_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin", "pages"] });

  return (
    <div>
      <AdminPageHeader
        title="Custom Pages"
        description="A lightweight, SEO-friendly CMS for landing, room, blog and info pages."
      />

      <Tabs defaultValue="pages">
        <TabsList className="mb-4 flex w-full flex-wrap">
          <TabsTrigger value="pages"><FileText className="mr-1.5 h-3.5 w-3.5" />Pages</TabsTrigger>
          <TabsTrigger value="io"><Download className="mr-1.5 h-3.5 w-3.5" />Import / Export</TabsTrigger>
          <TabsTrigger value="redirects"><ArrowRightLeft className="mr-1.5 h-3.5 w-3.5" />Redirects</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-3">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-2 p-3">
              <Input placeholder="Search pages…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
              <a href="/admin/pages/edit/new" target="_blank" rel="noreferrer" className="ml-auto">
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />New page
                </Button>
              </a>
            </CardContent>
          </Card>


          {pagesQ.isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (pagesQ.data ?? []).length === 0 ? (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No pages yet. Create your first one.</CardContent></Card>
          ) : (
            <div className="grid gap-2">
              {(pagesQ.data as PageRow[]).map((p) => (
                <PageListRow key={p.id} page={p} onChanged={invalidate} />
              ))}
            </div>

          )}
        </TabsContent>

        <TabsContent value="io">
          <ImportExportTab pages={(pagesQ.data ?? []) as PageRow[]} onImported={invalidate} />
        </TabsContent>

        <TabsContent value="redirects">
          <RedirectsTab
            rows={redirectsQ.data ?? []}
            loading={redirectsQ.isLoading}
            onChanged={() => qc.invalidateQueries({ queryKey: ["admin", "redirects"] })}
          />
        </TabsContent>
      </Tabs>

      {/* Editor opens in a new tab via /admin/pages/edit/:id */}

    </div>
  );
}

function PageListRow({ page, onChanged }: { page: PageRow; onChanged: () => void }) {
  const del = useServerFn(deletePage);
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">{page.title || "(untitled)"}</span>
            {page.featured && <Star className="h-3.5 w-3.5 text-yellow-500" />}
            <Badge variant={page.status === "published" ? "default" : "outline"} className="text-[10px]">{page.status}</Badge>
            <Badge variant="outline" className="text-[10px]">{page.layout === "full" ? "full" : "boxed"}</Badge>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-mono">/{page.slug}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" />{page.views}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {page.status === "published" && (
            <a href={`/${page.slug}`} target="_blank" rel="noreferrer">
              <Button size="icon" variant="ghost" title="Open"><ExternalLink className="h-4 w-4" /></Button>
            </a>
          )}
          <a href={`/admin/pages/edit/${page.id}`} target="_blank" rel="noreferrer">
            <Button size="icon" variant="ghost" title="Edit in new tab"><Pencil className="h-4 w-4" /></Button>
          </a>

          <Button
            size="icon"
            variant="ghost"
            title="Delete"
            onClick={async () => {
              if (!confirm(`Delete page "${page.title}"?`)) return;
              try {
                await del({ data: { id: page.id } });
                toast.success("Page deleted");
                onChanged();
              } catch (e: unknown) {
                toast.error((e as Error)?.message ?? "Delete failed");
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PageEditorDialog({ page, onClose, onSaved }: { page: PageRow | null; onClose: () => void; onSaved: () => void }) {
  const save = useServerFn(savePage);
  const [row, setRow] = useState<PageRow | null>(page);
  const [autoSlug, setAutoSlug] = useState(!page?.id);
  const [tab, setTab] = useState("content");

  // Reset when page changes
  useMemo(() => { setRow(page); setAutoSlug(!page?.id); setTab("content"); }, [page]);

  if (!row) return null;
  const update = <K extends keyof PageRow>(k: K, v: PageRow[K]) => setRow((r) => (r ? { ...r, [k]: v } : r));

  async function handleSave(overwrite = false) {
    if (!row) return;
    try {
      const payload = {
        id: row.id || undefined,
        slug: row.slug || slugify(row.title),
        title: row.title,
        content: row.content,
        excerpt: row.excerpt || null,
        layout: row.layout,
        sidebar_left: row.sidebar_left,
        sidebar_right: row.sidebar_right,
        tags: row.tags ?? [],
        status: row.status,
        featured: row.featured,
        meta_title: row.meta_title || null,
        meta_description: row.meta_description || null,
        meta_keywords: row.meta_keywords || null,
        og_title: row.og_title || null,
        og_description: row.og_description || null,
        og_image: row.og_image || null,
        canonical_url: row.canonical_url || null,
        noindex: row.noindex,
        nofollow: row.nofollow,
        overwrite,
      };
      await save({ data: payload });
      toast.success(`Page saved · /${payload.slug}`);
      onSaved();
    } catch (e: unknown) {
      const msg = (e as Error)?.message ?? "Save failed";
      if (msg.toLowerCase().includes("already in use")) {
        if (confirm(`${msg}\n\nOverwrite the existing page?`)) return handleSave(true);
      } else {
        toast.error(msg);
      }
    }
  }

  return (
    <Dialog open={!!page} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row.id ? "Edit page" : "New page"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Title</Label>
              <Input
                value={row.title}
                maxLength={200}
                onChange={(e) => {
                  const t = e.target.value;
                  setRow((r) => r ? { ...r, title: t, slug: autoSlug ? slugify(t) : r.slug } : r);
                }}
                placeholder="Indian Chat Room"
              />
            </div>
            <div>
              <Label className="text-xs">Slug · /<span className="font-mono text-foreground">{row.slug || "your-slug"}</span></Label>
              <Input
                value={row.slug}
                maxLength={120}
                onChange={(e) => { update("slug", slugify(e.target.value)); setAutoSlug(false); }}
                placeholder="indian-chat-room"
                className="font-mono"
              />
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="flex w-full flex-wrap">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="meta">Layout & status</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-3 pt-3">
              <RichTextEditor value={row.content} onChange={(html) => update("content", html)} />
              <div>
                <Label className="text-xs">Excerpt</Label>
                <Textarea value={row.excerpt ?? ""} maxLength={500} rows={2} onChange={(e) => update("excerpt", e.target.value)} placeholder="Short summary shown in listings" />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="grid gap-3 pt-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Meta title</Label>
                <Input value={row.meta_title ?? ""} maxLength={200} onChange={(e) => update("meta_title", e.target.value)} placeholder={row.title} />
              </div>
              <div>
                <Label className="text-xs">Keywords</Label>
                <Input value={row.meta_keywords ?? ""} maxLength={500} onChange={(e) => update("meta_keywords", e.target.value)} placeholder="chat, india, friends" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Meta description</Label>
                <Textarea value={row.meta_description ?? ""} rows={2} maxLength={400} onChange={(e) => update("meta_description", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">OG title</Label>
                <Input value={row.og_title ?? ""} maxLength={200} onChange={(e) => update("og_title", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">OG image URL</Label>
                <Input value={row.og_image ?? ""} maxLength={500} onChange={(e) => update("og_image", e.target.value)} placeholder="https://…" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">OG description</Label>
                <Textarea value={row.og_description ?? ""} rows={2} maxLength={400} onChange={(e) => update("og_description", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Canonical URL</Label>
                <Input value={row.canonical_url ?? ""} maxLength={500} onChange={(e) => update("canonical_url", e.target.value)} placeholder="https://example.com/page" />
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-5">
                <label className="inline-flex items-center gap-2 text-xs"><AdminToggle checked={!!row.noindex} onCheckedChange={(v) => update("noindex", v)} />Noindex</label>
                <label className="inline-flex items-center gap-2 text-xs"><AdminToggle checked={!!row.nofollow} onCheckedChange={(v) => update("nofollow", v)} />Nofollow</label>
              </div>
            </TabsContent>

            <TabsContent value="meta" className="grid gap-3 pt-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs">Page layout</Label>
                <Select value={row.layout} onValueChange={(v) => update("layout", v as "full" | "boxed")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LAYOUTS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        <span className="font-medium">{l.label}</span>
                        <span className="ml-2 text-[10px] text-muted-foreground">{l.hint}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Left sidebar</Label>
                <Select value={row.sidebar_left} onValueChange={(v) => update("sidebar_left", v as "none" | "ads" | "feed")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SIDEBAR_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Right sidebar</Label>
                <Select value={row.sidebar_right} onValueChange={(v) => update("sidebar_right", v as "none" | "ads" | "feed")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SIDEBAR_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Tags (comma separated)</Label>
                <Input
                  value={(row.tags ?? []).join(", ")}
                  onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20))}
                  placeholder="chat, india, free"
                />
              </div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={row.status} onValueChange={(v) => update("status", v as "draft" | "published")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <AdminToggle checked={!!row.featured} onCheckedChange={(v) => update("featured", v)} />
                <Label className="text-xs">Featured page</Label>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => handleSave(false)}>Save page</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImportExportTab({ pages, onImported }: { pages: PageRow[]; onImported: () => void }) {
  const exportFn = useServerFn(exportPages);
  const importFn = useServerFn(importPages);
  const fileRef = useRef<HTMLInputElement>(null);
  const [format, setFormat] = useState<ExportFormat>("json");
  const [mode, setMode] = useState<"skip" | "overwrite">("skip");

  async function handleExport() {
    try {
      const rows = await exportFn({ data: {} });
      const out = exportAs(format, rows as PageRecord[]);
      downloadFile(out.name, out.mime, out.body);
      toast.success(`Exported ${rows.length} pages`);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Export failed");
    }
  }

  async function handleFile(file: File) {
    const raw = await file.text();
    const fmt = detectFormatFromName(file.name);
    try {
      const parsed = parseImport(fmt, raw);
      if (!parsed.length) { toast.error("No pages found in file"); return; }
      const res = await importFn({ data: { pages: parsed, mode } });
      toast.success(`Imported ${res.imported}, overwritten ${res.overwritten}, skipped ${res.skipped}`);
      onImported();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Import failed");
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Download className="h-4 w-4" />Export</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Backup all {pages.length} pages as a single file.</p>
          <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="md">Markdown</SelectItem>
              <SelectItem value="txt">Plain text</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="w-full"><Download className="mr-1 h-4 w-4" />Export all pages</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" />Import</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Supports .json, .xml, .html, .md, .txt</p>
          <Select value={mode} onValueChange={(v) => setMode(v as "skip" | "overwrite")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">Skip pages whose slug exists</SelectItem>
              <SelectItem value="overwrite">Overwrite existing slugs</SelectItem>
            </SelectContent>
          </Select>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.xml,.html,.htm,.md,.markdown,.txt"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
          />
          <Button variant="outline" className="w-full" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1 h-4 w-4" />Choose file…
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface RedirectRow { id: string; from_slug: string; to_slug: string }

function RedirectsTab({ rows, loading, onChanged }: { rows: RedirectRow[]; loading: boolean; onChanged: () => void }) {
  const save = useServerFn(saveRedirect);
  const del = useServerFn(deleteRedirect);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader><CardTitle className="text-base">Add redirect</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="old-slug" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input placeholder="new-slug" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button
            size="sm"
            disabled={!from.trim() || !to.trim()}
            onClick={async () => {
              try {
                await save({ data: { from_slug: from, to_slug: to } });
                toast.success("Redirect saved");
                setFrom(""); setTo(""); onChanged();
              } catch (e: unknown) { toast.error((e as Error)?.message ?? "Failed"); }
            }}
          >Save</Button>
        </CardContent>
      </Card>

      {loading ? <Skeleton className="h-20 w-full" /> : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No redirects configured.</p>
      ) : (
        <div className="grid gap-1.5">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center gap-3 p-3 text-sm">
                <span className="font-mono">/{r.from_slug}</span>
                <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono">/{r.to_slug}</span>
                <Button
                  size="icon" variant="ghost" className="ml-auto"
                  onClick={async () => {
                    if (!confirm("Delete redirect?")) return;
                    await del({ data: { id: r.id } });
                    toast.success("Removed"); onChanged();
                  }}
                ><Trash2 className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
