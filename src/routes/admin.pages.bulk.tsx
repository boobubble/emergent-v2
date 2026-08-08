import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { PAGE_TYPE_OPTIONS } from "@/components/admin/pages/pages-ui";
import { formatUpdated } from "@/components/admin/pages/pages-ui";
import {
  listPageCountries,
  listPageStates,
  listPageCities,
  listPageCategories,
  listPageKeywordGroups,
  listPageTemplates,
} from "@/lib/pages-cms/taxonomy.functions";
import {
  previewBulkPages,
  runBulkPageGeneration,
  listBulkJobs,
} from "@/lib/pages-cms/bulk.functions";
import { BULK_SAFE_SYNC_LIMIT } from "@/lib/pages-cms/dashboard.functions";
import type { CmsPageType } from "@/lib/pages-cms/types";

export const Route = createFileRoute("/admin/pages/bulk")({ component: BulkGeneratorPage });

type CountryRow = { id: string; name: string; slug: string };
type StateRow = { id: string; name: string; slug: string; country_id: string };
type CityRow = { id: string; name: string; slug: string; state_id: string | null; country_id: string };
type CategoryRow = { id: string; name: string; slug: string };
type KeywordGroupRow = {
  id: string;
  name: string;
  slug: string;
  primary_pattern: string;
  title_pattern: string | null;
  meta_title_pattern: string | null;
  meta_description_pattern: string | null;
  h1_pattern: string | null;
  slug_pattern: string | null;
};
type TemplateRow = {
  id: string;
  name: string;
  slug: string;
  intro_template: string | null;
  content_template: string | null;
  meta_title_template: string | null;
  meta_description_template: string | null;
  h1_template: string | null;
};

type DuplicateHandling = "skip" | "overwrite_metadata" | "overwrite_template" | "suffix";

const STEPS = [
  "Page Type",
  "Country",
  "States / Cities",
  "Category",
  "Keyword Group",
  "Template",
  "Settings",
  "Preview & Generate",
] as const;

const CITY_TYPES = new Set<CmsPageType>(["city", "city_category"]);
const STATE_TYPES = new Set<CmsPageType>(["state", "state_category"]);

function BulkGeneratorPage() {
  const listCountriesFn = useServerFn(listPageCountries);
  const listStatesFn = useServerFn(listPageStates);
  const listCitiesFn = useServerFn(listPageCities);
  const listCategoriesFn = useServerFn(listPageCategories);
  const listKeywordGroupsFn = useServerFn(listPageKeywordGroups);
  const listTemplatesFn = useServerFn(listPageTemplates);
  const previewFn = useServerFn(previewBulkPages);
  const runFn = useServerFn(runBulkPageGeneration);
  const listJobsFn = useServerFn(listBulkJobs);

  const [step, setStep] = useState(0);
  const [pageType, setPageType] = useState<CmsPageType>("city");
  const [countryId, setCountryId] = useState("");
  const [useAllStates, setUseAllStates] = useState(true);
  const [selectedStateIds, setSelectedStateIds] = useState<Set<string>>(new Set());
  const [useAllCities, setUseAllCities] = useState(true);
  const [selectedCityIds, setSelectedCityIds] = useState<Set<string>>(new Set());
  const [citySearch, setCitySearch] = useState("");
  const [cityPage, setCityPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [keywordGroupId, setKeywordGroupId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [status, setStatus] = useState<"draft" | "scheduled" | "archived">("draft");
  const [duplicateHandling, setDuplicateHandling] = useState<DuplicateHandling>("skip");
  const [language, setLanguage] = useState("en");
  const [noindex, setNoindex] = useState(false);
  const [jobName, setJobName] = useState("Bulk page generation");
  const [confirmOverwritePublished, setConfirmOverwritePublished] = useState(false);
  const [previewResult, setPreviewResult] = useState<Awaited<ReturnType<typeof previewFn>> | null>(null);
  const [selectedJob, setSelectedJob] = useState<Record<string, unknown> | null>(null);

  const countriesQ = useQuery({
    queryKey: ["bulk", "countries"],
    queryFn: () => listCountriesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const countries = (countriesQ.data?.rows ?? []) as CountryRow[];
  const country = countries.find((c) => c.id === countryId);

  const statesQ = useQuery({
    queryKey: ["bulk", "states", countryId],
    queryFn: () =>
      listStatesFn({ data: { country_id: countryId, page: 1, pageSize: 500, activeOnly: true } }),
    enabled: !!countryId,
    staleTime: 60_000,
  });
  const states = (statesQ.data?.rows ?? []) as StateRow[];

  const citiesQ = useQuery({
    queryKey: ["bulk", "cities", countryId, citySearch, cityPage],
    queryFn: () =>
      listCitiesFn({
        data: {
          country_id: countryId,
          search: citySearch || undefined,
          page: cityPage,
          pageSize: 50,
          activeOnly: true,
        },
      }),
    enabled: !!countryId && CITY_TYPES.has(pageType),
    staleTime: 15_000,
  });
  const cities = (citiesQ.data?.rows ?? []) as CityRow[];
  const cityTotalPages = citiesQ.data?.totalPages ?? 1;

  const categoriesQ = useQuery({
    queryKey: ["bulk", "categories"],
    queryFn: () => listCategoriesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const categories = (categoriesQ.data?.rows ?? []) as CategoryRow[];

  const keywordGroupsQ = useQuery({
    queryKey: ["bulk", "keyword-groups"],
    queryFn: () => listKeywordGroupsFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const keywordGroups = (keywordGroupsQ.data?.rows ?? []) as KeywordGroupRow[];

  const templatesQ = useQuery({
    queryKey: ["bulk", "templates"],
    queryFn: () => listTemplatesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const templates = (templatesQ.data?.rows ?? []) as TemplateRow[];

  const jobsQ = useQuery({
    queryKey: ["bulk", "jobs"],
    queryFn: () => listJobsFn({ data: { page: 1, pageSize: 25 } }),
    staleTime: 15_000,
  });

  const category = categories.find((c) => c.id === categoryId);
  const keywordGroup = keywordGroups.find((k) => k.id === keywordGroupId);
  const template = templates.find((t) => t.id === templateId);

  const stateMap = useMemo(() => new Map(states.map((s) => [s.id, s])), [states]);

  async function fetchAllStates(): Promise<StateRow[]> {
    if (!countryId) return [];
    const all: StateRow[] = [];
    let p = 1;
    let total = 1;
    while (p <= total) {
      const res = await listStatesFn({
        data: { country_id: countryId, page: p, pageSize: 100, activeOnly: true },
      });
      all.push(...((res?.rows ?? []) as StateRow[]));
      total = res?.totalPages ?? 1;
      p++;
    }
    return all;
  }

  async function fetchAllCities(): Promise<CityRow[]> {
    if (!countryId) return [];
    const all: CityRow[] = [];
    let p = 1;
    let total = 1;
    while (p <= total) {
      const res = await listCitiesFn({
        data: {
          country_id: countryId,
          search: citySearch || undefined,
          page: p,
          pageSize: 100,
          activeOnly: true,
        },
      });
      all.push(...((res?.rows ?? []) as CityRow[]));
      total = res?.totalPages ?? 1;
      p++;
    }
    return all;
  }

  async function buildLocationsAsync(): Promise<Array<{
    countryId: string;
    countryName: string;
    countrySlug: string;
    stateId?: string | null;
    stateName?: string | null;
    stateSlug?: string | null;
    cityId?: string | null;
    cityName?: string | null;
    citySlug?: string | null;
  }>> {
    if (!country) return [];
    const base = { countryId: country.id, countryName: country.name, countrySlug: country.slug };
    const stateLookup = new Map(states.map((s) => [s.id, s]));

    if (CITY_TYPES.has(pageType)) {
      const pool = useAllCities
        ? await fetchAllCities()
        : cities.filter((c) => selectedCityIds.has(c.id));
      return pool.map((c) => {
        const st = c.state_id ? stateLookup.get(c.state_id) : undefined;
        return {
          ...base,
          stateId: c.state_id,
          stateName: st?.name ?? null,
          stateSlug: st?.slug ?? null,
          cityId: c.id,
          cityName: c.name,
          citySlug: c.slug,
        };
      });
    }

    if (STATE_TYPES.has(pageType)) {
      const statePool = useAllStates ? await fetchAllStates() : states.filter((s) => selectedStateIds.has(s.id));
      return statePool.map((s) => ({
        ...base,
        stateId: s.id,
        stateName: s.name,
        stateSlug: s.slug,
      }));
    }

    return [base];
  }

  async function buildConfigAsync() {
    const locations = await buildLocationsAsync();
    const kg = keywordGroup!;
    const tpl = template;
    return {
      name: jobName,
      page_type: pageType,
      status,
      locations,
      category: category
        ? { id: category.id, name: category.name, slug: category.slug }
        : null,
      keywordGroup: {
        id: kg.id,
        name: kg.name,
        slug: kg.slug,
        primary_pattern: kg.primary_pattern,
        title_pattern: kg.title_pattern,
        meta_title_pattern: kg.meta_title_pattern,
        meta_description_pattern: kg.meta_description_pattern,
        h1_pattern: kg.h1_pattern,
        slug_pattern: kg.slug_pattern,
      },
      template: tpl
        ? {
            id: tpl.id,
            name: tpl.name,
            slug: tpl.slug,
            intro_template: tpl.intro_template,
            content_template: tpl.content_template,
            meta_title_template: tpl.meta_title_template,
            meta_description_template: tpl.meta_description_template,
            h1_template: tpl.h1_template,
          }
        : null,
      duplicateHandling,
      language,
      noindex,
      confirmOverwritePublished,
      dryRun: false,
    };
  }

  const previewMut = useMutation({
    mutationFn: async () => previewFn({ data: { ...(await buildConfigAsync()), dryRun: true } }),
    onSuccess: (res) => {
      setPreviewResult(res);
      setStep(7);
    },
    onError: (e: Error) => toast.error(e.message ?? "Preview failed"),
  });

  const generateMut = useMutation({
    mutationFn: async () => runFn({ data: await buildConfigAsync() }),
    onSuccess: (res) => {
      toast.success(`Created ${res.created}, updated ${res.updated}, skipped ${res.skipped}, failed ${res.failed}`);
      jobsQ.refetch();
    },
    onError: (e: Error) => toast.error(e.message ?? "Generation failed"),
  });

  const needsCategory = pageType.includes("category");
  const isOverwrite = duplicateHandling === "overwrite_metadata" || duplicateHandling === "overwrite_template";
  const blocked = previewResult?.blocked ?? false;

  function canNext(): boolean {
    if (step === 0) return !!pageType;
    if (step === 1) return !!countryId;
    if (step === 2) {
      if (CITY_TYPES.has(pageType)) {
        if (useAllCities) return cities.length > 0 || citiesQ.isLoading;
        return selectedCityIds.size > 0;
      }
      if (STATE_TYPES.has(pageType)) {
        if (useAllStates) return states.length > 0 || statesQ.isLoading;
        return selectedStateIds.size > 0;
      }
      return true;
    }
    if (step === 3) return !needsCategory || !!categoryId;
    if (step === 4) return !!keywordGroupId;
    if (step === 5) return true;
    if (step === 6) {
      if (isOverwrite && !confirmOverwritePublished) return false;
      return jobName.trim().length > 0;
    }
    return true;
  }

  function goNext() {
    if (step === 6) {
      previewMut.mutate();
      return;
    }
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap gap-2 p-3">
          {STEPS.map((label, i) => (
            <Button
              key={label}
              size="sm"
              variant={step === i ? "default" : i < step ? "secondary" : "outline"}
              className="text-xs"
              onClick={() => i <= step && setStep(i)}
            >
              {i + 1}. {label}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{STEPS[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <Select value={pageType} onValueChange={(v) => setPageType(v as CmsPageType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAGE_TYPE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {step === 1 && (
            <Select value={countryId} onValueChange={setCountryId}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {step === 2 && (
            <div className="space-y-3">
              {!CITY_TYPES.has(pageType) && !STATE_TYPES.has(pageType) && (
                <p className="text-sm text-muted-foreground">
                  This page type uses the selected country only ({country?.name ?? "—"}).
                </p>
              )}
              {STATE_TYPES.has(pageType) && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={useAllStates} onCheckedChange={(c) => setUseAllStates(c === true)} />
                    All states in {country?.name}
                  </label>
                  {!useAllStates && (
                    <div className="grid gap-1 max-h-48 overflow-y-auto rounded border p-2">
                      {states.map((s) => (
                        <label key={s.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={selectedStateIds.has(s.id)}
                            onCheckedChange={(c) => {
                              const next = new Set(selectedStateIds);
                              if (c) next.add(s.id);
                              else next.delete(s.id);
                              setSelectedStateIds(next);
                            }}
                          />
                          {s.name}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {CITY_TYPES.has(pageType) && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={useAllCities} onCheckedChange={(c) => setUseAllCities(c === true)} />
                    All cities matching search filter in {country?.name} (fetched across pages at preview)
                  </label>
                  <Input
                    placeholder="Search cities…"
                    value={citySearch}
                    onChange={(e) => { setCitySearch(e.target.value); setCityPage(1); }}
                  />
                  {!useAllCities && (
                    <div className="grid gap-1 max-h-48 overflow-y-auto rounded border p-2">
                      {cities.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={selectedCityIds.has(c.id)}
                            onCheckedChange={(ck) => {
                              const next = new Set(selectedCityIds);
                              if (ck) next.add(c.id);
                              else next.delete(c.id);
                              setSelectedCityIds(next);
                            }}
                          />
                          {c.name}
                          {c.state_id && stateMap.get(c.state_id) && (
                            <span className="text-xs text-muted-foreground">({stateMap.get(c.state_id)!.name})</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 text-sm">
                    <Button size="sm" variant="outline" disabled={cityPage <= 1} onClick={() => setCityPage((p) => p - 1)}>Prev</Button>
                    <span className="text-muted-foreground">Page {cityPage} of {cityTotalPages}</span>
                    <Button size="sm" variant="outline" disabled={cityPage >= cityTotalPages} onClick={() => setCityPage((p) => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-2">
              {needsCategory ? (
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">Category optional for this page type.</p>
              )}
              {!needsCategory && (
                <Select value={categoryId || "__none__"} onValueChange={(v) => setCategoryId(v === "__none__" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="Optional category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {step === 4 && (
            <Select value={keywordGroupId} onValueChange={setKeywordGroupId}>
              <SelectTrigger><SelectValue placeholder="Select keyword group" /></SelectTrigger>
              <SelectContent>
                {keywordGroups.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {step === 5 && (
            <Select value={templateId || "__none__"} onValueChange={(v) => setTemplateId(v === "__none__" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Optional template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
                {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {step === 6 && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Status (default draft)</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {status === "scheduled" && (
                  <p className="text-xs text-amber-600">Scheduled publishing automation is not active yet.</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label>Duplicate handling (default skip)</Label>
                <Select value={duplicateHandling} onValueChange={(v) => setDuplicateHandling(v as DuplicateHandling)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skip">Skip existing</SelectItem>
                    <SelectItem value="suffix">Add suffix</SelectItem>
                    <SelectItem value="overwrite_metadata">Overwrite metadata</SelectItem>
                    <SelectItem value="overwrite_template">Overwrite template + content</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Language</Label>
                <Input value={language} onChange={(e) => setLanguage(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>Job name</Label>
                <Input value={jobName} onChange={(e) => setJobName(e.target.value)} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Noindex</Label>
                <AdminToggle checked={noindex} onCheckedChange={setNoindex} />
              </div>
              {isOverwrite && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm space-y-2">
                  <p>You are about to overwrite existing pages. Published URLs/content may be affected.</p>
                  <label className="flex items-center gap-2">
                    <Checkbox checked={confirmOverwritePublished} onCheckedChange={(c) => setConfirmOverwritePublished(c === true)} />
                    I confirm overwrite of existing pages
                  </label>
                </div>
              )}
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Safe synchronous batch limit: {BULK_SAFE_SYNC_LIMIT} pages per job.
              </p>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-3">
              {previewMut.isPending ? (
                <Skeleton className="h-32 w-full" />
              ) : previewResult ? (
                <>
                  {blocked && (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                      {previewResult.blockReason}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">Total: {previewResult.summary.total}</Badge>
                    <Badge variant="secondary">OK: {previewResult.summary.ok}</Badge>
                    <Badge variant="outline">Skip: {previewResult.summary.skip}</Badge>
                    <Badge variant="outline">Overwrite: {previewResult.summary.overwrite}</Badge>
                  </div>
                  <div className="overflow-x-auto rounded border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="p-2">Title</th>
                          <th className="p-2">Slug</th>
                          <th className="p-2">Country</th>
                          <th className="p-2">State</th>
                          <th className="p-2">City</th>
                          <th className="p-2">Category</th>
                          <th className="p-2">Keyword</th>
                          <th className="p-2">Template</th>
                          <th className="p-2">Conflict</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewResult.rows.slice(0, 100).map((row, i) => (
                          <tr key={i} className="border-b last:border-0">
                            <td className="p-2 max-w-[120px] truncate">{row.title}</td>
                            <td className="p-2 font-mono text-xs">{row.slug}</td>
                            <td className="p-2 text-xs">{row.location.country}</td>
                            <td className="p-2 text-xs">{row.location.state ?? "—"}</td>
                            <td className="p-2 text-xs">{row.location.city ?? "—"}</td>
                            <td className="p-2 text-xs">{row.category ?? "—"}</td>
                            <td className="p-2 text-xs max-w-[80px] truncate">{row.primary_keyword}</td>
                            <td className="p-2 text-xs">{template?.name ?? "—"}</td>
                            <td className="p-2 text-xs">{row.conflictLabel ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {previewResult.rows.length > 100 && (
                      <p className="p-2 text-xs text-muted-foreground">Showing first 100 of {previewResult.rows.length} rows.</p>
                    )}
                  </div>
                  <Button
                    disabled={blocked || generateMut.isPending || !keywordGroup}
                    onClick={() => generateMut.mutate()}
                  >
                    Generate pages
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Run preview from Settings step.</p>
              )}
            </div>
          )}

          {step < 7 && (
            <div className="flex gap-2">
              <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>Back</Button>
              <Button disabled={!canNext() || previewMut.isPending} onClick={goNext}>
                {step === 6 ? "Preview" : "Next"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Job history</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobsQ.isLoading ? (
            <Skeleton className="h-20 m-3" />
          ) : (jobsQ.data?.rows ?? []).length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No bulk jobs yet.</p>
          ) : (
            <div className="divide-y">
              {(jobsQ.data?.rows ?? []).map((job: Record<string, unknown>) => (
                <button
                  key={String(job.id)}
                  type="button"
                  className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left text-sm hover:bg-muted/30"
                  onClick={() => setSelectedJob(job)}
                >
                  <span className="min-w-0 flex-1 font-medium truncate">{String(job.name)}</span>
                  <Badge variant="outline">{String(job.status)}</Badge>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    +{Number(job.created_count ?? 0)} / ~{Number(job.updated_count ?? 0)} / skip {Number(job.skipped_count ?? 0)} / fail {Number(job.error_count ?? 0)}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatUpdated(job.created_at as string)}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedJob && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Job details</CardTitle>
            <Button size="sm" variant="ghost" onClick={() => setSelectedJob(null)}>Close</Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <pre className="max-h-48 overflow-auto rounded bg-muted/40 p-3 text-xs">
              {JSON.stringify(selectedJob, null, 2)}
            </pre>
            {selectedJob.errors != null && (
              <pre className="max-h-32 overflow-auto rounded border border-destructive/30 p-3 text-xs text-destructive">
                {JSON.stringify(selectedJob.errors, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
