import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getAllSettings, updateSetting } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/general")({
  component: GeneralSettings,
});

interface GeneralValues {
  site_name: string;
  site_tagline: string;
  site_description: string;
  signups_open: boolean;
  maintenance_mode: boolean;
}

const DEFAULTS: GeneralValues = {
  site_name: "My Community",
  site_tagline: "Realtime chatrooms & social",
  site_description: "",
  signups_open: true,
  maintenance_mode: false,
};

function GeneralSettings() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => fetchSettings({}) });
  const [values, setValues] = useState<GeneralValues>(DEFAULTS);

  useEffect(() => {
    if (!data) return;
    const g = (data.general as Partial<GeneralValues>) || {};
    setValues({ ...DEFAULTS, ...g });
  }, [data]);

  const mut = useMutation({
    mutationFn: () => saveSetting({ data: { key: "general", value: values } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const set = <K extends keyof GeneralValues>(k: K, v: GeneralValues[K]) => setValues((s) => ({ ...s, [k]: v }));

  return (
    <div>
      <AdminPageHeader
        title="General"
        description="Basic site identity and global toggles."
        actions={<Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Saving…" : "Save changes"}</Button>}
      />
      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="site_name">Site name</Label>
              <Input id="site_name" value={values.site_name} onChange={(e) => set("site_name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="site_tagline">Tagline</Label>
              <Input id="site_tagline" value={values.site_tagline} onChange={(e) => set("site_tagline", e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="site_description">Description</Label>
            <Textarea id="site_description" rows={3} value={values.site_description} onChange={(e) => set("site_description", e.target.value)} />
          </div>
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
            <ToggleRow label="Open signups" desc="Allow new users to create accounts." value={values.signups_open} onChange={(v) => set("signups_open", v)} />
            <ToggleRow label="Maintenance mode" desc="Hide the app from non-admins." value={values.maintenance_mode} onChange={(v) => set("maintenance_mode", v)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </label>
  );
}
