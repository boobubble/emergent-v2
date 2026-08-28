import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { listPages, deletePage } from "@/lib/pages.functions";
import { ImageStatusBadge } from "@/components/content-images/ImageStatusBadge";
import type { ImageStatusSummary } from "@/lib/content-image-seo";
import {
  listPageCountries,
  listPageStates,
  listPageCities,
  listPageCategories,
  listPageKeywordGroups,
  listPageTemplates,
} from "@/lib/pages-cms/taxonomy.functions";
import {
  listSavedPageFilters,
  saveSavedPageFilter,
} from "@/lib/pages-cms/dashboard.functions";
import { pageTypeLabel, pageTypeBadgeClass } from "@/components/admin/pages/PagesSubnav";
import {
  contentStatusLabel,
  indexStatusLabel,
  formatUpdated,
  PAGE_TYPE_OPTIONS,
  DEFAULT_SAVED_VIEWS,
} from "@/components/admin/pages/pages-ui";
import { SORT_FIELDS } from "@/lib/pages-cms/schemas";
import type { ListPagesQuery } from "@/lib/pages-cms/schemas";
import type { PaginatedResult } from "@/lib/pages-cms/list-query";

export const Route = createFileRoute("/admin/pages/all")({
  component: AllPagesPage,
  validateSearch: (s: Record<string, unknown>) => ({
    status: typeof s.status === "string" ? s.status : undefined,
    noindex: s.noindex === "true" ? true : s.noindex === "false" ? false : undefined,
    content_status: typeof s.content_status === "string" ? s.content_status : undefined,
    missing_h1: s.missing_h1 === "true" ? true : undefined,
    missing_meta_title: s.missing_meta_title === "true" ? true : undefined,
    missing_meta_description: s.missing_meta_description === "true" ? true : undefined,
    missing_primary_keyword: s.missing_primary_keyword === "true" ? true : undefined,
    missing_internal_links: s.missing_internal_links === "true" ? true : undefined,
    seo_score_max: typeof s.seo_score_max === "string" && s.seo_score_max ? Number(s.seo_score_max) : undefined,
  }),
});

type PageRow = {
  id: string;
  slug: string;
  title: string;
  status: string;
  page_type: string | null;
  country_id: string | null;
  state_id: string | null;
  city_id: string | null;
  category_id: string | null;
  keyword_group_id: string | null;
  template_id: string | null;
  country_name: string | null;
  state_name: string | null;
  city_name: string | null;
  category_name: string | null;
  template_name: string | null;
  keyword_group_name: string | null;
  primary_keyword: string | null;
  content_status: string | null;
  seo_score: number | null;
  internal_link_count: number | null;
  noindex: boolean;
  language: string | null;
  updated_at: string | null;
  image_status?: ImageStatusSummary | null;
};

type FilterState = Partial<ListPagesQuery>;

const ALL = "__all__";

function emptyFilters(): FilterState {
  return {
    sortBy: "updated_at",
    sortDir: "desc",
  };
}

function AllPagesPage() {
  const urlSearch = Route.useSearch();
  const listFn = useServerFn(listPages);
  const deleteFn = useServerFn(deletePage);
  const listCountriesFn = useServerFn(listPageCountries);
  const listStatesFn = useServerFn(listPageStates);
  const listCitiesFn = useServerFn(listPageCities);
  const listCategoriesFn = useServerFn(listPageCategories);
  const listKeywordGroupsFn = useServerFn(listPageKeywordGroups);
  const listTemplatesFn = useServerFn(listPageTemplates);
  const listSavedFn = useServerFn(listSavedPageFilters);
  const saveSavedFn = useServerFn(saveSavedPageFilter);
  const qc = useQueryClient();

  const [filters, setFilters] = useState<FilterState>(() => ({
    ...emptyFilters(),
    status: urlSearch.status as ListPagesQuery["status"],
    noindex: urlSearch.noindex,
    content_status: urlSearch.content_status as ListPagesQuery["content_status"],
    missing_h1: urlSearch.missing_h1,
    missing_meta_title: urlSearch.missing_meta_title,
    missing_meta_description: urlSearch.missing_meta_description,
    missing_primary_keyword: urlSearch.missing_primary_keyword,
    missing_internal_links: urlSearch.missing_internal_links,
    seo_score_max: urlSearch.seo_score_max,
  }));
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(50);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saveViewOpen, setSaveViewOpen] = useState(false);
  const [viewName, setViewName] = useState("");
  const [citySearch, setCitySearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters, pageSize]);

  const queryParams = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch || undefined,
      page,
      pageSize,
    }),
    [filters, debouncedSearch, page, pageSize],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "pages", "all", queryParams],
    queryFn: async () => listFn({ data: queryParams }) as Promise<PaginatedResult<PageRow>>,
    staleTime: 15_000,
  });

  const countriesQ = useQuery({
    queryKey: ["admin", "page-countries", "opts"],
    queryFn: () => listCountriesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const statesQ = useQuery({
    queryKey: ["admin", "page-states", "opts", filters.country_id],
    queryFn: () =>
      listStatesFn({
        data: { country_id: filters.country_id!, page: 1, pageSize: 100, activeOnly: true },
      }),
    enabled: !!filters.country_id,
    staleTime: 60_000,
  });
  const citiesQ = useQuery({
    queryKey: ["admin", "page-cities", "opts", filters.country_id, filters.state_id, citySearch],
    queryFn: () =>
      listCitiesFn({
        data: {
          country_id: filters.country_id || undefined,
          state_id: filters.state_id || undefined,
          search: citySearch || undefined,
          page: 1,
          pageSize: 50,
          activeOnly: true,
        },
      }),
    enabled: !!filters.country_id,
    staleTime: 30_000,
  });
  const categoriesQ = useQuery({
    queryKey: ["admin", "page-categories", "opts"],
    queryFn: () => listCategoriesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const keywordGroupsQ = useQuery({
    queryKey: ["admin", "page-keyword-groups", "opts"],
    queryFn: () => listKeywordGroupsFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const templatesQ = useQuery({
    queryKey: ["admin", "page-templates", "opts"],
    queryFn: () => listTemplatesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const savedViewsQ = useQuery({
    queryKey: ["admin", "page-saved-filters"],
    queryFn: () => listSavedFn({}),
    staleTime: 60_000,
  });

  const saveViewMut = useMutation({
    mutationFn: (name: string) =>
      saveSavedFn({
        data: {
          name,
          filter_json: { ...filters, search: debouncedSearch || undefined },
          is_shared: true,
        },
      }),
    onSuccess: () => {
      toast.success("Saved view created");
      setSaveViewOpen(false);
      setViewName("");
      qc.invalidateQueries({ queryKey: ["admin", "page-saved-filters"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Save failed"),
  });

  const rows = (data?.rows ?? []) as PageRow[];
  const totalPages = data?.totalPages ?? 1;
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  function resetFilters() {
    setFilters(emptyFilters());
    setSearchInput("");
    setDebouncedSearch("");
    setPage(1);
    setCitySearch("");
  }

  function applyView(filter: Record<string, unknown>) {
    const { search: s, ...rest } = filter;
    setFilters({ ...emptyFilters(), ...rest as FilterState });
    setSearchInput(typeof s === "string" ? s : "");
    setDebouncedSearch(typeof s === "string" ? s : "");
    setPage(1);
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete page "${title}"?`)) return;
    try {
      await deleteFn({ data: { id } });
      toast.success("Page deleted");
      qc.invalidateQueries({ queryKey: ["admin", "pages"] });
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Delete failed");
    }
  }

  const countries = countriesQ.data?.rows ?? [];
  const states = statesQ.data?.rows ?? [];
  const cities = citiesQ.data?.rows ?? [];
  const categories = categoriesQ.data?.rows ?? [];
  const keywordGroups = keywordGroupsQ.data?.rows ?? [];
  const templates = templatesQ.data?.rows ?? [];
  const savedViews = savedViewsQ.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              placeholder="Search title, slug, keyword…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="max-w-xs"
            />
            <Link to="/pages-editor/$id" params={{ id: "new" }}>
              <Button size="sm"><Plus className="mr-1 h-4 w-4" />New page</Button>
            </Link>
            <Button size="sm" variant="outline" onClick={resetFilters}>Reset filters</Button>
            <Button size="sm" variant="outline" onClick={() => setSaveViewOpen(true)}>Save view</Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_SAVED_VIEWS.map((v) => (
              <Button key={v.name} size="sm" variant="outline" className="h-7 text-xs" onClick={() => applyView(v.filter)}>
                {v.name}
              </Button>
            ))}
            {savedViews.map((v) => (
              <Button
                key={v.id}
                size="sm"
                variant="secondary"
                className="h-7 text-xs"
                onClick={() => applyView((v.filter_json as Record<string, unknown>) ?? {})}
              >
                {v.name}
              </Button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <Select
              value={filters.page_type ?? ALL}
              onValueChange={(v) => setFilters((f) => ({ ...f, page_type: v === ALL ? undefined : v as ListPagesQuery["page_type"] }))}
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All types</SelectItem>
                {PAGE_TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select
              value={filters.country_id ?? ALL}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  country_id: v === ALL ? undefined : v,
                  state_id: undefined,
                  city_id: undefined,
                }))
              }
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="Country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All countries</SelectItem>
                {countries.map((c: { id: string; name: string }) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.state_id ?? ALL}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  state_id: v === ALL ? undefined : v,
                  city_id: undefined,
                }))
              }
              disabled={!filters.country_id}
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="State" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All states</SelectItem>
                {states.map((s: { id: string; name: string }) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-1">
              <Input
                placeholder="Search cities…"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="h-8"
                disabled={!filters.country_id}
              />
              <Select
                value={filters.city_id ?? ALL}
                onValueChange={(v) => setFilters((f) => ({ ...f, city_id: v === ALL ? undefined : v }))}
                disabled={!filters.country_id}
              >
                <SelectTrigger className="h-8"><SelectValue placeholder="City" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All cities</SelectItem>
                  {cities.map((c: { id: string; name: string }) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Select
              value={filters.category_id ?? ALL}
              onValueChange={(v) => setFilters((f) => ({ ...f, category_id: v === ALL ? undefined : v }))}
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {categories.map((c: { id: string; name: string }) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.keyword_group_id ?? ALL}
              onValueChange={(v) => setFilters((f) => ({ ...f, keyword_group_id: v === ALL ? undefined : v }))}
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="Keyword group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All keyword groups</SelectItem>
                {keywordGroups.map((k: { id: string; name: string }) => (
                  <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.template_id ?? ALL}
              onValueChange={(v) => setFilters((f) => ({ ...f, template_id: v === ALL ? undefined : v }))}
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="Template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All templates</SelectItem>
                {templates.map((t: { id: string; name: string }) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status ?? ALL}
              onValueChange={(v) => setFilters((f) => ({ ...f, status: v === ALL ? undefined : v as ListPagesQuery["status"] }))}
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.noindex === undefined ? ALL : filters.noindex ? "true" : "false"}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  noindex: v === ALL ? undefined : v === "true",
                }))
              }
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="Index" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any index</SelectItem>
                <SelectItem value="false">Indexable</SelectItem>
                <SelectItem value="true">Noindex</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.content_status ?? ALL}
              onValueChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  content_status: v === ALL ? undefined : v as ListPagesQuery["content_status"],
                }))
              }
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="Content" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any content</SelectItem>
                <SelectItem value="empty">Empty</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Language"
              value={filters.language ?? ""}
              onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value || undefined }))}
              className="h-8"
            />
            <Input
              type="number"
              placeholder="SEO min"
              value={filters.seo_score_min ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  seo_score_min: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="h-8"
            />
            <Input
              type="number"
              placeholder="SEO max"
              value={filters.seo_score_max ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  seo_score_max: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="h-8"
            />
            <Select
              value={filters.sortBy ?? "updated_at"}
              onValueChange={(v) => setFilters((f) => ({ ...f, sortBy: v as ListPagesQuery["sortBy"] }))}
            >
              <SelectTrigger className="h-8"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                {SORT_FIELDS.map((f) => (
                  <SelectItem key={f} value={f}>{f.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.sortDir ?? "desc"}
              onValueChange={(v) => setFilters((f) => ({ ...f, sortDir: v as "asc" | "desc" }))}
            >
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { key: "missing_h1", label: "Missing H1" },
              { key: "missing_meta_title", label: "Missing meta title" },
              { key: "missing_meta_description", label: "Missing meta desc" },
              { key: "missing_primary_keyword", label: "Missing keyword" },
              { key: "missing_internal_links", label: "No internal links" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-1.5 text-muted-foreground">
                <Checkbox
                  checked={!!filters[key as keyof FilterState]}
                  onCheckedChange={(c) =>
                    setFilters((f) => ({ ...f, [key]: c === true ? true : undefined }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-2 w-8">
                    <Checkbox checked={allSelected} onCheckedChange={() => toggleAll()} />
                  </th>
                  <th className="p-2">Page</th>
                  <th className="p-2">Slug</th>
                  <th className="p-2 hidden sm:table-cell">Image</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Country</th>
                  <th className="p-2">State</th>
                  <th className="p-2">City</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Keyword</th>
                  <th className="p-2">Template</th>
                  <th className="p-2">Content</th>
                  <th className="p-2">SEO</th>
                  <th className="p-2">Links</th>
                  <th className="p-2">Index</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Updated</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-2">
                      <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleOne(r.id)} />
                    </td>
                    <td className="p-2 max-w-[160px]">
                      <Link
                        to="/pages-editor/$id"
                        params={{ id: r.id }}
                        className="font-medium hover:underline truncate block"
                      >
                        {r.title || "(untitled)"}
                      </Link>
                      {r.image_status && (
                        <Link
                          to="/pages-editor/$id"
                          params={{ id: r.id }}
                          search={{ imageSeo: true }}
                          className="mt-1 inline-flex sm:hidden"
                        >
                          <ImageStatusBadge status={r.image_status} compact />
                        </Link>
                      )}
                    </td>
                    <td className="p-2 font-mono text-xs">{r.slug}</td>
                    <td className="p-2 hidden sm:table-cell">
                      {r.image_status ? (
                        <Link
                          to="/pages-editor/$id"
                          params={{ id: r.id }}
                          search={{ imageSeo: true }}
                          className="inline-flex"
                        >
                          <ImageStatusBadge status={r.image_status} compact />
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className={pageTypeBadgeClass(r.page_type)}>
                        {pageTypeLabel(r.page_type)}
                      </Badge>
                    </td>
                    <td className="p-2 text-xs">{r.country_name ?? "—"}</td>
                    <td className="p-2 text-xs">{r.state_name ?? "—"}</td>
                    <td className="p-2 text-xs">{r.city_name ?? "—"}</td>
                    <td className="p-2 text-xs">{r.category_name ?? "—"}</td>
                    <td className="p-2 text-xs max-w-[100px] truncate">{r.primary_keyword ?? "—"}</td>
                    <td className="p-2 text-xs">{r.template_name ?? "—"}</td>
                    <td className="p-2 text-xs">{contentStatusLabel(r.content_status)}</td>
                    <td className="p-2 tabular-nums">{r.seo_score ?? "—"}</td>
                    <td className="p-2 tabular-nums">{r.internal_link_count ?? 0}</td>
                    <td className="p-2 text-xs">{indexStatusLabel(r.noindex)}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{r.status}</Badge>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{formatUpdated(r.updated_at)}</td>
                    <td className="p-2">
                      <div className="flex gap-0.5">
                        <Link to="/pages-editor/$id" params={{ id: r.id }}>
                          <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                        </Link>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(r.id, r.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={18} className="p-8 text-center text-muted-foreground">No pages match filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          Page {page} of {totalPages} · {data?.total ?? 0} total
          {selected.size > 0 && ` · ${selected.size} selected`}
        </span>
        <select
          className="rounded border bg-background px-2 py-1 text-sm"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value) as 25 | 50 | 100)}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>

      <Dialog open={saveViewOpen} onOpenChange={setSaveViewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save filter view</DialogTitle>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label>View name</Label>
            <Input value={viewName} onChange={(e) => setViewName(e.target.value)} placeholder="My filter" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveViewOpen(false)}>Cancel</Button>
            <Button
              disabled={!viewName.trim() || saveViewMut.isPending}
              onClick={() => saveViewMut.mutate(viewName.trim())}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
