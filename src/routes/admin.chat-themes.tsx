import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { ChatThemeRow, UnlockMode } from "@/lib/chat-themes";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/chat-themes")({
  component: AdminChatThemesPage,
});

const sb = supabase as any;

function AdminChatThemesPage() {
  const [rows, setRows] = useState<ChatThemeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [override, setOverride] = useState<string>("");
  const [grantUser, setGrantUser] = useState("");
  const [grantTheme, setGrantTheme] = useState("");
  const [grantDays, setGrantDays] = useState<string>("");

  const refresh = async () => {
    setLoading(true);
    const [{ data, error }, { data: settingRow }] = await Promise.all([
      sb.from("chat_themes").select("*").order("sort_order", { ascending: true }),
      sb.from("app_settings").select("value").eq("key", "chat_theme_override").maybeSingle(),
    ]);
    if (error) toast.error(error.message);
    setRows((data ?? []) as ChatThemeRow[]);
    let raw = settingRow?.value;
    if (typeof raw === "string") raw = raw.replace(/"/g, "");
    setOverride(raw && raw !== "null" ? String(raw) : "");
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const update = async (id: string, patch: Partial<ChatThemeRow>) => {
    const { error } = await sb.from("chat_themes").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    refresh();
  };

  const saveOverride = async (next: string) => {
    setOverride(next);
    const value = next ? JSON.stringify(next) : JSON.stringify(null);
    const { error } = await sb.from("app_settings").upsert({ key: "chat_theme_override", value });
    if (error) return toast.error(error.message);
    toast.success(next ? `Forcing ${next} platform-wide` : "Override cleared");
  };

  const grant = async () => {
    if (!grantUser || !grantTheme) return toast.error("User ID and theme are required");
    const days = grantDays ? parseInt(grantDays, 10) : null;
    const { error } = await sb.rpc("admin_grant_chat_theme", { _user: grantUser, _theme_key: grantTheme, _days: days });
    if (error) return toast.error(error.message);
    toast.success("Theme granted");
    setGrantUser(""); setGrantTheme(""); setGrantDays("");
  };

  const revoke = async () => {
    if (!grantUser || !grantTheme) return toast.error("User ID and theme are required");
    const { error } = await sb.rpc("admin_revoke_chat_theme", { _user: grantUser, _theme_key: grantTheme });
    if (error) return toast.error(error.message);
    toast.success("Theme revoked");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Chatroom Themes" description="Manage premium chatroom skins, pricing, unlock modes, and platform-wide overrides for events." />

      <Card className="p-4">
        <h2 className="mb-3 font-semibold">Platform-wide theme override</h2>
        <p className="mb-3 text-xs text-muted-foreground">
          Force every user into a single theme (e.g. New Year, Festival, Anniversary). Leave blank to let each user use their own pick.
        </p>
        <div className="flex items-center gap-2">
          <Select value={override || "__none__"} onValueChange={(v) => saveOverride(v === "__none__" ? "" : v)}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="No override" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No override (use per-user theme)</SelectItem>
              {rows.map((t) => (
                <SelectItem key={t.theme_key} value={t.theme_key}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="grid gap-3">
          {rows.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[200px]">
                  <div className="font-semibold">{t.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">{t.theme_key}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Enabled</Label>
                  <Switch checked={t.enabled} onCheckedChange={(v) => update(t.id, { enabled: v })} />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    className="w-28"
                    defaultValue={t.price_coins}
                    disabled={t.is_default}
                    onBlur={(e) => {
                      const v = parseInt(e.target.value, 10);
                      if (!Number.isNaN(v) && v !== t.price_coins) update(t.id, { price_coins: v });
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Unlock</Label>
                  <Select value={t.unlock_mode} onValueChange={(v) => update(t.id, { unlock_mode: v as UnlockMode })} disabled={t.is_default}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                      <SelectItem value="days_30">30 days</SelectItem>
                      <SelectItem value="days_7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4">
        <h2 className="mb-3 font-semibold">Grant / revoke theme for a user</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[260px]">
            <Label className="text-xs">User ID</Label>
            <Input value={grantUser} onChange={(e) => setGrantUser(e.target.value)} placeholder="uuid…" />
          </div>
          <div className="min-w-[200px]">
            <Label className="text-xs">Theme</Label>
            <Select value={grantTheme} onValueChange={setGrantTheme}>
              <SelectTrigger><SelectValue placeholder="Select theme" /></SelectTrigger>
              <SelectContent>
                {rows.map((t) => (
                  <SelectItem key={t.theme_key} value={t.theme_key}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-28">
            <Label className="text-xs">Days (blank = lifetime)</Label>
            <Input type="number" value={grantDays} onChange={(e) => setGrantDays(e.target.value)} placeholder="30" />
          </div>
          <Button onClick={grant}>Grant</Button>
          <Button variant="outline" onClick={revoke}>Revoke</Button>
        </div>
      </Card>
    </div>
  );
}
