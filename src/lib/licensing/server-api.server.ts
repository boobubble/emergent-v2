/**
 * Shared handlers for the public REST licensing endpoints.
 *
 * These endpoints let *other* BooBubble installations use this deployment
 * as their license server for `self`-issued keys. Every request must be
 * signed with `LICENSE_SERVER_HMAC_SECRET` (HMAC-SHA256 over the
 * canonicalized JSON payload), mirroring what SelfLicenseProvider sends.
 */
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { canonicalize } from "./crypto.server";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { LicenseStatus } from "./types";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-license-signature",
  "Access-Control-Max-Age": "86400",
} as const;

export function corsPreflight() {
  return new Response(null, { status: 204, headers: CORS });
}

/* ------------------------- in-memory rate limit ------------------------- */
// Per-IP + per-route sliding window. Ad-hoc because the Worker has no shared
// primitive; each isolate keeps its own counter, which is acceptable for
// abuse mitigation on a license server.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const rateBuckets = new Map<string, number[]>();

function rateLimit(request: Request, route: string): Response | null {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const key = `${ip}:${route}`;
  const now = Date.now();
  const bucket = (rateBuckets.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (bucket.length >= RATE_LIMIT_MAX) {
    return new Response(JSON.stringify({ ok: false, message: "Rate limit exceeded" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "60", ...CORS },
    });
  }
  bucket.push(now);
  rateBuckets.set(key, bucket);
  if (rateBuckets.size > 5000) {
    // Prevent unbounded growth.
    for (const [k, v] of rateBuckets) {
      if (v[v.length - 1]! < now - RATE_LIMIT_WINDOW_MS) rateBuckets.delete(k);
    }
  }
  return null;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

async function readVerifiedPayload(request: Request): Promise<
  | { ok: true; payload: any }
  | { ok: false; response: Response }
> {
  const secret = process.env.LICENSE_SERVER_HMAC_SECRET;
  if (!secret || secret === "CHANGE_ME_LATER") {
    return { ok: false, response: json({ ok: false, message: "License server not configured" }, 503) };
  }
  const raw = await request.text();
  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return { ok: false, response: json({ ok: false, message: "Invalid JSON" }, 400) };
  }
  const header = request.headers.get("x-license-signature") ?? "";
  const expected = createHmac("sha256", secret).update(canonicalize(payload)).digest("hex");
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(header, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { ok: false, response: json({ ok: false, message: "Invalid signature" }, 401) };
    }
  } catch {
    return { ok: false, response: json({ ok: false, message: "Invalid signature" }, 401) };
  }
  return { ok: true, payload };
}

function normStatus(row: any): LicenseStatus {
  const now = new Date();
  if (row.expiry_date && new Date(row.expiry_date) < now) return "expired";
  return row.status as LicenseStatus;
}

function licenseToDto(row: any) {
  return {
    key: row.license_key,
    customer_email: row.customer_email,
    customer_name: row.customer_name,
    product: row.product,
    product_version: row.product_version,
    activation_date: row.activation_date,
    expiry_date: row.expiry_date,
    max_activations: row.max_activations,
    current_activations: row.current_activations,
    current_domain: row.current_domain,
    status: normStatus(row),
  };
}

async function findLicense(key: string, email?: string) {
  const q = supabaseAdmin
    .from("licenses")
    .select("*")
    .eq("license_key", key)
    .eq("source_id", "self");
  const { data } = await q.maybeSingle();
  if (!data) return null;
  if (email && data.customer_email && data.customer_email.toLowerCase() !== email.toLowerCase()) {
    return null;
  }
  return data;
}

async function log(licenseId: string | null, action: string, outcome: "ok" | "fail" | "warn", ctx: Record<string, unknown>, message?: string) {
  try {
    await supabaseAdmin.from("license_logs").insert({
      license_id: licenseId,
      action,
      outcome,
      message: message ?? null,
      context: ctx,
    } as any);
  } catch {
    /* never break the request */
  }
}

/* ------------------------------- verify ------------------------------- */

export async function handleVerify(request: Request): Promise<Response> {
  const rl = rateLimit(request, "verify"); if (rl) return rl;
  const v = await readVerifiedPayload(request);
  if (!v.ok) return v.response;
  const { key, email, domain, product_version } = v.payload ?? {};
  if (!key || !email || !domain) {
    return json({ ok: false, message: "Missing key/email/domain" }, 400);
  }
  const row = await findLicense(key, email);
  if (!row) {
    await log(null, "verify", "fail", { domain, key_tail: String(key).slice(-6) }, "Not found");
    return json({ ok: false, status: "revoked", message: "License not found" }, 404);
  }
  const status = normStatus(row);
  const active = status === "active" || status === "development" || status === "localhost" || status === "unlimited";
  await log(row.id, "verify", active ? "ok" : "fail", { domain, product_version });
  if (!active) {
    return json({ ...licenseToDto(row), ok: false, status, message: `License is ${status}` });
  }
  return json({ ...licenseToDto(row), ok: true, status });
}

/* ------------------------------ activate ------------------------------ */

export async function handleActivate(request: Request): Promise<Response> {
  const rl = rateLimit(request, "activate"); if (rl) return rl;
  const v = await readVerifiedPayload(request);
  if (!v.ok) return v.response;
  const { key, email, domain, server_ip, installation_id, product_version, runtime } = v.payload ?? {};
  if (!key || !email || !domain) return json({ ok: false, message: "Missing key/email/domain" }, 400);

  const row = await findLicense(key, email);
  if (!row) return json({ ok: false, status: "revoked", message: "License not found" }, 404);

  const status = normStatus(row);
  if (status !== "active" && status !== "development" && status !== "localhost" && status !== "unlimited") {
    await log(row.id, "activate", "fail", { domain }, `License ${status}`);
    return json({ ok: false, status, message: `License is ${status}` }, 403);
  }

  const now = new Date().toISOString();

  // Domain lock enforcement.
  if (row.current_domain && row.current_domain !== domain) {
    // Count active activations vs max.
    const { count } = await supabaseAdmin
      .from("license_activations")
      .select("*", { count: "exact", head: true })
      .eq("license_id", row.id)
      .eq("active", true);
    if ((count ?? 0) >= (row.max_activations ?? 1)) {
      await log(row.id, "activate", "fail", { domain, existing_domain: row.current_domain }, "Domain lock");
      return json(
        { ok: false, status: "revoked", message: `Already activated on ${row.current_domain}. Reset first.` },
        409,
      );
    }
  }

  await supabaseAdmin
    .from("license_activations")
    .upsert(
      {
        license_id: row.id,
        domain,
        server_ip: server_ip ?? null,
        installation_id: installation_id ?? null,
        runtime: runtime ?? null,
        product_version: product_version ?? null,
        active: true,
        activated_at: now,
        last_seen_at: now,
      } as any,
      { onConflict: "license_id,domain" },
    );

  const { count } = await supabaseAdmin
    .from("license_activations")
    .select("*", { count: "exact", head: true })
    .eq("license_id", row.id)
    .eq("active", true);

  await supabaseAdmin
    .from("licenses")
    .update({
      current_domain: domain,
      server_ip: server_ip ?? null,
      installation_id: installation_id ?? null,
      current_activations: count ?? 1,
      activation_date: row.activation_date ?? now,
      last_validation_at: now,
      last_validation_ok: true,
      updated_at: now,
    } as any)
    .eq("id", row.id);

  const { data: updated } = await supabaseAdmin.from("licenses").select("*").eq("id", row.id).maybeSingle();
  await log(row.id, "activate", "ok", { domain, product_version });
  return json({ ...licenseToDto(updated ?? row), ok: true, status: normStatus(updated ?? row) });
}

/* ----------------------------- deactivate ----------------------------- */

export async function handleDeactivate(request: Request): Promise<Response> {
  const rl = rateLimit(request, "deactivate"); if (rl) return rl;
  const v = await readVerifiedPayload(request);
  if (!v.ok) return v.response;
  const { key, email, domain } = v.payload ?? {};
  if (!key || !email || !domain) return json({ ok: false, message: "Missing key/email/domain" }, 400);
  const row = await findLicense(key, email);
  if (!row) return json({ ok: false, message: "License not found" }, 404);
  const now = new Date().toISOString();
  await supabaseAdmin
    .from("license_activations")
    .update({ active: false, deactivated_at: now, updated_at: now } as any)
    .eq("license_id", row.id)
    .eq("domain", domain)
    .eq("active", true);
  const { count } = await supabaseAdmin
    .from("license_activations")
    .select("*", { count: "exact", head: true })
    .eq("license_id", row.id)
    .eq("active", true);
  const clearDomain = row.current_domain === domain;
  await supabaseAdmin
    .from("licenses")
    .update({
      current_activations: count ?? 0,
      current_domain: clearDomain ? null : row.current_domain,
      updated_at: now,
    } as any)
    .eq("id", row.id);
  await log(row.id, "deactivate", "ok", { domain });
  return json({ ok: true });
}

/* ------------------------------- check ------------------------------- */

export async function handleCheck(request: Request): Promise<Response> {
  const rl = rateLimit(request, "check"); if (rl) return rl;
  const v = await readVerifiedPayload(request);
  if (!v.ok) return v.response;
  const { key, email, domain, product_version } = v.payload ?? {};
  if (!key || !email || !domain) return json({ ok: false, message: "Missing key/email/domain" }, 400);
  const row = await findLicense(key, email);
  if (!row) return json({ ok: false, status: "revoked", message: "License not found" }, 404);
  const now = new Date().toISOString();
  const status = normStatus(row);
  const active = status === "active" || status === "development" || status === "localhost" || status === "unlimited";
  const domainOk = !row.current_domain || row.current_domain === domain;
  const ok = active && domainOk;
  await supabaseAdmin
    .from("license_activations")
    .update({ last_seen_at: now, product_version: product_version ?? null, updated_at: now } as any)
    .eq("license_id", row.id)
    .eq("domain", domain)
    .eq("active", true);
  await supabaseAdmin
    .from("licenses")
    .update({ last_validation_at: now, last_validation_ok: ok, updated_at: now } as any)
    .eq("id", row.id);
  await log(row.id, "check", ok ? "ok" : "warn", { domain }, ok ? undefined : `status=${status} domainOk=${domainOk}`);
  return json({
    ...licenseToDto(row),
    ok,
    status,
    message: ok ? undefined : !domainOk ? `Bound to ${row.current_domain}` : `License is ${status}`,
  });
}
