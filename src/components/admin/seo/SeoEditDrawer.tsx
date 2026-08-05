import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSeoEditRecord, saveSeoEditRecord } from "@/lib/seo.functions";
import {
  emptySeoEditForm,
  validateSeoEditForm,
  type SeoEditFormValues,
  type SeoEditTarget,
  type SeoValueSource,
} from "@/lib/seo/edit-form";
import { resolvePageSeo } from "@/lib/seo/resolve-seo";
import type { SeoInventoryRow } from "@/lib/seo/inventory";
import { SeoPreviewPanels } from "@/components/admin/seo/SeoPreviewPanels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type SeoEditRecord = Awaited<ReturnType<typeof getSeoEditRecord>>;

type SeoEditDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: SeoEditTarget;
  routePath: string | null;
  label: string;
  onSaved: (row: SeoInventoryRow, warnings: string[]) => void;
};

function Field({
  label,
  hint,
  error,
  recommendedMax,
  value,
  onChange,
  multiline,
  readOnly,
  inheritedValue,
  source,
}: {
  label: string;
  hint?: string;
  error?: string;
  recommendedMax?: number;
  value: string;
  onChange?: (value: string) => void;
  multiline?: boolean;
  readOnly?: boolean;
  inheritedValue?: string;
  source?: SeoValueSource;
}) {
  const showingInherited = !value.trim() && !!inheritedValue?.trim();
  const displayValue = showingInherited ? inheritedValue ?? "" : value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-xs">{label}</Label>
          {source && <SourceBadge source={source} />}
        </div>
        {recommendedMax != null && (
          <span className="text-[10px] text-muted-foreground">{displayValue.length}/{recommendedMax}</span>
        )}
      </div>
      {multiline ? (
        <Textarea
          value={displayValue}
          rows={3}
          readOnly={readOnly}
          className={showingInherited ? "bg-muted/40 italic text-muted-foreground" : undefined}
          onChange={(e) => onChange?.(e.target.value)}
        />
      ) : (
        <Input
          value={displayValue}
          readOnly={readOnly}
          className={showingInherited ? "bg-muted/40 italic text-muted-foreground" : undefined}
          onChange={(e) => onChange?.(e.target.value)}
        />
      )}
      {showingInherited && (
        <p className="text-[11px] text-muted-foreground">Showing inherited value. Enter text to override.</p>
      )}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
}

function SourceBadge({ source }: { source: SeoValueSource }) {
  const label =
    source === "custom" ? "Custom"
    : source === "dynamic" ? "Dynamic"
    : source === "route_code" ? "Route Code"
    : source === "global_default" ? "Global Default"
    : "Missing";
  return (
    <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0">
      {label}
    </Badge>
  );
}

function valueSource(custom: string, inherited: string): SeoValueSource {
  if (custom.trim()) return "custom";
  if (inherited.trim()) return "global_default";
  return "missing";
}

export function SeoEditDrawer({
  open,
  onOpenChange,
  target,
  routePath,
  label,
  onSaved,
}: SeoEditDrawerProps) {
  const fetchRecord = useServerFn(getSeoEditRecord);
  const saveRecord = useServerFn(saveSeoEditRecord);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState<SeoEditFormValues>(emptySeoEditForm());
  const [savedForm, setSavedForm] = useState<SeoEditFormValues>(emptySeoEditForm());
  const [inherited, setInherited] = useState<SeoEditFormValues>(emptySeoEditForm());
  const [meta, setMeta] = useState<Partial<SeoEditRecord>>({});

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setSaveError(null);

    fetchRecord({ data: { target, routePath: routePath ?? undefined } })
      .then((result) => {
        if (cancelled) return;
        setForm(result.form);
        setSavedForm(result.form);
        setInherited(result.inherited ?? emptySeoEditForm());
        setMeta(result);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setLoadError(err.message || "Could not load SEO record.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, target, routePath, fetchRecord]);

  const validation = useMemo(
    () => validateSeoEditForm(form, {
      isTemplate: meta.isTemplate,
      templateVariables: meta.templateVariables,
    }),
    [form, meta.isTemplate, meta.templateVariables],
  );
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedForm), [form, savedForm]);
  const readOnly = meta.canManage === false;

  const previewSeo = useMemo(() => {
    const mockPage = {
      page_key: meta.pageKey ?? "preview",
      route_path: routePath,
      label: label,
      enabled: true,
      title: form.title || inherited.title,
      description: form.description || inherited.description,
      keywords: form.keywords || inherited.keywords,
      canonical_url: form.canonicalUrl || inherited.canonicalUrl,
      og_title: form.ogTitle || form.title || inherited.ogTitle,
      og_description: form.ogDescription || form.description || inherited.ogDescription,
      og_image: form.ogImage || inherited.ogImage,
      twitter_card: null,
      twitter_title: form.twitterTitle || form.ogTitle || inherited.twitterTitle,
      twitter_description: form.twitterDescription || form.ogDescription || inherited.twitterDescription,
      twitter_image: form.twitterImage || form.ogImage || inherited.twitterImage,
      robots: null,
      json_ld: null,
      sitemap_priority: Number(form.sitemapPriority) || 0.5,
      sitemap_changefreq: form.sitemapChangeFreq,
      sitemap_exclude: !form.sitemapEnabled,
      noindex: !form.index,
      nofollow: !form.follow,
      is_dynamic: !!meta.isTemplate,
      auto_discovered: false,
    };
    return resolvePageSeo(mockPage, null, { routePath: routePath ?? "/" });
  }, [form, inherited, meta, routePath, label]);

  const set = <K extends keyof SeoEditFormValues>(key: K, value: SeoEditFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveError(null);
  };

  const handleReset = () => {
    setForm(savedForm);
    setSaveError(null);
  };

  const handleResetInherited = async () => {
    if (readOnly) return;
    setSaving(true);
    setSaveError(null);
    try {
      const response = await saveRecord({
        data: {
          target,
          routePath: routePath ?? undefined,
          form: savedForm,
          resetToInherited: true,
        },
      });
      const resetForm = inherited;
      setForm(resetForm);
      setSavedForm(resetForm);
      onSaved(response.row, response.warnings ?? []);
      toast.success("Reset to inherited SEO values.");
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reset failed.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(savedForm);
    setSaveError(null);
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (readOnly) return;
    const result = validateSeoEditForm(form, {
      isTemplate: meta.isTemplate,
      templateVariables: meta.templateVariables,
    });
    if (Object.keys(result.fieldErrors).length) {
      setSaveError(Object.values(result.fieldErrors)[0] ?? "Fix validation errors before saving.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const response = await saveRecord({
        data: {
          target,
          routePath: routePath ?? undefined,
          form,
        },
      });
      setSavedForm(form);
      onSaved(response.row, response.warnings ?? []);
      toast.success("SEO settings saved.");
      for (const warning of response.warnings ?? []) {
        toast.message(warning);
      }
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const drawerTitle = meta.isTemplate
    ? `Edit Template — ${label}`
    : `Edit SEO — ${label}`;

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleCancel())}>
      <SheetContent side="right" className="flex w-full flex-col overflow-hidden sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{drawerTitle}</SheetTitle>
          <SheetDescription>
            {target === "global"
              ? "Site-wide defaults from seo_global (id=1)."
              : `Route-level settings from seo_settings for ${routePath}.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-2 pr-1">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading SEO record…
            </div>
          )}
          {loadError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {loadError}
            </div>
          )}
          {saveError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {saveError}
            </div>
          )}
          {readOnly && (
            <div className="mb-3 rounded-md border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Read-only: you do not have manage_seo_settings permission.
            </div>
          )}
          {meta.privateRouteWarning && (
            <div className="mb-3 flex gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {meta.privateRouteWarning}
            </div>
          )}
          {meta.cmsManaged && (
            <div className="mb-3 space-y-2 rounded-md border border-blue-500/30 bg-blue-500/5 px-3 py-2 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline">Managed by CMS</Badge>
                <span className="text-muted-foreground">Per-page SEO lives in the CMS page editor.</span>
              </div>
              <Link
                to="/admin/pages"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                Open CMS Pages
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          {!loading && !loadError && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-3 flex h-auto w-full flex-wrap">
                <TabsTrigger value="basic" className="text-xs">Basic SEO</TabsTrigger>
                <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
                <TabsTrigger value="robots" className="text-xs">Canonical & Robots</TabsTrigger>
                <TabsTrigger value="structured" className="text-xs">Structured Data</TabsTrigger>
                <TabsTrigger value="sitemap" className="text-xs">Sitemap</TabsTrigger>
                <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
              </TabsList>

              {validation.warnings.map((warning) => (
                <p key={warning} className="mb-2 text-xs text-amber-600 dark:text-amber-400">{warning}</p>
              ))}

              {meta.isTemplate && (meta.templateVariables?.length ?? 0) > 0 && (
                <div className="mb-3 rounded-md border bg-muted/30 p-2 text-xs">
                  <p className="mb-1 font-medium">Available template variables</p>
                  <div className="flex flex-wrap gap-1">
                    {meta.templateVariables!.map((v) => (
                      <Badge key={v} variant="secondary" className="font-mono text-[10px]">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <TabsContent value="basic" className="space-y-4">
                <Field
                  label="SEO title"
                  recommendedMax={60}
                  value={form.title}
                  inheritedValue={inherited.title}
                  source={valueSource(form.title, inherited.title)}
                  onChange={(v) => set("title", v)}
                  error={validation.fieldErrors.title}
                  readOnly={readOnly}
                />
                <Field
                  label="Meta description"
                  recommendedMax={160}
                  value={form.description}
                  inheritedValue={inherited.description}
                  source={valueSource(form.description, inherited.description)}
                  onChange={(v) => set("description", v)}
                  multiline
                  error={validation.fieldErrors.description}
                  readOnly={readOnly}
                />
                <Field
                  label="Keywords"
                  value={form.keywords}
                  inheritedValue={inherited.keywords}
                  source={valueSource(form.keywords, inherited.keywords)}
                  onChange={(v) => set("keywords", v)}
                  readOnly={readOnly}
                />
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <Field label="Open Graph title" value={form.ogTitle} inheritedValue={inherited.ogTitle} onChange={(v) => set("ogTitle", v)} readOnly={readOnly} />
                <Field label="Open Graph description" value={form.ogDescription} inheritedValue={inherited.ogDescription} onChange={(v) => set("ogDescription", v)} multiline readOnly={readOnly} />
                <Field label="Open Graph image" value={form.ogImage} inheritedValue={inherited.ogImage} onChange={(v) => set("ogImage", v)} hint="Absolute URL or site-relative path." readOnly={readOnly} />
                <Field label="Twitter title" value={form.twitterTitle} inheritedValue={inherited.twitterTitle} onChange={(v) => set("twitterTitle", v)} readOnly={readOnly} />
                <Field label="Twitter description" value={form.twitterDescription} inheritedValue={inherited.twitterDescription} onChange={(v) => set("twitterDescription", v)} multiline readOnly={readOnly} />
                <Field label="Twitter image" value={form.twitterImage} inheritedValue={inherited.twitterImage} onChange={(v) => set("twitterImage", v)} readOnly={readOnly} />
              </TabsContent>

              <TabsContent value="robots" className="space-y-4">
                <Field
                  label="Canonical URL"
                  value={form.canonicalUrl}
                  inheritedValue={inherited.canonicalUrl}
                  onChange={(v) => set("canonicalUrl", v)}
                  hint={target === "global" ? "Saved as site origin / canonical domain." : "Absolute URL for this page."}
                  error={validation.fieldErrors.canonicalUrl}
                  readOnly={readOnly}
                />
                <div className="grid grid-cols-2 gap-4 rounded-lg border p-3">
                  <label className="flex items-center justify-between gap-2 text-sm">
                    <span>Index</span>
                    <Switch checked={form.index} disabled={readOnly} onCheckedChange={(v) => set("index", v)} />
                  </label>
                  <label className="flex items-center justify-between gap-2 text-sm">
                    <span>Follow</span>
                    <Switch checked={form.follow} disabled={readOnly} onCheckedChange={(v) => set("follow", v)} />
                  </label>
                </div>
              </TabsContent>

              <TabsContent value="structured" className="space-y-4">
                <Field label="JSON-LD type" value={form.jsonLdType} onChange={(v) => set("jsonLdType", v)} hint="e.g. WebPage, Article, Organization" readOnly={readOnly} />
                <Field
                  label="Custom JSON-LD"
                  value={form.customJsonLd}
                  onChange={(v) => set("customJsonLd", v)}
                  multiline
                  hint="Valid JSON object. @type merges with JSON-LD type above."
                  error={validation.fieldErrors.customJsonLd}
                  readOnly={readOnly}
                />
              </TabsContent>

              <TabsContent value="sitemap" className="space-y-4">
                <label className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm">
                  <span>Include in sitemap</span>
                  <Switch checked={form.sitemapEnabled} disabled={readOnly} onCheckedChange={(v) => set("sitemapEnabled", v)} />
                </label>
                <Field label="Sitemap priority (0.0–1.0)" value={form.sitemapPriority} onChange={(v) => set("sitemapPriority", v)} error={validation.fieldErrors.sitemapPriority} readOnly={readOnly} />
                <div className="space-y-1.5">
                  <Label className="text-xs">Change frequency</Label>
                  <Select value={form.sitemapChangeFreq} disabled={readOnly} onValueChange={(v) => set("sitemapChangeFreq", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((freq) => (
                        <SelectItem key={freq} value={freq}>{freq}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="space-y-2 rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Resolved title</span>
                    <SourceBadge source={valueSource(form.title, inherited.title)} />
                  </div>
                  <p className="font-medium">{previewSeo.title || "—"}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground">Resolved description</span>
                    <SourceBadge source={valueSource(form.description, inherited.description)} />
                  </div>
                  <p className="text-muted-foreground">{previewSeo.description || "—"}</p>
                </div>
                <SeoPreviewPanels seo={previewSeo} />
              </TabsContent>
            </Tabs>
          )}
        </div>

        <SheetFooter className="gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          {target === "route" && !readOnly && (
            <Button type="button" variant="outline" onClick={handleResetInherited} disabled={saving || loading}>
              Reset to inherited
            </Button>
          )}
          <Button type="button" variant="outline" onClick={handleReset} disabled={saving || !dirty || readOnly}>
            Undo changes
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || loading || !!loadError || !dirty || readOnly}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
