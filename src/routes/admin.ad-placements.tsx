import { createFileRoute } from "@tanstack/react-router";
import { Save, Megaphone, Eye, EyeOff, Smartphone, Monitor, Globe2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminSetting } from "@/lib/use-admin-setting";
import {
  AD_PLACEMENTS_DEFAULTS,
  FORMAT_META,
  SURFACE_META,
  type AdFormat,
  type AdPlacementsConfig,
  type AdSurface,
  type AudienceTarget,
  type DeviceTarget,
  type PlacementConfig,
} from "@/lib/ad-placements-config";

export const Route = createFileRoute("/admin/ad-placements")({
  component: AdPlacementsPage,
});

const SURFACES = Object.keys(SURFACE_META) as AdSurface[];
const FORMATS = Object.keys(FORMAT_META) as AdFormat[];

function AdPlacementsPage() {
  const { values, set, patch, save, saving } = useAdminSetting<AdPlacementsConfig>(
    "ad_placements",
    AD_PLACEMENTS_DEFAULTS,
  );

  const updatePlacement = (surface: AdSurface, next: Partial<PlacementConfig>) => {
    patch({
      placements: {
        ...values.placements,
        [surface]: { ...values.placements[surface], ...next },
      },
    });
  };

  const toggleFormat = (surface: AdSurface, format: AdFormat) => {
    const cur = values.placements[surface].formats;
    const next = cur.includes(format) ? cur.filter((f) => f !== format) : [...cur, format];
    updatePlacement(surface, { formats: next });
  };

  const enabledCount = SURFACES.filter((s) => values.placements[s].enabled).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ad Placements"
        description="Visual placement manager. Decide where ads appear without editing code. Existing AdSense / custom HTML containers are preserved."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      {/* Global controls */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Megaphone className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Enable Placement Manager</p>
              <p className="text-xs text-muted-foreground">
                Master switch. When off, only the legacy Ads &amp; Scripts slots render.
              </p>
            </div>
            <AdminToggle checked={values.enabled} onCheckedChange={(v) => set("enabled", v)} />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">Premium ad-free mode</p>
              <p className="text-xs text-muted-foreground">
                Hide every placement for users with an active premium subscription.
              </p>
            </div>
            <AdminToggle
              checked={values.premiumAdFree}
              onCheckedChange={(v) => set("premiumAdFree", v)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">Hide all ads for guests</p>
              <p className="text-xs text-muted-foreground">
                Overrides per-placement audience rules.
              </p>
            </div>
            <AdminToggle
              checked={values.hideForGuests}
              onCheckedChange={(v) => set("hideForGuests", v)}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="global-max">Global max ads per page</Label>
              <Input
                id="global-max"
                type="number"
                min={0}
                max={50}
                value={values.globalMaxPerPage}
                onChange={(e) =>
                  set("globalMaxPerPage", Math.max(0, Number(e.target.value) || 0))
                }
              />
              <p className="text-xs text-muted-foreground">0 = no global cap.</p>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Badge variant={values.enabled ? "default" : "secondary"}>
                  {values.enabled ? "Active" : "Disabled"}
                </Badge>
                <Badge variant="outline">{enabledCount} surfaces on</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-surface placement editor */}
      <Tabs defaultValue={SURFACES[0]} className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          {SURFACES.map((s) => (
            <TabsTrigger key={s} value={s} className="text-xs">
              {SURFACE_META[s].label}
              {values.placements[s].enabled ? (
                <Eye className="ml-1.5 h-3 w-3 text-primary" />
              ) : (
                <EyeOff className="ml-1.5 h-3 w-3 opacity-50" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {SURFACES.map((surface) => {
          const meta = SURFACE_META[surface];
          const p = values.placements[surface];
          return (
            <TabsContent key={surface} value={surface} className="mt-4">
              <Card>
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-base font-semibold">{meta.label} ads</p>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                    </div>
                    <AdminToggle
                      checked={p.enabled}
                      onCheckedChange={(v) => updatePlacement(surface, { enabled: v })}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5">
                        <Monitor className="h-3.5 w-3.5" />
                        <Smartphone className="h-3.5 w-3.5" />
                        Device
                      </Label>
                      <Select
                        value={p.device}
                        onValueChange={(v) =>
                          updatePlacement(surface, { device: v as DeviceTarget })
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Desktop &amp; mobile</SelectItem>
                          <SelectItem value="desktop">Desktop only</SelectItem>
                          <SelectItem value="mobile">Mobile only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="flex items-center gap-1.5">
                        <Globe2 className="h-3.5 w-3.5" /> Audience
                      </Label>
                      <Select
                        value={p.audience}
                        onValueChange={(v) =>
                          updatePlacement(surface, { audience: v as AudienceTarget })
                        }
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Everyone</SelectItem>
                          <SelectItem value="guests">Guests only</SelectItem>
                          <SelectItem value="registered">Registered users only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor={`max-${surface}`}>Max ads per page</Label>
                      <Input
                        id={`max-${surface}`}
                        type="number"
                        min={0}
                        max={20}
                        value={p.maxPerPage}
                        onChange={(e) =>
                          updatePlacement(surface, {
                            maxPerPage: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                      />
                    </div>

                    {meta.supportsEveryN && (
                      <div className="space-y-1.5">
                        <Label htmlFor={`every-${surface}`}>Insert ad every N items</Label>
                        <Input
                          id={`every-${surface}`}
                          type="number"
                          min={0}
                          max={50}
                          value={p.everyNItems}
                          onChange={(e) =>
                            updatePlacement(surface, {
                              everyNItems: Math.max(0, Number(e.target.value) || 0),
                            })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          0 = disabled. Common: every 5 feed posts.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Allowed formats</Label>
                    <div className="flex flex-wrap gap-2">
                      {FORMATS.map((f) => {
                        const active = p.formats.includes(f);
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => toggleFormat(surface, f)}
                            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                              active
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"
                            }`}
                            title={FORMAT_META[f].description}
                          >
                            {FORMAT_META[f].label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`html-${surface}`}>Custom HTML / Banner</Label>
                      <Textarea
                        id={`html-${surface}`}
                        rows={4}
                        placeholder={`<div>Custom banner for ${meta.label.toLowerCase()}…</div>`}
                        value={p.customHtml ?? ""}
                        onChange={(e) =>
                          updatePlacement(surface, { customHtml: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`sponsor-${surface}`}>Sponsor / Affiliate block</Label>
                      <Textarea
                        id={`sponsor-${surface}`}
                        rows={4}
                        placeholder="<a href='https://partner.example/?ref=…'>Sponsored by…</a>"
                        value={p.sponsorHtml ?? ""}
                        onChange={(e) =>
                          updatePlacement(surface, { sponsorHtml: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    AdSense slot IDs and the global script loader are managed in{" "}
                    <strong>Settings → Ads &amp; Scripts</strong>. This page only controls{" "}
                    <em>where</em> placements appear.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
