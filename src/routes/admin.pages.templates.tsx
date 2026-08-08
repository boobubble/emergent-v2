import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { Pencil, Plus } from "lucide-react";
import { TEMPLATE_SAMPLE, TEMPLATE_VARIABLES } from "@/components/admin/pages/pages-ui";
import { renderTemplate, buildTemplateVars } from "@/lib/pages-cms/template-engine";
import {
  listPageTemplates,
  savePageTemplate,
  deactivatePageTemplate,
} from "@/lib/pages-cms/taxonomy.functions";

export const Route = createFileRoute("/admin/pages/templates")({ component: TemplatesPage });

type TemplateRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  intro_template: string | null;
  content_template: string | null;
  faq_template: unknown;
  cta_template: unknown;
  meta_title_template: string | null;
  meta_description_template: string | null;
  h1_template: string | null;
  is_default: boolean;
  is_active: boolean;
};

const emptyForm = (): Partial<TemplateRow> => ({
  name: "",
  slug: "",
  description: "",
  intro_template: "",
  content_template: "",
  meta_title_template: "",
  meta_description_template: "",
  h1_template: "",
  is_default: false,
  is_active: true,
});

function TemplatesPage() {
  const listFn = useServerFn(listPageTemplates);
  const saveFn = useServerFn(savePageTemplate);
  const deactivateFn = useServerFn(deactivatePageTemplate);
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(50);
  const [editing, setEditing] = useState<Partial<TemplateRow> | null>(null);

  const sampleVars = useMemo(() => buildTemplateVars(TEMPLATE_SAMPLE), []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "page-templates", search, page, pageSize],
    queryFn: () => listFn({ data: { search: search || undefined, page, pageSize } }),
    staleTime: 30_000,
  });

  const saveMut = useMutation({
    mutationFn: (row: Partial<TemplateRow>) =>
      saveFn({
        data: {
          id: row.id,
          name: row.name!,
          slug: row.slug!,
          description: row.description || null,
          intro_template: row.intro_template || null,
          content_template: row.content_template || null,
          faq_template: row.faq_template ?? null,
          cta_template: row.cta_template ?? null,
          meta_title_template: row.meta_title_template || null,
          meta_description_template: row.meta_description_template || null,
          h1_template: row.h1_template || null,
          is_default: row.is_default ?? false,
          is_active: row.is_active ?? true,
        },
      }),
    onSuccess: () => {
      toast.success("Template saved");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", "page-templates"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Save failed"),
  });

  const deactivateMut = useMutation({
    mutationFn: (id: string) => deactivateFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Template deactivated");
      qc.invalidateQueries({ queryKey: ["admin", "page-templates"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Deactivate failed"),
  });

  const rows = (data?.rows ?? []) as TemplateRow[];
  const totalPages = data?.totalPages ?? 1;

  const preview = editing
    ? {
        h1: renderTemplate(editing.h1_template ?? "", sampleVars),
        meta_title: renderTemplate(editing.meta_title_template ?? "", sampleVars),
        meta_description: renderTemplate(editing.meta_description_template ?? "", sampleVars),
        intro: renderTemplate(editing.intro_template ?? "", sampleVars),
        content: renderTemplate(editing.content_template ?? "", sampleVars),
      }
    : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Template variables</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-1.5">
          {TEMPLATE_VARIABLES.map((v) => (
            <Badge key={v} variant="outline" className="font-mono text-xs">{v}</Badge>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2 p-3">
          <Input
            placeholder="Search templates…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Button size="sm" className="ml-auto" onClick={() => setEditing(emptyForm())}>
            <Plus className="mr-1 h-4 w-4" />Add template
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
                  <th className="p-3">Default</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 font-mono text-xs">{r.slug}</td>
                    <td className="p-3">
                      {r.is_default ? <Badge>Default</Badge> : <span className="text-muted-foreground">—</span>}
                    </td>
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
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">No templates found.</td>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit template" : "Add template"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="grid gap-4 lg:grid-cols-2">
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
                  <Label>Description</Label>
                  <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2} />
                </div>
                <div className="grid gap-1.5">
                  <Label>H1 Template</Label>
                  <Input value={editing.h1_template ?? ""} onChange={(e) => setEditing({ ...editing, h1_template: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Meta Title Template</Label>
                  <Input value={editing.meta_title_template ?? ""} onChange={(e) => setEditing({ ...editing, meta_title_template: e.target.value })} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Meta Description Template</Label>
                  <Textarea value={editing.meta_description_template ?? ""} onChange={(e) => setEditing({ ...editing, meta_description_template: e.target.value })} rows={2} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Intro Template</Label>
                  <Textarea value={editing.intro_template ?? ""} onChange={(e) => setEditing({ ...editing, intro_template: e.target.value })} rows={3} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Content Template</Label>
                  <Textarea value={editing.content_template ?? ""} onChange={(e) => setEditing({ ...editing, content_template: e.target.value })} rows={5} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Default template</Label>
                  <AdminToggle checked={editing.is_default ?? false} onCheckedChange={(v) => setEditing({ ...editing, is_default: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <AdminToggle checked={editing.is_active ?? true} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                </div>
              </div>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Live preview (sample data)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {preview && (
                    <>
                      <div><span className="text-xs text-muted-foreground">H1</span><p className="font-semibold">{preview.h1 || "—"}</p></div>
                      <div><span className="text-xs text-muted-foreground">Meta title</span><p>{preview.meta_title || "—"}</p></div>
                      <div><span className="text-xs text-muted-foreground">Meta description</span><p className="text-muted-foreground">{preview.meta_description || "—"}</p></div>
                      <div><span className="text-xs text-muted-foreground">Intro</span><p className="whitespace-pre-wrap">{preview.intro || "—"}</p></div>
                      <div><span className="text-xs text-muted-foreground">Content</span><p className="whitespace-pre-wrap">{preview.content || "—"}</p></div>
                    </>
                  )}
                </CardContent>
              </Card>
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
