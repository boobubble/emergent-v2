import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { r as randomConfessorNumber, p as pickRandomAvatar, e as expiryToTimestamp, C as CONFESSIONS_DEFAULTS } from "./confessions-config-OPhfPAXP.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, n as numberType, e as enumType, s as stringType, a as arrayType, b as booleanType } from "../_libs/zod.mjs";
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
async function getConfig() {
  const {
    data
  } = await (await getSupabaseAdmin()).from("app_settings").select("value").eq("key", "confessions").maybeSingle();
  return {
    ...CONFESSIONS_DEFAULTS,
    ...data?.value ?? {}
  };
}
async function isAdmin(userId) {
  const {
    data
  } = await (await getSupabaseAdmin()).from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin"]);
  return Boolean(data && data.length > 0);
}
function maskAuthor(row, viewerIsAuthor, viewerIsAdmin) {
  if (row.display_mode === "username") return row;
  return {
    ...row,
    author_id: null
  };
}
const listConfessions_createServerFn_handler = createServerRpc({
  id: "9b16f2967a9e3636ee616b832ebf4b9e405e909762b48024978188d471f5890d",
  name: "listConfessions",
  filename: "src/lib/confessions.functions.ts"
}, (opts) => listConfessions.__executeServer(opts));
const listConfessions = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  category: stringType().optional(),
  sort: enumType(["recent", "trending", "most_liked", "most_replied"]).default("recent"),
  limit: numberType().min(1).max(100).default(30)
}).parse(d ?? {})).handler(listConfessions_createServerFn_handler, async ({
  data
}) => {
  const sb = await getSupabaseAdmin();
  let q = sb.from("confessions").select("*").or("expires_at.is.null,expires_at.gt." + (/* @__PURE__ */ new Date()).toISOString()).eq("status", "approved").limit(data.limit);
  if (data.category && data.category !== "all") q = q.eq("category", data.category);
  if (data.sort === "trending") {
    q = q.order("is_pinned", {
      ascending: false
    }).order("like_count", {
      ascending: false
    }).order("created_at", {
      ascending: false
    });
  } else if (data.sort === "most_liked") {
    q = q.order("like_count", {
      ascending: false
    });
  } else if (data.sort === "most_replied") {
    q = q.order("reply_count", {
      ascending: false
    });
  } else {
    q = q.order("is_pinned", {
      ascending: false
    }).order("created_at", {
      ascending: false
    });
  }
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return (rows ?? []).map((r) => ({
    ...maskAuthor(r),
    myReactions: []
  }));
});
const createConfession_createServerFn_handler = createServerRpc({
  id: "25ae481471fab660009f9bfa357669ffb3c4a02fee558a1133b23998161aa625",
  name: "createConfession",
  filename: "src/lib/confessions.functions.ts"
}, (opts) => createConfession.__executeServer(opts));
const createConfession = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feed.write")]).inputValidator((d) => objectType({
  kind: enumType(["text", "poll", "image", "question", "advice"]).default("text"),
  category: stringType().min(1).max(64),
  text: stringType().max(4e3).default(""),
  image_url: stringType().url().optional(),
  poll: objectType({
    question: stringType().min(1).max(280),
    options: arrayType(stringType().min(1).max(120)).min(2).max(6)
  }).optional(),
  display_mode: enumType(["fully_anonymous", "random_id", "random_avatar", "username"]),
  expiry: enumType(["never", "24h", "7d", "30d"]).optional()
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createConfession_createServerFn_handler, async ({
  data,
  context
}) => {
  const cfg = await getConfig();
  if (!cfg.enabled) throw new Error("Confessions module is disabled.");
  if (!cfg.kinds[data.kind]) throw new Error(`Kind "${data.kind}" is disabled.`);
  if (!cfg.anonymousModes[data.display_mode]) throw new Error("That identity mode is disabled.");
  if (cfg.level.enabled) {
    const {
      data: prof
    } = await (await getSupabaseAdmin()).from("profiles").select("level").eq("id", context.userId).maybeSingle();
    const lvl = prof?.level ?? 1;
    if (lvl < cfg.level.minLevelToPost) throw new Error(`Reach level ${cfg.level.minLevelToPost} to post a confession.`);
    if (data.kind === "image" && lvl < cfg.level.minLevelForImages) {
      throw new Error(`Reach level ${cfg.level.minLevelForImages} to post images.`);
    }
  }
  let alias = null;
  let avatar_emoji = null;
  if (data.display_mode === "fully_anonymous") {
    alias = "Anonymous";
  } else if (data.display_mode === "random_id") {
    alias = `Confessor #${randomConfessorNumber(context.userId + Date.now())}`;
  } else if (data.display_mode === "random_avatar") {
    const seed = context.userId + Date.now();
    avatar_emoji = pickRandomAvatar(seed);
    alias = `${avatar_emoji} ${pickAnimalName(avatar_emoji)} #${randomConfessorNumber(seed) % 99}`;
  } else {
    const {
      data: prof
    } = await (await getSupabaseAdmin()).from("profiles").select("username").eq("id", context.userId).maybeSingle();
    alias = prof?.username ?? "user";
  }
  const expiry = data.expiry ?? cfg.expiry.defaultMode;
  const status = cfg.moderation.approvalRequired ? "pending" : "approved";
  const {
    data: row,
    error
  } = await (await getSupabaseAdmin()).from("confessions").insert({
    author_id: context.userId,
    display_mode: data.display_mode,
    alias,
    avatar_emoji,
    category: data.category,
    kind: data.kind,
    text: data.text,
    image_url: data.image_url ?? null,
    poll: data.poll ?? null,
    status,
    expires_at: expiryToTimestamp(expiry)
  }).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
function pickAnimalName(emoji) {
  const map = {
    "🐼": "Panda",
    "🦊": "Fox",
    "🐯": "Tiger",
    "🦁": "Lion",
    "🐸": "Frog",
    "🐵": "Monkey",
    "🐨": "Koala",
    "🐰": "Rabbit",
    "🐻": "Bear",
    "🦝": "Raccoon",
    "🦄": "Unicorn",
    "🐲": "Dragon",
    "🐧": "Penguin",
    "🦉": "Owl",
    "🐙": "Octopus",
    "🦋": "Butterfly"
  };
  return map[emoji] ?? "Friend";
}
const toggleReaction_createServerFn_handler = createServerRpc({
  id: "c62be101f2c501c1850f4c6e574d06746d9220330c4324d9a4a18a0419bc82f8",
  name: "toggleReaction",
  filename: "src/lib/confessions.functions.ts"
}, (opts) => toggleReaction.__executeServer(opts));
const toggleReaction = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feed.write")]).inputValidator((d) => objectType({
  confessionId: stringType().uuid(),
  type: enumType(["like", "funny", "shock", "sad", "hot", "love"])
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(toggleReaction_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: existing
  } = await (await getSupabaseAdmin()).from("confession_reactions").select("id").eq("confession_id", data.confessionId).eq("user_id", context.userId).eq("type", data.type).maybeSingle();
  if (existing) {
    await (await getSupabaseAdmin()).from("confession_reactions").delete().eq("id", existing.id);
    return {
      active: false
    };
  }
  const {
    error
  } = await (await getSupabaseAdmin()).from("confession_reactions").insert({
    confession_id: data.confessionId,
    user_id: context.userId,
    type: data.type
  });
  if (error) throw new Error(error.message);
  return {
    active: true
  };
});
const listReplies_createServerFn_handler = createServerRpc({
  id: "a099a31c885e8a9c3223f7bf578ce1e58ab5a0c4e1e8dc2d9358ab9d23577733",
  name: "listReplies",
  filename: "src/lib/confessions.functions.ts"
}, (opts) => listReplies.__executeServer(opts));
const listReplies = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  confessionId: stringType().uuid()
}).parse(d)).handler(listReplies_createServerFn_handler, async ({
  data
}) => {
  const {
    data: rows,
    error
  } = await (await getSupabaseAdmin()).from("confession_replies").select("*").eq("confession_id", data.confessionId).order("created_at", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return (rows ?? []).map((r) => {
    const reveal = !r.is_anonymous;
    return reveal ? r : {
      ...r,
      author_id: null
    };
  });
});
const createReply_createServerFn_handler = createServerRpc({
  id: "582679095d46a977919eb7df9e730af4bdad17e1b8a081492d55da36deaab83d",
  name: "createReply",
  filename: "src/lib/confessions.functions.ts"
}, (opts) => createReply.__executeServer(opts));
const createReply = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feed.write")]).inputValidator((d) => objectType({
  confessionId: stringType().uuid(),
  text: stringType().min(1).max(1500),
  anonymous: booleanType().default(true)
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(createReply_createServerFn_handler, async ({
  data,
  context
}) => {
  const cfg = await getConfig();
  if (!cfg.enabled || !cfg.allowReplies) throw new Error("Replies are disabled.");
  if (data.anonymous && !cfg.allowAnonymousReplies) throw new Error("Anonymous replies are disabled.");
  let alias = null;
  let avatar_emoji = null;
  if (data.anonymous) {
    const seed = context.userId + ":" + data.confessionId;
    avatar_emoji = pickRandomAvatar(seed);
    alias = `${avatar_emoji} ${pickAnimalName(avatar_emoji)} #${randomConfessorNumber(seed) % 99}`;
  } else {
    const {
      data: prof
    } = await (await getSupabaseAdmin()).from("profiles").select("username").eq("id", context.userId).maybeSingle();
    alias = prof?.username ?? "user";
  }
  const {
    data: row,
    error
  } = await (await getSupabaseAdmin()).from("confession_replies").insert({
    confession_id: data.confessionId,
    author_id: context.userId,
    alias,
    avatar_emoji,
    is_anonymous: data.anonymous,
    text: data.text
  }).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const moderateConfession_createServerFn_handler = createServerRpc({
  id: "a6c138be74badb14b5ed205af433e1608065ae9dbdf0ad3a081d755135ddc241",
  name: "moderateConfession",
  filename: "src/lib/confessions.functions.ts"
}, (opts) => moderateConfession.__executeServer(opts));
const moderateConfession = createServerFn({
  method: "POST"
}).middleware([withRateLimit("feed.write")]).inputValidator((d) => objectType({
  id: stringType().uuid(),
  action: enumType(["approve", "reject", "pin", "unpin", "feature", "unfeature", "remove"])
}).parse(d)).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(moderateConfession_createServerFn_handler, async ({
  data,
  context
}) => {
  if (!await isAdmin(context.userId)) throw new Error("Forbidden");
  if (data.action === "remove") {
    const {
      error: error2
    } = await (await getSupabaseAdmin()).from("confessions").delete().eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true
    };
  }
  const patch = {};
  if (data.action === "approve") patch.status = "approved";
  if (data.action === "reject") patch.status = "rejected";
  if (data.action === "pin") patch.is_pinned = true;
  if (data.action === "unpin") patch.is_pinned = false;
  if (data.action === "feature") patch.is_featured = true;
  if (data.action === "unfeature") patch.is_featured = false;
  const {
    error
  } = await (await getSupabaseAdmin()).from("confessions").update(patch).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getConfessionStats_createServerFn_handler = createServerRpc({
  id: "51ba2c0a821cb44faf96458e84f29e156b21e2fb3e6a30aa91ff45caf9297400",
  name: "getConfessionStats",
  filename: "src/lib/confessions.functions.ts"
}, (opts) => getConfessionStats.__executeServer(opts));
const getConfessionStats = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("feed.write")]).handler(getConfessionStats_createServerFn_handler, async ({
  context
}) => {
  if (!await isAdmin(context.userId)) throw new Error("Forbidden");
  const since24h = new Date(Date.now() - 864e5).toISOString();
  const [{
    count: total
  }, {
    count: today
  }, {
    data: byCat
  }, {
    data: top
  }] = await Promise.all([(await getSupabaseAdmin()).from("confessions").select("*", {
    count: "exact",
    head: true
  }), (await getSupabaseAdmin()).from("confessions").select("*", {
    count: "exact",
    head: true
  }).gte("created_at", since24h), (await getSupabaseAdmin()).from("confessions").select("category"), (await getSupabaseAdmin()).from("confessions").select("id, text, like_count, reply_count, category, created_at").order("like_count", {
    ascending: false
  }).limit(5)]);
  const catCounts = {};
  for (const r of byCat ?? []) catCounts[r.category] = (catCounts[r.category] ?? 0) + 1;
  return {
    total: total ?? 0,
    today: today ?? 0,
    byCategory: Object.entries(catCounts).map(([category, count]) => ({
      category,
      count
    })).sort((a, b) => b.count - a.count),
    topConfessions: top ?? []
  };
});
export {
  createConfession_createServerFn_handler,
  createReply_createServerFn_handler,
  getConfessionStats_createServerFn_handler,
  listConfessions_createServerFn_handler,
  listReplies_createServerFn_handler,
  moderateConfession_createServerFn_handler,
  toggleReaction_createServerFn_handler
};
