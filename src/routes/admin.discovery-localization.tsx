import { createFileRoute, Link } from "@tanstack/react-router";
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
} from "@/lib/discovery/config";
import { useServerFn } from "@tanstack/react-start";
import { resetAllDiscoveryOnboarding } from "@/lib/discovery/functions";
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

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Discovery & Localization"
        description="Configure Yaarzo-wide country, language and interest discovery. Reuses one ranking service across chatrooms, feed, poetry and more."
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <Row label="Enable onboarding modal" checked={values.onboardingEnabled} onChange={(v) => set("onboardingEnabled", v)} />
          <Row label="Require onboarding again (all users)" checked={values.requireOnboardingAgain} onChange={(v) => set("requireOnboardingAgain", v)} />
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
            <Label className="text-xs">Default country (ISO)</Label>
            <Input value={values.defaultCountryCode} onChange={(e) => set("defaultCountryCode", e.target.value.toUpperCase().slice(0, 2))} />
          </div>
          <div className="grid gap-2 sm:max-w-xs">
            <Label className="text-xs">Minimum local items before global fallback</Label>
            <Input type="number" min={1} value={values.minLocalContentThreshold} onChange={(e) => set("minLocalContentThreshold", Number(e.target.value) || 10)} />
          </div>
          <Row label="Allow users to change discovery country" checked={values.allowUserChangeDiscoveryCountry} onChange={(v) => set("allowUserChangeDiscoveryCountry", v)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-4">
          <h2 className="text-sm font-semibold">Hybrid mix (default)</h2>
          <MixRow label="Platform default" mix={values.hybridMix} onChange={(m) => set("hybridMix", m)} />
          <MixRow label="Chatrooms" mix={values.moduleMix.chatrooms} onChange={(m) => patch({ moduleMix: { ...values.moduleMix, chatrooms: m } })} />
          <MixRow label="Feed" mix={values.moduleMix.feed} onChange={(m) => patch({ moduleMix: { ...values.moduleMix, feed: m } })} />
          <MixRow label="Poetry Hub" mix={values.moduleMix.poetry} onChange={(m) => patch({ moduleMix: { ...values.moduleMix, poetry: m } })} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h2 className="text-sm font-semibold">Strict country isolation</h2>
          <Row label="Enable strict country isolation" checked={values.strictIsolation.enabled} onChange={(v) => patch({ strictIsolation: { ...values.strictIsolation, enabled: v } })} />
          <Row label="Allow global rooms" checked={values.strictIsolation.allowGlobalRooms} onChange={(v) => patch({ strictIsolation: { ...values.strictIsolation, allowGlobalRooms: v } })} />
          <Row label="Allow joined foreign rooms" checked={values.strictIsolation.allowJoinedForeignRooms} onChange={(v) => patch({ strictIsolation: { ...values.strictIsolation, allowJoinedForeignRooms: v } })} />
          <Row label="Allow search across countries" checked={values.strictIsolation.allowSearchAcrossCountries} onChange={(v) => patch({ strictIsolation: { ...values.strictIsolation, allowSearchAcrossCountries: v } })} />
          <Row label="Lock discovery country" checked={values.strictIsolation.lockDiscoveryCountry} onChange={(v) => patch({ strictIsolation: { ...values.strictIsolation, lockDiscoveryCountry: v } })} />
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
