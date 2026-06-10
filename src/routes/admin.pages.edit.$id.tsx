import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Save, ExternalLink, Eye, Settings2, Tag, Star,
  Image as ImageIcon, Search, Calendar, FileText, Cloud, CloudOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Collapsible } from "@/components/admin/Collapsible";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { getPage, savePage, slugify } from "@/lib/pages.functions";

export const Route = createFileRoute("/admin/pages/edit/$id")({ component: PageEditor });

type PageRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
  layout: "boxed" | "full";
  sidebar_left: "none" | "ads" | "feed";
  sidebar_right: "none" | "ads" | "feed";
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  noindex: boolean;
  nofollow: boolean;
  views?: number;
  updated_at?: string;
  published_at?: string | null;
};

function emptyPage(): PageRow {
  return {
    id: "", slug: "", title: "", content: "", excerpt: "", tags: [],
    status: "draft", featured: false, layout: "boxed",
    sidebar_left: "none", sidebar_right: "none",
    meta_title: "", meta_description: "", meta_keywords: "",
    og_title: "", og_description: "", og_image: "", canonical_url: "",
    noindex: false, nofollow: false,
  };
}

const LAYOUTS = [
  { value: "boxed", label: "Boxed container" },
  { value: "full",  label: "Full width" },
] as const;
const SIDEBARS = [
  { value: "none", label: "None" },
  { value: "ads",  label: "Ads slot" },
  { value: "feed", label: "Feed menu" },
] as const;

function PageEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const fetchPage = useServerFn(getPage);
  const save = useServerFn(savePage);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages", "edit", id],
    queryFn: () => isNew ? null : fetchPage({ data: { id } }),
    enabled: !isNew,
    staleTime: 0,
  });

  const [row, setRow] = useState<PageRow>(emptyPage());
  const [autoSlug, setAutoSlug] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [draftAt, setDraftAt] = useState<number | null>(null);
  const draftKey = `lovable.pageDraft.${id}`;
  const hydrated = useRef(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (isNew) { setRow(emptyPage()); setAutoSlug(true); }
    else if (data) { setRow({ ...emptyPage(), ...(data as any) }); setAutoSlug(false); }

    // Restore local draft if newer than server copy
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { row: PageRow; savedAt: number };
        const serverAt = (data as any)?.updated_at ? new Date((data as any).updated_at).getTime() : 0;
        if (parsed.savedAt > serverAt) {
          const ok = window.confirm("An unsaved local draft was found for this page. Restore it?");
          if (ok) {
            skipNextSave.current = true;
            setRow(parsed.row);
            setAutoSlug(false);
            setDraftAt(parsed.savedAt);
          } else {
            localStorage.removeItem(draftKey);
          }
        }
      }
    } catch { /* ignore */ }
    hydrated.current = true;
  }, [data, isNew, draftKey]);

  const update = <K extends keyof PageRow>(k: K, v: PageRow[K]) =>
    setRow((r) => ({ ...r, [k]: v }));

  // Autosave to localStorage (debounced)
  useEffect(() => {
    if (!hydrated.current) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    if (!row.title && !row.content) return;
    setDraftStatus("saving");
    const t = setTimeout(() => {
      try {
        const savedAt = Date.now();
        localStorage.setItem(draftKey, JSON.stringify({ row, savedAt }));
        setDraftAt(savedAt);
        setDraftStatus("saved");
      } catch { setDraftStatus("error"); }
    }, 800);
    return () => clearTimeout(t);
  }, [row, draftKey]);

  // Warn before closing tab if there's an unsaved local draft
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (draftStatus === "saving") { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [draftStatus]);


  async function handleSave(opts: { publish?: boolean; overwrite?: boolean } = {}) {
    if (!row.title.trim()) { toast.error("Add a title first"); return; }
    setSaving(true);
    try {
      const status = opts.publish ? "published" : row.status;
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
        status,
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
        overwrite: opts.overwrite,
      };
      const saved: any = await save({ data: payload });
      toast.success(opts.publish ? "Published" : "Saved");
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      setDraftStatus("idle");
      setDraftAt(null);
      if (saved?.id && saved.id !== row.id) {
        navigate({ to: "/admin/pages/edit/$id", params: { id: saved.id }, replace: true });
      } else {
        setRow((r) => ({ ...r, status }));
      }
    } catch (e: any) {
      const msg = e?.message ?? "Save failed";
      if (msg.toLowerCase().includes("already in use")) {
        if (confirm(`${msg}\n\nOverwrite the existing page?`)) return handleSave({ ...opts, overwrite: true });
      } else { toast.error(msg); }
    } finally { setSaving(false); }
  }

  if (!isNew && isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading editor…</div>;
  }

  const publicUrl = row.slug ? `/${row.slug}` : "";

  return (
    <div className="-m-4 sm:-m-6 min-h-screen bg-muted/30">
      {/* Top toolbar — WordPress style */}
      <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-background/95 px-3 py-2 backdrop-blur sm:px-5">
        <Link to="/admin/pages">
          <Button variant="ghost" size="icon" title="Back to pages"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="truncate text-sm font-semibold">{row.title || (isNew ? "Add New Page" : "Edit Page")}</span>
          <Badge variant={row.status === "published" ? "default" : "outline"} className="text-[10px]">{row.status}</Badge>
        </div>
        <DraftIndicator status={draftStatus} savedAt={draftAt} />
        <div className="flex items-center gap-2">
          {row.status === "published" && publicUrl && (
            <a href={publicUrl} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline"><Eye className="mr-1.5 h-3.5 w-3.5" />View</Button>
            </a>
          )}
          <Button size="sm" variant="outline" disabled={saving} onClick={() => handleSave()}>
            <Save className="mr-1.5 h-3.5 w-3.5" />{row.status === "published" ? "Update" : "Save draft"}
          </Button>
          {row.status !== "published" && (
            <Button size="sm" disabled={saving} onClick={() => handleSave({ publish: true })}>Publish</Button>
          )}
        </div>
      </div>

      {/* Main canvas + sidebar */}
      <div className="mx-auto grid w-full max-w-6xl gap-5 px-3 py-5 sm:px-5 lg:grid-cols-[1fr_320px]">
        {/* Canvas */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6">
            <Input
              value={row.title}
              maxLength={200}
              onChange={(e) => {
                const t = e.target.value;
                setRow((r) => ({ ...r, title: t, slug: autoSlug ? slugify(t) : r.slug }));
              }}
              placeholder="Add title"
              className="!h-auto border-0 bg-transparent px-0 py-2 text-2xl font-bold shadow-none focus-visible:ring-0 sm:text-3xl"
            />
            <div className="mb-3 mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Permalink:</span>
              <span className="font-mono text-foreground">/{row.slug || "your-slug"}</span>
              <Input
                value={row.slug}
                maxLength={120}
                onChange={(e) => { update("slug", slugify(e.target.value)); setAutoSlug(false); }}
                className="ml-2 h-7 max-w-[220px] font-mono text-xs"
                placeholder="page-slug"
              />
            </div>
            <RichTextEditor value={row.content} onChange={(html) => update("content", html)} />
          </div>

          {/* Inline SEO snippet — WordPress / Yoast style */}
          <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Search className="h-3.5 w-3.5" /> Search appearance
            </div>
            <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3">
              <div className="truncate text-xs text-muted-foreground">
                {typeof window !== "undefined" ? window.location.origin : ""}/{row.slug || "your-slug"}
              </div>
              <div className="mt-0.5 truncate text-base text-[#1a0dab] dark:text-blue-400">
                {(row.meta_title || row.title || "Page title").slice(0, 60)}
              </div>
              <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {(row.meta_description || row.excerpt || "Add a meta description to control how this page is summarized in search results.").slice(0, 160)}
              </div>
            </div>
            <div className="grid gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label className="text-xs">SEO title</Label>
                  <span className="text-[10px] text-muted-foreground">{(row.meta_title ?? "").length}/60</span>
                </div>
                <Input
                  value={row.meta_title ?? ""}
                  maxLength={200}
                  onChange={(e) => update("meta_title", e.target.value)}
                  placeholder={row.title || "Defaults to page title"}
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <Label className="text-xs">Meta description</Label>
                  <span className="text-[10px] text-muted-foreground">{(row.meta_description ?? "").length}/160</span>
                </div>
                <Textarea
                  value={row.meta_description ?? ""}
                  rows={2}
                  maxLength={400}
                  onChange={(e) => update("meta_description", e.target.value)}
                  placeholder="A clear summary of this page in 1–2 sentences."
                />
              </div>
            </div>
          </div>

          <Collapsible title="Excerpt" defaultOpen={false}>
            <Textarea
              value={row.excerpt ?? ""}
              maxLength={500}
              rows={3}
              onChange={(e) => update("excerpt", e.target.value)}
              placeholder="A short summary shown in listings and search results."
            />
          </Collapsible>

          <Collapsible title="SEO" defaultOpen={false}>
            <div className="grid gap-3 sm:grid-cols-2">
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
              <div className="sm:col-span-2">
                <Label className="text-xs">Canonical URL</Label>
                <Input value={row.canonical_url ?? ""} maxLength={500} onChange={(e) => update("canonical_url", e.target.value)} placeholder="https://example.com/page" />
              </div>
              <div className="flex flex-wrap items-center gap-5">
                <label className="inline-flex items-center gap-2 text-xs"><AdminToggle checked={!!row.noindex} onCheckedChange={(v) => update("noindex", v)} />Noindex</label>
                <label className="inline-flex items-center gap-2 text-xs"><AdminToggle checked={!!row.nofollow} onCheckedChange={(v) => update("nofollow", v)} />Nofollow</label>
              </div>
            </div>
          </Collapsible>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <SidebarCard icon={<Calendar className="h-4 w-4" />} title="Publish">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Select value={row.status} onValueChange={(v) => update("status", v as PageRow["status"])}>
                  <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Visibility</span>
                <span className="text-xs">{row.noindex ? "Hidden from search" : "Public"}</span>
              </div>
              {row.updated_at && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="text-xs">{new Date(row.updated_at).toLocaleString()}</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1" disabled={saving} onClick={() => handleSave()}>
                  Save draft
                </Button>
                <Button size="sm" className="flex-1" disabled={saving} onClick={() => handleSave({ publish: true })}>
                  {row.status === "published" ? "Update" : "Publish"}
                </Button>
              </div>
              {row.status === "published" && publicUrl && (
                <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" />{publicUrl}
                </a>
              )}
            </div>
          </SidebarCard>

          <SidebarCard icon={<Star className="h-4 w-4" />} title="Featured">
            <label className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Show as featured</span>
              <AdminToggle checked={!!row.featured} onCheckedChange={(v) => update("featured", v)} />
            </label>
          </SidebarCard>

          <SidebarCard icon={<Tag className="h-4 w-4" />} title="Tags">
            <Input
              value={(row.tags ?? []).join(", ")}
              onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20))}
              placeholder="chat, india, free"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Comma separated (max 20).</p>
          </SidebarCard>

          <SidebarCard icon={<ImageIcon className="h-4 w-4" />} title="Featured image (OG)">
            {row.og_image ? (
              <img src={row.og_image} alt="" className="mb-2 aspect-video w-full rounded-md border border-border object-cover" />
            ) : (
              <div className="mb-2 grid aspect-video w-full place-items-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                No image set
              </div>
            )}
            <Input value={row.og_image ?? ""} onChange={(e) => update("og_image", e.target.value)} placeholder="https://…" />
          </SidebarCard>

          <SidebarCard icon={<Settings2 className="h-4 w-4" />} title="Page attributes">
            <div className="space-y-3 text-sm">
              <div>
                <Label className="text-xs">Layout</Label>
                <Select value={row.layout} onValueChange={(v) => update("layout", v as PageRow["layout"])}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{LAYOUTS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Left sidebar</Label>
                <Select value={row.sidebar_left} onValueChange={(v) => update("sidebar_left", v as PageRow["sidebar_left"])}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{SIDEBARS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Right sidebar</Label>
                <Select value={row.sidebar_right} onValueChange={(v) => update("sidebar_right", v as PageRow["sidebar_right"])}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>{SIDEBARS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </SidebarCard>
        </aside>
      </div>
    </div>
  );
}

function SidebarCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-background shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}{title}
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}
