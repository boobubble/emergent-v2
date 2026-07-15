import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { withRateLimit } from "./rate-limit-middleware";

async function requireAdmin(context: any) {
  const { data: ok } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
  if (!ok) throw new Error("Forbidden");
}

function computeExpiry(retention: string | null): string | null {
  if (!retention || retention === "forever") return null;
  const days = retention === "7d" ? 7 : retention === "30d" ? 30 : retention === "90d" ? 90 : null;
  if (!days) return null;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const recordSchema = z.object({
  filename: z.string().min(1).max(256),
  backup_type: z.enum(["full", "quick", "media", "database"]).default("full"),
  size_bytes: z.number().int().nonnegative(),
  sha256: z.string().nullable().optional(),
  md5: z.string().nullable().optional(),
  verified: z.boolean().default(false),
  encrypted: z.boolean().default(false),
  app_version: z.string().nullable().optional(),
  total_tables: z.number().int().nullable().optional(),
  total_rows: z.number().int().nullable().optional(),
  media_files: z.number().int().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const recordBackupHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((d: unknown) => recordSchema.parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);

    // Read retention setting to derive expiry.
    let retention: string | null = null;
    try {
      const { data: row } = await context.supabase
        .from("app_settings").select("value").eq("key", "backup_retention").maybeSingle();
      retention = (row?.value as any) ?? "30d";
      if (typeof retention !== "string") retention = JSON.stringify(retention).replace(/"/g, "");
    } catch {
      retention = "30d";
    }
    const expires_at = computeExpiry(retention);

    const { data: inserted, error } = await context.supabase
      .from("backup_history")
      .insert({ ...data, generated_by: context.userId, expires_at })
      .select("*").single();
    if (error) throw new Error(error.message);
    return inserted;
  });

export const listBackupHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("backup_history").select("*")
      .order("generated_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const deleteBackupHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { error } = await context.supabase.from("backup_history").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markBackupVerified = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), verified: z.boolean() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("backup_history").update({ verified: data.verified }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const markRestoreTested = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("backup_history").update({ last_restore_test_at: new Date().toISOString() }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getBackupRetention = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data } = await context.supabase
      .from("app_settings").select("value").eq("key", "backup_retention").maybeSingle();
    const val = (data?.value as any) ?? "30d";
    return typeof val === "string" ? val : String(val);
  });

export const setBackupRetention = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((d: unknown) =>
    z.object({ value: z.enum(["7d", "30d", "90d", "forever"]) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context);
    const { error } = await context.supabase
      .from("app_settings")
      .upsert({ key: "backup_retention", value: data.value as any }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getBackupHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const [{ data: latest }, tables, dbSize] = await Promise.all([
      context.supabase.from("backup_history").select("*")
        .order("generated_at", { ascending: false }).limit(1).maybeSingle(),
      context.supabase.rpc("admin_list_public_tables"),
      context.supabase.rpc("admin_db_size"),
    ]);
    return {
      latest: latest ?? null,
      table_count: Array.isArray(tables.data) ? tables.data.length : 0,
      db_size_bytes: (dbSize.data as unknown as number) ?? 0,
    };
  });
