import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminToggle } from "@/components/admin/AdminToggle";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { listFooterPages, updateFooterPages } from "@/lib/pages.functions";

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

  function toggleFooter(id: string) {
    setLocal((prev) => {
      const src = prev ?? (pages as FooterRow[] | undefined) ?? [];
      return src.map((r) => (r.id === id ? { ...r, show_in_footer: !r.show_in_footer } : r));
    });
  }

  function move(id: string, dir: -1 | 1) {
    setLocal((prev) => {
      const src = [...(prev ?? (pages as FooterRow[] | undefined) ?? [])];
      const idx = src.findIndex((r) => r.id === id);
      if (idx < 0) return src;
      const target = idx + dir;
      if (target < 0 || target >= src.length) return src;
      [src[idx], src[target]] = [src[target], src[idx]];
      return src.map((r, i) => ({ ...r, footer_order: i }));
    });
  }

  async function handleSave() {
    if (!local) return;
    setSaving(true);
    try {
      await saveFn({
        data: {
          updates: local.map((r) => ({
            id: r.id,
            show_in_footer: r.show_in_footer,
            footer_order: r.footer_order,
          })),
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

  const footerCount = rows.filter((r) => r.show_in_footer).length;
  const dirty = local !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Footer Links</h2>
          <p className="text-sm text-muted-foreground">
            Choose which published pages appear in the public site footer.
            {footerCount > 0 && (
              <Badge variant="secondary" className="ml-2">{footerCount} active</Badge>
            )}
          </p>
        </div>
        <Button size="sm" disabled={!dirty || saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading published pages…</div>
      ) : rows.length === 0 ? (
        <div className="py-8 text-center text-sm text-muted-foreground">No published pages found. Publish a page first.</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead className="w-20">Footer</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-20">Order</TableHead>
                <TableHead className="w-24">Reorder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className={row.show_in_footer ? "bg-primary/5" : ""}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                  <TableCell>
                    <AdminToggle
                      checked={row.show_in_footer}
                      onCheckedChange={() => toggleFooter(row.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{row.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">/{row.slug}</TableCell>
                  <TableCell className="text-sm tabular-nums">{row.footer_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(row.id, -1)}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(row.id, 1)}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
