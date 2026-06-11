import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BadgeCheck, Sparkles } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminToggle } from "@/components/admin/AdminToggle";
import {
  getBoobubbleSettings,
  saveBoobubbleSettings,
  provisionBoobubbleAssistant,
  type BoobubbleSettings,
} from "@/lib/boobubble.functions";

const DEFAULTS: BoobubbleSettings = {
  enabled: true,
  welcome_enabled: true,
  feed_recs_enabled: true,
  ai_personalize_welcome: true,
  mission_daily_dm_enabled: true,
  mission_weekly_dm_enabled: true,
  mission_min_completion_pct: 60,
  mission_weekly_day: 1,
  bot_user_id: null,
  bot_username: "BooBubble",
  bot_avatar_url: null,
  bot_bio: "Official BooBubble Assistant — here to help you discover content, complete missions and earn rewards. 💬✨",
};

function AdminBoobubblePage() {
  const fetchSettings = useServerFn(getBoobubbleSettings);
  const saveFn = useServerFn(saveBoobubbleSettings);
  const provisionFn = useServerFn(provisionBoobubbleAssistant);
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["boobubble-settings"], queryFn: () => fetchSettings({}) });
  const [v, setV] = useState<BoobubbleSettings>(DEFAULTS);
  useEffect(() => { if (data) setV({ ...DEFAULTS, ...data }); }, [data]);

  const save = useMutation({
    mutationFn: () => saveFn({
      data: {
        enabled: v.enabled,
        welcome_enabled: v.welcome_enabled,
        feed_recs_enabled: v.feed_recs_enabled,
        ai_personalize_welcome: v.ai_personalize_welcome,
        mission_daily_dm_enabled: v.mission_daily_dm_enabled,
        mission_weekly_dm_enabled: v.mission_weekly_dm_enabled,
        mission_min_completion_pct: v.mission_min_completion_pct,
        mission_weekly_day: v.mission_weekly_day,
        bot_username: v.bot_username,
        bot_avatar_url: v.bot_avatar_url,
        bot_bio: v.bot_bio,
      },
    }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["boobubble-settings"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const provision = useMutation({
    mutationFn: () => provisionFn({}),
    onSuccess: (r) => {
      toast.success(r.existed ? "Assistant already exists" : "BooBubble Assistant created");
      qc.invalidateQueries({ queryKey: ["boobubble-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const set = <K extends keyof BoobubbleSettings>(k: K, val: BoobubbleSettings[K]) =>
    setV((s) => ({ ...s, [k]: val }));

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="BooBubble Assistant"
        description="The single official AI-powered system account. One account, multiple helpful roles — no fake users, no fake engagement."
      />

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">System account</h3>
          <BadgeCheck className="h-4 w-4 text-sky-400" />
        </div>
        {v.bot_user_id ? (
          <p className="text-xs text-muted-foreground">
            Assistant user is provisioned. ID: <code className="font-mono text-[10px]">{v.bot_user_id}</code>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No assistant account yet. Provision one to enable welcome DMs and feed recommendations.</p>
        )}
        <button
          type="button"
          onClick={() => provision.mutate()}
          disabled={provision.isPending}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {provision.isPending ? "Provisioning…" : v.bot_user_id ? "Re-sync profile" : "Create BooBubble Assistant"}
        </button>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Features</h3>
        <Row label="Enable Assistant (master switch)" checked={v.enabled} onChange={(b) => set("enabled", b)} />
        <Row label="Send welcome DM to new members" checked={v.welcome_enabled} onChange={(b) => set("welcome_enabled", b)} />
        <Row label="Show feed recommendations widget" checked={v.feed_recs_enabled} onChange={(b) => set("feed_recs_enabled", b)} />
        <Row label="Personalize welcome with AI (Lovable AI Gateway)" checked={v.ai_personalize_welcome} onChange={(b) => set("ai_personalize_welcome", b)} />
        <p className="text-[11px] text-muted-foreground">When AI personalization fails, a static welcome template is used as fallback.</p>
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">Identity</h3>
        <label className="block text-xs">
          <span className="mb-1 block text-muted-foreground">Username</span>
          <input
            value={v.bot_username}
            onChange={(e) => set("bot_username", e.target.value)}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs">
          <span className="mb-1 block text-muted-foreground">Avatar URL</span>
          <input
            value={v.bot_avatar_url ?? ""}
            onChange={(e) => set("bot_avatar_url", e.target.value.trim() || null)}
            placeholder="https://…"
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs">
          <span className="mb-1 block text-muted-foreground">Bio</span>
          <textarea
            value={v.bot_bio}
            onChange={(e) => set("bot_bio", e.target.value)}
            rows={3}
            maxLength={280}
            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, checked, onChange }: { label: string; checked: boolean; onChange: (b: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-sm">
      <span>{label}</span>
      <AdminToggle checked={checked} onCheckedChange={onChange} ariaLabel={label} />
    </div>
  );
}

export const Route = createFileRoute("/admin/boobubble")({
  component: AdminBoobubblePage,
});
