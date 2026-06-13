import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("mod_logs")
      .select("id, actor_id, action, target_type, target_id, payload, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const Route = createFileRoute("/admin/audit-logs")({ component: Page });

function Page() {
  const fetchFn = useServerFn(listAuditLogs);
  const { data, isLoading } = useQuery({ queryKey: ["admin-audit-logs"], queryFn: () => fetchFn({}) });
  return (
    <div>
      <AdminPageHeader title="Admin Audit Logs" description="Every staff action recorded for review." />
      <div className="rounded-xl border border-border bg-card">
        <div className="grid grid-cols-[140px_120px_1fr_180px] gap-2 border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground">
          <div>When</div><div>Action</div><div>Target</div><div>Actor</div>
        </div>
        {isLoading && <div className="p-4 text-sm text-muted-foreground">Loading…</div>}
        {(data ?? []).map((r) => (
          <div key={r.id} className="grid grid-cols-[140px_120px_1fr_180px] items-start gap-2 border-b border-border/60 px-3 py-2 text-xs">
            <div className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
            <div className="font-medium">{r.action}</div>
            <div className="truncate"><span className="text-muted-foreground">{r.target_type}</span> {r.target_id ?? ""}</div>
            <div className="truncate text-muted-foreground">{r.actor_id ?? "system"}</div>
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">No entries yet.</div>
        )}
      </div>
    </div>
  );
}
