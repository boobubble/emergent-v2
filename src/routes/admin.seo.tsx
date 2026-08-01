import { useMemo, useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search, ExternalLink, Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getSeoInventory } from "@/lib/seo.functions";
import { SeoEditDrawer } from "@/components/admin/seo/SeoEditDrawer";
import { isSeoEditableRow } from "@/lib/seo/edit-form";
import {
  fieldStateLabel,
  indexStateLabel,
  summarizeSeoInventory,
  type SeoInventoryRow,
  type SeoInventoryStatus,
  type SeoInventorySummary,
} from "@/lib/seo/inventory";
import { SEO_INVENTORY_CATEGORIES, type SeoInventoryCategoryId } from "@/lib/seo/inventory-categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/seo")({
  component: SeoManagerPage,
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
});

const ALL = "__all__";

const CATEGORY_IDS = new Set<string>(SEO_INVENTORY_CATEGORIES.map((c) => c.id));

function parseCategoryParam(value: string | undefined): SeoInventoryCategoryId | typeof ALL {
  if (value && CATEGORY_IDS.has(value)) return value as SeoInventoryCategoryId;
  return ALL;
}

function SeoManagerPage() {
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="SEO Manager"
        description="Central SEO inventory. Batch 3 editing is enabled for Global Defaults and homepage routes only."
        actions={
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Batch 3 · Limited editing</Badge>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Sitemap
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Robots
            </a>
          </div>
        }
      />
      <SeoInventoryPanel />
    </div>
  );
}

function StatusBadge({ status }: { status: SeoInventoryStatus }) {
  const variant =
    status === "configured" ? "default" : status === "partial" ? "secondary" : "outline";
  return <Badge variant={variant}>{status}</Badge>;
}

function FieldBadge({ state }: { state: SeoInventoryRow["title"] }) {
  const label = fieldStateLabel(state);
  return (
    <Badge
      variant={state === "missing" ? "outline" : "secondary"}
      className={cn(
        "font-normal",
        state === "available" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
        state === "dynamic" && "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
        state === "missing" && "text-muted-foreground",
      )}
    >
      {label}
    </Badge>
  );
}

function filterRows(
  rows: SeoInventoryRow[],
  category: SeoInventoryCategoryId | typeof ALL,
  status: SeoInventoryStatus | typeof ALL,
  routeKind: "static" | "dynamic" | typeof ALL,
  search: string,
): SeoInventoryRow[] {
  const q = search.trim().toLowerCase();
  return rows.filter((row) => {
    if (category !== ALL && row.category !== category) return false;
    if (status !== ALL && row.status !== status) return false;
    if (routeKind === "static" && row.isDynamic) return false;
    if (routeKind === "dynamic" && !row.isDynamic) return false;
    if (!q) return true;
    return (
      row.pageName.toLowerCase().includes(q)
      || row.routePattern.toLowerCase().includes(q)
      || row.routePath.toLowerCase().includes(q)
      || row.seoSource.toLowerCase().includes(q)
    );
  });
}

function SeoInventoryPanel() {
  const { category: categoryParam } = Route.useSearch();
  const queryClient = useQueryClient();
  const fetchInventory = useServerFn(getSeoInventory);
  const inventory = useQuery({
    queryKey: ["seo-inventory"],
    queryFn: () => fetchInventory({}),
    staleTime: 60_000,
  });

  const [editTarget, setEditTarget] = useState<{
    target: "global" | "route";
    routePath: string | null;
    label: string;
  } | null>(null);

  const [activeCategory, setActiveCategory] = useState<SeoInventoryCategoryId | typeof ALL>(() => parseCategoryParam(categoryParam));
  const [statusFilter, setStatusFilter] = useState<SeoInventoryStatus | typeof ALL>(ALL);
  const [routeKind, setRouteKind] = useState<"static" | "dynamic" | typeof ALL>(ALL);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setActiveCategory(parseCategoryParam(categoryParam));
  }, [categoryParam]);

  const rows = inventory.data?.rows ?? [];
  const summary = inventory.data?.summary;

  const filtered = useMemo(
    () => filterRows(rows, activeCategory, statusFilter, routeKind, search),
    [rows, activeCategory, statusFilter, routeKind, search],
  );

  const categoryCounts: SeoInventorySummary["byCategory"] =
    summary?.byCategory ?? ({} as SeoInventorySummary["byCategory"]);

  const patchInventoryRow = (row: SeoInventoryRow) => {
    queryClient.setQueryData<Awaited<ReturnType<typeof fetchInventory>>>(
      ["seo-inventory"],
      (old) => {
        if (!old) return old;
        const rows = old.rows.map((existing) => (existing.id === row.id ? row : existing));
        return {
          ...old,
          rows,
          summary: summarizeSeoInventory(rows),
        };
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(ALL)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs transition-colors",
            activeCategory === ALL
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-muted/50",
          )}
        >
          All routes
          {summary ? ` (${summary.total})` : ""}
        </button>
        {SEO_INVENTORY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              activeCategory === cat.id
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:bg-muted/50",
            )}
            title={cat.description}
          >
            {cat.label}
            {categoryCounts[cat.id] != null ? ` (${categoryCounts[cat.id]})` : ""}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search page or route..."
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SeoInventoryStatus | typeof ALL)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            <SelectItem value="configured">Configured</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
          </SelectContent>
        </Select>
        <Select value={routeKind} onValueChange={(v) => setRouteKind(v as "static" | "dynamic" | typeof ALL)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Route type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Static + dynamic</SelectItem>
            <SelectItem value="static">Static only</SelectItem>
            <SelectItem value="dynamic">Dynamic only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {summary && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{summary.total} public routes</Badge>
          <Badge variant="secondary">{summary.configured} configured</Badge>
          <Badge variant="secondary">{summary.partial} partial</Badge>
          <Badge variant="outline">{summary.missing} missing</Badge>
          <Badge variant="outline">{summary.static} static</Badge>
          <Badge variant="outline">{summary.dynamic} dynamic</Badge>
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page / module</TableHead>
              <TableHead>Route pattern</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>SEO source</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Canonical</TableHead>
              <TableHead>Index</TableHead>
              <TableHead>JSON-LD</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[88px]">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.isLoading && (
              <TableRow>
                <TableCell colSpan={11} className="py-8 text-center text-sm text-muted-foreground">
                  Loading SEO inventory...
                </TableCell>
              </TableRow>
            )}
            {inventory.isError && (
              <TableRow>
                <TableCell colSpan={11} className="py-8 text-center text-sm text-destructive">
                  Could not load inventory. Check admin permissions and try again.
                </TableCell>
              </TableRow>
            )}
            {!inventory.isLoading && !inventory.isError && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="py-8 text-center text-sm text-muted-foreground">
                  No routes match the current filters.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="max-w-[160px] font-medium">{row.pageName}</TableCell>
                <TableCell className="max-w-[180px] font-mono text-xs">{row.routePattern}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.isDynamic ? "Dynamic" : "Static"}</Badge>
                </TableCell>
                <TableCell className="max-w-[220px] text-xs text-muted-foreground">{row.seoSource}</TableCell>
                <TableCell><FieldBadge state={row.title} /></TableCell>
                <TableCell><FieldBadge state={row.description} /></TableCell>
                <TableCell><FieldBadge state={row.canonical} /></TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">{indexStateLabel(row.indexState)}</Badge>
                </TableCell>
                <TableCell><FieldBadge state={row.jsonLd} /></TableCell>
                <TableCell><StatusBadge status={row.status} /></TableCell>
                <TableCell>
                  {isSeoEditableRow(row) ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 px-2"
                      onClick={() => setEditTarget({
                        target: row.id === "__global__" ? "global" : "route",
                        routePath: row.id === "__global__" ? null : row.routePath,
                        label: row.pageName,
                      })}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editTarget && (
        <SeoEditDrawer
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
          target={editTarget.target}
          routePath={editTarget.routePath}
          label={editTarget.label}
          onSaved={(row) => patchInventoryRow(row)}
        />
      )}

      <p className="text-xs text-muted-foreground">
        Batch 3 editing: Global Defaults and homepage routes (`/`, `/welcome`, `/heropage`) only. Other routes remain read-only.
      </p>
    </div>
  );
}
