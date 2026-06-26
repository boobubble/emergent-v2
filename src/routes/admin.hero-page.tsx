import { createFileRoute } from "@tanstack/react-router";
import { Save, Sparkles, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAdminSetting } from "@/lib/use-admin-setting";
import {
  HERO_DEFAULTS, HERO_SETTINGS_KEY, HOME_PAGE_KEY,
  type HeroConfig, type HeroShowcaseItem, type HomePageMode,
} from "@/lib/hero-page-config";

export const Route = createFileRoute("/admin/hero-page")({
  component: HeroPageAdmin,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ShowcaseEditor({
  title, items, onChange,
}: {
  title: string;
  items: HeroShowcaseItem[];
  onChange: (next: HeroShowcaseItem[]) => void;
}) {
  const update = (i: number, key: keyof HeroShowcaseItem, value: string) => {
    const next = [...items]; next[i] = { ...next[i], [key]: value }; onChange(next);
  };
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">{title}</div>
          <Button size="sm" variant="outline" onClick={() => onChange([...items, { emoji: "✨", title: "New", description: "Describe it." }])}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-[60px_1fr_2fr_auto]">
              <Input value={it.emoji} onChange={(e) => update(i, "emoji", e.target.value)} className="text-center" />
              <Input value={it.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="Title" />
              <Input value={it.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Description" />
              <Button size="icon" variant="ghost" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HomeSelector() {
  const { values, set, save, saving } = useAdminSetting<{ mode: HomePageMode }>(
    HOME_PAGE_KEY, { mode: "welcome" },
  );
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Active Landing Page</div>
            <div className="text-xs text-muted-foreground">
              Choose which page unauthenticated visitors see at <code>/</code>. Only one can be active at a time.
              Chatroom and Feed cannot be selected as homepage.
            </div>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
        <RadioGroup
          value={values.mode}
          onValueChange={(v) => set("mode", v as HomePageMode)}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${values.mode === "welcome" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="welcome" className="mt-1" />
            <div>
              <div className="text-sm font-semibold">Welcome Page</div>
              <div className="text-xs text-muted-foreground">Existing landing at <code>/welcome</code>.</div>
            </div>
          </label>
          <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${values.mode === "hero" ? "border-primary bg-primary/5" : ""}`}>
            <RadioGroupItem value="hero" className="mt-1" />
            <div>
              <div className="text-sm font-semibold">Hero Homepage ✨</div>
              <div className="text-xs text-muted-foreground">Premium community landing at <code>/heropage</code>.</div>
            </div>
          </label>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}

function HeroPageAdmin() {
  const { values, set, patch, save, saving } = useAdminSetting<HeroConfig>(
    HERO_SETTINGS_KEY, HERO_DEFAULTS,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Hero Homepage"
        description="Premium community landing page. Edit content, images, and pick which homepage is active."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <HomeSelector />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> Hero content
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Brand name">
              <Input value={values.brandName} onChange={(e) => set("brandName", e.target.value)} />
            </Field>
            <Field label="Headline">
              <Input value={values.headline} onChange={(e) => set("headline", e.target.value)} />
            </Field>
          </div>
          <Field label="Subheadline">
            <Textarea rows={3} value={values.subheadline} onChange={(e) => set("subheadline", e.target.value)} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Join CTA"><Input value={values.ctaJoinLabel} onChange={(e) => set("ctaJoinLabel", e.target.value)} /></Field>
            <Field label="Login CTA"><Input value={values.ctaLoginLabel} onChange={(e) => set("ctaLoginLabel", e.target.value)} /></Field>
            <Field label="Guest CTA"><Input value={values.ctaGuestLabel} onChange={(e) => set("ctaGuestLabel", e.target.value)} /></Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Final CTA title"><Input value={values.finalCtaTitle} onChange={(e) => set("finalCtaTitle", e.target.value)} /></Field>
            <Field label="Final CTA subtitle"><Input value={values.finalCtaSubtitle} onChange={(e) => set("finalCtaSubtitle", e.target.value)} /></Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ImageIcon className="h-4 w-4 text-primary" /> Images
          </div>
          <Field label="Hero image (friends chatting)">
            <Input value={values.heroImageUrl} onChange={(e) => set("heroImageUrl", e.target.value)} />
          </Field>
          <Field label="Chatroom image">
            <Input value={values.chatroomImageUrl} onChange={(e) => set("chatroomImageUrl", e.target.value)} />
          </Field>
          <Field label="Feed image">
            <Input value={values.feedImageUrl} onChange={(e) => set("feedImageUrl", e.target.value)} />
          </Field>
          <Field label="Radio image">
            <Input value={values.radioImageUrl} onChange={(e) => set("radioImageUrl", e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <ShowcaseEditor title="Chatroom features 💬" items={values.chatroomFeatures} onChange={(v) => patch({ chatroomFeatures: v })} />
      <ShowcaseEditor title="Feed features 📰" items={values.feedFeatures} onChange={(v) => patch({ feedFeatures: v })} />
      <ShowcaseEditor title="Radio features 🎙️" items={values.radioFeatures} onChange={(v) => patch({ radioFeatures: v })} />
      <ShowcaseEditor title="Game features 🎮" items={values.gameFeatures} onChange={(v) => patch({ gameFeatures: v })} />

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
