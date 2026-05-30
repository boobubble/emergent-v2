import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleRow } from "@/components/admin/SettingsSection";
import { getAllSettings, updateSetting } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Megaphone, Code2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/ads-scripts")({ component: AdsScriptsPage });

interface AdSlotConfig {
  enabled: boolean;
  slot_id: string;       // AdSense data-ad-slot
  format: string;        // auto, fluid, rectangle, etc.
  full_width_responsive: boolean;
}
interface AdsConfig {
  enabled: boolean;
  provider: "adsense" | "custom";
  publisher_id: string;          // e.g. ca-pub-XXXXXXXXXXXXXXXX
  auto_ads: boolean;
  slots: Record<"header" | "sidebar" | "in_feed" | "footer", AdSlotConfig>;
  custom_html_header: string;    // free-form HTML for header slot when provider=custom
  custom_html_sidebar: string;
  custom_html_in_feed: string;
  custom_html_footer: string;
}
interface ScriptsConfig {
  header_script: string;
  footer_script: string;
  enabled: boolean;
}

const SLOT_DEFAULT: AdSlotConfig = { enabled: false, slot_id: "", format: "auto", full_width_responsive: true };
const ADS_DEFAULT: AdsConfig = {
  enabled: false,
  provider: "adsense",
  publisher_id: "",
  auto_ads: false,
  slots: { header: { ...SLOT_DEFAULT }, sidebar: { ...SLOT_DEFAULT }, in_feed: { ...SLOT_DEFAULT }, footer: { ...SLOT_DEFAULT } },
  custom_html_header: "", custom_html_sidebar: "", custom_html_in_feed: "", custom_html_footer: "",
};
const SCRIPTS_DEFAULT: ScriptsConfig = { header_script: "", footer_script: "", enabled: true };

function AdsScriptsPage() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => fetchSettings({}) });

  const [ads, setAds] = useState<AdsConfig>(ADS_DEFAULT);
  const [scripts, setScripts] = useState<ScriptsConfig>(SCRIPTS_DEFAULT);

  useEffect(() => {
    if (!data) return;
    const a = (data.ads as Partial<AdsConfig>) || {};
    setAds({ ...ADS_DEFAULT, ...a, slots: { ...ADS_DEFAULT.slots, ...(a.slots || {}) } });
    setScripts({ ...SCRIPTS_DEFAULT, ...((data.scripts as Partial<ScriptsConfig>) || {}) });
  }, [data]);

  const saveAds = useMutation({
    mutationFn: () => saveSetting({ data: { key: "ads", value: ads } }),
    onSuccess: () => { toast.success("Ads saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const saveScripts = useMutation({
    mutationFn: () => saveSetting({ data: { key: "scripts", value: scripts } }),
    onSuccess: () => { toast.success("Scripts saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const updateSlot = (key: keyof AdsConfig["slots"], patch: Partial<AdSlotConfig>) =>
    setAds((s) => ({ ...s, slots: { ...s.slots, [key]: { ...s.slots[key], ...patch } } }));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Ads & Scripts"
        description="Google AdSense placements, custom ad HTML, and global header / footer script injection."
      />

      <Tabs defaultValue="ads" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ads"><Megaphone className="mr-1.5 h-3.5 w-3.5" />Ads</TabsTrigger>
          <TabsTrigger value="scripts"><Code2 className="mr-1.5 h-3.5 w-3.5" />Header / Footer Scripts</TabsTrigger>
        </TabsList>

        {/* ───────── Ads ───────── */}
        <TabsContent value="ads" className="space-y-4">
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Advertising</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">Master switch for all ad placements site-wide.</p>
                </div>
                <Button onClick={() => saveAds.mutate()} disabled={saveAds.isPending}>
                  {saveAds.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>

              <ToggleRow label="Ads enabled" desc="Turn off to hide all ad slots instantly." value={ads.enabled} onChange={(v) => setAds({ ...ads, enabled: v })} />

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Provider</Label>
                  <select
                    className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={ads.provider}
                    onChange={(e) => setAds({ ...ads, provider: e.target.value as AdsConfig["provider"] })}
                  >
                    <option value="adsense">Google AdSense</option>
                    <option value="custom">Custom HTML / other network</option>
                  </select>
                </div>
                <div>
                  <Label className="text-xs">AdSense Publisher ID</Label>
                  <Input
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    value={ads.publisher_id}
                    onChange={(e) => setAds({ ...ads, publisher_id: e.target.value })}
                    disabled={ads.provider !== "adsense"}
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">Find it in AdSense → Account → Account information.</p>
                </div>
              </div>

              {ads.provider === "adsense" && (
                <ToggleRow
                  label="Enable Auto Ads"
                  desc="Let Google AdSense auto-place ads anywhere on the page. Slots below are ignored when on."
                  value={ads.auto_ads}
                  onChange={(v) => setAds({ ...ads, auto_ads: v })}
                />
              )}
            </CardContent>
          </Card>

          {(["header", "sidebar", "in_feed", "footer"] as const).map((key) => {
            const slot = ads.slots[key];
            const labels: Record<typeof key, string> = { header: "Header (top of every page)", sidebar: "Sidebar", in_feed: "In-feed (between posts)", footer: "Footer (bottom of every page)" };
            return (
              <Card key={key}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{labels[key]}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">Slot key: <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">{key}</code></p>
                    </div>
                    <ToggleRow label="" value={slot.enabled} onChange={(v) => updateSlot(key, { enabled: v })} />
                  </div>

                  {ads.provider === "adsense" ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">Ad Slot ID</Label>
                        <Input placeholder="1234567890" value={slot.slot_id} onChange={(e) => updateSlot(key, { slot_id: e.target.value })} />
                      </div>
                      <div>
                        <Label className="text-xs">Format</Label>
                        <select
                          className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                          value={slot.format}
                          onChange={(e) => updateSlot(key, { format: e.target.value })}
                        >
                          <option value="auto">Auto (responsive)</option>
                          <option value="fluid">Fluid</option>
                          <option value="rectangle">Rectangle</option>
                          <option value="horizontal">Horizontal</option>
                          <option value="vertical">Vertical</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <ToggleRow
                          label="Full-width responsive"
                          value={slot.full_width_responsive}
                          onChange={(v) => updateSlot(key, { full_width_responsive: v })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-xs">Custom HTML</Label>
                      <Textarea
                        rows={4}
                        className="font-mono text-xs"
                        placeholder={`<!-- Paste banner / network HTML for ${key} slot -->`}
                        value={(ads as any)[`custom_html_${key}`]}
                        onChange={(e) => setAds({ ...ads, [`custom_html_${key}`]: e.target.value } as AdsConfig)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                Ad slots only render where <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">&lt;AdSlot slot="…"/&gt;</code> is mounted in the app. Add them in the feed, sidebars, or headers as needed.
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ───────── Scripts ───────── */}
        <TabsContent value="scripts" className="space-y-4">
          <Card>
            <CardContent className="space-y-5 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Custom Scripts</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Inject analytics, pixels, or any third-party widget. Header scripts load early; footer scripts load after the page.
                  </p>
                </div>
                <Button onClick={() => saveScripts.mutate()} disabled={saveScripts.isPending}>
                  {saveScripts.isPending ? "Saving…" : "Save changes"}
                </Button>
              </div>

              <ToggleRow
                label="Scripts enabled"
                desc="Turn off to immediately stop injecting custom scripts site-wide."
                value={scripts.enabled}
                onChange={(v) => setScripts({ ...scripts, enabled: v })}
              />

              <div>
                <Label className="text-xs">Header script (injected into <code>&lt;head&gt;</code>)</Label>
                <Textarea
                  rows={8}
                  className="mt-1.5 font-mono text-xs"
                  placeholder={`<!-- e.g. Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config','G-XXXX');</script>`}
                  value={scripts.header_script}
                  onChange={(e) => setScripts({ ...scripts, header_script: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-xs">Footer script (injected before <code>&lt;/body&gt;</code>)</Label>
                <Textarea
                  rows={8}
                  className="mt-1.5 font-mono text-xs"
                  placeholder={`<!-- e.g. chat widget, Meta pixel <noscript> fallback -->`}
                  value={scripts.footer_script}
                  onChange={(e) => setScripts({ ...scripts, footer_script: e.target.value })}
                />
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    Only paste scripts you trust. Anything saved here runs in every visitor's browser with full access to your site.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
