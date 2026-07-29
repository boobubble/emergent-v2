import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, f as anyType, s as stringType, n as numberType, e as enumType, b as booleanType, a as arrayType } from "../_libs/zod.mjs";
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
async function assertAdmin(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
  return data.map((r) => r.role);
}
async function assertSuperAdmin(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: super_admin only");
}
const getMyRoles_createServerFn_handler = createServerRpc({
  id: "bc043367e3258bc0750efadc2962d5983ded7a90f892e25e8da034f07aee469d",
  name: "getMyRoles",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getMyRoles.__executeServer(opts));
const getMyRoles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getMyRoles_createServerFn_handler, async ({
  context
}) => {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r) => r.role);
  return {
    roles,
    isAdmin: roles.includes("super_admin") || roles.includes("admin"),
    isSuperAdmin: roles.includes("super_admin")
  };
});
const SENSITIVE_SETTING_KEYS = /* @__PURE__ */ new Set(["bots", "automation", "fake_activity", "moderation", "security", "word_filters", "ai_chatbots", "admin_modules", "staff_permissions", "admin_roles", "filters", "boobubble_openai_key", "boobubble_gemini_key", "ai_chat", "feedbot_hook_secret"]);
const getAllSettings_createServerFn_handler = createServerRpc({
  id: "3463a50820e1daf250c1455e3ccee8e6666c4b8e5c09281e767ced7b5152e29a",
  name: "getAllSettings",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAllSettings.__executeServer(opts));
const getAllSettings = createServerFn({
  method: "GET"
}).handler(getAllSettings_createServerFn_handler, async () => {
  const {
    data,
    error
  } = await (await getSupabaseAdmin()).from("app_settings").select("*");
  if (error) throw new Error(error.message);
  const map = {};
  for (const row of data ?? []) {
    if (SENSITIVE_SETTING_KEYS.has(row.key)) continue;
    map[row.key] = row.value;
  }
  return map;
});
const getAllSettingsAdmin_createServerFn_handler = createServerRpc({
  id: "e666ea7defb2607f8705e98e5caec4718d862aabbfe81fceb990cb84a1028fc0",
  name: "getAllSettingsAdmin",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAllSettingsAdmin.__executeServer(opts));
const getAllSettingsAdmin = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getAllSettingsAdmin_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await (await getSupabaseAdmin()).from("app_settings").select("*");
  if (error) throw new Error(error.message);
  const map = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
});
const updateSetting_createServerFn_handler = createServerRpc({
  id: "742f70fd777ae551ad3e3d3d2db22cdd962f265a6451e0c71a29e8525bb6c8b6",
  name: "updateSetting",
  filename: "src/lib/admin.functions.ts"
}, (opts) => updateSetting.__executeServer(opts));
const updateSetting = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  key: stringType().min(1).max(64),
  value: anyType()
}).parse(input)).handler(updateSetting_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("app_settings").upsert({
    key: data.key,
    value: data.value,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_by: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getAllSeo_createServerFn_handler = createServerRpc({
  id: "80fb419e171ab7445c9a3c070613b21c5275c8c8ca7ff35db416f2ffc369fe12",
  name: "getAllSeo",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAllSeo.__executeServer(opts));
const getAllSeo = createServerFn({
  method: "GET"
}).handler(getAllSeo_createServerFn_handler, async () => {
  const {
    data,
    error
  } = await (await getSupabaseAdmin()).from("seo_settings").select("*").order("page_key");
  if (error) throw new Error(error.message);
  return data ?? [];
});
const seoSchema = objectType({
  page_key: stringType().min(1).max(64),
  title: stringType().max(120).nullable().optional(),
  description: stringType().max(300).nullable().optional(),
  keywords: stringType().max(500).nullable().optional(),
  og_title: stringType().max(120).nullable().optional(),
  og_description: stringType().max(300).nullable().optional(),
  og_image: stringType().max(500).nullable().optional(),
  twitter_card: stringType().max(40).nullable().optional()
});
const upsertSeo_createServerFn_handler = createServerRpc({
  id: "7efe620fd9e76ed5c38c31ec5a99c488a5aefd6d4272fbf32164bc4f1ce20c9c",
  name: "upsertSeo",
  filename: "src/lib/admin.functions.ts"
}, (opts) => upsertSeo.__executeServer(opts));
const upsertSeo = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => seoSchema.parse(input)).handler(upsertSeo_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("seo_settings").upsert({
    ...data,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_by: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getAnalytics_createServerFn_handler = createServerRpc({
  id: "16341306f66e3e93d865e8edbb54b5361dda1dcb66fc2e0e8c72565e22634488",
  name: "getAnalytics",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getAnalytics.__executeServer(opts));
const getAnalytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getAnalytics_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const since24 = new Date(Date.now() - 24 * 3600 * 1e3).toISOString();
  const since5m = new Date(Date.now() - 5 * 60 * 1e3).toISOString();
  const since7d = new Date(Date.now() - 7 * 24 * 3600 * 1e3).toISOString();
  const [totalUsers, onlineUsers, newUsers24, postsTotal, posts24, messages24, games24, topChannels, newUsersByDay] = await Promise.all([(await getSupabaseAdmin()).from("profiles").select("id", {
    count: "exact",
    head: true
  }), (await getSupabaseAdmin()).from("profiles").select("id", {
    count: "exact",
    head: true
  }).gte("last_seen", since5m), (await getSupabaseAdmin()).from("profiles").select("id", {
    count: "exact",
    head: true
  }).gte("created_at", since24), (await getSupabaseAdmin()).from("posts").select("id", {
    count: "exact",
    head: true
  }), (await getSupabaseAdmin()).from("posts").select("id", {
    count: "exact",
    head: true
  }).gte("created_at", since24), (await getSupabaseAdmin()).from("messages").select("id", {
    count: "exact",
    head: true
  }).gte("created_at", since24), (await getSupabaseAdmin()).from("games").select("id", {
    count: "exact",
    head: true
  }).gte("created_at", since24), (await getSupabaseAdmin()).from("messages").select("channel_id").gte("created_at", since24).limit(2e3), (await getSupabaseAdmin()).from("profiles").select("created_at").gte("created_at", since7d).limit(5e3)]);
  const channelCounts = {};
  for (const r of topChannels.data ?? []) {
    const cid = r.channel_id;
    if (!cid || cid.startsWith("dm:")) continue;
    channelCounts[cid] = (channelCounts[cid] ?? 0) + 1;
  }
  const top = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([channel, count]) => ({
    channel,
    count
  }));
  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 3600 * 1e3).toISOString().slice(0, 10);
    days[d] = 0;
  }
  for (const r of newUsersByDay.data ?? []) {
    const d = r.created_at.slice(0, 10);
    if (d in days) days[d] += 1;
  }
  return {
    totalUsers: totalUsers.count ?? 0,
    onlineUsers: onlineUsers.count ?? 0,
    newUsers24: newUsers24.count ?? 0,
    postsTotal: postsTotal.count ?? 0,
    posts24: posts24.count ?? 0,
    messages24: messages24.count ?? 0,
    games24: games24.count ?? 0,
    topChannels: top,
    newUsersByDay: Object.entries(days).map(([day, count]) => ({
      day,
      count
    }))
  };
});
const getRealtimeOverview_createServerFn_handler = createServerRpc({
  id: "4fcb3aa828c53ba4d8926013168728e821d65c080c1848a107d4a91f3464371f",
  name: "getRealtimeOverview",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getRealtimeOverview.__executeServer(opts));
const getRealtimeOverview = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getRealtimeOverview_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const since5m = new Date(Date.now() - 5 * 60 * 1e3).toISOString();
  const since10m = new Date(Date.now() - 10 * 60 * 1e3).toISOString();
  const since1m = new Date(Date.now() - 60 * 1e3).toISOString();
  const [online, recentMsgs, activeGames, recentPosts] = await Promise.all([(await getSupabaseAdmin()).from("profiles").select("id", {
    count: "exact",
    head: true
  }).gte("last_seen", since5m), (await getSupabaseAdmin()).from("messages").select("channel_id").gte("created_at", since10m).limit(500), (await getSupabaseAdmin()).from("games").select("id", {
    count: "exact",
    head: true
  }).in("status", ["waiting", "active"]), (await getSupabaseAdmin()).from("posts").select("id", {
    count: "exact",
    head: true
  }).gte("created_at", since1m)]);
  const rooms = /* @__PURE__ */ new Set();
  for (const r of recentMsgs.data ?? []) {
    const cid = r.channel_id;
    if (cid && !cid.startsWith("dm:")) rooms.add(cid);
  }
  return {
    onlineUsers: online.count ?? 0,
    activeRooms: rooms.size,
    activeGames: activeGames.count ?? 0,
    postsLastMinute: recentPosts.count ?? 0,
    timestamp: Date.now()
  };
});
const getTopUsers_createServerFn_handler = createServerRpc({
  id: "b963e5dbd814aaf870c63993e3271be5d7638e1e1da717c13b2e7895551e5eee",
  name: "getTopUsers",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getTopUsers.__executeServer(opts));
const getTopUsers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getTopUsers_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data,
    error
  } = await supabaseAdmin.from("profiles").select("id, username, avatar_url, avatar_color, xp, level").order("xp", {
    ascending: false
  }).limit(8);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const getSeoTargetsSummary_createServerFn_handler = createServerRpc({
  id: "2e28f2ea2e9dc9510a5aec6e555e3c88a8bed13f8e6395a5bbb398cdef09002b",
  name: "getSeoTargetsSummary",
  filename: "src/lib/admin.functions.ts"
}, (opts) => getSeoTargetsSummary.__executeServer(opts));
const getSeoTargetsSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(getSeoTargetsSummary_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const [rooms, profiles, posts, games] = await Promise.all([(await getSupabaseAdmin()).from("messages").select("channel_id").limit(2e3), (await getSupabaseAdmin()).from("profiles").select("id", {
    count: "exact",
    head: true
  }), (await getSupabaseAdmin()).from("posts").select("id", {
    count: "exact",
    head: true
  }).eq("privacy", "public"), (await getSupabaseAdmin()).from("games").select("id", {
    count: "exact",
    head: true
  })]);
  const roomSet = /* @__PURE__ */ new Set();
  for (const r of rooms.data ?? []) {
    const cid = r.channel_id;
    if (cid && !cid.startsWith("dm:")) roomSet.add(cid);
  }
  return {
    rooms: roomSet.size,
    profiles: profiles.count ?? 0,
    publicPosts: posts.count ?? 0,
    games: games.count ?? 0
  };
});
const banUser_createServerFn_handler = createServerRpc({
  id: "d41df9bb37178408e5eaadda53c3c50a028eeb54f5e2081e2adca12cc585aabf",
  name: "banUser",
  filename: "src/lib/admin.functions.ts"
}, (opts) => banUser.__executeServer(opts));
const banUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  reason: stringType().trim().min(3, "Reason is required").max(500),
  duration_minutes: numberType().int().min(0).max(60 * 24 * 365 * 5).nullable()
}).parse(input)).handler(banUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const expires_at = data.duration_minutes && data.duration_minutes > 0 ? new Date(Date.now() + data.duration_minutes * 6e4).toISOString() : null;
  await (await getSupabaseAdmin()).from("user_bans").update({
    active: false
  }).eq("user_id", data.user_id).eq("active", true);
  const {
    error
  } = await (await getSupabaseAdmin()).from("user_bans").insert({
    user_id: data.user_id,
    reason: data.reason,
    expires_at,
    created_by: context.userId,
    active: true,
    ban_type: "ban"
  });
  if (error) throw new Error(error.message);
  const {
    data: secSetting
  } = await supabaseAdmin.from("app_settings").select("value").eq("key", "device_security").maybeSingle();
  const deviceBanEnabled = secSetting?.value?.enabled ?? false;
  let bannedDeviceCount = 0;
  if (deviceBanEnabled) {
    const {
      data: devices
    } = await supabaseAdmin.from("user_devices").select("fingerprint").eq("user_id", data.user_id);
    const rows = (devices ?? []).map((d) => ({
      fingerprint: d.fingerprint,
      source_user_id: data.user_id,
      reason: data.reason,
      created_by: context.userId
    }));
    if (rows.length) {
      await (await getSupabaseAdmin()).from("banned_devices").upsert(rows, {
        onConflict: "fingerprint"
      });
      bannedDeviceCount = rows.length;
    }
  }
  await (await getSupabaseAdmin()).from("mod_logs").insert({
    actor_id: context.userId,
    action: expires_at ? "temp_ban" : "ban",
    target_user_id: data.user_id,
    target_type: "user",
    target_id: data.user_id,
    payload: {
      reason: data.reason,
      expires_at,
      duration_minutes: data.duration_minutes,
      device_ban_enabled: deviceBanEnabled,
      banned_device_count: bannedDeviceCount
    }
  });
  return {
    ok: true,
    banned_device_count: bannedDeviceCount
  };
});
const unbanUser_createServerFn_handler = createServerRpc({
  id: "356e223e39964593e002f2a62714caec95be0b80bc1bcb1f166ced0c500f3c8a",
  name: "unbanUser",
  filename: "src/lib/admin.functions.ts"
}, (opts) => unbanUser.__executeServer(opts));
const unbanUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid()
}).parse(input)).handler(unbanUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    data: prior
  } = await supabaseAdmin.from("user_bans").select("id, reason, expires_at").eq("user_id", data.user_id).eq("active", true).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  const {
    error
  } = await supabaseAdmin.from("user_bans").update({
    active: false
  }).eq("user_id", data.user_id).eq("active", true);
  if (error) throw new Error(error.message);
  await (await getSupabaseAdmin()).from("mod_logs").insert({
    actor_id: context.userId,
    action: "unban",
    target_user_id: data.user_id,
    target_type: "user",
    target_id: data.user_id,
    payload: {
      lifted_ban_id: prior?.id ?? null,
      prior_reason: prior?.reason ?? null,
      prior_expires_at: prior?.expires_at ?? null
    }
  });
  return {
    ok: true
  };
});
const deleteUser_createServerFn_handler = createServerRpc({
  id: "5f15d9c6194c3264109b1c81741c60a8654b66a5caffc1ee319315a3a983394e",
  name: "deleteUser",
  filename: "src/lib/admin.functions.ts"
}, (opts) => deleteUser.__executeServer(opts));
const deleteUser = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid()
}).parse(input)).handler(deleteUser_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.userId);
  if (data.user_id === context.userId) throw new Error("Cannot delete your own account");
  const admin = await getSupabaseAdmin();
  const {
    error: cascadeErr
  } = await admin.rpc("delete_user_cascade", {
    _user: data.user_id
  });
  if (cascadeErr) throw new Error(cascadeErr.message);
  const {
    error
  } = await admin.auth.admin.deleteUser(data.user_id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminResetUserPassword_createServerFn_handler = createServerRpc({
  id: "e26d54fd4bb85730b3dd66f1b502cc31e7da8b91f4fd161a5b19ad2562e4d543",
  name: "adminResetUserPassword",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminResetUserPassword.__executeServer(opts));
const adminResetUserPassword = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  new_password: stringType().min(8).max(72).optional()
}).parse(input)).handler(adminResetUserPassword_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.userId);
  const admin = await getSupabaseAdmin();
  let pwd = data.new_password?.trim();
  if (!pwd) {
    const bytes = new Uint8Array(12);
    crypto.getRandomValues(bytes);
    pwd = Array.from(bytes, (b) => "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$"[b % 60]).join("");
  }
  const {
    error
  } = await admin.auth.admin.updateUserById(data.user_id, {
    password: pwd
  });
  if (error) throw new Error(error.message);
  return {
    ok: true,
    password: pwd,
    generated: !data.new_password
  };
});
const adminGrantCoins_createServerFn_handler = createServerRpc({
  id: "6d70bfa63a3940d25327ddeec4416120f6561357557950f3ae443a8741d968c9",
  name: "adminGrantCoins",
  filename: "src/lib/admin.functions.ts"
}, (opts) => adminGrantCoins.__executeServer(opts));
const adminGrantCoins = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  amount: numberType().int().refine((n) => n !== 0 && n >= -1e6 && n <= 1e6, "Amount out of range"),
  reason: stringType().trim().max(200).optional()
}).parse(input)).handler(adminGrantCoins_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const admin = await getSupabaseAdmin();
  const {
    data: prof,
    error: pErr
  } = await admin.from("profiles").select("coins").eq("id", data.user_id).maybeSingle();
  if (pErr) throw new Error(pErr.message);
  if (!prof) throw new Error("User not found");
  const next = Math.max(0, (prof.coins ?? 0) + data.amount);
  const {
    error: uErr
  } = await admin.from("profiles").update({
    coins: next
  }).eq("id", data.user_id);
  if (uErr) throw new Error(uErr.message);
  await admin.from("coin_transactions").insert({
    user_id: data.user_id,
    kind: "coins",
    amount: data.amount,
    reason: data.reason?.trim() || (data.amount >= 0 ? "admin_grant" : "admin_deduct"),
    ref_type: "admin",
    ref_id: context.userId
  });
  await admin.from("mod_logs").insert({
    actor_id: context.userId,
    action: "note",
    target_user_id: data.user_id,
    target_type: "user",
    target_id: data.user_id,
    payload: {
      amount: data.amount,
      new_balance: next,
      reason: data.reason ?? null
    }
  });
  return {
    ok: true,
    new_balance: next
  };
});
const listUsersWithRoles_createServerFn_handler = createServerRpc({
  id: "d8993bd40f9162497be09e35e3e219129afc683ceeb885dc57ad49e227c2d53b",
  name: "listUsersWithRoles",
  filename: "src/lib/admin.functions.ts"
}, (opts) => listUsersWithRoles.__executeServer(opts));
const listUsersWithRoles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  q: stringType().max(64).optional(),
  filter: enumType(["all", "members", "guests", "banned", "staff"]).optional()
}).parse(input ?? {})).handler(listUsersWithRoles_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  let query = supabaseAdmin.from("profiles").select("id, username, avatar_url, created_at, last_seen, xp, level").order("created_at", {
    ascending: false
  }).limit(200);
  if (data.q) query = query.ilike("username", `%${data.q}%`);
  if (data.filter === "guests") query = query.ilike("username", "guest-%");
  if (data.filter === "members") query = query.not("username", "ilike", "guest-%");
  const [{
    data: profiles,
    error: pErr
  }, {
    data: roles,
    error: rErr
  }, {
    data: bans,
    error: bErr
  }] = await Promise.all([query, (await getSupabaseAdmin()).from("user_roles").select("user_id, role"), (await getSupabaseAdmin()).from("user_bans").select("user_id, reason, expires_at, created_at").eq("active", true)]);
  if (pErr) throw new Error(pErr.message);
  if (rErr) throw new Error(rErr.message);
  if (bErr) throw new Error(bErr.message);
  const roleMap = {};
  for (const r of roles ?? []) {
    const row = r;
    (roleMap[row.user_id] ??= []).push(row.role);
  }
  const banMap = {};
  const now = Date.now();
  for (const b of bans ?? []) {
    const row = b;
    if (!row.user_id) continue;
    if (row.expires_at && new Date(row.expires_at).getTime() <= now) continue;
    banMap[row.user_id] = {
      reason: row.reason,
      expires_at: row.expires_at
    };
  }
  let rows = (profiles ?? []).map((p) => ({
    ...p,
    roles: roleMap[p.id] ?? [],
    banned: !!banMap[p.id],
    ban_reason: banMap[p.id]?.reason ?? null,
    ban_expires_at: banMap[p.id]?.expires_at ?? null,
    is_guest: !!p.username && p.username.toLowerCase().startsWith("guest-")
  }));
  if (data.filter === "banned") rows = rows.filter((r) => r.banned);
  if (data.filter === "staff") rows = rows.filter((r) => r.roles.length > 0);
  return rows;
});
const setUserRole_createServerFn_handler = createServerRpc({
  id: "db980dd7fbef43d3fc13d10ddc5f8ed5aae0f52362aa36d741670b7c62aab77f",
  name: "setUserRole",
  filename: "src/lib/admin.functions.ts"
}, (opts) => setUserRole.__executeServer(opts));
const setUserRole = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  role: enumType(["super_admin", "admin", "moderator", "dj", "rj"]),
  grant: booleanType()
}).parse(input)).handler(setUserRole_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertSuperAdmin(context.userId);
  if (data.grant) {
    const {
      error
    } = await supabaseAdmin.from("user_roles").upsert({
      user_id: data.user_id,
      role: data.role
    }, {
      onConflict: "user_id,role"
    });
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const updateUserUsername_createServerFn_handler = createServerRpc({
  id: "87e8d9d8a2925a65286ce3dbbfd5ac5123bf4744ea10552f976ed54f5870fb5c",
  name: "updateUserUsername",
  filename: "src/lib/admin.functions.ts"
}, (opts) => updateUserUsername.__executeServer(opts));
const updateUserUsername = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  user_id: stringType().uuid(),
  username: stringType().trim().min(2).max(32)
}).parse(input)).handler(updateUserUsername_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const v = data.username.trim();
  if (!/^[A-Za-z0-9_ ]+$/.test(v)) throw new Error("Only letters, numbers, spaces, and underscore allowed");
  const letters = v.replace(/[^A-Za-z]/g, "").length;
  if (letters < 2 || letters > 10) throw new Error("Username must contain 2–10 letters");
  if (/^guest-/i.test(v)) throw new Error("Reserved prefix");
  const {
    data: existing
  } = await supabaseAdmin.from("profiles").select("id").ilike("username", v).neq("id", data.user_id).maybeSingle();
  if (existing) throw new Error("Username already taken");
  const {
    error
  } = await (await getSupabaseAdmin()).from("profiles").update({
    username: v
  }).eq("id", data.user_id);
  if (error) throw new Error(error.message);
  return {
    ok: true,
    username: v
  };
});
async function assertAnnouncementsEditor(userId) {
  const {
    data: roleRows,
    error: roleErr
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  if (roleErr) throw new Error(roleErr.message);
  const roles = (roleRows ?? []).map((r) => r.role);
  const isAdmin = roles.includes("super_admin") || roles.includes("admin");
  if (isAdmin) return {
    isAdmin: true,
    isModerator: false
  };
  const isModerator = roles.includes("moderator");
  if (!isModerator) throw new Error("Forbidden: admin or moderator only");
  const {
    data: setRow
  } = await supabaseAdmin.from("app_settings").select("value").eq("key", "staff_permissions").maybeSingle();
  const perms = setRow?.value ?? {};
  if (!perms.mod_can_announce) throw new Error("Forbidden: moderators are not approved to edit announcements");
  return {
    isAdmin: false,
    isModerator: true
  };
}
const canEditAnnouncements_createServerFn_handler = createServerRpc({
  id: "c465015787dbaa9c954db141adefed69510981317ee31153ef67e7865a42a5a6",
  name: "canEditAnnouncements",
  filename: "src/lib/admin.functions.ts"
}, (opts) => canEditAnnouncements.__executeServer(opts));
const canEditAnnouncements = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(canEditAnnouncements_createServerFn_handler, async ({
  context
}) => {
  try {
    const r = await assertAnnouncementsEditor(context.userId);
    return {
      allowed: true,
      ...r
    };
  } catch {
    return {
      allowed: false,
      isAdmin: false,
      isModerator: false
    };
  }
});
const announcementItemSchema = objectType({
  id: stringType().min(1).max(64),
  text: stringType().max(500),
  link: stringType().max(500).optional().default(""),
  intervalMinutes: numberType().int().min(1).max(10080),
  enabled: booleanType()
});
const announcementsConfigSchema = objectType({
  enabled: booleanType(),
  items: arrayType(announcementItemSchema).min(1).max(20)
});
const updateAnnouncementsConfig_createServerFn_handler = createServerRpc({
  id: "b0ce4466e74c0c34f7b2b1633e36d6e27c1eadf93ca1e7da079b481ef7177ee4",
  name: "updateAnnouncementsConfig",
  filename: "src/lib/admin.functions.ts"
}, (opts) => updateAnnouncementsConfig.__executeServer(opts));
const updateAnnouncementsConfig = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => announcementsConfigSchema.parse(input)).handler(updateAnnouncementsConfig_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAnnouncementsEditor(context.userId);
  const {
    error
  } = await supabaseAdmin.from("app_settings").upsert({
    key: "chat_announcements",
    value: data,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_by: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
export {
  adminGrantCoins_createServerFn_handler,
  adminResetUserPassword_createServerFn_handler,
  banUser_createServerFn_handler,
  canEditAnnouncements_createServerFn_handler,
  deleteUser_createServerFn_handler,
  getAllSeo_createServerFn_handler,
  getAllSettingsAdmin_createServerFn_handler,
  getAllSettings_createServerFn_handler,
  getAnalytics_createServerFn_handler,
  getMyRoles_createServerFn_handler,
  getRealtimeOverview_createServerFn_handler,
  getSeoTargetsSummary_createServerFn_handler,
  getTopUsers_createServerFn_handler,
  listUsersWithRoles_createServerFn_handler,
  setUserRole_createServerFn_handler,
  unbanUser_createServerFn_handler,
  updateAnnouncementsConfig_createServerFn_handler,
  updateSetting_createServerFn_handler,
  updateUserUsername_createServerFn_handler,
  upsertSeo_createServerFn_handler
};
