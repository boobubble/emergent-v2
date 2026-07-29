import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { r as recordType, s as stringType, u as unknownType, o as objectType, e as enumType, b as booleanType, n as numberType, a as arrayType } from "../_libs/zod.mjs";
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
const DEFAULTS = {
  enabled: true,
  unlock_mode: "level",
  min_account_age_days: 0,
  require_verified: false,
  feature_unlocks: {
    dm_privacy: 5,
    message_requests: 10,
    advanced_safety: 15
  },
  public_url_action: "replace",
  default_word_action: "replace",
  penalty_thresholds: [{
    points: 5,
    action: "warn",
    duration_minutes: 0
  }, {
    points: 10,
    action: "temp_mute",
    duration_minutes: 30
  }, {
    points: 20,
    action: "temp_mute",
    duration_minutes: 1440
  }, {
    points: 40,
    action: "temp_mute",
    duration_minutes: 10080
  }, {
    points: 100,
    action: "permanent_ban",
    duration_minutes: 0
  }],
  violation_points: {
    bad_word: 1,
    blocked_url_public: 2,
    blocked_url_dm: 1,
    spam: 3,
    mass_report: 5,
    ai_flag: 2
  }
};
async function admin() {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin;
}
async function assertMod(userId) {
  const sb = await admin();
  const {
    data
  } = await sb.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role);
  const ok = ["admin", "super_admin", "moderator", "feed_moderator"].some((r) => roles.includes(r));
  if (!ok) throw new Error("Forbidden");
}
const getTrustSafetySettings_createServerFn_handler = createServerRpc({
  id: "dcfe95d5642057086e7defe9c72f01c79874bfd7eac671fe271cb638aa9944e7",
  name: "getTrustSafetySettings",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => getTrustSafetySettings.__executeServer(opts));
const getTrustSafetySettings = createServerFn({
  method: "GET"
}).handler(getTrustSafetySettings_createServerFn_handler, async () => {
  const sb = await admin();
  const {
    data
  } = await sb.from("app_settings").select("value").eq("key", "trust_safety").maybeSingle();
  return {
    ...DEFAULTS,
    ...data?.value ?? {}
  };
});
const updateTrustSafetySettings_createServerFn_handler = createServerRpc({
  id: "ffd1d9233c0342d8409209770bb0e028c6996c1eb0b5db279e24fd7d6bafe9ff",
  name: "updateTrustSafetySettings",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => updateTrustSafetySettings.__executeServer(opts));
const updateTrustSafetySettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => recordType(stringType(), unknownType()).parse(raw)).handler(updateTrustSafetySettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  const {
    data: existing
  } = await sb.from("app_settings").select("value").eq("key", "trust_safety").maybeSingle();
  const next = {
    ...DEFAULTS,
    ...existing?.value ?? {},
    ...data
  };
  await sb.from("app_settings").upsert({
    key: "trust_safety",
    value: next
  });
  return next;
});
const isFeatureUnlocked_createServerFn_handler = createServerRpc({
  id: "46298a3a25c95614271c316d9e0a95c3dd68eb524b7dc8a9e37b88528a0a0f79",
  name: "isFeatureUnlocked",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => isFeatureUnlocked.__executeServer(opts));
const isFeatureUnlocked = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  feature: stringType()
}).parse(raw)).handler(isFeatureUnlocked_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = await admin();
  const {
    data: ok
  } = await sb.rpc("trust_feature_unlocked", {
    _user_id: context.userId,
    _feature: data.feature
  });
  return {
    unlocked: Boolean(ok)
  };
});
const PrivacyChoice = enumType(["everyone", "friends", "nobody"]);
const getDmPrivacy_createServerFn_handler = createServerRpc({
  id: "4c0f56ec7dcc5b4ee864bd2010313506436bdea331f687ba0df0ff4527abee53",
  name: "getDmPrivacy",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => getDmPrivacy.__executeServer(opts));
const getDmPrivacy = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(getDmPrivacy_createServerFn_handler, async ({
  context
}) => {
  const sb = await admin();
  const {
    data
  } = await sb.from("user_dm_privacy").select("*").eq("user_id", context.userId).maybeSingle();
  return data ?? {
    user_id: context.userId,
    who_can_dm: "everyone",
    allow_message_requests: true
  };
});
const setDmPrivacy_createServerFn_handler = createServerRpc({
  id: "25132afc39272be46847a4ce6a7194375f46653e27f207c3c199a86bf2e5cc0a",
  name: "setDmPrivacy",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => setDmPrivacy.__executeServer(opts));
const setDmPrivacy = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  who_can_dm: PrivacyChoice,
  allow_message_requests: booleanType().optional()
}).parse(raw)).handler(setDmPrivacy_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = await admin();
  if (data.who_can_dm !== "everyone") {
    const {
      data: unlocked
    } = await sb.rpc("trust_feature_unlocked", {
      _user_id: context.userId,
      _feature: "dm_privacy"
    });
    if (!unlocked) throw new Error("DM Privacy is not unlocked yet for your account level.");
  }
  await sb.from("user_dm_privacy").upsert({
    user_id: context.userId,
    who_can_dm: data.who_can_dm,
    allow_message_requests: data.allow_message_requests ?? true,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  return {
    ok: true
  };
});
const canSendDm_createServerFn_handler = createServerRpc({
  id: "ae8d5b32296eacdb3375f6d817cf7d2fb2c8fe376dec13b4c37571fa66072c81",
  name: "canSendDm",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => canSendDm.__executeServer(opts));
const canSendDm = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  receiver_id: stringType().uuid()
}).parse(raw)).handler(canSendDm_createServerFn_handler, async ({
  data,
  context
}) => {
  if (data.receiver_id === context.userId) return {
    ok: true,
    mode: "self"
  };
  const sb = await admin();
  const {
    data: p
  } = await sb.from("user_dm_privacy").select("who_can_dm, allow_message_requests").eq("user_id", data.receiver_id).maybeSingle();
  const privacy = p?.who_can_dm ?? "everyone";
  if (privacy === "nobody") return {
    ok: false,
    mode: "blocked",
    reason: "This user isn't accepting messages."
  };
  const {
    data: fr
  } = await sb.from("friendships").select("id,status").or(`and(sender_id.eq.${context.userId},receiver_id.eq.${data.receiver_id}),and(sender_id.eq.${data.receiver_id},receiver_id.eq.${context.userId})`).maybeSingle();
  const isFriend = fr?.status === "accepted";
  if (privacy === "friends" && !isFriend) {
    return {
      ok: false,
      mode: "friends_only",
      reason: "This user only accepts messages from friends."
    };
  }
  if (privacy === "everyone" && !isFriend && (p?.allow_message_requests ?? true)) {
    return {
      ok: true,
      mode: "message_request"
    };
  }
  return {
    ok: true,
    mode: "direct"
  };
});
const createMessageRequest_createServerFn_handler = createServerRpc({
  id: "6fc0b9c4cc404aac0bdfc750777a59db02ee5c26533b6d8a7055ddcec86da401",
  name: "createMessageRequest",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => createMessageRequest.__executeServer(opts));
const createMessageRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("dm.request")]).inputValidator((raw) => objectType({
  receiver_id: stringType().uuid(),
  preview: stringType().max(240).optional()
}).parse(raw)).handler(createMessageRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  if (data.receiver_id === context.userId) throw new Error("Cannot send to self");
  const sb = await admin();
  await sb.from("dm_message_requests").upsert({
    sender_id: context.userId,
    receiver_id: data.receiver_id,
    preview: data.preview ?? null,
    status: "pending"
  }, {
    onConflict: "sender_id,receiver_id"
  });
  return {
    ok: true
  };
});
const listMessageRequests_createServerFn_handler = createServerRpc({
  id: "cfd2382269f5a0c8188d9f826e3ead33576028dc037baa0b3c8b254adf1c1793",
  name: "listMessageRequests",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => listMessageRequests.__executeServer(opts));
const listMessageRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMessageRequests_createServerFn_handler, async ({
  context
}) => {
  const sb = await admin();
  const {
    data
  } = await sb.from("dm_message_requests").select("id, sender_id, receiver_id, preview, status, created_at").eq("receiver_id", context.userId).eq("status", "pending").order("created_at", {
    ascending: false
  }).limit(100);
  return data ?? [];
});
const respondMessageRequest_createServerFn_handler = createServerRpc({
  id: "eb61c5a988519683da5756945958912d2ab48fa4ff74f89b6e3e63b791fb9af0",
  name: "respondMessageRequest",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => respondMessageRequest.__executeServer(opts));
const respondMessageRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  id: stringType().uuid(),
  action: enumType(["accept", "decline", "block"])
}).parse(raw)).handler(respondMessageRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = await admin();
  const status = data.action === "accept" ? "accepted" : data.action === "decline" ? "declined" : "blocked";
  await sb.from("dm_message_requests").update({
    status,
    responded_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.id).eq("receiver_id", context.userId);
  return {
    ok: true
  };
});
async function loadFilters() {
  const sb = await admin();
  const [{
    data: words
  }, {
    data: urls
  }] = await Promise.all([sb.from("word_filters").select("pattern,match_mode,category,actions,violation_points").eq("active", true), sb.from("url_rules").select("domain,kind").eq("active", true)]);
  const allowedDomains = new Set((urls ?? []).filter((r) => r.kind === "whitelist").map((r) => r.domain.toLowerCase()));
  const blockedDomains = new Set((urls ?? []).filter((r) => r.kind === "block").map((r) => r.domain.toLowerCase()));
  return {
    words: words ?? [],
    allowedDomains,
    blockedDomains
  };
}
function domainAllowed(host, allowed, blocked) {
  const h = host.toLowerCase();
  for (const d of blocked) if (h === d || h.endsWith("." + d)) return false;
  if (allowed.size === 0) return true;
  for (const d of allowed) if (h === d || h.endsWith("." + d)) return true;
  return false;
}
const URL_RE = /https?:\/\/[^\s<>]+/gi;
function replaceAll(str, needle, replacement) {
  if (!needle) return str;
  return str.split(needle).join(replacement);
}
function stars(len) {
  return "*".repeat(Math.max(4, Math.min(len, 16)));
}
const filterPublicText_createServerFn_handler = createServerRpc({
  id: "f9444fedbacadb230b1c7b55a7d929a59e752dabcaaa54fc8cd79a85e5ab78f0",
  name: "filterPublicText",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => filterPublicText.__executeServer(opts));
const filterPublicText = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  text: stringType(),
  record_violation: booleanType().default(true)
}).parse(raw)).handler(filterPublicText_createServerFn_handler, async ({
  data,
  context
}) => {
  const settings = await getTrustSafetySettings();
  if (!settings.enabled) {
    return {
      ok: true,
      filtered: data.text,
      actions: [],
      matched_categories: [],
      violation_points: 0,
      reasons: []
    };
  }
  const {
    words,
    allowedDomains,
    blockedDomains
  } = await loadFilters();
  let out = data.text;
  const actions = /* @__PURE__ */ new Set();
  const categories = /* @__PURE__ */ new Set();
  const reasons = [];
  let points = 0;
  for (const w of words) {
    const pattern = String(w.pattern);
    let matched = false;
    if (w.match_mode === "regex") {
      try {
        const re = new RegExp(pattern, "gi");
        if (re.test(out)) {
          matched = true;
          out = out.replace(new RegExp(pattern, "gi"), (m) => stars(m.length));
        }
      } catch {
      }
    } else if (w.match_mode === "substring") {
      const idx = out.toLowerCase().indexOf(pattern.toLowerCase());
      if (idx >= 0) {
        matched = true;
        out = replaceAll(out, out.substring(idx, idx + pattern.length), stars(pattern.length));
      }
    } else {
      const re = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
      if (re.test(out)) {
        matched = true;
        out = out.replace(re, (m) => stars(m.length));
      }
    }
    if (matched) {
      const wordActions = w.actions ?? ["replace"];
      wordActions.forEach((a) => actions.add(a));
      categories.add(w.category ?? "general");
      reasons.push(`bad-word:${w.category ?? "general"}`);
      points += Number(w.violation_points ?? settings.violation_points.bad_word ?? 1);
    }
  }
  out = out.replace(URL_RE, (url) => {
    try {
      const host = new URL(url).hostname;
      if (!domainAllowed(host, allowedDomains, blockedDomains)) {
        reasons.push(`blocked-url:${host}`);
        categories.add("url");
        points += settings.violation_points.blocked_url_public ?? 2;
        if (settings.public_url_action === "reject") {
          actions.add("reject");
          return url;
        }
        actions.add("replace");
        return "****";
      }
      return url;
    } catch {
      return url;
    }
  });
  const rejected = actions.has("reject");
  if (data.record_violation && points > 0) {
    const sb = await admin();
    await sb.from("trust_violations").insert({
      user_id: context.userId,
      type: rejected ? "rejected_content" : "filtered_content",
      points,
      reason: reasons.slice(0, 5).join("; "),
      metadata: {
        actions: [...actions],
        categories: [...categories]
      }
    });
  }
  return {
    ok: !rejected,
    filtered: out,
    actions: [...actions],
    matched_categories: [...categories],
    violation_points: points,
    reasons
  };
});
const getUrlAllowList_createServerFn_handler = createServerRpc({
  id: "37741fb0e302bba0c06f00f3358485eed1fe90609ba07ee894a2194f03384c43",
  name: "getUrlAllowList",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => getUrlAllowList.__executeServer(opts));
const getUrlAllowList = createServerFn({
  method: "GET"
}).handler(getUrlAllowList_createServerFn_handler, async () => {
  const sb = await admin();
  const {
    data
  } = await sb.from("url_rules").select("domain,kind").eq("active", true);
  return {
    allowed: (data ?? []).filter((r) => r.kind === "whitelist").map((r) => r.domain.toLowerCase()),
    blocked: (data ?? []).filter((r) => r.kind === "block").map((r) => r.domain.toLowerCase())
  };
});
const listTrustViolations_createServerFn_handler = createServerRpc({
  id: "23fe41484f3e726a80aa10cc5204248d4194d760b8d8bb5941fd8195cd457c20",
  name: "listTrustViolations",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => listTrustViolations.__executeServer(opts));
const listTrustViolations = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid().optional(),
  limit: numberType().int().min(1).max(500).default(200)
}).parse(raw)).handler(listTrustViolations_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = await admin();
  if (data.user_id && data.user_id !== context.userId) await assertMod(context.userId);
  let q = sb.from("trust_violations").select("id, user_id, type, points, reason, ref_type, ref_id, created_at").order("created_at", {
    ascending: false
  }).limit(data.limit);
  if (data.user_id) q = q.eq("user_id", data.user_id);
  const {
    data: rows
  } = await q;
  return rows ?? [];
});
const getTrustScore_createServerFn_handler = createServerRpc({
  id: "954097dd4dfa17d1a22fd4acd31bef8fb5ed57dc8db051085088cb9b9923a307",
  name: "getTrustScore",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => getTrustScore.__executeServer(opts));
const getTrustScore = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid().optional()
}).parse(raw)).handler(getTrustScore_createServerFn_handler, async ({
  data,
  context
}) => {
  const sb = await admin();
  const uid = data.user_id ?? context.userId;
  if (uid !== context.userId) await assertMod(context.userId);
  const {
    data: row
  } = await sb.from("user_trust_scores").select("*").eq("user_id", uid).maybeSingle();
  return row ?? {
    user_id: uid,
    points: 0,
    lifetime_points: 0
  };
});
const addTrustViolation_createServerFn_handler = createServerRpc({
  id: "00aeffd9dcff5c4fcfdcb8940fe361c1b54780fce04014b8ddf8aad9052a708f",
  name: "addTrustViolation",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => addTrustViolation.__executeServer(opts));
const addTrustViolation = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  user_id: stringType().uuid(),
  type: stringType().min(1).max(60),
  points: numberType().int().min(0).max(1e3),
  reason: stringType().max(500).optional(),
  ref_type: stringType().max(60).optional(),
  ref_id: stringType().max(120).optional()
}).parse(raw)).handler(addTrustViolation_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  await sb.from("trust_violations").insert({
    user_id: data.user_id,
    type: data.type,
    points: data.points,
    reason: data.reason ?? null,
    ref_type: data.ref_type ?? null,
    ref_id: data.ref_id ?? null,
    created_by: context.userId
  });
  return {
    ok: true
  };
});
const listWordFiltersExtended_createServerFn_handler = createServerRpc({
  id: "a22fabf6ab541401a325bd637c1164fbbbbf1b4265187b4d14f9def1f7a7fd68",
  name: "listWordFiltersExtended",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => listWordFiltersExtended.__executeServer(opts));
const listWordFiltersExtended = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listWordFiltersExtended_createServerFn_handler, async ({
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  const {
    data
  } = await sb.from("word_filters").select("id,pattern,match_mode,category,actions,violation_points,severity,active,created_at").order("created_at", {
    ascending: false
  }).limit(500);
  return data ?? [];
});
const upsertWordFilter_createServerFn_handler = createServerRpc({
  id: "7b423bd80c0b742fc56925676066fd259862fa97e63a0c83b2f77405680cf18e",
  name: "upsertWordFilter",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => upsertWordFilter.__executeServer(opts));
const upsertWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  id: stringType().uuid().optional(),
  pattern: stringType().min(1).max(200),
  match_mode: enumType(["word", "substring", "regex"]).default("word"),
  category: stringType().min(1).max(40).default("general"),
  actions: arrayType(stringType()).default(["replace"]),
  violation_points: numberType().int().min(0).max(100).default(1),
  active: booleanType().default(true)
}).parse(raw)).handler(upsertWordFilter_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  const payload = {
    pattern: data.pattern,
    match_mode: data.match_mode,
    category: data.category,
    actions: data.actions,
    violation_points: data.violation_points,
    active: data.active,
    created_by: context.userId
  };
  if (data.id) {
    await sb.from("word_filters").update(payload).eq("id", data.id);
  } else {
    await sb.from("word_filters").insert(payload);
  }
  return {
    ok: true
  };
});
const deleteWordFilter_createServerFn_handler = createServerRpc({
  id: "1e3f3126c8e7604497c697466680165846d4ecfd7babeebd103c7d61b24c3873",
  name: "deleteWordFilter",
  filename: "src/lib/trust-safety.functions.ts"
}, (opts) => deleteWordFilter.__executeServer(opts));
const deleteWordFilter = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((raw) => objectType({
  id: stringType().uuid()
}).parse(raw)).handler(deleteWordFilter_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertMod(context.userId);
  const sb = await admin();
  await sb.from("word_filters").delete().eq("id", data.id);
  return {
    ok: true
  };
});
export {
  addTrustViolation_createServerFn_handler,
  canSendDm_createServerFn_handler,
  createMessageRequest_createServerFn_handler,
  deleteWordFilter_createServerFn_handler,
  filterPublicText_createServerFn_handler,
  getDmPrivacy_createServerFn_handler,
  getTrustSafetySettings_createServerFn_handler,
  getTrustScore_createServerFn_handler,
  getUrlAllowList_createServerFn_handler,
  isFeatureUnlocked_createServerFn_handler,
  listMessageRequests_createServerFn_handler,
  listTrustViolations_createServerFn_handler,
  listWordFiltersExtended_createServerFn_handler,
  respondMessageRequest_createServerFn_handler,
  setDmPrivacy_createServerFn_handler,
  updateTrustSafetySettings_createServerFn_handler,
  upsertWordFilter_createServerFn_handler
};
