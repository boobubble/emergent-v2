import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { useAppSettings } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import {
  FUTURE_MODULES,
  FUTURE_FLAG_DEFAULTS,
  type FutureFlags,
  type FutureModuleKey,
  type FutureModuleCategory,
} from "@/lib/future-modules";

export const Route = createFileRoute("/admin/upcoming")({
  component: UpcomingHub,
});

const CATEGORY_LABEL: Record<FutureModuleCategory, string> = {
  economy: "Economy",
  engagement: "Engagement",
  social: "Social",
  commerce: "Commerce",
  premium: "Premium",
  ai: "AI",
};

const STATUS_STYLES: Record<string, string> = {
  planned: "bg-muted text-muted-foreground",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  beta: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  deprecated: "bg-red-500/15 text-red-600 dark:text-red-400",
};

function UpcomingHub() {
  const { raw, refresh } = useAppSettings();
  const qc = useQueryClient();
  const saveSetting = useServerFn(updateSetting);

  const flags: FutureFlags = {
    ...FUTURE_FLAG_DEFAULTS,
    ...((raw.future_flags as FutureFlags | undefined) ?? {}),
  };

  const mut = useMutation({
    mutationFn: (next: FutureFlags) =>
      saveSetting({ data: { key: "future_flags", value: next } }),
    onSuccess: async () => {
      await refresh();
      qc.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Updated");
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const toggle = (key: FutureModuleKey, v: boolean) =>
    mut.mutate({ ...flags, [key]: v });

  const groups: Record<FutureModuleCategory, typeof FUTURE_MODULES> = {
    economy: [], engagement: [], social: [], commerce: [], premium: [], ai: [],
  };
  for (const m of FUTURE_MODULES) groups[m.category].push(m);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Upcoming Modules"
        description="Architecture-ready placeholders. Flip a flag to expose the module's UI once it's implemented. All modules ship disabled by default."
      />

      <div className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
        These toggles control <code className="rounded bg-background px-1 py-0.5">app_settings.future_flags</code>.
        Enabling a flag does not implement the feature — it only signals readiness to the client.
      </div>

      {(Object.keys(groups) as FutureModuleCategory[]).map((cat) => (
        groups[cat].length === 0 ? null : (
          <div key={cat} className="space-y-2">
            <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABEL[cat]}
            </div>
            <Card>
              <CardContent className="divide-y p-0">
                {groups[cat].map((m) => {
                  const Icon = m.icon;
                  const on = Boolean(flags[m.key]);
                  return (
                    <div key={m.key} className="flex items-center gap-3 px-4 py-3">
                      <div className={`grid h-9 w-9 place-items-center rounded-md ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{m.label}</span>
                          <Badge variant="outline" className={`text-[10px] uppercase ${STATUS_STYLES[m.status]}`}>
                            {m.status.replace("_", " ")}
                          </Badge>
                          {m.dependsOn?.length ? (
                            <span className="text-[10px] text-muted-foreground">
                              needs: {m.dependsOn.join(", ")}
                            </span>
                          ) : null}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{m.description}</div>
                      </div>
                      {m.adminRoute ? (
                        <Link
                          to="/admin/upcoming/$key"
                          params={{ key: m.key }}
                          className="hidden items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted sm:inline-flex"
                        >
                          Details <ChevronRight className="h-3 w-3" />
                        </Link>
                      ) : null}
                      <AdminToggle
                        checked={on}
                        onCheckedChange={(v) => toggle(m.key, v)}
                        disabled={mut.isPending || m.status === "deprecated"}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )
      ))}
    </div>
  );
}
