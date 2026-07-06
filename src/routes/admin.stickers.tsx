import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Upload, ImageIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const Route = createFileRoute("/admin/stickers")({
  component: AdminStickersPage,
});

const sb = supabase as any;
const BUCKET = "stickers";
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB per sticker (keeps chat snappy)
const ACCEPT = "image/gif,image/webp,image/apng,image/png";
// Recommended target display size in chat & picker (px)
const TARGET_SIZE = 160;
// Signed URL lifetime — 10 years (Supabase allows arbitrarily long signed URLs)
const SIGNED_TTL = 60 * 60 * 24 * 365 * 10;

type Row = {
  id: string;
  name: string;
  pack: string;
  kind: "sticker" | "emoji";
  url: string;
  storage_path: string | null;
  mime: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

function readImageDimensions(file: File): Promise<{ w: number; h: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

function AdminStickersPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pack, setPack] = useState("Custom");
  const [kind, setKind] = useState<"sticker" | "emoji">("sticker");
  const [name, setName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await sb
      .from("custom_stickers")
      .select("*")
      .order("kind", { ascending: true })
      .order("pack", { ascending: true })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Pick an animated GIF, WebP, APNG, or PNG file first");
    if (!ACCEPT.split(",").includes(file.type)) {
      return toast.error("Unsupported file type. Use GIF, WebP, APNG, or PNG.");
    }
    if (file.size > MAX_BYTES) {
      return toast.error(`File too large. Max ${(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.`);
    }

    setUploading(true);
    try {
      const dims = await readImageDimensions(file);
      // Warn (don't block) if very off-target — helps keep sizes consistent
      if (dims && (dims.w > 1024 || dims.h > 1024)) {
        toast.warning(`Large source (${dims.w}×${dims.h}px). Chat will scale to ${TARGET_SIZE}px — consider a smaller export for faster load.`);
      }

      const ext = file.name.split(".").pop()?.toLowerCase() || "gif";
      const safeName = (name || file.name.replace(/\.[^.]+$/, "")).toLowerCase().replace(/[^a-z0-9_-]+/g, "-").slice(0, 40) || "sticker";
      const path = `${kind}/${pack.replace(/[^a-zA-Z0-9_-]+/g, "-")}/${Date.now()}-${safeName}.${ext}`;

      const up = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });
      if (up.error) throw up.error;

      const signed = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_TTL);
      if (signed.error || !signed.data?.signedUrl) throw signed.error || new Error("Could not sign URL");

      const { error: insErr } = await sb.from("custom_stickers").insert({
        name: name || safeName,
        pack,
        kind,
        url: signed.data.signedUrl,
        storage_path: path,
        mime: file.type,
        size_bytes: file.size,
        width: dims?.w ?? null,
        height: dims?.h ?? null,
        created_by: user?.id ?? null,
      });
      if (insErr) throw insErr;

      toast.success("Sticker uploaded");
      setName("");
      if (fileRef.current) fileRef.current.value = "";
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (row: Row) => {
    const { error } = await sb.from("custom_stickers").update({ is_active: !row.is_active }).eq("id", row.id);
    if (error) return toast.error(error.message);
    refresh();
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    if (row.storage_path) {
      await supabase.storage.from(BUCKET).remove([row.storage_path]);
    }
    const { error } = await sb.from("custom_stickers").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Stickers & Animated Emojis"
        description="Upload animated stickers (GIF / WebP / APNG) and animated emojis for everyone to use in chat. All items render at a consistent, perfect size."
      />

      <Card className="p-4 space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sticker">Sticker (large, ~{TARGET_SIZE}px)</SelectItem>
                <SelectItem value="emoji">Animated Emoji (small, 32px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Pack</Label>
            <Input value={pack} onChange={(e) => setPack(e.target.value)} placeholder="Custom" />
          </div>
          <div className="space-y-1.5">
            <Label>Name (optional)</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Auto from filename" />
          </div>
          <div className="space-y-1.5">
            <Label>File</Label>
            <Input ref={fileRef} type="file" accept={ACCEPT} />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Recommended: square, 256–512px source, under 1&nbsp;MB. Accepted: animated GIF, WebP, APNG, PNG. Max {(MAX_BYTES / 1024 / 1024).toFixed(0)} MB.
          </p>
          <Button onClick={handleUpload} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" /> {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-sm font-semibold">Library ({rows.length})</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-50" />
            No custom stickers or emojis yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
                <div
                  className="grid shrink-0 place-items-center overflow-hidden rounded-md bg-white/5"
                  style={{ width: r.kind === "emoji" ? 40 : 72, height: r.kind === "emoji" ? 40 : 72 }}
                >
                  <img
                    src={r.url}
                    alt={r.name}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {r.kind} · {r.pack} · {r.width && r.height ? `${r.width}×${r.height}` : "—"}
                    {r.size_bytes ? ` · ${(r.size_bytes / 1024).toFixed(0)} KB` : ""}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Switch checked={r.is_active} onCheckedChange={() => toggleActive(r)} />
                    <span className="text-[11px] text-muted-foreground">{r.is_active ? "Live" : "Hidden"}</span>
                    <Button variant="ghost" size="sm" onClick={() => remove(r)} className="ml-auto text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
