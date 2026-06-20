import { createFileRoute } from "@tanstack/react-router";
import { Save, UserPlus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { SIGNUP_ACCESS_DEFAULTS, type SignupAccessConfig } from "@/lib/signup-config";

export const Route = createFileRoute("/admin/signup-access")({
  component: SignupAccessPage,
});

function SignupAccessPage() {
  const { values, set, save, saving } =
    useAdminSetting<SignupAccessConfig>("signup_access", SIGNUP_ACCESS_DEFAULTS);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Sign-Up Access"
        description="Control whether new visitors can create accounts or continue as a guest."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <UserPlus className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Allow new sign-ups</p>
              <p className="text-xs text-muted-foreground">
                When off, the "Create account" option is hidden and signup attempts are rejected.
              </p>
            </div>
            <AdminToggle checked={values.signupEnabled} onCheckedChange={(v) => set("signupEnabled", v)} />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-semibold">Allow guest logins</p>
              <p className="text-xs text-muted-foreground">
                When off, "Continue as guest" is hidden and anonymous logins are blocked.
                You can also fine-tune guest permissions in Guest Access.
              </p>
            </div>
            <AdminToggle checked={values.guestEnabled} onCheckedChange={(v) => set("guestEnabled", v)} />
          </div>

          <div>
            <Label className="text-xs">Disabled message</Label>
            <Input
              value={values.disabledMessage}
              onChange={(e) => set("disabledMessage", e.target.value.slice(0, 240))}
              placeholder="New sign-ups are temporarily disabled."
              className="mt-1"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Shown to users when they try a disabled option.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
