import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, AlertTriangle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminToggle } from "@/components/admin/AdminToggle";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  listFooterPages, updateFooterPages,
  FOOTER_GROUPS, FOOTER_GROUP_LABELS, type FooterGroup,
} from "@/lib/pages.functions";

export const Route = createFileRoute("/admin/pages/footer-links")({
  component: FooterLinksManager,
});

interface FooterRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  show_in_footer: boolean;
  footer_order: number;
  footer_group: string | null;
}

function FooterLinksManager() {
  const listFn = useServerFn(listFooterPages);
  const saveFn = useServerFn(updateFooterPages);
  const qc = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin", "pages", "footer-links"],
    queryFn: () => listFn({}),
  });

  const [local, setLocal] = useState<FooterRow[] | null>(null);
  const [saving, setSaving] = useState(false);

  const rows: FooterRow[] = local ?? (pages as FooterRow[] | undefined) ?? [];

  function mutate(fn: (rows: FooterRow[]) => FooterRow[]) {
    setLocal((prev) => fn(prev ?? (pages as FooterRow[] | undefined) ?? []));
  }

  function assignGroup(id: string, group: FooterGroup) {
    mutate((src) => src.map((r) =>
      r.id === id ? { ...r, show_in_footer: true, footer_group: group } : r,
    ));
  }

  function removeFromFooter(id: string) {
    mutate((src) => src.map((r) =>
      r.id === id ? { ...r, show_in_footer: false } : r,
    ));
  }

  function moveInGroup(id: string, group: FooterGroup, dir: -1 | 1) {
    mutate((src) => {
      const inGroup = src.filter((r) => r.show_in_footer && r.footer_group === group);
      const idx = inGroup.findIndex((r) => r.id === id);
      if (idx < 0) return src;
      const target = idx + dir;
      if (target < 0 || target >= inGroup.length) return src;
      [inGroup[idx], inGroup[target]] = [inGroup[target], inGroup[idx]];
      const orderMap = new Map(inGroup.map((r, i) => [r.id, i]));
      return src.map((r) => orderMap.has(r.id) ? { ...r, footer_order: orderMap.get(r.id)! } : r);
    });
  }

  async function handleSave() {
    if (!local) return;
    setSaving(true);
    try {
      await saveFn({
        data: {
          updates: local
            .filter((r) => r.show_in_footer && r.footer_group)
            .map((r) => ({
              id: r.id,
              show_in_footer: r.show_in_footer,
              footer_order: r.footer_order,
              footer_group: r.footer_group as FooterGroup,
            }))
            .concat(
              local
                .filter((r) => !r.show_in_footer)
                .map((r) => ({
                  id: r.id,
                  show_in_footer: false,
                  footer_order: r.footer_order,
                  footer_group: r.footer_group as FooterGroup | null,
                })),
            ),
        },
      });
      await qc.invalidateQueries({ queryKey: ["admin", "pages", "footer-links"] });
      setLocal(null);
      toast.success("Footer links saved");
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const dirty = local !== null;

  const unassigned = rows.filter((r) => !r.show_in_footer || !r.footer_group);

  if (isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading published pages…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Footer Links</h2>
          <p className="text-sm text-muted-foreground">
            Manage the 3 footer columns shown on public pages.
          </p>
        </div>
        <Button size="sm" disabled={!dirty || saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {FOOTER_GROUPS.map((group) => {
        const groupRows = rows
          .filter((r) => r.show_in_footer && r.footer_group === group)
          .sort((a, b) => a.footer_order - b.footer_order);

        return (
          <div key={group} className="rounded-lg border">
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">{FOOTER_GROUP_LABELS[group]}</h3>
                <Badge variant="secondary" className="text-xs">{groupRows.length}</Badge>
              </div>
            </div>
            {groupRows.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No pages assigned. Use the selector below or edit a page's footer settings.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="w-20">Order</TableHead>
                    <TableHead className="w-28">Reorder</TableHead>
                    <TableHead className="w-16" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-sm">{row.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">/{row.slug}</TableCell>
                      <TableCell className="text-sm tabular-nums">{row.footer_order}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => moveInGroup(row.id, group, -1)}>
                            <ArrowUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => moveInGroup(row.id, group, 1)}>
                            <ArrowDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          onClick={() => removeFromFooter(row.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        );
      })}

      {unassigned.length > 0 && (
        <div className="rounded-lg border">
          <div className="border-b bg-muted/20 px-4 py-3">
            <h3 className="text-sm font-semibold">Available Published Pages</h3>
            <p className="text-xs text-muted-foreground">
              Assign pages to a footer section.
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-48">Assign to</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unassigned.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-sm">{row.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">/{row.slug}</TableCell>
                  <TableCell>
                    <Select
                      value=""
                      onValueChange={(v) => assignGroup(row.id, v as FooterGroup)}
                    >
                      <SelectTrigger className="h-8 w-44">
                        <SelectValue placeholder="Select section…" />
                      </SelectTrigger>
                      <SelectContent>
                        {FOOTER_GROUPS.map((g) => (
                          <SelectItem key={g} value={g}>{FOOTER_GROUP_LABELS[g]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
