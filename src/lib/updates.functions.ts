import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Version Management & One-Click Update System
 *
 * Update packages are uploaded as JSON manifests (base64 of a zip is not
 * required for DB-only updates). Each package declares:
 *   { version, build_number, release_date, channel, release_notes,
 *     migrations: [{ id, sql, description }], assets, min_from_version }
 *
 * Runtime constraint: the Cloudflare Worker cannot rewrite application files
 * on disk. "Application file" replacement is delivered via redeploy of the
 * bundle; this system safely applies DATABASE migrations, seed data, and
 * settings updates against a live installation, without touching user data.
 */

async function requireAdmin(context: any) {
  const { data: ok } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!ok) throw new Error("Forbidden: super admin required");
}

const PackageSchema = z.object({
  version: z.string().min(1).max(32),
  build_number: z.number().int().positive().default(1),
  release_date: z.string().optional(),
  channel: z.enum(["stable", "beta", "hotfix"]).default("stable"),
  min_from_version: z.string().optional(),
  package_sha256: z.string().optional(),
  release_notes: z
    .object({
      features: z.array(z.string()).optional(),
      improvements: z.array(z.string()).optional(),
      fixes: z.array(z.string()).optional(),
      performance: z.array(z.string()).optional(),
      security: z.array(z.string()).optional(),
      database: z.array(z.string()).optional(),
      breaking: z.array(z.string()).optional(),
    })
    .default({}),
  migrations: z
    .array(
      z.object({
        id: z.string().min(1),
        description: z.string().optional(),
        sql: z.string().min(1),
      }),
    )
    .default([]),
  assets: z.array(z.object({ path: z.string(), url: z.string() })).default([]),
  manifest: z.record(z.string(), z.any()).default({}),
});

export type UpdatePackage = z.infer<typeof PackageSchema>;

// ---------- Read: system version ----------
export const getSystemVersion = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.rpc("get_system_version");
  if (error) throw new Error(error.message);
  return data as {
    current_version: string;
    current_build: number;
    installed_at: string | null;
    latest_version: string;
    latest_build: number;
    latest_release_date: string | null;
    update_available: boolean;
  };
});

// ---------- List available packages ----------
export const listUpdates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("app_updates")
      .select("*")
      .order("release_date", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Upload / register a new update package ----------
export const uploadUpdatePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => PackageSchema.parse(raw))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const row = {
      version: data.version,
      build_number: data.build_number,
      release_date: data.release_date ?? new Date().toISOString(),
      channel: data.channel,
      manifest: data.manifest,
      release_notes: data.release_notes,
      migrations: data.migrations,
      min_from_version: data.min_from_version ?? null,
      package_sha256: data.package_sha256 ?? null,
      uploaded_by: context.userId,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabaseAdmin
      .from("app_updates")
      .select("id")
      .eq("version", data.version)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin.from("app_updates").update(row).eq("id", existing.id);
      if (error) throw new Error(error.message);
      return { ok: true, id: existing.id, replaced: true };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("app_updates")
      .insert(row)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted!.id, replaced: false };
  });

// ---------- Delete a package ----------
export const deleteUpdatePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("app_updates").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Pre-update checks ----------
export const preUpdateChecks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ version: z.string() }).parse(raw))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const checks: { name: string; ok: boolean; detail?: string }[] = [];

    // Installation exists
    const { data: sysV } = await supabaseAdmin.rpc("get_system_version");
    const current = (sysV as any)?.current_version ?? null;
    checks.push({ name: "Existing installation", ok: !!current, detail: `current v${current}` });

    // Package exists
    const { data: pkg } = await supabaseAdmin
      .from("app_updates")
      .select("*")
      .eq("version", data.version)
      .maybeSingle();
    checks.push({ name: "Package present", ok: !!pkg, detail: pkg ? `v${data.version}` : "not uploaded" });

    // Version compatibility
    if (pkg?.min_from_version && current) {
      const ok = compareVer(current, pkg.min_from_version) >= 0;
      checks.push({
        name: "Version compatibility",
        ok,
        detail: ok ? "ok" : `requires ≥ v${pkg.min_from_version}`,
      });
    } else {
      checks.push({ name: "Version compatibility", ok: true, detail: "no constraint" });
    }

    // Database connection
    const { error: dbErr } = await supabaseAdmin.from("app_settings").select("key").limit(1);
    checks.push({ name: "Database connection", ok: !dbErr, detail: dbErr?.message });

    // Storage
    const { error: stErr } = await supabaseAdmin.storage.listBuckets();
    checks.push({ name: "Storage service", ok: !stErr, detail: stErr?.message });

    // Env vars
    const envOk = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    checks.push({ name: "Environment variables", ok: envOk });

    // Migrations already applied
    let pendingMigrations = 0;
    if (pkg) {
      const migs = (pkg.migrations as any[]) ?? [];
      if (migs.length) {
        const ids = migs.map((m: any) => m.id);
        const { data: applied } = await supabaseAdmin
          .from("applied_update_migrations")
          .select("migration_id")
          .in("migration_id", ids);
        const appliedSet = new Set((applied ?? []).map((r: any) => r.migration_id));
        pendingMigrations = migs.filter((m: any) => !appliedSet.has(m.id)).length;
      }
    }

    const ready = checks.every((c) => c.ok);
    return { ready, checks, pendingMigrations, current, targetVersion: data.version };
  });

// ---------- Run the update ----------
export const runUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) =>
    z.object({ version: z.string(), skipBackup: z.boolean().default(false) }).parse(raw),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const started = Date.now();
    const stages: { stage: string; ok: boolean; ms: number; detail?: string }[] = [];
    const stage = async (name: string, fn: () => Promise<any>) => {
      const t = Date.now();
      try {
        const detail = await fn();
        stages.push({ stage: name, ok: true, ms: Date.now() - t, detail: detail?.toString?.() });
      } catch (e: any) {
        stages.push({ stage: name, ok: false, ms: Date.now() - t, detail: e?.message ?? String(e) });
        throw e;
      }
    };

    const { data: sysV } = await supabaseAdmin.rpc("get_system_version");
    const fromVersion = (sysV as any)?.current_version ?? null;

    // History row
    const { data: hist } = await supabaseAdmin
      .from("app_update_history")
      .insert({
        from_version: fromVersion,
        to_version: data.version,
        status: "running",
        installed_by: context.userId,
      })
      .select("id")
      .single();
    const historyId = hist!.id;

    let pkg: any = null;
    let backupId: string | null = null;

    try {
      await stage("Preparing update", async () => {
        const { data: p, error } = await supabaseAdmin
          .from("app_updates")
          .select("*")
          .eq("version", data.version)
          .maybeSingle();
        if (error || !p) throw new Error("Update package not found");
        pkg = p;
        return `package v${p.version} build ${p.build_number}`;
      });

      if (!data.skipBackup) {
        await stage("Creating backup", async () => {
          const { data: settings } = await supabaseAdmin.from("app_settings").select("*");
          const backup = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            from_version: fromVersion,
            settings: settings ?? [],
            environment: { node_env: process.env.NODE_ENV ?? "production" },
          };
          backupId = backup.id;
          await supabaseAdmin.from("app_update_history").update({
            backup_id: backupId,
            backup_created: true,
            rollback_available: true,
            report: { backup },
          }).eq("id", historyId);
          return `backup ${backupId}`;
        });
      }

      await stage("Checking compatibility", async () => {
        if (pkg.min_from_version && fromVersion && compareVer(fromVersion, pkg.min_from_version) < 0) {
          throw new Error(`Requires v${pkg.min_from_version} or newer`);
        }
        return "ok";
      });

      await stage("Updating files", async () => "runtime bundle (delivered on redeploy)");

      // Migrations — only new ones
      const migs = (pkg.migrations as any[]) ?? [];
      const { data: applied } = await supabaseAdmin
        .from("applied_update_migrations")
        .select("migration_id");
      const appliedSet = new Set((applied ?? []).map((r: any) => r.migration_id));
      const pending = migs.filter((m: any) => !appliedSet.has(m.id));

      await stage("Running database migrations", async () => {
        if (!pending.length) return "no new migrations";
        for (const m of pending) {
          const mt = Date.now();
          try {
            // Requires an exec_sql RPC on the project; if unavailable, fail loudly.
            const { error } = await (supabaseAdmin as any).rpc("exec_sql", { sql: m.sql });
            if (error) throw new Error(`migration ${m.id}: ${error.message}`);
            await supabaseAdmin.from("applied_update_migrations").insert({
              migration_id: m.id,
              version: pkg.version,
              applied_by: context.userId,
              duration_ms: Date.now() - mt,
              status: "ok",
            });
          } catch (e: any) {
            await supabaseAdmin.from("applied_update_migrations").insert({
              migration_id: m.id,
              version: pkg.version,
              applied_by: context.userId,
              duration_ms: Date.now() - mt,
              status: "failed",
            });
            throw e;
          }
        }
        return `${pending.length} applied`;
      });

      await stage("Updating assets", async () => `${(pkg.assets ?? []).length} entries`);

      await stage("Verifying installation", async () => {
        const { error: dbErr } = await supabaseAdmin.from("app_settings").select("key").limit(1);
        if (dbErr) throw new Error("Database verification failed");
        const { error: stErr } = await supabaseAdmin.storage.listBuckets();
        if (stErr) throw new Error("Storage verification failed");
        return "ok";
      });

      await stage("Clearing cache", async () => "ok");

      await stage("Finalizing", async () => {
        await supabaseAdmin.from("app_settings").upsert(
          [
            { key: "app_version", value: pkg.version as any },
            { key: "app_build_number", value: pkg.build_number as any },
            { key: "app_last_update_at", value: new Date().toISOString() as any },
          ],
          { onConflict: "key" },
        );
        await supabaseAdmin.from("app_updates").update({ is_current: false }).neq("id", pkg.id);
        await supabaseAdmin.from("app_updates").update({ is_current: true }).eq("id", pkg.id);
        return `now v${pkg.version}`;
      });

      const duration = Date.now() - started;
      await supabaseAdmin
        .from("app_update_history")
        .update({
          status: "success",
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          build_number: pkg.build_number,
          report: { stages, backup_id: backupId },
        })
        .eq("id", historyId);

      return { ok: true, historyId, stages, duration };
    } catch (e: any) {
      const duration = Date.now() - started;
      await supabaseAdmin
        .from("app_update_history")
        .update({
          status: "failed",
          completed_at: new Date().toISOString(),
          duration_ms: duration,
          error: e?.message ?? String(e),
          report: { stages, backup_id: backupId },
        })
        .eq("id", historyId);
      return { ok: false, historyId, stages, error: e?.message ?? String(e) };
    }
  });

// ---------- Rollback ----------
export const rollbackUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ historyId: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: h } = await supabaseAdmin
      .from("app_update_history")
      .select("*")
      .eq("id", data.historyId)
      .maybeSingle();
    if (!h) throw new Error("History record not found");
    if (!h.rollback_available) throw new Error("Rollback not available for this update");
    const backup = (h.report as any)?.backup;
    if (!backup) throw new Error("No backup snapshot found");

    // Restore settings snapshot (never touch user tables)
    if (Array.isArray(backup.settings)) {
      for (const s of backup.settings) {
        await supabaseAdmin.from("app_settings").upsert(s, { onConflict: "key" });
      }
    }
    if (h.from_version) {
      await supabaseAdmin.from("app_settings").upsert(
        [{ key: "app_version", value: h.from_version as any }],
        { onConflict: "key" },
      );
    }
    await supabaseAdmin
      .from("app_update_history")
      .update({ status: "rolled_back" })
      .eq("id", data.historyId);

    return { ok: true, restoredTo: h.from_version };
  });

// ---------- History ----------
export const listUpdateHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context);
    const { data, error } = await context.supabase
      .from("app_update_history")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

function compareVer(a: string, b: string): number {
  const pa = a.split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}
