import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Trophy, MessageSquare, Gift, Lock, Search } from "lucide-react";

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
  PROGRESSION_DEFAULTS,
  UNLOCKS,
  LEVEL_TIERS,
  resolveUnlock,
  type ProgressionConfig,
  type UnlockKey,
} from "@/lib/progression-config";

export const Route = createFileRoute("/admin/progression")({
  component: ProgressionPage,
});

const MODULES: { key: keyof ProgressionConfig["modules"]; label: string; icon: any; description: string }[] = [
  { key: "unlocks",        label: "Level Unlocks",   icon: Lock,         description: "Master switch for the level-gated feature map. When off, all unlocks are open." },
  { key: "messageControl", label: "Message Control", icon: MessageSquare, description: "Surface reply / edit / delete / quote / copy-link affordances on chat messages." },
  { key: "creatorRanks",   label: "Creator Ranks",   icon: Trophy,       description: "Show creator badge, leaderboard and rank progression." },
  { key: "socialStatus",   label: "Social Status",   icon: Gift,         description: "Show reputation, loyalty and veteran badges." },
];

function ProgressionPage() {
  const { raw, refresh } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);
  const persisted = (raw.progression as Partial<ProgressionConfig> | undefined) ?? {};

  const [draft, setDraft] = useState<ProgressionConfig>(() => ({
    ...PROGRESSION_DEFAULTS,
    ...persisted,
    modules:  { ...PROGRESSION_DEFAULTS.modules,  ...(persisted.modules ?? {}) },
    message:  { ...PROGRESSION_DEFAULTS.message,  ...(persisted.message ?? {}) },
    gifting:  { ...PROGRESSION_DEFAULTS.gifting,  ...(persisted.gifting ?? {}) },
    unlocks:  { ...(persisted.unlocks ?? {}) },
  }));

  useEffect(() => {
    setDraft((d) => ({
      ...d,
      modules: { ...d.modules, ...(persisted.modules ?? {}) },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(persisted.modules ?? {})]);

  const mut = useMutation({
    mutationFn: (next: ProgressionConfig) =>
      saveSetting({ data: { key: "progression", value: next } }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Saved");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const toggleModule = (k: keyof ProgressionConfig["modules"], v: boolean) => {
    const next = { ...draft, modules: { ...draft.modules, [k]: v } };
    setDraft(next); mut.mutate(next);
  };

  const setMessage = <K extends keyof ProgressionConfig["message"]>(k: K, v: ProgressionConfig["message"][K]) =>
    setDraft((d) => ({ ...d, message: { ...d.message, [k]: v } }));

  const setGifting = <K extends keyof ProgressionConfig["gifting"]>(k: K, v: ProgressionConfig["gifting"][K]) =>
    setDraft((d) => ({ ...d, gifting: { ...d.gifting, [k]: v } }));

  const setUnlock = (key: UnlockKey, patch: { level?: number; enabled?: boolean }) =>
    setDraft((d) => ({
      ...d,
      unlocks: { ...d.unlocks, [key]: { ...(d.unlocks[key] ?? {}), ...patch } },
    }));

  const [query, setQuery] = useState("");
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = new Map<number, typeof UNLOCKS>();
    for (const u of UNLOCKS) {
      if (q && !`${u.label} ${u.description} ${u.key}`.toLowerCase().includes(q)) continue;
      const arr = out.get(u.tier) ?? [];
      arr.push(u);
      out.set(u.tier, arr);
    }
    return Array.from(out.entries()).sort((a, b) => a[0] - b[0]);
  }, [query]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Progression & Unlocks"
        description="Centralized Level, Reputation, Permissions and Unlocks. Configure what every level can do without touching working features."
      />

      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        Saved to <code className="rounded bg-background px-1 py-0.5">app_settings.progression</code>.
        Existing XP, coins, levels and rewards are untouched — this page only controls
        which features are gated by level and when.
      </div>

      {/* Modules */}
      <Section title="Modules">
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
      </Section>

      {/* Tier overview */}
      <Section title="Level Tiers">
        <Card>
          <CardContent className="flex flex-wrap gap-1.5 p-4">
            {LEVEL_TIERS.map((t) => (
              <Badge key={t.level} variant="outline" className={`text-[10px] ${t.chip}`}>
                Lv {t.level} · {t.name}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </Section>

      {/* Message control */}
      <Section title="Message Control">
        <Card>
          <CardContent className="space-y-3 p-4">
            <NumberRow
              label="Edit time limit (minutes)"
              hint="Window after sending in which the author can still edit. 0 = unlimited."
              value={draft.message.editTimeLimitMins}
              onChange={(v) => setMessage("editTimeLimitMins", v)}
            />
            <NumberRow
              label="Delete time limit (minutes)"
              hint="Window after sending in which the author can still delete. 0 = unlimited."
              value={draft.message.deleteTimeLimitMins}
              onChange={(v) => setMessage("deleteTimeLimitMins", v)}
            />
            <div className="flex items-center justify-between rounded-md border bg-muted/20 px-3 py-2">
              <div>
                <div className="text-xs font-medium">Unsend (recall) support</div>
                <div className="text-[11px] text-muted-foreground">Reserved for a future build. Off by default.</div>
              </div>
              <AdminToggle checked={draft.message.unsendEnabled} onCheckedChange={(v) => setMessage("unsendEnabled", v)} />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Gifting */}
      <Section title="Coin Gifting">
        <Card>
          <CardContent className="space-y-3 p-4">
            <NumberRow label="Daily gifting cap (coins)" value={draft.gifting.dailyCap}        onChange={(v) => setGifting("dailyCap", v)} />
            <NumberRow label="Legend multiplier"          value={draft.gifting.legendMultiplier} onChange={(v) => setGifting("legendMultiplier", v)} />
            <NumberRow
              label="Min level override"
              hint="Force a min level for gifting (0 = follow the unlocks table)."
              value={draft.gifting.minLevelOverride}
              onChange={(v) => setGifting("minLevelOverride", v)}
            />
          </CardContent>
        </Card>
      </Section>

      {/* Unlocks matrix */}
      <Section title="Unlocks">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search unlocks…"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="space-y-3">
          {grouped.map(([tier, items]) => (
            <Card key={tier}>
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tier {tier} · {LEVEL_TIERS.find((t) => t.level === tier)?.name}
                  </div>
                  <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
                </div>
                <div className="divide-y">
                  {items.map((u) => {
                    const { level, enabled } = resolveUnlock(u.key, draft);
                    return (
                      <div key={u.key} className="grid items-center gap-2 px-4 py-2.5 sm:grid-cols-[1fr_5rem_3rem]">
                        <div className="min-w-0">
                          <div className="text-xs font-medium">{u.label}</div>
                          <div className="text-[11px] text-muted-foreground">{u.description}</div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground/70">{u.key}</div>
                        </div>
                        <Input
                          type="number"
                          value={level}
                          onChange={(e) => setUnlock(u.key, { level: Number(e.target.value) })}
                          className="h-7 text-xs"
                        />
                        <AdminToggle checked={enabled} onCheckedChange={(v) => setUnlock(u.key, { enabled: v })} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
          {grouped.length === 0 && (
            <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
              No unlocks match “{query}”.
            </div>
          )}
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      {children}
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
      <Input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-8 text-xs" />
    </div>
  );
}
