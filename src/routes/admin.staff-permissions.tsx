import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { DEFAULT_STAFF_PERMISSIONS } from "@/lib/use-staff-permissions";
import { Save } from "lucide-react";

export const Route = createFileRoute("/admin/staff-permissions")({
  component: StaffPermissionsPage,
});

function StaffPermissionsPage() {
  const { values, set, save, saving } = useAdminSetting("staff_permissions", DEFAULT_STAFF_PERMISSIONS);

  const rows: { key: keyof typeof DEFAULT_STAFF_PERMISSIONS; label: string; desc: string }[] = [
    { key: "mod_can_kick",     label: "Moderators can Kick",            desc: "Allow moderators to kick users from chatrooms." },
    { key: "mod_can_mute",     label: "Moderators can Mute",            desc: "Allow moderators to mute users in chatrooms." },
    { key: "mod_can_ban",      label: "Moderators can Ban",             desc: "Allow moderators to ban users from the platform." },
    { key: "mod_can_announce", label: "Moderators can edit Announcements", desc: "Allow approved moderators to create or edit scheduled chat announcements." },

  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Staff Permissions"
        description="Toggle moderator powers in chatrooms. Admins and super admins always retain full access."
      />
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {rows.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <div className="text-sm font-semibold">{r.label}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
              <Switch checked={!!values[r.key]} onCheckedChange={(v) => set(r.key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
