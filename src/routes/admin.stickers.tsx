import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Trash2, ImageIcon, Pencil, Download, ArrowLeft, Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  FALLBACK_CATEGORIES,
  MAX_BULK_FILES,
  ACCEPT_STICKER,
  sanitizePackName,
  slugToken,
  todayStamp,
  type StickerCategory,
  type StickerPack,
} from "@/lib/sticker-catalog";
import { uploadOneSticker } from "@/lib/sticker-upload";
import { downloadStickerZip } from "@/lib/sticker-zip";
import { STICKERS_BUCKET } from "@/lib/sticker-catalog";

export const Route = createFileRoute("/admin/stickers")({
  component: AdminStickersPage,
});

const sb = supabase as any;

type Row = {
  id: string;
  name: string;
  pack: string;
  pack_id: string | null;
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

type BulkItem = { file: File; status: "pending" | "uploading" | "ok" | "fail"; error?: string };

function AdminStickersPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<StickerCategory[]>(FALLBACK_CATEGORIES);
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [managePackId, setManagePackId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [renamePack, setRenamePack] = useState<StickerPack | null>(null);
  const [zipBusy, setZipBusy] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const [catRes, packRes, stickerRes] = await Promise.all([
      sb.from("sticker_categories").select("*").order("sort_order", { ascending: true }),
      sb.from("sticker_packs").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
      sb.from("custom_stickers").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
    ]);
    if (catRes.error) toast.error(catRes.error.message);
    if (packRes.error) toast.error(packRes.error.message);
    if (stickerRes.error) toast.error(stickerRes.error.message);
    if (catRes.data?.length) setCategories(catRes.data as StickerCategory[]);
    setPacks((packRes.data ?? []) as StickerPack[]);
    setRows((stickerRes.data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of rows) {
      if (!r.pack_id) continue;
      m.set(r.pack_id, (m.get(r.pack_id) ?? 0) + 1);
    }
    return m;
  }, [rows]);

  const managePack = packs.find((p) => p.id === managePackId) ?? null;
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? id;

  const runZip = async (sources: Row[], zipName: string, key: string) => {
    if (!sources.length) {
      toast.message("This pack has no stickers to download.");
      return;
    }
    setZipBusy(key);
    toast.message("Preparing ZIP…");
    try {
      toast.message("Downloading…");
      const result = await downloadStickerZip(sources, zipName);
      if (!result.ok) {
        toast.error(result.error);
        result.failed.forEach((f) => toast.error(f));
        return;
      }
      if (result.failed.length) {
        toast.warning(`${result.failed.length} file(s) could not be included`);
        result.failed.forEach((f) => toast.error(f));
      }
      toast.success("Download complete.");
    } finally {
      setZipBusy(null);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Stickers & Animated Emojis"
        description="Organize GIF stickers into categories and packs. Upload up to 20 files at once. Bucket: stickers."
      />

      {managePack ? (
        <ManagePackView
          pack={managePack}
          categoryLabel={catName(managePack.category_id)}
          rows={rows.filter((r) => r.pack_id === managePack.id)}
          userId={user?.id ?? null}
          zipBusy={zipBusy}
          onBack={() => setManagePackId(null)}
          onRefresh={refresh}
          onZip={(list, name) => runZip(list, name, "manage")}
          onRename={() => setRenamePack(managePack)}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Sticker Packs ({packs.length})</h2>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Create Sticker Pack
            </Button>
          </div>
          <Card className="overflow-x-auto p-0">
            {loading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading…</p>
            ) : packs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
                <ImageIcon className="h-8 w-8 opacity-50" />
                No packs yet. Create a pack, then upload GIFs.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-border text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 font-medium">Pack</th>
                    <th className="px-4 py-2 font-medium">Category</th>
                    <th className="px-4 py-2 font-medium">Stickers</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packs.map((p) => (
                    <tr key={p.id} className="border-b border-border/60">
                      <td className="px-4 py-2 font-medium">{p.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{catName(p.category_id)}</td>
                      <td className="px-4 py-2">{counts.get(p.id) ?? 0}</td>
                      <td className="px-4 py-2">{p.is_active ? "Active" : "Hidden"}</td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-1">
                          <Button variant="outline" size="sm" onClick={() => setRenamePack(p)}>
                            <Pencil className="mr-1 h-3 w-3" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setManagePackId(p.id)}>
                            Manage Stickers
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setManagePackId(p.id)}>
                            Upload More
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={zipBusy === p.id || (counts.get(p.id) ?? 0) === 0}
                            onClick={() => {
                              const list = rows.filter((r) => r.pack_id === p.id);
                              if (!list.length) return toast.message("This pack has no stickers to download.");
                              runZip(list, `${slugToken(p.name).toLowerCase()}.zip`, p.id);
                            }}
                          >
                            <Download className="mr-1 h-3 w-3" /> Download ZIP
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}

      <CreatePackDialog
        open={createOpen}
        categories={categories}
        existing={packs}
        userId={user?.id ?? null}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { setCreateOpen(false); refresh(); }}
      />
      <RenamePackDialog
        pack={renamePack}
        categories={categories}
        existing={packs}
        onClose={() => setRenamePack(null)}
        onSaved={() => { setRenamePack(null); refresh(); }}
      />
    </div>
  );
}

function CreatePackDialog({
  open, categories, existing, userId, onClose, onCreated,
}: {
  open: boolean;
  categories: StickerCategory[];
  existing: StickerPack[];
  userId: string | null;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "custom");
  const [sortOrder, setSortOrder] = useState("0");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setCategoryId(categories[0]?.id ?? "custom");
      setSortOrder("0");
      setActive(true);
    }
  }, [open, categories]);

  const submit = async () => {
    const n = sanitizePackName(name);
    if (!n) return toast.error("Pack name is required");
    const dup = existing.some(
      (p) => p.category_id === categoryId && p.name.trim().toLowerCase() === n.toLowerCase(),
    );
    if (dup) return toast.error("A pack with this name already exists in this category");
    setBusy(true);
    const { error } = await sb.from("sticker_packs").insert({
      name: n,
      category_id: categoryId,
      sort_order: Number.parseInt(sortOrder, 10) || 0,
      is_active: active,
      created_by: userId,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Pack created");
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Sticker Pack</DialogTitle>
          <DialogDescription>Packs group GIFs in the chat picker. Storage files are not moved when you rename later.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Pack Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Cute Animals" maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Sort Order</Label>
            <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={setActive} />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Creating…" : "Create Pack"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RenamePackDialog({
  pack, categories, existing, onClose, onSaved,
}: {
  pack: StickerPack | null;
  categories: StickerCategory[];
  existing: StickerPack[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("custom");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (pack) {
      setName(pack.name);
      setCategoryId(pack.category_id);
    }
  }, [pack]);

  const submit = async () => {
    if (!pack) return;
    const n = sanitizePackName(name);
    if (!n) return toast.error("Pack name is required");
    const dup = existing.some(
      (p) => p.id !== pack.id && p.category_id === categoryId && p.name.trim().toLowerCase() === n.toLowerCase(),
    );
    if (dup) return toast.error("A pack with this name already exists in this category");
    setBusy(true);
    const { error } = await sb.from("sticker_packs").update({
      name: n,
      category_id: categoryId,
    }).eq("id", pack.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Pack updated");
    onSaved();
  };

  return (
    <Dialog open={!!pack} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Name</DialogTitle>
          <DialogDescription>Does not rename or move Storage files. Existing chat stickers keep working.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Pack Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.emoji} {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ManagePackView({
  pack, categoryLabel, rows, userId, zipBusy, onBack, onRefresh, onZip, onRename,
}: {
  pack: StickerPack;
  categoryLabel: string;
  rows: Row[];
  userId: string | null;
  zipBusy: string | null;
  onBack: () => void;
  onRefresh: () => void;
  onZip: (rows: Row[], zipName: string) => Promise<void>;
  onRename: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState<"sticker" | "emoji">("sticker");
  const [singleName, setSingleName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<BulkItem[] | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [editName, setEditName] = useState("");

  const selectToggle = (id: string, next: boolean) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (next) {
        if (!n.has(id) && n.size >= MAX_BULK_FILES) {
          toast.error("Maximum 20 stickers can be downloaded at once.");
          return prev;
        }
        n.add(id);
      } else n.delete(id);
      return n;
    });
  };

  const selectAll = () => {
    if (rows.length > MAX_BULK_FILES) {
      toast.error("Maximum 20 stickers can be downloaded at once.");
      setSelected(new Set(rows.slice(0, MAX_BULK_FILES).map((r) => r.id)));
      return;
    }
    setSelected(new Set(rows.map((r) => r.id)));
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list?.length) return;
    let files = Array.from(list);
    if (files.length > MAX_BULK_FILES) {
      toast.error("Maximum 20 stickers per upload.");
      files = files.slice(0, MAX_BULK_FILES);
    }
    if (files.length === 1) {
      void runSingle(files[0]);
      return;
    }
    setBulk(files.map((file) => ({ file, status: "pending" as const })));
  };

  const runSingle = async (file: File) => {
    const res = await uploadOneSticker({
      file,
      packName: pack.name,
      packId: pack.id,
      kind,
      userId,
      displayName: singleName || undefined,
    });
    if (!res.ok) return toast.error(`${res.fileName} — ${res.error}`);
    toast.success("Sticker uploaded");
    setSingleName("");
    if (fileRef.current) fileRef.current.value = "";
    onRefresh();
  };

  const runBulk = async (items: BulkItem[]) => {
    setBulkRunning(true);
    const next = [...items];
    for (let i = 0; i < next.length; i++) {
      if (next[i].status === "ok") continue;
      next[i] = { ...next[i], status: "uploading" };
      setBulk([...next]);
      const res = await uploadOneSticker({
        file: next[i].file,
        packName: pack.name,
        packId: pack.id,
        kind,
        userId,
      });
      next[i] = res.ok
        ? { ...next[i], status: "ok" }
        : { ...next[i], status: "fail", error: `${res.fileName} — ${res.error}` };
      setBulk([...next]);
    }
    setBulkRunning(false);
    onRefresh();
  };

  const remove = async (row: Row) => {
    if (!confirm(`Delete "${row.name}"? This cannot be undone.`)) return;
    if (row.storage_path) {
      await (supabase as any).storage.from(STICKERS_BUCKET).remove([row.storage_path]);
    }
    const { error } = await sb.from("custom_stickers").delete().eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    setSelected((s) => { const n = new Set(s); n.delete(row.id); return n; });
    onRefresh();
  };

  const saveName = async () => {
    if (!editRow) return;
    const n = editName.trim();
    if (!n) return toast.error("Name is required");
    const { error } = await sb.from("custom_stickers").update({ name: n.slice(0, 80) }).eq("id", editRow.id);
    if (error) return toast.error(error.message);
    setEditRow(null);
    onRefresh();
  };

  const okCount = bulk?.filter((b) => b.status === "ok").length ?? 0;
  const failCount = bulk?.filter((b) => b.status === "fail").length ?? 0;
  const uploadingCount = bulk?.filter((b) => b.status === "uploading").length ?? 0;
  const progress = bulk?.length ? Math.round((okCount / bulk.length) * 100) : 0;

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to packs
      </Button>
      <div>
        <h2 className="text-lg font-semibold">{pack.name}</h2>
        <p className="text-sm text-muted-foreground">{categoryLabel} · {rows.length} stickers</p>
      </div>

      <Card className="space-y-3 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as "sticker" | "emoji")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sticker">Sticker (~160px)</SelectItem>
                <SelectItem value="emoji">Animated Emoji (32px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Display name (single upload)</Label>
            <Input value={singleName} onChange={(e) => setSingleName(e.target.value)} placeholder="Auto from filename" />
          </div>
          <div className="space-y-1.5">
            <Label>Select files (1 or up to 20)</Label>
            <Input
              ref={fileRef}
              type="file"
              accept={ACCEPT_STICKER}
              multiple
              onChange={(e) => onPickFiles(e.target.files)}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          GIF / WebP / APNG / PNG. Max 2 MB per file. One file uploads immediately; multiple files show progress first.
        </p>
      </Card>

      {bulk && (
        <Card className="space-y-3 p-4">
          <div className="text-sm font-medium">{bulk.length} files selected</div>
          {bulkRunning && <p className="text-xs text-muted-foreground">Uploading…</p>}
          <Progress value={bulkRunning ? Math.max(progress, uploadingCount ? progress : 0) : (okCount + failCount) / bulk.length * 100} />
          <p className="text-xs text-muted-foreground">
            {okCount} uploaded · {uploadingCount} uploading · {failCount} failed
          </p>
          {failCount > 0 && (
            <ul className="space-y-1 text-xs text-destructive">
              {bulk.filter((b) => b.status === "fail").map((b) => (
                <li key={b.file.name}>❌ {b.error}</li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            {!bulkRunning && okCount + failCount === 0 && (
              <Button onClick={() => runBulk(bulk)}>Upload {bulk.length} Stickers</Button>
            )}
            {!bulkRunning && failCount > 0 && (
              <Button onClick={() => runBulk(bulk.map((b) => (b.status === "fail" ? { ...b, status: "pending" as const } : b)))}>
                Retry Failed
              </Button>
            )}
            {!bulkRunning && (okCount > 0 || failCount > 0) && (
              <Button variant="outline" onClick={() => { setBulk(null); if (fileRef.current) fileRef.current.value = ""; }}>Done</Button>
            )}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={selectAll}>Select All</Button>
        <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!selected.size || zipBusy === "manage"}
          onClick={() => onZip(rows.filter((r) => selected.has(r.id)), `yaarzo-stickers-${todayStamp()}.zip`)}
        >
          Download Selected ({selected.size})
        </Button>
        <Button variant="outline" size="sm" onClick={onRename}>Edit pack</Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!rows.length || zipBusy === "manage"}
          onClick={() => onZip(rows, `${slugToken(pack.name).toLowerCase()}.zip`)}
        >
          Download ZIP
        </Button>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No stickers in this pack yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3">
              <Checkbox
                checked={selected.has(r.id)}
                onCheckedChange={(v) => selectToggle(r.id, v === true)}
                aria-label={`Select ${r.name}`}
              />
              <div
                className="grid shrink-0 place-items-center overflow-hidden rounded-md bg-white/5"
                style={{ width: r.kind === "emoji" ? 40 : 72, height: r.kind === "emoji" ? 40 : 72 }}
              >
                <img src={r.url} alt={r.name} className="h-full w-full object-contain" loading="lazy" />
              </div>
              <div className="min-w-0 flex-1">
                <button className="truncate text-left text-sm font-medium hover:underline" onClick={() => { setEditRow(r); setEditName(r.name); }}>
                  {r.name}
                </button>
                <div className="truncate text-[11px] text-muted-foreground">
                  {r.kind} · {pack.name} · {r.width && r.height ? `${r.width}×${r.height}` : "—"}
                  {r.size_bytes ? ` · ${(r.size_bytes / 1024).toFixed(0)} KB` : ""}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Switch
                    checked={r.is_active}
                    onCheckedChange={async () => {
                      const { error } = await sb.from("custom_stickers").update({ is_active: !r.is_active }).eq("id", r.id);
                      if (error) toast.error(error.message);
                      else onRefresh();
                    }}
                  />
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

      <Dialog open={!!editRow} onOpenChange={(v) => !v && setEditRow(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sticker name</DialogTitle>
            <DialogDescription>Does not rename the Storage file.</DialogDescription>
          </DialogHeader>
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={80} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRow(null)}>Cancel</Button>
            <Button onClick={saveName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
