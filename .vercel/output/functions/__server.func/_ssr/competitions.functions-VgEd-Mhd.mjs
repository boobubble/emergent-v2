import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
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
async function publicClient() {
  const {
    createClient
  } = await import("../_libs/supabase__supabase-js.mjs");
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
const listCategories_createServerFn_handler = createServerRpc({
  id: "10837395931819b4968c5c177b7389eea9e6ef6501fea90c15527f7eeb6b79d5",
  name: "listCategories",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => listCategories.__executeServer(opts));
const listCategories = createServerFn({
  method: "GET"
}).handler(listCategories_createServerFn_handler, async () => {
  const sb = await publicClient();
  const {
    data,
    error
  } = await sb.from("competition_categories").select("*").order("sort_order", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const listCompetitions_createServerFn_handler = createServerRpc({
  id: "26c765280b7987e38b0f057b44593f0f39c1333d222bd0c12c07c34821cffd99",
  name: "listCompetitions",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => listCompetitions.__executeServer(opts));
const listCompetitions = createServerFn({
  method: "GET"
}).handler(listCompetitions_createServerFn_handler, async () => {
  const sb = await publicClient();
  const {
    data,
    error
  } = await sb.from("competitions").select("*, category:competition_categories(id,name,slug,color,icon_url)").neq("status", "draft").eq("is_published", true).order("start_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
const adminListAllCompetitions_createServerFn_handler = createServerRpc({
  id: "78b9f89619ab5157fb3a33f4a2fb9acf6c988b7bd629328770f57b85ed0d86bd",
  name: "adminListAllCompetitions",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminListAllCompetitions.__executeServer(opts));
const adminListAllCompetitions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).handler(adminListAllCompetitions_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    data,
    error
  } = await context.supabase.from("competitions").select("*, category:competition_categories(id,name,slug,color,icon_url)").order("start_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return data ?? [];
});
async function fetchCompetitionCore(sb, filter) {
  let q = sb.from("competitions").select("*, category:competition_categories(id,name,slug,color,icon_url)");
  if (filter.id) q = q.eq("id", filter.id);
  else if (filter.slug) q = q.eq("slug", filter.slug);
  const {
    data: comp,
    error
  } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  if (!comp) return null;
  const [{
    data: participants
  }, {
    data: awards
  }, {
    data: competitors
  }] = await Promise.all([sb.from("competition_participants").select("id,user_id,status,vote_count,rank,joined_at, profile:profiles(id,username,avatar_url,avatar_color)").eq("competition_id", comp.id).order("vote_count", {
    ascending: false
  }), sb.from("competition_awards").select("*, profile:profiles(id,username,avatar_url,avatar_color)").eq("competition_id", comp.id).order("place", {
    ascending: true
  }), sb.from("competition_competitors").select("*, linked_profile:profiles!competition_competitors_linked_user_id_fkey(id,username,avatar_url,avatar_color)").eq("competition_id", comp.id).order("sort_order", {
    ascending: true
  })]);
  return {
    competition: comp,
    participants: participants ?? [],
    awards: awards ?? [],
    competitors: competitors ?? []
  };
}
const getCompetition_createServerFn_handler = createServerRpc({
  id: "653f1d4b502df1b2adf9ecc6e722a4afbdb39206420351ad3fd62a51db5b8bff",
  name: "getCompetition",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getCompetition.__executeServer(opts));
const getCompetition = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(getCompetition_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  return fetchCompetitionCore(sb, {
    id: data.id
  });
});
const getCompetitionBySlug_createServerFn_handler = createServerRpc({
  id: "a43f87bd484ddaa960a1d7258d79c82c093e20960bf1438be9b15c35bbfae58e",
  name: "getCompetitionBySlug",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getCompetitionBySlug.__executeServer(opts));
const getCompetitionBySlug = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(getCompetitionBySlug_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const normalized = (data.slug ?? "").trim().replace(/\s+/g, "-");
  return fetchCompetitionCore(sb, {
    slug: normalized
  });
});
const listRelatedCompetitions_createServerFn_handler = createServerRpc({
  id: "0b408d55c934ffdaada6af19b5f80aa2f3f34c5e3d0ed792d18216f399f3d468",
  name: "listRelatedCompetitions",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => listRelatedCompetitions.__executeServer(opts));
const listRelatedCompetitions = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(listRelatedCompetitions_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const limit = data.limit ?? 6;
  let q = sb.from("competitions").select("*, category:competition_categories(id,name,slug,color,icon_url)").neq("id", data.competitionId).neq("status", "draft").eq("is_published", true).order("start_at", {
    ascending: false
  }).limit(limit);
  if (data.categoryId) q = q.eq("category_id", data.categoryId);
  const {
    data: rows
  } = await q;
  return rows ?? [];
});
const incrementCompetitionViews_createServerFn_handler = createServerRpc({
  id: "6bddbf6498cedd14911117bd11a61a4652d2fdf1aa664fba111eddfb19dd2b6b",
  name: "incrementCompetitionViews",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => incrementCompetitionViews.__executeServer(opts));
const incrementCompetitionViews = createServerFn({
  method: "POST"
}).middleware([withRateLimit("competition.write")]).inputValidator((data) => data).handler(incrementCompetitionViews_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  await sb.rpc("increment_competition_views", {
    _competition: data.competitionId
  });
  return {
    ok: true
  };
});
const listCompetitors_createServerFn_handler = createServerRpc({
  id: "ba883a1693559ad198909b50bd15941a250a0bde2ac8af83891fb0bb74540a6b",
  name: "listCompetitors",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => listCompetitors.__executeServer(opts));
const listCompetitors = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(listCompetitors_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const {
    data: rows,
    error
  } = await sb.from("competition_competitors").select("*, linked_profile:profiles!competition_competitors_linked_user_id_fkey(id,username,avatar_url,avatar_color)").eq("competition_id", data.competitionId).order("sort_order", {
    ascending: true
  });
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const adminSaveCompetitor_createServerFn_handler = createServerRpc({
  id: "10be1b4c1eb135c728b7f4f9185f4fe37b16e37363eeb2e52de6b97cf93482fe",
  name: "adminSaveCompetitor",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminSaveCompetitor.__executeServer(opts));
const adminSaveCompetitor = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminSaveCompetitor_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const sb = context.supabase;
  const linkedUserId = data.linked_user_id ?? null;
  if (!linkedUserId) {
    throw new Error("Select a registered member to add as a nominee.");
  }
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: profile,
    error: profErr
  } = await supabaseAdmin.from("profiles").select("id, username, display_name, avatar_url").eq("id", linkedUserId).maybeSingle();
  if (profErr) throw new Error(profErr.message);
  if (!profile) throw new Error("This user is not registered and cannot be a nominee.");
  const {
    data: activeBan
  } = await supabaseAdmin.from("user_bans").select("id, expires_at").eq("user_id", linkedUserId).eq("active", true).maybeSingle();
  if (activeBan && (!activeBan.expires_at || new Date(activeBan.expires_at) > /* @__PURE__ */ new Date())) {
    throw new Error("This user is banned and is not eligible for competitions.");
  }
  const dupQ = supabaseAdmin.from("competition_competitors").select("id").eq("competition_id", data.competition_id).eq("linked_user_id", linkedUserId).limit(1);
  const {
    data: dupRows,
    error: dupErr
  } = await dupQ;
  if (dupErr) throw new Error(dupErr.message);
  const duplicate = (dupRows ?? []).find((r) => r.id !== data.id);
  if (duplicate) {
    throw new Error("This member is already a nominee in this competition.");
  }
  const resolvedName = data.name?.trim() || profile.display_name || profile.username || "Nominee";
  const payload = {
    competition_id: data.competition_id,
    name: resolvedName,
    photo_url: data.photo_url ?? profile.avatar_url ?? null,
    cover_image_url: data.cover_image_url ?? null,
    description: data.description ?? null,
    linked_user_id: linkedUserId,
    country: data.country?.trim() || null,
    website: data.website?.trim() || null,
    social_links: data.social_links ?? {},
    is_featured: !!data.is_featured,
    is_pinned: !!data.is_pinned
  };
  if (typeof data.sort_order === "number") payload.sort_order = data.sort_order;
  if (data.id) {
    const {
      error: error2
    } = await sb.from("competition_competitors").update(payload).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await sb.from("competition_competitors").insert(payload).select("id").single();
  if (error) throw new Error(error.message);
  return {
    ok: true,
    id: row.id
  };
});
const adminDeleteCompetitor_createServerFn_handler = createServerRpc({
  id: "0539b94cb726201d4ae2fa410f04fb9e3bfff2e2c497f915805328b663e2f28c",
  name: "adminDeleteCompetitor",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminDeleteCompetitor.__executeServer(opts));
const adminDeleteCompetitor = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminDeleteCompetitor_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.from("competition_competitors").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminReorderCompetitors_createServerFn_handler = createServerRpc({
  id: "595ad05b7e1652f84e21e0d924581d342619c5a604e71c3ff879f6094f9ad5fb",
  name: "adminReorderCompetitors",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminReorderCompetitors.__executeServer(opts));
const adminReorderCompetitors = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminReorderCompetitors_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  for (const o of data.orders) {
    await context.supabase.from("competition_competitors").update({
      sort_order: o.sort_order
    }).eq("id", o.id);
  }
  return {
    ok: true
  };
});
const adminSearchProfiles_createServerFn_handler = createServerRpc({
  id: "8011088df585c59eb9f4487da85843ef5db6a19c5a197ccc3fdcb3253759184c",
  name: "adminSearchProfiles",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminSearchProfiles.__executeServer(opts));
const adminSearchProfiles = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminSearchProfiles_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const q = (data.query ?? "").trim();
  if (q.length < 2) return [];
  const limit = Math.min(Math.max(data.limit ?? 10, 1), 25);
  const like = `%${q.replace(/[%_]/g, "")}%`;
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("profiles").select("id, username, display_name, avatar_url, avatar_color, is_verified").or(`username.ilike.${like},display_name.ilike.${like}`).limit(limit);
  if (error) throw new Error(error.message);
  return (rows ?? []).map((row) => ({
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    avatar_color: row.avatar_color,
    verified: !!row.is_verified
  }));
});
async function emitGam(sb, userId, event, metadata = {}, amount = 1) {
  try {
    await sb.rpc("gam_emit", {
      _user_id: userId,
      _event_type: event,
      _amount: amount,
      _metadata: metadata
    });
  } catch {
  }
}
const followCompetition_createServerFn_handler = createServerRpc({
  id: "a9c9b42eac63b94a853b1d8ed974479894665b78b67824dac8984ecf73993b12",
  name: "followCompetition",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => followCompetition.__executeServer(opts));
const followCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(followCompetition_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    error
  } = await context.supabase.from("competition_follows").upsert({
    user_id: context.userId,
    competition_id: data.competitionId
  }, {
    onConflict: "user_id,competition_id"
  });
  if (error) throw new Error(error.message);
  await emitGam(context.supabase, context.userId, "competition_follow", {
    competition_id: data.competitionId
  });
  return {
    ok: true
  };
});
const unfollowCompetition_createServerFn_handler = createServerRpc({
  id: "db33524fd42a975603b13e27b6d69ac2055a96784e66d23609a047fef3f5e764",
  name: "unfollowCompetition",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => unfollowCompetition.__executeServer(opts));
const unfollowCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(unfollowCompetition_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    error
  } = await context.supabase.from("competition_follows").delete().eq("user_id", context.userId).eq("competition_id", data.competitionId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMyCompetitionFollow_createServerFn_handler = createServerRpc({
  id: "08b0271d303155eee7c45c27e9dcbfe353c92c2307fb5a234e3148ba8e96031d",
  name: "getMyCompetitionFollow",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getMyCompetitionFollow.__executeServer(opts));
const getMyCompetitionFollow = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(getMyCompetitionFollow_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: row
  } = await context.supabase.from("competition_follows").select("competition_id").eq("user_id", context.userId).eq("competition_id", data.competitionId).maybeSingle();
  return {
    following: !!row
  };
});
const getCompetitionFollowerCount_createServerFn_handler = createServerRpc({
  id: "77da0a6e1279530d98ff0fedd0e5cec7a821da83c9d18e2b2cc9d4bdca187a56",
  name: "getCompetitionFollowerCount",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getCompetitionFollowerCount.__executeServer(opts));
const getCompetitionFollowerCount = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(getCompetitionFollowerCount_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const {
    data: count,
    error
  } = await sb.rpc("get_competition_follower_count", {
    _competition_id: data.competitionId
  });
  if (error) throw new Error(error.message);
  return {
    count: typeof count === "number" ? count : Number(count ?? 0)
  };
});
const voteForCompetitor_createServerFn_handler = createServerRpc({
  id: "ef6f958b166801e907900045fbc260dc1f2036fcddbf97ace2ccb13bd8bfac39",
  name: "voteForCompetitor",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => voteForCompetitor.__executeServer(opts));
const voteForCompetitor = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(voteForCompetitor_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await supabase.from("competition_competitor_votes").delete().eq("competition_id", data.competitionId).eq("voter_id", userId);
  const {
    error
  } = await supabase.from("competition_competitor_votes").insert({
    competition_id: data.competitionId,
    competitor_id: data.competitorId,
    voter_id: userId
  });
  if (error) throw new Error(error.message);
  await emitGam(supabase, userId, "competition_vote", {
    competition_id: data.competitionId,
    competitor_id: data.competitorId
  });
  return {
    ok: true
  };
});
const shareCompetition_createServerFn_handler = createServerRpc({
  id: "9d26fd85eb7061d5730f44b58749eb4653a2669809aac11db701b4a4f5748572",
  name: "shareCompetition",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => shareCompetition.__executeServer(opts));
const shareCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(shareCompetition_createServerFn_handler, async ({
  data,
  context
}) => {
  await emitGam(context.supabase, context.userId, "competition_share", {
    competition_id: data.competitionId,
    channel: data.channel ?? "link"
  });
  return {
    ok: true
  };
});
const getMyCompetitorVote_createServerFn_handler = createServerRpc({
  id: "dc3dc44493f17d509094b6c748c6841c68919188cd2f82050cac428ac5611453",
  name: "getMyCompetitorVote",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getMyCompetitorVote.__executeServer(opts));
const getMyCompetitorVote = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(getMyCompetitorVote_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: r
  } = await context.supabase.from("competition_competitor_votes").select("competitor_id").eq("competition_id", data.competitionId).eq("voter_id", context.userId).maybeSingle();
  return {
    competitorId: r?.competitor_id ?? null
  };
});
const listRecentCompetitionVoters_createServerFn_handler = createServerRpc({
  id: "61c6ff43dab665c542bc08750f1f6111fd2dd2692a3d08c2570042ab710c287f",
  name: "listRecentCompetitionVoters",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => listRecentCompetitionVoters.__executeServer(opts));
const listRecentCompetitionVoters = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(listRecentCompetitionVoters_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const {
    data: rows,
    error
  } = await sb.rpc("list_recent_competition_voters", {
    _competition_id: data.competitionId,
    _limit: data.limit ?? 30
  });
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const getUserAchievements_createServerFn_handler = createServerRpc({
  id: "76635cb41ab2c756ba55db0f0545f3853b07746f9eabbe6e155f8f503615fb3d",
  name: "getUserAchievements",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getUserAchievements.__executeServer(opts));
const getUserAchievements = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(getUserAchievements_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const {
    data: awards
  } = await sb.from("competition_awards").select("*, competition:competitions(id,name,slug,banner_url), category:competitions(category:competition_categories(name,slug,color))").eq("user_id", data.userId).order("awarded_at", {
    ascending: false
  });
  const {
    data: totals
  } = await sb.rpc("user_competition_achievements", {
    _user: data.userId
  });
  const t = Array.isArray(totals) ? totals[0] : totals;
  return {
    awards: awards ?? [],
    total_wins: t?.total_wins ?? 0,
    total_joined: t?.total_joined ?? 0,
    live_count: t?.live_count ?? 0
  };
});
const getLeaderboard_createServerFn_handler = createServerRpc({
  id: "eace701c619a302cb6a046782813dcc165bf42a7c2b2eb14bc4721174877222b",
  name: "getLeaderboard",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getLeaderboard.__executeServer(opts));
const getLeaderboard = createServerFn({
  method: "GET"
}).inputValidator((data = {}) => data).handler(getLeaderboard_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const range = data.range ?? "all";
  let since = null;
  if (range === "week") since = new Date(Date.now() - 7 * 864e5).toISOString();
  else if (range === "month") since = new Date(Date.now() - 30 * 864e5).toISOString();
  let awardsQ = sb.from("competition_awards").select("user_id");
  if (since) awardsQ = awardsQ.gte("awarded_at", since);
  const {
    data: awardsRows
  } = await awardsQ;
  const winCounts = /* @__PURE__ */ new Map();
  (awardsRows ?? []).forEach((r) => winCounts.set(r.user_id, (winCounts.get(r.user_id) ?? 0) + 1));
  const {
    data: participants
  } = await sb.from("competition_participants").select("user_id, vote_count");
  const votes = /* @__PURE__ */ new Map();
  const joins = /* @__PURE__ */ new Map();
  (participants ?? []).forEach((r) => {
    votes.set(r.user_id, (votes.get(r.user_id) ?? 0) + (r.vote_count ?? 0));
    joins.set(r.user_id, (joins.get(r.user_id) ?? 0) + 1);
  });
  const allIds = Array.from(/* @__PURE__ */ new Set([...winCounts.keys(), ...votes.keys(), ...joins.keys()]));
  if (allIds.length === 0) return {
    wins: [],
    votes: [],
    joins: []
  };
  const {
    data: profiles
  } = await sb.from("profiles").select("id,username,avatar_url,avatar_color").in("id", allIds);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const shape = (m) => Array.from(m.entries()).map(([user_id, count]) => ({
    user_id,
    count,
    profile: pmap.get(user_id)
  })).sort((a, b) => b.count - a.count).slice(0, 25);
  return {
    wins: shape(winCounts),
    votes: shape(votes),
    joins: shape(joins)
  };
});
const joinCompetition_createServerFn_handler = createServerRpc({
  id: "f520b38f064f1ae87c82f62d6b468c4e5acc9bc893fcf820bc76bfb7350a941b",
  name: "joinCompetition",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => joinCompetition.__executeServer(opts));
const joinCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(joinCompetition_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: comp,
    error: cErr
  } = await supabase.from("competitions").select("id,status,require_approval").eq("id", data.competitionId).maybeSingle();
  if (cErr) throw new Error(cErr.message);
  if (!comp) throw new Error("Competition not found");
  if (!["upcoming", "live"].includes(comp.status)) throw new Error("Cannot join right now");
  const {
    error
  } = await supabase.from("competition_participants").insert({
    competition_id: data.competitionId,
    user_id: userId,
    status: comp.require_approval ? "pending" : "approved"
  });
  if (error) throw new Error(error.message);
  await emitGam(supabase, userId, "competition_join", {
    competition_id: data.competitionId
  });
  return {
    ok: true
  };
});
const leaveCompetition_createServerFn_handler = createServerRpc({
  id: "c0af6546ecab321a145c58ff9d965ec338948ecd50e71b1cb8b448afe32d6bc6",
  name: "leaveCompetition",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => leaveCompetition.__executeServer(opts));
const leaveCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(leaveCompetition_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("competition_participants").delete().eq("competition_id", data.competitionId).eq("user_id", userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const castVote_createServerFn_handler = createServerRpc({
  id: "4b3d96eaa4e18acf2fb33ceb07bb738b44c5be19c719b06708d5ceba4835b42d",
  name: "castVote",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => castVote.__executeServer(opts));
const castVote = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(castVote_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.rpc("cast_competition_vote", {
    _competition: data.competitionId,
    _participant: data.participantId
  });
  if (error) throw new Error(error.message);
  await emitGam(supabase, userId, "competition_vote", {
    competition_id: data.competitionId,
    participant_id: data.participantId
  });
  return {
    ok: true
  };
});
const getMyVote_createServerFn_handler = createServerRpc({
  id: "34243e19ec785b74a62feecab62c74c0c534df7ac7a2cd0a98ccb6633bdc7aa8",
  name: "getMyVote",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getMyVote.__executeServer(opts));
const getMyVote = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(getMyVote_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase
  } = context;
  const {
    data: r
  } = await supabase.rpc("my_competition_vote", {
    _competition: data.competitionId
  });
  return {
    participantId: r ?? null
  };
});
async function assertAdmin(supabase, userId) {
  const [{
    data: isAdmin
  }, {
    data: isSuper
  }] = await Promise.all([supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin"
  }), supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin"
  })]);
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}
const adminSaveCategory_createServerFn_handler = createServerRpc({
  id: "86359257d147e653e646578ea9455c194201e31bb8107c939f4533f37bedab9e",
  name: "adminSaveCategory",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminSaveCategory.__executeServer(opts));
const adminSaveCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminSaveCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const payload = {
    ...data
  };
  if (data.id) {
    const {
      id,
      ...rest
    } = payload;
    const {
      error
    } = await context.supabase.from("competition_categories").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await context.supabase.from("competition_categories").insert(payload);
    if (error) throw new Error(error.message);
  }
  return {
    ok: true
  };
});
const adminDeleteCategory_createServerFn_handler = createServerRpc({
  id: "99422995c9bcbf88cfea9007c1e0f46ed3e60792d1e3b95f7156040e4fdd3453",
  name: "adminDeleteCategory",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminDeleteCategory.__executeServer(opts));
const adminDeleteCategory = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminDeleteCategory_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.from("competition_categories").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminSaveCompetition_createServerFn_handler = createServerRpc({
  id: "b2736948b3ed9320e7a99f4b6a35366a43c754613a28e2d9db81b477564db6ef",
  name: "adminSaveCompetition",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminSaveCompetition.__executeServer(opts));
const adminSaveCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminSaveCompetition_createServerFn_handler, async ({
  data,
  context
}) => {
  let allowed = false;
  try {
    await assertAdmin(context.supabase, context.userId);
    allowed = true;
  } catch {
  }
  if (!allowed && data.community_id) {
    const {
      data: comm
    } = await context.supabase.from("communities").select("owner_id").eq("id", data.community_id).maybeSingle();
    if (comm?.owner_id === context.userId) allowed = true;
  }
  if (!allowed) throw new Error("Forbidden");
  const sb = context.supabase;
  const {
    id: _id,
    category: _category,
    total_participants: _tp,
    total_votes: _tv,
    created_by: _cb,
    created_at: _ca,
    updated_at: _ua,
    ...clean
  } = data;
  if (data.category_id && data.status !== "draft" && data.status !== "completed") {
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    let conflictQ = sb.from("competitions").select("id, name, end_at, status").eq("category_id", data.category_id).in("status", ["live", "upcoming"]).gt("end_at", nowIso).limit(1);
    if (data.id) conflictQ = conflictQ.neq("id", data.id);
    const {
      data: conflict,
      error: cErr
    } = await conflictQ;
    if (cErr) throw new Error(cErr.message);
    if (conflict && conflict.length > 0) {
      throw new Error(`A competition ("${conflict[0].name}") is already running in this category. Wait for it to end or mark it completed before creating another.`);
    }
  }
  if (data.status === "live" && data.id) {
    const {
      count,
      error: nErr
    } = await sb.from("competition_competitors").select("id", {
      count: "exact",
      head: true
    }).eq("competition_id", data.id);
    if (nErr) throw new Error(nErr.message);
    if (!count || count < 1) {
      throw new Error("Add at least one nominee before setting this competition to live.");
    }
  } else if (data.status === "live" && !data.id) {
    throw new Error("Create the competition as draft or upcoming first, add at least one nominee, then set it to live.");
  }
  if (data.id) {
    const {
      error: error2
    } = await sb.from("competitions").update(clean).eq("id", data.id);
    if (error2) throw new Error(error2.message);
    return {
      ok: true,
      id: data.id
    };
  }
  const {
    data: row,
    error
  } = await sb.from("competitions").insert({
    ...clean,
    created_by: context.userId
  }).select("id").single();
  if (error) throw new Error(error.message);
  if (data.status !== "draft") {
    try {
      const {
        supabaseAdmin
      } = await import("./client.server-BXCYxJZY.mjs");
      let origin = "";
      try {
        const {
          getRequestUrl
        } = await import("./server-CzVoVXQ0.mjs");
        const u = getRequestUrl({
          xForwardedHost: true
        });
        origin = u.origin;
      } catch {
      }
      if (!origin) origin = process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "";
      const compPath = `/competitions/${data.slug}`;
      const compUrl = origin ? `${origin}${compPath}` : compPath;
      const media = data.banner_url ? [data.banner_url] : [];
      const desc = (data.description ?? "").trim();
      const text = `🏆 New competition: ${data.name}

${desc ? desc + "\n\n" : ""}Join now and compete for the top spot!

🔗 ${compUrl}`;
      const baseSlug = `competition-${data.slug}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60);
      const slug = `${baseSlug}-${row.id.slice(0, 8)}`;
      await supabaseAdmin.from("posts").insert({
        author_id: context.userId,
        owner_id: context.userId,
        kind: "text",
        text,
        slug,
        media_urls: media,
        privacy: "public",
        hashtags: ["competition", data.slug].filter(Boolean)
      });
    } catch (e) {
      console.error("competition auto-post failed", e);
    }
  }
  return {
    ok: true,
    id: row.id
  };
});
const adminDeleteCompetition_createServerFn_handler = createServerRpc({
  id: "cd24889e1cff60a3809a2fe89436a43d2a22dd5403857be445005f5c066600ef",
  name: "adminDeleteCompetition",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminDeleteCompetition.__executeServer(opts));
const adminDeleteCompetition = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminDeleteCompetition_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.from("competitions").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminBulkSetEntryMode_createServerFn_handler = createServerRpc({
  id: "d4a5497fdbf8b0d2e1be330c9f05158da004d5c46a0fa7d176893580e611c32f",
  name: "adminBulkSetEntryMode",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminBulkSetEntryMode.__executeServer(opts));
const adminBulkSetEntryMode = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminBulkSetEntryMode_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const patch = {
    entry_mode: data.entry_mode
  };
  if (data.entry_mode === "manual") {
    patch.qualification_method = null;
  } else if (data.qualification_method !== void 0) {
    patch.qualification_method = data.qualification_method ?? "top_n_week";
  }
  const sb = context.supabase;
  let q = sb.from("competitions").update(patch);
  if (data.category_id) q = q.eq("category_id", data.category_id);
  if (data.only_manual) q = q.eq("entry_mode", "manual");
  const {
    data: rows,
    error
  } = await q.select("id");
  if (error) throw new Error(error.message);
  return {
    ok: true,
    updated: Array.isArray(rows) ? rows.length : 0
  };
});
const adminSetParticipantStatus_createServerFn_handler = createServerRpc({
  id: "67216e73a18356a1bb41acd21336112d169c9ae445b21f2f7d4e38b325a5e0eb",
  name: "adminSetParticipantStatus",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminSetParticipantStatus.__executeServer(opts));
const adminSetParticipantStatus = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminSetParticipantStatus_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.from("competition_participants").update({
    status: data.status
  }).eq("id", data.participantId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminFinalizeWinners_createServerFn_handler = createServerRpc({
  id: "74af30525be26f350d5455bd701139d4616bac3490c4f61e98c74f75884fecf9",
  name: "adminFinalizeWinners",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminFinalizeWinners.__executeServer(opts));
const adminFinalizeWinners = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminFinalizeWinners_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    data: comp
  } = await context.supabase.from("competitions").select("*").eq("id", data.competitionId).maybeSingle();
  if (!comp) throw new Error("Not found");
  const {
    data: top
  } = await context.supabase.from("competition_participants").select("id,user_id,vote_count").eq("competition_id", data.competitionId).eq("status", "approved").order("vote_count", {
    ascending: false
  }).limit(Math.max(comp.winner_count ?? 1, 1));
  if (!top || top.length === 0) throw new Error("No participants to award");
  const rows = top.map((p, i) => ({
    competition_id: data.competitionId,
    participant_id: p.id,
    user_id: p.user_id,
    place: i + 1,
    badge_label: `${comp.name} Winner`,
    rewards: comp.rewards ?? {}
  }));
  const {
    error
  } = await context.supabase.from("competition_awards").upsert(rows, {
    onConflict: "competition_id,place"
  });
  if (error) throw new Error(error.message);
  await context.supabase.from("competitions").update({
    status: "completed"
  }).eq("id", data.competitionId);
  const coins = Number(comp.rewards?.coins ?? 0);
  if (coins > 0) {
    const {
      supabaseAdmin
    } = await import("./client.server-BXCYxJZY.mjs");
    for (const r of rows) {
      await supabaseAdmin.rpc("has_role", {
        _user_id: r.user_id,
        _role: "admin"
      });
      await supabaseAdmin.from("coin_transactions").insert({
        user_id: r.user_id,
        kind: "coins",
        amount: coins,
        reason: `competition_win:${comp.slug}`,
        ref_type: "competition",
        ref_id: data.competitionId
      });
      await supabaseAdmin.rpc("has_role", {
        _user_id: r.user_id,
        _role: "admin"
      });
      await supabaseAdmin.from("profiles").update({
        coins
      }).eq("id", r.user_id).select();
    }
  }
  const notifRows = rows.map((r) => ({
    user_id: r.user_id,
    actor_id: context.userId,
    kind: "competition_win",
    target_type: "competition",
    target_id: data.competitionId,
    payload: {
      name: comp.name,
      place: r.place
    }
  }));
  if (notifRows.length) await context.supabase.from("notifications").insert(notifRows);
  const {
    supabaseAdmin: adminSb
  } = await import("./client.server-BXCYxJZY.mjs");
  for (const r of rows) {
    const event = r.place === 1 ? "competition_win_1st" : r.place === 2 ? "competition_win_2nd" : r.place === 3 ? "competition_win_3rd" : "competition_win";
    try {
      await adminSb.rpc("gam_emit", {
        _user_id: r.user_id,
        _event_type: event,
        _amount: 1,
        _metadata: {
          competition_id: data.competitionId,
          name: comp.name,
          place: r.place
        }
      });
    } catch {
    }
  }
  try {
    const {
      data: funPosts
    } = await context.supabase.from("posts_safe").select("id,author_id,category,reaction_count,comment_count,created_at").eq("competition_id", data.competitionId).in("category", ["meme", "fan_art", "poster", "fan_edit"]);
    const FUN_AWARD = {
      meme: {
        type: "meme_of_battle",
        label: "Meme of the Battle"
      },
      fan_art: {
        type: "fan_art_winner",
        label: "Fan Art Winner"
      },
      poster: {
        type: "best_campaign_poster",
        label: "Best Campaign Poster"
      },
      fan_edit: {
        type: "best_fan_edit",
        label: "Best Fan Edit"
      }
    };
    const bestPerCat = {};
    for (const p of funPosts ?? []) {
      const score = (p.reaction_count ?? 0) + (p.comment_count ?? 0);
      const cur = bestPerCat[p.category];
      const curScore = cur ? (cur.reaction_count ?? 0) + (cur.comment_count ?? 0) : -1;
      if (!cur || score > curScore) bestPerCat[p.category] = p;
    }
    const funRows = Object.entries(bestPerCat).filter(([, post]) => post && post.author_id).map(([cat, post]) => ({
      competition_id: data.competitionId,
      participant_id: null,
      user_id: post.author_id,
      place: 0,
      award_type: FUN_AWARD[cat].type,
      post_id: post.id,
      badge_label: `${comp.name} — ${FUN_AWARD[cat].label}`,
      rewards: {}
    }));
    if (funRows.length) {
      await context.supabase.from("competition_awards").upsert(funRows, {
        onConflict: "competition_id,award_type"
      });
    }
  } catch {
  }
  return {
    ok: true,
    winners: rows.length
  };
});
const adminSetCompetitorFlags_createServerFn_handler = createServerRpc({
  id: "a4202a91ef7ccc4c738667f039992f5fa1d59ff5fa89ef64af9d4fb5468159a0",
  name: "adminSetCompetitorFlags",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminSetCompetitorFlags.__executeServer(opts));
const adminSetCompetitorFlags = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminSetCompetitorFlags_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    id,
    ...patch
  } = data;
  const {
    error
  } = await context.supabase.from("competition_competitors").update(patch).eq("id", id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminListCompetitorVotes_createServerFn_handler = createServerRpc({
  id: "fffe27eb81fdad1290a2d5c3c0f5fa3616bb44aa6fcc3653c39be32db1c9e778",
  name: "adminListCompetitorVotes",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminListCompetitorVotes.__executeServer(opts));
const adminListCompetitorVotes = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminListCompetitorVotes_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    data: rows,
    error
  } = await context.supabase.from("competition_competitor_votes").select("id, created_at, voter_id, competitor_id").eq("competition_id", data.competitionId).order("created_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const voterIds = Array.from(new Set((rows ?? []).map((r) => r.voter_id)));
  const compIds = Array.from(new Set((rows ?? []).map((r) => r.competitor_id)));
  const [profRes, compRes] = await Promise.all([voterIds.length ? context.supabase.from("profiles").select("id,username,avatar_url").in("id", voterIds) : Promise.resolve({
    data: []
  }), compIds.length ? context.supabase.from("competition_competitors").select("id,name").in("id", compIds) : Promise.resolve({
    data: []
  })]);
  const pm = new Map((profRes.data ?? []).map((p) => [p.id, p]));
  const cm = new Map((compRes.data ?? []).map((c) => [c.id, c]));
  return (rows ?? []).map((r) => ({
    ...r,
    voter: pm.get(r.voter_id) ?? null,
    competitor: cm.get(r.competitor_id) ?? null
  }));
});
const adminDeleteCompetitorVote_createServerFn_handler = createServerRpc({
  id: "341756b338b55effeeb6939f2bf0aefe75dc21b7efbd3f2ab833ed4adee0305b",
  name: "adminDeleteCompetitorVote",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminDeleteCompetitorVote.__executeServer(opts));
const adminDeleteCompetitorVote = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminDeleteCompetitorVote_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.from("competition_competitor_votes").delete().eq("id", data.voteId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminResetCompetitionVotes_createServerFn_handler = createServerRpc({
  id: "360e6db0795dc401879ae9e90c9891f1ae0b2bb93b5beac7340ae4eaba4d4ae5",
  name: "adminResetCompetitionVotes",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminResetCompetitionVotes.__executeServer(opts));
const adminResetCompetitionVotes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminResetCompetitionVotes_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.rpc("admin_reset_competition_votes", {
    _competition: data.competitionId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminResetCompetitorVotes_createServerFn_handler = createServerRpc({
  id: "4fa3e28bf8c9ba3853703758f42ea6079d297883fce463d9dc4db225752a1655",
  name: "adminResetCompetitorVotes",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminResetCompetitorVotes.__executeServer(opts));
const adminResetCompetitorVotes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminResetCompetitorVotes_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    error
  } = await context.supabase.rpc("admin_reset_competitor_votes", {
    _competitor: data.competitorId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getCompetitionAnalytics_createServerFn_handler = createServerRpc({
  id: "32ade7380e32f91a0e296843fb9ea5f92dd41086e40482217158864f05945420",
  name: "getCompetitionAnalytics",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getCompetitionAnalytics.__executeServer(opts));
const getCompetitionAnalytics = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(getCompetitionAnalytics_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const {
    data: rows,
    error
  } = await sb.rpc("competition_analytics", {
    _competition: data.competitionId
  });
  if (error) throw new Error(error.message);
  const row = Array.isArray(rows) ? rows[0] : rows;
  return row ?? null;
});
const adminSetManualWinners_createServerFn_handler = createServerRpc({
  id: "3563fe4e025a0bc28e5aa82ad78908e0c844f4bc665d185a869cd3134706ce16",
  name: "adminSetManualWinners",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => adminSetManualWinners.__executeServer(opts));
const adminSetManualWinners = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).inputValidator((data) => data).handler(adminSetManualWinners_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.supabase, context.userId);
  const {
    data: comp
  } = await context.supabase.from("competitions").select("name,rewards,slug").eq("id", data.competitionId).maybeSingle();
  if (!comp) throw new Error("Not found");
  await context.supabase.from("competition_awards").delete().eq("competition_id", data.competitionId);
  const rows = data.winners.map((w) => ({
    competition_id: data.competitionId,
    participant_id: w.participant_id ?? null,
    user_id: w.user_id,
    place: w.place,
    badge_label: w.badge_label ?? `${comp.name} — #${w.place}`,
    rewards: comp.rewards ?? {}
  }));
  if (rows.length) {
    const {
      error
    } = await context.supabase.from("competition_awards").insert(rows);
    if (error) throw new Error(error.message);
  }
  if (data.markCompleted) {
    await context.supabase.from("competitions").update({
      status: "completed"
    }).eq("id", data.competitionId);
  }
  const {
    supabaseAdmin: adminSb2
  } = await import("./client.server-BXCYxJZY.mjs");
  for (const r of rows) {
    const event = r.place === 1 ? "competition_win_1st" : r.place === 2 ? "competition_win_2nd" : r.place === 3 ? "competition_win_3rd" : "competition_win";
    try {
      await adminSb2.rpc("gam_emit", {
        _user_id: r.user_id,
        _event_type: event,
        _amount: 1,
        _metadata: {
          competition_id: data.competitionId,
          name: comp.name,
          place: r.place,
          manual: true
        }
      });
    } catch {
    }
  }
  return {
    ok: true,
    winners: rows.length
  };
});
async function enrichCompetitions(sb, comps) {
  if (!comps.length) return [];
  const ids = comps.map((c) => c.id);
  const [{
    data: follows
  }, {
    data: competitors
  }] = await Promise.all([sb.from("competition_follows").select("competition_id").in("competition_id", ids), sb.from("competition_competitors").select("id, competition_id, name, photo_url, vote_count, is_hidden, is_disqualified, sort_order, linked_profile:profiles!competition_competitors_linked_user_id_fkey(is_verified)").in("competition_id", ids).order("vote_count", {
    ascending: false
  })]);
  const followMap = /* @__PURE__ */ new Map();
  (follows ?? []).forEach((f) => followMap.set(f.competition_id, (followMap.get(f.competition_id) ?? 0) + 1));
  const compMap = /* @__PURE__ */ new Map();
  (competitors ?? []).forEach((c) => {
    if (c.is_hidden || c.is_disqualified) return;
    const arr = compMap.get(c.competition_id) ?? [];
    if (arr.length < 3) arr.push(c);
    compMap.set(c.competition_id, arr);
  });
  return comps.map((c) => ({
    ...c,
    follower_count: followMap.get(c.id) ?? 0,
    top_competitors: (compMap.get(c.id) ?? []).map((x) => ({
      id: x.id,
      name: x.name,
      photo_url: x.photo_url,
      votes: x.vote_count ?? 0,
      is_verified: !!x.linked_profile?.is_verified
    }))
  }));
}
const listCompetitionsEnriched_createServerFn_handler = createServerRpc({
  id: "4fdc0c83bccea7836da5e0d9fd9c79c8accdf148503acb9b1ab4df36274d92a0",
  name: "listCompetitionsEnriched",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => listCompetitionsEnriched.__executeServer(opts));
const listCompetitionsEnriched = createServerFn({
  method: "GET"
}).inputValidator((d = {}) => d).handler(listCompetitionsEnriched_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  let q = sb.from("competitions").select("*, category:competition_categories(id,name,slug,color,icon_url)").neq("status", "draft").eq("is_published", true).order("start_at", {
    ascending: false
  });
  if (data?.communityId) q = q.eq("community_id", data.communityId);
  else q = q.is("community_id", null);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return enrichCompetitions(sb, rows ?? []);
});
const listMyFollowedCompetitions_createServerFn_handler = createServerRpc({
  id: "eeef740b2b4c6fe83d5df6b846a5af8e45db89fc19aaedc59ae22198a4e65f80",
  name: "listMyFollowedCompetitions",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => listMyFollowedCompetitions.__executeServer(opts));
const listMyFollowedCompetitions = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("competition.write")]).handler(listMyFollowedCompetitions_createServerFn_handler, async ({
  context
}) => {
  const {
    data: follows
  } = await context.supabase.from("competition_follows").select("competition_id").eq("user_id", context.userId);
  const ids = (follows ?? []).map((f) => f.competition_id);
  if (!ids.length) return [];
  const sb = await publicClient();
  const {
    data,
    error
  } = await sb.from("competitions").select("*, category:competition_categories(id,name,slug,color,icon_url)").in("id", ids).eq("is_published", true).order("start_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  return enrichCompetitions(sb, data ?? []);
});
const listHallOfFame_createServerFn_handler = createServerRpc({
  id: "09fb21adb033b1322c1a68aaa9d50d1635d097957446f0de8ec1a0bd2b662731",
  name: "listHallOfFame",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => listHallOfFame.__executeServer(opts));
const listHallOfFame = createServerFn({
  method: "GET"
}).inputValidator((data = {}) => data).handler(listHallOfFame_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const limit = Math.min(data.limit ?? 100, 200);
  const {
    data: awards,
    error
  } = await sb.from("competition_awards").select("id, place, badge_label, awarded_at, rewards, user_id, participant_id, competition:competitions(id,name,slug,banner_url,end_at,total_votes,total_participants,category:competition_categories(name,slug,color))").lte("place", 3).order("awarded_at", {
    ascending: false
  }).limit(limit);
  if (error) throw new Error(error.message);
  const rows = awards ?? [];
  const userIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));
  const partIds = Array.from(new Set(rows.map((r) => r.participant_id).filter(Boolean)));
  const [{
    data: profs
  }, {
    data: parts
  }] = await Promise.all([userIds.length ? sb.from("profiles").select("id,username,display_name,avatar_url,avatar_color,is_verified").in("id", userIds) : Promise.resolve({
    data: []
  }), partIds.length ? sb.from("competition_participants").select("id,vote_count,competition_id").in("id", partIds) : Promise.resolve({
    data: []
  })]);
  const pmap = new Map((profs.data ?? []).map((p) => [p.id, p]));
  const partMap = new Map((parts.data ?? []).map((p) => [p.id, p]));
  return rows.map((r) => {
    const part = partMap.get(r.participant_id);
    const totalVotes = r.competition?.total_votes ?? 0;
    const winningVotes = part?.vote_count ?? 0;
    return {
      id: r.id,
      place: r.place,
      badge_label: r.badge_label,
      awarded_at: r.awarded_at,
      rewards: r.rewards ?? {},
      competition: r.competition,
      profile: pmap.get(r.user_id) ?? null,
      winning_votes: winningVotes,
      winning_share: totalVotes > 0 ? winningVotes / totalVotes : 0
    };
  });
});
const getUserCompetitionShowcase_createServerFn_handler = createServerRpc({
  id: "81f88fb3f8b7494d5f3aac54a5e306586ba8c1ba7336194d4f0161713c9ef295",
  name: "getUserCompetitionShowcase",
  filename: "src/lib/competitions.functions.ts"
}, (opts) => getUserCompetitionShowcase.__executeServer(opts));
const getUserCompetitionShowcase = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(getUserCompetitionShowcase_createServerFn_handler, async ({
  data
}) => {
  const sb = await publicClient();
  const uname = (data.username ?? "").trim();
  if (!uname) throw new Error("username required");
  const {
    data: profile
  } = await sb.from("profiles").select("id,username,display_name,avatar_url,avatar_color,is_verified,country").ilike("username", uname).maybeSingle();
  if (!profile) return {
    profile: null
  };
  const uid = profile.id;
  const [awardsRes, participantsRes, competitorRowsRes, followedRes, coinsRes, xpEventsRes] = await Promise.all([sb.from("competition_awards").select("id, place, badge_label, awarded_at, participant_id, rewards, competition:competitions(id,name,slug,banner_url,end_at,status,category:competition_categories(name,slug,color))").eq("user_id", uid).order("awarded_at", {
    ascending: false
  }), sb.from("competition_participants").select("id, competition_id, vote_count, rank, joined_at, status, competition:competitions(id,name,slug,banner_url,status,end_at,start_at,is_featured,category:competition_categories(name,slug,color))").eq("user_id", uid).order("joined_at", {
    ascending: false
  }), sb.from("competition_competitors").select("id, name, competition_id, vote_count, is_featured, is_hidden, is_disqualified, photo_url, competition:competitions(id,name,slug,banner_url,status,end_at,start_at,is_featured,category:competition_categories(name,slug,color))").eq("linked_user_id", uid), sb.from("competition_follows").select("competition_id").eq("user_id", uid), sb.from("coin_transactions").select("amount, created_at, reason, ref_id").eq("user_id", uid).eq("ref_type", "competition"), sb.from("gam_event_log").select("event_type, amount, created_at, metadata").eq("user_id", uid).like("event_type", "competition_%").order("created_at", {
    ascending: false
  }).limit(200)]);
  const awards = awardsRes.data ?? [];
  const participants = participantsRes.data ?? [];
  const competitorRows = competitorRowsRes.data ?? [];
  const followed = followedRes.data ?? [];
  const coinTx = coinsRes.data ?? [];
  const xpEvents = xpEventsRes.data ?? [];
  const wins = awards.filter((a) => a.place === 1);
  const runnersUp = awards.filter((a) => a.place === 2);
  const thirds = awards.filter((a) => a.place === 3);
  const currentLive = competitorRows.filter((c) => !c.is_hidden && !c.is_disqualified && c.competition?.status === "live");
  const featuredNominee = competitorRows.filter((c) => c.is_featured);
  const votesReceived = participants.reduce((acc, p) => acc + (p.vote_count ?? 0), 0) + competitorRows.reduce((acc, c) => acc + (c.vote_count ?? 0), 0);
  const bestRank = participants.map((p) => p.rank).filter((r) => typeof r === "number" && r > 0).reduce((min, r) => min == null || r < min ? r : min, null);
  const nomineeCompIds = Array.from(new Set(competitorRows.map((c) => c.competition_id)));
  let followersEarned = 0;
  if (nomineeCompIds.length) {
    const {
      data: fRows
    } = await sb.from("competition_follows").select("competition_id").in("competition_id", nomineeCompIds);
    followersEarned = (fRows ?? []).length;
  }
  const coinsEarned = coinTx.reduce((acc, t) => acc + Math.max(0, Number(t.amount ?? 0)), 0);
  const xpEarned = xpEvents.reduce((acc, e) => acc + Math.max(0, Number(e.amount ?? 0)), 0);
  const timeline = [...awards.map((a) => ({
    kind: "award",
    at: a.awarded_at,
    place: a.place,
    badge_label: a.badge_label,
    competition: a.competition
  })), ...participants.slice(0, 30).map((p) => ({
    kind: "join",
    at: p.joined_at,
    vote_count: p.vote_count ?? 0,
    competition: p.competition
  }))].filter((t) => t.competition).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()).slice(0, 20);
  const recentActivity = xpEvents.slice(0, 12).map((e) => ({
    event_type: e.event_type,
    amount: e.amount,
    at: e.created_at,
    metadata: e.metadata ?? {}
  }));
  const badges = [];
  if (wins.length >= 1) badges.push({
    id: "champion",
    name: "Champion",
    emoji: "🏆",
    tint: "from-amber-400 to-yellow-500"
  });
  if (wins.length >= 5) badges.push({
    id: "legend",
    name: "Competition Legend",
    emoji: "👑",
    tint: "from-fuchsia-400 to-purple-600"
  });
  if (runnersUp.length >= 1) badges.push({
    id: "runner_up",
    name: "Runner Up",
    emoji: "🥈",
    tint: "from-slate-300 to-slate-400"
  });
  if (thirds.length >= 1) badges.push({
    id: "third",
    name: "Third Place",
    emoji: "🥉",
    tint: "from-orange-400 to-amber-600"
  });
  if (featuredNominee.length >= 1) badges.push({
    id: "featured_nominee",
    name: "Featured Nominee",
    emoji: "⭐",
    tint: "from-amber-300 to-orange-400"
  });
  if (votesReceived >= 100) badges.push({
    id: "top_100_votes",
    name: "Top 100 Votes",
    emoji: "🏅",
    tint: "from-emerald-300 to-teal-500"
  });
  if (votesReceived >= 1e3) badges.push({
    id: "top_1k_votes",
    name: "Top 1000 Votes",
    emoji: "🏅",
    tint: "from-cyan-300 to-blue-500"
  });
  if (participants.length >= 10 || competitorRows.length >= 10) badges.push({
    id: "most_active",
    name: "Most Active Competitor",
    emoji: "🎖",
    tint: "from-purple-300 to-pink-400"
  });
  if (followersEarned >= 500) badges.push({
    id: "fan_favorite",
    name: "Fan Favorite",
    emoji: "🔥",
    tint: "from-rose-400 to-red-500"
  });
  if (followersEarned >= 100 && wins.length === 0) badges.push({
    id: "rising_star",
    name: "Rising Star",
    emoji: "⚡",
    tint: "from-yellow-300 to-amber-400"
  });
  if (profile.country) badges.push({
    id: "international",
    name: "International",
    emoji: "🌍",
    tint: "from-blue-300 to-indigo-500"
  });
  const showcase = [];
  if (wins[0]) showcase.push({
    label: `Champion — ${wins[0].competition?.name ?? "Competition"}`,
    emoji: "👑",
    competition: wins[0].competition
  });
  if (runnersUp[0]) showcase.push({
    label: `Runner Up — ${runnersUp[0].competition?.name ?? "Competition"}`,
    emoji: "🥈",
    competition: runnersUp[0].competition
  });
  if (currentLive[0]) showcase.push({
    label: "Currently Competing",
    emoji: "🔥",
    competition: currentLive[0].competition,
    extra: `${currentLive[0].vote_count ?? 0} votes`
  });
  if (featuredNominee[0]) showcase.push({
    label: "Fan Favorite",
    emoji: "⭐",
    competition: featuredNominee[0].competition
  });
  return {
    profile,
    totals: {
      joined: participants.length + competitorRows.length,
      wins: wins.length,
      runner_ups: runnersUp.length,
      third_places: thirds.length,
      votes_received: votesReceived,
      followers_earned: followersEarned,
      following_count: followed.length,
      featured_count: featuredNominee.length,
      live_count: currentLive.length,
      best_rank: bestRank,
      coins_earned: coinsEarned,
      xp_earned: xpEarned
    },
    badges,
    showcase,
    currentLive: currentLive.slice(0, 6).map((c) => ({
      id: c.id,
      name: c.name,
      photo_url: c.photo_url,
      vote_count: c.vote_count ?? 0,
      competition: c.competition
    })),
    recentAwards: awards.slice(0, 6),
    timeline,
    recentActivity
  };
});
export {
  adminBulkSetEntryMode_createServerFn_handler,
  adminDeleteCategory_createServerFn_handler,
  adminDeleteCompetition_createServerFn_handler,
  adminDeleteCompetitorVote_createServerFn_handler,
  adminDeleteCompetitor_createServerFn_handler,
  adminFinalizeWinners_createServerFn_handler,
  adminListAllCompetitions_createServerFn_handler,
  adminListCompetitorVotes_createServerFn_handler,
  adminReorderCompetitors_createServerFn_handler,
  adminResetCompetitionVotes_createServerFn_handler,
  adminResetCompetitorVotes_createServerFn_handler,
  adminSaveCategory_createServerFn_handler,
  adminSaveCompetition_createServerFn_handler,
  adminSaveCompetitor_createServerFn_handler,
  adminSearchProfiles_createServerFn_handler,
  adminSetCompetitorFlags_createServerFn_handler,
  adminSetManualWinners_createServerFn_handler,
  adminSetParticipantStatus_createServerFn_handler,
  castVote_createServerFn_handler,
  followCompetition_createServerFn_handler,
  getCompetitionAnalytics_createServerFn_handler,
  getCompetitionBySlug_createServerFn_handler,
  getCompetitionFollowerCount_createServerFn_handler,
  getCompetition_createServerFn_handler,
  getLeaderboard_createServerFn_handler,
  getMyCompetitionFollow_createServerFn_handler,
  getMyCompetitorVote_createServerFn_handler,
  getMyVote_createServerFn_handler,
  getUserAchievements_createServerFn_handler,
  getUserCompetitionShowcase_createServerFn_handler,
  incrementCompetitionViews_createServerFn_handler,
  joinCompetition_createServerFn_handler,
  leaveCompetition_createServerFn_handler,
  listCategories_createServerFn_handler,
  listCompetitionsEnriched_createServerFn_handler,
  listCompetitions_createServerFn_handler,
  listCompetitors_createServerFn_handler,
  listHallOfFame_createServerFn_handler,
  listMyFollowedCompetitions_createServerFn_handler,
  listRecentCompetitionVoters_createServerFn_handler,
  listRelatedCompetitions_createServerFn_handler,
  shareCompetition_createServerFn_handler,
  unfollowCompetition_createServerFn_handler,
  voteForCompetitor_createServerFn_handler
};
