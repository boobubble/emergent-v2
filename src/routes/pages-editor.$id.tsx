import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Save, ExternalLink, Eye, Settings2, Tag, Star,
  Calendar, FileText, Cloud, CloudOff, ShieldCheck, Info,
  X, Plus, Link2, History, MapPin, KeyRound, Braces, RefreshCw, PanelBottom,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SeoManagerLink } from "@/components/admin/seo/SeoPreviewPanels";
import { pageTypeLabel } from "@/components/admin/pages/PagesSubnav";
import { PAGE_TYPE_OPTIONS, contentStatusLabel } from "@/components/admin/pages/pages-ui";
import { SEO_SOURCE_LABELS } from "@/lib/pages-cms/seo-source";
import type { CmsContentStatus, CmsPageStatus, CmsPageType } from "@/lib/pages-cms/types";
import {
  getPage,
  savePage,
  getPageSeoSource,
  listPageInternalLinks,
  listPageHistory,
  syncPageInternalLinkCount,
} from "@/lib/pages.functions";
import {
  listPageCountries,
  listPageStates,
  listPageCities,
  listPageCategories,
  listPageKeywordGroups,
  listPageTemplates,
} from "@/lib/pages-cms/taxonomy.functions";
import {
  defaultRelatedChatRoomsConfig,
  parseRelatedChatRoomsConfig,
  type RelatedChatRoomsConfig,
} from "@/lib/pages-cms/related-chat-rooms-config";
import { RelatedChatRoomsSettingsCard } from "@/components/admin/pages/RelatedChatRoomsSettingsCard";
import {
  slugifyPageSlug,
  validatePageSlug,
  pageSlugPreviewHost,
  DUPLICATE_PAGE_SLUG_MESSAGE,
  PageSlugValidationError,
} from "@/lib/page-slug";
import { normalizePageContentForSave } from "@/lib/page-content-paste";
import { DEFAULT_PAGE_CTA_DEFAULTS } from "@/lib/page-cta";
import { useAuth } from "@/lib/auth-store";
import { getMyRoles } from "@/lib/admin.functions";

export const Route = createFileRoute("/pages-editor/$id")({ component: PageEditorGate });

const UNCLASSIFIED = "__unclassified__";
const NONE = "__none__";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string | null;
  tags: string[];
  status: CmsPageStatus;
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
  page_type: CmsPageType | null;
  country_id: string | null;
  state_id: string | null;
  city_id: string | null;
  category_id: string | null;
  keyword_group_id: string | null;
  template_id: string | null;
  h1: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[];
  language: string | null;
  intro_content: string | null;
  faq_content: string;
  cta_content: string;
  content_status: CmsContentStatus | null;
  seo_score: number | null;
  internal_link_count: number | null;
  scheduled_at: string | null;
  related_chat_rooms: RelatedChatRoomsConfig;
  show_in_footer: boolean;
  footer_order: number;
  footer_group: string | null;
};

function emptyPage(): PageRow {
  return {
    id: "", slug: "", title: "", content: "", excerpt: "", tags: [],
    status: "draft", featured: false, layout: "boxed",
    sidebar_left: "none", sidebar_right: "none",
    meta_title: "", meta_description: "", meta_keywords: "",
    og_title: "", og_description: "", og_image: "", canonical_url: "",
    noindex: false, nofollow: false,
    page_type: "static",
    country_id: null, state_id: null, city_id: null, category_id: null,
    keyword_group_id: null, template_id: null,
    h1: null, primary_keyword: null, secondary_keywords: [],
    language: "en", intro_content: null,
    faq_content: "", cta_content: "",
    content_status: null, seo_score: null, internal_link_count: null,
    show_in_footer: false, footer_order: 0, footer_group: null,
    scheduled_at: null,
    related_chat_rooms: defaultRelatedChatRoomsConfig(),
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

const STATUS_OPTIONS: { value: CmsPageStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

function fieldToText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function textToJsonField(v: string): unknown {
  const t = v.trim();
  if (!t) return null;
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

function fromDatetimeLocal(v: string): string | null {
  if (!v.trim()) return null;
  try {
    return new Date(v).toISOString();
  } catch {
    return null;
  }
}

function mapServerRow(data: Record<string, unknown>): PageRow {
  return {
    ...emptyPage(),
    ...(data as Partial<PageRow>),
    page_type: (data.page_type as CmsPageType | null | undefined) ?? null,
    secondary_keywords: Array.isArray(data.secondary_keywords)
      ? data.secondary_keywords.map(String)
      : [],
    faq_content: fieldToText(data.faq_content),
    cta_content: fieldToText(data.cta_content),
    language: (data.language as string | null) ?? "en",
    related_chat_rooms:
      parseRelatedChatRoomsConfig(data.related_chat_rooms) ?? defaultRelatedChatRoomsConfig(),
  };
}

function isStaticOrUnclassified(pageType: CmsPageType | null | undefined): boolean {
  return !pageType || pageType === "static";
}

function PageEditorGate() {
  const { user, ready } = useAuth();
  const fetchRoles = useServerFn(getMyRoles);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: () => fetchRoles({}),
    enabled: !!user && ready,
    staleTime: 30_000,
  });

  if (!ready || isLoading) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Checking access…</div>;
  }
  if (isError || !data?.isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-sm text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 text-lg font-semibold">Admin access required</h1>
          <p className="mt-1 text-sm text-muted-foreground">You don't have permission to edit pages.</p>
          <Link to="/" className="mt-4 inline-flex"><Button variant="outline" size="sm">Back to app</Button></Link>
        </div>
      </div>
    );
  }
  return <PageEditor />;
}

function PageEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isNew = id === "new";
  const pageId = !isNew ? id : null;

  const fetchPage = useServerFn(getPage);
  const save = useServerFn(savePage);
  const fetchSeoSource = useServerFn(getPageSeoSource);
  const listCountriesFn = useServerFn(listPageCountries);
  const listStatesFn = useServerFn(listPageStates);
  const listCitiesFn = useServerFn(listPageCities);
  const listCategoriesFn = useServerFn(listPageCategories);
  const listKeywordGroupsFn = useServerFn(listPageKeywordGroups);
  const listTemplatesFn = useServerFn(listPageTemplates);
  const listInternalLinksFn = useServerFn(listPageInternalLinks);
  const listHistoryFn = useServerFn(listPageHistory);
  const syncLinkCountFn = useServerFn(syncPageInternalLinkCount);

  const [row, setRow] = useState<PageRow>(emptyPage());
  const rowCountryId = row.country_id;
  const rowStateId = row.state_id;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages", "edit", id],
    queryFn: () => isNew ? null : fetchPage({ data: { id } }),
    enabled: !isNew,
    staleTime: 0,
  });

  const seoSourceQ = useQuery({
    queryKey: ["admin", "pages", "seo-source", pageId],
    queryFn: () => fetchSeoSource({ data: { id: pageId! } }),
    enabled: !!pageId,
    staleTime: 30_000,
  });

  const internalLinksQ = useQuery({
    queryKey: ["admin", "pages", "internal-links", pageId],
    queryFn: () => listInternalLinksFn({ data: { pageId: pageId! } }),
    enabled: !!pageId,
    staleTime: 15_000,
  });

  const historyQ = useQuery({
    queryKey: ["admin", "pages", "history", pageId],
    queryFn: () => listHistoryFn({ data: { pageId: pageId! } }),
    enabled: !!pageId,
    staleTime: 15_000,
  });

  const countriesQ = useQuery({
    queryKey: ["admin", "page-countries", "editor"],
    queryFn: () => listCountriesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const statesQ = useQuery({
    queryKey: ["admin", "page-states", "editor", rowCountryId],
    queryFn: () =>
      listStatesFn({
        data: { country_id: rowCountryId!, page: 1, pageSize: 100, activeOnly: true },
      }),
    enabled: !!rowCountryId,
    staleTime: 60_000,
  });
  const citiesQ = useQuery({
    queryKey: ["admin", "page-cities", "editor", rowCountryId, rowStateId],
    queryFn: () =>
      listCitiesFn({
        data: {
          country_id: rowCountryId || undefined,
          state_id: rowStateId || undefined,
          includeCountryLevel: !rowStateId && !!rowCountryId,
          page: 1,
          pageSize: 100,
          activeOnly: true,
        },
      }),
    enabled: !!rowCountryId,
    staleTime: 60_000,
  });
  const categoriesQ = useQuery({
    queryKey: ["admin", "page-categories", "editor"],
    queryFn: () => listCategoriesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const keywordGroupsQ = useQuery({
    queryKey: ["admin", "page-keyword-groups", "editor"],
    queryFn: () => listKeywordGroupsFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const templatesQ = useQuery({
    queryKey: ["admin", "page-templates", "editor"],
    queryFn: () => listTemplatesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });

  const [autoSlug, setAutoSlug] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [syncingLinks, setSyncingLinks] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [draftAt, setDraftAt] = useState<number | null>(null);
  const draftKey = `lovable.pageDraft.${id}`;
  const hydrated = useRef(false);
  const skipNextSave = useRef(false);
  const contentModifiedRef = useRef(false);
  const initialContentRef = useRef("");
  const initialSlugRef = useRef("");
  const [slugError, setSlugError] = useState<string | null>(null);

  const seoOverrideActive = seoSourceQ.data?.kind === "seo_manager_override";

  const schemaPreview = useMemo(() => ({
    h1: row.h1,
    faq_content: textToJsonField(row.faq_content),
    cta_content: textToJsonField(row.cta_content),
    page_type: row.page_type,
    country_id: row.country_id,
    state_id: row.state_id,
    city_id: row.city_id,
    category_id: row.category_id,
    keyword_group_id: row.keyword_group_id,
    template_id: row.template_id,
    primary_keyword: row.primary_keyword,
    secondary_keywords: row.secondary_keywords,
    language: row.language,
  }), [row]);

  useEffect(() => {
    const serverRow: PageRow = isNew
      ? emptyPage()
      : data
        ? mapServerRow(data as Record<string, unknown>)
        : emptyPage();
    skipNextSave.current = true;
    setRow(serverRow);
    setAutoSlug(isNew);
    initialContentRef.current = serverRow.content ?? "";
    initialSlugRef.current = serverRow.slug ?? "";
    contentModifiedRef.current = false;
    setSlugError(validatePageSlug(serverRow.slug ?? ""));

    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) {
        const parsed = JSON.parse(raw) as { row: PageRow; savedAt: number };
        const serverAt = (data as { updated_at?: string } | null)?.updated_at
          ? new Date((data as { updated_at: string }).updated_at).getTime()
          : 0;
        const differs = !sameDraft(parsed.row, serverRow);
        if (parsed.savedAt > serverAt && differs) {
          const ok = window.confirm("An unsaved local draft was found for this page. Restore it?");
          if (ok) {
            skipNextSave.current = true;
            setRow(parsed.row);
            setAutoSlug(false);
            setDraftAt(parsed.savedAt);
            contentModifiedRef.current = parsed.row.content !== initialContentRef.current;
          } else {
            localStorage.removeItem(draftKey);
          }
        } else if (!differs) {
          localStorage.removeItem(draftKey);
        }
      }
    } catch { /* ignore */ }
    hydrated.current = true;
  }, [data, isNew, draftKey]);

  const update = <K extends keyof PageRow>(k: K, v: PageRow[K]) =>
    setRow((r) => ({ ...r, [k]: v }));

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

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (draftStatus === "saving") { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [draftStatus]);

  async function handleSyncLinkCount() {
    if (!pageId) return;
    setSyncingLinks(true);
    try {
      const res = await syncLinkCountFn({ data: { pageId, refreshJsonCache: true } });
      update("internal_link_count", res.internal_link_count);
      await qc.invalidateQueries({ queryKey: ["admin", "pages", "internal-links", pageId] });
      toast.success("Internal link count refreshed");
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? "Sync failed");
    } finally {
      setSyncingLinks(false);
    }
  }

  async function handleSave(opts: { publish?: boolean } = {}) {
    if (!row.title.trim()) { toast.error("Add a title first"); return; }
    const normalizedSlug = slugifyPageSlug(row.slug || row.title);
    const status = opts.publish ? "published" : row.status;
    const requiresSlug = status === "published" || status === "scheduled";
    const err = validatePageSlug(normalizedSlug, { required: requiresSlug });
    if (err) {
      setSlugError(err);
      toast.error(err);
      return;
    }
    if (
      initialSlugRef.current &&
      normalizedSlug !== initialSlugRef.current &&
      row.status === "published"
    ) {
      toast.warning(
        "Changing a published URL can affect SEO. The previous slug will redirect to the new one.",
        { duration: 6000 },
      );
    }
    setSaving(true);
    try {
      let contentToSave = row.content;
      if (contentModifiedRef.current) {
        const normalized = normalizePageContentForSave(row.content);
        contentToSave = normalized.html;
        for (const w of normalized.warnings) toast.info(w, { duration: 5000 });
      }
      const payload = {
        id: row.id || undefined,
        slug: normalizedSlug,
        title: row.title,
        content: contentToSave,
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
        page_type: row.page_type,
        country_id: row.country_id,
        state_id: row.state_id,
        city_id: row.city_id,
        category_id: row.category_id,
        keyword_group_id: row.keyword_group_id,
        template_id: row.template_id,
        h1: row.h1 || null,
        primary_keyword: row.primary_keyword || null,
        secondary_keywords: row.secondary_keywords ?? [],
        language: row.language || "en",
        intro_content: row.intro_content || null,
        faq_content: textToJsonField(row.faq_content),
        cta_content: textToJsonField(row.cta_content),
        scheduled_at: row.scheduled_at,
        related_chat_rooms: row.related_chat_rooms,
        show_in_footer: row.show_in_footer,
        footer_order: row.footer_order,
        footer_group: row.footer_group,
      };
      const saved = await save({ data: payload }) as {
        id?: string;
        slug?: string;
        previousSlug?: string;
        slugChanged?: boolean;
        content_status?: CmsContentStatus;
        seo_score?: number;
      };
      toast.success(opts.publish ? "Published" : "Saved");
      if (saved?.slugChanged && saved?.previousSlug) {
        toast.info(`Redirect created: /${saved.previousSlug} → /${saved.slug}`, { duration: 6000 });
      }
      try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
      setDraftStatus("idle");
      setDraftAt(null);
      contentModifiedRef.current = false;
      initialContentRef.current = contentToSave;
      initialSlugRef.current = normalizedSlug;
      setSlugError(null);
      skipNextSave.current = true;
      setRow((r) => ({
        ...r,
        slug: normalizedSlug,
        status,
        content_status: saved.content_status ?? r.content_status,
        seo_score: saved.seo_score ?? r.seo_score,
      }));
      if (contentToSave !== row.content) {
        setRow((r) => ({ ...r, content: contentToSave }));
      }
      if (saved?.id && saved.id !== row.id) {
        navigate({ to: "/pages-editor/$id", params: { id: saved.id }, replace: true });
      }
      if (pageId) {
        qc.invalidateQueries({ queryKey: ["admin", "pages", "history", pageId] });
        qc.invalidateQueries({ queryKey: ["admin", "pages", "seo-source", pageId] });
      }
    } catch (e: unknown) {
      const errObj = e as { message?: string; code?: string };
      const msg = errObj?.message ?? "Save failed";
      if (errObj instanceof PageSlugValidationError || errObj?.code === "DUPLICATE_SLUG" || msg === DUPLICATE_PAGE_SLUG_MESSAGE) {
        setSlugError(DUPLICATE_PAGE_SLUG_MESSAGE);
        toast.error(DUPLICATE_PAGE_SLUG_MESSAGE);
        return;
      }
      if (msg.toLowerCase().includes("slug")) setSlugError(msg);
      toast.error(msg);
    } finally { setSaving(false); }
  }

  if (!isNew && isLoading) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading editor…</div>;
  }

  const publicUrl = row.slug ? `/${slugifyPageSlug(row.slug)}` : "";
  const slugPreview = slugifyPageSlug(row.slug || (autoSlug ? row.title : ""));
  const slugHost = pageSlugPreviewHost();
  const countries = countriesQ.data?.rows ?? [];
  const states = statesQ.data?.rows ?? [];
  const cities = citiesQ.data?.rows ?? [];
  const categories = categoriesQ.data?.rows ?? [];
  const keywordGroups = keywordGroupsQ.data?.rows ?? [];
  const templates = templatesQ.data?.rows ?? [];
  const linkCount = internalLinksQ.data?.internal_link_count ?? row.internal_link_count ?? 0;
  const outgoingLinks = (internalLinksQ.data?.outgoing ?? []) as unknown as Array<{
    id: string;
    anchor_text: string | null;
    target_url: string | null;
    target_page_id: string | null;
    is_manual?: boolean;
  }>;
  const incomingLinks = (internalLinksQ.data?.incoming ?? []) as unknown as Array<{
    id: string;
    anchor_text: string | null;
    page_id: string | null;
    target_url: string | null;
  }>;

  return (
    <div className="min-h-screen bg-muted/30">
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

      <div className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5">
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="internal-links">Internal Links</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history" disabled={!pageId}>History</TabsTrigger>
          </TabsList>

          {/* CONTENT */}
          <TabsContent value="content" className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-6">
              <div className="mb-4 grid gap-3">
                <div>
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={row.title}
                    maxLength={200}
                    onChange={(e) => {
                      const t = e.target.value;
                      const nextSlug = autoSlug ? slugifyPageSlug(t) : row.slug;
                      setRow((r) => ({ ...r, title: t, slug: nextSlug }));
                      if (autoSlug) setSlugError(validatePageSlug(nextSlug));
                    }}
                    placeholder="Add title"
                    className="mt-1 text-lg font-semibold"
                  />
                </div>
                <div className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page URL</div>
                  <div className="mb-2 truncate font-mono text-sm text-foreground">
                    {slugHost}/{slugPreview || "your-slug"}
                  </div>
                  <div className="flex flex-wrap items-start gap-2">
                    <Input
                      value={row.slug}
                      maxLength={120}
                      onChange={(e) => {
                        const next = slugifyPageSlug(e.target.value);
                        update("slug", next);
                        setAutoSlug(false);
                        setSlugError(validatePageSlug(next));
                      }}
                      className="h-8 max-w-md font-mono text-xs"
                      placeholder="indian-chat-room"
                      aria-invalid={!!slugError}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => {
                        const next = slugifyPageSlug(row.title);
                        update("slug", next);
                        setAutoSlug(true);
                        setSlugError(validatePageSlug(next));
                      }}
                    >
                      Regenerate from title
                    </Button>
                  </div>
                  {slugError && (
                    <p className="mt-2 text-xs text-destructive" role="alert">{slugError}</p>
                  )}
                  {autoSlug && !slugError && (
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Slug auto-updates from the title until you edit it manually.
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-xs">H1</Label>
                  <Input
                    value={row.h1 ?? ""}
                    maxLength={300}
                    onChange={(e) => update("h1", e.target.value || null)}
                    placeholder="Page heading (optional)"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Intro Content</Label>
                  <Textarea
                    value={row.intro_content ?? ""}
                    rows={3}
                    maxLength={50_000}
                    onChange={(e) => update("intro_content", e.target.value || null)}
                    placeholder="Short intro shown above the main body."
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  Content: {contentStatusLabel(row.content_status)}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  SEO Score: {row.seo_score ?? "—"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">(computed on save)</span>
              </div>

              <RichTextEditor
                value={row.content}
                ctaDefaults={isNew ? DEFAULT_PAGE_CTA_DEFAULTS : undefined}
                onChange={(html) => {
                  contentModifiedRef.current = html !== initialContentRef.current;
                  update("content", html);
                }}
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">FAQ (JSON or text)</Label>
                  <Textarea
                    value={row.faq_content}
                    rows={5}
                    onChange={(e) => update("faq_content", e.target.value)}
                    placeholder='[{"q":"Question?","a":"Answer."}] or plain text'
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">CTA (JSON or text)</Label>
                  <Textarea
                    value={row.cta_content}
                    rows={5}
                    onChange={(e) => update("cta_content", e.target.value)}
                    placeholder='{"headline":"Join now","button":"Start chatting"}'
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo" className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Resolved SEO Source</div>
                  {pageId && seoSourceQ.isLoading ? (
                    <p className="mt-1 text-sm text-muted-foreground">Loading…</p>
                  ) : pageId && seoSourceQ.data ? (
                    <p className="mt-1 text-sm font-medium">
                      {SEO_SOURCE_LABELS[seoSourceQ.data.kind] ?? seoSourceQ.data.label}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">Save the page to resolve SEO source.</p>
                  )}
                </div>
                <SeoManagerLink category="blog-static" />
              </div>

              {seoOverrideActive && (
                <Alert className="mb-4 border-amber-500/40 bg-amber-500/5">
                  <Info className="h-4 w-4 text-amber-600" />
                  <AlertTitle>SEO Manager override active</AlertTitle>
                  <AlertDescription>
                    This page currently uses an SEO Manager route override. Local page SEO values may be overridden.
                    {" "}
                    <a href="/admin/seo?category=blog-static" className="font-medium text-primary hover:underline">
                      Open in SEO Manager
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3">
                <div className="truncate text-xs text-muted-foreground">
                  {slugHost}/{row.slug || "your-slug"}
                </div>
                <div className="mt-0.5 truncate text-base text-[#1a0dab] dark:text-blue-400">
                  {(row.meta_title || row.title || "Page title").slice(0, 60)}
                  {seoOverrideActive && (
                    <span className="ml-2 text-xs text-amber-600">(may be overridden)</span>
                  )}
                </div>
                <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {(row.meta_description || row.excerpt || "Add a meta description to control how this page is summarized in search results.").slice(0, 160)}
                </div>
              </div>

              <fieldset
                disabled={seoOverrideActive}
                className={seoOverrideActive ? "space-y-3 opacity-70" : "space-y-3"}
              >
                {seoOverrideActive && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    Fields below are informational when an SEO Manager override is active — they may not be used on the live page.
                  </p>
                )}
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
                <div>
                  <Label className="text-xs">Keywords</Label>
                  <Input
                    value={row.meta_keywords ?? ""}
                    maxLength={500}
                    onChange={(e) => update("meta_keywords", e.target.value)}
                    placeholder={row.tags?.length ? row.tags.join(", ") : "chat, india, friends"}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
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
                    <label className="inline-flex items-center gap-2 text-xs">
                      <AdminToggle checked={!!row.noindex} onCheckedChange={(v) => update("noindex", v)} />Noindex
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs">
                      <AdminToggle checked={!!row.nofollow} onCheckedChange={(v) => update("nofollow", v)} />Nofollow
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
          </TabsContent>

          {/* LOCATION */}
          <TabsContent value="location" className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Location taxonomy
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Page Type</Label>
                  <Select
                    value={row.page_type ?? UNCLASSIFIED}
                    onValueChange={(v) =>
                      update("page_type", v === UNCLASSIFIED ? null : v as CmsPageType)
                    }
                  >
                    <SelectTrigger className="mt-1 h-9">
                      <SelectValue placeholder="Static / Unclassified" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNCLASSIFIED}>Static / Unclassified</SelectItem>
                      {PAGE_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Current: {pageTypeLabel(row.page_type)}
                  </p>
                </div>

                {isStaticOrUnclassified(row.page_type) && (
                  <div className="sm:col-span-2 rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                    Normal static pages do not require location taxonomy. Set a page type above if this page targets a country, city, or category.
                  </div>
                )}

                <div>
                  <Label className="text-xs">Country</Label>
                  <Select
                    value={row.country_id ?? NONE}
                    onValueChange={(v) => {
                      const countryId = v === NONE ? null : v;
                      setRow((r) => ({
                        ...r,
                        country_id: countryId,
                        state_id: null,
                        city_id: null,
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select country" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— None —</SelectItem>
                      {countries.map((c: { id: string; name: string }) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">State / Province</Label>
                  <Select
                    value={row.state_id ?? NONE}
                    disabled={!row.country_id}
                    onValueChange={(v) => {
                      const stateId = v === NONE ? null : v;
                      setRow((r) => ({ ...r, state_id: stateId, city_id: null }));
                    }}
                  >
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— None —</SelectItem>
                      {states.map((s: { id: string; name: string }) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">City</Label>
                  <Select
                    value={row.city_id ?? NONE}
                    disabled={!row.country_id}
                    onValueChange={(v) => update("city_id", v === NONE ? null : v)}
                  >
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select city" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— None —</SelectItem>
                      {cities.map((c: { id: string; name: string }) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {row.country_id && !row.state_id && (
                    <p className="mt-1 text-[10px] text-muted-foreground">Includes country-level cities (no state).</p>
                  )}
                </div>

                <div>
                  <Label className="text-xs">Category</Label>
                  <Select
                    value={row.category_id ?? NONE}
                    onValueChange={(v) => update("category_id", v === NONE ? null : v)}
                  >
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— None —</SelectItem>
                      {categories.map((c: { id: string; name: string }) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* KEYWORDS */}
          <TabsContent value="keywords" className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <KeyRound className="h-3.5 w-3.5" /> Keywords & templates
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label className="text-xs">Primary Keyword</Label>
                  <Input
                    value={row.primary_keyword ?? ""}
                    maxLength={200}
                    onChange={(e) => update("primary_keyword", e.target.value || null)}
                    placeholder="e.g. lahore chat room"
                    className="mt-1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-xs">Secondary Keywords</Label>
                  <SecondaryKeywordsInput
                    value={row.secondary_keywords}
                    onChange={(kw) => update("secondary_keywords", kw)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Keyword Group</Label>
                  <Select
                    value={row.keyword_group_id ?? NONE}
                    onValueChange={(v) => update("keyword_group_id", v === NONE ? null : v)}
                  >
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select group" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— None —</SelectItem>
                      {keywordGroups.map((g: { id: string; name: string }) => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Template</Label>
                  <Select
                    value={row.template_id ?? NONE}
                    onValueChange={(v) => update("template_id", v === NONE ? null : v)}
                  >
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select template" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>— None —</SelectItem>
                      {templates.map((t: { id: string; name: string }) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Language</Label>
                  <Input
                    value={row.language ?? "en"}
                    maxLength={16}
                    onChange={(e) => update("language", e.target.value || "en")}
                    placeholder="en"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* INTERNAL LINKS */}
          <TabsContent value="internal-links" className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Link2 className="h-3.5 w-3.5" /> Internal links
                </div>
                <div className="flex items-center gap-2">
                  {pageId && (
                    <Button size="sm" variant="outline" disabled={syncingLinks} onClick={handleSyncLinkCount}>
                      <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${syncingLinks ? "animate-spin" : ""}`} />
                      Refresh count
                    </Button>
                  )}
                  <Link to="/admin/internal-linking">
                    <Button size="sm" variant="outline">Manage in Internal Linking</Button>
                  </Link>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="outline">Outgoing count: {linkCount}</Badge>
                <span className="text-[10px] text-muted-foreground">(read-only — synced from page_internal_links)</span>
              </div>

              {!pageId ? (
                <p className="text-sm text-muted-foreground">Save the page first to view internal links.</p>
              ) : internalLinksQ.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading links…</p>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-medium">Outgoing Links</h3>
                    {outgoingLinks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No outgoing links recorded.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-md border border-border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Anchor</TableHead>
                              <TableHead>Target URL</TableHead>
                              <TableHead>Manual</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {outgoingLinks.map((l) => (
                              <TableRow key={l.id}>
                                <TableCell className="text-xs">{l.anchor_text || "—"}</TableCell>
                                <TableCell className="max-w-[200px] truncate font-mono text-xs">{l.target_url || "—"}</TableCell>
                                <TableCell className="text-xs">{l.is_manual ? "Yes" : "No"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <h3 className="mb-2 text-sm font-medium">Incoming Links</h3>
                    {incomingLinks.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No incoming links recorded.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-md border border-border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Anchor</TableHead>
                              <TableHead>Source page</TableHead>
                              <TableHead>Target URL</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {incomingLinks.map((l) => (
                              <TableRow key={l.id}>
                                <TableCell className="text-xs">{l.anchor_text || "—"}</TableCell>
                                <TableCell className="font-mono text-xs">{l.page_id || "—"}</TableCell>
                                <TableCell className="max-w-[200px] truncate font-mono text-xs">{l.target_url || "—"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-medium">internal_links_json (cache only)</h3>
                    <pre className="max-h-48 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-[11px]">
                      {internalLinksQ.data?.internal_links_json
                        ? JSON.stringify(internalLinksQ.data.internal_links_json, null, 2)
                        : "null"}
                    </pre>
                    <p className="mt-1 text-[10px] text-muted-foreground">Read-only cache — edit links in Internal Linking.</p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* SCHEMA */}
          <TabsContent value="schema" className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Braces className="h-3.5 w-3.5" /> Structured data preview
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                Read-only preview of fields that will feed schema.org output. Full structured data generation is planned for Phase 4+.
              </p>
              <pre className="max-h-96 overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-[11px]">
                {JSON.stringify(schemaPreview, null, 2)}
              </pre>
            </div>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="space-y-4">
            <SidebarCard icon={<Calendar className="h-4 w-4" />} title="Publish">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Select value={row.status} onValueChange={(v) => update("status", v as PageRow["status"])}>
                    <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {row.status === "scheduled" && (
                  <div className="space-y-2">
                    <Label className="text-xs">Scheduled at</Label>
                    <Input
                      type="datetime-local"
                      value={toDatetimeLocal(row.scheduled_at)}
                      onChange={(e) => update("scheduled_at", fromDatetimeLocal(e.target.value))}
                    />
                    <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/5 text-amber-800 dark:text-amber-200">
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Scheduled publishing automation is not active yet.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Index</span>
                  <label className="inline-flex items-center gap-2 text-xs">
                    <AdminToggle checked={!row.noindex} onCheckedChange={(v) => update("noindex", !v)} />
                    {row.noindex ? "Noindex" : "Index"}
                  </label>
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

            <SidebarCard icon={<PanelBottom className="h-4 w-4" />} title="Footer">
              <div className="space-y-3">
                <label className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Show in footer</span>
                  <AdminToggle checked={!!row.show_in_footer} onCheckedChange={(v) => update("show_in_footer", v)} />
                </label>
                {row.show_in_footer && (
                  <>
                    <div>
                      <Label className="text-xs">Footer section</Label>
                      <Select value={row.footer_group || "quick_links"} onValueChange={(v) => update("footer_group", v)}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quick_links">Quick Links</SelectItem>
                          <SelectItem value="famous_chat_rooms">Famous Chat Rooms</SelectItem>
                          <SelectItem value="popular_chat_rooms">Popular Chat Rooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Footer order</Label>
                      <Input
                        type="number"
                        min={0}
                        className="h-8"
                        value={row.footer_order}
                        onChange={(e) => update("footer_order", parseInt(e.target.value, 10) || 0)}
                      />
                    </div>
                  </>
                )}
              </div>
            </SidebarCard>

            <SidebarCard icon={<Tag className="h-4 w-4" />} title="Tags">
              <TagsInput
                value={row.tags ?? []}
                onChange={(tags) => update("tags", tags)}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Comma separated (max 20).</p>
            </SidebarCard>

            <SidebarCard icon={<Link2 className="h-4 w-4" />} title="Related Chat Rooms">
              <RelatedChatRoomsSettingsCard
                pageId={row.id || null}
                pageSlug={row.slug}
                pageType={row.page_type}
                countryId={row.country_id}
                value={row.related_chat_rooms}
                onChange={(next) => update("related_chat_rooms", next)}
              />
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

            <SidebarCard icon={<FileText className="h-4 w-4" />} title="Excerpt">
              <Textarea
                value={row.excerpt ?? ""}
                maxLength={500}
                rows={3}
                onChange={(e) => update("excerpt", e.target.value)}
                placeholder="A short summary shown in listings and search results."
              />
            </SidebarCard>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="space-y-4">
            <div className="rounded-xl border border-border bg-background p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <History className="h-3.5 w-3.5" /> Page history
              </div>
              {!pageId ? (
                <p className="text-sm text-muted-foreground">Save the page first to view history.</p>
              ) : historyQ.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading history…</p>
              ) : (historyQ.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No history entries yet.</p>
              ) : (
                <div className="overflow-x-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead>Snapshot</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(historyQ.data ?? []).map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="text-xs font-medium">{h.action}</TableCell>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(h.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell className="max-w-md truncate font-mono text-[10px]">
                            {h.snapshot ? JSON.stringify(h.snapshot) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SecondaryKeywordsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState("");
  function addKeyword() {
    const kw = draft.trim();
    if (!kw || value.includes(kw) || value.length >= 40) return;
    onChange([...value, kw]);
    setDraft("");
  }
  return (
    <div className="mt-1 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((kw) => (
          <Badge key={kw} variant="secondary" className="gap-1 pr-1 text-xs">
            {kw}
            <button
              type="button"
              className="rounded-sm hover:bg-muted"
              onClick={() => onChange(value.filter((k) => k !== kw))}
              aria-label={`Remove ${kw}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          maxLength={80}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addKeyword(); }
          }}
          placeholder="Add secondary keyword"
          className="h-8"
        />
        <Button type="button" size="sm" variant="outline" className="h-8" onClick={addKeyword} disabled={!draft.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
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

function DraftIndicator({ status, savedAt }: { status: "idle" | "saving" | "saved" | "error"; savedAt: number | null }) {
  if (status === "idle") return null;
  const label =
    status === "saving" ? "Saving draft…" :
    status === "error"  ? "Draft save failed" :
    savedAt ? `Draft saved · ${new Date(savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Draft saved";
  const Icon = status === "error" ? CloudOff : Cloud;
  return (
    <div className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex" title="Autosaved locally in your browser">
      <Icon className={`h-3 w-3 ${status === "saving" ? "animate-pulse" : ""}`} />
      <span>{label}</span>
    </div>
  );
}

function TagsInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = useState<string>(value.join(", "));
  const lastExternal = useRef<string>(value.join(", "));
  useEffect(() => {
    const joined = value.join(", ");
    if (joined !== lastExternal.current) {
      lastExternal.current = joined;
      setText(joined);
    }
  }, [value]);
  return (
    <Input
      value={text}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        const tags = v.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 20);
        lastExternal.current = tags.join(", ");
        onChange(tags);
      }}
      placeholder="chat, india, free"
    />
  );
}

function sameDraft(a: PageRow, b: PageRow): boolean {
  const keys: (keyof PageRow)[] = [
    "slug", "title", "content", "excerpt", "tags", "status", "featured",
    "layout", "sidebar_left", "sidebar_right",
    "meta_title", "meta_description", "meta_keywords",
    "og_title", "og_description", "og_image", "canonical_url",
    "noindex", "nofollow",
    "page_type", "country_id", "state_id", "city_id", "category_id",
    "keyword_group_id", "template_id", "h1", "primary_keyword",
    "secondary_keywords", "language", "intro_content", "faq_content", "cta_content",
    "scheduled_at", "related_chat_rooms",
    "show_in_footer", "footer_order", "footer_group",
  ];
  for (const k of keys) {
    const av = a?.[k]; const bv = b?.[k];
    if (k === "related_chat_rooms" || Array.isArray(av) || Array.isArray(bv) || (av && typeof av === "object") || (bv && typeof bv === "object")) {
      if (JSON.stringify(av ?? null) !== JSON.stringify(bv ?? null)) return false;
    } else if ((av ?? "") !== (bv ?? "")) {
      return false;
    }
  }
  return true;
}
