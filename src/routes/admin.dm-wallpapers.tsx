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
import { Trash2, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { WALLPAPER_CATEGORIES, wallpaperBackground, type DmWallpaper } from "@/lib/dm-wallpapers";

export const Route = createFileRoute("/admin/dm-wallpapers")({
  component: AdminDmWallpapersPage,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

function AdminDmWallpapersPage() {
  const [rows, setRows] = useState<DmWallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({
    wallpaper_key: "", name: "", category: "Romantic",
    kind: "gradient" as DmWallpaper["kind"],
    css_value: "", price_coins: 0, is_premium: false, is_featured: false,
  });

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await sb
      .from("dm_wallpapers").select("*").order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    setRows((data ?? []) as DmWallpaper[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const update = async (id: string, patch: Partial<DmWallpaper>) => {
    const { error } = await sb.from("dm_wallpapers").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this wallpaper? Users who own it will keep access, but it won't appear in the catalog.")) return;
    const { error } = await sb.from("dm_wallpapers").update({ enabled: false }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Disabled");
    refresh();
  };

  const create = async () => {
    if (!draft.wallpaper_key || !draft.name) return toast.error("Key and name are required");
    setCreating(true);
    const { error } = await sb.from("dm_wallpapers").insert({
      ...draft, enabled: true, sort_order: (rows[rows.length - 1]?.sort_order ?? 100) + 10,
    });
    setCreating(false);
    if (error) return toast.error(error.message);
    toast.success("Wallpaper added");
    setDraft({ wallpaper_key: "", name: "", category: "Romantic", kind: "gradient", css_value: "", price_coins: 0, is_premium: false, is_featured: false });
    refresh();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <AdminPageHeader title="DM Wallpapers" description="Catalog of private-chat wallpapers, prices, and premium flags." />

      <Card className="space-y-3 p-4">
        <h3 className="text-sm font-semibold">Add a new wallpaper</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Key (unique)</Label>
            <Input value={draft.wallpaper_key} onChange={(e) => setDraft((d) => ({ ...d, wallpaper_key: e.target.value }))} placeholder="grad-sunset" />
          </div>
          <div>
            <Label>Name</Label>
            <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Sunset Bloom" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={draft.category} onValueChange={(v) => setDraft((d) => ({ ...d, category: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {WALLPAPER_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Kind</Label>
            <Select value={draft.kind} onValueChange={(v) => setDraft((d) => ({ ...d, kind: v as DmWallpaper["kind"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid color</SelectItem>
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="image">Static image URL</SelectItem>
                <SelectItem value="animated">Animated (GIF/WebP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Label>{draft.kind === "solid" || draft.kind === "gradient" ? "CSS value" : "Asset URL"}</Label>
            <Input value={draft.css_value} onChange={(e) => setDraft((d) => ({ ...d, css_value: e.target.value }))}
              placeholder={draft.kind === "gradient" ? "linear-gradient(135deg,#ff8ab3,#ffb27a)" : draft.kind === "solid" ? "#0b1220" : "https://.../wall.webp"} />
          </div>
          <div>
            <Label>Price (coins)</Label>
            <Input type="number" min={0} value={draft.price_coins} onChange={(e) => setDraft((d) => ({ ...d, price_coins: Number(e.target.value) || 0 }))} />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm"><Switch checked={draft.is_premium} onCheckedChange={(v) => setDraft((d) => ({ ...d, is_premium: v }))} /> Premium</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={draft.is_featured} onCheckedChange={(v) => setDraft((d) => ({ ...d, is_featured: v }))} /> Featured</label>
          </div>
          <div className="flex items-end">
            <Button onClick={create} disabled={creating} className="w-full">
              <Plus className="mr-1 h-4 w-4" /> Add wallpaper
            </Button>
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading catalog…</p>
      ) : (
        <Card className="divide-y">
          {rows.map((w) => {
            let assetField: string | null = null;
            if (w.kind === "solid" || w.kind === "gradient") assetField = w.css_value;
            else assetField = w.asset_url;
            return (
            <div key={w.id} className="flex flex-wrap items-center gap-3 p-3">
              <div
                className="h-14 w-20 shrink-0 rounded-lg border"
                style={{ background: wallpaperBackground(w), backgroundSize: "cover" }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{w.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">{w.category}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">{w.kind}</span>
                  {!w.enabled && <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] uppercase text-destructive">Disabled</span>}
                </div>
                <div className="truncate text-xs text-muted-foreground">{assetField || "—"}</div>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} className="w-24" defaultValue={w.price_coins}
                  onBlur={(e) => update(w.id, { price_coins: Number(e.target.value) || 0 })} />
                <label className="flex items-center gap-1 text-xs"><Switch checked={w.is_premium} onCheckedChange={(v) => update(w.id, { is_premium: v })} /> Prem</label>
                <label className="flex items-center gap-1 text-xs"><Switch checked={w.is_featured} onCheckedChange={(v) => update(w.id, { is_featured: v })} /> Feat</label>
                <label className="flex items-center gap-1 text-xs"><Switch checked={w.enabled} onCheckedChange={(v) => update(w.id, { enabled: v })} /> On</label>
                <Button size="sm" variant="ghost" onClick={() => remove(w.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
