import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { s as signHmac } from "./crypto.server-Cse2FImr.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
import "node:crypto";
const ENVATO_PURCHASE_CODE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SELF_LICENSE_KEY_RE = /^BOOB(-[A-Z0-9]{4}){4}$/i;
const CODESTER_PURCHASE_CODE_RE = /^[A-Za-z0-9-]{10,64}$/;
class EnvatoLicenseProvider {
  sourceId = "envato";
  label = "CodeCanyon (Envato)";
  async verify(identity, host) {
    const code = (identity.purchaseCode ?? identity.key)?.trim();
    if (!code || !ENVATO_PURCHASE_CODE_RE.test(code)) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code ?? "" },
        message: "Envato purchase code must be a UUID-shaped hex string."
      };
    }
    const token = process.env.ENVATO_PERSONAL_TOKEN;
    if (!token || token === "ADD_LATER") {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code, purchaseCode: code },
        message: "ENVATO_PERSONAL_TOKEN is not configured — add it in Backend > Secrets."
      };
    }
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8e3);
      const r = await fetch(
        `https://api.envato.com/v3/market/author/sale?code=${encodeURIComponent(code)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "User-Agent": "BooBubble License Manager"
          },
          signal: controller.signal
        }
      );
      clearTimeout(t);
      if (r.status === 404) {
        return {
          ok: false,
          status: "revoked",
          sourceId: this.sourceId,
          license: { key: code, purchaseCode: code },
          message: "Envato does not recognize this purchase code."
        };
      }
      const body = await r.json().catch(() => ({}));
      if (!r.ok) {
        return {
          ok: false,
          status: "pending",
          sourceId: this.sourceId,
          license: { key: code, purchaseCode: code },
          message: body?.description ?? `Envato returned ${r.status}`,
          raw: body
        };
      }
      return {
        ok: true,
        status: "active",
        sourceId: this.sourceId,
        license: {
          key: code,
          purchaseCode: code,
          customerName: body?.buyer,
          product: body?.item?.name ?? "boobubble",
          productVersion: host.productVersion,
          activationDate: body?.sold_at,
          // Envato "Extended License" grants lifetime updates; otherwise support may lapse but the license itself remains valid.
          expiryDate: body?.license === "Extended License" ? null : body?.supported_until ?? void 0,
          maxActivations: body?.license === "Extended License" ? 1 : 1,
          plan: body?.license === "Extended License" ? "lifetime" : void 0
        },
        raw: {
          buyer: body?.buyer,
          license: body?.license,
          item_id: body?.item?.id,
          sold_at: body?.sold_at,
          supported_until: body?.supported_until
        }
      };
    } catch (e) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code, purchaseCode: code },
        message: `Envato API unreachable: ${e?.message ?? "unknown error"}`
      };
    }
  }
}
const CODESTER_VERIFY_URL = "https://www.codester.com/api/v1/verify-purchase";
class CodesterLicenseProvider {
  sourceId = "codester";
  label = "Codester";
  async verify(identity, host) {
    const code = (identity.purchaseCode ?? identity.key)?.trim();
    if (!code || !CODESTER_PURCHASE_CODE_RE.test(code)) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code ?? "" },
        message: "Codester purchase code format is invalid."
      };
    }
    const apiKey = process.env.CODESTER_API_KEY;
    if (!apiKey || apiKey === "ADD_LATER") {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code, purchaseCode: code },
        message: "CODESTER_API_KEY is not configured — add it in Backend > Secrets."
      };
    }
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8e3);
      const r = await fetch(CODESTER_VERIFY_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "User-Agent": "BooBubble License Manager"
        },
        body: JSON.stringify({ purchase_code: code, domain: host.domain }),
        signal: controller.signal
      });
      clearTimeout(t);
      const body = await r.json().catch(() => ({}));
      if (!r.ok || body?.valid === false || body?.ok === false) {
        return {
          ok: false,
          status: r.status === 404 ? "revoked" : "pending",
          sourceId: this.sourceId,
          license: { key: code, purchaseCode: code },
          message: body?.message ?? `Codester returned ${r.status}`,
          raw: body
        };
      }
      return {
        ok: true,
        status: "active",
        sourceId: this.sourceId,
        license: {
          key: code,
          purchaseCode: code,
          customerEmail: body?.buyer_email,
          customerName: body?.buyer,
          product: body?.item?.name ?? "boobubble",
          productVersion: host.productVersion,
          activationDate: body?.purchased_at,
          expiryDate: body?.plan === "lifetime" ? null : body?.supported_until ?? void 0,
          maxActivations: 1,
          plan: body?.plan ?? body?.license_type ?? void 0
        },
        raw: body
      };
    } catch (e) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: code, purchaseCode: code },
        message: `Codester API unreachable: ${e?.message ?? "unknown error"}`
      };
    }
  }
}
function isPlaceholderUrl(url) {
  return !url || url.includes("yourdomain") || url === "https://licenses.yourdomain.com";
}
class SelfLicenseProvider {
  sourceId = "self";
  label = "Self Website";
  async verify(identity, host) {
    const key = identity.key?.trim();
    const email = identity.customerEmail?.trim();
    if (!key || !SELF_LICENSE_KEY_RE.test(key)) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key: key ?? "" },
        message: "License key format must look like BOOB-XXXX-XXXX-XXXX-XXXX."
      };
    }
    if (!email) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key },
        message: "Customer email is required for a Self Website license."
      };
    }
    const url = process.env.LICENSE_SERVER_URL ?? "";
    if (isPlaceholderUrl(url) || !process.env.LICENSE_SERVER_HMAC_SECRET || process.env.LICENSE_SERVER_HMAC_SECRET === "CHANGE_ME_LATER") {
      return {
        ok: true,
        status: "active",
        sourceId: this.sourceId,
        license: {
          key,
          customerEmail: email,
          product: "boobubble",
          productVersion: host.productVersion,
          activationDate: (/* @__PURE__ */ new Date()).toISOString(),
          maxActivations: 1
        },
        message: "Verified locally (LICENSE_SERVER_URL not configured)."
      };
    }
    const payload = {
      key,
      email,
      domain: host.domain,
      server_ip: host.serverIp ?? null,
      installation_id: host.installationId ?? null,
      product: "boobubble",
      product_version: host.productVersion ?? null,
      issued_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    const signature = signHmac(payload, "LICENSE_SERVER_HMAC_SECRET");
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 8e3);
      const r = await fetch(new URL("/api/public/license/verify", url).toString(), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-license-signature": signature
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(t);
      const body = await r.json().catch(() => ({}));
      if (!r.ok || body?.ok !== true) {
        return {
          ok: false,
          status: body?.status ?? "pending",
          sourceId: this.sourceId,
          license: { key, customerEmail: email },
          message: body?.message ?? `Self server returned ${r.status}`,
          raw: body
        };
      }
      return {
        ok: true,
        status: body?.status ?? "active",
        sourceId: this.sourceId,
        license: {
          key,
          customerEmail: email,
          customerName: body?.customer_name,
          product: body?.product ?? "boobubble",
          productVersion: body?.product_version ?? host.productVersion,
          activationDate: body?.activation_date,
          expiryDate: body?.plan === "lifetime" || body?.is_lifetime ? null : body?.expiry_date,
          maxActivations: body?.max_activations ?? 1,
          plan: body?.plan ?? (body?.is_lifetime ? "lifetime" : void 0),
          isLifetime: body?.plan === "lifetime" || body?.is_lifetime === true
        },
        raw: body
      };
    } catch (e) {
      return {
        ok: false,
        status: "pending",
        sourceId: this.sourceId,
        license: { key, customerEmail: email },
        message: `Self server unreachable: ${e?.message ?? "unknown error"}`
      };
    }
  }
}
const PROVIDERS = {
  self: new SelfLicenseProvider(),
  envato: new EnvatoLicenseProvider(),
  codester: new CodesterLicenseProvider()
  // future: gumroad, paddle, lemonsqueezy, sellix, woocommerce, shopify, custom
};
function getProvider(sourceId) {
  const p = PROVIDERS[sourceId];
  if (!p) throw new Error(`Unknown license source: ${sourceId}`);
  return p;
}
function listProviders() {
  return Object.values(PROVIDERS);
}
async function logAction(entry) {
  try {
    await supabaseAdmin.from("license_logs").insert({
      license_id: entry.licenseId ?? null,
      action: entry.action,
      outcome: entry.outcome,
      message: entry.message ?? null,
      actor_user_id: entry.actorUserId ?? null,
      ip_address: entry.ipAddress ?? null,
      user_agent: entry.userAgent ?? null,
      context: entry.context ?? {}
    });
  } catch {
  }
}
const CACHE_SETTING_KEY = "license_cache";
const DEFAULT_GRACE_SECONDS = 7 * 24 * 60 * 60;
async function writeCache(cache) {
  const signature = signHmac(cache);
  const value = { ...cache, signature };
  await supabaseAdmin.from("app_settings").upsert(
    { key: CACHE_SETTING_KEY, value, updated_at: (/* @__PURE__ */ new Date()).toISOString() },
    { onConflict: "key" }
  );
}
async function readCache() {
  const { data } = await supabaseAdmin.from("app_settings").select("value").eq("key", CACHE_SETTING_KEY).maybeSingle();
  return data?.value ?? null;
}
function rowToRecord(row) {
  const plan = row.license_plan ?? "monthly";
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
    updatedAt: row.updated_at
  };
}
async function findByKey(key) {
  const { data } = await supabaseAdmin.from("licenses").select("*").eq("license_key", key).maybeSingle();
  return data ? rowToRecord(data) : null;
}
const LicenseManager = {
  listProviders,
  getProvider,
  readCache,
  /** Ask the provider whether an identity is valid. No DB side effects. */
  async verify(sourceId, identity, host) {
    const provider = getProvider(sourceId);
    const result = await provider.verify(identity, host);
    await logAction({
      action: "verify",
      outcome: result.ok ? "ok" : "fail",
      message: result.message,
      context: { source: sourceId, domain: host.domain }
    });
    return result;
  },
  /**
   * Verify + upsert `licenses` + create `license_activations` row +
   * write the signed local cache. This is what the installer calls.
   */
  async activate(sourceId, identity, host, opts = {}) {
    const result = await LicenseManager.verify(sourceId, identity, host);
    if (!result.ok) {
      return { ok: false, message: result.message, result };
    }
    const existing = await findByKey(result.license.key);
    if (existing && existing.currentDomain && existing.currentDomain !== host.domain) {
      const message = `License already activated on ${existing.currentDomain}. Reset activation from the admin panel first.`;
      await logAction({
        licenseId: existing.id,
        action: "activate",
        outcome: "fail",
        message,
        actorUserId: opts.actorUserId,
        context: { attempted_domain: host.domain }
      });
      return { ok: false, message, result };
    }
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const upsertPayload = {
      license_key: result.license.key,
      purchase_code: result.license.purchaseCode ?? null,
      source_id: sourceId,
      customer_email: result.license.customerEmail ?? null,
      customer_name: result.license.customerName ?? null,
      product: result.license.product ?? "boobubble",
      product_version: result.license.productVersion ?? host.productVersion ?? null,
      activation_date: result.license.activationDate ?? now,
      expiry_date: result.license.plan === "lifetime" ? null : result.license.expiryDate ?? null,
      max_activations: result.license.maxActivations ?? 1,
      license_plan: result.license.plan ?? (existing?.plan ?? void 0),
      current_domain: host.domain,
      server_ip: host.serverIp ?? null,
      installation_id: host.installationId ?? null,
      last_validation_at: now,
      last_validation_ok: true,
      status: result.status ?? "active",
      updated_at: now
    };
    if (!existing) upsertPayload.current_activations = 1;
    const { data: upserted, error: upErr } = await supabaseAdmin.from("licenses").upsert(upsertPayload, { onConflict: "license_key" }).select("*").single();
    if (upErr || !upserted) {
      const message = `Failed to persist license: ${upErr?.message ?? "unknown"}`;
      await logAction({ action: "activate", outcome: "fail", message, actorUserId: opts.actorUserId });
      return { ok: false, message, result };
    }
    const record = rowToRecord(upserted);
    await supabaseAdmin.from("license_activations").update({ active: false, deactivated_at: now, updated_at: now }).eq("license_id", record.id).eq("active", true).neq("domain", host.domain);
    await supabaseAdmin.from("license_activations").upsert(
      {
        license_id: record.id,
        domain: host.domain,
        server_ip: host.serverIp ?? null,
        installation_id: host.installationId ?? null,
        runtime: host.runtime ?? null,
        product_version: host.productVersion ?? null,
        active: true,
        activated_at: now,
        last_seen_at: now
      },
      { onConflict: "license_id,domain" }
    );
    const { count } = await supabaseAdmin.from("license_activations").select("*", { count: "exact", head: true }).eq("license_id", record.id).eq("active", true);
    await supabaseAdmin.from("licenses").update({ current_activations: count ?? 1, updated_at: now }).eq("id", record.id);
    await writeCache({
      version: 1,
      issuedAt: now,
      status: record.status,
      sourceId,
      licenseId: record.id,
      domain: host.domain,
      serverIp: host.serverIp,
      productVersion: host.productVersion,
      expiryDate: record.expiryDate ?? void 0,
      gracePeriodSeconds: opts.gracePeriodSeconds ?? DEFAULT_GRACE_SECONDS
    });
    await logAction({
      licenseId: record.id,
      action: "activate",
      outcome: "ok",
      message: `Activated for ${host.domain}`,
      actorUserId: opts.actorUserId,
      context: { source: sourceId }
    });
    return { ok: true, license: record, result };
  },
  /** Runtime re-check — updates cache + logs, honours domain lock. */
  async check(host) {
    const cache = await readCache();
    if (!cache) return { ok: false, status: "pending", message: "No license cached", cache: null };
    if (cache.domain && host.domain && cache.domain !== host.domain) {
      return { ok: false, status: "revoked", message: `License bound to ${cache.domain}`, cache };
    }
    const { data: row } = await supabaseAdmin.from("licenses").select("*").eq("id", cache.licenseId).maybeSingle();
    if (!row) return { ok: false, status: "revoked", message: "License not found", cache };
    const record = rowToRecord(row);
    const now = /* @__PURE__ */ new Date();
    const expired = record.isLifetime ? false : record.expiryDate ? new Date(record.expiryDate) < now : false;
    const nextStatus = expired ? "expired" : record.status;
    const ok = nextStatus === "active" || nextStatus === "development" || nextStatus === "localhost" || nextStatus === "unlimited";
    await supabaseAdmin.from("licenses").update({
      last_validation_at: now.toISOString(),
      last_validation_ok: ok,
      status: nextStatus
    }).eq("id", record.id);
    await writeCache({
      version: 1,
      issuedAt: now.toISOString(),
      status: nextStatus,
      sourceId: record.sourceId,
      licenseId: record.id,
      domain: cache.domain,
      serverIp: host.serverIp ?? cache.serverIp,
      productVersion: host.productVersion ?? cache.productVersion,
      expiryDate: record.expiryDate ?? void 0,
      gracePeriodSeconds: cache.gracePeriodSeconds
    });
    await logAction({
      licenseId: record.id,
      action: "check",
      outcome: ok ? "ok" : "warn",
      message: ok ? void 0 : `Status: ${nextStatus}`,
      context: { domain: host.domain }
    });
    return { ok, status: nextStatus, cache };
  },
  async deactivate(licenseId, domain, opts = {}) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const q = supabaseAdmin.from("license_activations").update({ active: false, deactivated_at: now, updated_at: now }).eq("license_id", licenseId).eq("active", true);
    if (domain) q.eq("domain", domain);
    const { error } = await q;
    if (error) throw new Error(error.message);
    await logAction({
      licenseId,
      action: "deactivate",
      outcome: "ok",
      actorUserId: opts.actorUserId,
      context: { domain: domain ?? "all" }
    });
    return { ok: true };
  },
  /** Wipe all activations + current_domain so the license can move host. */
  async resetActivation(licenseId, opts = {}) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await supabaseAdmin.from("license_activations").update({ active: false, deactivated_at: now, updated_at: now }).eq("license_id", licenseId).eq("active", true);
    await supabaseAdmin.from("licenses").update({
      current_domain: null,
      server_ip: null,
      installation_id: null,
      current_activations: 0,
      updated_at: now
    }).eq("id", licenseId);
    await logAction({
      licenseId,
      action: "reset",
      outcome: "ok",
      actorUserId: opts.actorUserId
    });
    return { ok: true };
  },
  async setStatus(licenseId, status, opts = {}) {
    await supabaseAdmin.from("licenses").update({ status, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", licenseId);
    await logAction({
      licenseId,
      action: status === "suspended" ? "suspend" : status === "revoked" ? "revoke" : "status",
      outcome: "ok",
      message: opts.message,
      actorUserId: opts.actorUserId,
      context: { status }
    });
    return { ok: true };
  },
  async extendExpiry(licenseId, newExpiry, opts = {}) {
    await supabaseAdmin.from("licenses").update({ expiry_date: newExpiry, status: "active", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", licenseId);
    await logAction({
      licenseId,
      action: "extend",
      outcome: "ok",
      actorUserId: opts.actorUserId,
      context: { new_expiry: newExpiry }
    });
    return { ok: true };
  },
  async changeDomain(licenseId, newDomain, opts = {}) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await supabaseAdmin.from("license_activations").update({ active: false, deactivated_at: now, updated_at: now }).eq("license_id", licenseId).eq("active", true);
    await supabaseAdmin.from("licenses").update({ current_domain: newDomain, current_activations: 0, updated_at: now }).eq("id", licenseId);
    await logAction({
      licenseId,
      action: "domain_change",
      outcome: "ok",
      actorUserId: opts.actorUserId,
      context: { new_domain: newDomain }
    });
    return { ok: true };
  }
};
export {
  LicenseManager,
  getProvider,
  listProviders,
  readCache
};
