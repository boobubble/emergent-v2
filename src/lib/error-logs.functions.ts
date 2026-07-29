import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

async function getSupabaseAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function assertAdmin(userId: string) {
  const sb = await getSupabaseAdmin();
  const { data, error } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Forbidden: admin only");
}

export interface ClientErrorLogRow {
  id: string;
  created_at: string;
  user_id: string | null;
  route: string | null;
  url: string | null;
  message: string;
  stack: string | null;
  component_stack: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  screen: string | null;
  app_version: string | null;
  build_version: string | null;
  severity: string;
  metadata: Record<string, string | number | boolean | null> | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

const listSchema = z.object({
  q: z.string().optional(),
  severity: z.string().optional(),
  route: z.string().optional(),
  userId: z.string().uuid().optional(),
  unresolvedOnly: z.boolean().optional(),
  limit: z.number().int().min(1).max(500).optional(),
});

// Table added via migration — not yet in generated Database types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function errorLogsTable(sb: Awaited<ReturnType<typeof getSupabaseAdmin>>) {
  return (sb as any).from("client_error_logs");
}

export const listClientErrorLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .validator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();
    let query = errorLogsTable(sb)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 200);

    if (data.severity) query = query.eq("severity", data.severity);
    if (data.route) query = query.ilike("route", `%${data.route}%`);
    if (data.userId) query = query.eq("user_id", data.userId);
    if (data.unresolvedOnly) query = query.is("resolved_at", null);
    if (data.q) query = query.ilike("message", `%${data.q}%`);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []) as ClientErrorLogRow[];
  });

export const resolveClientErrorLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();
    const { error } = await errorLogsTable(sb)
      .update({ resolved_at: new Date().toISOString(), resolved_by: context.userId })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteClientErrorLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .validator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();
    const { error } = await errorLogsTable(sb).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const exportClientErrorLogsCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .validator((input: unknown) => listSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = await getSupabaseAdmin();
    const { data: rows, error } = await errorLogsTable(sb)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 1000);
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as ClientErrorLogRow[];
    const header = ["created_at", "severity", "route", "user_id", "message", "browser", "os", "device", "app_version"];
    const lines = [header.join(",")];
    for (const r of list) {
      lines.push(
        [
          r.created_at,
          r.severity,
          r.route ?? "",
          r.user_id ?? "",
          `"${(r.message ?? "").replace(/"/g, '""')}"`,
          r.browser ?? "",
          r.os ?? "",
          r.device ?? "",
          r.app_version ?? "",
        ].join(","),
      );
    }
    return { csv: lines.join("\n") };
  });
