import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACCENTS, useAccent } from "@/lib/use-accent";
import { useThemeMode, type ThemeMode } from "@/lib/use-theme-mode";
import { Sun, Moon, Monitor, Upload, Image as ImageIcon, Trash2, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { useChat } from "@/lib/chat-store";
import { toast } from "sonner";
import type { BrandingMap, RoomBranding, BrandSizes, BrandFit, BrandPadding, BrandSlot } from "@/components/BrandMark";

export const Route = createFileRoute("/admin/appearance")({
  component: Appearance,
});

const BRAND_DEFAULTS: BrandingMap = {
  logo_light: "", logo_dark: "",
  favicon_light: "", favicon_dark: "",
  feed_light: "", feed_dark: "",
  chat_light: "", chat_dark: "",
  sizes: {
    logo: { w: 160, h: 48 },
    favicon: { w: 32, h: 32 },
    feed: { w: 140, h: 40 },
    chat: { w: 120, h: 36 },
  },
  rooms: {},
};

const SIGNED_TTL = 60 * 60 * 24 * 365 * 10;

const GLOBAL_GROUPS = [
  { title: "Main Logo", description: "Shown across header and auth screens.", key: "logo" as const, hint: "SVG or PNG, up to 2MB" },
  { title: "Favicon", description: "Browser tab icon (fallback when no room favicon).", key: "favicon" as const, hint: "32×32 PNG or ICO" },
  { title: "Feed Page Logo", description: "Top bar of the Feed.", key: "feed" as const, hint: "Square PNG/SVG" },
  { title: "Chatroom Logo", description: "Sidebar logo (fallback when room has none).", key: "chat" as const, hint: "Square PNG/SVG" },
];

const ROOM_GROUPS = [
  { title: "Chat Logo", key: "chat" as const, hint: "Shown in this room's header" },
  { title: "Favicon", key: "favicon" as const, hint: "Browser tab icon while in this room" },
  { title: "Feed Banner", key: "feed" as const, hint: "Optional per-room feed branding" },
];

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
      <AdminPageHeader title="Appearance" description="Theme mode, accent color, brand assets, and per-room branding." />

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
  const { values, patch, save, saving } = useAdminSetting<BrandingMap>("branding", BRAND_DEFAULTS);
  const sizes: BrandSizes = values.sizes ?? {};
  const rooms = values.rooms ?? {};

  const { state } = useChat();
  const availableRooms = useMemo(
    () => Object.values(state.rooms || {}).map((r) => ({ id: r.id, name: r.name })),
    [state.rooms]
  );
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  function getCfg(key: keyof BrandSizes): { w?: number; h?: number; fit?: BrandFit; lock?: boolean; pad?: BrandPadding } {
    const v = sizes[key];
    if (v == null) return {};
    if (typeof v === "number") return { w: v, h: v };
    return v;
  }
  function setWH(key: keyof BrandSizes, axis: "w" | "h", n: number) {
    const cur = getCfg(key);
    patch({ sizes: { ...sizes, [key]: { ...cur, [axis]: n || undefined } } });
  }
  function setFit(key: keyof BrandSizes, fit: BrandFit) {
    const cur = getCfg(key);
    patch({ sizes: { ...sizes, [key]: { ...cur, fit } } });
  }
  function setLock(key: keyof BrandSizes, lock: boolean) {
    const cur = getCfg(key);
    patch({ sizes: { ...sizes, [key]: { ...cur, lock } } });
  }
  function setPad(key: keyof BrandSizes, side: keyof BrandPadding, n: number) {
    const cur = getCfg(key);
    const nextPad = { ...(cur.pad ?? {}), [side]: Number.isFinite(n) && n > 0 ? n : undefined };
    patch({ sizes: { ...sizes, [key]: { ...cur, pad: nextPad } } });
  }
  // Backward-compat shim for any in-file refs
  const getWH = getCfg;

  function setRoom(roomId: string, partial: Partial<RoomBranding>) {
    const next = { ...(rooms[roomId] ?? {}), ...partial };
    patch({ rooms: { ...rooms, [roomId]: next } });
  }

  function removeRoom(roomId: string) {
    const next = { ...rooms };
    delete next[roomId];
    patch({ rooms: next });
  }

  const configuredRoomIds = Object.keys(rooms);

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
          Upload light/dark variants for each section. The correct variant is chosen automatically based on the active theme. Sizes apply uniformly to every place that section renders.
        </p>

        {/* Global section sizes */}
        <div className="rounded-xl border border-border bg-background/40 p-4">
          <div className="mb-1 text-sm font-semibold">Section sizes (px)</div>
          <div className="mb-3 text-xs text-muted-foreground">Set width × height for each slot. Enable <b>Lock</b> to keep the original layout — the logo fits inside the existing box and never shifts the UI, regardless of upload dimensions.</div>
          <div className="grid gap-3 sm:grid-cols-2">
            {GLOBAL_GROUPS.map((g) => {
              const cfg = getCfg(g.key);
              const lightUrl = (values[`${g.key}_light` as keyof BrandingMap] as string) || "";
              const darkUrl = (values[`${g.key}_dark` as keyof BrandingMap] as string) || "";
              return (
                <div key={g.key} className="space-y-1.5">
                  <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{g.title}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number" min={8} max={1024}
                      value={cfg.w ?? ""}
                      placeholder="W"
                      disabled={!!cfg.lock}
                      onChange={(e) => setWH(g.key, "w", Number(e.target.value))}
                    />
                    <span className="text-xs text-muted-foreground">×</span>
                    <Input
                      type="number" min={8} max={1024}
                      value={cfg.h ?? ""}
                      placeholder="H"
                      disabled={!!cfg.lock}
                      onChange={(e) => setWH(g.key, "h", Number(e.target.value))}
                    />
                    <Select value={cfg.fit ?? "contain"} onValueChange={(v) => setFit(g.key, v as BrandFit)}>
                      <SelectTrigger className="h-9 w-[110px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="cover">Cover (crop)</SelectItem>
                        <SelectItem value="fill">Stretch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 text-[11px] text-muted-foreground">
                    <input
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-primary"
                      checked={!!cfg.lock}
                      onChange={(e) => setLock(g.key, e.target.checked)}
                    />
                    Lock to layout (don't change UI — fit logo inside existing slot)
                  </label>

                  {/* Padding inputs */}
                  <div className="pt-1">
                    <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Padding (px)</div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(["t", "r", "b", "l"] as const).map((side) => (
                        <div key={side} className="flex items-center gap-1">
                          <span className="w-3 text-[10px] uppercase text-muted-foreground">{side}</span>
                          <Input
                            type="number" min={0} max={128}
                            value={cfg.pad?.[side] ?? ""}
                            placeholder="0"
                            className="h-8 px-1.5 text-xs"
                            onChange={(e) => setPad(g.key, side, Number(e.target.value))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live preview */}
                  <LivePreview
                    label={cfg.lock ? "Preview (lock-to-layout)" : "Live preview"}
                    cfg={cfg}
                    lightUrl={lightUrl}
                    darkUrl={darkUrl}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-page brand text */}
        <div className="rounded-xl border border-border bg-background/40 p-4">
          <div className="mb-1 text-sm font-semibold">Brand text (per page)</div>
          <div className="mb-3 text-xs text-muted-foreground">
            Custom wordmark text for each page. Automatically hidden when a logo image is uploaded for the same section.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {([
              { key: "logo", label: "Header / Auth & Welcome" },
              { key: "feed", label: "Feed page" },
              { key: "chat", label: "Chat sidebar" },
            ] as const).map((t) => (
              <div key={t.key} className="space-y-1.5">
                <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{t.label}</Label>
                <Input
                  value={values.texts?.[t.key] ?? ""}
                  placeholder="e.g. Palrgo"
                  maxLength={32}
                  onChange={(e) => patch({ texts: { ...(values.texts ?? {}), [t.key]: e.target.value } })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Global brand assets */}
        <div className="space-y-3">
          {GLOBAL_GROUPS.map((g) => (
            <div key={g.key} className="rounded-xl border border-border bg-background/40 p-4">
              <div className="mb-3">
                <div className="text-sm font-semibold">{g.title}</div>
                <div className="text-xs text-muted-foreground">{g.description}</div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <UploadSlot
                  theme="light"
                  scope="global"
                  slotKey={g.key}
                  value={(values[`${g.key}_light` as keyof BrandingMap] as string) || ""}
                  hint={g.hint}
                  onChange={(url) => patch({ [`${g.key}_light`]: url } as Partial<BrandingMap>)}
                />
                <UploadSlot
                  theme="dark"
                  scope="global"
                  slotKey={g.key}
                  value={(values[`${g.key}_dark` as keyof BrandingMap] as string) || ""}
                  hint={g.hint}
                  onChange={(url) => patch({ [`${g.key}_dark`]: url } as Partial<BrandingMap>)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Per-room branding */}
        <div className="rounded-xl border border-border bg-background/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Per-room branding</div>
              <div className="text-xs text-muted-foreground">Override logos and favicon per chat room (space).</div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger className="h-9 w-44 text-xs"><SelectValue placeholder="Select room…" /></SelectTrigger>
                <SelectContent>
                  {availableRooms.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground">No rooms loaded.</div>
                  )}
                  {availableRooms.map((r) => (
                    <SelectItem key={r.id} value={r.id}>#{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={!selectedRoom || !!rooms[selectedRoom]}
                onClick={() => { if (selectedRoom && !rooms[selectedRoom]) setRoom(selectedRoom, {}); }}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />Add
              </Button>
            </div>
          </div>

          {configuredRoomIds.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
              No room overrides yet. Pick a room above and click Add.
            </div>
          ) : (
            <div className="space-y-4">
              {configuredRoomIds.map((rid) => {
                const meta = availableRooms.find((r) => r.id === rid);
                return (
                  <div key={rid} className="rounded-lg border border-border bg-background p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">#{meta?.name ?? rid}</div>
                        <div className="truncate text-[10px] text-muted-foreground">{rid}</div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => removeRoom(rid)} title="Remove room overrides">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    {ROOM_GROUPS.map((rg) => (
                      <div key={rg.key} className="mt-2">
                        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{rg.title}</div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <UploadSlot
                            theme="light"
                            scope={`room/${rid}`}
                            slotKey={rg.key}
                            value={rooms[rid]?.[`${rg.key}_light` as keyof RoomBranding] || ""}
                            hint={rg.hint}
                            onChange={(url) => setRoom(rid, { [`${rg.key}_light`]: url } as Partial<RoomBranding>)}
                          />
                          <UploadSlot
                            theme="dark"
                            scope={`room/${rid}`}
                            slotKey={rg.key}
                            value={rooms[rid]?.[`${rg.key}_dark` as keyof RoomBranding] || ""}
                            hint={rg.hint}
                            onChange={(url) => setRoom(rid, { [`${rg.key}_dark`]: url } as Partial<RoomBranding>)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UploadSlot({ theme, scope, slotKey, value, hint, onChange }:
  { theme: "light" | "dark"; scope: string; slotKey: string; value: string; hint: string; onChange: (url: string) => void }) {
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
      const safeScope = scope.replace(/[^a-zA-Z0-9/_-]/g, "_");
      const path = `${safeScope}/${slotKey}/${theme}-${Date.now()}.${ext}`;
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

function LivePreview({
  label,
  cfg,
  lightUrl,
  darkUrl,
}: {
  label: string;
  cfg: { w?: number; h?: number; fit?: BrandFit; lock?: boolean; pad?: BrandPadding };
  lightUrl: string;
  darkUrl: string;
}) {
  const fit: BrandFit = cfg.fit ?? "contain";
  const padStyle: React.CSSProperties = {
    paddingTop: cfg.pad?.t || undefined,
    paddingRight: cfg.pad?.r || undefined,
    paddingBottom: cfg.pad?.b || undefined,
    paddingLeft: cfg.pad?.l || undefined,
    boxSizing: "border-box",
  };
  // Simulated slot container — represents the "existing" layout box.
  const SLOT_W = 180;
  const SLOT_H = 56;

  function Tile({ theme, url }: { theme: "light" | "dark"; url: string }) {
    const bg = theme === "dark" ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-200";
    const imgStyle: React.CSSProperties = cfg.lock
      ? { width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%", objectFit: fit, objectPosition: "center", ...padStyle }
      : { width: cfg.w, height: cfg.h, maxWidth: "100%", objectFit: fit, objectPosition: "center", ...padStyle };
    return (
      <div className="flex-1 space-y-1">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{theme}</div>
        <div
          className={`relative grid place-items-center overflow-hidden rounded-md border ${bg}`}
          style={{ width: SLOT_W, height: SLOT_H }}
        >
          {/* dashed slot outline shown when lock is on so user can see the fixed bounds */}
          {cfg.lock && (
            <div className="pointer-events-none absolute inset-0 rounded-md border border-dashed border-primary/40" />
          )}
          {url ? (
            <img src={url} alt="" style={imgStyle} />
          ) : (
            <span className="text-[10px] text-muted-foreground">no {theme} logo</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-md border border-border bg-muted/10 p-2">
      <div className="mb-1.5 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-[10px] text-muted-foreground">
          slot {SLOT_W}×{SLOT_H} · {cfg.lock ? "locked" : `${cfg.w ?? "?"}×${cfg.h ?? "?"}`} · {fit}
        </div>
      </div>
      <div className="flex gap-2">
        <Tile theme="light" url={lightUrl} />
        <Tile theme="dark" url={darkUrl} />
      </div>
    </div>
  );
}
