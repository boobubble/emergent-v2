import { createFileRoute } from "@tanstack/react-router";
import { Save, Home, Plus, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SeoManagerLink } from "@/components/admin/seo/SeoPreviewPanels";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSetting } from "@/lib/use-admin-setting";
import {
  LANDING_DEFAULTS,
  LANDING_SETTINGS_KEY,
  type LandingConfig,
  type LandingFeatureCard,
} from "@/lib/landing-config";

export const Route = createFileRoute("/admin/homepage")({
  component: HomepagePage,
});

function Row({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <AdminToggle checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function HomepagePage() {
  const { values, set, patch, save, saving } = useAdminSetting<LandingConfig>(
    LANDING_SETTINGS_KEY,
    LANDING_DEFAULTS,
  );

  const updateFeature = (i: number, key: keyof LandingFeatureCard, value: string) => {
    const next = [...values.featureCards];
    next[i] = { ...next[i], [key]: value };
    patch({ featureCards: next });
  };
  const removeFeature = (i: number) => patch({ featureCards: values.featureCards.filter((_, idx) => idx !== i) });
  const addFeature = () => patch({ featureCards: [...values.featureCards, { emoji: "✨", title: "New feature", description: "Describe it." }] });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Homepage Manager"
        description="Edit content shown on the public homepage at /. Live community stats are pulled automatically."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Home className="h-5 w-5 text-primary" />
            <div>
              <div className="text-sm font-semibold">Landing page</div>
              <div className="text-xs text-muted-foreground">Public page available at <code>/</code>.</div>
            </div>
          </div>
          <Row label="Enable landing page" description="Master toggle for the public homepage." checked={values.enabled} onChange={(v) => set("enabled", v)} />
          <Row
            label="Homepage data mode"
            description="OFF = REAL production data from Yaarzo. ON = DEMO PREVIEW using the curated sample content below. Live mode never falls back to demo names or posts."
            checked={values.useDemoData}
            onChange={(v) => set("useDemoData", v)}
          />
          <p className="text-xs text-muted-foreground">
            {values.useDemoData ? "Current: DEMO PREVIEW" : "Current: REAL"}
          </p>
        </CardContent>
      </Card>

      {!values.useDemoData && (
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="text-sm font-semibold">Live section sources</div>
          <p className="text-xs text-muted-foreground">When REAL mode is on, each toggle pulls that section from Yaarzo. Off hides the section’s cards (empty state) instead of showing demo content.</p>
          <Row label="Trending Posts — Live" checked={values.trendingPostsUseLive} onChange={(v) => set("trendingPostsUseLive", v)} />
          <Row label="Discussions — Live" checked={values.discussionsUseLive} onChange={(v) => set("discussionsUseLive", v)} />
          <Row label="Featured Members — Live" checked={values.featuredMembersUseLive} onChange={(v) => set("featuredMembersUseLive", v)} />
          <Row label="Recent Confessions — Live" checked={values.recentConfessionsUseLive} onChange={(v) => set("recentConfessionsUseLive", v)} />
          <Row label="Blog — Live" checked={values.blogPostsUseLive} onChange={(v) => set("blogPostsUseLive", v)} />
          <Row label="Recent Activity — Live" checked={values.activitiesUseLive} onChange={(v) => set("activitiesUseLive", v)} />
        </CardContent>
      </Card>
      )}

      {/* Demo stats */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="text-sm font-semibold">Demo stat values</div>
          <p className="text-xs text-muted-foreground">Shown on the stat strip in DEMO PREVIEW only. REAL mode uses verified member, online, room, and public post counts. Messages-sent and games-played are hidden in REAL mode because Yaarzo has no verified live counter for them.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Members">
              <Input type="number" min={0} value={values.demoStats.members}
                     onChange={(e) => patch({ demoStats: { ...values.demoStats, members: Math.max(0, Number(e.target.value) || 0) } })} />
            </Field>
            <Field label="Online now">
              <Input type="number" min={0} value={values.demoStats.online}
                     onChange={(e) => patch({ demoStats: { ...values.demoStats, online: Math.max(0, Number(e.target.value) || 0) } })} />
            </Field>
            <Field label="Active chatrooms">
              <Input type="number" min={0} value={values.demoStats.activeRooms}
                     onChange={(e) => patch({ demoStats: { ...values.demoStats, activeRooms: Math.max(0, Number(e.target.value) || 0) } })} />
            </Field>
            <Field label="Messages sent">
              <Input type="number" min={0} value={values.demoStats.messagesSent}
                     onChange={(e) => patch({ demoStats: { ...values.demoStats, messagesSent: Math.max(0, Number(e.target.value) || 0) } })} />
            </Field>
            <Field label="Feed posts">
              <Input type="number" min={0} value={values.demoStats.feedPosts}
                     onChange={(e) => patch({ demoStats: { ...values.demoStats, feedPosts: Math.max(0, Number(e.target.value) || 0) } })} />
            </Field>
            <Field label="Games played">
              <Input type="number" min={0} value={values.demoStats.gamesPlayed}
                     onChange={(e) => patch({ demoStats: { ...values.demoStats, gamesPlayed: Math.max(0, Number(e.target.value) || 0) } })} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Hero */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="text-sm font-semibold">Hero section</div>
          <Field label="Eyebrow">
            <Input value={values.heroEyebrow} maxLength={60} onChange={(e) => set("heroEyebrow", e.target.value)} />
          </Field>
          <Field label="Headline">
            <Input value={values.heroTitle} maxLength={120} onChange={(e) => set("heroTitle", e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <Textarea value={values.heroSubtitle} maxLength={240} onChange={(e) => set("heroSubtitle", e.target.value)} rows={2} />
          </Field>
          <Field label="Feature badges (one per line)">
            <Textarea
              value={values.heroBadges.join("\n")}
              maxLength={400}
              rows={4}
              onChange={(e) => set("heroBadges", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 8))}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Primary CTA label"><Input value={values.primaryCtaLabel} maxLength={40} onChange={(e) => set("primaryCtaLabel", e.target.value)} /></Field>
            <Field label="Primary CTA link"><Input value={values.primaryCtaHref} maxLength={120} onChange={(e) => set("primaryCtaHref", e.target.value)} /></Field>
            <Field label="Secondary CTA label"><Input value={values.secondaryCtaLabel} maxLength={40} onChange={(e) => set("secondaryCtaLabel", e.target.value)} /></Field>
            <Field label="Secondary CTA link"><Input value={values.secondaryCtaHref} maxLength={120} onChange={(e) => set("secondaryCtaHref", e.target.value)} /></Field>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="text-sm font-semibold">Community stats</div>
          <Row label="Show stats strip" checked={values.showStats} onChange={(v) => set("showStats", v)} />
          <Row label="Show messages-sent counter" checked={values.showMessageCount} onChange={(v) => set("showMessageCount", v)} />
          <Row label="Show games-played counter" checked={values.showGameCount} onChange={(v) => set("showGameCount", v)} />
          <Row label="Show growth indicator" checked={values.showGrowth} onChange={(v) => set("showGrowth", v)} />
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Messages sent (display)">
              <Input type="number" min={0} value={values.fallbackMessagesSent} onChange={(e) => set("fallbackMessagesSent", Math.max(0, Number(e.target.value) || 0))} />
            </Field>
            <Field label="Games played (display)">
              <Input type="number" min={0} value={values.fallbackGamesPlayed} onChange={(e) => set("fallbackGamesPlayed", Math.max(0, Number(e.target.value) || 0))} />
            </Field>
            <Field label="Growth label">
              <Input value={values.growthLabel} maxLength={40} onChange={(e) => set("growthLabel", e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Feature cards */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Feature cards</div>
            <Button size="sm" variant="outline" onClick={addFeature} className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Add</Button>
          </div>
          <div className="space-y-3">
            {values.featureCards.map((f, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <div className="grid gap-2 sm:grid-cols-[80px_1fr_2fr_auto]">
                  <Input value={f.emoji} maxLength={4} onChange={(e) => updateFeature(i, "emoji", e.target.value)} placeholder="Emoji" />
                  <Input value={f.title} maxLength={40} onChange={(e) => updateFeature(i, "title", e.target.value)} placeholder="Title" />
                  <Input value={f.description} maxLength={160} onChange={(e) => updateFeature(i, "description", e.target.value)} placeholder="Description" />
                  <Button size="icon" variant="ghost" onClick={() => removeFeature(i)} aria-label="Remove"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
                <Input
                  value={f.href ?? ""}
                  maxLength={200}
                  onChange={(e) => updateFeature(i, "href", e.target.value)}
                  placeholder="Optional link (e.g. /feed, /games, https://…)"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referrals */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="text-sm font-semibold">Invite-friends section</div>
          <Field label="Headline"><Input value={values.referralHeadline} maxLength={80} onChange={(e) => set("referralHeadline", e.target.value)} /></Field>
          <Field label="Description"><Textarea value={values.referralDescription} maxLength={240} rows={2} onChange={(e) => set("referralDescription", e.target.value)} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Coin reward per referral"><Input type="number" min={0} value={values.referralCoinReward} onChange={(e) => set("referralCoinReward", Math.max(0, Number(e.target.value) || 0))} /></Field>
            <Field label="XP reward per referral"><Input type="number" min={0} value={values.referralXpReward} onChange={(e) => set("referralXpReward", Math.max(0, Number(e.target.value) || 0))} /></Field>
          </div>
        </CardContent>
      </Card>

      {/* Final CTA + footer */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="text-sm font-semibold">Final CTA & footer</div>
          <Field label="Final CTA title"><Input value={values.finalCtaTitle} maxLength={80} onChange={(e) => set("finalCtaTitle", e.target.value)} /></Field>
          <Field label="Final CTA subtitle"><Textarea value={values.finalCtaSubtitle} maxLength={240} rows={2} onChange={(e) => set("finalCtaSubtitle", e.target.value)} /></Field>
          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <Field label="Final CTA image URL (optional)">
              <Input
                value={values.finalCtaImageUrl}
                maxLength={500}
                placeholder="https://… (leave blank to hide)"
                onChange={(e) => set("finalCtaImageUrl", e.target.value)}
              />
            </Field>
            <Field label="Image alt text">
              <Input value={values.finalCtaImageAlt} maxLength={120} onChange={(e) => set("finalCtaImageAlt", e.target.value)} />
            </Field>
          </div>
          {values.finalCtaImageUrl && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-2 text-xs text-muted-foreground">Preview</p>
              <img src={values.finalCtaImageUrl} alt={values.finalCtaImageAlt || ""} className="h-32 w-32 rounded-xl object-cover" />
            </div>
          )}
          <Field label="Brand tagline"><Textarea value={values.brandTagline} maxLength={240} rows={2} onChange={(e) => set("brandTagline", e.target.value)} /></Field>
          <Field label="Copyright owner"><Input value={values.copyrightOwner} maxLength={60} onChange={(e) => set("copyrightOwner", e.target.value)} /></Field>
        </CardContent>
      </Card>

      {/* Landing content — SEO metadata for `/` lives in homeRouteHead; /heropage stays in SEO Manager */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="text-sm font-semibold">SEO</div>
          <p className="text-sm text-muted-foreground">
            Landing page titles, descriptions, and OG tags are managed centrally in SEO Manager.
            Structured data toggles remain below.
          </p>
          <SeoManagerLink category="homepage" />
          <Row label="Enable structured data (JSON-LD)" checked={values.enableStructuredData} onChange={(v) => set("enableStructuredData", v)} />
        </CardContent>
      </Card>
    </div>
  );
}
