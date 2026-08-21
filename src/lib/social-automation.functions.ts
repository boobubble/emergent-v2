import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "./rate-limit-middleware";
import { getSupabasePublicEnv } from "@/integrations/supabase/env.server";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}

/** Untyped access until generated Database types include social_* tables. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function socialDb(): any {
  return supabaseAdmin;
}

type BufferAction =
  | "test_connection"
  | "get_organizations"
  | "get_channels"
  | "create_test_post"
  | "create_signup_post"
  | "process_queue"
  | "retry_log";

/**
 * Invoke the buffer-social Edge Function with the caller's JWT.
 * BUFFER_API_KEY never leaves the Edge Function / server secrets.
 */
async function invokeBufferSocial(
  action: BufferAction,
  body: Record<string, unknown>,
  accessToken: string,
): Promise<Record<string, unknown>> {
  const { url } = getSupabasePublicEnv();
  const fnUrl = `${url.replace(/\/$/, "")}/functions/v1/buffer-social`;

  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      // apikey required by Supabase gateway
      apikey: process.env.SUPABASE_ANON_KEY?.trim()
        || process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
        || "",
    },
    body: JSON.stringify({ action, ...body }),
  });

  let payload: Record<string, unknown> = {};
  try {
    payload = (await res.json()) as Record<string, unknown>;
  } catch {
    payload = { ok: false, error: `Edge Function returned non-JSON (HTTP ${res.status})` };
  }

  if (!res.ok && !payload.error) {
    payload = {
      ...payload,
      ok: false,
      error:
        res.status === 404
          ? "buffer-social Edge Function is not deployed. Deploy it and set BUFFER_API_KEY secret."
          : `Edge Function HTTP ${res.status}`,
    };
  }
  return payload;
}

function getCallerAccessToken(): string {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    throw new Error("Missing access token");
  }
  return authHeader.slice(7).trim();
}

// -------- Admin: invoke Buffer actions --------
export const bufferSocialAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        action: z.enum([
          "test_connection",
          "get_organizations",
          "get_channels",
          "create_test_post",
          "create_signup_post",
          "process_queue",
          "retry_log",
        ]),
        organizationId: z.string().optional(),
        channelIds: z.array(z.string()).optional(),
        text: z.string().max(4000).optional(),
        mediaUrl: z.string().url().optional().nullable(),
        logId: z.string().uuid().optional(),
        userId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(20).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const token = getCallerAccessToken();
    const { action, ...rest } = data;
    return invokeBufferSocial(action, rest as Record<string, unknown>, token);
  });

// -------- Settings / channels / logs (DB only, no Buffer key) --------
export const getSocialAutomationState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const db = socialDb();

    const [settingsRes, channelsRes, templatesRes, logsRes, failedRes, queueRes] =
      await Promise.all([
        db.from("social_automation_settings").select("*").eq("id", true).maybeSingle(),
        db.from("social_channels").select("*").order("platform"),
        db.from("social_caption_templates").select("*").order("platform"),
        db
          .from("social_post_logs")
          .select("*, profiles:user_id(username, display_name)")
          .order("created_at", { ascending: false })
          .limit(50),
        db
          .from("social_post_logs")
          .select("*, profiles:user_id(username, display_name)")
          .eq("status", "failed")
          .order("created_at", { ascending: false })
          .limit(50),
        db
          .from("social_post_queue")
          .select("*, profiles:user_id(username, display_name)")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

    const settings = (settingsRes as { data: any }).data;
    // Never return hook_secret to the client
    if (settings && typeof settings === "object") {
      const { hook_secret: _omit, ...safe } = settings as Record<string, unknown>;
      return {
        settings: {
          ...safe,
          hook_secret_configured: typeof _omit === "string" && _omit.length >= 16,
        },
        channels: (channelsRes as { data: any }).data ?? [],
        templates: (templatesRes as { data: any }).data ?? [],
        recentLogs: (logsRes as { data: any }).data ?? [],
        failedLogs: (failedRes as { data: any }).data ?? [],
        queue: (queueRes as { data: any }).data ?? [],
        bufferKeyConfigured: Boolean(process.env.BUFFER_API_KEY?.trim()),
        // Note: Edge Function reads Deno secret; this only reflects Nitro env if also set.
        note: "BUFFER_API_KEY must be set as a Supabase Edge Function secret.",
      };
    }

    return {
      settings: null,
      channels: (channelsRes as { data: any }).data ?? [],
      templates: (templatesRes as { data: any }).data ?? [],
      recentLogs: (logsRes as { data: any }).data ?? [],
      failedLogs: (failedRes as { data: any }).data ?? [],
      queue: (queueRes as { data: any }).data ?? [],
      bufferKeyConfigured: Boolean(process.env.BUFFER_API_KEY?.trim()),
      note: "BUFFER_API_KEY must be set as a Supabase Edge Function secret.",
    };
  });

export const updateSocialAutomationSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        social_signup_enabled: z.boolean().optional(),
        daily_signup_post_limit: z.number().int().min(1).max(100).optional(),
        minimum_post_interval_minutes: z.number().int().min(1).max(1440).optional(),
        publishing_mode: z.enum(["queue", "immediate"]).optional(),
        default_media_url: z.string().url().nullable().optional(),
        site_base_url: z.string().url().optional(),
        buffer_organization_id: z.string().nullable().optional(),
        buffer_organization_name: z.string().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const db = socialDb();
    const { error } = await db
      .from("social_automation_settings")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      })
      .eq("id", true);
    if (error) throw new Error((error as Error).message ?? "Update failed");
    return { ok: true };
  });

export const setSocialChannelEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), enabled: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const db = socialDb();
    const { error } = await db
      .from("social_channels")
      .update({ enabled: data.enabled, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error((error as Error).message ?? "Update failed");
    return { ok: true };
  });

export const updateSocialCaptionTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) =>
    z
      .object({
        platform: z.string().min(1).max(32),
        template: z.string().min(1).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const db = socialDb();
    const { error } = await db.from("social_caption_templates").upsert(
      {
        platform: data.platform,
        template: data.template,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "platform" },
    );
    if (error) throw new Error((error as Error).message ?? "Update failed");
    return { ok: true };
  });

// -------- User privacy: allow_social_feature --------
export const getMySocialFeaturePref = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("allow_social_feature")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return {
      allow_social_feature: (data as { allow_social_feature?: boolean } | null)
        ?.allow_social_feature ?? false,
    };
  });

export const setMySocialFeaturePref = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ allow_social_feature: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ allow_social_feature: data.allow_social_feature })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
