import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAppSettings } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import {
  mergeDiscoveryWidgetsConfig,
  type DiscoveryWidgetsConfig,
  type DiscoveryWidgetItem,
} from "@/lib/discovery-widgets-config";

export const Route = createFileRoute("/admin/discovery-widgets")({
  component: DiscoveryWidgetsAdmin,
});

function DiscoveryWidgetsAdmin() {
  const { raw, refresh } = useAppSettings();
  const [cfg, setCfg] = useState<DiscoveryWidgetsConfig>(() =>
    mergeDiscoveryWidgetsConfig(raw?.discovery_widgets),
  );
  useEffect(() => {
    setCfg(mergeDiscoveryWidgetsConfig(raw?.discovery_widgets));
  }, [raw]);

  const save = useServerFn(updateSetting);
  const mut = useMutation({
    mutationFn: (next: DiscoveryWidgetsConfig) =>
      save({ data: { key: "discovery_widgets", value: next } }),
    onSuccess: async () => { await refresh(); toast.success("Saved"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const patchItem = (i: number, patch: Partial<DiscoveryWidgetItem>) => {
    setCfg((c) => {
      const items = c.items.slice();
      items[i] = { ...items[i], ...patch };
      return { ...c, items };
    });
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Feed Discovery Widgets"
        description="Promote platform modules inside the Feed. Widgets rotate intelligently based on user activity."
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Master switch</div>
              <div className="text-xs text-muted-foreground">Enable discovery widgets across the Feed.</div>
            </div>
            <AdminToggle
              checked={cfg.enabled}
              onCheckedChange={(v) => setCfg((c) => ({ ...c, enabled: v }))}
            />
          </div>
          <div className="grid gap-1.5 sm:max-w-xs">
            <Label className="text-xs">Show after every N posts</Label>
            <Input
              type="number"
              min={2}
              max={30}
              value={cfg.insertEvery}
              onChange={(e) =>
                setCfg((c) => ({ ...c, insertEvery: Math.max(2, Number(e.target.value) || 6) }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {cfg.items.map((it, i) => (
          <Card key={it.key}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-xl">
                  {it.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{it.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{it.to}</div>
                </div>
                <AdminToggle
                  checked={it.enabled}
                  onCheckedChange={(v) => patchItem(i, { enabled: v })}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs">Title</Label>
                  <Input value={it.title} onChange={(e) => patchItem(i, { title: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">Icon (emoji)</Label>
                  <Input value={it.icon} onChange={(e) => patchItem(i, { icon: e.target.value })} />
                </div>
                <div className="grid gap-1.5 sm:col-span-2">
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    rows={2}
                    value={it.description}
                    onChange={(e) => patchItem(i, { description: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs">CTA text</Label>
                  <Input value={it.ctaText} onChange={(e) => patchItem(i, { ctaText: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Priority (1–10)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={it.priority}
                      onChange={(e) => patchItem(i, { priority: Math.min(10, Math.max(1, Number(e.target.value) || 1)) })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Min gap (posts)</Label>
                    <Input
                      type="number"
                      min={2}
                      max={50}
                      value={it.frequency}
                      onChange={(e) => patchItem(i, { frequency: Math.max(2, Number(e.target.value) || 6) })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-3 z-10 flex justify-end">
        <Button onClick={() => mut.mutate(cfg)} disabled={mut.isPending}>
          {mut.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
