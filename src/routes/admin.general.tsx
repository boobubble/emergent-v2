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
import { AdminToggle } from "@/components/admin/AdminToggle";
import { getAllSettings, updateSetting } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/general")({
  component: GeneralSettings,
});

type DmDeleteRole = "user" | "moderator" | "admin" | "super_admin";

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

const DM_DELETE_DEFAULT: { min_role: DmDeleteRole } = { min_role: "user" };


function GeneralSettings() {
  const fetchSettings = useServerFn(getAllSettings);
  const saveSetting = useServerFn(updateSetting);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => fetchSettings({}) });
  const [values, setValues] = useState<GeneralValues>(DEFAULTS);
  const [dmDeleteRole, setDmDeleteRole] = useState<DmDeleteRole>(DM_DELETE_DEFAULT.min_role);

  useEffect(() => {
    if (!data) return;
    const g = (data.general as Partial<GeneralValues>) || {};
    setValues({ ...DEFAULTS, ...g });
    const dd = (data.dm_chat_delete as { min_role?: DmDeleteRole } | undefined)?.min_role;
    if (dd === "user" || dd === "moderator" || dd === "admin" || dd === "super_admin") {
      setDmDeleteRole(dd);
    }
  }, [data]);

  const mut = useMutation({
    mutationFn: () => saveSetting({ data: { key: "general", value: values } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed to save"),
  });

  const dmMut = useMutation({
    mutationFn: () => saveSetting({ data: { key: "dm_chat_delete", value: { min_role: dmDeleteRole } } }),
    onSuccess: () => { toast.success("DM permission saved"); qc.invalidateQueries({ queryKey: ["admin-settings"] }); },
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

      <Card className="mt-5">
        <CardContent className="space-y-4 p-5">
          <div>
            <div className="text-sm font-bold">DM chat deletion</div>
            <div className="text-xs text-muted-foreground">Minimum rank required to delete an entire direct-message conversation (removes messages for both sides).</div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="dm_delete_role" className="text-xs">Minimum rank</Label>
            <select
              id="dm_delete_role"
              value={dmDeleteRole}
              onChange={(e) => setDmDeleteRole(e.target.value as DmDeleteRole)}
              className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
            >
              <option value="user">User (everyone)</option>
              <option value="moderator">Moderator+</option>
              <option value="admin">Admin+</option>
              <option value="super_admin">Super Admin only</option>
            </select>
            <Button size="sm" onClick={() => dmMut.mutate()} disabled={dmMut.isPending}>
              {dmMut.isPending ? "Saving…" : "Save"}
            </Button>
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
      <AdminToggle checked={value} onCheckedChange={onChange} />
    </label>
  );
}
