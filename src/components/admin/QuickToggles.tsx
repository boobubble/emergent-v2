import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAppSettings, type ModulesFlags } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import { toast } from "sonner";
import { MessageSquare, Newspaper, Gamepad2, Sparkles, Bell, Mic, Wrench } from "lucide-react";

interface QuickToggle {
  key: keyof ModulesFlags | "maintenance";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK: QuickToggle[] = [
  { key: "feed",          label: "Social Feed",     icon: Newspaper },
  { key: "games",         label: "Games",           icon: Gamepad2 },
  { key: "voice",         label: "Voice Rooms",     icon: Mic },
  { key: "ai",            label: "AI Tools",        icon: Sparkles },
  { key: "notifications", label: "Notifications",   icon: Bell },
  { key: "maintenance",   label: "Maintenance Mode", icon: Wrench },
];

export function QuickToggles() {
  const { modules, raw, refresh } = useAppSettings();
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: (p: { key: string; value: unknown }) => saveSetting({ data: p }),
    onSuccess: async () => { await refresh(); qc.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("Saved"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const maintenance = Boolean((raw.maintenance as { enabled?: boolean } | undefined)?.enabled);

  const toggle = (item: QuickToggle, v: boolean) => {
    if (item.key === "maintenance") {
      mut.mutate({ key: "maintenance", value: { enabled: v } });
    } else {
      mut.mutate({ key: "modules", value: { ...modules, [item.key]: v } });
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Quick settings</CardTitle>
        <p className="text-xs text-muted-foreground">Fast access to the most important toggles.</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK.map((item) => {
            const Icon = item.icon;
            const on = item.key === "maintenance" ? maintenance : modules[item.key as keyof ModulesFlags];
            return (
              <label
                key={item.key}
                className="flex items-center gap-3 rounded-lg border border-border/60 bg-background p-3"
              >
                <div className={`grid h-9 w-9 place-items-center rounded-md ${on ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 text-sm font-medium">{item.label}</div>
                <Switch checked={!!on} onCheckedChange={(v) => toggle(item, v)} disabled={mut.isPending} />
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
