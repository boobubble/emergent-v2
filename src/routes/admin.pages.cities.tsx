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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Pencil, Plus } from "lucide-react";
import {
  listPageCountries,
  listPageStates,
  listPageCities,
  savePageCity,
  deactivatePageCity,
} from "@/lib/pages-cms/taxonomy.functions";

export const Route = createFileRoute("/admin/pages/cities")({ component: CitiesPage });

type CityRow = {
  id: string;
  country_id: string;
  state_id: string | null;
  name: string;
  slug: string;
  alt_names: string[];
  population: number | null;
  seo_priority: number;
  is_active: boolean;
  seo_enabled: boolean;
  sort_order: number;
};

type CountryOpt = { id: string; name: string };
type StateOpt = { id: string; name: string; country_id: string };

const emptyForm = (countryId?: string): Partial<CityRow> => ({
  country_id: countryId ?? "",
  state_id: null,
  name: "",
  slug: "",
  alt_names: [],
  population: null,
  seo_priority: 5,
  is_active: true,
  seo_enabled: true,
  sort_order: 0,
});

function CitiesPage() {
  const listFn = useServerFn(listPageCities);
  const listCountriesFn = useServerFn(listPageCountries);
  const listStatesFn = useServerFn(listPageStates);
  const saveFn = useServerFn(savePageCity);
  const deactivateFn = useServerFn(deactivatePageCity);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [countryId, setCountryId] = useState("");
  const [stateId, setStateId] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(50);
  const [editing, setEditing] = useState<Partial<CityRow> & { alt_names_text?: string } | null>(null);

  const countriesQ = useQuery({
    queryKey: ["admin", "page-countries", "opts"],
    queryFn: () => listCountriesFn({ data: { page: 1, pageSize: 100, activeOnly: true } }),
    staleTime: 60_000,
  });
  const countries = (countriesQ.data?.rows ?? []) as CountryOpt[];

  const filterCountryId = countryId || editing?.country_id || "";
  const statesQ = useQuery({
    queryKey: ["admin", "page-states", "opts", filterCountryId],
    queryFn: () =>
      listStatesFn({
        data: { country_id: filterCountryId, page: 1, pageSize: 100, activeOnly: true },
      }),
    enabled: !!filterCountryId,
    staleTime: 60_000,
  });
  const states = (statesQ.data?.rows ?? []) as StateOpt[];

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "page-cities", search, countryId, stateId, activeOnly, page, pageSize],
    queryFn: () =>
      listFn({
        data: {
          search: search || undefined,
          country_id: countryId || undefined,
          state_id: stateId || undefined,
          activeOnly: activeOnly || undefined,
          page,
          pageSize,
        },
      }),
    staleTime: 30_000,
  });

  const saveMut = useMutation({
    mutationFn: (row: Partial<CityRow> & { alt_names_text?: string }) => {
      const altNames = row.alt_names_text
        ? row.alt_names_text.split(",").map((s) => s.trim()).filter(Boolean)
        : row.alt_names ?? [];
      return saveFn({
        data: {
          id: row.id,
          country_id: row.country_id!,
          state_id: row.state_id ?? null,
          name: row.name!,
          slug: row.slug!,
          alt_names: altNames,
          population: row.population ?? null,
          seo_priority: row.seo_priority ?? 5,
          is_active: row.is_active ?? true,
          seo_enabled: row.seo_enabled ?? true,
          sort_order: row.sort_order ?? 0,
        },
      });
    },
    onSuccess: () => {
      toast.success("City saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "page-cities"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Save failed"),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateFn({ data: { id } }),
    onSuccess: () => {
      toast.success("City deactivated");
      qc.invalidateQueries({ queryKey: ["admin", "page-cities"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Deactivate failed"),
  });

  const countryMap = new Map(countries.map((c) => [c.id, c.name]));
  const stateMap = new Map(states.map((s) => [s.id, s.name]));
  const rows = (data?.rows ?? []) as CityRow[];
  const totalPages = data?.totalPages ?? 1;

  function openEdit(row: CityRow) {
    setEditing({ ...row, alt_names_text: (row.alt_names ?? []).join(", ") });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Input
            placeholder="Search cities…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Select value={countryId || "__all__"} onValueChange={(v) => { setCountryId(v === "__all__" ? "" : v); setStateId(""); setPage(1); }}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All countries</SelectItem>
              {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={stateId || "__all__"} onValueChange={(v) => { setStateId(v === "__all__" ? "" : v); setPage(1); }} disabled={!countryId}>
            <SelectTrigger className="w-40"><SelectValue placeholder="State" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All states</SelectItem>
              {states.filter((s) => !countryId || s.country_id === countryId).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={activeOnly} onChange={(e) => { setActiveOnly(e.target.checked); setPage(1); }} />
            Active only
          </label>
          <Button size="sm" className="ml-auto" onClick={() => setEditing({ ...emptyForm(countryId || countries[0]?.id), alt_names_text: "" })}>
            <Plus className="mr-1 h-4 w-4" />Add city
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
                  <th className="p-3">Country</th>
                  <th className="p-3">State</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Alt Names</th>
                  <th className="p-3">Pop.</th>
                  <th className="p-3">SEO Pri.</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">SEO</th>
                  <th className="p-3">Sort</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">{countryMap.get(r.country_id) ?? "—"}</td>
                    <td className="p-3">{r.state_id ? stateMap.get(r.state_id) ?? "—" : "—"}</td>
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 font-mono text-xs">{r.slug}</td>
                    <td className="p-3 max-w-[120px] truncate text-xs">{(r.alt_names ?? []).join(", ") || "—"}</td>
                    <td className="p-3 tabular-nums">{r.population ?? "—"}</td>
                    <td className="p-3 tabular-nums">{r.seo_priority}</td>
                    <td className="p-3">
                      <Badge variant={r.is_active ? "secondary" : "outline"}>{r.is_active ? "Yes" : "No"}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge variant={r.seo_enabled ? "secondary" : "outline"}>{r.seo_enabled ? "Yes" : "No"}</Badge>
                    </td>
                    <td className="p-3 tabular-nums">{r.sort_order}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(r)}>
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
                    <td colSpan={11} className="p-6 text-center text-muted-foreground">No cities found.</td>
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
            <DialogTitle>{editing?.id ? "Edit city" : "Add city"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Country</Label>
                <Select value={editing.country_id ?? ""} onValueChange={(v) => setEditing({ ...editing, country_id: v, state_id: null })}>
                  <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>State (optional)</Label>
                <Select
                  value={editing.state_id ?? "__none__"}
                  onValueChange={(v) => setEditing({ ...editing, state_id: v === "__none__" ? null : v })}
                >
                  <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {states.filter((s) => s.country_id === editing.country_id).map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
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
                <Label>Alternate Names (comma-separated)</Label>
                <Input value={editing.alt_names_text ?? ""} onChange={(e) => setEditing({ ...editing, alt_names_text: e.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <Label>Population</Label>
                <Input
                  type="number"
                  value={editing.population ?? ""}
                  onChange={(e) => setEditing({ ...editing, population: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>SEO Priority</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editing.seo_priority ?? 5}
                  onChange={(e) => setEditing({ ...editing, seo_priority: Number(e.target.value) })}
                />
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
              disabled={!editing?.name?.trim() || !editing?.slug?.trim() || !editing?.country_id || saveMut.isPending}
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
