import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getSeoEditRecord, saveSeoEditRecord } from "@/lib/seo.functions";
import {
  emptySeoEditForm,
  validateSeoEditForm,
  type SeoEditFormValues,
  type SeoEditTarget,
} from "@/lib/seo/edit-form";
import type { SeoInventoryRow } from "@/lib/seo/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
}: {
  label: string;
  hint?: string;
  error?: string;
  recommendedMax?: number;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{label}</Label>
        {recommendedMax != null && (
          <span className="text-[10px] text-muted-foreground">{value.length}/{recommendedMax}</span>
        )}
      </div>
      {multiline ? (
        <Textarea value={value} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-destructive">{error}</p>}
    </div>
  );
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

  const validation = useMemo(() => validateSeoEditForm(form), [form]);
  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(savedForm), [form, savedForm]);

  const set = <K extends keyof SeoEditFormValues>(key: K, value: SeoEditFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaveError(null);
  };

  const handleReset = () => {
    setForm(savedForm);
    setSaveError(null);
  };

  const handleCancel = () => {
    setForm(savedForm);
    setSaveError(null);
    onOpenChange(false);
  };

  const handleSave = async () => {
    const result = validateSeoEditForm(form);
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

  const globalMirrorHint = target === "global"
    ? "Global defaults store title, description, and OG image. Open Graph and Twitter text fields mirror SEO title and description."
    : undefined;

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : handleCancel())}>
      <SheetContent side="right" className="flex w-full flex-col overflow-hidden sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit SEO — {label}</SheetTitle>
          <SheetDescription>
            {target === "global"
              ? "Site-wide defaults from seo_global (id=1)."
              : `Route-level settings from seo_settings for ${routePath}.`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto py-2 pr-1">
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
          {!loading && !loadError && (
            <>
              {globalMirrorHint && (
                <p className="text-xs text-muted-foreground">{globalMirrorHint}</p>
              )}
              {validation.warnings.map((warning) => (
                <p key={warning} className="text-xs text-amber-600 dark:text-amber-400">{warning}</p>
              ))}

              <Field label="SEO title" recommendedMax={60} value={form.title} onChange={(v) => set("title", v)} error={validation.fieldErrors.title} />
              <Field label="Meta description" recommendedMax={160} value={form.description} onChange={(v) => set("description", v)} multiline error={validation.fieldErrors.description} />
              <Field label="Keywords" value={form.keywords} onChange={(v) => set("keywords", v)} />

              <Field
                label="Canonical URL"
                value={form.canonicalUrl}
                onChange={(v) => set("canonicalUrl", v)}
                hint={target === "global" ? "Saved as site origin / canonical domain." : "Absolute URL for this page."}
                error={validation.fieldErrors.canonicalUrl}
              />

              <div className="grid grid-cols-2 gap-4 rounded-lg border p-3">
                <label className="flex items-center justify-between gap-2 text-sm">
                  <span>Index</span>
                  <Switch checked={form.index} onCheckedChange={(v) => set("index", v)} />
                </label>
                <label className="flex items-center justify-between gap-2 text-sm">
                  <span>Follow</span>
                  <Switch checked={form.follow} onCheckedChange={(v) => set("follow", v)} />
                </label>
              </div>

              {target === "route" ? (
                <>
                  <Field label="Open Graph title" value={form.ogTitle} onChange={(v) => set("ogTitle", v)} />
                  <Field label="Open Graph description" value={form.ogDescription} onChange={(v) => set("ogDescription", v)} multiline />
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Open Graph title</Label>
                    <Input readOnly value={form.title} className="bg-muted/40" />
                    <p className="text-[11px] text-muted-foreground">Mirrors SEO title for global defaults.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Open Graph description</Label>
                    <Textarea readOnly value={form.description} rows={3} className="bg-muted/40" />
                    <p className="text-[11px] text-muted-foreground">Mirrors meta description for global defaults.</p>
                  </div>
                </>
              )}

              <Field label="Open Graph image" value={form.ogImage} onChange={(v) => set("ogImage", v)} hint="Absolute URL or site-relative path." />

              {target === "route" ? (
                <>
                  <Field label="Twitter title" value={form.twitterTitle} onChange={(v) => set("twitterTitle", v)} />
                  <Field label="Twitter description" value={form.twitterDescription} onChange={(v) => set("twitterDescription", v)} multiline />
                  <Field label="Twitter image" value={form.twitterImage} onChange={(v) => set("twitterImage", v)} />
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Twitter title</Label>
                    <Input readOnly value={form.title} className="bg-muted/40" />
                    <p className="text-[11px] text-muted-foreground">Mirrors SEO title for global defaults.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Twitter description</Label>
                    <Textarea readOnly value={form.description} rows={3} className="bg-muted/40" />
                    <p className="text-[11px] text-muted-foreground">Mirrors meta description for global defaults.</p>
                  </div>
                  <Field label="Twitter image" value={form.ogImage} onChange={(v) => set("ogImage", v)} hint="Uses the Open Graph image for global defaults." />
                </>
              )}
            </>
          )}
        </div>

        <SheetFooter className="gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={handleReset} disabled={saving || !dirty}>
            Reset
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving || loading || !!loadError || !dirty}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
