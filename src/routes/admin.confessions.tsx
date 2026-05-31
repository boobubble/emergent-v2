import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Save, MessageSquareHeart, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminSetting } from "@/lib/use-admin-setting";
import {
  CONFESSIONS_DEFAULTS,
  REACTION_META,
  type ConfessionsConfig,
  type ConfessionDisplayMode,
  type ConfessionKind,
  type ConfessionReactionType,
} from "@/lib/confessions-config";
import { getConfessionStats } from "@/lib/confessions.functions";

export const Route = createFileRoute("/admin/confessions")({ component: AdminConfessionsPage });

const MODE_LABEL: Record<ConfessionDisplayMode, string> = {
  fully_anonymous: "Fully Anonymous (Anonymous User)",
  random_id: "Random Identity (Confessor #145)",
  random_avatar: "Random Avatar Identity (🐼 Panda #23)",
  username: "Registered Username",
};

const KIND_LABEL: Record<ConfessionKind, string> = {
  text: "Text", poll: "Poll", image: "Image", question: "Question", advice: "Advice",
};

function AdminConfessionsPage() {
  const { values, set, patch, save, saving } =
    useAdminSetting<ConfessionsConfig>("confessions", CONFESSIONS_DEFAULTS);

  const statsFn = useServerFn(getConfessionStats);
  const { data: stats } = useQuery({ queryKey: ["confession-stats"], queryFn: () => statsFn({}) });

  const setMode = (m: ConfessionDisplayMode, v: boolean) =>
    patch({ anonymousModes: { ...values.anonymousModes, [m]: v } });
  const setKind = (k: ConfessionKind, v: boolean) =>
    patch({ kinds: { ...values.kinds, [k]: v } });
  const setReaction = (r: ConfessionReactionType, v: boolean) =>
    patch({ reactions: { ...values.reactions, [r]: v } });
  const setCoins = (k: keyof ConfessionsConfig["coins"], v: any) =>
    patch({ coins: { ...values.coins, [k]: v } });
  const setLevel = (k: keyof ConfessionsConfig["level"], v: any) =>
    patch({ level: { ...values.level, [k]: v } });
  const setMod = (k: keyof ConfessionsConfig["moderation"], v: boolean) =>
    patch({ moderation: { ...values.moderation, [k]: v } });
  const setLb = (k: keyof ConfessionsConfig["leaderboards"], v: boolean) =>
    patch({ leaderboards: { ...values.leaderboards, [k]: v } });
  const setSeo = (k: keyof ConfessionsConfig["seo"], v: any) =>
    patch({ seo: { ...values.seo, [k]: v } });
  const setExpiry = (k: keyof ConfessionsConfig["expiry"], v: any) =>
    patch({ expiry: { ...values.expiry, [k]: v } });

  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("✨");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Confessions"
        description="Standalone anonymous-confession community. Configure identity modes, categories, moderation and rewards."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      {/* Module master switch */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <Row icon={<MessageSquareHeart className="h-5 w-5 text-primary" />}
               title="Enable Confessions module"
               desc="Master switch. When off, the /confessions page returns a disabled notice.">
            <AdminToggle checked={values.enabled} onCheckedChange={(v) => set("enabled", v)} />
          </Row>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Route slug</Label>
              <Select value={values.routeSlug} onValueChange={(v) => set("routeSlug", v as any)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confessions">/confessions</SelectItem>
                  <SelectItem value="confess">/confess</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-[10px] text-muted-foreground">UI uses /confessions; label is for display references.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {stats && (
        <div className="grid gap-3 sm:grid-cols-4">
          <Stat label="Total" value={stats.total} />
          <Stat label="Today" value={stats.today} />
          <Stat label="Top category" value={stats.byCategory[0]?.category ?? "—"} />
          <Stat label="Most liked" value={stats.topConfessions[0]?.like_count ?? 0} />
        </div>
      )}

      {/* Anonymous modes */}
      <Section title="Anonymous Modes" desc="Identity options available when posting.">
        <div className="divide-y divide-border rounded-lg border border-border">
          {(Object.keys(MODE_LABEL) as ConfessionDisplayMode[]).map((m) => (
            <Row key={m} title={MODE_LABEL[m]} compact>
              <AdminToggle size="sm" checked={values.anonymousModes[m]} onCheckedChange={(v) => setMode(m, v)} />
            </Row>
          ))}
        </div>
      </Section>

      {/* Kinds */}
      <Section title="Confession Types">
        <div className="divide-y divide-border rounded-lg border border-border">
          {(Object.keys(KIND_LABEL) as ConfessionKind[]).map((k) => (
            <Row key={k} title={KIND_LABEL[k]} compact>
              <AdminToggle size="sm" checked={values.kinds[k]} onCheckedChange={(v) => setKind(k, v)} />
            </Row>
          ))}
        </div>
      </Section>

      {/* Categories */}
      <Section title="Categories" desc="Used for filtering and the composer.">
        <div className="space-y-2">
          {values.categories.map((c, i) => (
            <div key={c.key} className="flex items-center gap-2 rounded-lg border border-border p-2">
              <Input className="w-20 text-center" value={c.emoji ?? ""}
                onChange={(e) => patch({ categories: values.categories.map((x, idx) => idx === i ? { ...x, emoji: e.target.value } : x) })} />
              <Input className="flex-1" value={c.label}
                onChange={(e) => patch({ categories: values.categories.map((x, idx) => idx === i ? { ...x, label: e.target.value, key: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_") } : x) })} />
              <Button variant="ghost" size="icon" onClick={() => patch({ categories: values.categories.filter((_, idx) => idx !== i) })}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-2">
            <Input className="w-20 text-center" value={newCatEmoji} onChange={(e) => setNewCatEmoji(e.target.value)} />
            <Input className="flex-1" placeholder="New category…" value={newCatLabel} onChange={(e) => setNewCatLabel(e.target.value)} />
            <Button size="sm" className="gap-1" disabled={!newCatLabel.trim()}
              onClick={() => {
                patch({
                  categories: [...values.categories, {
                    emoji: newCatEmoji, label: newCatLabel.trim(),
                    key: newCatLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_"),
                  }],
                });
                setNewCatLabel("");
              }}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
      </Section>

      {/* Reactions */}
      <Section title="Reactions">
        <div className="divide-y divide-border rounded-lg border border-border">
          {(Object.keys(REACTION_META) as ConfessionReactionType[]).map((r) => (
            <Row key={r} title={`${REACTION_META[r].emoji} ${REACTION_META[r].label}`} compact>
              <AdminToggle size="sm" checked={values.reactions[r]} onCheckedChange={(v) => setReaction(r, v)} />
            </Row>
          ))}
        </div>
      </Section>

      {/* Engagement */}
      <Section title="Engagement">
        <div className="divide-y divide-border rounded-lg border border-border">
          <Row title="Allow Replies" compact><AdminToggle size="sm" checked={values.allowReplies} onCheckedChange={(v) => set("allowReplies", v)} /></Row>
          <Row title="Allow Anonymous Replies" compact><AdminToggle size="sm" checked={values.allowAnonymousReplies} onCheckedChange={(v) => set("allowAnonymousReplies", v)} /></Row>
          <Row title="Allow Reports" compact><AdminToggle size="sm" checked={values.allowReports} onCheckedChange={(v) => set("allowReports", v)} /></Row>
        </div>
      </Section>

      {/* Coins */}
      <Section title="Coin Integration" desc="Costs use the existing economy/coin wallet.">
        <Row title="Enable coin costs" compact><AdminToggle size="sm" checked={values.coins.enabled} onCheckedChange={(v) => setCoins("enabled", v)} /></Row>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="Post cost" value={values.coins.postCost} onChange={(v) => setCoins("postCost", v)} disabled={!values.coins.enabled} />
          <NumberField label="Pin cost" value={values.coins.pinCost} onChange={(v) => setCoins("pinCost", v)} disabled={!values.coins.enabled} />
          <NumberField label="Highlight cost" value={values.coins.highlightCost} onChange={(v) => setCoins("highlightCost", v)} disabled={!values.coins.enabled} />
        </div>
      </Section>

      {/* Level */}
      <Section title="Level / XP Integration" desc="Reuses existing user levels.">
        <Row title="Enable level requirements" compact><AdminToggle size="sm" checked={values.level.enabled} onCheckedChange={(v) => setLevel("enabled", v)} /></Row>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="Min level to post" value={values.level.minLevelToPost} onChange={(v) => setLevel("minLevelToPost", v)} disabled={!values.level.enabled} />
          <NumberField label="Min level for anon reply" value={values.level.minLevelForAnonReply} onChange={(v) => setLevel("minLevelForAnonReply", v)} disabled={!values.level.enabled} />
          <NumberField label="Min level for images" value={values.level.minLevelForImages} onChange={(v) => setLevel("minLevelForImages", v)} disabled={!values.level.enabled} />
        </div>
      </Section>

      {/* Moderation */}
      <Section title="Moderation">
        <div className="divide-y divide-border rounded-lg border border-border">
          <Row title="Approval required" desc="Confessions go to a queue until approved." compact>
            <AdminToggle size="sm" checked={values.moderation.approvalRequired} onCheckedChange={(v) => setMod("approvalRequired", v)} />
          </Row>
          <Row title="Auto moderation" compact><AdminToggle size="sm" checked={values.moderation.autoModeration} onCheckedChange={(v) => setMod("autoModeration", v)} /></Row>
          <Row title="Bad word filter" compact><AdminToggle size="sm" checked={values.moderation.badWordFilter} onCheckedChange={(v) => setMod("badWordFilter", v)} /></Row>
          <Row title="Link filter" compact><AdminToggle size="sm" checked={values.moderation.linkFilter} onCheckedChange={(v) => setMod("linkFilter", v)} /></Row>
          <Row title="Spam detection" compact><AdminToggle size="sm" checked={values.moderation.spamDetection} onCheckedChange={(v) => setMod("spamDetection", v)} /></Row>
        </div>
      </Section>

      {/* Expiry */}
      <Section title="Expiry">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label className="text-xs">Default expiry</Label>
            <Select value={values.expiry.defaultMode} onValueChange={(v) => setExpiry("defaultMode", v)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="24h">24 hours</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Row title="User-selectable per post" compact>
            <AdminToggle size="sm" checked={values.expiry.userSelectable} onCheckedChange={(v) => setExpiry("userSelectable", v)} />
          </Row>
        </div>
      </Section>

      {/* Leaderboards */}
      <Section title="Leaderboards">
        <div className="divide-y divide-border rounded-lg border border-border">
          <Row title="Trending" compact><AdminToggle size="sm" checked={values.leaderboards.trending} onCheckedChange={(v) => setLb("trending", v)} /></Row>
          <Row title="Most replied" compact><AdminToggle size="sm" checked={values.leaderboards.mostReplied} onCheckedChange={(v) => setLb("mostReplied", v)} /></Row>
          <Row title="Most liked" compact><AdminToggle size="sm" checked={values.leaderboards.mostLiked} onCheckedChange={(v) => setLb("mostLiked", v)} /></Row>
          <Row title="Confession of the day" compact><AdminToggle size="sm" checked={values.leaderboards.dailyPick} onCheckedChange={(v) => setLb("dailyPick", v)} /></Row>
          <Row title="Confession of the week" compact><AdminToggle size="sm" checked={values.leaderboards.weeklyPick} onCheckedChange={(v) => setLb("weeklyPick", v)} /></Row>
        </div>
      </Section>

      {/* SEO */}
      <Section title="SEO" desc="Metadata for the /confessions page.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label className="text-xs">Meta title</Label><Input value={values.seo.metaTitle} onChange={(e) => setSeo("metaTitle", e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">Keywords</Label><Input value={values.seo.keywords} onChange={(e) => setSeo("keywords", e.target.value)} className="mt-1" /></div>
          <div className="sm:col-span-2"><Label className="text-xs">Meta description</Label><Textarea rows={2} value={values.seo.metaDescription} onChange={(e) => setSeo("metaDescription", e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">OG title</Label><Input value={values.seo.ogTitle} onChange={(e) => setSeo("ogTitle", e.target.value)} className="mt-1" /></div>
          <div><Label className="text-xs">OG image URL</Label><Input value={values.seo.ogImage} onChange={(e) => setSeo("ogImage", e.target.value)} className="mt-1" /></div>
          <div className="sm:col-span-2"><Label className="text-xs">OG description</Label><Textarea rows={2} value={values.seo.ogDescription} onChange={(e) => setSeo("ogDescription", e.target.value)} className="mt-1" /></div>
          <Row title="No-index page" compact><AdminToggle size="sm" checked={values.seo.noindex} onCheckedChange={(v) => setSeo("noindex", v)} /></Row>
        </div>
      </Section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Row({ icon, title, desc, compact, children }: { icon?: React.ReactNode; title: string; desc?: string; compact?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-3 ${compact ? "px-3 py-2.5" : ""}`}>
      {icon}
      <div className="min-w-0 flex-1">
        <p className={compact ? "text-sm font-medium" : "text-sm font-semibold"}>{title}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function NumberField({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type="number" min={0} value={value} disabled={disabled}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))} className="mt-1" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
