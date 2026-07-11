/**
 * License Manager — the single orchestration point between the
 * installer / admin panel / runtime and the underlying providers.
 *
 * Providers are registered in a plain map so adding a new marketplace
 * (Gumroad / Paddle / LemonSqueezy / Sellix / WooCommerce / Shopify /
 * custom) is a two-line change: add the class file, then register it
 * here. No existing code has to be touched.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { signHmac } from "./crypto.server";
import { EnvatoLicenseProvider } from "./providers/envato.server";
import { CodesterLicenseProvider } from "./providers/codester.server";
import { SelfLicenseProvider } from "./providers/self.server";
import type { LicenseProvider } from "./providers/base";
import type {
  HostFingerprint,
  LicenseIdentity,
  LicenseRecord,
  LicenseSourceId,
  LicenseStatus,
  LicenseVerificationResult,
  SignedLicenseCache,
} from "./types";

/* -------------------------- provider registry -------------------------- */

const PROVIDERS: Record<string, LicenseProvider> = {
  self: new SelfLicenseProvider(),
  envato: new EnvatoLicenseProvider(),
  codester: new CodesterLicenseProvider(),
  // future: gumroad, paddle, lemonsqueezy, sellix, woocommerce, shopify, custom
};

export function getProvider(sourceId: LicenseSourceId): LicenseProvider {
  const p = PROVIDERS[sourceId];
  if (!p) throw new Error(`Unknown license source: ${sourceId}`);
  return p;
}

export function listProviders(): LicenseProvider[] {
  return Object.values(PROVIDERS);
}

/* --------------------------- logging helper --------------------------- */

async function logAction(entry: {
  licenseId?: string | null;
  action: string;
  outcome: "ok" | "fail" | "warn";
  message?: string;
  actorUserId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  context?: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.from("license_logs").insert({
      license_id: entry.licenseId ?? null,
      action: entry.action,
      outcome: entry.outcome,
      message: entry.message ?? null,
      actor_user_id: entry.actorUserId ?? null,
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
      context: entry.context ?? {},
    } as any);
  } catch {
    // Logging must never break the caller.
  }
}

/* --------------------------- signed cache ---------------------------- */

const CACHE_SETTING_KEY = "license_cache";
const DEFAULT_GRACE_SECONDS = 7 * 24 * 60 * 60;

async function writeCache(cache: Omit<SignedLicenseCache, "signature">) {
  const signature = signHmac(cache);
  const value: SignedLicenseCache = { ...cache, signature };
  await supabaseAdmin
    .from("app_settings")
    .upsert(
      { key: CACHE_SETTING_KEY, value: value as any, updated_at: new Date().toISOString() } as any,
      { onConflict: "key" },
    );
}

export async function readCache(): Promise<SignedLicenseCache | null> {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", CACHE_SETTING_KEY)
    .maybeSingle();
  return (data?.value as SignedLicenseCache | undefined) ?? null;
}

/* -------------------------- DB record helpers -------------------------- */

function rowToRecord(row: any): LicenseRecord {
  const plan = (row.license_plan ?? "monthly") as LicenseRecord["plan"];
  const isLifetime = plan === "lifetime";
  return {
    id: row.id,
    licenseKey: row.license_key,
    purchaseCode: row.purchase_code,
    sourceId: row.source_id,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    product: row.product,
    productVersion: row.product_version,
    activationDate: row.activation_date,
    expiryDate: isLifetime ? null : row.expiry_date,
    maxActivations: row.max_activations,
    currentActivations: row.current_activations,
    currentDomain: row.current_domain,
    serverIp: row.server_ip,
    installationId: row.installation_id,
    lastValidationAt: row.last_validation_at,
    lastValidationOk: row.last_validation_ok,
    status: row.status,
    notes: row.notes,
    metadata: row.metadata ?? {},
    plan,
    isLifetime,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findByKey(key: string): Promise<LicenseRecord | null> {
  const { data } = await supabaseAdmin
    .from("licenses")
    .select("*")
    .eq("license_key", key)
    .maybeSingle();
  return data ? rowToRecord(data) : null;
}

/* --------------------------- public API --------------------------- */

export const LicenseManager = {
  listProviders,
  getProvider,
  readCache,

  /** Ask the provider whether an identity is valid. No DB side effects. */
  async verify(
    sourceId: LicenseSourceId,
    identity: LicenseIdentity,
    host: HostFingerprint,
  ): Promise<LicenseVerificationResult> {
    const provider = getProvider(sourceId);
    const result = await provider.verify(identity, host);
    await logAction({
      action: "verify",
      outcome: result.ok ? "ok" : "fail",
      message: result.message,
      context: { source: sourceId, domain: host.domain },
    });
    return result;
  },

  /**
   * Verify + upsert `licenses` + create `license_activations` row +
   * write the signed local cache. This is what the installer calls.
   */
  async activate(
    sourceId: LicenseSourceId,
    identity: LicenseIdentity,
    host: HostFingerprint,
    opts: { actorUserId?: string | null; gracePeriodSeconds?: number } = {},
  ): Promise<{ ok: boolean; message?: string; license?: LicenseRecord; result: LicenseVerificationResult }> {
    const result = await LicenseManager.verify(sourceId, identity, host);
    if (!result.ok) {
      return { ok: false, message: result.message, result };
    }

    // Domain lock: if the key already exists for another domain, refuse.
    const existing = await findByKey(result.license.key);
    if (existing && existing.currentDomain && existing.currentDomain !== host.domain) {
      const message = `License already activated on ${existing.currentDomain}. Reset activation from the admin panel first.`;
      await logAction({
        licenseId: existing.id,
        action: "activate",
        outcome: "fail",
        message,
        actorUserId: opts.actorUserId,
        context: { attempted_domain: host.domain },
      });
      return { ok: false, message, result };
    }

    const now = new Date().toISOString();
    const upsertPayload: any = {
      license_key: result.license.key,
      purchase_code: result.license.purchaseCode ?? null,
      source_id: sourceId,
      customer_email: result.license.customerEmail ?? null,
      customer_name: result.license.customerName ?? null,
      product: result.license.product ?? "boobubble",
      product_version: result.license.productVersion ?? host.productVersion ?? null,
      activation_date: result.license.activationDate ?? now,
      expiry_date: result.license.plan === "lifetime" ? null : (result.license.expiryDate ?? null),
      max_activations: result.license.maxActivations ?? 1,
      license_plan: result.license.plan ?? (existing?.plan ?? undefined),
      current_domain: host.domain,
      server_ip: host.serverIp ?? null,
      installation_id: host.installationId ?? null,
      last_validation_at: now,
      last_validation_ok: true,
      status: result.status ?? "active",
      updated_at: now,
    };
    if (!existing) upsertPayload.current_activations = 1;

    const { data: upserted, error: upErr } = await supabaseAdmin
      .from("licenses")
      .upsert(upsertPayload, { onConflict: "license_key" })
      .select("*")
      .single();
    if (upErr || !upserted) {
      const message = `Failed to persist license: ${upErr?.message ?? "unknown"}`;
      await logAction({ action: "activate", outcome: "fail", message, actorUserId: opts.actorUserId });
      return { ok: false, message, result };
    }
    const record = rowToRecord(upserted);

    // Deactivate stale rows for the same license, then upsert the current one.
    await supabaseAdmin
      .from("license_activations")
      .update({ active: false, deactivated_at: now, updated_at: now } as any)
      .eq("license_id", record.id)
      .eq("active", true)
      .neq("domain", host.domain);

    await supabaseAdmin
      .from("license_activations")
      .upsert(
        {
          license_id: record.id,
          domain: host.domain,
          server_ip: host.serverIp ?? null,
          installation_id: host.installationId ?? null,
          runtime: host.runtime ?? null,
          product_version: host.productVersion ?? null,
          active: true,
          activated_at: now,
          last_seen_at: now,
        } as any,
        { onConflict: "license_id,domain" },
      );

    // Recount active activations to keep `current_activations` honest.
    const { count } = await supabaseAdmin
      .from("license_activations")
      .select("*", { count: "exact", head: true })
      .eq("license_id", record.id)
      .eq("active", true);
    await supabaseAdmin
      .from("licenses")
      .update({ current_activations: count ?? 1, updated_at: now } as any)
      .eq("id", record.id);

    // Signed local cache.
    await writeCache({
      version: 1,
      issuedAt: now,
      status: record.status,
      sourceId,
      licenseId: record.id,
      domain: host.domain,
      serverIp: host.serverIp,
      productVersion: host.productVersion,
      expiryDate: record.expiryDate ?? undefined,
      gracePeriodSeconds: opts.gracePeriodSeconds ?? DEFAULT_GRACE_SECONDS,
    });

    await logAction({
      licenseId: record.id,
      action: "activate",
      outcome: "ok",
      message: `Activated for ${host.domain}`,
      actorUserId: opts.actorUserId,
      context: { source: sourceId },
    });

    return { ok: true, license: record, result };
  },

  /** Runtime re-check — updates cache + logs, honours domain lock. */
  async check(host: HostFingerprint): Promise<{ ok: boolean; status: LicenseStatus; message?: string; cache: SignedLicenseCache | null }> {
    const cache = await readCache();
    if (!cache) return { ok: false, status: "pending", message: "No license cached", cache: null };
    if (cache.domain && host.domain && cache.domain !== host.domain) {
      return { ok: false, status: "revoked", message: `License bound to ${cache.domain}`, cache };
    }
    const { data: row } = await supabaseAdmin
      .from("licenses")
      .select("*")
      .eq("id", cache.licenseId)
      .maybeSingle();
    if (!row) return { ok: false, status: "revoked", message: "License not found", cache };
    const record = rowToRecord(row);
    const now = new Date();
    // Lifetime licenses never expire — only suspended / revoked / disabled can invalidate them.
    const expired = record.isLifetime ? false : record.expiryDate ? new Date(record.expiryDate) < now : false;
    const nextStatus: LicenseStatus = expired ? "expired" : record.status;
    const ok = nextStatus === "active" || nextStatus === "development" || nextStatus === "localhost" || nextStatus === "unlimited";

    await supabaseAdmin
      .from("licenses")
      .update({
        last_validation_at: now.toISOString(),
        last_validation_ok: ok,
        status: nextStatus,
      } as any)
      .eq("id", record.id);

    await writeCache({
      version: 1,
      issuedAt: now.toISOString(),
      status: nextStatus,
      sourceId: record.sourceId,
      licenseId: record.id,
      domain: cache.domain,
      serverIp: host.serverIp ?? cache.serverIp,
      productVersion: host.productVersion ?? cache.productVersion,
      expiryDate: record.expiryDate ?? undefined,
      gracePeriodSeconds: cache.gracePeriodSeconds,
    });

    await logAction({
      licenseId: record.id,
      action: "check",
      outcome: ok ? "ok" : "warn",
      message: ok ? undefined : `Status: ${nextStatus}`,
      context: { domain: host.domain },
    });

    return { ok, status: nextStatus, cache };
  },

  async deactivate(licenseId: string, domain?: string, opts: { actorUserId?: string | null } = {}) {
    const now = new Date().toISOString();
    const q = supabaseAdmin
      .from("license_activations")
      .update({ active: false, deactivated_at: now, updated_at: now } as any)
      .eq("license_id", licenseId)
      .eq("active", true);
    if (domain) q.eq("domain", domain);
    const { error } = await q;
    if (error) throw new Error(error.message);
    await logAction({
      licenseId,
      action: "deactivate",
      outcome: "ok",
      actorUserId: opts.actorUserId,
      context: { domain: domain ?? "all" },
    });
    return { ok: true };
  },

  /** Wipe all activations + current_domain so the license can move host. */
  async resetActivation(licenseId: string, opts: { actorUserId?: string | null } = {}) {
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("license_activations")
      .update({ active: false, deactivated_at: now, updated_at: now } as any)
      .eq("license_id", licenseId)
      .eq("active", true);
    await supabaseAdmin
      .from("licenses")
      .update({
        current_domain: null,
        server_ip: null,
        installation_id: null,
        current_activations: 0,
        updated_at: now,
      } as any)
      .eq("id", licenseId);
    await logAction({
      licenseId,
      action: "reset",
      outcome: "ok",
      actorUserId: opts.actorUserId,
    });
    return { ok: true };
  },

  async setStatus(licenseId: string, status: LicenseStatus, opts: { actorUserId?: string | null; message?: string } = {}) {
    await supabaseAdmin
      .from("licenses")
      .update({ status, updated_at: new Date().toISOString() } as any)
      .eq("id", licenseId);
    await logAction({
      licenseId,
      action: status === "suspended" ? "suspend" : status === "revoked" ? "revoke" : "status",
      outcome: "ok",
      message: opts.message,
      actorUserId: opts.actorUserId,
      context: { status },
    });
    return { ok: true };
  },

  async extendExpiry(licenseId: string, newExpiry: string | null, opts: { actorUserId?: string | null } = {}) {
    await supabaseAdmin
      .from("licenses")
      .update({ expiry_date: newExpiry, status: "active", updated_at: new Date().toISOString() } as any)
      .eq("id", licenseId);
    await logAction({
      licenseId,
      action: "extend",
      outcome: "ok",
      actorUserId: opts.actorUserId,
      context: { new_expiry: newExpiry },
    });
    return { ok: true };
  },

  async changeDomain(licenseId: string, newDomain: string, opts: { actorUserId?: string | null } = {}) {
    const now = new Date().toISOString();
    await supabaseAdmin
      .from("license_activations")
      .update({ active: false, deactivated_at: now, updated_at: now } as any)
      .eq("license_id", licenseId)
      .eq("active", true);
    await supabaseAdmin
      .from("licenses")
      .update({ current_domain: newDomain, current_activations: 0, updated_at: now } as any)
      .eq("id", licenseId);
    await logAction({
      licenseId,
      action: "domain_change",
      outcome: "ok",
      actorUserId: opts.actorUserId,
      context: { new_domain: newDomain },
    });
    return { ok: true };
  },
};

export type { LicenseRecord };
