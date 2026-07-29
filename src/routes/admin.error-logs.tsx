import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteClientErrorLog,
  exportClientErrorLogsCsv,
  listClientErrorLogs,
  resolveClientErrorLog,
  type ClientErrorLogRow,
} from "@/lib/error-logs.functions";

export const Route = createFileRoute("/admin/error-logs")({ component: Page });

const SEVERITIES = ["info", "warn", "error", "fatal"] as const;

function Page() {
  const qc = useQueryClient();
  const fetchLogs = useServerFn(listClientErrorLogs);
  const resolveFn = useServerFn(resolveClientErrorLog);
  const deleteFn = useServerFn(deleteClientErrorLog);
  const exportFn = useServerFn(exportClientErrorLogsCsv);

  const [q, setQ] = useState("");
  const [severity, setSeverity] = useState("");
  const [routeFilter, setRouteFilter] = useState("");
  const [unresolvedOnly, setUnresolvedOnly] = useState(true);
  const [selected, setSelected] = useState<ClientErrorLogRow | null>(null);

  const filters = useMemo(
    () => ({ q: q || undefined, severity: severity || undefined, route: routeFilter || undefined, unresolvedOnly }),
    [q, severity, routeFilter, unresolvedOnly],
  );

  const { data, isLoading, refetch } = useQuery<ClientErrorLogRow[]>({
    queryKey: ["admin-error-logs", filters],
    queryFn: () => fetchLogs({ data: filters } as never),
    staleTime: 15_000,
  });

  useEffect(() => {
    const ch = supabase
      .channel("admin-client-error-logs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "client_error_logs" }, () => {
        void refetch();
      })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [refetch]);

  const resolveMut = useMutation({
    mutationFn: (id: string) => resolveFn({ data: { id } }),
    onSuccess: () => { toast.success("Marked resolved"); void qc.invalidateQueries({ queryKey: ["admin-error-logs"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); setSelected(null); void qc.invalidateQueries({ queryKey: ["admin-error-logs"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function exportCsv() {
    try {
      const { csv } = await exportFn({ data: filters });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `client-error-logs-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Error Logs"
        description="Client-side runtime errors captured from users in production. Search by route, user, severity, or message."
      />

      <div className="flex flex-wrap gap-2">
        <Input placeholder="Search message…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Input placeholder="Route filter…" value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)} className="max-w-[160px]" />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="">All severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={unresolvedOnly} onChange={(e) => setUnresolvedOnly(e.target.checked)} />
          Unresolved only
        </label>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>Refresh</Button>
        <Button variant="outline" size="sm" onClick={() => void exportCsv()}>Export CSV</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="grid grid-cols-[140px_72px_1fr_100px] gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
            <div>When</div><div>Severity</div><div>Message</div><div>Route</div>
          </div>
          {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && rows.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">No error logs yet.</div>
          )}
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelected(r)}
              className={`grid w-full grid-cols-[140px_72px_1fr_100px] gap-2 border-b border-border/60 px-3 py-2 text-left text-xs hover:bg-muted/50 ${selected?.id === r.id ? "bg-muted/60" : ""}`}
            >
              <div className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
              <div><SeverityBadge severity={r.severity} resolved={!!r.resolved_at} /></div>
              <div className="truncate font-medium">{r.message}</div>
              <div className="truncate text-muted-foreground">{r.route ?? "—"}</div>
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          {!selected ? (
            <p className="text-muted-foreground">Select a log entry for details.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <SeverityBadge severity={selected.severity} resolved={!!selected.resolved_at} />
                <div className="flex gap-1">
                  {!selected.resolved_at && (
                    <Button size="sm" variant="outline" onClick={() => resolveMut.mutate(selected.id)}>Resolve</Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => deleteMut.mutate(selected.id)}>Delete</Button>
                </div>
              </div>
              <Detail label="Message" value={selected.message} />
              <Detail label="Route" value={selected.route} />
              <Detail label="URL" value={selected.url} />
              <Detail label="User" value={selected.user_id} />
              <Detail label="Browser" value={`${selected.browser ?? "?"} · ${selected.os ?? "?"} · ${selected.device ?? "?"}`} />
              <Detail label="Screen" value={selected.screen} />
              <Detail label="App" value={`${selected.app_version ?? "?"} / ${selected.build_version ?? "?"}`} />
              {selected.stack && (
                <div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">Stack</div>
                  <pre className="mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-[10px]">{selected.stack}</pre>
                </div>
              )}
              {selected.component_stack && (
                <div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">Component stack</div>
                  <pre className="mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-[10px]">{selected.component_stack}</pre>
                </div>
              )}
              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground">Metadata</div>
                  <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 text-[10px]">{JSON.stringify(selected.metadata, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity, resolved }: { severity: string; resolved: boolean }) {
  const tone =
    severity === "fatal" ? "destructive" :
    severity === "error" ? "destructive" :
    severity === "warn" ? "secondary" : "outline";
  return (
    <Badge variant={tone as "destructive" | "secondary" | "outline"} className="text-[10px] uppercase">
      {severity}{resolved ? " ✓" : ""}
    </Badge>
  );
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[10px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className="mt-0.5 break-all text-xs">{value}</div>
    </div>
  );
}
