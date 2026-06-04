import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ACCENTS, useAccent } from "@/lib/use-accent";
import { useThemeMode, type ThemeMode } from "@/lib/use-theme-mode";
import { Sun, Moon, Monitor, Upload, Image as ImageIcon, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/appearance")({
  component: Appearance,
});

interface BrandingValues {
  logo_light: string;
  logo_dark: string;
  favicon_light: string;
  favicon_dark: string;
  feed_light: string;
  feed_dark: string;
  chat_light: string;
  chat_dark: string;
}

const BRAND_DEFAULTS: BrandingValues = {
  logo_light: "", logo_dark: "",
  favicon_light: "", favicon_dark: "",
  feed_light: "", feed_dark: "",
  chat_light: "", chat_dark: "",
};

const SIGNED_TTL = 60 * 60 * 24 * 365 * 10; // 10 years

function Appearance() {
  const { accent, setAccent } = useAccent();
  const { mode, setMode } = useThemeMode();

  const modes: { id: ThemeMode; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <div className="space-y-5">
      <AdminPageHeader title="Appearance" description="Theme mode, accent color, and brand assets." />

      <Card>
        <CardContent className="space-y-4 p-5">
          <Label>Theme mode</Label>
          <div className="grid grid-cols-3 gap-2 sm:max-w-sm">
            {modes.map((m) => {
              const I = m.icon;
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition ${
                    active ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <I className="h-4 w-4" />
                  {m.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <Label>Accent color</Label>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ACCENTS.map((a) => {
              const active = accent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-[11px] transition ${
                    active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="h-8 w-8 rounded-full" style={{ background: a.gradient }} />
                  <span className="truncate">{a.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <BrandAssetsCard />
    </div>
  );
}

function BrandAssetsCard() {
  const { values, patch, save, saving } = useAdminSetting<BrandingValues>("branding", BRAND_DEFAULTS);

  const groups: { title: string; description: string; key: keyof BrandingValues extends string ? "logo" | "favicon" | "feed" | "chat" : never; hint: string }[] = [
    { title: "Main Logo", description: "Shown across header and auth screens.", key: "logo", hint: "SVG or PNG, up to 2MB" },
    { title: "Favicon", description: "Shown in the browser tab.", key: "favicon", hint: "32×32 PNG or ICO" },
    { title: "Feed Page Logo", description: "Shown in the top bar of the Feed.", key: "feed", hint: "Square PNG/SVG works best" },
    { title: "Chatroom Logo", description: "Shown in the chat sidebar.", key: "chat", hint: "Square PNG/SVG works best" },
  ];

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <Label>Brand assets</Label>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Saving</> : "Save changes"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Upload separate variants for light and dark themes. The right variant is chosen automatically based on the active theme.
        </p>

        <div className="space-y-4">
          {groups.map((g) => (
            <div key={g.key} className="rounded-xl border border-border bg-background/40 p-4">
              <div className="mb-3">
                <div className="text-sm font-semibold">{g.title}</div>
                <div className="text-xs text-muted-foreground">{g.description}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <UploadSlot
                  theme="light"
                  slotKey={g.key}
                  value={values[`${g.key}_light` as keyof BrandingValues]}
                  hint={g.hint}
                  onChange={(url) => patch({ [`${g.key}_light`]: url } as Partial<BrandingValues>)}
                />
                <UploadSlot
                  theme="dark"
                  slotKey={g.key}
                  value={values[`${g.key}_dark` as keyof BrandingValues]}
                  hint={g.hint}
                  onChange={(url) => patch({ [`${g.key}_dark`]: url } as Partial<BrandingValues>)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UploadSlot({ theme, slotKey, value, hint, onChange }:
  { theme: "light" | "dark"; slotKey: string; value: string; hint: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large (max 2MB)");
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${slotKey}/${theme}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("brand-assets")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: signed, error: sErr } = await supabase.storage
        .from("brand-assets")
        .createSignedUrl(path, SIGNED_TTL);
      if (sErr || !signed) throw sErr ?? new Error("Failed to sign URL");
      onChange(signed.signedUrl);
      toast.success(`Uploaded ${theme} ${slotKey}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/20 p-3">
      <div
        className={`grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-md border ${theme === "dark" ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"}`}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{theme} theme</div>
        <div className="truncate text-[11px] text-muted-foreground">{value ? "Uploaded" : hint}</div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon,image/vnd.microsoft.icon"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
      />
      <Button variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()} className="gap-1.5">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        {value ? "Replace" : "Upload"}
      </Button>
      {value && (
        <Button variant="ghost" size="icon" disabled={busy} onClick={() => onChange("")} title="Remove">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}
