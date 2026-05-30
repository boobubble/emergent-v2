import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible } from "@/components/admin/Collapsible";
import { RecommendedBadge } from "@/components/admin/RecommendedBadge";
import { NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { useAppSettings } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import { useAdminMode } from "@/lib/admin-mode";
import { toast } from "sonner";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/admin/automation")({ component: AutomationPage });

type Level = "off" | "low" | "medium" | "high";

interface AutomationConfig {
  level: Level;
  digestEnabled: boolean;
  rehydrateEnabled: boolean;
  cooldownSec: number;
}

const DEFAULTS: AutomationConfig = {
  level: "low",
  digestEnabled: true,
  rehydrateEnabled: false,
  cooldownSec: 300,
};

const LEVEL_DESC: Record<Level, string> = {
  off:    "No automated actions. You drive everything manually.",
  low:    "Light nudges only — daily digests, occasional re-engagement.",
  medium: "Balanced automation — recommended for most communities.",
  high:   "Aggressive — frequent prompts, automated boosts and refills.",
};

function AutomationPage() {
  const { raw, modules, refresh } = useAppSettings();
  const { isAdvanced } = useAdminMode();
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();

  const current: AutomationConfig = { ...DEFAULTS, ...((raw.automation as Partial<AutomationConfig>) || {}) };

  const mut = useMutation({
    mutationFn: (next: Partial<AutomationConfig>) =>
      saveSetting({ data: { key: "automation", value: { ...current, ...next } } }),
    onSuccess: async () => { await refresh(); qc.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Automation"
        description="Smart automation runs behind the scenes. Pick a level — fine-tune later if needed."
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Automation level</h3>
            <RecommendedBadge variant="recommended" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["off", "low", "medium", "high"] as Level[]).map((lvl) => {
              const active = current.level === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => mut.mutate({ level: lvl })}
                  disabled={mut.isPending}
                  className={`rounded-lg border p-3 text-left transition ${
                    active ? "border-primary bg-primary/10" : "border-border/60 bg-background hover:border-primary/40"
                  }`}
                >
                  <div className="text-sm font-semibold uppercase tracking-wide">{lvl}</div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">{LEVEL_DESC[current.level]}</p>
        </CardContent>
      </Card>

      {/* Contextual — only show advanced controls when feature is on AND admin opted in. */}
      {current.level !== "off" && isAdvanced && (
        <Collapsible
          title="Advanced automation"
          description="Cooldowns, digests and re-engagement rules."
          badge={<RecommendedBadge variant="advanced" />}
        >
          <ToggleRow
            label="Daily digest emails"
            desc="Send a daily activity summary to opted-in users."
            value={current.digestEnabled}
            onChange={(v) => mut.mutate({ digestEnabled: v })}
          />
          {modules.notifications && (
            <ToggleRow
              label="Re-engagement pings"
              desc="Notify dormant users when their rooms have activity."
              value={current.rehydrateEnabled}
              onChange={(v) => mut.mutate({ rehydrateEnabled: v })}
            />
          )}
          <NumberField
            label="Cooldown (seconds)"
            value={current.cooldownSec}
            min={30}
            step={30}
            onChange={(v) => mut.mutate({ cooldownSec: v })}
            hint="Minimum delay between automated actions per user."
          />
        </Collapsible>
      )}

      {current.level !== "off" && !isAdvanced && (
        <p className="px-1 text-xs text-muted-foreground">
          Switch to <span className="font-medium">Advanced mode</span> in the sidebar to tune cooldowns and rules.
        </p>
      )}
    </div>
  );
}
