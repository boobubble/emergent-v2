import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Pencil, Plus } from "lucide-react";
import {
  listPageCountries,
  savePageCountry,
  deactivatePageCountry,
} from "@/lib/pages-cms/taxonomy.functions";

export const Route = createFileRoute("/admin/pages/countries")({ component: CountriesPage });

type CountryRow = {
  id: string;
  name: string;
  slug: string;
  iso_code: string | null;
  language: string;
  is_active: boolean;
  seo_enabled: boolean;
  sort_order: number;
};

const emptyForm = (): Partial<CountryRow> => ({
  name: "",
  slug: "",
  iso_code: "",
  language: "en",
  is_active: true,
  seo_enabled: true,
  sort_order: 0,
});

function CountriesPage() {
  const listFn = useServerFn(listPageCountries);
  const saveFn = useServerFn(savePageCountry);
  const deactivateFn = useServerFn(deactivatePageCountry);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(50);
  const [editing, setEditing] = useState<Partial<CountryRow> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "page-countries", search, page, pageSize],
    queryFn: () => listFn({ data: { search: search || undefined, page, pageSize } }),
    staleTime: 30_000,
  });

  const saveMut = useMutation({
    mutationFn: (row: Partial<CountryRow>) =>
      saveFn({
        data: {
          id: row.id,
          name: row.name!,
          slug: row.slug!,
          iso_code: row.iso_code || null,
          language: row.language || "en",
          is_active: row.is_active ?? true,
          seo_enabled: row.seo_enabled ?? true,
          sort_order: row.sort_order ?? 0,
        },
      }),
    onSuccess: () => {
      toast.success("Country saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "page-countries"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Save failed"),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Country deactivated");
      qc.invalidateQueries({ queryKey: ["admin", "page-countries"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Deactivate failed"),
  });

  const rows = (data?.rows ?? []) as CountryRow[];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Input
            placeholder="Search countries…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Button size="sm" className="ml-auto" onClick={() => setEditing(emptyForm())}>
            <Plus className="mr-1 h-4 w-4" />Add country
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
                  <th className="p-3">ISO</th>
                  <th className="p-3">Language</th>
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
                    <td className="p-3">{r.iso_code ?? "—"}</td>
                    <td className="p-3">{r.language}</td>
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
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">No countries found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">
          Page {page} of {totalPages} · {data?.total ?? 0} total
        </span>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit country" : "Add country"}</DialogTitle>
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
                <Label>ISO Code</Label>
                <Input value={editing.iso_code ?? ""} onChange={(e) => setEditing({ ...editing, iso_code: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Language</Label>
                <Input value={editing.language ?? "en"} onChange={(e) => setEditing({ ...editing, language: e.target.value })} />
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
                <Label>Sort Order</Label>
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
