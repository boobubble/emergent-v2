import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminSaveCategory } from "@/lib/competitions.functions";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const emptyCategory = () => ({
  id: undefined as string | undefined,
  slug: "",
  name: "",
  description: "",
  color: "#8b5cf6",
  icon_url: "",
  banner_url: "",
  sort_order: 0,
  enabled: true,
  default_qualification_config: {
    thresholds: { likes: 0, comments: 0, shares: 0, views: 0, reads: 0, bookmarks: 0 },
    gates: {},
  } as Record<string, any>,
});

export function CategoryEditorDialog({
  value,
  onChange,
}: { value: any | null; onChange: (v: any | null) => void }) {
  const save = useServerFn(adminSaveCategory);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(value);

  useEffect(() => { setEditing(value); }, [value]);

  const set = (patch: Record<string, any>) => setEditing((e: any) => ({ ...e, ...patch }));
  const setThreshold = (key: string, v: number) => {
    const cfg = editing.default_qualification_config ?? {};
    const thr = { ...(cfg.thresholds ?? {}), [key]: v };
    set({ default_qualification_config: { ...cfg, thresholds: thr } });
  };

  const saveM = useMutation({
    mutationFn: () => save({ data: { ...editing } } as any),
    onSuccess: () => {
      toast.success("Category saved");
      qc.invalidateQueries({ queryKey: ["competition-categories"] });
      onChange(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  if (!editing) return null;
  const thr = editing.default_qualification_config?.thresholds ?? {};

  return (
    <Dialog open={!!editing} onOpenChange={(o) => !o && onChange(null)}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing.id ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Name</Label><Input value={editing.name} onChange={(e) => set({ name: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => set({ slug: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => set({ description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Color</Label><Input type="color" value={editing.color ?? "#8b5cf6"} onChange={(e) => set({ color: e.target.value })} /></div>
            <div><Label>Sort</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => set({ sort_order: Number(e.target.value) })} /></div>
            <div className="flex items-end gap-2"><Switch checked={!!editing.enabled} onCheckedChange={(v) => set({ enabled: v })} /><Label>Enabled</Label></div>
          </div>
          <div><Label>Icon URL</Label><Input value={editing.icon_url ?? ""} onChange={(e) => set({ icon_url: e.target.value })} /></div>
          <div><Label>Banner URL</Label><Input value={editing.banner_url ?? ""} onChange={(e) => set({ banner_url: e.target.value })} /></div>

          <div className="rounded-xl border p-3 space-y-2">
            <div className="text-sm font-semibold">Default Minimum Engagement to Qualify</div>
            <div className="text-xs text-muted-foreground">
              Applies to every competition in this category that uses Smart or Hybrid mode. A competition may override these values in its own editor.
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {([
                ["likes", "Min likes"],
                ["comments", "Min comments"],
                ["shares", "Min shares"],
                ["views", "Min views"],
                ["reads", "Min reads"],
                ["bookmarks", "Min bookmarks"],
              ] as const).map(([k, label]) => (
                <div key={k}>
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    min={0}
                    value={thr[k] ?? 0}
                    onChange={(e) => setThreshold(k, Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onChange(null)}>Cancel</Button>
          <Button disabled={saveM.isPending || !editing.name || !editing.slug} onClick={() => saveM.mutate()}>
            {saveM.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
