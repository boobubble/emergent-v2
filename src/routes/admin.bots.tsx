import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsCard, NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const BOT_LIST: { id: string; label: string; desc: string; defaultName: string; icon: string; defaultMessages: string[] }[] = [
  {
    id: "fish", label: "Fish bot", desc: "Periodic catch-the-fish mini-game.",
    defaultName: "FishBot", icon: "🎣",
    defaultMessages: [
      "🎣 A big one just bit! Type !catch to reel it in.",
      "🐟 Schools of fish spotted nearby — !catch fast!",
      "🌊 The tide brought something shiny… !catch",
    ],
  },
  {
    id: "wine", label: "Wine bot", desc: "Drops collectible bottles in chat.",
    defaultName: "WineBot", icon: "🍷",
    defaultMessages: [
      "🍷 A vintage bottle appears! Type !grab to claim it.",
      "🥂 Cellar restock — grab one with !grab.",
    ],
  },
  {
    id: "dig", label: "Dig bot", desc: "Treasure-dig coin reward bursts.",
    defaultName: "DigBot", icon: "⛏️",
    defaultMessages: [
      "⛏️ Treasure spotted! Type !dig to start digging.",
      "💰 X marks the spot — !dig for coins!",
    ],
  },
  {
    id: "trivia", label: "Trivia bot", desc: "Posts trivia questions with rewards.",
    defaultName: "TriviaBot", icon: "🧠",
    defaultMessages: [
      "❓ Trivia time! First correct answer wins.",
      "🧠 Quick question coming up — get ready!",
    ],
  },
  {
    id: "ai", label: "AI bot", desc: "Responds to mentions using AI.",
    defaultName: "Aria", icon: "✨",
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

      <div className="grid gap-3 lg:grid-cols-2">
        {BOT_LIST.map((b) => {
          const cfg = values.bots?.[b.id] ?? defaultBot(b.id, values.default_interval_sec, values.default_cooldown_sec);
          return (
            <Card
              key={b.id}
              className="rounded-2xl border-border/60 bg-card/70 backdrop-blur-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-base ring-1 ring-primary/15"
                  >
                    <span className="leading-none">{b.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">{b.label}</h3>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                          cfg.enabled
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {cfg.enabled ? "On" : "Off"}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">{b.desc}</p>
                  </div>
                  <AdminToggle
                    checked={cfg.enabled}
                    onCheckedChange={(v) => updateBot(b.id, { enabled: v })}
                    ariaLabel={`Enable ${b.label}`}
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Name</Label>
                    <Input
                      className="h-8 text-sm"
                      value={cfg.name}
                      maxLength={32}
                      onChange={(e) => updateBot(b.id, { name: e.target.value })}
                      placeholder={b.defaultName}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Rooms</Label>
                    <Input
                      className="h-8 text-sm"
                      value={cfg.rooms}
                      onChange={(e) => updateBot(b.id, { rooms: e.target.value })}
                      placeholder="lobby, games"
                    />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Interval (s)</Label>
                    <Input
                      type="number"
                      className="h-8 text-sm"
                      value={Number.isFinite(cfg.interval_sec) ? cfg.interval_sec : 0}
                      min={0}
                      onChange={(e) => updateBot(b.id, { interval_sec: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Cooldown (s)</Label>
                    <Input
                      type="number"
                      className="h-8 text-sm"
                      value={Number.isFinite(cfg.cooldown_sec) ? cfg.cooldown_sec : 0}
                      min={0}
                      onChange={(e) => updateBot(b.id, { cooldown_sec: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Messages (one per line)</Label>
                  <Textarea
                    rows={3}
                    className="resize-none text-sm leading-snug"
                    value={cfg.messages}
                    onChange={(e) => updateBot(b.id, { messages: e.target.value })}
                    placeholder={b.defaultMessages.join("\n")}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
