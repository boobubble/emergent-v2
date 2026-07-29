import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, e as enumType, n as numberType, b as booleanType } from "../_libs/zod.mjs";
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
async function getSupabaseAdmin() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin2;
}
async function assertMod(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin", "moderator"]);
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Forbidden: moderator only");
  return data.map((r) => r.role);
}
async function assertCanClearChannel(userId, channelId) {
  const admin = await getSupabaseAdmin();
  const {
    data: roles
  } = await admin.from("user_roles").select("role").eq("user_id", userId);
  const list = (roles ?? []).map((r) => r.role);
  const isAdmin = list.includes("super_admin") || list.includes("admin");
  if (isAdmin) return;
  const {
    data: roomMod
  } = await admin.from("room_moderators").select("can_delete").eq("channel_id", channelId).eq("user_id", userId).maybeSingle();
  if (roomMod?.can_delete) return;
  if (list.includes("moderator")) {
    const {
      data: settings
    } = await admin.from("app_settings").select("value").eq("key", "staff_permissions").maybeSingle();
    const allowed = !!settings?.value?.["mod_can_clear"];
    if (allowed) return;
    throw new Error("Forbidden: clear not permitted for moderators in this room");
  }
  throw new Error("Forbidden: admins only");
}
async function logAction(actor_id, action, extra = {}) {
  await (await getSupabaseAdmin()).from("mod_logs").insert({
    actor_id,
    action,
    ...extra
  });
}
const submitReport_createServerFn_handler = createServerRpc({
  id: "5b14dfeb1053efc9ccdc068fe9c81e5cf6351da739757e32d1422b647be34d0c",
  name: "submitReport",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => submitReport.__executeServer(opts));
const submitReport = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  target_type: enumType(["message", "post", "user", "room"]),
  target_id: stringType().min(1).max(200),
  reason: stringType().min(1).max(200),
  details: stringType().max(2e3).optional()
}).parse(input)).handler(submitReport_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    error
  } = await (await getSupabaseAdmin()).from("reports").insert({
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
const listReports_createServerFn_handler = createServerRpc({
  id: "13197cecf7a93908ab279f0a64c9024df2cd1af5fe5a7827673507625fbb883c",
  name: "listReports",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listReports.__executeServer(opts));
const listReports = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  status: enumType(["open", "reviewing", "resolved", "dismissed", "all"]).default("open"),
  limit: numberType().min(1).max(100).default(50)
}).parse(input ?? {})).handler(listReports_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const supabaseAdmin2 = await getSupabaseAdmin();
  let q = supabaseAdmin2.from("reports").select("*").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const resolveReport_createServerFn_handler = createServerRpc({
  id: "904ae947fc68d271fe8c3d70c2743099c238527e72eb57451cbfaf1e6e611c32",
  name: "resolveReport",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => resolveReport.__executeServer(opts));
const resolveReport = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid(),
  status: enumType(["resolved", "dismissed", "reviewing"]),
  note: stringType().max(500).optional()
}).parse(input)).handler(resolveReport_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await supabaseAdmin.from("reports").update({
    status: data.status,
    resolved_by: context.userId,
    resolved_at: (/* @__PURE__ */ new Date()).toISOString(),
    resolution_note: data.note ?? null
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, data.status === "dismissed" ? "dismiss_report" : "resolve_report", {
    target_id: data.id,
    payload: {
      note: data.note
    }
  });
  return {
    ok: true
  };
});
const banUser_createServerFn_handler = createServerRpc({
  id: "93a20d854ff9e7a47db58302bdfd1300ffdf9d88403ebab9995ac470c8a7e476",
  name: "banUser",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => banUser.__executeServer(opts));
const banUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  user_id: stringType().uuid().optional(),
  ip_address: stringType().max(64).optional(),
  ban_type: enumType(["ban", "temp_ban", "shadow_ban", "ip_ban"]).default("ban"),
  reason: stringType().max(300).optional(),
  expires_in_hours: numberType().int().min(1).max(24 * 365).optional()
}).refine((v) => v.user_id || v.ip_address, "Must supply user_id or ip_address").parse(input)).handler(banUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const expires_at = data.expires_in_hours ? new Date(Date.now() + data.expires_in_hours * 3600 * 1e3).toISOString() : null;
  const {
    error
  } = await (await getSupabaseAdmin()).from("user_bans").insert({
    user_id: data.user_id ?? null,
    ip_address: data.ip_address ?? null,
    ban_type: data.ban_type,
    reason: data.reason ?? null,
    created_by: context.userId,
    expires_at
  });
  if (error) throw new Error(error.message);
  await logAction(context.userId, data.ban_type === "temp_ban" ? "temp_ban" : data.ban_type, {
    target_user_id: data.user_id ?? null,
    payload: {
      reason: data.reason,
      ip: data.ip_address,
      expires_at
    }
  });
  return {
    ok: true
  };
});
const unbanUser_createServerFn_handler = createServerRpc({
  id: "2b4779863a4b16dfd05bc47fd045e559154bdbbedf8df25564ab296754e409d6",
  name: "unbanUser",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => unbanUser.__executeServer(opts));
const unbanUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  ban_id: stringType().uuid()
}).parse(input)).handler(unbanUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    data: row
  } = await (await getSupabaseAdmin()).from("user_bans").select("user_id").eq("id", data.ban_id).maybeSingle();
  const {
    error
  } = await (await getSupabaseAdmin()).from("user_bans").update({
    active: false
  }).eq("id", data.ban_id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "unban", {
    target_user_id: row?.user_id ?? null,
    target_id: data.ban_id
  });
  return {
    ok: true
  };
});
const listBans_createServerFn_handler = createServerRpc({
  id: "510834ed19314b8bfa5b45d32a37e7091c31e0efd9485dfdc6525e0d24ec063f",
  name: "listBans",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listBans.__executeServer(opts));
const listBans = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(listBans_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("user_bans").select("*").order("created_at", {
    ascending: false
  }).limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []).map((b) => ({
    ...b,
    ip_address: b.ip_address ? String(b.ip_address) : null
  }));
});
const muteUser_createServerFn_handler = createServerRpc({
  id: "b23105094f3791c20564aafcb55d4513a9a511700ee837f54fae17db7ef7ee14",
  name: "muteUser",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => muteUser.__executeServer(opts));
const muteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  scope: enumType(["global", "room"]).default("global"),
  channel_id: stringType().max(120).optional(),
  reason: stringType().max(300).optional(),
  expires_in_minutes: numberType().int().min(1).max(60 * 24 * 30).optional()
}).parse(input)).handler(muteUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const expires_at = data.expires_in_minutes ? new Date(Date.now() + data.expires_in_minutes * 6e4).toISOString() : null;
  const {
    error
  } = await (await getSupabaseAdmin()).from("user_mutes").insert({
    user_id: data.user_id,
    scope: data.scope,
    channel_id: data.scope === "room" ? data.channel_id ?? null : null,
    reason: data.reason ?? null,
    created_by: context.userId,
    expires_at
  });
  if (error) throw new Error(error.message);
  await logAction(context.userId, "mute", {
    target_user_id: data.user_id,
    payload: {
      scope: data.scope,
      channel_id: data.channel_id,
      expires_at
    }
  });
  return {
    ok: true
  };
});
const unmuteUser_createServerFn_handler = createServerRpc({
  id: "51fb597f248aae4730c787cf9a67a37a5a2d0fc39a4c5242e709a64f2900aa5d",
  name: "unmuteUser",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => unmuteUser.__executeServer(opts));
const unmuteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  mute_id: stringType().uuid()
}).parse(input)).handler(unmuteUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    data: row
  } = await (await getSupabaseAdmin()).from("user_mutes").select("user_id").eq("id", data.mute_id).maybeSingle();
  const {
    error
  } = await (await getSupabaseAdmin()).from("user_mutes").update({
    active: false
  }).eq("id", data.mute_id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "unmute", {
    target_user_id: row?.user_id,
    target_id: data.mute_id
  });
  return {
    ok: true
  };
});
const listMutes_createServerFn_handler = createServerRpc({
  id: "194adec9b1239c58814c040ae60f776ec88424888faf3253db2e5c694665a834",
  name: "listMutes",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listMutes.__executeServer(opts));
const listMutes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(listMutes_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("user_mutes").select("*").order("created_at", {
    ascending: false
  }).limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const addModNote_createServerFn_handler = createServerRpc({
  id: "96273832da7bf56d368e64116c40c802d46e16c4d3a4bf119bfb6defef0f0d13",
  name: "addModNote",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => addModNote.__executeServer(opts));
const addModNote = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  note: stringType().min(1).max(1e3)
}).parse(input)).handler(addModNote_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("mod_notes").insert({
    user_id: data.user_id,
    author_id: context.userId,
    note: data.note
  });
  if (error) throw new Error(error.message);
  await logAction(context.userId, "note", {
    target_user_id: data.user_id
  });
  return {
    ok: true
  };
});
const listModNotes_createServerFn_handler = createServerRpc({
  id: "ffa89cc04bcc37686599f76c58fe62a72a45ddeaf6d23801ed70af1573225f47",
  name: "listModNotes",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listModNotes.__executeServer(opts));
const listModNotes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  user_id: stringType().uuid()
}).parse(input)).handler(listModNotes_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("mod_notes").select("*").eq("user_id", data.user_id).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const listWordFilters_createServerFn_handler = createServerRpc({
  id: "8d31ed5714910de22c3f88243b9f9f17091f46085c8efcebe8fe1c59387f2e81",
  name: "listWordFilters",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listWordFilters.__executeServer(opts));
const listWordFilters = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(listWordFilters_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const {
    data,
    error
  } = await (await getSupabaseAdmin()).from("word_filters").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const addWordFilter_createServerFn_handler = createServerRpc({
  id: "4975a3d209916640d3645d3c35bd29fadda4a76d15a7a5c5359a99dd359fa833",
  name: "addWordFilter",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => addWordFilter.__executeServer(opts));
const addWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  pattern: stringType().min(1).max(200),
  match_mode: enumType(["word", "substring", "regex"]).default("word"),
  action: enumType(["delete", "warn", "mute", "ban"]).default("delete"),
  severity: numberType().int().min(1).max(5).default(1)
}).parse(input)).handler(addWordFilter_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("word_filters").insert({
    pattern: data.pattern,
    match_mode: data.match_mode,
    action: data.action,
    severity: data.severity,
    created_by: context.userId
  });
  if (error) throw new Error(error.message);
  await logAction(context.userId, "add_word_filter", {
    payload: data
  });
  return {
    ok: true
  };
});
const toggleWordFilter_createServerFn_handler = createServerRpc({
  id: "a9424254cfab74772210379a43d0fda4b470c0aeb3bc65d30b62ddbe96d9efec",
  name: "toggleWordFilter",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => toggleWordFilter.__executeServer(opts));
const toggleWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid(),
  active: booleanType()
}).parse(input)).handler(toggleWordFilter_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("word_filters").update({
    active: data.active
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const removeWordFilter_createServerFn_handler = createServerRpc({
  id: "e3035232fe8249b1549f38104875512e5a8f83800ae39aab13bf71b2c16891da",
  name: "removeWordFilter",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => removeWordFilter.__executeServer(opts));
const removeWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(removeWordFilter_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("word_filters").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "remove_word_filter", {
    target_id: data.id
  });
  return {
    ok: true
  };
});
const listUrlRules_createServerFn_handler = createServerRpc({
  id: "bceef2701b7def3d01429a3b8547ce1d33d49c4888f1c347b5f8c09707be600d",
  name: "listUrlRules",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listUrlRules.__executeServer(opts));
const listUrlRules = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(listUrlRules_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const {
    data,
    error
  } = await (await getSupabaseAdmin()).from("url_rules").select("*").order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const listSafetyEvents_createServerFn_handler = createServerRpc({
  id: "d5a2761f6587ce0e4e655590f92ab3275a0110ef756960039d01dd89c7dd961c",
  name: "listSafetyEvents",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listSafetyEvents.__executeServer(opts));
const listSafetyEvents = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  status: enumType(["pending", "approved", "kept_blocked", "false_positive", "escalated", "all"]).default("pending"),
  severity: numberType().int().min(1).max(3).optional(),
  limit: numberType().min(1).max(200).default(100)
}).parse(input ?? {})).handler(listSafetyEvents_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const admin = await getSupabaseAdmin();
  let q = admin.from("safety_events").select("*").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.status !== "all") q = q.eq("status", data.status);
  if (data.severity) q = q.eq("severity", data.severity);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const getSafetyOverview_createServerFn_handler = createServerRpc({
  id: "ca2072252a78efb63f5598b294177f9ea35af0c1ffeffd291bbe5ae0a865057d",
  name: "getSafetyOverview",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => getSafetyOverview.__executeServer(opts));
const getSafetyOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(getSafetyOverview_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const admin = await getSupabaseAdmin();
  const [pending, sev3_24h, blocked_24h] = await Promise.all([admin.from("safety_events").select("id", {
    count: "exact",
    head: true
  }).eq("status", "pending"), admin.from("safety_events").select("id", {
    count: "exact",
    head: true
  }).eq("severity", 3).gte("created_at", new Date(Date.now() - 24 * 3600 * 1e3).toISOString()), admin.from("safety_events").select("id", {
    count: "exact",
    head: true
  }).neq("action", "logged").gte("created_at", new Date(Date.now() - 24 * 3600 * 1e3).toISOString())]);
  return {
    pending: pending.count ?? 0,
    imminent24h: sev3_24h.count ?? 0,
    blocked24h: blocked_24h.count ?? 0
  };
});
const resolveSafetyEvent_createServerFn_handler = createServerRpc({
  id: "a38c4eed08768910568de3a1fd04061f3cdad98653000cc7fe2d086a8dd8a6ef",
  name: "resolveSafetyEvent",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => resolveSafetyEvent.__executeServer(opts));
const resolveSafetyEvent = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid(),
  status: enumType(["approved", "kept_blocked", "false_positive", "escalated"]),
  note: stringType().max(1e3).optional()
}).parse(input)).handler(resolveSafetyEvent_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const admin = await getSupabaseAdmin();
  const {
    error
  } = await admin.from("safety_events").update({
    status: data.status,
    reviewer_id: context.userId,
    reviewer_note: data.note ?? null,
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "resolve_report", {
    target_id: data.id,
    payload: {
      safety: true,
      status: data.status
    }
  });
  return {
    ok: true
  };
});
const listSafetyKeywords_createServerFn_handler = createServerRpc({
  id: "b77ac8f3e89f8a411abb2c4b3ee4b25e114db5d9641308ce7be61d7eace9a3c3",
  name: "listSafetyKeywords",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listSafetyKeywords.__executeServer(opts));
const listSafetyKeywords = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(listSafetyKeywords_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const admin = await getSupabaseAdmin();
  const {
    data,
    error
  } = await admin.from("safety_keywords").select("*").order("severity", {
    ascending: false
  }).order("category");
  if (error) throw new Error(error.message);
  return data ?? [];
});
const addSafetyKeyword_createServerFn_handler = createServerRpc({
  id: "099a6e1d76fdb6ee7128d8ca5d39c57c9d0ed2cc5a193a1a473ec14a429cb018",
  name: "addSafetyKeyword",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => addSafetyKeyword.__executeServer(opts));
const addSafetyKeyword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  pattern: stringType().min(2).max(200),
  match_mode: enumType(["word", "substring", "regex"]).default("substring"),
  category: enumType(["violent_crime", "terrorism", "illegal_coordination", "threats", "dangerous_instructions", "self_harm"]),
  severity: numberType().int().min(1).max(3),
  notes: stringType().max(300).optional()
}).parse(input)).handler(addSafetyKeyword_createServerFn_handler, async ({
  data,
  context
}) => {
  const admin = await getSupabaseAdmin();
  const {
    data: roles
  } = await admin.from("user_roles").select("role").eq("user_id", context.userId);
  const list = (roles ?? []).map((r) => r.role);
  if (!list.includes("super_admin") && !list.includes("admin")) throw new Error("Admins only");
  const {
    error
  } = await admin.from("safety_keywords").insert({
    ...data,
    created_by: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const toggleSafetyKeyword_createServerFn_handler = createServerRpc({
  id: "9b778343bcc20eff8b6b715dcdbe1bd7cb89e6c9307beead47065c79d34373d1",
  name: "toggleSafetyKeyword",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => toggleSafetyKeyword.__executeServer(opts));
const toggleSafetyKeyword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid(),
  active: booleanType()
}).parse(input)).handler(toggleSafetyKeyword_createServerFn_handler, async ({
  data,
  context
}) => {
  const admin = await getSupabaseAdmin();
  const {
    data: roles
  } = await admin.from("user_roles").select("role").eq("user_id", context.userId);
  const list = (roles ?? []).map((r) => r.role);
  if (!list.includes("super_admin") && !list.includes("admin")) throw new Error("Admins only");
  const {
    error
  } = await admin.from("safety_keywords").update({
    active: data.active
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const removeSafetyKeyword_createServerFn_handler = createServerRpc({
  id: "ee442200247ecaa0fe19333bddddcf6c3dcc584e9bbaa2372353caa75e8090c0",
  name: "removeSafetyKeyword",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => removeSafetyKeyword.__executeServer(opts));
const removeSafetyKeyword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(removeSafetyKeyword_createServerFn_handler, async ({
  data,
  context
}) => {
  const admin = await getSupabaseAdmin();
  const {
    data: roles
  } = await admin.from("user_roles").select("role").eq("user_id", context.userId);
  const list = (roles ?? []).map((r) => r.role);
  if (!list.includes("super_admin") && !list.includes("admin")) throw new Error("Admins only");
  const {
    error
  } = await admin.from("safety_keywords").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const addUrlRule_createServerFn_handler = createServerRpc({
  id: "d38cd20832451dfce02f356b71412befb301614846107b83511c64ee08002b41",
  name: "addUrlRule",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => addUrlRule.__executeServer(opts));
const addUrlRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  domain: stringType().min(1).max(253).regex(/^[a-z0-9.-]+$/i, "Invalid domain"),
  kind: enumType(["whitelist", "block"]),
  reason: stringType().max(300).optional()
}).parse(input)).handler(addUrlRule_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("url_rules").insert({
    domain: data.domain.toLowerCase(),
    kind: data.kind,
    reason: data.reason ?? null,
    created_by: context.userId
  });
  if (error) throw new Error(error.message);
  await logAction(context.userId, "add_url_rule", {
    payload: data
  });
  return {
    ok: true
  };
});
const removeUrlRule_createServerFn_handler = createServerRpc({
  id: "6b5868a3bc308e0b920ebbcfa3b966ad4ab93f6d91e9d28434a6a00ebc071859",
  name: "removeUrlRule",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => removeUrlRule.__executeServer(opts));
const removeUrlRule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(removeUrlRule_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("url_rules").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "remove_url_rule", {
    target_id: data.id
  });
  return {
    ok: true
  };
});
const listModLogs_createServerFn_handler = createServerRpc({
  id: "938f7aa1c066589f34b105f1e75788fdeb08007a255a0f9c5713a8f5d80ea87d",
  name: "listModLogs",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listModLogs.__executeServer(opts));
const listModLogs = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  limit: numberType().min(1).max(200).default(100),
  offset: numberType().min(0).default(0)
}).parse(input ?? {})).handler(listModLogs_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("mod_logs").select("*").order("created_at", {
    ascending: false
  }).range(data.offset, data.offset + data.limit - 1);
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const deleteMessageMod_createServerFn_handler = createServerRpc({
  id: "b0c0148f8022a9c6676468e9db620f0e1bb1181ec0666b5a027a4b6c007c4829",
  name: "deleteMessageMod",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => deleteMessageMod.__executeServer(opts));
const deleteMessageMod = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  message_id: stringType().uuid()
}).parse(input)).handler(deleteMessageMod_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("messages").delete().eq("id", data.message_id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "delete_message", {
    target_id: data.message_id
  });
  return {
    ok: true
  };
});
const clearChannelMessages_createServerFn_handler = createServerRpc({
  id: "51b83da4c18eba0eb6bb2cc8f2d23de7e686cc72f1b7c10d9c40e11f926fd7dd",
  name: "clearChannelMessages",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => clearChannelMessages.__executeServer(opts));
const clearChannelMessages = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  channel_id: stringType().min(1).max(120)
}).parse(input)).handler(clearChannelMessages_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertCanClearChannel(context.userId, data.channel_id);
  const admin = await getSupabaseAdmin();
  const {
    error,
    count
  } = await admin.from("messages").delete({
    count: "exact"
  }).eq("channel_id", data.channel_id);
  if (error) throw new Error(error.message);
  await logAction(context.userId, "clear_channel", {
    target_type: "room",
    target_id: data.channel_id,
    payload: {
      deleted: count ?? 0
    }
  });
  return {
    ok: true,
    deleted: count ?? 0
  };
});
const listRoomMods_createServerFn_handler = createServerRpc({
  id: "00c6d5fd79c075b80da9b03a9de5dd016390bd03a489a440da08a0b0cfc1de84",
  name: "listRoomMods",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => listRoomMods.__executeServer(opts));
const listRoomMods = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(listRoomMods_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("room_moderators").select("*, profiles:profiles!room_moderators_user_id_fkey(username)").order("created_at", {
    ascending: false
  });
  if (error) {
    const fb = await (await getSupabaseAdmin()).from("room_moderators").select("*").order("created_at", {
      ascending: false
    });
    if (fb.error) throw new Error(fb.error.message);
    return fb.data ?? [];
  }
  return data ?? [];
});
const addRoomMod_createServerFn_handler = createServerRpc({
  id: "4468701995c07827fac4521df332860cd5bfad46a34a04a1134b6458a97d7c5e",
  name: "addRoomMod",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => addRoomMod.__executeServer(opts));
const addRoomMod = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  channel_id: stringType().min(1).max(120),
  user_id: stringType().uuid(),
  can_mute: booleanType().default(true),
  can_kick: booleanType().default(true),
  can_pin: booleanType().default(true),
  can_delete: booleanType().default(true)
}).parse(input)).handler(addRoomMod_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("room_moderators").upsert({
    ...data,
    created_by: context.userId
  }, {
    onConflict: "channel_id,user_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const removeRoomMod_createServerFn_handler = createServerRpc({
  id: "3e79ec63853e941008ccc2363b06742a92dad5343b069d136f8a97b5b678da69",
  name: "removeRoomMod",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => removeRoomMod.__executeServer(opts));
const removeRoomMod = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(removeRoomMod_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const {
    error
  } = await (await getSupabaseAdmin()).from("room_moderators").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getModerationOverview_createServerFn_handler = createServerRpc({
  id: "eaa3c7c28ecf16a343af3795ace756c843f2b7ee6ddd16a002bc92d58a88865b",
  name: "getModerationOverview",
  filename: "src/lib/moderation.functions.ts"
}, (opts) => getModerationOverview.__executeServer(opts));
const getModerationOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("report.submit")]).handler(getModerationOverview_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const [openReports, activeBans, activeMutes, filters, urls, logs24] = await Promise.all([(await getSupabaseAdmin()).from("reports").select("id", {
    count: "exact",
    head: true
  }).eq("status", "open"), (await getSupabaseAdmin()).from("user_bans").select("id", {
    count: "exact",
    head: true
  }).eq("active", true), (await getSupabaseAdmin()).from("user_mutes").select("id", {
    count: "exact",
    head: true
  }).eq("active", true), (await getSupabaseAdmin()).from("word_filters").select("id", {
    count: "exact",
    head: true
  }).eq("active", true), (await getSupabaseAdmin()).from("url_rules").select("id", {
    count: "exact",
    head: true
  }).eq("active", true), (await getSupabaseAdmin()).from("mod_logs").select("id", {
    count: "exact",
    head: true
  }).gte("created_at", new Date(Date.now() - 24 * 3600 * 1e3).toISOString())]);
  return {
    openReports: openReports.count ?? 0,
    activeBans: activeBans.count ?? 0,
    activeMutes: activeMutes.count ?? 0,
    activeWordFilters: filters.count ?? 0,
    activeUrlRules: urls.count ?? 0,
    logs24h: logs24.count ?? 0
  };
});
export {
  addModNote_createServerFn_handler,
  addRoomMod_createServerFn_handler,
  addSafetyKeyword_createServerFn_handler,
  addUrlRule_createServerFn_handler,
  addWordFilter_createServerFn_handler,
  banUser_createServerFn_handler,
  clearChannelMessages_createServerFn_handler,
  deleteMessageMod_createServerFn_handler,
  getModerationOverview_createServerFn_handler,
  getSafetyOverview_createServerFn_handler,
  listBans_createServerFn_handler,
  listModLogs_createServerFn_handler,
  listModNotes_createServerFn_handler,
  listMutes_createServerFn_handler,
  listReports_createServerFn_handler,
  listRoomMods_createServerFn_handler,
  listSafetyEvents_createServerFn_handler,
  listSafetyKeywords_createServerFn_handler,
  listUrlRules_createServerFn_handler,
  listWordFilters_createServerFn_handler,
  muteUser_createServerFn_handler,
  removeRoomMod_createServerFn_handler,
  removeSafetyKeyword_createServerFn_handler,
  removeUrlRule_createServerFn_handler,
  removeWordFilter_createServerFn_handler,
  resolveReport_createServerFn_handler,
  resolveSafetyEvent_createServerFn_handler,
  submitReport_createServerFn_handler,
  toggleSafetyKeyword_createServerFn_handler,
  toggleWordFilter_createServerFn_handler,
  unbanUser_createServerFn_handler,
  unmuteUser_createServerFn_handler
};
