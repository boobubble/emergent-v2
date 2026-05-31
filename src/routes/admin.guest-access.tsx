import { createFileRoute } from "@tanstack/react-router";
import { Save, UserCircle2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSetting } from "@/lib/use-admin-setting";
import {
  GUEST_ACCESS_DEFAULTS,
  GUEST_PERMISSION_META,
  type GuestAccessConfig,
  type GuestPermissionKey,
} from "@/lib/guest-config";

export const Route = createFileRoute("/admin/guest-access")({
  component: GuestAccessPage,
});

const GROUP_LABEL: Record<"browse" | "interact" | "rewards" | "premium", string> = {
  browse:   "Browse (read-only)",
  interact: "Interact (write actions)",
  rewards:  "Rewards & Progression",
  premium:  "Premium / Restricted",
};

function GuestAccessPage() {
  const { values, set, patch, save, saving } =
    useAdminSetting<GuestAccessConfig>("guest_access", GUEST_ACCESS_DEFAULTS);

  const setPerm = (key: GuestPermissionKey, v: boolean) =>
    patch({ permissions: { ...values.permissions, [key]: v } });

  const groups = (["browse", "interact", "rewards", "premium"] as const).map((g) => ({
    key: g,
    label: GROUP_LABEL[g],
    perms: (Object.keys(GUEST_PERMISSION_META) as GuestPermissionKey[]).filter(
      (k) => GUEST_PERMISSION_META[k].group === g,
    ),
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Guest Access"
        description="Optional Guest Mode for unauthenticated visitors. Extends the existing auth system; never replaces it."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      {/* Master switches */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Enable Guest Access</p>
              <p className="text-xs text-muted-foreground">
                Master switch. When off, the "Continue as guest" option is hidden.
              </p>
            </div>
            <AdminToggle checked={values.enabled} onCheckedChange={(v) => set("enabled", v)} />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">Auto Guest Login</p>
              <p className="text-xs text-muted-foreground">
                Automatically create a guest session for visitors who land while signed out.
              </p>
            </div>
            <AdminToggle
              checked={values.autoLogin}
              disabled={!values.enabled}
              onCheckedChange={(v) => set("autoLogin", v)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">Show Upgrade Prompt</p>
              <p className="text-xs text-muted-foreground">
                Encourage guests to register with an inline banner.
              </p>
            </div>
            <AdminToggle
              checked={values.showUpgradePrompt}
              disabled={!values.enabled}
              onCheckedChange={(v) => set("showUpgradePrompt", v)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">Preserve On Upgrade</p>
              <p className="text-xs text-muted-foreground">
                When a guest creates an account, carry over their preferences and recent activity (when supported).
              </p>
            </div>
            <AdminToggle
              checked={values.preserveOnUpgrade}
              disabled={!values.enabled}
              onCheckedChange={(v) => set("preserveOnUpgrade", v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs">Guest Username Prefix</Label>
              <Input
                value={values.usernamePrefix}
                onChange={(e) => set("usernamePrefix", e.target.value.slice(0, 12))}
                placeholder="guest"
                disabled={!values.enabled}
                className="mt-1"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Used when generating display names like <code>guest-xy12</code>.
              </p>
            </div>
            <div>
              <Label className="text-xs">Session Duration (minutes)</Label>
              <Input
                type="number"
                min={0}
                max={1440}
                value={values.sessionDurationMin}
                onChange={(e) => set("sessionDurationMin", Math.max(0, Number(e.target.value) || 0))}
                disabled={!values.enabled}
                className="mt-1"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                0 = until the tab closes (matches existing guest cleanup behaviour).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions matrix */}
      <Card>
        <CardContent className="space-y-5 p-5">
          <div>
            <h2 className="text-base font-semibold">Guest Permissions</h2>
            <p className="text-xs text-muted-foreground">
              Toggle exactly what guests are allowed to do. Defaults are read-only.
            </p>
          </div>

          {groups.map((g) => (
            <div key={g.key} className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {g.label}
              </p>
              <div className="divide-y divide-border rounded-lg border border-border">
                {g.perms.map((k) => {
                  const meta = GUEST_PERMISSION_META[k];
                  return (
                    <div key={k} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{meta.label}</p>
                        <p className="text-xs text-muted-foreground">{meta.description}</p>
                      </div>
                      <AdminToggle
                        size="sm"
                        checked={Boolean(values.permissions[k])}
                        disabled={!values.enabled}
                        onCheckedChange={(v) => setPerm(k, v)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
