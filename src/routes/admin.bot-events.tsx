import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsCard, NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAdminSetting } from "@/lib/use-admin-setting";
import {
  BOT_EVENT_META,
  DEFAULT_BOT_EVENTS_CONFIG,
  computeEventState,
  type BotEventKind,
  type BotEventsConfig,
} from "@/lib/bot-events";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/bot-events")({ component: BotEventsPage });

const INTERVAL_PRESETS = [30, 45, 60, 120];
const DURATION_PRESETS = [5, 10, 15];
const KINDS: BotEventKind[] = ["fish", "dig", "wine"];

function fmt(ms: number) {
  const t = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(t / 60)}m ${String(t % 60).padStart(2, "0")}s`;
}

function BotEventsPage() {
  const { values, patch, save, saving } = useAdminSetting<BotEventsConfig>(
    "bot_events",
    DEFAULT_BOT_EVENTS_CONFIG,
  );

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const updateKind = (k: BotEventKind, changes: Partial<BotEventsConfig[BotEventKind]>) =>
    patch({ [k]: { ...DEFAULT_BOT_EVENTS_CONFIG[k], ...(values[k] || {}), ...changes } } as Partial<BotEventsConfig>);

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Bot Events"
        description="Schedule Fish, Dig and Wine as community-wide events. Everyone can join during each open window, once per round."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>}
      />

      <SettingsCard title="Live status" description="What every user in the chatroom is seeing right now.">
        <div className="grid gap-2 sm:grid-cols-3">
          {KINDS.map((k) => {
            const cfg = values[k] || DEFAULT_BOT_EVENTS_CONFIG[k];
            const s = computeEventState(k, cfg, now);
            const meta = BOT_EVENT_META[k];
            return (
              <div key={k} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                  {!cfg.enabled && <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">Off</span>}
                </div>
                <div className="mt-2 text-sm">
                  {s.live ? (
                    <span className="font-bold text-emerald-500">🟢 LIVE · ends {fmt(s.msUntilClose)}</span>
                  ) : (
                    <span className="text-muted-foreground">Starts in {fmt(s.msUntilOpen)}</span>
                  )}
                </div>
                {s.golden && <div className="mt-1 text-[11px] font-semibold text-amber-500">✨ Golden round · 2× rewards</div>}
              </div>
            );
          })}
        </div>
      </SettingsCard>

      {KINDS.map((k) => {
        const cfg = values[k] || DEFAULT_BOT_EVENTS_CONFIG[k];
        const meta = BOT_EVENT_META[k];
        return (
          <SettingsCard key={k} title={`${meta.emoji} ${meta.label}`} description={`Global schedule for ${meta.command}.`}>
            <ToggleRow label="Enabled" desc="When off, users see a friendly disabled notice." value={cfg.enabled} onChange={(v) => updateKind(k, { enabled: v })} />

            <div className="space-y-1.5">
              <Label className="text-xs">Open every</Label>
              <div className="flex flex-wrap gap-2">
                {INTERVAL_PRESETS.map((m) => (
                  <Button key={m} size="sm" variant={cfg.interval_min === m ? "default" : "outline"} onClick={() => updateKind(k, { interval_min: m })}>
                    {m >= 60 ? `${m / 60}h` : `${m}m`}
                  </Button>
                ))}
                <div className="flex items-center gap-1">
                  <NumberField label="" value={cfg.interval_min} onChange={(v) => updateKind(k, { interval_min: Math.max(1, Math.floor(Number(v))) })} />
                  <span className="text-[11px] text-muted-foreground">min (custom)</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Open for</Label>
              <div className="flex flex-wrap gap-2">
                {DURATION_PRESETS.map((m) => (
                  <Button key={m} size="sm" variant={cfg.duration_min === m ? "default" : "outline"} onClick={() => updateKind(k, { duration_min: m })}>
                    {m}m
                  </Button>
                ))}
                <div className="flex items-center gap-1">
                  <NumberField label="" value={cfg.duration_min} onChange={(v) => updateKind(k, { duration_min: Math.max(1, Math.floor(Number(v))) })} />
                  <span className="text-[11px] text-muted-foreground">min (custom)</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">Duration is capped to the interval length.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <NumberField label="Max attempts per user per event" value={cfg.max_attempts} onChange={(v) => updateKind(k, { max_attempts: Math.max(1, Math.floor(Number(v))) })} />
              <NumberField label="Golden event chance (0–1)" step={0.05} value={cfg.bonus_chance} onChange={(v) => updateKind(k, { bonus_chance: Math.max(0, Math.min(1, Number(v))) })} />
            </div>

            <ToggleRow label="Enable golden bonus events" desc={`Occasional 2× ${meta.label} rounds (${meta.goldenLabel}).`} value={cfg.bonus_enabled} onChange={(v) => updateKind(k, { bonus_enabled: v })} />
          </SettingsCard>
        );
      })}
    </div>
  );
}
