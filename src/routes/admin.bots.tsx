import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsCard, NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminSetting } from "@/lib/use-admin-setting";

interface BotConfig {
  enabled: boolean;
  name: string;
  interval_sec: number;
  cooldown_sec: number;
  rooms: string; // comma-separated channel ids
  messages: string; // one message per line
}

interface BotsValues {
  master_enabled: boolean;
  default_interval_sec: number;
  default_cooldown_sec: number;
  bots: Record<string, BotConfig>;
}

const BOT_LIST: { id: string; label: string; desc: string; defaultName: string; defaultMessages: string[] }[] = [
  {
    id: "fish", label: "Fish bot", desc: "Periodic catch-the-fish mini-game.",
    defaultName: "FishBot",
    defaultMessages: [
      "🎣 A big one just bit! Type !catch to reel it in.",
      "🐟 Schools of fish spotted nearby — !catch fast!",
      "🌊 The tide brought something shiny… !catch",
    ],
  },
  {
    id: "wine", label: "Wine bot", desc: "Drops collectible bottles in chat.",
    defaultName: "WineBot",
    defaultMessages: [
      "🍷 A vintage bottle appears! Type !grab to claim it.",
      "🥂 Cellar restock — grab one with !grab.",
    ],
  },
  {
    id: "dig", label: "Dig bot", desc: "Treasure-dig coin reward bursts.",
    defaultName: "DigBot",
    defaultMessages: [
      "⛏️ Treasure spotted! Type !dig to start digging.",
      "💰 X marks the spot — !dig for coins!",
    ],
  },
  {
    id: "trivia", label: "Trivia bot", desc: "Posts trivia questions with rewards.",
    defaultName: "TriviaBot",
    defaultMessages: [
      "❓ Trivia time! First correct answer wins.",
      "🧠 Quick question coming up — get ready!",
    ],
  },
  {
    id: "ai", label: "AI bot", desc: "Responds to mentions using AI.",
    defaultName: "Aria",
    defaultMessages: [
      "👋 Mention me anytime with @Aria — I'm here to help.",
    ],
  },
];

const defaultBot = (
  id: string,
  interval = 600,
  cooldown = 60,
): BotConfig => {
  const meta = BOT_LIST.find((b) => b.id === id);
  return {
    enabled: false,
    name: meta?.defaultName ?? id,
    interval_sec: interval,
    cooldown_sec: cooldown,
    rooms: "lobby",
    messages: (meta?.defaultMessages ?? []).join("\n"),
  };
};

const DEFAULTS: BotsValues = {
  master_enabled: false,
  default_interval_sec: 600,
  default_cooldown_sec: 60,
  bots: Object.fromEntries(BOT_LIST.map((b) => [b.id, defaultBot(b.id)])),
};

export const Route = createFileRoute("/admin/bots")({ component: BotsPage });

function BotsPage() {
  const { values, set, save, saving } = useAdminSetting<BotsValues>("bots", DEFAULTS);
  const updateBot = (id: string, patch: Partial<BotConfig>) =>
    set("bots", {
      ...values.bots,
      [id]: { ...defaultBot(id), ...(values.bots?.[id] ?? {}), ...patch },
    });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Bots"
        description="Lightweight automated room companions with per-bot names, messages, and intervals."
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
          const cfg = values.bots?.[b.id] ?? defaultBot(b.id, values.default_interval_sec, values.default_cooldown_sec);
          return (
            <SettingsCard key={b.id} title={b.label} description={b.desc}>
              <ToggleRow label="Enabled" value={cfg.enabled} onChange={(v) => updateBot(b.id, { enabled: v })} />
              <div className="space-y-1.5">
                <Label className="text-xs">Display name</Label>
                <Input
                  value={cfg.name}
                  maxLength={32}
                  onChange={(e) => updateBot(b.id, { name: e.target.value })}
                  placeholder={b.defaultName}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <NumberField label="Interval (sec)" value={cfg.interval_sec} onChange={(v) => updateBot(b.id, { interval_sec: v })} />
                <NumberField label="Cooldown (sec)" value={cfg.cooldown_sec} onChange={(v) => updateBot(b.id, { cooldown_sec: v })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Rooms (comma-separated channel IDs)</Label>
                <Input value={cfg.rooms} onChange={(e) => updateBot(b.id, { rooms: e.target.value })} placeholder="lobby, games" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Default messages (one per line)</Label>
                <Textarea
                  rows={4}
                  value={cfg.messages}
                  onChange={(e) => updateBot(b.id, { messages: e.target.value })}
                  placeholder={b.defaultMessages.join("\n")}
                />
                <p className="text-[11px] text-muted-foreground">
                  The bot picks one line at random each interval.
                </p>
              </div>
            </SettingsCard>
          );
        })}
      </div>
    </div>
  );
}
