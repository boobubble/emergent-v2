import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, e as enumType, n as numberType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "crypto";
import "stream";
import "../_libs/isbot.mjs";
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
const CONTENT_TYPES = ["feed_post", "poetry_poem", "comment", "competition_submission", "meme", "image", "video"];
const ADAPTERS = {
  feed_post: {
    table: "posts",
    ownerColumn: "author_id",
    textColumn: "text",
    mediaColumn: "media_urls"
  },
  poetry_poem: {
    table: "mehfil_poems",
    ownerColumn: "author_id",
    textColumn: "body"
  },
  comment: {
    table: "comments",
    ownerColumn: "author_id",
    textColumn: "text"
  },
  competition_submission: {
    table: "competition_competitors",
    ownerColumn: "user_id",
    mediaColumn: "media_urls"
  },
  // Standalone media items — same physical rows as feed posts today, but
  // callers can address them explicitly as "meme" / "image" / "video".
  meme: {
    table: "posts",
    ownerColumn: "author_id",
    textColumn: "text",
    mediaColumn: "media_urls"
  },
  image: {
    table: "posts",
    ownerColumn: "author_id",
    textColumn: "text",
    mediaColumn: "media_urls"
  },
  video: {
    table: "posts",
    ownerColumn: "author_id",
    textColumn: "text",
    mediaColumn: "media_urls"
  }
};
function getAdapter(type) {
  const a = ADAPTERS[type];
  if (!a) throw new Error(`No moderation adapter registered for ${type}`);
  return a;
}
async function admin() {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin;
}
const MOD_ROLES = ["feed_moderator", "moderator", "admin", "super_admin"];
const ADMIN_ROLES = ["admin", "super_admin"];
async function getRoles(userId) {
  const sb = await admin();
  const {
    data
  } = await sb.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}
async function assertMod(userId) {
  const roles = await getRoles(userId);
  if (!roles.some((r) => MOD_ROLES.includes(r))) {
    throw new Error("Forbidden: moderator only");
  }
}
async function assertAdmin(userId) {
  const roles = await getRoles(userId);
  if (!roles.some((r) => ADMIN_ROLES.includes(r))) {
    throw new Error("Forbidden: admin only");
  }
}
async function logAction(params) {
  const sb = await admin();
  await sb.from("content_moderation_logs").insert({
    content_type: params.content_type ?? null,
    content_id: params.content_id ?? null,
    action_taken: params.action_taken,
    reason: params.reason ?? null,
    moderator_id: params.moderator_id ?? null,
    target_user_id: params.target_user_id ?? null,
    metadata: params.metadata ?? {}
  });
}
async function fetchOwner(type, id) {
  const a = getAdapter(type);
  const sb = await admin();
  const {
    data
  } = await sb.from(a.table).select(a.ownerColumn).eq("id", id).maybeSingle();
  return data?.[a.ownerColumn] ?? null;
}
const DEFAULT_SETTINGS = {
  enabled: true,
  auto_hide_report_threshold: 5,
  auto_hide_ai_threshold: 0.8,
  duplicate_window_minutes: 10,
  max_posts_per_hour: 20,
  max_comments_per_minute: 10,
  ai_image_moderation_enabled: true,
  ai_text_moderation_enabled: true,
  ai_moderation_categories: ["nudity", "pornography", "violence", "gore", "child_safety", "drugs", "weapons", "hate_speech", "harassment", "self_harm"]
};
const getModerationSettings_createServerFn_handler = createServerRpc({
  id: "9f4e5bceb917a31a9a9dc7ffe127b053f68e5084346c0d65a83cf759538299c2",
  name: "getModerationSettings",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => getModerationSettings.__executeServer(opts));
const getModerationSettings = createServerFn({
  method: "GET"
}).handler(getModerationSettings_createServerFn_handler, async () => {
  const sb = await admin();
  const {
    data
  } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
  return {
    ...DEFAULT_SETTINGS,
    ...data?.value ?? {}
  };
});
const ReportInput = objectType({
  content_type: enumType(CONTENT_TYPES),
  content_id: stringType().uuid(),
  reason: stringType().min(1).max(500)
});
const reportContent_createServerFn_handler = createServerRpc({
  id: "54eb0f0c38b9bf251ea04bf1ad053edf0f9fc49daba9d211d9c1a3574d4b32d0",
  name: "reportContent",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => reportContent.__executeServer(opts));
const reportContent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("moderation.report")]).inputValidator((raw) => ReportInput.parse(raw)).handler(reportContent_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = await admin();
  const owner = await fetchOwner(data.content_type, data.content_id);
  if (owner === context.userId) throw new Error("You cannot report your own content");
  const REPORT_TARGET_MAP = {
    feed_post: "post",
    meme: "post",
    image: "post",
    video: "post",
    poetry_poem: "post",
    competition_submission: "post",
    comment: "comment"
  };
  const target_type = REPORT_TARGET_MAP[data.content_type];
  const {
    data: existing
  } = await sb.from("reports").select("id").eq("reporter_id", context.userId).eq("target_type", target_type).eq("target_id", data.content_id).gt("created_at", new Date(Date.now() - 864e5).toISOString()).maybeSingle();
  if (existing) return {
    ok: true,
    deduped: true
  };
  await sb.from("reports").insert({
    reporter_id: context.userId,
    target_type,
    target_id: data.content_id,
    reason: data.reason,
    status: "open"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  });
  await sb.rpc("content_moderation_bump_report", {
    _content_type: data.content_type,
    _content_id: data.content_id,
    _owner_id: owner
  });
  return {
    ok: true,
    deduped: false
  };
});
const listModerationQueue_createServerFn_handler = createServerRpc({
  id: "176ac30c0df6f520c62a6dc9d60ddda7ae05872401a08ca4d514db8f43d087ee",
  name: "listModerationQueue",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => listModerationQueue.__executeServer(opts));
const listModerationQueue = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  content_type: enumType([...CONTENT_TYPES, "all"]).default("all"),
  status: enumType(["pending_review", "hidden", "removed", "all"]).default("pending_review"),
  limit: numberType().int().min(1).max(200).default(100)
}).parse(raw)).handler(listModerationQueue_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  let q = sb.from("content_moderation").select("id, content_type, content_id, owner_id, status, reason, report_count, ai_flags, hidden_at, created_at, updated_at").order("hidden_at", {
    ascending: false,
    nullsFirst: false
  }).order("updated_at", {
    ascending: false
  }).limit(data.limit);
  if (data.content_type !== "all") q = q.eq("content_type", data.content_type);
  if (data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw error;
  const enriched = await Promise.all((rows ?? []).map(async (row) => {
    const a = getAdapter(row.content_type);
    const cols = ["id", a.ownerColumn, "created_at"];
    if (a.textColumn) cols.push(a.textColumn);
    if (a.mediaColumn) cols.push(a.mediaColumn);
    const {
      data: rec
    } = await sb.from(a.table).select(cols.join(",")).eq("id", row.content_id).maybeSingle();
    return {
      ...row,
      preview: rec ?? null
    };
  }));
  return enriched;
});
const StatusInput = objectType({
  content_type: enumType(CONTENT_TYPES),
  content_id: stringType().uuid(),
  status: enumType(["visible", "hidden", "removed"]),
  reason: stringType().max(500).optional()
});
const setContentModerationStatus_createServerFn_handler = createServerRpc({
  id: "7c225063a2e3c71e67890e64226d11136aaa641244fce385711e8a3fb43046fa",
  name: "setContentModerationStatus",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => setContentModerationStatus.__executeServer(opts));
const setContentModerationStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => StatusInput.parse(raw)).handler(setContentModerationStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  const owner = await fetchOwner(data.content_type, data.content_id);
  const patch = {
    content_type: data.content_type,
    content_id: data.content_id,
    owner_id: owner,
    status: data.status,
    reason: data.reason ?? null,
    last_actor_id: context.userId,
    hidden_at: data.status === "visible" ? null : (/* @__PURE__ */ new Date()).toISOString()
  };
  await sb.from("content_moderation").upsert(patch, {
    onConflict: "content_type,content_id"
  });
  if (data.content_type === "feed_post" || data.content_type === "meme" || data.content_type === "image" || data.content_type === "video") {
    await sb.from("posts").update({
      moderation_status: data.status === "visible" ? "visible" : data.status === "removed" ? "removed" : "hidden",
      moderation_reason: data.reason ?? null,
      hidden_at: data.status === "visible" ? null : (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.content_id);
  } else if (data.content_type === "comment") {
    await sb.from("comments").update({
      moderation_status: data.status === "visible" ? "visible" : data.status === "removed" ? "removed" : "hidden",
      moderation_reason: data.reason ?? null,
      hidden_at: data.status === "visible" ? null : (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.content_id);
  }
  await sb.from("reports").update({
    status: "resolved"
  }).eq("target_type", data.content_type).eq("target_id", data.content_id).eq("status", "open");
  await logAction({
    content_type: data.content_type,
    content_id: data.content_id,
    action_taken: `set_${data.status}`,
    reason: data.reason,
    moderator_id: context.userId,
    target_user_id: owner
  });
  return {
    ok: true
  };
});
const warnUser_createServerFn_handler = createServerRpc({
  id: "7f3036a6e40b56aea8e2133ef2392c1bcb02942d5f4d38bf99250a154463d498",
  name: "warnUser",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => warnUser.__executeServer(opts));
const warnUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().min(1).max(500),
  severity: enumType(["warning", "final_warning"]).default("warning"),
  scope: stringType().default("all")
}).parse(raw)).handler(warnUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  await sb.from("feed_mod_warnings").insert({
    user_id: data.user_id,
    moderator_id: context.userId,
    reason: data.reason,
    severity: data.severity,
    scope: data.scope
  });
  await logAction({
    action_taken: "warn_user",
    reason: data.reason,
    moderator_id: context.userId,
    target_user_id: data.user_id,
    metadata: {
      severity: data.severity,
      scope: data.scope
    }
  });
  return {
    ok: true
  };
});
const banPosting_createServerFn_handler = createServerRpc({
  id: "106bbe51bcce4bd43f280dd78c5b6e755dc564fec4bbe8e860e308a693ce9da3",
  name: "banPosting",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => banPosting.__executeServer(opts));
const banPosting = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().max(500).optional(),
  duration_hours: numberType().int().min(1).max(24 * 365).optional(),
  scope: stringType().default("all")
}).parse(raw)).handler(banPosting_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  const expires_at = data.duration_hours ? new Date(Date.now() + data.duration_hours * 36e5).toISOString() : null;
  await sb.from("feed_posting_bans").insert({
    user_id: data.user_id,
    moderator_id: context.userId,
    reason: data.reason ?? null,
    expires_at,
    active: true,
    scope: data.scope
  });
  await logAction({
    action_taken: expires_at ? "ban_temp" : "ban_permanent",
    reason: data.reason,
    moderator_id: context.userId,
    target_user_id: data.user_id,
    metadata: {
      duration_hours: data.duration_hours ?? null,
      scope: data.scope
    }
  });
  return {
    ok: true,
    expires_at
  };
});
const restorePosting_createServerFn_handler = createServerRpc({
  id: "e9e94714a8a9bd0fcd4be9b129b47f32141edd101dc1a9f4d6031b9aebc88b7f",
  name: "restorePosting",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => restorePosting.__executeServer(opts));
const restorePosting = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid()
}).parse(raw)).handler(restorePosting_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const sb = await admin();
  await sb.from("feed_posting_bans").update({
    active: false
  }).eq("user_id", data.user_id).eq("active", true);
  await logAction({
    action_taken: "restore_posting",
    moderator_id: context.userId,
    target_user_id: data.user_id
  });
  return {
    ok: true
  };
});
const listPostingBans_createServerFn_handler = createServerRpc({
  id: "9ba8ad8c25a0448649f3d7568211d38957708e79b496a4ef080a5c564d212a83",
  name: "listPostingBans",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => listPostingBans.__executeServer(opts));
const listPostingBans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listPostingBans_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  const {
    data
  } = await sb.from("feed_posting_bans").select("id, user_id, created_by, reason, expires_at, active, scope, created_at").order("created_at", {
    ascending: false
  }).limit(200);
  return data ?? [];
});
const listModerationLogs_createServerFn_handler = createServerRpc({
  id: "3bb4818559f9b7152a84142cb659c6f64e3ff6c70246bb125305cada0d202d6c",
  name: "listModerationLogs",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => listModerationLogs.__executeServer(opts));
const listModerationLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  limit: numberType().int().min(1).max(500).default(100),
  content_type: enumType([...CONTENT_TYPES, "all"]).default("all")
}).parse(raw)).handler(listModerationLogs_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  let q = sb.from("content_moderation_logs").select("id, content_type, content_id, action_taken, reason, moderator_id, target_user_id, metadata, created_at").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.content_type !== "all") q = q.eq("content_type", data.content_type);
  const {
    data: rows
  } = await q;
  return rows ?? [];
});
const LOVABLE_AI = "https://ai.gateway.lovable.dev/v1/chat/completions";
async function callAiJson(messages, model = "google/gemini-3.1-flash-lite") {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch(LOVABLE_AI, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": key
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: {
        type: "json_object"
      }
    })
  });
  if (!res.ok) throw new Error(`AI moderation failed: ${res.status}`);
  const j = await res.json();
  const raw = j.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
const scanContentText_createServerFn_handler = createServerRpc({
  id: "44702b1b3aa3d91c37b1dbcc007bb588ccd4a6021709511da2d8fd791823da07",
  name: "scanContentText",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => scanContentText.__executeServer(opts));
const scanContentText = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  content_type: enumType(CONTENT_TYPES),
  content_id: stringType().uuid()
}).parse(raw)).handler(scanContentText_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const settings = {
    ...DEFAULT_SETTINGS
  };
  const sb = await admin();
  const {
    data: cfg
  } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
  Object.assign(settings, cfg?.value ?? {});
  if (!settings.ai_text_moderation_enabled) return {
    ok: true,
    skipped: true
  };
  const a = getAdapter(data.content_type);
  if (!a.textColumn) return {
    ok: true,
    skipped: true,
    reason: "no text column"
  };
  const {
    data: rec
  } = await sb.from(a.table).select(`${a.textColumn}, ${a.ownerColumn}`).eq("id", data.content_id).maybeSingle();
  const text = rec?.[a.textColumn] ?? "";
  const owner = rec?.[a.ownerColumn] ?? null;
  if (!text.trim()) return {
    ok: true,
    skipped: true,
    reason: "empty"
  };
  const cats = settings.ai_moderation_categories;
  const scores = await callAiJson([{
    role: "system",
    content: `You are a strict content moderator. Score the following text for each category from 0 (safe) to 1 (severe): ${cats.join(", ")}. Respond ONLY with a JSON object mapping each category to its score.`
  }, {
    role: "user",
    content: text.slice(0, 4e3)
  }]);
  const worst = Math.max(0, ...Object.values(scores).map((n) => Number(n) || 0));
  const threshold = settings.auto_hide_ai_threshold;
  const patch = {
    content_type: data.content_type,
    content_id: data.content_id,
    owner_id: owner,
    ai_flags: {
      text: {
        scanned_at: (/* @__PURE__ */ new Date()).toISOString(),
        threshold,
        scores
      }
    }
  };
  if (worst >= threshold) {
    patch.status = "hidden";
    patch.reason = `AI text moderation: ${worst.toFixed(2)}`;
    patch.hidden_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  await sb.from("content_moderation").upsert(patch, {
    onConflict: "content_type,content_id"
  });
  if (worst >= threshold) {
    await logAction({
      content_type: data.content_type,
      content_id: data.content_id,
      action_taken: "ai_auto_hide_text",
      reason: `worst=${worst.toFixed(2)}`,
      target_user_id: owner,
      metadata: {
        scores,
        threshold
      }
    });
  }
  return {
    ok: true,
    worst,
    threshold,
    scores
  };
});
const scanContentImages_createServerFn_handler = createServerRpc({
  id: "ac484ab6ed274e8b32857bd6d66c71c5469a0e0dd7676572b1fe95f91be4beaf",
  name: "scanContentImages",
  filename: "src/lib/moderation-engine.functions.ts"
}, (opts) => scanContentImages.__executeServer(opts));
const scanContentImages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  content_type: enumType(CONTENT_TYPES),
  content_id: stringType().uuid()
}).parse(raw)).handler(scanContentImages_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const settings = {
    ...DEFAULT_SETTINGS
  };
  const sb = await admin();
  const {
    data: cfg
  } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
  Object.assign(settings, cfg?.value ?? {});
  if (!settings.ai_image_moderation_enabled) return {
    ok: true,
    skipped: true
  };
  const a = getAdapter(data.content_type);
  if (!a.mediaColumn) return {
    ok: true,
    skipped: true,
    reason: "no media column"
  };
  const {
    data: rec
  } = await sb.from(a.table).select(`${a.mediaColumn}, ${a.ownerColumn}`).eq("id", data.content_id).maybeSingle();
  const media = rec?.[a.mediaColumn] ?? [];
  const owner = rec?.[a.ownerColumn] ?? null;
  const images = media.filter((u) => /\.(png|jpe?g|webp|gif|bmp)(\?|$)/i.test(u));
  if (images.length === 0) return {
    ok: true,
    skipped: true,
    reason: "no images"
  };
  const cats = settings.ai_moderation_categories;
  const results = [];
  for (const url of images.slice(0, 4)) {
    const scores = await callAiJson([{
      role: "system",
      content: `Rate this image for each category (0 safe → 1 severe): ${cats.join(", ")}. Reply ONLY as JSON.`
    }, {
      role: "user",
      content: [{
        type: "text",
        text: "Score the following image."
      }, {
        type: "image_url",
        image_url: {
          url
        }
      }]
    }], "google/gemini-3.1-flash-lite");
    results.push({
      url,
      scores
    });
  }
  const worst = Math.max(0, ...results.flatMap((r) => Object.values(r.scores).map((n) => Number(n) || 0)));
  const threshold = settings.auto_hide_ai_threshold;
  const patch = {
    content_type: data.content_type,
    content_id: data.content_id,
    owner_id: owner,
    ai_flags: {
      images: {
        scanned_at: (/* @__PURE__ */ new Date()).toISOString(),
        threshold,
        results
      }
    }
  };
  if (worst >= threshold) {
    patch.status = "hidden";
    patch.reason = `AI image moderation: ${worst.toFixed(2)}`;
    patch.hidden_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  await sb.from("content_moderation").upsert(patch, {
    onConflict: "content_type,content_id"
  });
  if (worst >= threshold) {
    await logAction({
      content_type: data.content_type,
      content_id: data.content_id,
      action_taken: "ai_auto_hide_image",
      reason: `worst=${worst.toFixed(2)}`,
      target_user_id: owner,
      metadata: {
        results,
        threshold
      }
    });
  }
  return {
    ok: true,
    worst,
    threshold,
    results
  };
});
export {
  banPosting_createServerFn_handler,
  getModerationSettings_createServerFn_handler,
  listModerationLogs_createServerFn_handler,
  listModerationQueue_createServerFn_handler,
  listPostingBans_createServerFn_handler,
  reportContent_createServerFn_handler,
  restorePosting_createServerFn_handler,
  scanContentImages_createServerFn_handler,
  scanContentText_createServerFn_handler,
  setContentModerationStatus_createServerFn_handler,
  warnUser_createServerFn_handler
};
