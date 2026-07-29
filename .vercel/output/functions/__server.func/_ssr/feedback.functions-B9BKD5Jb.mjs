import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { F as FEEDBACK_DEFAULTS } from "./feedback-config-DIeqYcnl.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, n as numberType, s as stringType, e as enumType, b as booleanType, r as recordType, u as unknownType, a as arrayType } from "../_libs/zod.mjs";
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
import "../_libs/lucide-react.mjs";
async function getSupabaseAdmin() {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  return supabaseAdmin2;
}
async function getConfig() {
  const {
    data
  } = await supabaseAdmin.from("app_settings").select("value").eq("key", "feedback").maybeSingle();
  return {
    ...FEEDBACK_DEFAULTS,
    ...data?.value ?? {}
  };
}
async function isAdmin(userId) {
  const {
    data
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin"]);
  return Boolean(data && data.length > 0);
}
async function rewardUser(userId, xp, coins, reason, refId) {
  if (xp === 0 && coins === 0) return;
  const {
    data: prof
  } = await supabaseAdmin.from("profiles").select("xp, coins").eq("id", userId).maybeSingle();
  if (!prof) return;
  const newXp = Math.max(0, (prof.xp ?? 0) + xp);
  const newCoins = Math.max(0, (prof.coins ?? 0) + coins);
  const newLevel = Math.max(1, Math.floor(newXp / 50) + 1);
  await (await getSupabaseAdmin()).from("profiles").update({
    xp: newXp,
    coins: newCoins,
    level: newLevel
  }).eq("id", userId);
  if (coins !== 0) {
    await (await getSupabaseAdmin()).from("coin_transactions").insert({
      user_id: userId,
      kind: "coins",
      amount: coins,
      reason,
      ref_type: "feedback",
      ref_id: refId
    });
  }
  if (xp !== 0) {
    await (await getSupabaseAdmin()).from("coin_transactions").insert({
      user_id: userId,
      kind: "xp_award",
      amount: xp,
      reason,
      ref_type: "feedback",
      ref_id: refId
    });
  }
}
const listFeedback_createServerFn_handler = createServerRpc({
  id: "ac346e3fdc98c2ed525afe5716d25f739ade78bc45d84cd9812d5b48e95752a1",
  name: "listFeedback",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => listFeedback.__executeServer(opts));
const listFeedback = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  category: stringType().optional(),
  status: stringType().optional(),
  sort: enumType(["trending", "recent", "top", "oldest"]).default("trending"),
  search: stringType().max(120).optional(),
  limit: numberType().min(1).max(100).default(50)
}).parse(d ?? {})).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(listFeedback_createServerFn_handler, async ({
  data,
  context
}) => {
  const supabaseAdmin2 = await getSupabaseAdmin();
  let q = supabaseAdmin2.from("feedback_reports").select("*").limit(data.limit);
  if (data.category && data.category !== "all") q = q.eq("category", data.category);
  if (data.status && data.status !== "all") q = q.eq("status", data.status);
  if (data.search) q = q.ilike("title", `%${data.search}%`);
  if (data.sort === "top") q = q.order("upvote_count", {
    ascending: false
  });
  else if (data.sort === "oldest") q = q.order("created_at", {
    ascending: true
  });
  else if (data.sort === "recent") q = q.order("is_pinned", {
    ascending: false
  }).order("created_at", {
    ascending: false
  });
  else q = q.order("is_pinned", {
    ascending: false
  }).order("upvote_count", {
    ascending: false
  }).order("created_at", {
    ascending: false
  });
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const ids = (rows ?? []).map((r) => r.id);
  let myVotes = {};
  if (ids.length) {
    const {
      data: vx
    } = await supabaseAdmin2.from("feedback_votes").select("report_id").eq("user_id", context.userId).in("report_id", ids);
    for (const v of vx ?? []) myVotes[v.report_id] = true;
  }
  return (rows ?? []).map((r) => ({
    ...r,
    hasVoted: !!myVotes[r.id]
  }));
});
const getFeedback_createServerFn_handler = createServerRpc({
  id: "dfda0607f9d90384071147bc1c5a452e3c58aeb07cc455aa9bcbcdb7f29c68a4",
  name: "getFeedback",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => getFeedback.__executeServer(opts));
const getFeedback = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(getFeedback_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: row,
    error
  } = await supabaseAdmin.from("feedback_reports").select("*").eq("id", data.id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error("Report not found");
  const [{
    data: comments
  }, {
    data: vote
  }] = await Promise.all([(await getSupabaseAdmin()).from("feedback_comments").select("*").eq("report_id", data.id).order("created_at", {
    ascending: true
  }), (await getSupabaseAdmin()).from("feedback_votes").select("id").eq("report_id", data.id).eq("user_id", context.userId).maybeSingle()]);
  return {
    report: row,
    comments: comments ?? [],
    hasVoted: !!vote
  };
});
const createFeedback_createServerFn_handler = createServerRpc({
  id: "45898f8e6ba49b19d863918f48bd28ce8d8ce599287fffe0a8164cdf7fc18d2e",
  name: "createFeedback",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => createFeedback.__executeServer(opts));
const createFeedback = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  title: stringType().trim().min(4).max(140),
  description: stringType().trim().max(8e3).default(""),
  category: enumType(["bug", "feature", "improvement", "ui", "performance", "security", "other"]),
  priority: enumType(["low", "normal", "high", "critical"]).default("normal"),
  screenshots: arrayType(stringType().url()).max(6).default([]),
  url: stringType().max(500).optional(),
  device_info: recordType(stringType(), unknownType()).optional(),
  is_anonymous: booleanType().default(false)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(createFeedback_createServerFn_handler, async ({
  data,
  context
}) => {
  const cfg = await getConfig();
  if (!cfg.enabled) throw new Error("Feedback module is disabled.");
  const anon = data.is_anonymous && cfg.allowAnonymous;
  const {
    data: row,
    error
  } = await supabaseAdmin.from("feedback_reports").insert({
    author_id: context.userId,
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority,
    screenshots: data.screenshots,
    url: data.url ?? null,
    device_info: data.device_info ?? null,
    is_anonymous: anon
  }).select("*").single();
  if (error) throw new Error(error.message);
  await rewardUser(context.userId, cfg.rewardOnSubmit.xp, cfg.rewardOnSubmit.coins, "feedback_submit", row.id);
  return row;
});
const findSimilarFeedback_createServerFn_handler = createServerRpc({
  id: "34d1b688fa8558aa6a1a18978aa62b6072ba2ce338ff299c7aabc6f0e5a7789c",
  name: "findSimilarFeedback",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => findSimilarFeedback.__executeServer(opts));
const findSimilarFeedback = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  title: stringType().trim().min(3).max(140)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(findSimilarFeedback_createServerFn_handler, async ({
  data
}) => {
  const words = data.title.toLowerCase().split(/\s+/).filter((w) => w.length >= 4).slice(0, 4);
  if (words.length === 0) return [];
  const pattern = `%${words.join("%")}%`;
  const {
    data: rows
  } = await supabaseAdmin.from("feedback_reports").select("id, title, status, upvote_count, category").ilike("title", pattern).order("upvote_count", {
    ascending: false
  }).limit(5);
  return rows ?? [];
});
const toggleVote_createServerFn_handler = createServerRpc({
  id: "6ff54c7caa85e6f146f3f94553c0c6b3f8f640b95221e45699725cd46c4be892",
  name: "toggleVote",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => toggleVote.__executeServer(opts));
const toggleVote = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  reportId: stringType().uuid()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(toggleVote_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: existing
  } = await supabaseAdmin.from("feedback_votes").select("id").eq("report_id", data.reportId).eq("user_id", context.userId).maybeSingle();
  if (existing) {
    await (await getSupabaseAdmin()).from("feedback_votes").delete().eq("id", existing.id);
    return {
      active: false
    };
  }
  const {
    error
  } = await supabaseAdmin.from("feedback_votes").insert({
    report_id: data.reportId,
    user_id: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    active: true
  };
});
const postComment_createServerFn_handler = createServerRpc({
  id: "44c32a8b1943537839baa2869ca2c864987fdefc21b2936bc1050497c0a27492",
  name: "postComment",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => postComment.__executeServer(opts));
const postComment = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  reportId: stringType().uuid(),
  text: stringType().trim().min(1).max(2e3)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(postComment_createServerFn_handler, async ({
  data,
  context
}) => {
  const cfg = await getConfig();
  if (!cfg.allowComments) throw new Error("Comments are disabled.");
  const admin = await isAdmin(context.userId);
  const {
    data: row,
    error
  } = await supabaseAdmin.from("feedback_comments").insert({
    report_id: data.reportId,
    author_id: context.userId,
    text: data.text,
    is_admin_response: admin
  }).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const adminUpdateFeedback_createServerFn_handler = createServerRpc({
  id: "d228d473d746d58980344d2c06733095057ceb8d313c3ac6debf60b3d60b6e08",
  name: "adminUpdateFeedback",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => adminUpdateFeedback.__executeServer(opts));
const adminUpdateFeedback = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  status: enumType(["open", "investigating", "planned", "in_progress", "fixed", "closed", "rejected"]).optional(),
  priority: enumType(["low", "normal", "high", "critical"]).optional(),
  is_pinned: booleanType().optional(),
  is_showcased: booleanType().optional(),
  admin_note: stringType().max(2e3).optional(),
  duplicate_of: stringType().uuid().nullable().optional(),
  reward: objectType({
    xp: numberType().int().min(0).max(1e3),
    coins: numberType().int().min(0).max(1e3)
  }).optional()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(adminUpdateFeedback_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!await isAdmin(context.userId)) throw new Error("Forbidden");
  const cfg = await getConfig();
  const {
    data: before
  } = await supabaseAdmin.from("feedback_reports").select("*").eq("id", data.id).maybeSingle();
  if (!before) throw new Error("Not found");
  const patch = {};
  if (data.status) patch.status = data.status;
  if (data.priority) patch.priority = data.priority;
  if (typeof data.is_pinned === "boolean") patch.is_pinned = data.is_pinned;
  if (typeof data.is_showcased === "boolean") patch.is_showcased = data.is_showcased;
  if (typeof data.admin_note === "string") patch.admin_note = data.admin_note;
  if (data.duplicate_of !== void 0) patch.duplicate_of = data.duplicate_of;
  if (data.status === "fixed" || data.status === "closed" || data.status === "rejected") {
    patch.resolved_at = (/* @__PURE__ */ new Date()).toISOString();
    patch.resolved_by = context.userId;
  }
  const {
    error
  } = await (await getSupabaseAdmin()).from("feedback_reports").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  if (data.status === "fixed" && before.status !== "fixed" && before.author_id) {
    await rewardUser(before.author_id, cfg.rewardOnFixed.xp, cfg.rewardOnFixed.coins, "feedback_fixed", data.id);
  }
  if (data.reward && before.author_id) {
    await rewardUser(before.author_id, data.reward.xp, data.reward.coins, "feedback_admin_reward", data.id);
  }
  if (cfg.notifyOnStatusChange && data.status && data.status !== before.status && before.author_id) {
    await (await getSupabaseAdmin()).from("notifications").insert({
      user_id: before.author_id,
      actor_id: context.userId,
      kind: "feedback_status",
      target_type: "feedback",
      target_id: data.id,
      payload: {
        title: before.title,
        status: data.status
      }
    });
  }
  await (await getSupabaseAdmin()).from("mod_logs").insert({
    actor_id: context.userId,
    action: "edit",
    target_type: "feedback",
    target_id: data.id,
    payload: patch
  });
  return {
    ok: true
  };
});
const adminDeleteFeedback_createServerFn_handler = createServerRpc({
  id: "6a350e82bd67cfa9dd726282bcbfeddfd043f26d0d6a6ea3d0a2918e864e0afc",
  name: "adminDeleteFeedback",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => adminDeleteFeedback.__executeServer(opts));
const adminDeleteFeedback = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feedback.write")]).inputValidator((d) => objectType({
  id: stringType().uuid()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(adminDeleteFeedback_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!await isAdmin(context.userId)) throw new Error("Forbidden");
  const {
    error
  } = await (await getSupabaseAdmin()).from("feedback_reports").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getFeedbackStats_createServerFn_handler = createServerRpc({
  id: "2874299ef75a8bfb64c9ace9c18227532be73c9b0ce16562a54feefe559b4265",
  name: "getFeedbackStats",
  filename: "src/lib/feedback.functions.ts"
}, (opts) => getFeedbackStats.__executeServer(opts));
const getFeedbackStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feedback.write")]).handler(getFeedbackStats_createServerFn_handler, async ({
  context
}) => {
  if (!await isAdmin(context.userId)) throw new Error("Forbidden");
  const since7d = new Date(Date.now() - 7 * 864e5).toISOString();
  const [{
    count: total
  }, {
    count: openCount
  }, {
    count: weekCount
  }, {
    data: byCat
  }, {
    data: byStatus
  }, {
    data: topFeatures
  }, {
    data: topBugs
  }, {
    data: topContrib
  }] = await Promise.all([(await getSupabaseAdmin()).from("feedback_reports").select("*", {
    count: "exact",
    head: true
  }), (await getSupabaseAdmin()).from("feedback_reports").select("*", {
    count: "exact",
    head: true
  }).eq("status", "open"), (await getSupabaseAdmin()).from("feedback_reports").select("*", {
    count: "exact",
    head: true
  }).gte("created_at", since7d), (await getSupabaseAdmin()).from("feedback_reports").select("category"), (await getSupabaseAdmin()).from("feedback_reports").select("status"), (await getSupabaseAdmin()).from("feedback_reports").select("id, title, upvote_count, status").eq("category", "feature").order("upvote_count", {
    ascending: false
  }).limit(5), (await getSupabaseAdmin()).from("feedback_reports").select("id, title, upvote_count, status").eq("category", "bug").order("upvote_count", {
    ascending: false
  }).limit(5), (await getSupabaseAdmin()).from("feedback_reports").select("author_id")]);
  const catCounts = {};
  for (const r of byCat ?? []) catCounts[r.category] = (catCounts[r.category] ?? 0) + 1;
  const statusCounts = {};
  for (const r of byStatus ?? []) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;
  const contribCounts = {};
  for (const r of topContrib ?? []) {
    if (!r.author_id) continue;
    contribCounts[r.author_id] = (contribCounts[r.author_id] ?? 0) + 1;
  }
  const topContribIds = Object.entries(contribCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  let contributors = [];
  if (topContribIds.length) {
    const {
      data: profs
    } = await (await getSupabaseAdmin()).from("profiles").select("id, username").in("id", topContribIds.map(([id]) => id));
    const map = new Map((profs ?? []).map((p) => [p.id, p.username]));
    contributors = topContribIds.map(([id, count]) => ({
      user_id: id,
      username: map.get(id) ?? null,
      count
    }));
  }
  return {
    total: total ?? 0,
    open: openCount ?? 0,
    thisWeek: weekCount ?? 0,
    byCategory: Object.entries(catCounts).map(([category, count]) => ({
      category,
      count
    })),
    byStatus: Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    })),
    topFeatures: topFeatures ?? [],
    topBugs: topBugs ?? [],
    topContributors: contributors
  };
});
export {
  adminDeleteFeedback_createServerFn_handler,
  adminUpdateFeedback_createServerFn_handler,
  createFeedback_createServerFn_handler,
  findSimilarFeedback_createServerFn_handler,
  getFeedbackStats_createServerFn_handler,
  getFeedback_createServerFn_handler,
  listFeedback_createServerFn_handler,
  postComment_createServerFn_handler,
  toggleVote_createServerFn_handler
};
