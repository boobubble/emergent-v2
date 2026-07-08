import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Full-project rollback verification for the removed "Path Flow" (pathescape)
 * module. Returns a report of any lingering database objects. An empty report
 * means the rollback is clean.
 */
export const verifyPathEscapeRemoval = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: isAdmin }, { data: isSuper }] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
    ]);
    if (!isAdmin && !isSuper) throw new Error("Forbidden");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = context.supabase as any;
    const { data, error } = await sb.rpc("pathescape_removal_report");
    if (error) throw new Error(error.message);

    const report = (data ?? {}) as {
      tables: string[]; views: string[]; functions: string[];
      policies: string[]; triggers: string[];
      storage_buckets: string[]; storage_objects: string[];
    };

    const totals = Object.values(report).reduce(
      (n, arr) => n + (Array.isArray(arr) ? arr.length : 0), 0,
    );

    return { clean: totals === 0, totals, report, checkedAt: new Date().toISOString() };
  });
