import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, a as arrayType, s as stringType, b as booleanType, n as numberType, e as enumType } from "../_libs/zod.mjs";
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
async function assertFeedMod(userId) {
  const roles = await getRoles(userId);
  if (!roles.some((r) => MOD_ROLES.includes(r))) {
    throw new Error("Forbidden: feed moderator only");
  }
  return roles;
}
async function assertAdmin(userId) {
  const roles = await getRoles(userId);
  if (!roles.some((r) => ADMIN_ROLES.includes(r))) {
    throw new Error("Forbidden: admin only");
  }
}
async function log(actor_id, action, extra = {}) {
  const sb = await admin();
  await sb.from("mod_logs").insert({
    actor_id,
    action,
    ...extra
  });
}
const DEFAULT_SETTINGS = {
  enabled: true,
  auto_hide_report_threshold: 5,
  auto_hide_ai_threshold: 0.8,
  duplicate_window_minutes: 10,
  max_posts_per_hour: 20,
  max_comments_per_minute: 10,
  ai_image_moderation_enabled: true,
  ai_moderation_categories: ["nudity", "pornography", "violence", "gore", "child_safety", "drugs", "weapons"]
};
const getFeedModerationSettings_createServerFn_handler = createServerRpc({
  id: "248f849df4c3d04439d35b4ddf1cdd07b9bba1352e2a29885b1215ccc6f95f68",
  name: "getFeedModerationSettings",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => getFeedModerationSettings.__executeServer(opts));
const getFeedModerationSettings = createServerFn({
  method: "GET"
}).handler(getFeedModerationSettings_createServerFn_handler, async () => {
  const sb = await admin();
  const {
    data
  } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
  return {
    ...DEFAULT_SETTINGS,
    ...data?.value ?? {}
  };
});
const updateFeedModerationSettings_createServerFn_handler = createServerRpc({
  id: "0261bc80b0a2f1c160f5b63ac0c1f66bb1fd5f5598fefadc0149531607a3c8be",
  name: "updateFeedModerationSettings",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => updateFeedModerationSettings.__executeServer(opts));
const updateFeedModerationSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  enabled: booleanType().optional(),
  auto_hide_report_threshold: numberType().int().min(1).max(1e3).optional(),
  auto_hide_ai_threshold: numberType().min(0).max(1).optional(),
  duplicate_window_minutes: numberType().int().min(0).max(1440).optional(),
  max_posts_per_hour: numberType().int().min(1).max(500).optional(),
  max_comments_per_minute: numberType().int().min(1).max(200).optional(),
  ai_image_moderation_enabled: booleanType().optional(),
  ai_moderation_categories: arrayType(stringType()).optional()
}).parse(raw)).handler(updateFeedModerationSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const sb = await admin();
  const {
    data: existing
  } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
  const merged = {
    ...DEFAULT_SETTINGS,
    ...existing?.value ?? {},
    ...data
  };
  await sb.from("app_settings").upsert({
    key: "feed_moderation",
    value: merged
  });
  await log(context.userId, "update_feed_moderation_settings", {
    payload: data
  });
  return {
    ok: true
  };
});
const reportFeedContent_createServerFn_handler = createServerRpc({
  id: "3caecbfa6f50c5adf739c43ad9b5081c0fd36848d7de51035aaa20b9275ce695",
  name: "reportFeedContent",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => reportFeedContent.__executeServer(opts));
const reportFeedContent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((raw) => objectType({
  target_type: enumType(["post", "comment"]),
  target_id: stringType().min(1).max(200),
  reason: stringType().min(1).max(200),
  details: stringType().max(2e3).optional()
}).parse(raw)).handler(reportFeedContent_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = await admin();
  const {
    data: dup
  } = await sb.from("reports").select("id").eq("reporter_id", context.userId).eq("target_type", data.target_type).eq("target_id", data.target_id).maybeSingle();
  if (dup) return {
    ok: true,
    deduped: true
  };
  const {
    error
  } = await sb.from("reports").insert({
    reporter_id: context.userId,
    target_type: data.target_type,
    target_id: data.target_id,
    reason: data.reason,
    details: data.details ?? null
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listFeedModerationQueue_createServerFn_handler = createServerRpc({
  id: "cec00d7120fa5ed28fc0eab31bec45ba65a47b2ecf5a1f9ee98f6b2817ff8495",
  name: "listFeedModerationQueue",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => listFeedModerationQueue.__executeServer(opts));
const listFeedModerationQueue = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  status: enumType(["pending_review", "hidden", "removed", "visible", "all"]).default("pending_review"),
  kind: enumType(["post", "comment", "all"]).default("all"),
  limit: numberType().int().min(1).max(200).default(50)
}).parse(raw ?? {})).handler(listFeedModerationQueue_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertFeedMod(context.userId);
  const sb = await admin();
  const out = {
    posts: [],
    comments: []
  };
  if (data.kind === "post" || data.kind === "all") {
    let q = sb.from("posts").select("id, author_id, text, media_urls, moderation_status, moderation_reason, report_count, ai_flags, created_at, hidden_at, slug").order("hidden_at", {
      ascending: false,
      nullsFirst: false
    }).order("created_at", {
      ascending: false
    }).limit(data.limit);
    if (data.status !== "all") q = q.eq("moderation_status", data.status);
    const {
      data: rows
    } = await q;
    out.posts = rows ?? [];
  }
  if (data.kind === "comment" || data.kind === "all") {
    let q = sb.from("comments").select("id, author_id, post_id, text, moderation_status, moderation_reason, report_count, created_at, hidden_at").order("hidden_at", {
      ascending: false,
      nullsFirst: false
    }).order("created_at", {
      ascending: false
    }).limit(data.limit);
    if (data.status !== "all") q = q.eq("moderation_status", data.status);
    const {
      data: rows
    } = await q;
    out.comments = rows ?? [];
  }
  return out;
});
const setFeedContentStatus_createServerFn_handler = createServerRpc({
  id: "b47e9f78647e19555411c5d63f3a26ebdc3bc09690bc793f4441ef0f710574d2",
  name: "setFeedContentStatus",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => setFeedContentStatus.__executeServer(opts));
const setFeedContentStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  target_type: enumType(["post", "comment"]),
  target_id: stringType().uuid(),
  status: enumType(["visible", "pending_review", "hidden", "removed"]),
  reason: stringType().max(500).optional()
}).parse(raw)).handler(setFeedContentStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertFeedMod(context.userId);
  const sb = await admin();
  const table = data.target_type === "post" ? "posts" : "comments";
  const patch = {
    moderation_status: data.status,
    moderation_reason: data.reason ?? null,
    hidden_at: data.status === "visible" ? null : (/* @__PURE__ */ new Date()).toISOString()
  };
  const {
    error
  } = await sb.from(table).update(patch).eq("id", data.target_id);
  if (error) throw new Error(error.message);
  await sb.from("reports").update({
    status: "resolved",
    resolved_by: context.userId,
    resolved_at: (/* @__PURE__ */ new Date()).toISOString(),
    resolution_note: `Moderated: ${data.status}`
  }).eq("target_type", data.target_type).eq("target_id", data.target_id).eq("status", "open");
  await log(context.userId, `feed_${data.status}_${data.target_type}`, {
    target_id: data.target_id,
    payload: {
      reason: data.reason
    }
  });
  return {
    ok: true
  };
});
const warnFeedUser_createServerFn_handler = createServerRpc({
  id: "246a24223a2271e0141064446adc04fcf35af7e4fd1ae62f801b65d88fd1400e",
  name: "warnFeedUser",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => warnFeedUser.__executeServer(opts));
const warnFeedUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().min(1).max(500),
  severity: enumType(["notice", "warning", "final_warning"]).default("warning"),
  target_type: enumType(["post", "comment"]).optional(),
  target_id: stringType().optional()
}).parse(raw)).handler(warnFeedUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertFeedMod(context.userId);
  const sb = await admin();
  const {
    error
  } = await sb.from("feed_mod_warnings").insert({
    user_id: data.user_id,
    moderator_id: context.userId,
    severity: data.severity,
    reason: data.reason,
    target_type: data.target_type ?? null,
    target_id: data.target_id ?? null
  });
  if (error) throw new Error(error.message);
  await log(context.userId, "warn", {
    target_user_id: data.user_id,
    payload: {
      reason: data.reason,
      severity: data.severity
    }
  });
  return {
    ok: true
  };
});
const listMyFeedWarnings_createServerFn_handler = createServerRpc({
  id: "7a84a1341d56e0f7879e523778af4740cfdea2cc24e696a6e9bec6b94166103c",
  name: "listMyFeedWarnings",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => listMyFeedWarnings.__executeServer(opts));
const listMyFeedWarnings = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyFeedWarnings_createServerFn_handler, async ({
  context
}) => {
  const sb = await admin();
  const {
    data
  } = await sb.from("feed_mod_warnings").select("*").eq("user_id", context.userId).order("created_at", {
    ascending: false
  }).limit(50);
  return data ?? [];
});
const acknowledgeWarning_createServerFn_handler = createServerRpc({
  id: "777edff60046b3ac54850d08d4d5c82aa6c636334fa1f3525592ed8203cb5620",
  name: "acknowledgeWarning",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => acknowledgeWarning.__executeServer(opts));
const acknowledgeWarning = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  id: stringType().uuid()
}).parse(raw)).handler(acknowledgeWarning_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = await admin();
  await sb.from("feed_mod_warnings").update({
    acknowledged_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id).eq("user_id", context.userId);
  return {
    ok: true
  };
});
const banFeedPosting_createServerFn_handler = createServerRpc({
  id: "5abc54688d8062b099ae81206add8a847103db3a305faab4b8a24df8f8ae630c",
  name: "banFeedPosting",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => banFeedPosting.__executeServer(opts));
const banFeedPosting = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().max(500).optional(),
  duration_hours: numberType().int().min(1).max(24 * 365).optional()
}).parse(raw)).handler(banFeedPosting_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertFeedMod(context.userId);
  const sb = await admin();
  const expires_at = data.duration_hours ? new Date(Date.now() + data.duration_hours * 36e5).toISOString() : null;
  const {
    error
  } = await sb.from("feed_posting_bans").insert({
    user_id: data.user_id,
    reason: data.reason ?? null,
    created_by: context.userId,
    expires_at,
    active: true
  });
  if (error) throw new Error(error.message);
  await log(context.userId, "feed_posting_ban", {
    target_user_id: data.user_id,
    payload: {
      reason: data.reason,
      expires_at
    }
  });
  return {
    ok: true
  };
});
const restoreFeedPosting_createServerFn_handler = createServerRpc({
  id: "defa6110596eced07887b9c70507327d97ab81a6c1f06e2b23ca96aafcbd300c",
  name: "restoreFeedPosting",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => restoreFeedPosting.__executeServer(opts));
const restoreFeedPosting = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid()
}).parse(raw)).handler(restoreFeedPosting_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertFeedMod(context.userId);
  const sb = await admin();
  await sb.from("feed_posting_bans").update({
    active: false
  }).eq("user_id", data.user_id).eq("active", true);
  await log(context.userId, "feed_posting_restore", {
    target_user_id: data.user_id
  });
  return {
    ok: true
  };
});
const listFeedPostingBans_createServerFn_handler = createServerRpc({
  id: "172b73de3b53195253ac8d9e3870c854a2b4839dace6eb714f3dc40c95a5a20b",
  name: "listFeedPostingBans",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => listFeedPostingBans.__executeServer(opts));
const listFeedPostingBans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listFeedPostingBans_createServerFn_handler, async ({
  context
}) => {
  await assertFeedMod(context.userId);
  const sb = await admin();
  const {
    data
  } = await sb.from("feed_posting_bans").select("*").order("created_at", {
    ascending: false
  }).limit(100);
  return data ?? [];
});
const checkMyPostingBan_createServerFn_handler = createServerRpc({
  id: "9ca93ed940bcc03f573c35a49348237467afcfb637dbc574ebb57effc7eba4c8",
  name: "checkMyPostingBan",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => checkMyPostingBan.__executeServer(opts));
const checkMyPostingBan = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(checkMyPostingBan_createServerFn_handler, async ({
  context
}) => {
  const sb = await admin();
  const {
    data
  } = await sb.from("feed_posting_bans").select("id, reason, expires_at, created_at").eq("user_id", context.userId).eq("active", true).order("created_at", {
    ascending: false
  }).limit(1);
  const row = data?.[0];
  if (!row) return {
    banned: false
  };
  if (row.expires_at && new Date(row.expires_at) < /* @__PURE__ */ new Date()) return {
    banned: false
  };
  return {
    banned: true,
    reason: row.reason,
    expires_at: row.expires_at
  };
});
const listFeedModLogs_createServerFn_handler = createServerRpc({
  id: "a19a8f526a0f09943ce31d3facccc97774dd2ed98f033d3b6c9a566289488c36",
  name: "listFeedModLogs",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => listFeedModLogs.__executeServer(opts));
const listFeedModLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  limit: numberType().int().min(1).max(200).default(100)
}).parse(raw ?? {})).handler(listFeedModLogs_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertFeedMod(context.userId);
  const sb = await admin();
  const {
    data: rows
  } = await sb.from("mod_logs").select("*").like("action", "feed_%").order("created_at", {
    ascending: false
  }).limit(data.limit);
  return rows ?? [];
});
async function callLovableAiVision(imageUrl, categories) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const catList = categories.join(", ");
  const prompt = `You are a content safety classifier. Analyze the image and return STRICT JSON only, no prose.
For each of these categories: ${catList}, return a probability from 0.0 to 1.0 that the image contains that category.
Respond in this exact JSON shape:
{"categories":{"nudity":0.0,"pornography":0.0,"violence":0.0,"gore":0.0,"child_safety":0.0,"drugs":0.0,"weapons":0.0},"reasons":["short reason"]}`;
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey
    },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-lite",
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: prompt
        }, {
          type: "image_url",
          image_url: {
            url: imageUrl
          }
        }]
      }]
    })
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI gateway ${res.status}: ${t.slice(0, 200)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? "{}";
  const cleaned = content.replace(/```json\s*|\s*```/g, "").trim();
  let parsed = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
  }
  const cats = parsed.categories ?? {};
  const values = Object.values(cats).map((v) => Number(v) || 0);
  const max_score = values.length ? Math.max(...values) : 0;
  return {
    flagged: max_score >= 0.5,
    max_score,
    categories: cats,
    reasons: parsed.reasons ?? []
  };
}
const scanPostImages_createServerFn_handler = createServerRpc({
  id: "4984e2915977ae47faf1219a02cd99dacf3ad4f86b1c26736453b40fa31ef939",
  name: "scanPostImages",
  filename: "src/lib/feed-moderation.functions.ts"
}, (opts) => scanPostImages.__executeServer(opts));
const scanPostImages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  post_id: stringType().uuid()
}).parse(raw)).handler(scanPostImages_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = await admin();
  const {
    data: post
  } = await sb.from("posts").select("id, author_id, media_urls").eq("id", data.post_id).maybeSingle();
  if (!post) throw new Error("Post not found");
  if (post.author_id !== context.userId) await assertFeedMod(context.userId);
  const settings = await (async () => {
    const {
      data: data2
    } = await sb.from("app_settings").select("value").eq("key", "feed_moderation").maybeSingle();
    return {
      ...DEFAULT_SETTINGS,
      ...data2?.value ?? {}
    };
  })();
  if (!settings.ai_image_moderation_enabled) return {
    skipped: true
  };
  const urls = (post.media_urls ?? []).filter((u) => /\.(png|jpe?g|webp|gif)(\?|$)/i.test(u));
  if (urls.length === 0) return {
    skipped: true,
    reason: "no images"
  };
  const results = [];
  for (const url of urls.slice(0, 4)) {
    try {
      const r = await callLovableAiVision(url, settings.ai_moderation_categories);
      results.push({
        ...r,
        url
      });
    } catch (e) {
      results.push({
        url,
        flagged: false,
        max_score: 0,
        categories: {},
        reasons: [String(e).slice(0, 200)]
      });
    }
  }
  const worst = results.reduce((m, r) => r.max_score > m ? r.max_score : m, 0);
  const threshold = Number(settings.auto_hide_ai_threshold) || 0.8;
  const patch = {
    ai_flags: {
      scanned_at: (/* @__PURE__ */ new Date()).toISOString(),
      threshold,
      results
    }
  };
  if (worst >= threshold) {
    patch.moderation_status = "hidden";
    patch.moderation_reason = `AI moderation: score ${worst.toFixed(2)}`;
    patch.hidden_at = (/* @__PURE__ */ new Date()).toISOString();
  }
  await sb.from("posts").update(patch).eq("id", post.id);
  if (worst >= threshold) {
    await log(context.userId, "feed_ai_auto_hide_post", {
      target_id: post.id,
      payload: {
        worst,
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
  acknowledgeWarning_createServerFn_handler,
  banFeedPosting_createServerFn_handler,
  checkMyPostingBan_createServerFn_handler,
  getFeedModerationSettings_createServerFn_handler,
  listFeedModLogs_createServerFn_handler,
  listFeedModerationQueue_createServerFn_handler,
  listFeedPostingBans_createServerFn_handler,
  listMyFeedWarnings_createServerFn_handler,
  reportFeedContent_createServerFn_handler,
  restoreFeedPosting_createServerFn_handler,
  scanPostImages_createServerFn_handler,
  setFeedContentStatus_createServerFn_handler,
  updateFeedModerationSettings_createServerFn_handler,
  warnFeedUser_createServerFn_handler
};
