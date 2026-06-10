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
    <Card className="transition-colors hover:bg-muted/40">
      <CardContent className="flex items-center gap-2 p-3">
        <a
          href={`/admin/pages/edit/${page.id}`}
          target="_blank"
          rel="noreferrer"
          title="Edit in new tab"
          className="flex min-w-0 flex-1 items-center gap-2"
        >
          <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-medium">{page.title || "(untitled)"}</span>
          {page.featured && <Star className="h-3.5 w-3.5 shrink-0 text-yellow-500" />}
          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground/60" />
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
      </CardContent>
    </Card>
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
