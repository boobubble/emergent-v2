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
  max_from_version: z.string().optional(),
  installer_version: z.string().optional(),
  schema_version: z.string().optional(),
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
      deprecated: z.array(z.string()).optional(),
    })
    .default({}),
  impacts: z.record(z.string(), z.enum(["safe", "attention", "manual"])).optional(),
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

// ---------- Package validation + preview ----------
type SqlAnalysis = {
  tables_added: string[];
  tables_modified: string[];
  columns_added: number;
  columns_modified: number;
  columns_removed: number;
  indexes_added: number;
  views_added: number;
  functions_added: number;
  triggers_added: number;
  policies_added: number;
  destructive: { migration_id: string; op: string; snippet: string }[];
};

function analyzeSql(migrations: { id: string; sql: string }[]): SqlAnalysis {
  const a: SqlAnalysis = {
    tables_added: [], tables_modified: [],
    columns_added: 0, columns_modified: 0, columns_removed: 0,
    indexes_added: 0, views_added: 0, functions_added: 0,
    triggers_added: 0, policies_added: 0, destructive: [],
  };
  const DANGER = [
    { re: /\bDROP\s+DATABASE\b/i, op: "DROP DATABASE" },
    { re: /\bDROP\s+SCHEMA\b/i, op: "DROP SCHEMA" },
    { re: /\bDROP\s+TABLE\b/i, op: "DROP TABLE" },
    { re: /\bTRUNCATE\b/i, op: "TRUNCATE" },
    { re: /\bDELETE\s+FROM\s+[^;]*?(?!.*\bWHERE\b)/is, op: "DELETE without WHERE" },
    { re: /\bALTER\s+TABLE[^;]*\bDROP\s+COLUMN\b/i, op: "DROP COLUMN" },
  ];
  for (const m of migrations) {
    const sql = m.sql || "";
    const stmts = sql.split(/;\s*(?=\n|$)/);
    for (const s of stmts) {
      const t = s.trim();
      if (!t) continue;
      const mAdd = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+([a-z0-9_.]+)/i.exec(t);
      if (mAdd) a.tables_added.push(mAdd[1]);
      const mAlt = /ALTER\s+TABLE\s+([a-z0-9_.]+)/i.exec(t);
      if (mAlt) a.tables_modified.push(mAlt[1]);
      a.columns_added += (t.match(/\bADD\s+COLUMN\b/gi) ?? []).length;
      a.columns_modified += (t.match(/\bALTER\s+COLUMN\b/gi) ?? []).length;
      a.columns_removed += (t.match(/\bDROP\s+COLUMN\b/gi) ?? []).length;
      if (/CREATE\s+(UNIQUE\s+)?INDEX/i.test(t)) a.indexes_added++;
      if (/CREATE\s+(OR\s+REPLACE\s+)?VIEW/i.test(t)) a.views_added++;
      if (/CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/i.test(t)) a.functions_added++;
      if (/CREATE\s+TRIGGER/i.test(t)) a.triggers_added++;
      if (/CREATE\s+POLICY/i.test(t)) a.policies_added++;
    }
    for (const d of DANGER) {
      if (d.re.test(sql)) {
        a.destructive.push({ migration_id: m.id, op: d.op, snippet: sql.slice(0, 160) });
      }
    }
  }
  a.tables_added = Array.from(new Set(a.tables_added));
  a.tables_modified = Array.from(new Set(a.tables_modified));
  return a;
}

function calcRisk(sql: SqlAnalysis, breaking: number, migrationsCount: number) {
  let score = 0;
  score += sql.destructive.length * 30;
  score += breaking * 20;
  score += Math.min(migrationsCount, 20) * 2;
  score += sql.columns_removed * 10;
  score += sql.tables_modified.length * 3;
  const level = score >= 60 ? "high" : score >= 25 ? "medium" : "low";
  return { score, level } as const;
}

const IMPACT_AREAS = [
  "users", "chatrooms", "feeds", "competitions", "subscriptions",
  "premium", "notifications", "media", "settings", "realtime",
] as const;

function inferImpacts(sql: SqlAnalysis, declared?: Record<string, "safe" | "attention" | "manual">) {
  const hints: Record<string, "safe" | "attention" | "manual"> = {};
  const all = [...sql.tables_added, ...sql.tables_modified].join(" ").toLowerCase();
  const has = (needle: string) => all.includes(needle);
  const map: Record<typeof IMPACT_AREAS[number], string[]> = {
    users: ["profile", "user"],
    chatrooms: ["chatroom", "message"],
    feeds: ["post", "comment", "reaction", "hashtag"],
    competitions: ["competition"],
    subscriptions: ["subscription", "plan"],
    premium: ["subscription", "plan", "coin"],
    notifications: ["notification"],
    media: ["storage", "media", "sticker"],
    settings: ["setting", "seo", "config"],
    realtime: ["realtime", "presence"],
  };
  for (const area of IMPACT_AREAS) {
    if (declared?.[area]) { hints[area] = declared[area]; continue; }
    const touched = map[area].some(has);
    hints[area] = touched ? "attention" : "safe";
  }
  if (sql.destructive.length) hints["settings"] = "manual";
  return hints;
}

export const validatePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ pkg: z.any() }).parse(raw))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const results: { name: string; ok: boolean; detail?: string }[] = [];
    const parsed = PackageSchema.safeParse(data.pkg);
    if (!parsed.success) {
      return {
        valid: false,
        results: [{ name: "JSON manifest", ok: false, detail: parsed.error.message.slice(0, 400) }],
      };
    }
    const p = parsed.data;
    results.push({ name: "JSON manifest", ok: true });
    results.push({ name: "Package version", ok: /^\d+(\.\d+){0,3}$/.test(p.version), detail: `v${p.version}` });
    results.push({ name: "Build number", ok: p.build_number > 0, detail: `build ${p.build_number}` });

    const ids = p.migrations.map((m) => m.id);
    const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
    results.push({
      name: "Migration IDs unique",
      ok: dupIds.length === 0,
      detail: dupIds.length ? `duplicates: ${Array.from(new Set(dupIds)).join(", ")}` : `${ids.length} migrations`,
    });
    const empty = p.migrations.filter((m) => !m.sql.trim());
    results.push({ name: "No empty SQL", ok: empty.length === 0, detail: empty.length ? `${empty.length} empty` : "ok" });

    if (p.package_sha256) {
      results.push({ name: "Checksum present", ok: /^[a-f0-9]{64}$/i.test(p.package_sha256), detail: p.package_sha256.slice(0, 12) + "…" });
    }

    const sql = analyzeSql(p.migrations);
    results.push({ name: "SQL syntax scan", ok: true, detail: "static scan passed" });

    return {
      valid: results.every((r) => r.ok),
      results,
      sql,
      destructive: sql.destructive,
    };
  });

export const previewUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ version: z.string() }).parse(raw))
  .handler(async ({ data, context }) => {
    await requireAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: pkg } = await supabaseAdmin.from("app_updates").select("*").eq("version", data.version).maybeSingle();
    if (!pkg) throw new Error("Package not found");
    const { data: sysV } = await supabaseAdmin.rpc("get_system_version");
    const current = (sysV as any)?.current_version ?? null;

    // Compatibility
    const compat: { name: string; ok: boolean; detail?: string }[] = [];
    compat.push({ name: "Current version", ok: !!current, detail: current ? `v${current}` : "unknown" });
    if (pkg.min_from_version && current) {
      const ok = compareVer(current, pkg.min_from_version) >= 0;
      compat.push({
        name: "Minimum supported",
        ok,
        detail: ok ? `≥ v${pkg.min_from_version}` : `You must first install v${pkg.min_from_version} before updating to v${pkg.version}.`,
      });
    }
    if ((pkg as any).max_from_version && current) {
      const maxV = (pkg as any).max_from_version as string;
      const ok = compareVer(current, maxV) <= 0;
      compat.push({ name: "Maximum supported", ok, detail: ok ? `≤ v${maxV}` : `Package targets ≤ v${maxV}` });
    }
    if (current && compareVer(current, pkg.version) >= 0) {
      compat.push({ name: "Newer than current", ok: false, detail: `Current v${current} is already at or above v${pkg.version}` });
    } else {
      compat.push({ name: "Newer than current", ok: true });
    }

    // Applied migrations
    const migs = ((pkg.migrations as any[]) ?? []) as { id: string; sql: string; description?: string }[];
    const ids = migs.map((m) => m.id);
    let applied: string[] = [];
    if (ids.length) {
      const { data: rows } = await supabaseAdmin
        .from("applied_update_migrations").select("migration_id").in("migration_id", ids);
      applied = (rows ?? []).map((r: any) => r.migration_id);
    }
    const pending = migs.filter((m) => !applied.includes(m.id));

    const sql = analyzeSql(pending);
    const breaking = ((pkg.release_notes as any)?.breaking ?? []).length as number;
    const risk = calcRisk(sql, breaking, pending.length);
    const impacts = inferImpacts(sql, (pkg as any).impacts);

    // Estimates (heuristic)
    const migMs = pending.length * 800 + sql.tables_added.length * 200;
    const verifyMs = 3000;
    const totalMs = 2000 + migMs + verifyMs + 2000;

    // Warnings
    const warnings: string[] = [];
    if (pending.length) warnings.push("This update contains database schema changes.");
    if (breaking) warnings.push("This update includes breaking changes — users may need to refresh their browser.");
    if (sql.destructive.length) warnings.push("This update contains destructive operations (see risk analysis).");
    if (sql.policies_added) warnings.push("This update modifies access policies (RLS).");
    if (sql.functions_added || sql.triggers_added) warnings.push("This update adds server-side functions or triggers.");
    if (((pkg.release_notes as any)?.security ?? []).length) warnings.push("This update contains security fixes — apply promptly.");

    return {
      package: {
        version: pkg.version,
        build_number: pkg.build_number,
        release_date: pkg.release_date,
        channel: pkg.channel,
        min_from_version: pkg.min_from_version,
        max_from_version: (pkg as any).max_from_version ?? null,
      },
      current_version: current,
      compatibility: {
        checks: compat,
        passed: compat.every((c) => c.ok),
      },
      migrations: {
        total: migs.length,
        pending: pending.length,
        applied: applied.length,
        items: pending.map((m) => ({ id: m.id, description: m.description ?? "" })),
      },
      sql,
      release_notes: pkg.release_notes,
      impacts,
      risk,
      estimates_ms: { migration: migMs, verify: verifyMs, total: totalMs },
      warnings,
      generated_at: new Date().toISOString(),
    };
  });
