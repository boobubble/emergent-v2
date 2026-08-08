import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Pencil, Plus } from "lucide-react";
import {
  listPageCategories,
  savePageCategory,
  deactivatePageCategory,
} from "@/lib/pages-cms/taxonomy.functions";

export const Route = createFileRoute("/admin/pages/categories")({ component: CategoriesPage });

type CategoryRow = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  seo_enabled: boolean;
  sort_order: number;
};

const emptyForm = (): Partial<CategoryRow> => ({
  parent_id: null,
  name: "",
  slug: "",
  description: "",
  is_active: true,
  seo_enabled: true,
  sort_order: 0,
});

function CategoriesPage() {
  const listFn = useServerFn(listPageCategories);
  const saveFn = useServerFn(savePageCategory);
  const deactivateFn = useServerFn(deactivatePageCategory);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(50);
  const [editing, setEditing] = useState<Partial<CategoryRow> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "page-categories", search, page, pageSize],
    queryFn: () => listFn({ data: { search: search || undefined, page, pageSize } }),
    staleTime: 30_000,
  });

  const saveMut = useMutation({
    mutationFn: (row: Partial<CategoryRow>) =>
      saveFn({
        data: {
          id: row.id,
          parent_id: row.parent_id ?? null,
          name: row.name!,
          slug: row.slug!,
          description: row.description ?? null,
          is_active: row.is_active ?? true,
          seo_enabled: row.seo_enabled ?? true,
          sort_order: row.sort_order ?? 0,
        },
      }),
    onSuccess: () => {
      toast.success("Category saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "page-categories"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Save failed"),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Category deactivated");
      qc.invalidateQueries({ queryKey: ["admin", "page-categories"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Deactivate failed"),
  });

  const rows = (data?.rows ?? []) as CategoryRow[];
  const nameMap = new Map(rows.map((r) => [r.id, r.name]));
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Input
            placeholder="Search categories…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Button size="sm" className="ml-auto" onClick={() => setEditing(emptyForm())}>
            <Plus className="mr-1 h-4 w-4" />Add category
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Parent</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">SEO</th>
                  <th className="p-3">Sort</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 font-mono text-xs">{r.slug}</td>
                    <td className="p-3">{r.parent_id ? nameMap.get(r.parent_id) ?? "—" : "—"}</td>
                    <td className="p-3 max-w-[200px] truncate text-xs text-muted-foreground">{r.description ?? "—"}</td>
                    <td className="p-3">
                      <Badge variant={r.is_active ? "secondary" : "outline"}>{r.is_active ? "Yes" : "No"}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={r.seo_enabled ? "secondary" : "outline"}>{r.seo_enabled ? "Yes" : "No"}</Badge>
                    </td>
                    <td className="p-3 tabular-nums">{r.sort_order}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setEditing(r)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {r.is_active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (!confirm(`Deactivate "${r.name}"?`)) return;
                              deactivateMut.mutate(r.id);
                            }}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Page {page} of {totalPages} · {data?.total ?? 0} total</span>
        <select
          className="rounded border bg-background px-2 py-1 text-sm"
          value={pageSize}
          onChange={(e) => { setPageSize(Number(e.target.value) as 25 | 50 | 100); setPage(1); }}
        >
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Parent</Label>
                <Select
                  value={editing.parent_id ?? "__none__"}
                  onValueChange={(v) => setEditing({ ...editing, parent_id: v === "__none__" ? null : v })}
                >
                  <SelectTrigger><SelectValue placeholder="None (root)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None (root)</SelectItem>
                    {rows.filter((c) => c.id !== editing.id).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Name</Label>
                <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Slug</Label>
                <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Description</Label>
                <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <AdminToggle checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>SEO Enabled</Label>
                <AdminToggle checked={editing.seo_enabled ?? true} onCheckedChange={(v) => setEditing({ ...editing, seo_enabled: v })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Sort Order (priority)</Label>
                <Input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              disabled={!editing?.name?.trim() || !editing?.slug?.trim() || saveMut.isPending}
              onClick={() => editing && saveMut.mutate(editing)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
