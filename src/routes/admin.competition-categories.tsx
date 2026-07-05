import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { listCategories, adminSaveCategory, adminDeleteCategory } from "@/lib/competitions.functions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/competition-categories")({
  component: AdminCategories,
});

function AdminCategories() {
  const list = useServerFn(listCategories);
  const save = useServerFn(adminSaveCategory);
  const del = useServerFn(adminDeleteCategory);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["competition-categories"], queryFn: () => list({}) });
  const [editing, setEditing] = useState<any | null>(null);

  const saveM = useMutation({
    mutationFn: (v: any) => save({ data: v }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["competition-categories"] }); setEditing(null); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["competition-categories"] }); },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title="Competition Categories"
        description="Unlimited categories for community competitions."
        actions={
          <Button onClick={() => setEditing({ slug: "", name: "", enabled: true, color: "#8b5cf6", sort_order: 100 })}>
            <Plus className="h-4 w-4" /> New Category
          </Button>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {(data as any[]).map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-xl" style={{ background: c.color }} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.name}</span>
                  {c.is_default && <Badge variant="secondary" className="text-xs">default</Badge>}
                  {!c.enabled && <Badge variant="outline" className="text-xs">disabled</Badge>}
                </div>
                <div className="text-xs text-muted-foreground">/{c.slug}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setEditing(c)}><Edit className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => confirm(`Delete "${c.name}"?`) && delM.mutate(c.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing?.id ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Name</Label>
                  <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Color</Label>
                  <Input type="color" value={editing.color ?? "#8b5cf6"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />
                </div>
                <div>
                  <Label>Sort</Label>
                  <Input type="number" value={editing.sort_order ?? 100} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </div>
                <div className="flex items-end gap-2">
                  <Switch checked={editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} />
                  <Label>Enabled</Label>
                </div>
              </div>
              <div>
                <Label>Icon URL</Label>
                <Input value={editing.icon_url ?? ""} onChange={(e) => setEditing({ ...editing, icon_url: e.target.value })} />
              </div>
              <div>
                <Label>Banner URL</Label>
                <Input value={editing.banner_url ?? ""} onChange={(e) => setEditing({ ...editing, banner_url: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={() => saveM.mutate(editing)} disabled={saveM.isPending || !editing?.name || !editing?.slug}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
