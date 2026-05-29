import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MODULE_REGISTRY } from "@/lib/admin-modules";
import { useAppSettings, type ModulesFlags } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/modules")({
  component: ModulesPage,
});

function ModulesPage() {
  const { modules, refresh } = useAppSettings();
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: (next: ModulesFlags) => saveSetting({ data: { key: "modules", value: next } }),
    onSuccess: async () => { await refresh(); qc.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("Updated"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const toggle = (key: keyof ModulesFlags, v: boolean) => mut.mutate({ ...modules, [key]: v });

  const groups: Record<string, typeof MODULE_REGISTRY> = {};
  for (const m of MODULE_REGISTRY) (groups[m.group] ||= []).push(m);

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Modules" description="Enable or disable features across the platform. Disabled modules are not loaded on the client." />

      {Object.entries(groups).map(([group, items]) => (
        <div key={group} className="space-y-2">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</div>
          <Card>
            <CardContent className="divide-y p-0">
              {items.map((m) => {
                const Icon = m.icon;
                const on = modules[m.key];
                return (
                  <div key={m.key} className="flex items-center gap-3 px-4 py-3">
                    <div className={`grid h-9 w-9 place-items-center rounded-md ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{m.label}</div>
                      <div className="truncate text-xs text-muted-foreground">{m.description}</div>
                    </div>
                    <Switch checked={on} onCheckedChange={(v) => toggle(m.key, v)} disabled={mut.isPending} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
