import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createHash, randomBytes } from "crypto";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("is_admin", { _user_id: ctx.userId });
  if (error || !data) throw new Error("Forbidden");
}

// ===== API KEYS =====
export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("api_keys")
      .select("id, name, key_prefix, scopes, created_at, last_used_at, revoked_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; scopes?: string[] }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const name = data.name.trim().slice(0, 80);
    if (!name) throw new Error("Name required");
    const raw = "bk_" + randomBytes(24).toString("hex");
    const prefix = raw.slice(0, 10);
    const hash = createHash("sha256").update(raw).digest("hex");
    const { error } = await context.supabase.from("api_keys").insert({
      name,
      key_prefix: prefix,
      key_hash: hash,
      scopes: data.scopes?.length ? data.scopes : ["read"],
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { key: raw, prefix };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("api_keys").update({ revoked_at: new Date().toISOString() }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("api_keys").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== WEBHOOKS =====
export const WEBHOOK_EVENTS = [
  "user.created",
  "post.created",
  "comment.created",
  "message.created",
  "confession.created",
  "report.created",
] as const;

export const listWebhooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("webhook_endpoints")
      .select("id, name, url, events, active, created_at, last_delivery_at, last_status, failure_count")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { name: string; url: string; events: string[] }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const name = data.name.trim().slice(0, 80);
    let url: URL;
    try { url = new URL(data.url); } catch { throw new Error("Invalid URL"); }
    if (!/^https?:$/.test(url.protocol)) throw new Error("URL must be http(s)");
    const secret = "whsec_" + randomBytes(24).toString("hex");
    const { data: row, error } = await context.supabase.from("webhook_endpoints").insert({
      name, url: url.toString(), secret,
      events: data.events ?? [],
      created_by: context.userId,
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id, secret };
  });

export const updateWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; name?: string; url?: string; events?: string[]; active?: boolean }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const patch: Record<string, unknown> = {};
    if (data.name !== undefined) patch.name = data.name.trim().slice(0, 80);
    if (data.url !== undefined) {
      try { new URL(data.url); } catch { throw new Error("Invalid URL"); }
      patch.url = data.url;
    }
    if (data.events !== undefined) patch.events = data.events;
    if (data.active !== undefined) patch.active = data.active;
    const { error } = await context.supabase.from("webhook_endpoints").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase.from("webhook_endpoints").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getWebhookSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("webhook_endpoints").select("secret").eq("id", data.id).single();
    if (error) throw new Error(error.message);
    return { secret: row.secret as string };
  });

export const rotateWebhookSecret = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const secret = "whsec_" + randomBytes(24).toString("hex");
    const { error } = await context.supabase
      .from("webhook_endpoints").update({ secret }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { secret };
  });

export const testWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("webhook_endpoints").select("url, secret").eq("id", data.id).single();
    if (error || !row) throw new Error(error?.message ?? "Webhook not found");

    const payload = { event: "test.ping", at: new Date().toISOString(), data: { hello: "world" } };
    const body = JSON.stringify(payload);
    const sig = createHash("sha256").update(row.secret + body).digest("hex");
    let status: number | null = null;
    let ok = false;
    let errMsg: string | null = null;
    try {
      const res = await fetch(row.url, {
        method: "POST",
        headers: { "content-type": "application/json", "x-webhook-signature": sig, "x-webhook-event": "test.ping" },
        body,
        signal: AbortSignal.timeout(10000),
      });
      status = res.status;
      ok = res.ok;
    } catch (e: any) {
      errMsg = String(e?.message ?? e);
    }

    await context.supabase.from("webhook_deliveries").insert({
      endpoint_id: data.id, event: "test.ping", status_code: status, ok, error: errMsg, payload,
    });
    await context.supabase.from("webhook_endpoints").update({
      last_delivery_at: new Date().toISOString(),
      last_status: status,
      failure_count: ok ? 0 : undefined,
    }).eq("id", data.id);

    return { ok, status, error: errMsg };
  });

export const listDeliveries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { endpoint_id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("webhook_deliveries")
      .select("id, event, status_code, ok, error, created_at")
      .eq("endpoint_id", data.endpoint_id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
