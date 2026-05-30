import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Flame, TrendingUp, Heart, Battery, Save } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppSettings } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import {
  RETENTION_DEFAULTS,
  STREAK_MILESTONES,
  MOMENTUM_TIERS,
  LOYALTY_RANKS,
  ENERGY_TIERS,
  type RetentionConfig,
} from "@/lib/retention-config";

export const Route = createFileRoute("/admin/retention")({
  component: RetentionPage,
});

const MODULES: { key: keyof RetentionConfig["modules"]; label: string; icon: any; description: string }[] = [
  { key: "activity", label: "Activity & Streaks", icon: Flame,      description: "Daily login, chat, feed and room streaks with positive milestone rewards." },
  { key: "momentum", label: "Momentum",           icon: TrendingUp, description: "Rolling creator score that grows with engagement and decays softly when idle." },
  { key: "loyalty",  label: "Loyalty",            icon: Heart,      description: "Per-scope loyalty ranks. Growth pauses on inactivity — points never decrease." },
  { key: "energy",   label: "Energy",             icon: Battery,    description: "Optional bonus multiplier that fades when idle. Affects bonus rewards only — never base coins." },
];

function RetentionPage() {
  const { raw, refresh } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);

  const persisted = (raw.retention as Partial<RetentionConfig> | undefined) ?? {};
  const [draft, setDraft] = useState<RetentionConfig>(() => ({
    ...RETENTION_DEFAULTS,
    ...persisted,
    modules: { ...RETENTION_DEFAULTS.modules, ...(persisted.modules ?? {}) },
    streaks:  { ...RETENTION_DEFAULTS.streaks,  ...(persisted.streaks  ?? {}) },
    momentum: { ...RETENTION_DEFAULTS.momentum, ...(persisted.momentum ?? {}) },
    loyalty:  { ...RETENTION_DEFAULTS.loyalty,  ...(persisted.loyalty  ?? {}) },
    energy:   { ...RETENTION_DEFAULTS.energy,   ...(persisted.energy   ?? {}) },
  }));

  // Re-hydrate when the realtime settings subscription fires.
  useEffect(() => {
    setDraft((d) => ({
      ...d,
      ...persisted,
      modules: { ...d.modules, ...(persisted.modules ?? {}) },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(persisted.modules ?? {})]);

  const mut = useMutation({
    mutationFn: (next: RetentionConfig) =>
      saveSetting({ data: { key: "retention", value: next } }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const toggleModule = (key: keyof RetentionConfig["modules"], v: boolean) => {
    const next = { ...draft, modules: { ...draft.modules, [key]: v } };
    setDraft(next);
    mut.mutate(next);
  };

  const setNum = (path: (cfg: RetentionConfig) => void) => {
    const next = structuredClone(draft);
    path(next);
    setDraft(next);
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Retention & Engagement"
        description="Activity, Momentum, Loyalty and Energy. Inactivity reduces growth — earned coins, XP and past rewards are never removed."
      />

      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        Saved to <code className="rounded bg-background px-1 py-0.5">app_settings.retention</code>.
        Disabling a module hides its UI and pauses its service hooks — historical data is preserved.
      </div>

      {/* Modules */}
      <div className="space-y-2">
        <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Modules</div>
        <Card>
          <CardContent className="divide-y p-0">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const on = draft.modules[m.key];
              return (
                <div key={m.key} className="flex items-center gap-3 px-4 py-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-md ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.description}</div>
                  </div>
                  <AdminToggle checked={on} onCheckedChange={(v) => toggleModule(m.key, v)} disabled={mut.isPending} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Streaks */}
      <Section title="Activity & Streaks" disabled={!draft.modules.activity}>
        <NumberRow
          label="Grace period (hours)"
          hint="Hours past local midnight before a missed day breaks the streak."
          value={draft.streaks.graceHours}
          onChange={(v) => setNum((c) => { c.streaks.graceHours = v; })}
        />
        <NumberRow
          label="Risk warning window (hours)"
          hint='Show a "streak at risk" prompt this many hours before reset.'
          value={draft.streaks.riskWindowHours}
          onChange={(v) => setNum((c) => { c.streaks.riskWindowHours = v; })}
        />
        <div className="space-y-1">
          <Label className="text-xs">Milestones (read-only preview)</Label>
          <div className="flex flex-wrap gap-1.5">
            {STREAK_MILESTONES.map((m) => (
              <Badge key={m.day} variant="outline" className="text-[10px]">
                Day {m.day} · {m.reward.kind}
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      {/* Momentum */}
      <Section title="Momentum" disabled={!draft.modules.momentum}>
        <NumberRow
          label="Decay per idle day (%)"
          hint="Percent of score removed per day of inactivity. Never affects coins."
          value={draft.momentum.decayPerDayPct}
          onChange={(v) => setNum((c) => { c.momentum.decayPerDayPct = v; })}
        />
        <NumberRow
          label="Grace period before decay (days)"
          value={draft.momentum.decayGraceDays}
          onChange={(v) => setNum((c) => { c.momentum.decayGraceDays = v; })}
        />
        <NumberRow
          label="Daily gain cap"
          value={draft.momentum.dailyCap}
          onChange={(v) => setNum((c) => { c.momentum.dailyCap = v; })}
        />
        <NumberRow
          label="Score floor"
          value={draft.momentum.floor}
          onChange={(v) => setNum((c) => { c.momentum.floor = v; })}
        />
        <div className="space-y-1">
          <Label className="text-xs">Tiers</Label>
          <div className="flex flex-wrap gap-1.5">
            {MOMENTUM_TIERS.map((t) => (
              <Badge key={t.key} variant="outline" className={`text-[10px] ${t.chip}`}>
                {t.label} ≥ {t.minScore} · +{t.visibilityBoostPct}%
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      {/* Loyalty */}
      <Section title="Loyalty" disabled={!draft.modules.loyalty}>
        <NumberRow
          label="Pause growth after idle (days)"
          hint="After this many idle days, loyalty stops accruing until the user returns. Points are not removed."
          value={draft.loyalty.pausesAfterDays}
          onChange={(v) => setNum((c) => { c.loyalty.pausesAfterDays = v; })}
        />
        <div className="space-y-1">
          <Label className="text-xs">Ranks</Label>
          <div className="flex flex-wrap gap-1.5">
            {LOYALTY_RANKS.map((r) => (
              <Badge key={r.level} variant="outline" className={`text-[10px] ${r.chip}`}>
                Lv{r.level} {r.name} ≥ {r.minPoints}
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      {/* Energy */}
      <Section title="Energy" disabled={!draft.modules.energy}>
        <NumberRow
          label="Max energy"
          value={draft.energy.max}
          onChange={(v) => setNum((c) => { c.energy.max = v; })}
        />
        <NumberRow
          label="Regen per active hour"
          value={draft.energy.regenPerHour}
          onChange={(v) => setNum((c) => { c.energy.regenPerHour = v; })}
        />
        <NumberRow
          label="Decay per idle day"
          value={draft.energy.decayPerDay}
          onChange={(v) => setNum((c) => { c.energy.decayPerDay = v; })}
        />
        <div className="space-y-1">
          <Label className="text-xs">Bonus tiers (multiplier applies to bonus rewards only)</Label>
          <div className="flex flex-wrap gap-1.5">
            {ENERGY_TIERS.map((t) => (
              <Badge key={t.minEnergy} variant="outline" className="text-[10px]">
                ≥ {t.minEnergy}% · ×{t.bonusMultiplier} ({t.label})
              </Badge>
            ))}
          </div>
        </div>
      </Section>

      <div className="sticky bottom-3 flex justify-end">
        <Button onClick={() => mut.mutate(draft)} disabled={mut.isPending} className="gap-2">
          <Save className="h-4 w-4" /> Save changes
        </Button>
      </div>
    </div>
  );
}

function Section({ title, disabled, children }: { title: string; disabled?: boolean; children: React.ReactNode }) {
  return (
    <div className={`space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <Card>
        <CardContent className="space-y-3 p-4">{children}</CardContent>
      </Card>
    </div>
  );
}

function NumberRow({ label, hint, value, onChange }: { label: string; hint?: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid items-start gap-2 sm:grid-cols-[1fr_8rem]">
      <div>
        <Label className="text-xs font-medium">{label}</Label>
        {hint && <div className="text-[11px] text-muted-foreground">{hint}</div>}
      </div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-8 text-xs"
      />
    </div>
  );
}
