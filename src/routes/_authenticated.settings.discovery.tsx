import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { COUNTRY_OPTIONS, detectCountryCode, flagFromCode } from "@/lib/country-flag";
import { DISCOVERY_LANGUAGE_OPTIONS, type DiscoveryContentScope, mergeDiscoveryLocalizationConfig } from "@/lib/discovery/config";
import { parseStoredContentScope, contentScopeLabel } from "@/lib/discovery/content-scope";
import { shouldShowPersonalizePrompt } from "@/lib/discovery/country";
import { getDiscoveryPrefs, getInterestTags, saveDiscoveryPrefs } from "@/lib/discovery/functions";
import { buildPersonalizationLabel } from "@/lib/discovery/discovery-label";
import { shouldShowPersonalizationLabel } from "@/lib/discovery/rollout";
import { DiscoverySearchPanel } from "@/components/discovery/DiscoverySearchPanel";
import { YaarzoDiscoverySheet } from "@/components/discovery/YaarzoDiscoverySheet";
import {
  applyPrimaryToDraft,
  mergeExperienceFromConfig,
  prefsToDraft,
  toggleDraftInterest,
  type DiscoveryDraft,
} from "@/lib/discovery/discovery-draft";
import type { DiscoverySearchHit } from "@/lib/discovery/discovery-options";
import { cn } from "@/lib/utils";
import { Compass, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings/discovery")({
  component: DiscoverySettingsPage,
  head: () => ({ meta: [{ title: "Content & Discovery · Settings" }] }),
});

type InterestTag = { slug: string; label: string; emoji: string | null; sort_order: number };

const SCOPES: DiscoveryContentScope[] = ["for_you", "my_country", "worldwide"];

function DiscoverySettingsPage() {
  const qc = useQueryClient();
  const fetchPrefs = useServerFn(getDiscoveryPrefs);
  const fetchTags = useServerFn(getInterestTags);
  const savePrefs = useServerFn(saveDiscoveryPrefs);

  const prefsQ = useQuery({ queryKey: ["discovery-prefs"], queryFn: () => fetchPrefs() });
  const tagsQ = useQuery({ queryKey: ["interest-tags"], queryFn: () => fetchTags() });

  const prefs = prefsQ.data?.prefs;
  const config = prefsQ.data?.config;
  const experience = useMemo(() => (config ? mergeExperienceFromConfig(config) : null), [config]);
  const personalizationLabel = shouldShowPersonalizationLabel(config ?? mergeDiscoveryLocalizationConfig(null))
    ? buildPersonalizationLabel(prefs ?? null, {
        primaryOptions: experience?.primaryOptions,
        nestedOptions: experience?.nestedOptions,
      })
    : null;
  const lockCountry = config?.strictIsolation.lockDiscoveryCountry && !config.allowUserChangeDiscoveryCountry;

  const parsed = useMemo(
    () => parseStoredContentScope(typeof prefs?.content_scope === "string" ? prefs.content_scope : null),
    [prefs?.content_scope],
  );

  const [country, setCountry] = useState<string | null>(null);
  const [languages, setLanguages] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [contentScope, setContentScope] = useState<DiscoveryContentScope>("for_you");
  const [strictIsolation, setStrictIsolation] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState<DiscoveryDraft | null>(null);

  useEffect(() => {
    if (!prefsQ.data) return;
    const p = prefsQ.data.prefs;
    const suggested = prefsQ.data.suggestedCountry;
    setCountry(p?.discovery_country_code ?? suggested ?? null);
    setLanguages(p?.preferred_languages?.length ? p.preferred_languages : config?.defaultLanguages ?? ["en"]);
    setInterests(p?.interests?.length ? p.interests : []);
    setContentScope(parsed.view);
    setStrictIsolation(parsed.strictIsolation);
    setSearchDraft(prefsToDraft(p));
    setDirty(false);
  }, [prefsQ.data, config?.defaultLanguages, parsed.view, parsed.strictIsolation]);

  const enabledCountries = config?.enabledCountries?.length
    ? COUNTRY_OPTIONS.filter((c) => config.enabledCountries.includes(c.code))
    : COUNTRY_OPTIONS;
  const enabledLangs = DISCOVERY_LANGUAGE_OPTIONS.filter(
    (l) => !config?.enabledLanguages?.length || config.enabledLanguages.includes(l.code),
  );

  const showBanner =
    config?.onboardingEnabled &&
    shouldShowPersonalizePrompt(prefs ?? null, { requireAgain: config?.requireOnboardingAgain });

  const toggleLang = (code: string) => {
    setLanguages((cur) => (cur.includes(code) ? cur.filter((x) => x !== code) : [...cur, code]));
    setDirty(true);
  };
  const toggleInterest = (slug: string) => {
    setInterests((cur) => (cur.includes(slug) ? cur.filter((x) => x !== slug) : [...cur, slug]));
    setDirty(true);
  };

  function applySearchHit(hit: DiscoverySearchHit) {
    if (!searchDraft || !experience) return;
    const primary = experience.primaryOptions.find((p) => p.id === hit.primaryId);
    let next = searchDraft;
    if (primary) next = applyPrimaryToDraft(searchDraft, primary);
    if (hit.slug) next = toggleDraftInterest(next, hit.slug, experience.nestedOptions);
    if (hit.languageCode && !next.preferredLanguages.includes(hit.languageCode)) {
      next = { ...next, preferredLanguages: [...next.preferredLanguages, hit.languageCode] };
    }
    setSearchDraft(next);
    if (primary?.countryCode) setCountry(primary.countryCode);
    if (primary?.contentScope) setContentScope(primary.contentScope);
    if (hit.slug) setInterests(next.interests);
    if (hit.languageCode) setLanguages(next.preferredLanguages);
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await savePrefs({
        data: {
          discovery_country_code: country,
          preferred_languages: languages,
          interests,
          content_scope: contentScope,
          strict_country_isolation: strictIsolation,
          detected_country_code: detectCountryCode() || null,
          complete_onboarding: true,
        },
      });
      toast.success("Discovery preferences saved");
      setDirty(false);
      qc.invalidateQueries({ queryKey: ["discovery-prefs"] });
      qc.invalidateQueries({ queryKey: ["chatroom-discovery"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm("Reset discovery preferences to platform defaults? Your onboarding history will be kept.")) return;
    setSaving(true);
    try {
      await savePrefs({ data: { reset_preferences: true } });
      toast.success("Preferences reset");
      qc.invalidateQueries({ queryKey: ["discovery-prefs"] });
      qc.invalidateQueries({ queryKey: ["chatroom-discovery"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Compass className="h-5 w-5" /> Content & Discovery
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose your country, interests and what content you want to see across Yaarzo.
        </p>
      </div>

      {personalizationLabel && (
        <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
          {personalizationLabel}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Discovery</CardTitle>
          <CardDescription>Open the full-screen Yaarzo discovery experience or search below to adjust your draft.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <button
            type="button"
            className="yaarzo-premium-btn w-full sm:w-auto"
            onClick={() => setSheetOpen(true)}
          >
            Change Discovery
          </button>
          {searchDraft && experience && (
            <DiscoverySearchPanel
              draft={searchDraft}
              primaryOptions={experience.primaryOptions}
              nestedOptions={experience.nestedOptions}
              enabledLanguages={config?.enabledLanguages ?? []}
              onApplySearchHit={applySearchHit}
              onToggleInterest={(slug) => {
                if (!searchDraft) return;
                const next = toggleDraftInterest(searchDraft, slug, experience.nestedOptions);
                setSearchDraft(next);
                setInterests(next.interests);
                setDirty(true);
              }}
              onRemoveInterest={(slug) => {
                if (!searchDraft) return;
                const next = { ...searchDraft, interests: searchDraft.interests.filter((s) => s !== slug) };
                setSearchDraft(next);
                setInterests(next.interests);
                setDirty(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      {sheetOpen && (
        <YaarzoDiscoverySheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          manualReopen
          onSaved={() => {
            void prefsQ.refetch();
            qc.invalidateQueries({ queryKey: ["chatroom-discovery"] });
          }}
        />
      )}

      {showBanner && (
        <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
          <button
            type="button"
            aria-label="Dismiss"
            className="absolute right-2 top-2 rounded p-0.5 text-muted-foreground hover:bg-muted"
            onClick={async () => {
              await savePrefs({ data: { dismiss_personalize_prompt: true } });
              qc.invalidateQueries({ queryKey: ["discovery-prefs"] });
            }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="font-semibold">Personalize your experience</div>
          <p className="text-muted-foreground">Set your country and interests for better recommendations.</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Discovery country</CardTitle>
          <CardDescription>Used for recommendations only — you can change this anytime.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Chip
            active={country === null}
            disabled={lockCountry}
            onClick={() => { setCountry(null); setDirty(true); }}
          >
            🌍 Worldwide
          </Chip>
          {enabledCountries.map((c) => (
            <Chip
              key={c.code}
              active={country === c.code}
              disabled={lockCountry}
              onClick={() => { setCountry(c.code); setDirty(true); }}
            >
              {flagFromCode(c.code)} {c.name}
            </Chip>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Preferred languages</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {enabledLangs.map((l) => (
            <Chip key={l.code} active={languages.includes(l.code)} onClick={() => toggleLang(l.code)}>
              {l.label}
            </Chip>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Interests</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(tagsQ.data as InterestTag[] | undefined ?? []).map((t) => (
            <Chip key={t.slug} active={interests.includes(t.slug)} onClick={() => toggleInterest(t.slug)}>
              {t.emoji ? `${t.emoji} ` : ""}{t.label}
            </Chip>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Content scope</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {SCOPES.map((s) => (
            <Chip
              key={s}
              active={contentScope === s}
              onClick={() => { setContentScope(s); setDirty(true); }}
            >
              {contentScopeLabel(s)}
            </Chip>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <Label htmlFor="strict-isolation" className="text-sm font-medium">Strict country isolation</Label>
            <p className="text-xs text-muted-foreground">Only show content scoped to your discovery country.</p>
          </div>
          <Switch
            id="strict-isolation"
            checked={strictIsolation}
            onCheckedChange={(v) => { setStrictIsolation(v); setDirty(true); }}
            disabled={config?.strictIsolation.enabled && config.strictIsolation.lockDiscoveryCountry}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="yaarzo-premium-btn" disabled={saving || !dirty} onClick={handleSave}>
          {saving ? "Saving…" : "Save preferences"}
        </button>
        <Button variant="outline" disabled={saving} onClick={handleReset}>
          Reset preferences
        </Button>
        <Button variant="ghost" asChild><Link to="/chatroom">Open chatrooms</Link></Button>
        <Button variant="ghost" asChild><Link to="/settings/privacy">Privacy settings</Link></Button>
      </div>
    </div>
  );
}

function Chip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors disabled:opacity-50",
        active ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
