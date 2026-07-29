import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, e as enumType, b as booleanType } from "../_libs/zod.mjs";
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
const BROADCASTER_ROLES = ["admin", "super_admin", "dj", "rj"];
async function getMyRoles(userId) {
  const {
    data
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  return (data ?? []).map((r) => r.role);
}
async function assertBroadcaster(userId) {
  const roles = await getMyRoles(userId);
  if (!roles.some((r) => BROADCASTER_ROLES.includes(r))) {
    throw new Error("Forbidden: broadcaster role required");
  }
  return roles;
}
async function assertAdmin(userId) {
  const roles = await getMyRoles(userId);
  if (!roles.some((r) => r === "admin" || r === "super_admin")) {
    throw new Error("Forbidden: admin only");
  }
}
const getBroadcasterAccess_createServerFn_handler = createServerRpc({
  id: "238d26adde7e0634904d22000ae09a203059aefce330cb5576868ba35b742d47",
  name: "getBroadcasterAccess",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => getBroadcasterAccess.__executeServer(opts));
const getBroadcasterAccess = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).handler(getBroadcasterAccess_createServerFn_handler, async ({
  context
}) => {
  const roles = await getMyRoles(context.userId);
  return {
    roles,
    isAdmin: roles.includes("admin") || roles.includes("super_admin"),
    isBroadcaster: roles.some((r) => BROADCASTER_ROLES.includes(r))
  };
});
function slugify(input) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || `widget-${Date.now().toString(36)}`;
}
const listWidgets_createServerFn_handler = createServerRpc({
  id: "5dc3d1d8bc495346ed47f4b44e78d0cd190366922e7aaefcbc4172172eaec712",
  name: "listWidgets",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => listWidgets.__executeServer(opts));
const listWidgets = createServerFn({
  method: "GET"
}).handler(listWidgets_createServerFn_handler, async () => {
  const {
    data,
    error
  } = await supabaseAdmin.from("radio_widgets").select("*").order("created_at", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const createWidget_createServerFn_handler = createServerRpc({
  id: "d9794dd4eeda923f6716cb98ae2b68c8a94e4df0190a97a183ee63c92eb71dbe",
  name: "createWidget",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => createWidget.__executeServer(opts));
const createWidget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(createWidget_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertBroadcaster(context.userId);
  const name = (data.name || "").trim();
  if (!name) throw new Error("Name required");
  const streamUrl = (data.stream_url || "").trim();
  if (streamUrl && !/^https?:\/\//i.test(streamUrl)) throw new Error("Stream URL must start with http(s)://");
  let slug = slugify(name);
  for (let i = 0; i < 6; i++) {
    const {
      data: dup
    } = await supabaseAdmin.from("radio_widgets").select("id").eq("slug", slug).maybeSingle();
    if (!dup) break;
    slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 5)}`;
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("radio_widgets").insert({
    name,
    slug,
    description: data.description ?? null,
    accent_color: data.accent_color ?? "#a855f7",
    cover_url: data.cover_url ?? null,
    stream_url: streamUrl || null,
    owner_id: context.userId,
    created_by: context.userId
  }).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const updateWidget_createServerFn_handler = createServerRpc({
  id: "51750de6690a74fa68c7f335ee3da0e50d9c24dfbab650bf78c3bc9640303076",
  name: "updateWidget",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => updateWidget.__executeServer(opts));
const updateWidget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(updateWidget_createServerFn_handler, async ({
  data,
  context
}) => {
  const roles = await getMyRoles(context.userId);
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  if (!isAdmin) {
    const {
      data: w
    } = await supabaseAdmin.from("radio_widgets").select("owner_id").eq("id", data.id).maybeSingle();
    if (!w || w.owner_id !== context.userId) throw new Error("Forbidden");
  }
  const patch = {};
  if (data.name !== void 0) patch.name = data.name;
  if (data.description !== void 0) patch.description = data.description;
  if (data.accent_color !== void 0) patch.accent_color = data.accent_color;
  if (data.cover_url !== void 0) patch.cover_url = data.cover_url;
  if (data.stream_url !== void 0) {
    const s = (data.stream_url || "").trim();
    if (s && !/^https?:\/\//i.test(s)) throw new Error("Stream URL must start with http(s)://");
    patch.stream_url = s || null;
  }
  if (data.enabled !== void 0) patch.enabled = data.enabled;
  const {
    data: row,
    error
  } = await supabaseAdmin.from("radio_widgets").update(patch).eq("id", data.id).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const deleteWidget_createServerFn_handler = createServerRpc({
  id: "eef0a829cb0d8fcfa5b9d21f8a506836714b10743adc1e637795952c76e2d746",
  name: "deleteWidget",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => deleteWidget.__executeServer(opts));
const deleteWidget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(deleteWidget_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("radio_widgets").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
async function assertWidgetHostOrAdmin(userId, widgetId) {
  const roles = await getMyRoles(userId);
  if (roles.includes("admin") || roles.includes("super_admin")) return;
  const {
    data
  } = await supabaseAdmin.from("radio_widgets").select("owner_id").eq("id", widgetId).maybeSingle();
  if (data?.owner_id === userId) return;
  const {
    data: st
  } = await supabaseAdmin.from("radio_widget_state").select("current_host_id").eq("widget_id", widgetId).maybeSingle();
  if (st?.current_host_id === userId) return;
  throw new Error("Forbidden: not host of this widget");
}
const goLive_createServerFn_handler = createServerRpc({
  id: "5371c292cc1cac140a928f2cfb635f35f1ecfdb2842adf406c4b794a802d2b01",
  name: "goLive",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => goLive.__executeServer(opts));
const goLive = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(goLive_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertWidgetHostOrAdmin(context.userId, data.widget_id);
  const {
    error
  } = await supabaseAdmin.from("radio_widget_state").upsert({
    widget_id: data.widget_id,
    is_live: true,
    current_host_id: context.userId,
    current_show_title: data.show_title ?? null,
    started_at: (/* @__PURE__ */ new Date()).toISOString()
  }, {
    onConflict: "widget_id"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const endLive_createServerFn_handler = createServerRpc({
  id: "8a03f851241163cd068c39def034f76f846db9de8de07468913d220e67fdc0a1",
  name: "endLive",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => endLive.__executeServer(opts));
const endLive = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(endLive_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertWidgetHostOrAdmin(context.userId, data.widget_id);
  const {
    error
  } = await supabaseAdmin.from("radio_widget_state").update({
    is_live: false,
    mic_active: false,
    current_host_id: null,
    current_show_title: null,
    current_track_title: null,
    current_track_artist: null,
    current_track_artwork: null,
    listener_count: 0,
    started_at: null
  }).eq("widget_id", data.widget_id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const setMic_createServerFn_handler = createServerRpc({
  id: "5b6c8dbe8128b4b90cd11687140630be2c92765c9a48b45b10af841db0d833f8",
  name: "setMic",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => setMic.__executeServer(opts));
const setMic = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(setMic_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertWidgetHostOrAdmin(context.userId, data.widget_id);
  const {
    error
  } = await supabaseAdmin.from("radio_widget_state").update({
    mic_active: data.active
  }).eq("widget_id", data.widget_id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const updateNowPlaying_createServerFn_handler = createServerRpc({
  id: "45c6819b95a3e108e24c18c477b291f66f106c440e7d2939a387f6282b04ee6e",
  name: "updateNowPlaying",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => updateNowPlaying.__executeServer(opts));
const updateNowPlaying = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(updateNowPlaying_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertWidgetHostOrAdmin(context.userId, data.widget_id);
  const {
    error
  } = await supabaseAdmin.from("radio_widget_state").update({
    current_track_title: data.track_title ?? null,
    current_track_artist: data.track_artist ?? null,
    current_track_artwork: data.track_artwork ?? null
  }).eq("widget_id", data.widget_id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const scheduleSchema = objectType({
  widget_id: stringType().uuid(),
  title: stringType().min(1).max(120),
  description: stringType().max(500).optional().nullable(),
  starts_at: stringType(),
  ends_at: stringType()
});
const listSchedules_createServerFn_handler = createServerRpc({
  id: "805f397af5a11a75bc1231dc187c57cdcc065ff51e4a54b71e2d9ce15e72cae8",
  name: "listSchedules",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => listSchedules.__executeServer(opts));
const listSchedules = createServerFn({
  method: "GET"
}).inputValidator((d) => d ?? {}).handler(listSchedules_createServerFn_handler, async ({
  data
}) => {
  let q = supabaseAdmin.from("radio_schedules").select("*").neq("status", "cancelled").gte("ends_at", new Date(Date.now() - 1e3 * 60 * 60 * 24 * 7).toISOString()).order("starts_at", {
    ascending: true
  }).limit(200);
  if (data?.widget_id) q = q.eq("widget_id", data.widget_id);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const createSchedule_createServerFn_handler = createServerRpc({
  id: "3176bfe3f52736108a773a525b6bac54251ce47fd6e58e068c43631b9ff74837",
  name: "createSchedule",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => createSchedule.__executeServer(opts));
const createSchedule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => scheduleSchema.parse(d)).handler(createSchedule_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertBroadcaster(context.userId);
  if (new Date(data.ends_at) <= new Date(data.starts_at)) {
    throw new Error("End must be after start");
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("radio_schedules").insert({
    widget_id: data.widget_id,
    host_id: context.userId,
    title: data.title,
    description: data.description ?? null,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    status: "scheduled"
  }).select("*").single();
  if (error) {
    if (error.message?.toLowerCase().includes("radio_schedules_no_overlap")) {
      throw new Error("❌ Time Slot Unavailable — that range overlaps an existing show on this widget.");
    }
    throw new Error(error.message);
  }
  return row;
});
const cancelSchedule_createServerFn_handler = createServerRpc({
  id: "535d0fa6de306d50b658ce479b7ab08624dfe04d8325effe54770db6c5ff46d9",
  name: "cancelSchedule",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => cancelSchedule.__executeServer(opts));
const cancelSchedule = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(cancelSchedule_createServerFn_handler, async ({
  data,
  context
}) => {
  const roles = await getMyRoles(context.userId);
  const isAdmin = roles.includes("admin") || roles.includes("super_admin");
  const {
    data: s
  } = await supabaseAdmin.from("radio_schedules").select("host_id").eq("id", data.id).maybeSingle();
  if (!s) throw new Error("Not found");
  if (!isAdmin && s.host_id !== context.userId) throw new Error("Forbidden");
  const {
    error
  } = await supabaseAdmin.from("radio_schedules").update({
    status: "cancelled"
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const YT_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
function parseYouTubeId(url) {
  const m = url.match(YT_RE);
  return m?.[1] ?? null;
}
const listQueue_createServerFn_handler = createServerRpc({
  id: "9075a129d512e315185436d3141e3ea9db20a1de7fec11c6db4a01af843271ac",
  name: "listQueue",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => listQueue.__executeServer(opts));
const listQueue = createServerFn({
  method: "GET"
}).inputValidator((d) => d).handler(listQueue_createServerFn_handler, async ({
  data
}) => {
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("radio_queue_items").select("*").eq("widget_id", data.widget_id).eq("played", false).order("position", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const addQueueItem_createServerFn_handler = createServerRpc({
  id: "308aa36452393305458ae58c3176bcb255f7ced31e92fefa57fdf268d0340379",
  name: "addQueueItem",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => addQueueItem.__executeServer(opts));
const addQueueItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(addQueueItem_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertWidgetHostOrAdmin(context.userId, data.widget_id);
  const id = parseYouTubeId(data.url);
  if (!id) throw new Error("Not a recognised YouTube URL");
  const {
    data: max
  } = await supabaseAdmin.from("radio_queue_items").select("position").eq("widget_id", data.widget_id).eq("played", false).order("position", {
    ascending: false
  }).limit(1).maybeSingle();
  const nextPos = (max?.position ?? 0) + 1;
  const {
    data: row,
    error
  } = await supabaseAdmin.from("radio_queue_items").insert({
    widget_id: data.widget_id,
    added_by: context.userId,
    position: nextPos,
    youtube_url: data.url,
    youtube_id: id,
    title: data.title ?? null,
    channel: data.channel ?? null,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  }).select("*").single();
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("radio_widget_state").update({
    queue_size: nextPos
  }).eq("widget_id", data.widget_id);
  return row;
});
const removeQueueItem_createServerFn_handler = createServerRpc({
  id: "d7af495f5a35b4ed53372d02267b6f08f2c177b5caeefddca0eb0d74cafef5f3",
  name: "removeQueueItem",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => removeQueueItem.__executeServer(opts));
const removeQueueItem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(removeQueueItem_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertWidgetHostOrAdmin(context.userId, data.widget_id);
  const {
    error
  } = await supabaseAdmin.from("radio_queue_items").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  const {
    count
  } = await supabaseAdmin.from("radio_queue_items").select("id", {
    count: "exact",
    head: true
  }).eq("widget_id", data.widget_id).eq("played", false);
  await supabaseAdmin.from("radio_widget_state").update({
    queue_size: count ?? 0
  }).eq("widget_id", data.widget_id);
  return {
    ok: true
  };
});
const clearQueue_createServerFn_handler = createServerRpc({
  id: "1e28a63b1262f5d86f88253495609604812295137987cd1fd4afdae6cf3378d7",
  name: "clearQueue",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => clearQueue.__executeServer(opts));
const clearQueue = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(clearQueue_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertWidgetHostOrAdmin(context.userId, data.widget_id);
  const {
    error
  } = await supabaseAdmin.from("radio_queue_items").delete().eq("widget_id", data.widget_id).eq("played", false);
  if (error) throw new Error(error.message);
  await supabaseAdmin.from("radio_widget_state").update({
    queue_size: 0
  }).eq("widget_id", data.widget_id);
  return {
    ok: true
  };
});
const markPlayed_createServerFn_handler = createServerRpc({
  id: "d04d6ffa6de6962798775c2d3d03821969b1fb215d018108edb9db09b893db94",
  name: "markPlayed",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => markPlayed.__executeServer(opts));
const markPlayed = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(markPlayed_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertWidgetHostOrAdmin(context.userId, data.widget_id);
  const {
    error
  } = await supabaseAdmin.from("radio_queue_items").update({
    played: true
  }).eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getBroadcasterSettings_createServerFn_handler = createServerRpc({
  id: "ce4548f7990841c825d719824fc54decd25b0b255e1195c9ee0ba78865de8352",
  name: "getBroadcasterSettings",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => getBroadcasterSettings.__executeServer(opts));
const getBroadcasterSettings = createServerFn({
  method: "GET"
}).handler(getBroadcasterSettings_createServerFn_handler, async () => {
  const {
    data,
    error
  } = await supabaseAdmin.from("broadcaster_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});
const updateBroadcasterSettings_createServerFn_handler = createServerRpc({
  id: "22bd62ee6d6711c0bcd47753a1a88905c1e9025b39c468cb88c280fbc33b8bd7",
  name: "updateBroadcasterSettings",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => updateBroadcasterSettings.__executeServer(opts));
const updateBroadcasterSettings = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(updateBroadcasterSettings_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const patch = {};
  if (data.disclaimer_text !== void 0) patch.disclaimer_text = data.disclaimer_text;
  if (data.disclaimer_enabled !== void 0) patch.disclaimer_enabled = data.disclaimer_enabled;
  if (data.ticker_template !== void 0) patch.ticker_template = data.ticker_template;
  const {
    data: row,
    error
  } = await supabaseAdmin.from("broadcaster_settings").update(patch).eq("id", 1).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const announcementKindSchema = enumType(["upcoming_show", "ticker", "community"]);
const targetSchema = objectType({
  widget: booleanType().optional(),
  chatbar: booleanType().optional(),
  notifications: booleanType().optional(),
  feed: booleanType().optional()
});
const listAnnouncements_createServerFn_handler = createServerRpc({
  id: "b00abe4c792d8e622eece08904eb5d5e9643b4aa7888ec6accb75d77f73c3223",
  name: "listAnnouncements",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => listAnnouncements.__executeServer(opts));
const listAnnouncements = createServerFn({
  method: "GET"
}).inputValidator((d) => d ?? {}).handler(listAnnouncements_createServerFn_handler, async ({
  data
}) => {
  let q = supabaseAdmin.from("radio_announcements").select("*").order("pinned", {
    ascending: false
  }).order("created_at", {
    ascending: false
  }).limit(200);
  if (data.activeOnly) q = q.eq("active", true);
  if (data.kind) q = q.eq("kind", data.kind);
  if (data.widget_id === null) q = q.is("widget_id", null);
  else if (data.widget_id) q = q.eq("widget_id", data.widget_id);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  const now = Date.now();
  return (rows ?? []).filter((r) => {
    if (!data.activeOnly) return true;
    if (r.starts_at && new Date(r.starts_at).getTime() > now) return false;
    if (r.ends_at && new Date(r.ends_at).getTime() < now) return false;
    return true;
  });
});
const announcementInput = objectType({
  widget_id: stringType().uuid().nullable().optional(),
  kind: announcementKindSchema,
  title: stringType().min(1).max(140),
  body: stringType().max(2e3).optional().nullable(),
  link: stringType().url().max(500).optional().nullable(),
  starts_at: stringType().optional().nullable(),
  ends_at: stringType().optional().nullable(),
  pinned: booleanType().optional(),
  active: booleanType().optional(),
  target: targetSchema.optional()
});
const createAnnouncement_createServerFn_handler = createServerRpc({
  id: "7f292310935e2595456ed6407e363cc29ae982a41c240f7c35055c5608f406e9",
  name: "createAnnouncement",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => createAnnouncement.__executeServer(opts));
const createAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => announcementInput.parse(d)).handler(createAnnouncement_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertBroadcaster(context.userId);
  const {
    data: row,
    error
  } = await supabaseAdmin.from("radio_announcements").insert({
    widget_id: data.widget_id ?? null,
    author_id: context.userId,
    kind: data.kind,
    title: data.title,
    body: data.body ?? null,
    link: data.link ?? null,
    starts_at: data.starts_at ?? null,
    ends_at: data.ends_at ?? null,
    pinned: data.pinned ?? false,
    active: data.active ?? true,
    target: data.target ?? {
      widget: true,
      chatbar: true,
      notifications: true,
      feed: true
    }
  }).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const updateAnnouncement_createServerFn_handler = createServerRpc({
  id: "3bf66ddb000aad7ddeb82fcc7caf6308f91756f186d1a5e2bcd84edcc9da8e0b",
  name: "updateAnnouncement",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => updateAnnouncement.__executeServer(opts));
const updateAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(updateAnnouncement_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertBroadcaster(context.userId);
  const {
    id,
    ...rest
  } = data;
  const patch = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v !== void 0) patch[k] = v;
  }
  const {
    data: row,
    error
  } = await supabaseAdmin.from("radio_announcements").update(patch).eq("id", id).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const deleteAnnouncement_createServerFn_handler = createServerRpc({
  id: "3803b6416a3e6b1d4709a0d1a5f6c25f6f8c367272a3483b975500affd102e8d",
  name: "deleteAnnouncement",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => deleteAnnouncement.__executeServer(opts));
const deleteAnnouncement = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("radio.write")]).inputValidator((d) => d).handler(deleteAnnouncement_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertBroadcaster(context.userId);
  const {
    error
  } = await supabaseAdmin.from("radio_announcements").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getBroadcasterAnalytics_createServerFn_handler = createServerRpc({
  id: "c19e7a56000db35b15f020f4f1ef048a387378464f9a8e7fe123a8ccb6f1441c",
  name: "getBroadcasterAnalytics",
  filename: "src/lib/broadcaster.functions.ts"
}, (opts) => getBroadcasterAnalytics.__executeServer(opts));
const getBroadcasterAnalytics = createServerFn({
  method: "GET"
}).handler(getBroadcasterAnalytics_createServerFn_handler, async () => {
  const [{
    data: schedules
  }, {
    data: states
  }, {
    data: widgets
  }, {
    data: tracks
  }] = await Promise.all([supabaseAdmin.from("radio_schedules").select("*").limit(2e3), supabaseAdmin.from("radio_widget_state").select("*").limit(500), supabaseAdmin.from("radio_widgets").select("id,name,slug").limit(500), supabaseAdmin.from("radio_queue_items").select("youtube_id,title,played").eq("played", true).limit(5e3)]);
  const widgetMap = /* @__PURE__ */ new Map();
  (widgets ?? []).forEach((w) => widgetMap.set(w.id, {
    name: w.name,
    slug: w.slug
  }));
  const hostCounts = /* @__PURE__ */ new Map();
  (schedules ?? []).forEach((s) => {
    if (s.status === "completed" && s.host_id) {
      hostCounts.set(s.host_id, (hostCounts.get(s.host_id) ?? 0) + 1);
    }
  });
  let topHost = null;
  for (const [host_id, shows] of hostCounts) {
    if (!topHost || shows > topHost.shows) topHost = {
      host_id,
      shows
    };
  }
  const showMinutes = /* @__PURE__ */ new Map();
  (schedules ?? []).forEach((s) => {
    if (s.status === "completed" && s.starts_at && s.ends_at) {
      const mins = Math.max(0, (new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / 6e4);
      showMinutes.set(s.title, (showMinutes.get(s.title) ?? 0) + mins);
    }
  });
  let topShow = null;
  for (const [title, minutes] of showMinutes) {
    if (!topShow || minutes > topShow.minutes) topShow = {
      title,
      minutes: Math.round(minutes)
    };
  }
  const hourBuckets = /* @__PURE__ */ new Map();
  (states ?? []).forEach((st) => {
    if (st.started_at && st.listener_count) {
      const h = new Date(st.started_at).getUTCHours();
      hourBuckets.set(h, (hourBuckets.get(h) ?? 0) + st.listener_count);
    }
  });
  let peakHour = null;
  for (const [hour, listeners] of hourBuckets) {
    if (!peakHour || listeners > peakHour.listeners) peakHour = {
      hour,
      listeners
    };
  }
  let mostActiveWidget = null;
  (states ?? []).forEach((st) => {
    const info = widgetMap.get(st.widget_id);
    if (!info) return;
    const candidate = {
      widget_id: st.widget_id,
      name: info.name,
      listeners: st.listener_count ?? 0
    };
    if (!mostActiveWidget || candidate.listeners > mostActiveWidget.listeners) {
      mostActiveWidget = candidate;
    }
  });
  const trackCounts = /* @__PURE__ */ new Map();
  (tracks ?? []).forEach((t) => {
    if (!t.youtube_id) return;
    const cur = trackCounts.get(t.youtube_id);
    if (cur) cur.count += 1;
    else trackCounts.set(t.youtube_id, {
      title: t.title,
      count: 1
    });
  });
  let mostPlayedTrack = null;
  for (const [youtube_id, v] of trackCounts) {
    if (!mostPlayedTrack || v.count > mostPlayedTrack.plays) {
      mostPlayedTrack = {
        youtube_id,
        title: v.title,
        plays: v.count
      };
    }
  }
  return {
    topHost,
    topShow,
    peakHour,
    mostActiveWidget,
    mostPlayedTrack
  };
});
export {
  addQueueItem_createServerFn_handler,
  cancelSchedule_createServerFn_handler,
  clearQueue_createServerFn_handler,
  createAnnouncement_createServerFn_handler,
  createSchedule_createServerFn_handler,
  createWidget_createServerFn_handler,
  deleteAnnouncement_createServerFn_handler,
  deleteWidget_createServerFn_handler,
  endLive_createServerFn_handler,
  getBroadcasterAccess_createServerFn_handler,
  getBroadcasterAnalytics_createServerFn_handler,
  getBroadcasterSettings_createServerFn_handler,
  goLive_createServerFn_handler,
  listAnnouncements_createServerFn_handler,
  listQueue_createServerFn_handler,
  listSchedules_createServerFn_handler,
  listWidgets_createServerFn_handler,
  markPlayed_createServerFn_handler,
  removeQueueItem_createServerFn_handler,
  setMic_createServerFn_handler,
  updateAnnouncement_createServerFn_handler,
  updateBroadcasterSettings_createServerFn_handler,
  updateNowPlaying_createServerFn_handler,
  updateWidget_createServerFn_handler
};
