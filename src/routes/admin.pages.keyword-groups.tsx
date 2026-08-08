import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Pencil, Plus } from "lucide-react";
import { KEYWORD_VARIABLES } from "@/components/admin/pages/pages-ui";
import {
  listPageKeywordGroups,
  savePageKeywordGroup,
  deactivatePageKeywordGroup,
} from "@/lib/pages-cms/taxonomy.functions";

export const Route = createFileRoute("/admin/pages/keyword-groups")({ component: KeywordGroupsPage });

type KeywordGroupRow = {
  id: string;
  name: string;
  slug: string;
  primary_pattern: string;
  title_pattern: string | null;
  meta_title_pattern: string | null;
  meta_description_pattern: string | null;
  h1_pattern: string | null;
  slug_pattern: string | null;
  is_active: boolean;
};

const emptyForm = (): Partial<KeywordGroupRow> => ({
  name: "",
  slug: "",
  primary_pattern: "{city} chat room",
  title_pattern: "",
  meta_title_pattern: "",
  meta_description_pattern: "",
  h1_pattern: "",
  slug_pattern: "",
  is_active: true,
});

function KeywordGroupsPage() {
  const listFn = useServerFn(listPageKeywordGroups);
  const saveFn = useServerFn(savePageKeywordGroup);
  const deactivateFn = useServerFn(deactivatePageKeywordGroup);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(50);
  const [editing, setEditing] = useState<Partial<KeywordGroupRow> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "page-keyword-groups", search, page, pageSize],
    queryFn: () => listFn({ data: { search: search || undefined, page, pageSize } }),
    staleTime: 30_000,
  });

  const saveMut = useMutation({
    mutationFn: (row: Partial<KeywordGroupRow>) =>
      saveFn({
        data: {
          id: row.id,
          name: row.name!,
          slug: row.slug!,
          primary_pattern: row.primary_pattern ?? "{city} chat room",
          title_pattern: row.title_pattern || null,
          meta_title_pattern: row.meta_title_pattern || null,
          meta_description_pattern: row.meta_description_pattern || null,
          h1_pattern: row.h1_pattern || null,
          slug_pattern: row.slug_pattern || null,
          is_active: row.is_active ?? true,
        },
      }),
    onSuccess: () => {
      toast.success("Keyword group saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "page-keyword-groups"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Save failed"),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Keyword group deactivated");
      qc.invalidateQueries({ queryKey: ["admin", "page-keyword-groups"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Deactivate failed"),
  });

  const rows = (data?.rows ?? []) as KeywordGroupRow[];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pattern variables</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {KEYWORD_VARIABLES.map((v) => (
            <Badge key={v} variant="outline" className="font-mono text-xs">{v}</Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Input
            placeholder="Search keyword groups…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Button size="sm" className="ml-auto" onClick={() => setEditing(emptyForm())}>
            <Plus className="mr-1 h-4 w-4" />Add group
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
                  <th className="p-3">Primary</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Meta Title</th>
                  <th className="p-3">Meta Desc</th>
                  <th className="p-3">H1</th>
                  <th className="p-3">Slug Pat.</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 font-mono text-xs">{r.slug}</td>
                    <td className="p-3 max-w-[100px] truncate text-xs">{r.primary_pattern}</td>
                    <td className="p-3 max-w-[100px] truncate text-xs">{r.title_pattern ?? "—"}</td>
                    <td className="p-3 max-w-[100px] truncate text-xs">{r.meta_title_pattern ?? "—"}</td>
                    <td className="p-3 max-w-[100px] truncate text-xs">{r.meta_description_pattern ?? "—"}</td>
                    <td className="p-3 max-w-[100px] truncate text-xs">{r.h1_pattern ?? "—"}</td>
                    <td className="p-3 max-w-[100px] truncate text-xs">{r.slug_pattern ?? "—"}</td>
                    <td className="p-3">
                      <Badge variant={r.is_active ? "secondary" : "outline"}>{r.is_active ? "Yes" : "No"}</Badge>
                    </td>
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
                    <td colSpan={10} className="p-6 text-center text-muted-foreground">No keyword groups found.</td>
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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit keyword group" : "Add keyword group"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Name</Label>
                <Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Slug</Label>
                <Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Primary Pattern</Label>
                <Input value={editing.primary_pattern ?? ""} onChange={(e) => setEditing({ ...editing, primary_pattern: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Title Pattern</Label>
                <Input value={editing.title_pattern ?? ""} onChange={(e) => setEditing({ ...editing, title_pattern: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Meta Title Pattern</Label>
                <Input value={editing.meta_title_pattern ?? ""} onChange={(e) => setEditing({ ...editing, meta_title_pattern: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Meta Description Pattern</Label>
                <Input value={editing.meta_description_pattern ?? ""} onChange={(e) => setEditing({ ...editing, meta_description_pattern: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>H1 Pattern</Label>
                <Input value={editing.h1_pattern ?? ""} onChange={(e) => setEditing({ ...editing, h1_pattern: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Slug Pattern</Label>
                <Input value={editing.slug_pattern ?? ""} onChange={(e) => setEditing({ ...editing, slug_pattern: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <AdminToggle checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
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
