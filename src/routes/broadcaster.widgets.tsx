import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listWidgets, createWidget, updateWidget, deleteWidget } from "@/lib/broadcaster.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/broadcaster/widgets")({
  component: WidgetsPage,
});

function WidgetsPage() {
  const qc = useQueryClient();
  const fetchWidgets = useServerFn(listWidgets);
  const create = useServerFn(createWidget);
  const update = useServerFn(updateWidget);
  const del = useServerFn(deleteWidget);

  const widgets = useQuery({ queryKey: ["broadcaster-widgets"], queryFn: () => fetchWidgets() });

  const createMut = useMutation({
    mutationFn: (vars: { name: string; description?: string }) => create({ data: vars }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["broadcaster-widgets"] }); toast.success("Widget created"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const updateMut = useMutation({
    mutationFn: (vars: { id: string; enabled?: boolean; name?: string }) => update({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["broadcaster-widgets"] }),
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["broadcaster-widgets"] }); toast.success("Removed"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm">Create radio widget</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Station name" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Button
            disabled={!name.trim() || createMut.isPending}
            onClick={() => createMut.mutate({ name, description: desc || undefined }, { onSuccess: () => { setName(""); setDesc(""); } })}
          >
            Create
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {(widgets.data ?? []).map((w) => (
          <Card key={w.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{w.name}</span>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete widget?")) delMut.mutate(w.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div>/{w.slug}</div>
              {w.description && <div>{w.description}</div>}
              <Button
                size="sm"
                variant={w.enabled ? "default" : "outline"}
                onClick={() => updateMut.mutate({ id: w.id, enabled: !w.enabled })}
              >
                {w.enabled ? "Enabled" : "Disabled"}
              </Button>
            </CardContent>
          </Card>
        ))}
        {(widgets.data ?? []).length === 0 && (
          <div className="text-sm text-muted-foreground">No widgets yet — create one above.</div>
        )}
      </div>
    </div>
  );
}
