/**
 * Public server-function surface for the License Manager.
 *
 * Client code (installer, admin panel, runtime guard) imports from this
 * file — NEVER from `manager.server.ts` directly. The `.server.ts`
 * module is loaded inside handler bodies only, keeping server-only
 * imports out of client bundles.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { APP_VERSION } from "@/lib/app-version";
import type {
  HostFingerprint,
  LicenseRecord,
  LicenseSourceId,
  LicenseStatus,
} from "./types";

/* ---------------------------- validators ---------------------------- */

const HostSchema = z.object({
  domain: z.string().trim().min(1).max(253),
  serverIp: z.string().trim().max(64).optional(),
  installationId: z.string().trim().max(120).optional(),
  productVersion: z.string().trim().max(32).optional(),
  runtime: z.string().trim().max(64).optional(),
});

const IdentitySchema = z.object({
  key: z.string().trim().min(4).max(200),
  purchaseCode: z.string().trim().max(200).optional(),
  customerEmail: z.string().trim().email().max(255).optional(),
});

const SourceIdSchema = z.string().trim().min(1).max(32);

/* ------------------------- shared enrichment ------------------------- */

function enrichHost(host: z.infer<typeof HostSchema>): HostFingerprint {
  const ip = host.serverIp ?? getRequestIP({ xForwardedFor: true }) ?? undefined;
  return {
    domain: host.domain,
    serverIp: ip,
    installationId: host.installationId,
    runtime: host.runtime ?? "workerd",
    productVersion: host.productVersion ?? APP_VERSION,
  };
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  const { data: data2 } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (!data && !data2) throw new Error("Forbidden");
}

/* ---------------------------- public reads ---------------------------- */

export const listLicenseSources = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("license_sources")
    .select("id,label,provider,enabled,sort_order")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return { sources: data ?? [] };
});

/* ------------------------ installer surface ------------------------ */

const VerifyInput = z.object({
  sourceId: SourceIdSchema,
  identity: IdentitySchema,
  host: HostSchema,
});

/**
 * Unauthenticated — used by the installer BEFORE the first admin
 * exists. Only verifies with the provider, never writes to the DB.
 */
export const verifyLicense = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => VerifyInput.parse(v))
  .handler(async ({ data }) => {
    const { LicenseManager } = await import("./manager.server");
    const result = await LicenseManager.verify(
      data.sourceId as LicenseSourceId,
      data.identity,
      enrichHost(data.host),
    );
    return result;
  });

/**
 * Unauthenticated — installer calls this to complete activation and
 * write the signed local cache. Refuses to create a second license
 * once one is already active for a different domain.
 */
export const activateLicense = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => VerifyInput.parse(v))
  .handler(async ({ data }) => {
    const { LicenseManager } = await import("./manager.server");
    const outcome = await LicenseManager.activate(
      data.sourceId as LicenseSourceId,
      data.identity,
      enrichHost(data.host),
    );
    return {
      ok: outcome.ok,
      message: outcome.message,
      license: outcome.license ?? null,
      result: outcome.result,
    };
  });

/* --------------------------- runtime check --------------------------- */

const CheckInput = z.object({ host: HostSchema });

export const checkLicense = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => CheckInput.parse(v))
  .handler(async ({ data }) => {
    const { LicenseManager } = await import("./manager.server");
    return LicenseManager.check(enrichHost(data.host));
  });

/** Read-only current cache — safe for public routes (no secrets echoed). */
export const readLicenseCache = createServerFn({ method: "GET" }).handler(async () => {
  const { LicenseManager } = await import("./manager.server");
  const cache = await LicenseManager.readCache();
  if (!cache) return { cached: false as const };
  const { signature: _sig, ...rest } = cache;
  void _sig;
  return { cached: true as const, cache: rest };
});

/* -------------------------- admin surface -------------------------- */

const AdminListInput = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.string().trim().max(32).optional(),
  sourceId: z.string().trim().max(32).optional(),
  plan: z.enum(["trial", "monthly", "yearly", "lifetime"]).optional(),
  limit: z.number().int().min(1).max(200).default(50),
  offset: z.number().int().min(0).default(0),
});

export const adminListLicenses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => AdminListInput.parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("licenses")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);
    if (data.status) q = q.eq("status", data.status as any);
    if (data.sourceId) q = q.eq("source_id", data.sourceId);
    if (data.plan) q = q.eq("license_plan", data.plan);
    if (data.search) {
      q = q.or(
        [
          `license_key.ilike.%${data.search}%`,
          `purchase_code.ilike.%${data.search}%`,
          `customer_email.ilike.%${data.search}%`,
          `current_domain.ilike.%${data.search}%`,
        ].join(","),
      );
    }
    const { data: rows, count, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: rows ?? [], count: count ?? 0 };
  });

export const adminGetLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: license }, { data: activations }, { data: logs }] = await Promise.all([
      supabaseAdmin.from("licenses").select("*").eq("id", data.id).maybeSingle(),
      supabaseAdmin
        .from("license_activations")
        .select("*")
        .eq("license_id", data.id)
        .order("activated_at", { ascending: false }),
      supabaseAdmin
        .from("license_logs")
        .select("*")
        .eq("license_id", data.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    return { license, activations: activations ?? [], logs: logs ?? [] };
  });

export const adminLicenseStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("license_statistics")
      .select("*")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? {};
  });

const PlanSchema = z.enum(["trial", "monthly", "yearly", "lifetime"]);

/** Compute a sensible default expiry when the admin doesn't provide one. */
function planDefaultExpiry(plan: z.infer<typeof PlanSchema>): string | null {
  const now = new Date();
  switch (plan) {
    case "trial":    now.setDate(now.getDate() + 14); return now.toISOString();
    case "monthly":  now.setMonth(now.getMonth() + 1); return now.toISOString();
    case "yearly":   now.setFullYear(now.getFullYear() + 1); return now.toISOString();
    case "lifetime": return null;
  }
}

const GenerateSelfInput = z.object({
  customerEmail: z.string().trim().email(),
  customerName: z.string().trim().max(120).optional(),
  productVersion: z.string().trim().max(32).optional(),
  plan: PlanSchema.default("monthly"),
  expiryDate: z.string().datetime().nullable().optional(),
  maxActivations: z.number().int().min(1).max(1000).default(1),
});

function randomSelfKey(): string {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () =>
    Array.from({ length: 4 }, () => alpha[Math.floor(Math.random() * alpha.length)]).join("");
  return `BOOB-${seg()}-${seg()}-${seg()}-${seg()}`;
}

export const adminGenerateSelfLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => GenerateSelfInput.parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const key = randomSelfKey();
    const expiry =
      data.plan === "lifetime"
        ? null
        : (data.expiryDate ?? planDefaultExpiry(data.plan));
    const { data: row, error } = await supabaseAdmin
      .from("licenses")
      .insert({
        license_key: key,
        source_id: "self",
        customer_email: data.customerEmail,
        customer_name: data.customerName ?? null,
        product: "boobubble",
        product_version: data.productVersion ?? APP_VERSION,
        max_activations: data.maxActivations,
        license_plan: data.plan,
        expiry_date: expiry,
        status: "pending",
      } as any)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("license_logs").insert({
      license_id: row.id,
      action: "generate",
      outcome: "ok",
      actor_user_id: context.userId,
      context: { source: "self", plan: data.plan },
    } as any);
    return { license: row };
  });

const ImportInput = z.object({
  sourceId: SourceIdSchema,
  licenseKey: z.string().trim().min(4).max(200),
  purchaseCode: z.string().trim().max(200).optional(),
  customerEmail: z.string().trim().email().optional(),
  customerName: z.string().trim().max(120).optional(),
  productVersion: z.string().trim().max(32).optional(),
  plan: PlanSchema.default("monthly"),
  expiryDate: z.string().datetime().nullable().optional(),
  maxActivations: z.number().int().min(1).max(1000).default(1),
  status: z.string().trim().max(32).default("active"),
});

export const adminImportLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => ImportInput.parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("licenses")
      .upsert(
        {
          license_key: data.licenseKey,
          purchase_code: data.purchaseCode ?? null,
          source_id: data.sourceId,
          customer_email: data.customerEmail ?? null,
          customer_name: data.customerName ?? null,
          product: "boobubble",
          product_version: data.productVersion ?? APP_VERSION,
          max_activations: data.maxActivations,
          expiry_date: data.expiryDate ?? null,
          status: data.status as any,
        } as any,
        { onConflict: "license_key" },
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("license_logs").insert({
      license_id: row.id,
      action: "import",
      outcome: "ok",
      actor_user_id: context.userId,
    } as any);
    return { license: row };
  });

const IdInput = z.object({ id: z.string().uuid() });

export const adminSuspendLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => IdInput.parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { LicenseManager } = await import("./manager.server");
    return LicenseManager.setStatus(data.id, "suspended", { actorUserId: context.userId });
  });

export const adminRevokeLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => IdInput.parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { LicenseManager } = await import("./manager.server");
    return LicenseManager.setStatus(data.id, "revoked", { actorUserId: context.userId });
  });

export const adminActivateLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => IdInput.parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { LicenseManager } = await import("./manager.server");
    return LicenseManager.setStatus(data.id, "active", { actorUserId: context.userId });
  });

export const adminResetActivation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => IdInput.parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { LicenseManager } = await import("./manager.server");
    return LicenseManager.resetActivation(data.id, { actorUserId: context.userId });
  });

export const adminExtendExpiry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z
      .object({ id: z.string().uuid(), expiryDate: z.string().datetime().nullable() })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { LicenseManager } = await import("./manager.server");
    return LicenseManager.extendExpiry(data.id, data.expiryDate, { actorUserId: context.userId });
  });

export const adminChangeDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) =>
    z.object({ id: z.string().uuid(), domain: z.string().trim().min(1).max(253) }).parse(v),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { LicenseManager } = await import("./manager.server");
    return LicenseManager.changeDomain(data.id, data.domain, { actorUserId: context.userId });
  });

export const adminDeleteLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => IdInput.parse(v))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("licenses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("license_logs").insert({
      license_id: null,
      action: "delete",
      outcome: "ok",
      actor_user_id: context.userId,
      context: { deleted_id: data.id },
    } as any);
    return { ok: true };
  });

export const adminExportLicensesCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("licenses")
      .select(
        "license_key,purchase_code,source_id,customer_email,customer_name,product,product_version,activation_date,expiry_date,max_activations,current_activations,current_domain,status,created_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const rows: LicenseRecord[] = (data ?? []) as any;
    const header =
      "license_key,purchase_code,source,customer_email,customer_name,product,product_version,activation_date,expiry_date,max_activations,current_activations,current_domain,status,created_at";
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const body = rows
      .map((r: any) =>
        [
          r.license_key,
          r.purchase_code,
          r.source_id,
          r.customer_email,
          r.customer_name,
          r.product,
          r.product_version,
          r.activation_date,
          r.expiry_date,
          r.max_activations,
          r.current_activations,
          r.current_domain,
          r.status,
          r.created_at,
        ]
          .map(escape)
          .join(","),
      )
      .join("\n");
    return { csv: `${header}\n${body}`, filename: `licenses-${Date.now()}.csv` };
  });

export type { LicenseRecord, LicenseStatus };
