import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAppSettings, type LayoutPriority } from "@/lib/app-settings";
import { updateSetting } from "@/lib/admin.functions";
import { MessageSquare, Newspaper, Smartphone, Sidebar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_admin/social-layout")({
  component: SocialLayout,
});

function SocialLayout() {
  const { layoutPriority, refresh } = useAppSettings();
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();

  const mut = useMutation({
    mutationFn: (value: LayoutPriority) => saveSetting({ data: { key: "layout_priority", value } }),
    onSuccess: async () => { await refresh(); qc.invalidateQueries({ queryKey: ["admin-settings"] }); toast.success("Layout updated"); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const opts: { id: LayoutPriority; label: string; desc: string; icon: typeof MessageSquare }[] = [
    { id: "chatrooms_first", label: "Chatrooms first", desc: "Home opens chatrooms. Feed lives in the secondary tab.", icon: MessageSquare },
    { id: "feed_first",      label: "Feed first",      desc: "Home opens social feed. Chatrooms in the secondary tab.", icon: Newspaper },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Social Layout" description="Choose what users see first across web and mobile." />

      <Card>
        <CardContent className="space-y-4 p-5">
          <Label>Primary layout</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            {opts.map((o) => {
              const I = o.icon;
              const active = layoutPriority === o.id;
              return (
                <button
                  key={o.id}
                  onClick={() => mut.mutate(o.id)}
                  disabled={mut.isPending}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition ${
                    active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-background hover:border-primary/40"
                  }`}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary"><I className="h-5 w-5" /></div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{o.label}{active && <span className="ml-2 text-[10px] font-medium text-primary">ACTIVE</span>}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{o.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card><CardContent className="flex items-center gap-3 p-4"><Sidebar className="h-5 w-5 text-muted-foreground" /><div><div className="text-sm font-medium">Sidebar priority</div><div className="text-xs text-muted-foreground">Follows primary layout.</div></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Smartphone className="h-5 w-5 text-muted-foreground" /><div><div className="text-sm font-medium">Mobile nav order</div><div className="text-xs text-muted-foreground">Auto-derived from primary layout.</div></div></CardContent></Card>
      </div>
    </div>
  );
}
