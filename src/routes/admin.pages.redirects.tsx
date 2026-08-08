import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRightLeft, Trash2 } from "lucide-react";
import { listRedirects, saveRedirect, deleteRedirect } from "@/lib/pages.functions";

export const Route = createFileRoute("/admin/pages/redirects")({ component: RedirectsPage });

interface RedirectRow {
  id: string;
  from_slug: string;
  to_slug: string;
}

function RedirectsPage() {
  const fetchRedirects = useServerFn(listRedirects);
  const save = useServerFn(saveRedirect);
  const del = useServerFn(deleteRedirect);
  const qc = useQueryClient();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const redirectsQ = useQuery({
    queryKey: ["admin", "redirects"],
    queryFn: () => fetchRedirects({}),
    staleTime: 60_000,
  });

  const rows = (redirectsQ.data ?? []) as RedirectRow[];
  const onChanged = () => qc.invalidateQueries({ queryKey: ["admin", "redirects"] });

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader><CardTitle className="text-base">Add redirect</CardTitle></CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="old-slug" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input placeholder="new-slug" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button
            size="sm"
            disabled={!from.trim() || !to.trim()}
            onClick={async () => {
              try {
                await save({ data: { from_slug: from, to_slug: to } });
                toast.success("Redirect saved");
                setFrom("");
                setTo("");
                onChanged();
              } catch (e: unknown) {
                toast.error((e as Error)?.message ?? "Failed");
              }
            }}
          >
            Save
          </Button>
        </CardContent>
      </Card>

      {redirectsQ.isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No redirects configured.</p>
      ) : (
        <div className="grid gap-1.5">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center gap-3 p-3 text-sm">
                <span className="font-mono">/{r.from_slug}</span>
                <ArrowRightLeft className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono">/{r.to_slug}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-auto"
                  onClick={async () => {
                    if (!confirm("Delete redirect?")) return;
                    await del({ data: { id: r.id } });
                    toast.success("Removed");
                    onChanged();
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
