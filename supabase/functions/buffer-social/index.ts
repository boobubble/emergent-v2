/**
 * buffer-social — Supabase Edge Function
 * All Buffer GraphQL traffic stays server-side. BUFFER_API_KEY never leaves secrets.
 *
 * Actions:
 *   test_connection | get_organizations | get_channels |
 *   create_test_post | create_signup_post | process_queue | retry_log
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const BUFFER_URL = "https://api.buffer.com";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-social-hook-secret",
};

type Json = Record<string, unknown>;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  try {
    const apiKey = Deno.env.get("BUFFER_API_KEY")?.trim();
    if (!apiKey) {
      return json(
        { ok: false, error: "BUFFER_API_KEY is not configured on the server." },
        503,
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const auth = await authorize(req, admin, anonKey, supabaseUrl);
    if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

    const body = (await req.json().catch(() => ({}))) as Json;
    const action = String(body.action ?? "");

    switch (action) {
      case "test_connection":
        return json(await testConnection(apiKey));
      case "get_organizations":
        return json(await getOrganizations(apiKey));
      case "get_channels":
        return json(await getChannelsAndSync(apiKey, admin, body));
      case "create_test_post":
        return json(await createTestPost(apiKey, admin, body));
      case "create_signup_post":
        return json(await createSignupPost(apiKey, admin, body));
      case "process_queue":
        return json(await processQueue(apiKey, admin, body));
      case "retry_log":
        return json(await retryLog(apiKey, admin, body));
      default:
        return json({ ok: false, error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    console.error("[buffer-social]", sanitizeError(msg));
    return json({ ok: false, error: sanitizeError(msg) }, 500);
  }
});

// ---------------------------------------------------------------------------
// Auth: admin JWT or hook secret (for cron / process_queue)
// ---------------------------------------------------------------------------
async function authorize(
  req: Request,
  admin: ReturnType<typeof createClient>,
  anonKey: string,
  supabaseUrl: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const hookSecret =
    req.headers.get("x-social-hook-secret")?.trim() ?? "";

  const { data: settings } = await admin
    .from("social_automation_settings")
    .select("hook_secret")
    .eq("id", true)
    .maybeSingle();

  const expected = typeof settings?.hook_secret === "string" ? settings.hook_secret : "";
  if (expected && hookSecret && hookSecret.length >= 16 && timingSafeEq(hookSecret, expected)) {
    return { ok: true };
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.toLowerCase().startsWith("bearer ")) {
    return { ok: false, error: "Unauthorized", status: 401 };
  }
  const jwt = authHeader.slice(7).trim();

  // Service-role callers (server fns) may use the service key directly
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  if (jwt === serviceKey) return { ok: true };

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) {
    return { ok: false, error: "Invalid session", status: 401 };
  }

  const { data: roles } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .in("role", ["admin", "super_admin"]);

  if (!roles || roles.length === 0) {
    return { ok: false, error: "Admin access required", status: 403 };
  }
  return { ok: true };
}

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ---------------------------------------------------------------------------
// Buffer GraphQL
// ---------------------------------------------------------------------------
async function bufferGql(
  apiKey: string,
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data?: any; errors?: Array<{ message: string }>; httpStatus: number }> {
  const res = await fetch(BUFFER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const httpStatus = res.status;
  if (httpStatus === 401) {
    return { errors: [{ message: "Buffer API key invalid (401)" }], httpStatus };
  }
  if (!res.ok) {
    return {
      errors: [{ message: `Buffer API unavailable (HTTP ${httpStatus})` }],
      httpStatus,
    };
  }

  let payload: any;
  try {
    payload = await res.json();
  } catch {
    return { errors: [{ message: "Invalid JSON from Buffer" }], httpStatus };
  }

  if (payload.errors?.length) {
    return {
      errors: payload.errors.map((e: any) => ({
        message: sanitizeError(String(e.message ?? "GraphQL error")),
      })),
      httpStatus,
      data: payload.data,
    };
  }
  return { data: payload.data, httpStatus };
}

function maskKey(key: string): string {
  if (key.length < 8) return "***";
  return `${key.slice(0, 4)}…${key.slice(-2)}`;
}

function sanitizeError(msg: string): string {
  // Never echo full API keys if they somehow appear in error text
  return msg
    .replace(/Bearer\s+[A-Za-z0-9._\-]+/gi, "Bearer ***")
    .replace(/sk_[A-Za-z0-9]+/gi, "sk_***")
    .slice(0, 500);
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
async function testConnection(apiKey: string) {
  const result = await bufferGql(
    apiKey,
    `query TestConnection {
      account {
        id
        email
        organizations { id name }
      }
    }`,
  );
  if (result.errors?.length) {
    return {
      ok: false,
      connected: false,
      error: result.errors[0].message,
      keyHint: maskKey(apiKey),
    };
  }
  const orgs = result.data?.account?.organizations ?? [];
  return {
    ok: true,
    connected: true,
    accountId: result.data?.account?.id ?? null,
    email: result.data?.account?.email ?? null,
    organizations: orgs,
    organization: orgs[0] ?? null,
  };
}

async function getOrganizations(apiKey: string) {
  const result = await bufferGql(
    apiKey,
    `query GetOrganizations {
      account {
        organizations { id name }
      }
    }`,
  );
  if (result.errors?.length) {
    return { ok: false, error: result.errors[0].message, organizations: [] };
  }
  return {
    ok: true,
    organizations: result.data?.account?.organizations ?? [],
  };
}

function normalizePlatform(service: string): string {
  const s = (service || "").toLowerCase();
  if (s === "twitter" || s === "x") return "x";
  if (s === "facebook" || s === "facebookPage" || s === "fb") return "facebook";
  if (s === "tiktok") return "tiktok";
  if (s === "instagram" || s === "instagrambusiness" || s === "instagram_business" || s === "instagramBusiness") {
    return "instagram";
  }
  if (s === "linkedin" || s === "linkedinPage") return "linkedin";
  if (s === "threads") return "threads";
  if (s === "youtube") return "youtube";
  return s || "other";
}

async function getChannelsAndSync(
  apiKey: string,
  admin: ReturnType<typeof createClient>,
  body: Json,
) {
  let orgId = typeof body.organizationId === "string" ? body.organizationId : null;

  if (!orgId) {
    const orgs = await getOrganizations(apiKey);
    if (!orgs.ok || !orgs.organizations?.length) {
      return { ok: false, error: orgs.error ?? "No Buffer organizations found", channels: [] };
    }
    orgId = orgs.organizations[0].id;
    await admin
      .from("social_automation_settings")
      .update({
        buffer_organization_id: orgId,
        buffer_organization_name: orgs.organizations[0].name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
  }

  const result = await bufferGql(
    apiKey,
    `query GetChannels($orgId: OrganizationId!) {
      channels(input: { organizationId: $orgId }) {
        id
        name
        displayName
        service
        avatar
        isQueuePaused
        isDisconnected
        isLocked
        organizationId
      }
    }`,
    { orgId },
  );

  if (result.errors?.length) {
    return { ok: false, error: result.errors[0].message, channels: [], organizationId: orgId };
  }

  const raw = (result.data?.channels ?? []) as Array<{
    id: string;
    name: string;
    displayName?: string | null;
    service: string;
    avatar?: string;
    isQueuePaused?: boolean;
    isDisconnected?: boolean;
    isLocked?: boolean;
    organizationId?: string;
  }>;

  const channels = raw.map((c) => ({
    id: c.id,
    name: c.name,
    displayName: c.displayName ?? c.name,
    service: c.service,
    platform: normalizePlatform(c.service),
    avatar: c.avatar ?? null,
    queuePaused: !!c.isQueuePaused,
    disconnected: !!c.isDisconnected,
    locked: !!c.isLocked,
    organizationId: c.organizationId ?? orgId,
  }));

  // Upsert known channels; preserve enabled flag
  for (const ch of channels) {
    const { data: existing } = await admin
      .from("social_channels")
      .select("id, enabled")
      .eq("buffer_channel_id", ch.id)
      .maybeSingle();

    if (existing) {
      await admin
        .from("social_channels")
        .update({
          platform: ch.platform,
          channel_name: ch.name,
          display_name: ch.displayName,
          avatar_url: ch.avatar,
          metadata: {
            service: ch.service,
            queuePaused: ch.queuePaused,
            disconnected: ch.disconnected,
            locked: ch.locked,
            organizationId: ch.organizationId,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await admin.from("social_channels").insert({
        platform: ch.platform,
        buffer_channel_id: ch.id,
        channel_name: ch.name,
        display_name: ch.displayName,
        avatar_url: ch.avatar,
        enabled: false,
        metadata: {
          service: ch.service,
          queuePaused: ch.queuePaused,
          disconnected: ch.disconnected,
          locked: ch.locked,
          organizationId: ch.organizationId,
        },
      });
    }
  }

  const { data: stored } = await admin
    .from("social_channels")
    .select("*")
    .order("platform");

  return {
    ok: true,
    organizationId: orgId,
    channels,
    stored: stored ?? [],
  };
}

async function createBufferPost(
  apiKey: string,
  opts: {
    platform?: string;
    channelId: string;
    text: string;
    mediaUrl?: string | null;
    mode: "addToQueue" | "shareNow";
  },
): Promise<{ ok: true; postId: string; dueAt?: string } | { ok: false; error: string }> {
  const assets = opts.mediaUrl
    ? `, assets: [{ image: { url: ${JSON.stringify(opts.mediaUrl)} } }]`
    : "";

  const platform = (opts.platform === "twitter" ? "x" : opts.platform) ?? "";
  // Instagram requires service-specific metadata; do not send this for other platforms.
  const platformMetadata =
    platform === "instagram"
      ? `metadata: { instagram: { type: post, shouldShareToFeed: true } }`
      : "";

  const mutation = `
    mutation CreatePost {
      createPost(input: {
        text: ${JSON.stringify(opts.text)}
        channelId: ${JSON.stringify(opts.channelId)}
        schedulingType: automatic
        mode: ${opts.mode}
        ${assets}
        ${platformMetadata}
      }) {
        ... on PostActionSuccess {
          post { id text dueAt status }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  const result = await bufferGql(apiKey, mutation);
  if (result.errors?.length) {
    return { ok: false, error: result.errors[0].message };
  }

  const payload = result.data?.createPost;
  if (!payload) {
    return { ok: false, error: "Empty createPost response" };
  }
  if (payload.message && !payload.post) {
    return { ok: false, error: sanitizeError(String(payload.message)) };
  }
  if (!payload.post?.id) {
    return { ok: false, error: "Mutation did not return a post id" };
  }

  return {
    ok: true,
    postId: payload.post.id,
    dueAt: payload.post.dueAt,
  };
}

async function loadSettings(admin: ReturnType<typeof createClient>) {
  const { data } = await admin
    .from("social_automation_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  return data ?? {
    social_signup_enabled: false,
    daily_signup_post_limit: 10,
    minimum_post_interval_minutes: 30,
    publishing_mode: "queue",
    default_media_url: null,
    site_base_url: "https://yaarzo.com",
  };
}

function shareMode(publishingMode: string): "addToQueue" | "shareNow" {
  return publishingMode === "immediate" ? "shareNow" : "addToQueue";
}

async function createTestPost(
  apiKey: string,
  admin: ReturnType<typeof createClient>,
  body: Json,
) {
  const channelIds = Array.isArray(body.channelIds)
    ? (body.channelIds as string[])
    : [];
  const text =
    typeof body.text === "string" && body.text.trim()
      ? body.text
      : `🎉 A new member just joined Yaarzo!\nMeet new people, join conversations and discover the Yaarzo community.\nhttps://yaarzo.com\n#Yaarzo #Community #Chat`;

  const settings = await loadSettings(admin);
  const mode = shareMode(settings.publishing_mode ?? "queue");
  // Force addToQueue during Phase 1 testing unless explicit override
  const forceMode = body.mode === "shareNow" ? "shareNow" : "addToQueue";
  const useMode = body.forcePublishingMode ? mode : forceMode;

  const resolved = resolveSocialMedia({
    explicitMediaUrl: typeof body.mediaUrl === "string" ? body.mediaUrl : null,
    defaultMediaUrl: settings.default_media_url,
  });
  const mediaUrl = resolved.mediaUrl;
  const mediaSource = resolved.mediaSource === "explicit" ? "explicit" : resolved.mediaSource === "default_image" ? "default_image" : "none";

  if (channelIds.length === 0) {
    return { ok: false, error: "Select at least one channel", results: [] };
  }

  const { data: channels } = await admin
    .from("social_channels")
    .select("*")
    .in("buffer_channel_id", channelIds);

  // Pre-check Instagram / TikTok when no media available
  const selectedPlatforms = (channels ?? []).map((c: any) =>
    c.platform === "twitter" ? "x" : c.platform,
  );
  const needsMedia =
    selectedPlatforms.includes("tiktok") || selectedPlatforms.includes("instagram");
  if (needsMedia && !mediaUrl) {
    return {
      ok: false,
      error: "Set a Default Yaarzo Social Image before testing Instagram or TikTok.",
      results: [],
    };
  }

  const results: Array<Record<string, unknown>> = [];

  for (const ch of channels ?? []) {
    const platform = ch.platform === "twitter" ? "x" : ch.platform;
    const meta = (ch.metadata ?? {}) as Record<string, unknown>;
    if (meta.queuePaused) {
      const log = await insertLog(admin, {
        event_type: "test_post",
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        caption: text,
        media_url: mediaUrl,
        status: "failed",
        error_message: "Channel queue is paused",
        metadata: { media_source: mediaSource },
      });
      results.push({
        platform,
        channelId: ch.buffer_channel_id,
        ok: false,
        error: "Channel queue is paused",
        logId: log?.id,
      });
      continue;
    }
    if (meta.disconnected) {
      const log = await insertLog(admin, {
        event_type: "test_post",
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        caption: text,
        media_url: mediaUrl,
        status: "failed",
        error_message: "Channel disconnected",
        metadata: { media_source: mediaSource },
      });
      results.push({
        platform,
        channelId: ch.buffer_channel_id,
        ok: false,
        error: "Channel disconnected",
        logId: log?.id,
      });
      continue;
    }

    if (platformRequiresMedia(platform) && !mediaUrl) {
      const err = mediaRequiredError(platform);
      const log = await insertLog(admin, {
        event_type: "test_post",
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        caption: text,
        media_url: null,
        status: "failed",
        error_message: err,
        metadata: { media_source: "none" },
      });
      results.push({
        platform,
        channelId: ch.buffer_channel_id,
        ok: false,
        error: err,
        logId: log?.id,
      });
      continue;
    }

    const posted = await createBufferPost(apiKey, {
      platform,
      channelId: ch.buffer_channel_id,
      text,
      mediaUrl,
      mode: useMode,
    });

    if (posted.ok) {
      const log = await insertLog(admin, {
        event_type: "test_post",
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        buffer_post_id: posted.postId,
        caption: text,
        media_url: mediaUrl,
        status: useMode === "shareNow" ? "published" : "queued",
        published_at: useMode === "shareNow" ? new Date().toISOString() : null,
        metadata: { media_source: mediaSource },
      });
      results.push({
        platform,
        channelId: ch.buffer_channel_id,
        ok: true,
        postId: posted.postId,
        dueAt: posted.dueAt,
        status: useMode === "shareNow" ? "published" : "queued",
        logId: log?.id,
        mediaSource,
      });
    } else {
      const log = await insertLog(admin, {
        event_type: "test_post",
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        caption: text,
        media_url: mediaUrl,
        status: "failed",
        error_message: posted.error,
        metadata: { media_source: mediaSource },
      });
      results.push({
        platform,
        channelId: ch.buffer_channel_id,
        ok: false,
        error: posted.error,
        logId: log?.id,
        mediaSource,
      });
    }
  }

  const anyOk = results.some((r) => r.ok);
  return { ok: anyOk, results };
}

function renderTemplate(
  template: string,
  vars: { display_name: string; username: string; profile_url: string },
): string {
  return template
    .replaceAll("{{display_name}}", vars.display_name)
    .replaceAll("{{username}}", vars.username)
    .replaceAll("{{profile_url}}", vars.profile_url);
}

type MediaSource = "user_avatar" | "default_image" | "none" | "explicit";

/** Public HTTPS media only — never data/blob/localhost/signed/temp paths. */
function validPublicMediaUrl(url: string | null | undefined): url is string {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("data:") || lower.startsWith("blob:")) return false;
  if (!lower.startsWith("https://")) return false;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host.endsWith(".local")) {
      return false;
    }
    // Reject obvious signed / temporary query tokens without logging them
    if (u.searchParams.has("token") || u.searchParams.has("sig") || u.searchParams.has("X-Amz-Signature")) {
      return false;
    }
    if (/[?&](token|sig|signature|X-Amz-Signature)=/i.test(trimmed)) return false;
    // Reject raw storage object paths (not full public URLs)
    if (!host.includes(".") && !host.includes(":")) return false;
    return true;
  } catch {
    return false;
  }
}

function resolveSocialMedia(opts: {
  avatarUrl?: string | null;
  defaultMediaUrl?: string | null;
  explicitMediaUrl?: string | null;
}): { mediaUrl: string | null; mediaSource: MediaSource } {
  if (validPublicMediaUrl(opts.explicitMediaUrl)) {
    return { mediaUrl: opts.explicitMediaUrl, mediaSource: "explicit" };
  }
  if (validPublicMediaUrl(opts.avatarUrl)) {
    return { mediaUrl: opts.avatarUrl, mediaSource: "user_avatar" };
  }
  if (validPublicMediaUrl(opts.defaultMediaUrl)) {
    return { mediaUrl: opts.defaultMediaUrl, mediaSource: "default_image" };
  }
  return { mediaUrl: null, mediaSource: "none" };
}

/** Platforms that must not be posted without an image. */
function platformRequiresMedia(platform: string): boolean {
  const p = platform === "twitter" ? "x" : platform;
  return p === "tiktok" || p === "instagram";
}

const TIKTOK_MEDIA_REQUIRED_ERROR =
  "TikTok requires media and no valid avatar or default media URL is available.";

const INSTAGRAM_MEDIA_REQUIRED_ERROR =
  "Instagram requires media and no valid avatar or default media URL is available.";

function mediaRequiredError(platform: string): string {
  const p = platform === "twitter" ? "x" : platform;
  if (p === "tiktok") return TIKTOK_MEDIA_REQUIRED_ERROR;
  if (p === "instagram") return INSTAGRAM_MEDIA_REQUIRED_ERROR;
  return "Media required and no valid avatar or default media URL is available.";
}

async function createSignupPost(
  apiKey: string,
  admin: ReturnType<typeof createClient>,
  body: Json,
) {
  const userId = typeof body.userId === "string" ? body.userId : null;
  const queueId = typeof body.queueId === "string" ? body.queueId : null;
  if (!userId) return { ok: false, error: "userId required" };

  const settings = await loadSettings(admin);
  if (!settings.social_signup_enabled && !body.force) {
    return { ok: false, skipped: true, reason: "social_signup_disabled" };
  }

  // Always re-read profile at execution time (never trust stale queued media).
  const { data: profile } = await admin
    .from("profiles")
    .select(
      "id, username, display_name, avatar_url, allow_social_feature, is_private, created_at, avatar_moderation_status",
    )
    .eq("id", userId)
    .maybeSingle();

  if (!profile) {
    await insertLog(admin, {
      event_type: "new_signup",
      user_id: userId,
      platform: "system",
      status: "failed",
      error_message: "user_profile_unavailable",
      queue_id: queueId,
      metadata: { media_source: "none" },
    });
    return { ok: false, error: "user_profile_unavailable" };
  }

  if (profile.allow_social_feature === false) {
    await insertLog(admin, {
      event_type: "new_signup",
      user_id: userId,
      platform: "system",
      status: "skipped",
      error_message: "social_feature_not_allowed",
      queue_id: queueId,
      metadata: { media_source: "none" },
    });
    return { ok: true, skipped: true, reason: "social_feature_not_allowed" };
  }

  const { data: banned } = await admin.rpc("is_user_banned", { _user_id: userId });
  if (banned === true) {
    await insertLog(admin, {
      event_type: "new_signup",
      user_id: userId,
      platform: "system",
      status: "skipped",
      error_message: "user_banned",
      queue_id: queueId,
      metadata: { media_source: "none" },
    });
    return { ok: true, skipped: true, reason: "user_banned" };
  }

  const { data: channels } = await admin
    .from("social_channels")
    .select("*")
    .eq("enabled", true);

  if (!channels?.length) {
    return { ok: false, error: "No enabled social channels" };
  }

  const { data: templates } = await admin.from("social_caption_templates").select("*");
  const templateMap = new Map((templates ?? []).map((t: any) => [t.platform, t.template]));

  const base = (settings.site_base_url || "https://yaarzo.com").replace(/\/$/, "");
  const username = profile.username || "member";
  const displayName = profile.display_name?.trim() || username;
  const profileUrl = `${base}/u/${encodeURIComponent(username)}`;

  // Use profile avatar unless admin-rejected.
  const moderationStatus = String(profile.avatar_moderation_status ?? "none");
  const avatarAllowedForBuffer = moderationStatus !== "rejected";
  const resolved = resolveSocialMedia({
    avatarUrl: avatarAllowedForBuffer ? profile.avatar_url : null,
    defaultMediaUrl: settings.default_media_url,
  });
  const mediaUrl = resolved.mediaUrl;
  const mediaSource = resolved.mediaSource === "user_avatar"
    ? "user_avatar"
    : resolved.mediaSource === "default_image"
      ? "default_image"
      : "none";
  const mediaMeta = {
    media_source: mediaSource,
    avatar_moderation_status: moderationStatus,
    avatar_used_for_buffer: avatarAllowedForBuffer && mediaSource === "user_avatar",
  };

  const mode = shareMode(settings.publishing_mode ?? "queue");
  const results: Array<Record<string, unknown>> = [];

  for (const ch of channels) {
    const platform = ch.platform === "twitter" ? "x" : ch.platform;
    const tmpl =
      templateMap.get(platform) ||
      templateMap.get(ch.platform) ||
      `🎉 {{display_name}} just joined Yaarzo!\n{{profile_url}}\n#Yaarzo #NewMember`;
    const caption = renderTemplate(tmpl, {
      display_name: displayName,
      username,
      profile_url: profileUrl,
    });

    const meta = (ch.metadata ?? {}) as Record<string, unknown>;
    if (meta.queuePaused) {
      await insertLog(admin, {
        event_type: "new_signup",
        user_id: userId,
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        caption,
        media_url: mediaUrl,
        status: "failed",
        error_message: "channel_queue_paused",
        queue_id: queueId,
        metadata: mediaMeta,
      });
      results.push({ platform, ok: false, error: "channel_queue_paused" });
      continue;
    }
    if (meta.disconnected) {
      await insertLog(admin, {
        event_type: "new_signup",
        user_id: userId,
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        caption,
        media_url: mediaUrl,
        status: "failed",
        error_message: "channel_disconnected",
        queue_id: queueId,
        metadata: mediaMeta,
      });
      results.push({ platform, ok: false, error: "channel_disconnected" });
      continue;
    }

    // TikTok / Instagram: require media; isolate failure from other platforms
    if (platformRequiresMedia(platform) && !mediaUrl) {
      const err = mediaRequiredError(platform);
      await insertLog(admin, {
        event_type: "new_signup",
        user_id: userId,
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        caption,
        media_url: null,
        status: "failed",
        error_message: err,
        queue_id: queueId,
        metadata: { ...mediaMeta, media_source: "none" },
      });
      results.push({ platform, ok: false, error: err, mediaSource: "none" });
      continue;
    }

    // Facebook / X: text-only if no media; otherwise attach resolved image
    const posted = await createBufferPost(apiKey, {
      platform,
      channelId: ch.buffer_channel_id,
      text: caption,
      mediaUrl,
      mode,
    });

    if (posted.ok) {
      await insertLog(admin, {
        event_type: "new_signup",
        user_id: userId,
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        buffer_post_id: posted.postId,
        caption,
        media_url: mediaUrl,
        status: mode === "shareNow" ? "published" : "queued",
        published_at: mode === "shareNow" ? new Date().toISOString() : null,
        queue_id: queueId,
        metadata: mediaMeta,
      });
      results.push({
        platform,
        ok: true,
        postId: posted.postId,
        status: mode === "shareNow" ? "published" : "queued",
        mediaSource,
      });
    } else {
      await insertLog(admin, {
        event_type: "new_signup",
        user_id: userId,
        platform,
        buffer_channel_id: ch.buffer_channel_id,
        caption,
        media_url: mediaUrl,
        status: "failed",
        error_message: posted.error,
        queue_id: queueId,
        metadata: mediaMeta,
      });
      results.push({ platform, ok: false, error: posted.error, mediaSource });
    }
  }

  return { ok: results.some((r) => r.ok), results, mediaSource };
}

async function checkRateLimits(
  admin: ReturnType<typeof createClient>,
  settings: any,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const limit = Number(settings.daily_signup_post_limit ?? 10);
  const intervalMin = Number(settings.minimum_post_interval_minutes ?? 30);

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const { count } = await admin
    .from("social_post_logs")
    .select("id", { count: "exact", head: true })
    .eq("event_type", "new_signup")
    .in("status", ["queued", "published"])
    .gte("created_at", dayStart.toISOString());

  if ((count ?? 0) >= limit) {
    return { ok: false, reason: "daily_signup_post_limit_reached" };
  }

  const { data: last } = await admin
    .from("social_post_logs")
    .select("created_at")
    .eq("event_type", "new_signup")
    .in("status", ["queued", "published"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last?.created_at) {
    const elapsed = Date.now() - new Date(last.created_at).getTime();
    if (elapsed < intervalMin * 60 * 1000) {
      return { ok: false, reason: "minimum_post_interval_not_met" };
    }
  }

  return { ok: true };
}

async function processQueue(
  apiKey: string,
  admin: ReturnType<typeof createClient>,
  body: Json,
) {
  const settings = await loadSettings(admin);
  if (!settings.social_signup_enabled) {
    return { ok: true, skipped: "social_signup_disabled", processed: 0 };
  }

  const limit = Math.min(Number(body.limit ?? 5), 20);
  const now = new Date().toISOString();

  const { data: items } = await admin
    .from("social_post_queue")
    .select("*")
    .in("status", ["pending", "failed"])
    .or(`next_attempt_at.is.null,next_attempt_at.lte.${now}`)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (!items?.length) return { ok: true, processed: 0 };

  let processed = 0;
  const outcomes: Array<Record<string, unknown>> = [];

  for (const item of items) {
    const rate = await checkRateLimits(admin, settings);
    if (!rate.ok) {
      // Reschedule for later; do not fail the job
      const delayMin = Number(settings.minimum_post_interval_minutes ?? 30);
      await admin
        .from("social_post_queue")
        .update({
          status: "pending",
          next_attempt_at: new Date(Date.now() + delayMin * 60 * 1000).toISOString(),
          last_error: rate.reason,
        })
        .eq("id", item.id);
      outcomes.push({ id: item.id, deferred: rate.reason });
      break;
    }

    // Avatar upload settle (non-blocking for signup).
    {
      const lastErr = String(item.last_error ?? "");

      const { data: settleProfile } = await admin
        .from("profiles")
        .select("avatar_url, created_at, allow_social_feature")
        .eq("id", item.user_id)
        .maybeSingle();

      if (settleProfile?.allow_social_feature !== false && settleProfile?.created_at) {
        const ageMs = Date.now() - new Date(settleProfile.created_at).getTime();

        // Upload still settling (no public URL yet) — one short defer
        if (
          lastErr !== "avatar_settle_retry" &&
          !validPublicMediaUrl(settleProfile.avatar_url) &&
          ageMs < 15 * 60 * 1000
        ) {
          await admin
            .from("social_post_queue")
            .update({
              status: "pending",
              last_error: "avatar_settle_retry",
              next_attempt_at: new Date(Date.now() + 60 * 1000).toISOString(),
            })
            .eq("id", item.id);
          outcomes.push({ id: item.id, deferred: "avatar_settle_retry" });
          continue;
        }
      }
    }

    await admin
      .from("social_post_queue")
      .update({
        status: "processing",
        attempts: (item.attempts ?? 0) + 1,
      })
      .eq("id", item.id);

    const result = await createSignupPost(apiKey, admin, {
      userId: item.user_id,
      queueId: item.id,
      force: true,
    });

    if (result.skipped) {
      await admin
        .from("social_post_queue")
        .update({
          status: "skipped",
          processed_at: new Date().toISOString(),
          last_error: result.reason ?? "skipped",
        })
        .eq("id", item.id);
      outcomes.push({ id: item.id, skipped: result.reason });
      processed++;
      continue;
    }

    const anyOk = !!result.ok;
    const allFailed =
      Array.isArray(result.results) &&
      result.results.length > 0 &&
      result.results.every((r: any) => !r.ok);

    if (anyOk && !allFailed) {
      // Partial success still completes the queue item; failed platforms stay in logs for retry
      await admin
        .from("social_post_queue")
        .update({
          status: "completed",
          processed_at: new Date().toISOString(),
          last_error: null,
        })
        .eq("id", item.id);
    } else {
      const attempts = (item.attempts ?? 0) + 1;
      const backoffMin = Math.min(60 * Math.pow(2, attempts - 1), 24 * 60);
      await admin
        .from("social_post_queue")
        .update({
          status: attempts >= 5 ? "failed" : "failed",
          next_attempt_at: new Date(Date.now() + backoffMin * 60 * 1000).toISOString(),
          last_error: result.error ?? "all_platforms_failed",
          processed_at: attempts >= 5 ? new Date().toISOString() : null,
        })
        .eq("id", item.id);
    }

    outcomes.push({ id: item.id, result });
    processed++;
  }

  return { ok: true, processed, outcomes };
}

async function retryLog(
  apiKey: string,
  admin: ReturnType<typeof createClient>,
  body: Json,
) {
  const logId = typeof body.logId === "string" ? body.logId : null;
  if (!logId) return { ok: false, error: "logId required" };

  const { data: log } = await admin
    .from("social_post_logs")
    .select("*")
    .eq("id", logId)
    .maybeSingle();

  if (!log) return { ok: false, error: "Log not found" };
  if (log.status !== "failed") return { ok: false, error: "Only failed logs can be retried" };
  if (!log.buffer_channel_id) return { ok: false, error: "Missing channel id" };

  const settings = await loadSettings(admin);
  const mode = shareMode(settings.publishing_mode ?? "queue");
  const caption =
    log.caption ||
    `🎉 A new member just joined Yaarzo!\nhttps://yaarzo.com\n#Yaarzo #Community #Chat`;

  const posted = await createBufferPost(apiKey, {
    platform: typeof log.platform === "string" ? log.platform : undefined,
    channelId: log.buffer_channel_id,
    text: caption,
    mediaUrl: validPublicMediaUrl(log.media_url)
      ? log.media_url
      : validPublicMediaUrl(settings.default_media_url)
        ? settings.default_media_url
        : null,
    mode,
  });

  if (posted.ok) {
    await admin
      .from("social_post_logs")
      .update({
        status: mode === "shareNow" ? "published" : "queued",
        buffer_post_id: posted.postId,
        error_message: null,
        published_at: mode === "shareNow" ? new Date().toISOString() : null,
      })
      .eq("id", logId);
    return { ok: true, postId: posted.postId, status: mode === "shareNow" ? "published" : "queued" };
  }

  await admin
    .from("social_post_logs")
    .update({ error_message: posted.error })
    .eq("id", logId);
  return { ok: false, error: posted.error };
}

async function insertLog(
  admin: ReturnType<typeof createClient>,
  row: Record<string, unknown>,
) {
  const { data } = await admin
    .from("social_post_logs")
    .insert(row)
    .select("id")
    .maybeSingle();
  return data;
}
