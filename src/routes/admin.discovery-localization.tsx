import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAdminSetting } from "@/lib/use-admin-setting";
import {
  DISCOVERY_LOCALIZATION_DEFAULTS,
  DISCOVERY_SETTINGS_KEY,
  normalizeModuleMix,
  type DiscoveryLocalizationConfig,
  type DiscoveryMode,
  type DiscoveryRolloutMode,
} from "@/lib/discovery/config";
import { useServerFn } from "@tanstack/react-start";
import { getDiscoveryChatroomMetadataStats, resetAllDiscoveryOnboarding } from "@/lib/discovery/functions";
import { NestedDiscoveryEditor, ModuleRolloutSection } from "@/components/admin/NestedDiscoveryEditor";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/discovery-localization")({
  component: DiscoveryLocalizationAdmin,
});

function MixRow({
  label,
  mix,
  onChange,
}: {
  label: string;
  mix: DiscoveryLocalizationConfig["hybridMix"];
  onChange: (m: DiscoveryLocalizationConfig["hybridMix"]) => void;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="mb-2 text-sm font-semibold">{label}</div>
      <div className="grid gap-2 sm:grid-cols-3">
        {(["countryPct", "interestsPct", "globalPct"] as const).map((k) => (
          <div key={k}>
            <Label className="text-xs capitalize">{k.replace("Pct", " %")}</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={mix[k]}
              onChange={(e) => onChange(normalizeModuleMix({ ...mix, [k]: Number(e.target.value) || 0 }))}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function DiscoveryLocalizationAdmin() {
  const { values, set, patch, save, saving } = useAdminSetting<DiscoveryLocalizationConfig>(
    DISCOVERY_SETTINGS_KEY,
    DISCOVERY_LOCALIZATION_DEFAULTS,
  );
  const resetOnboarding = useServerFn(resetAllDiscoveryOnboarding);
  const fetchMeta = useServerFn(getDiscoveryChatroomMetadataStats);
  const metaQ = useQuery({ queryKey: ["discovery-chatroom-meta"], queryFn: () => fetchMeta() });

  function setRollout(mode: DiscoveryRolloutMode) {
    set("rolloutMode", mode);
    if (mode === "OFF") set("fullScreenDiscoveryEnabled", false);
    else set("fullScreenDiscoveryEnabled", true);
  }

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Discovery & Localization"
        description="Gradual rollout controls for the full-screen Yaarzo discovery experience."
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-semibold">Rollout mode</h2>
          <div className="grid gap-2 sm:max-w-md">
            <Label className="text-xs">Discovery rollout</Label>
            <select
              className="rounded-md border bg-background px-2 py-1.5 text-sm"
              value={values.rolloutMode}
              onChange={(e) => setRollout(e.target.value as DiscoveryRolloutMode)}
            >
              <option value="OFF">OFF — personalization inactive, prefs stored</option>
              <option value="GLOBAL_ONLY">GLOBAL_ONLY — worldwide content, no onboarding sheet</option>
              <option value="SELECTED_COUNTRIES">SELECTED_COUNTRIES — enabled primaries only</option>
              <option value="FULL_ROLLOUT">FULL_ROLLOUT — all enabled options</option>
            </select>
          </div>
          <Row label="First-login discovery required" checked={values.firstLoginDiscoveryRequired} onChange={(v) => set("firstLoginDiscoveryRequired", v)} />
          <Row label="Allow skip onboarding" checked={values.allowSkipOnboarding} onChange={(v) => set("allowSkipOnboarding", v)} />
          <Row label="Show Coming soon for disabled options" checked={values.showComingSoonForDisabled} onChange={(v) => set("showComingSoonForDisabled", v)} />
          <Row label="Require onboarding again (all users)" checked={values.requireOnboardingAgain} onChange={(v) => set("requireOnboardingAgain", v)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Primary discovery options</h2>
          <div className="flex flex-wrap gap-2">
            {values.primaryOptions.map((p, i) => (
              <label key={p.id} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  disabled={values.rolloutMode === "GLOBAL_ONLY" && p.id !== "global"}
                  onChange={(e) => {
                    const next = [...values.primaryOptions];
                    next[i] = { ...p, enabled: e.target.checked };
                    set("primaryOptions", next);
                  }}
                />
                {p.emoji} {p.label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Nested cities & topics</h2>
          <NestedDiscoveryEditor
            nestedOptions={values.nestedOptions}
            primaryOptions={values.primaryOptions}
            onChange={(next) => set("nestedOptions", next)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Module rollout</h2>
          <ModuleRolloutSection modules={values.modules} onChange={(m) => set("modules", m)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-semibold">Ranking & fallback</h2>
          <div className="grid gap-2 sm:max-w-xs">
            <Label className="text-xs">Discovery mode</Label>
            <select
              className="rounded-md border bg-background px-2 py-1.5 text-sm"
              value={values.discoveryMode}
              onChange={(e) => set("discoveryMode", e.target.value as DiscoveryMode)}
            >
              <option value="global_first">Global First</option>
              <option value="country_first">Country First</option>
              <option value="hybrid">Hybrid</option>
              <option value="country_only">Country Only</option>
            </select>
          </div>
          <div className="grid gap-2 sm:max-w-xs">
            <Label className="text-xs">Minimum local items before global fallback</Label>
            <Input type="number" min={1} value={values.minLocalContentThreshold} onChange={(e) => set("minLocalContentThreshold", Number(e.target.value) || 10)} />
          </div>
          <MixRow label="Chatrooms mix" mix={values.moduleMix.chatrooms} onChange={(m) => patch({ moduleMix: { ...values.moduleMix, chatrooms: m } })} />
          <MixRow label="Feed mix" mix={values.moduleMix.feed} onChange={(m) => patch({ moduleMix: { ...values.moduleMix, feed: m } })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Chatroom metadata coverage</h2>
          {metaQ.data ? (
            <div className="space-y-1 text-sm">
              <p>Published chatrooms: <strong>{metaQ.data.total}</strong></p>
              <p>With non-global audience_scope: <strong>{metaQ.data.audienceScope}</strong></p>
              <p>With country_code: <strong>{metaQ.data.countryCode}</strong></p>
              <p>With interest_slugs: <strong>{metaQ.data.interestSlugs}</strong></p>
              <p>With language_codes: <strong>{metaQ.data.languageCodes}</strong></p>
              {metaQ.data.total > 0 && metaQ.data.countryCode < metaQ.data.total * 0.3 && (
                <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-200">
                  Most chatrooms lack discovery metadata. Country ranking will have limited effect until admin chatroom fields are populated.
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Loading chatroom metadata stats…</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Strict country isolation</h2>
          <Row label="Enable strict country isolation" checked={values.strictIsolation.enabled} onChange={(v) => patch({ strictIsolation: { ...values.strictIsolation, enabled: v } })} />
          <Row label="Allow global rooms" checked={values.strictIsolation.allowGlobalRooms} onChange={(v) => patch({ strictIsolation: { ...values.strictIsolation, allowGlobalRooms: v } })} />
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => save()} disabled={saving}>{saving ? "Saving…" : "Save settings"}</Button>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await resetOnboarding({});
              toast.success("Onboarding reset for all users");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed");
            }
          }}
        >
          Reset onboarding for all users
        </Button>
        <Button variant="ghost" asChild><Link to="/chatroom">Preview in chatrooms</Link></Button>
      </div>
    </div>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <AdminToggle checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
