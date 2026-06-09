import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/maintenance")({ component: Page });

interface MaintenanceCfg { enabled: boolean; message: string }
const DEFAULTS: MaintenanceCfg = { enabled: false, message: "We'll be right back." };

function Page() {
  const { values, set, save, saving } = useAdminSetting<MaintenanceCfg>("maintenance", DEFAULTS);
  return (
    <div>
      <AdminPageHeader title="Maintenance Mode" description="Take the site offline for non-admins." actions={
        <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
      } />
      <div className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">Enable maintenance mode</div>
            <p className="text-sm text-muted-foreground">Admins can still access the app while this is on.</p>
          </div>
          <Switch checked={values.enabled} onCheckedChange={(v) => set("enabled", v)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="msg">Message shown to visitors</Label>
          <Textarea id="msg" rows={3} value={values.message} onChange={(e) => set("message", e.target.value)} />
        </div>
      </div>
    </div>
  );
}
