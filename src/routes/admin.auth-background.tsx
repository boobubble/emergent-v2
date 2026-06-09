import { createFileRoute } from "@tanstack/react-router";
import { Save, Sparkles } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { AUTH_BG_DEFAULTS, AUTH_BG_SETTINGS_KEY, type AuthBackgroundConfig } from "@/lib/auth-bg-config";

export const Route = createFileRoute("/admin/auth-background")({
  component: AuthBackgroundPage,
});

function AuthBackgroundPage() {
  const { values, patch, save, saving } = useAdminSetting<AuthBackgroundConfig>(
    AUTH_BG_SETTINGS_KEY,
    AUTH_BG_DEFAULTS,
  );

  // Single master switch: blurred live chatroom in the background, or plain background.
  const liveChatBlur = values.enabled && values.blur && values.showChat;
  const setLiveChatBlur = (on: boolean) => {
    patch({
      enabled: on,
      blur: on,
      showChat: on,
      // Hide everything else when this single toggle drives the screen.
      showStats: false,
      showFeed: false,
    });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Login Background"
        description="Toggle the blurred live chatroom behind the login / signup screen."
        actions={
          <Button onClick={save} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-semibold">Live Chatroom Blur Background</div>
              <div className="text-xs text-muted-foreground">
                When ON, a frosted-glass live chatroom preview is shown behind the auth card.
                When OFF, the auth screen uses a plain background.
              </div>
            </div>
            <AdminToggle checked={liveChatBlur} onCheckedChange={setLiveChatBlur} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
