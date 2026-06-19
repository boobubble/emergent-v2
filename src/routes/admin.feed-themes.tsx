import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { FeedThemeRow, UnlockMode } from "@/lib/feed-themes";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/feed-themes")({
  component: AdminFeedThemesPage,
});

const sb = supabase as any;

function AdminFeedThemesPage() {
  const [rows, setRows] = useState<FeedThemeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantUser, setGrantUser] = useState("");
  const [grantTheme, setGrantTheme] = useState("");
  const [grantDays, setGrantDays] = useState<string>("");
  const [brandLabels, setBrandLabels] = useState<Record<string, string>>({});

  const refresh = async () => {
    setLoading(true);
    const [{ data, error }, { data: settingRow }] = await Promise.all([
      sb.from("feed_themes").select("*").order("sort_order", { ascending: true }),
      sb.from("app_settings").select("value").eq("key", "theme_brand_labels").maybeSingle(),
    ]);
    if (error) toast.error(error.message);
    setRows((data ?? []) as FeedThemeRow[]);
    const v = settingRow?.value;
    setBrandLabels((v && typeof v === "object" && !Array.isArray(v) ? v : {}) as Record<string, string>);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const saveBrandLabel = async (themeKey: string, label: string) => {
    const next = { ...brandLabels };
    const trimmed = label.trim();
    if (trimmed) next[themeKey] = trimmed;
    else delete next[themeKey];
    const { error } = await sb.from("app_settings").upsert({ key: "theme_brand_labels", value: next });
    if (error) return toast.error(error.message);
    setBrandLabels(next);
    toast.success("Brand label saved");
  };

  const update = async (id: string, patch: Partial<FeedThemeRow>) => {
    const { error } = await sb.from("feed_themes").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    refresh();
  };

  const grant = async () => {
    if (!grantUser || !grantTheme) {
      toast.error("User ID and theme are required");
      return;
    }
    const days = grantDays ? parseInt(grantDays, 10) : null;
    const { error } = await sb.rpc("admin_grant_feed_theme", {
      _user: grantUser,
      _theme_key: grantTheme,
      _days: days,
    });
    if (error) return toast.error(error.message);
    toast.success("Theme granted");
    setGrantUser("");
    setGrantTheme("");
    setGrantDays("");
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Feed Themes" description="Manage premium feed skins, pricing, and unlock modes." />

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="grid gap-3">
          {rows.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-[220px]">
                  <Label className="text-xs">Name</Label>
                  <Input
                    className="w-full"
                    defaultValue={t.name}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v && v !== t.name) update(t.id, { name: v });
                    }}
                  />
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">{t.theme_key}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="text-xs">Enabled</Label>
                  <Switch
                    checked={t.enabled}
                    onCheckedChange={(v) => update(t.id, { enabled: v })}
                  />
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
                  <Select
                    value={t.unlock_mode}
                    onValueChange={(v) => update(t.id, { unlock_mode: v as UnlockMode })}
                    disabled={t.is_default}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                      <SelectItem value="days_30">30 days</SelectItem>
                      <SelectItem value="days_7">7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[200px]">
                  <Label className="text-xs">Brand label (in-theme header/footer)</Label>
                  <Input
                    className="w-full"
                    defaultValue={brandLabels[t.theme_key] ?? ""}
                    placeholder={t.theme_key === "orkut_retro" ? "boobubble" : "(use theme default)"}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v !== (brandLabels[t.theme_key] ?? "")) saveBrandLabel(t.theme_key, v);
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4">
        <h2 className="mb-3 font-semibold">Grant theme to user</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[260px]">
            <Label className="text-xs">User ID</Label>
            <Input value={grantUser} onChange={(e) => setGrantUser(e.target.value)} placeholder="uuid…" />
          </div>
          <div className="min-w-[200px]">
            <Label className="text-xs">Theme</Label>
            <Select value={grantTheme} onValueChange={setGrantTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {rows.map((t) => (
                  <SelectItem key={t.theme_key} value={t.theme_key}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-28">
            <Label className="text-xs">Days (blank = lifetime)</Label>
            <Input
              type="number"
              value={grantDays}
              onChange={(e) => setGrantDays(e.target.value)}
              placeholder="30"
            />
          </div>
          <Button onClick={grant}>Grant</Button>
        </div>
      </Card>
    </div>
  );
}
