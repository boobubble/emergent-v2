import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Globe2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectCountryCode } from "@/lib/country-flag";
import { useAuth } from "@/lib/auth-store";
import { getDiscoveryPrefs, saveDiscoveryPrefs } from "@/lib/discovery/functions";
import type { DiscoveryLocalizationConfig } from "@/lib/discovery/config";
import {
  applyPrimaryToDraft,
  draftToSavePayload,
  mergeExperienceFromConfig,
  nestedOptionsForDraft,
  prefsToDraft,
  toggleDraftInterest,
  type DiscoveryDraft,
} from "@/lib/discovery/discovery-draft";
import type { DiscoverySearchHit } from "@/lib/discovery/discovery-options";
import { DiscoverySearchPanel } from "@/components/discovery/DiscoverySearchPanel";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/BrandMark";
import { isDiscoveryFeatureEnabled } from "@/lib/discovery/rollout";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isMobile?: boolean;
  onSaved?: () => void;
  /** Manual reopen from settings — keeps completion timestamp, only updates prefs */
  manualReopen?: boolean;
};

export function YaarzoDiscoverySheet({ open, onOpenChange, isMobile = false, onSaved, manualReopen = false }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fetchPrefs = useServerFn(getDiscoveryPrefs);
  const savePrefs = useServerFn(saveDiscoveryPrefs);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [draft, setDraft] = useState<DiscoveryDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<DiscoveryLocalizationConfig | null>(null);

  useEffect(() => {
    if (!open || !user || user.isGuest) return;
    let cancelled = false;
    void fetchPrefs().then((data) => {
      if (cancelled) return;
      setConfig(data.config);
      setDraft(prefsToDraft(data.prefs));
      setStep(manualReopen || data.prefs?.discovery_onboarding_completed_at ? 2 : 1);
    });
    return () => { cancelled = true; };
  }, [open, user, fetchPrefs, manualReopen]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && config?.allowSkipOnboarding) onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, config?.allowSkipOnboarding, onOpenChange]);

  const experience = useMemo(() => (config ? mergeExperienceFromConfig(config) : null), [config]);
  const primaryOptions = experience?.primaryOptions ?? [];
  const nestedOptions = experience?.nestedOptions ?? [];
  const nested = draft ? nestedOptionsForDraft(draft, nestedOptions) : [];
  const selectedPrimary = primaryOptions.find((p) => p.id === draft?.primaryId);

  async function handleSave() {
    if (!draft || !user) return;
    setSaving(true);
    try {
      await savePrefs({
        data: {
          ...draftToSavePayload(draft),
          detected_country_code: detectCountryCode() || null,
          complete_onboarding: true,
        },
      });
      await qc.invalidateQueries({ queryKey: ["discovery-prefs"] });
      await qc.invalidateQueries({ queryKey: ["chatroom-discovery"] });
      onSaved?.();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    if (!user) return;
    setSaving(true);
    try {
      await savePrefs({ data: { skip_with_defaults: true, complete_onboarding: true } });
      await qc.invalidateQueries({ queryKey: ["discovery-prefs"] });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  function applySearchHit(hit: DiscoverySearchHit) {
    if (!draft) return;
    const primary = primaryOptions.find((p) => p.id === hit.primaryId);
    if (primary) {
      setDraft(applyPrimaryToDraft(draft, primary));
      setStep(2);
    }
    if (hit.languageCode) {
      setDraft((d) =>
        d
          ? {
              ...d,
              preferredLanguages: d.preferredLanguages.includes(hit.languageCode!)
                ? d.preferredLanguages
                : [...d.preferredLanguages, hit.languageCode!],
            }
          : d,
      );
    }
  }

  if (!user || user.isGuest || !open || !config || !isDiscoveryFeatureEnabled(config)) return null;

  const content = (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-background/95 backdrop-blur-xl motion-reduce:backdrop-blur-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="yaarzo-discovery-title"
      ref={dialogRef}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" aria-hidden />

      <div className="relative mx-auto flex h-full w-full max-w-6xl flex-col px-4 md:px-8">
        <header className="shrink-0 border-b border-border/50 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="flex items-start gap-3">
            <BrandMark slot="chat" alt="Yaarzo" className="h-10 w-10 rounded-xl object-contain" fallback={<span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">Y</span>} />
            <div className="min-w-0 flex-1">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3 w-3" /> Yaarzo Discovery
              </div>
              <h1 id="yaarzo-discovery-title" className="text-2xl font-bold tracking-tight md:text-3xl">Choose Your Yaarzo</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
                Select the people, places and conversations you want to explore.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <span className={cn("rounded-full px-2.5 py-1", step === 1 ? "bg-primary text-primary-foreground" : "bg-muted")}>1. Region</span>
            <ArrowRight className="h-3 w-3" />
            <span className={cn("rounded-full px-2.5 py-1", step === 2 ? "bg-primary text-primary-foreground" : "bg-muted")}>2. Channels & topics</span>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-5">
          {draft && (
            <DiscoverySearchPanel
              draft={draft}
              primaryOptions={primaryOptions}
              nestedOptions={nestedOptions}
              enabledLanguages={config.enabledLanguages ?? []}
              onApplySearchHit={applySearchHit}
              onToggleInterest={(slug) => setDraft((d) => (d ? toggleDraftInterest(d, slug, nestedOptions) : d))}
              onRemoveInterest={(slug) => setDraft((d) => (d ? { ...d, interests: d.interests.filter((s) => s !== slug) } : d))}
              className="mb-5"
            />
          )}

          {step === 1 && (
            <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
              {primaryOptions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (!draft) return;
                    setDraft(applyPrimaryToDraft(draft, p));
                    setStep(2);
                  }}
                  className={cn(
                    "premium-surface premium-surface-hover group relative min-h-[8.5rem] overflow-hidden rounded-2xl p-5 text-left transition-transform hover:scale-[1.01] motion-reduce:transition-none motion-reduce:hover:scale-100",
                    draft?.primaryId === p.id && "ring-2 ring-primary/60",
                  )}
                >
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition group-hover:bg-primary/20" />
                  <div className="relative text-4xl">{p.emoji}</div>
                  <div className="relative mt-3 text-lg font-semibold">{p.label}</div>
                  <p className="relative mt-1 text-xs leading-relaxed text-muted-foreground md:text-sm">{p.description}</p>
                  {p.kind === "language_community" && (
                    <span className="relative mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">Language-first · Global</span>
                  )}
                  {p.kind === "country" && (
                    <span className="relative mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">Country scope</span>
                  )}
                  {p.kind === "global" && (
                    <span className="relative mt-2 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                      <Globe2 className="h-3 w-3" /> Worldwide
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {step === 2 && draft && (
            <div className="space-y-5">
              {selectedPrimary && (
                <div className="premium-surface rounded-xl px-4 py-3 text-sm">
                  <span className="text-muted-foreground">Selected: </span>
                  <span className="font-semibold">{selectedPrimary.emoji} {selectedPrimary.label}</span>
                  <button type="button" className="ml-2 text-xs text-primary underline" onClick={() => setStep(1)}>Change region</button>
                </div>
              )}
              <div className={cn("grid gap-2.5", isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}>
                {nested.map((n) => {
                  const active = draft.interests.includes(n.slug);
                  return (
                    <button
                      key={n.slug}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setDraft(toggleDraftInterest(draft, n.slug, nestedOptions))}
                      className={cn(
                        "min-h-12 rounded-xl border px-3 py-3 text-left text-sm font-medium transition motion-reduce:transition-none",
                        active ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-background/70 hover:border-primary/30 hover:bg-muted/40",
                      )}
                    >
                      {n.emoji ? `${n.emoji} ` : ""}{n.label}
                    </button>
                  );
                })}
              </div>
              <div className="premium-surface flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                <div>
                  <Label htmlFor="yaarzo-strict" className="text-sm font-medium">Strict country isolation</Label>
                  <p className="text-xs text-muted-foreground">Hide unrelated foreign country content.</p>
                </div>
                <Switch id="yaarzo-strict" checked={draft.strictIsolation} onCheckedChange={(v) => setDraft({ ...draft, strictIsolation: v })} />
              </div>
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-border/50 bg-background/90 py-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex flex-wrap gap-2">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="min-h-12 flex-1 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted">
                Back
              </button>
            )}
            {config.allowSkipOnboarding && !manualReopen && (
              <button type="button" disabled={saving} onClick={() => void handleSkip()} className="min-h-12 rounded-xl border border-border px-4 text-sm font-semibold hover:bg-muted">
                Skip for now
              </button>
            )}
            <button
              type="button"
              disabled={!draft?.primaryId || saving}
              onClick={() => {
                if (step === 1 && draft?.primaryId) setStep(2);
                else void handleSave();
              }}
              className="yaarzo-premium-btn min-h-12 flex-[2] disabled:opacity-50"
            >
              {saving ? "Saving…" : step === 1 ? "Continue" : "Save & Explore"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
