import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsCard, NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSetting } from "@/lib/use-admin-setting";

interface BotConfig {
  enabled: boolean;
  interval_sec: number;
  cooldown_sec: number;
  rooms: string; // comma-separated channel ids
}

interface BotsValues {
  master_enabled: boolean;
  default_interval_sec: number;
  default_cooldown_sec: number;
  bots: Record<string, BotConfig>;
}

const BOT_LIST: { id: string; label: string; desc: string }[] = [
  { id: "fish",   label: "Fish bot",   desc: "Periodic catch-the-fish mini-game." },
  { id: "wine",   label: "Wine bot",   desc: "Drops collectible bottles in chat." },
  { id: "dig",    label: "Dig bot",    desc: "Treasure-dig coin reward bursts." },
  { id: "trivia", label: "Trivia bot", desc: "Posts trivia questions with rewards." },
  { id: "ai",     label: "AI bot",     desc: "Responds to mentions using AI." },
];

const defaultBot = (interval = 600, cooldown = 60): BotConfig => ({
  enabled: false, interval_sec: interval, cooldown_sec: cooldown, rooms: "lobby",
});

const DEFAULTS: BotsValues = {
  master_enabled: false,
  default_interval_sec: 600,
  default_cooldown_sec: 60,
  bots: Object.fromEntries(BOT_LIST.map((b) => [b.id, defaultBot()])),
};

export const Route = createFileRoute("/admin/bots")({ component: BotsPage });

function BotsPage() {
  const { values, set, save, saving } = useAdminSetting<BotsValues>("bots", DEFAULTS);
  const updateBot = (id: string, patch: Partial<BotConfig>) =>
    set("bots", { ...values.bots, [id]: { ...defaultBot(), ...(values.bots?.[id] ?? {}), ...patch } });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Bots"
        description="Lightweight automated room companions with per-bot intervals."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>}
      />
      <SettingsCard title="Global bot controls">
        <ToggleRow label="Enable bots system" desc="Master switch for every bot below." value={values.master_enabled} onChange={(v) => set("master_enabled", v)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Default message interval (sec)" value={values.default_interval_sec} onChange={(v) => set("default_interval_sec", v)} />
          <NumberField label="Default cooldown (sec)" value={values.default_cooldown_sec} onChange={(v) => set("default_cooldown_sec", v)} />
        </div>
      </SettingsCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {BOT_LIST.map((b) => {
          const cfg = values.bots?.[b.id] ?? defaultBot(values.default_interval_sec, values.default_cooldown_sec);
          return (
            <SettingsCard key={b.id} title={b.label} description={b.desc}>
              <ToggleRow label="Enabled" value={cfg.enabled} onChange={(v) => updateBot(b.id, { enabled: v })} />
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField label="Interval (sec)" value={cfg.interval_sec} onChange={(v) => updateBot(b.id, { interval_sec: v })} />
                <NumberField label="Cooldown (sec)" value={cfg.cooldown_sec} onChange={(v) => updateBot(b.id, { cooldown_sec: v })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Rooms (comma-separated channel IDs)</Label>
                <Input value={cfg.rooms} onChange={(e) => updateBot(b.id, { rooms: e.target.value })} placeholder="lobby, games" />
              </div>
            </SettingsCard>
          );
        })}
      </div>
    </div>
  );
}
