import { createFileRoute } from "@tanstack/react-router";
import { Save, Sparkles } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { AUTH_BG_DEFAULTS, AUTH_BG_SETTINGS_KEY, type AuthBackgroundConfig } from "@/lib/auth-bg-config";

export const Route = createFileRoute("/admin/auth-background")({
  component: AuthBackgroundPage,
});

function Row({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <AdminToggle checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </div>
  );
}

function AuthBackgroundPage() {
  const { values, set, save, saving } = useAdminSetting<AuthBackgroundConfig>(
    AUTH_BG_SETTINGS_KEY,
    AUTH_BG_DEFAULTS,
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Login Background"
        description="Show a live, view-only preview of your community behind the Login / Signup screen. Only public content is exposed."
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
            <div>
              <div className="text-sm font-semibold">Live Community Background</div>
              <div className="text-xs text-muted-foreground">
                Master switch. When off the auth screen renders on a plain background.
              </div>
            </div>
          </div>
          <Row
            label="Enable Live Community Background"
            description="Show animated public chat and feed snippets behind the auth card."
            checked={values.enabled}
            onChange={(v) => set("enabled", v)}
          />
          <Row
            label="Enable Background Blur"
            description="Apply frosted-glass blur to the login/signup card."
            checked={values.blur}
            disabled={!values.enabled}
            onChange={(v) => set("blur", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="text-sm font-semibold">What to show</div>
          <Row
            label="Show Community Statistics"
            description="Online members, total members, posts today, active rooms."
            checked={values.showStats}
            disabled={!values.enabled}
            onChange={(v) => set("showStats", v)}
          />
          <Row
            label="Show Public Feed Preview"
            description="Scrolling preview of recent public posts."
            checked={values.showFeed}
            disabled={!values.enabled}
            onChange={(v) => set("showFeed", v)}
          />
          <Row
            label="Show Public Chatroom Preview"
            description="Scrolling preview of recent lobby messages."
            checked={values.showChat}
            disabled={!values.enabled}
            onChange={(v) => set("showChat", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <Label htmlFor="auth-bg-headline" className="text-xs font-semibold uppercase text-muted-foreground">
            Headline (optional)
          </Label>
          <Input
            id="auth-bg-headline"
            value={values.headline}
            maxLength={80}
            onChange={(e) => set("headline", e.target.value)}
            placeholder="Live from the community"
          />
        </CardContent>
      </Card>
    </div>
  );
}
