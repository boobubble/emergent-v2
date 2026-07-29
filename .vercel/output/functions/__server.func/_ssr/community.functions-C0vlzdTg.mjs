import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, n as numberType, b as booleanType, e as enumType, r as recordType, a as arrayType } from "../_libs/zod.mjs";
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
async function serverPublicClient() {
  const {
    createClient
  } = await import("../_libs/supabase__supabase-js.mjs");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  return createClient(process.env.SUPABASE_URL, key, {
    auth: {
      storage: void 0,
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, {
          ...init ?? {},
          headers: h
        });
      }
    }
  });
}
async function hashPassword(pw) {
  const {
    pbkdf2Sync,
    randomBytes
  } = await import("node:crypto");
  const salt = randomBytes(16);
  const derived = pbkdf2Sync(pw, salt, 1e5, 32, "sha256");
  return `pbkdf2$100000$${salt.toString("hex")}$${derived.toString("hex")}`;
}
async function verifyPassword(pw, stored) {
  const {
    pbkdf2Sync,
    timingSafeEqual
  } = await import("node:crypto");
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iters = parseInt(parts[1], 10);
  const salt = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(parts[3], "hex");
  const derived = pbkdf2Sync(pw, salt, iters, expected.length, "sha256");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
const getCommunityBySlug_createServerFn_handler = createServerRpc({
  id: "0267ca9731725b636bb774a5ef66d4d793aa70dee456dee97579e15c52d59077",
  name: "getCommunityBySlug",
  filename: "src/lib/community.functions.ts"
}, (opts) => getCommunityBySlug.__executeServer(opts));
const getCommunityBySlug = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  slug: stringType().min(1).max(80)
}).parse(d)).handler(getCommunityBySlug_createServerFn_handler, async ({
  data
}) => {
  const sb = await serverPublicClient();
  const {
    data: row
  } = await sb.from("communities").select("id,owner_id,slug,name,description,welcome_text,logo_url,banner_url,background_url,accent_color,rules,announcement,social_links,privacy_mode,visibility,category,tags,is_featured,is_verified,is_official,is_partner,is_trusted,verification_status,language,country,status,member_count,online_count,meta,created_at,updated_at").eq("slug", data.slug).in("status", ["active", "archived"]).maybeSingle();
  if (!row) return null;
  return row;
});
const listPublicCommunities_createServerFn_handler = createServerRpc({
  id: "55e0c7e7c42c0887b433710f7cc39cdeda814c126e820429a9504359681f78db",
  name: "listPublicCommunities",
  filename: "src/lib/community.functions.ts"
}, (opts) => listPublicCommunities.__executeServer(opts));
const listPublicCommunities = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  category: stringType().max(60).optional(),
  sort: enumType(["trending", "newest", "members", "active"]).optional(),
  featuredOnly: booleanType().optional(),
  limit: numberType().int().min(1).max(120).optional()
}).partial().parse(d ?? {})).handler(listPublicCommunities_createServerFn_handler, async ({
  data
}) => {
  const sb = await serverPublicClient();
  let q = sb.from("communities").select("id,slug,name,description,logo_url,banner_url,accent_color,privacy_mode,visibility,category,tags,is_featured,is_verified,is_official,is_partner,is_trusted,verification_status,member_count,online_count,created_at").eq("status", "active").or("visibility.eq.public,and(visibility.eq.featured_only,is_featured.eq.true)");
  if (data.category) q = q.eq("category", data.category);
  if (data.featuredOnly) q = q.eq("is_featured", true);
  switch (data.sort) {
    case "newest":
      q = q.order("created_at", {
        ascending: false
      });
      break;
    case "active":
      q = q.order("online_count", {
        ascending: false
      });
      break;
    case "trending":
      q = q.order("is_featured", {
        ascending: false
      }).order("online_count", {
        ascending: false
      }).order("member_count", {
        ascending: false
      });
      break;
    case "members":
    default:
      q = q.order("member_count", {
        ascending: false
      });
  }
  const {
    data: rows
  } = await q.limit(data.limit ?? 60);
  return rows ?? [];
});
const searchCommunities_createServerFn_handler = createServerRpc({
  id: "b939b56fd31a3f2f0aaba2c9cb16fdd9cf6330b01526e36342f7182a3c7f36c4",
  name: "searchCommunities",
  filename: "src/lib/community.functions.ts"
}, (opts) => searchCommunities.__executeServer(opts));
const searchCommunities = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  q: stringType().min(1).max(80),
  category: stringType().max(60).optional(),
  limit: numberType().int().min(1).max(60).optional()
}).parse(d)).handler(searchCommunities_createServerFn_handler, async ({
  data
}) => {
  const sb = await serverPublicClient();
  const term = data.q.replace(/[%_,]/g, " ").trim();
  if (!term) return [];
  const like = `%${term}%`;
  let q = sb.from("communities").select("id,slug,name,description,logo_url,banner_url,accent_color,privacy_mode,visibility,category,tags,is_featured,is_verified,is_official,is_partner,is_trusted,verification_status,member_count,online_count").eq("status", "active").or("visibility.eq.public,and(visibility.eq.featured_only,is_featured.eq.true)").or(`name.ilike.${like},slug.ilike.${like},description.ilike.${like}`);
  if (data.category) q = q.eq("category", data.category);
  const {
    data: rows
  } = await q.order("is_featured", {
    ascending: false
  }).order("member_count", {
    ascending: false
  }).limit(data.limit ?? 30);
  return rows ?? [];
});
const getDiscoveryStats_createServerFn_handler = createServerRpc({
  id: "b8a833ff452c25935f4170870d7a6eb668654154c7cda81e74bb018f36487917",
  name: "getDiscoveryStats",
  filename: "src/lib/community.functions.ts"
}, (opts) => getDiscoveryStats.__executeServer(opts));
const getDiscoveryStats = createServerFn({
  method: "GET"
}).handler(getDiscoveryStats_createServerFn_handler, async () => {
  const sb = await serverPublicClient();
  const {
    count: total
  } = await sb.from("communities").select("id", {
    count: "exact",
    head: true
  }).eq("status", "active").or("visibility.eq.public,and(visibility.eq.featured_only,is_featured.eq.true)");
  const {
    data: agg
  } = await sb.from("communities").select("member_count,online_count").eq("status", "active").or("visibility.eq.public,and(visibility.eq.featured_only,is_featured.eq.true)").limit(1e3);
  const members = (agg ?? []).reduce((s, r) => s + (r.member_count ?? 0), 0);
  const online = (agg ?? []).reduce((s, r) => s + (r.online_count ?? 0), 0);
  return {
    total: total ?? 0,
    members,
    online
  };
});
const getMyMembership_createServerFn_handler = createServerRpc({
  id: "0c68ae060ba9299292d3dcd4693329d8beb7e984f68fc794e3181efc262845d2",
  name: "getMyMembership",
  filename: "src/lib/community.functions.ts"
}, (opts) => getMyMembership.__executeServer(opts));
const getMyMembership = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(getMyMembership_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: row
  } = await context.supabase.from("community_members").select("id,role,status,created_at").eq("community_id", data.communityId).eq("user_id", context.userId).maybeSingle();
  return row;
});
const listMyCommunities_createServerFn_handler = createServerRpc({
  id: "51967712479bf7a8de2f0168365592072d4b4cb5b434ba635e35644dcaa1d606",
  name: "listMyCommunities",
  filename: "src/lib/community.functions.ts"
}, (opts) => listMyCommunities.__executeServer(opts));
const listMyCommunities = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).handler(listMyCommunities_createServerFn_handler, async ({
  context
}) => {
  const {
    data
  } = await context.supabase.from("community_members").select("role,status,community:communities(id,slug,name,logo_url,accent_color,privacy_mode,member_count)").eq("user_id", context.userId).eq("status", "active");
  return data ?? [];
});
const joinCommunity_createServerFn_handler = createServerRpc({
  id: "3553436f37ade1d6b80e8115832c035ff19d8df1cc1e9402195db5b9ecbc2bdf",
  name: "joinCommunity",
  filename: "src/lib/community.functions.ts"
}, (opts) => joinCommunity.__executeServer(opts));
const joinCommunity = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  inviteCode: stringType().trim().max(60).optional(),
  password: stringType().max(200).optional(),
  message: stringType().max(500).optional()
}).parse(d)).handler(joinCommunity_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    supabaseAdmin: _sbAdminForJoin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: comm,
    error: cErr
  } = await _sbAdminForJoin.from("communities").select("id,privacy_mode,status").eq("id", data.communityId).maybeSingle();
  if (cErr || !comm) throw new Error("Community not found");
  if (comm.status !== "active") throw new Error("Community not available");
  const {
    data: existing
  } = await supabase.from("community_members").select("id,status").eq("community_id", data.communityId).eq("user_id", userId).maybeSingle();
  if (existing?.status === "active") return {
    ok: true,
    state: "joined"
  };
  if (existing?.status === "banned") throw new Error("You are banned from this community");
  const privacy = comm.privacy_mode;
  const needsInvite = privacy === "invite_only" || privacy === "invite_password";
  const needsPassword = privacy === "password" || privacy === "invite_password";
  const needsRequest = privacy === "private";
  let inviteId = null;
  if (needsInvite) {
    if (!data.inviteCode) throw new Error("Invite code required");
    const {
      data: inv
    } = await _sbAdminForJoin.from("community_invites").select("id,community_id,max_uses,uses,expires_at").eq("code", data.inviteCode).eq("community_id", data.communityId).maybeSingle();
    if (!inv) throw new Error("Invalid invite code");
    if (inv.expires_at && new Date(inv.expires_at) < /* @__PURE__ */ new Date()) throw new Error("Invite expired");
    if (inv.max_uses && inv.uses >= inv.max_uses) throw new Error("Invite exhausted");
    inviteId = inv.id;
  }
  if (needsPassword) {
    if (!data.password) throw new Error("Password required");
    const {
      data: secret
    } = await _sbAdminForJoin.from("community_password_secrets").select("password_hash").eq("community_id", data.communityId).maybeSingle();
    if (!secret?.password_hash) throw new Error("Community password not configured");
    const ok = await verifyPassword(data.password, secret.password_hash);
    if (!ok) throw new Error("Incorrect password");
  }
  if (needsRequest) {
    const {
      error
    } = await supabase.from("community_join_requests").upsert({
      community_id: data.communityId,
      user_id: userId,
      message: data.message ?? null,
      status: "pending"
    }, {
      onConflict: "community_id,user_id"
    });
    if (error) throw new Error(error.message);
    return {
      ok: true,
      state: "pending"
    };
  }
  const {
    error: memErr
  } = await supabase.from("community_members").upsert({
    community_id: data.communityId,
    user_id: userId,
    role: "member",
    status: "active"
  }, {
    onConflict: "community_id,user_id"
  });
  if (memErr) throw new Error(memErr.message);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  if (inviteId) {
    try {
      const {
        data: invRow
      } = await supabaseAdmin.from("community_invites").select("uses").eq("id", inviteId).single();
      if (invRow) await supabaseAdmin.from("community_invites").update({
        uses: (invRow.uses ?? 0) + 1
      }).eq("id", inviteId);
    } catch {
    }
  }
  try {
    const {
      data: cRow
    } = await supabaseAdmin.from("communities").select("member_count").eq("id", data.communityId).single();
    if (cRow) await supabaseAdmin.from("communities").update({
      member_count: (cRow.member_count ?? 0) + 1
    }).eq("id", data.communityId);
  } catch {
  }
  return {
    ok: true,
    state: "joined"
  };
});
const leaveCommunity_createServerFn_handler = createServerRpc({
  id: "d2156818498792cb7788fcd6710842f3b3789792fd693ce5ad801bdd899bb90b",
  name: "leaveCommunity",
  filename: "src/lib/community.functions.ts"
}, (opts) => leaveCommunity.__executeServer(opts));
const leaveCommunity = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(leaveCommunity_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: comm
  } = await context.supabase.from("communities").select("owner_id").eq("id", data.communityId).maybeSingle();
  if (comm?.owner_id === context.userId) throw new Error("Owners cannot leave their own community");
  const {
    error
  } = await context.supabase.from("community_members").delete().eq("community_id", data.communityId).eq("user_id", context.userId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
async function assertOwner(supabase, userId, communityId) {
  const {
    data
  } = await supabase.from("communities").select("owner_id").eq("id", communityId).maybeSingle();
  if (!data) throw new Error("Community not found");
  if (data.owner_id !== userId) {
    const {
      data: isAdmin
    } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin"
    });
    const {
      data: isSuper
    } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "super_admin"
    });
    if (!isAdmin && !isSuper) throw new Error("Forbidden");
  }
}
const brandingInput = objectType({
  communityId: stringType().uuid(),
  name: stringType().min(1).max(80).optional(),
  slug: stringType().min(2).max(40).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Invalid slug").optional(),
  description: stringType().max(2e3).nullable().optional(),
  welcome_text: stringType().max(2e3).nullable().optional(),
  logo_url: stringType().url().nullable().optional(),
  banner_url: stringType().url().nullable().optional(),
  background_url: stringType().url().nullable().optional(),
  accent_color: stringType().regex(/^#[0-9a-fA-F]{3,8}$/).nullable().optional(),
  rules: stringType().max(5e3).nullable().optional(),
  announcement: stringType().max(2e3).nullable().optional(),
  social_links: recordType(stringType()).optional()
});
const updateCommunityBranding_createServerFn_handler = createServerRpc({
  id: "7a87a8e5804e17215b36798f16f6690dfd9fc12b054e69b19a1ec97b54e643b6",
  name: "updateCommunityBranding",
  filename: "src/lib/community.functions.ts"
}, (opts) => updateCommunityBranding.__executeServer(opts));
const updateCommunityBranding = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => brandingInput.parse(d)).handler(updateCommunityBranding_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const {
    communityId,
    slug,
    ...rest
  } = data;
  if (slug) {
    const {
      data: dupe
    } = await context.supabase.from("communities").select("id").eq("slug", slug).neq("id", communityId).maybeSingle();
    if (dupe) throw new Error("That URL is taken");
    const {
      data: pageDupe
    } = await context.supabase.from("custom_pages").select("id").eq("slug", slug).maybeSingle();
    if (pageDupe) throw new Error("That URL is taken");
  }
  const payload = {
    ...rest
  };
  if (slug) payload.slug = slug;
  const {
    error
  } = await context.supabase.from("communities").update(payload).eq("id", communityId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const updateCommunityPrivacy_createServerFn_handler = createServerRpc({
  id: "fc3f3f8de160d7f9894440393568379683b5079888639cdc7fa62c5c935eb5af",
  name: "updateCommunityPrivacy",
  filename: "src/lib/community.functions.ts"
}, (opts) => updateCommunityPrivacy.__executeServer(opts));
const updateCommunityPrivacy = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  privacy_mode: enumType(["public", "private", "invite_only", "password", "invite_password"]),
  password: stringType().min(4).max(200).nullable().optional()
}).parse(d)).handler(updateCommunityPrivacy_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const needsPassword = data.privacy_mode === "password" || data.privacy_mode === "invite_password";
  const {
    error
  } = await context.supabase.from("communities").update({
    privacy_mode: data.privacy_mode
  }).eq("id", data.communityId);
  if (error) throw new Error(error.message);
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  if (needsPassword && data.password) {
    const hash = await hashPassword(data.password);
    const {
      error: sErr
    } = await supabaseAdmin.from("community_password_secrets").upsert({
      community_id: data.communityId,
      password_hash: hash,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (sErr) throw new Error(sErr.message);
  } else if (!needsPassword) {
    await supabaseAdmin.from("community_password_secrets").delete().eq("community_id", data.communityId);
  }
  return {
    ok: true
  };
});
const listCommunityMembers_createServerFn_handler = createServerRpc({
  id: "6b071234e36762ea3cc76642413e64188e4dc25dd9b284f721e3ad7855827993",
  name: "listCommunityMembers",
  filename: "src/lib/community.functions.ts"
}, (opts) => listCommunityMembers.__executeServer(opts));
const listCommunityMembers = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  status: enumType(["active", "pending", "banned", "muted"]).optional()
}).parse(d)).handler(listCommunityMembers_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  let q = context.supabase.from("community_members").select("id,user_id,role,status,created_at,user:profiles!community_members_user_id_fkey(id,username,avatar_url,avatar_color)").eq("community_id", data.communityId).order("created_at", {
    ascending: false
  }).limit(500);
  if (data.status) q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const setMemberState_createServerFn_handler = createServerRpc({
  id: "457ab9a8e0cbc7de3aabc62adb0709639a137683434949aad2a49dc5755eafb1",
  name: "setMemberState",
  filename: "src/lib/community.functions.ts"
}, (opts) => setMemberState.__executeServer(opts));
const setMemberState = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  memberId: stringType().uuid(),
  role: enumType(["owner", "moderator", "member"]).optional(),
  status: enumType(["active", "pending", "banned", "muted"]).optional()
}).parse(d)).handler(setMemberState_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: row
  } = await context.supabase.from("community_members").select("community_id").eq("id", data.memberId).maybeSingle();
  if (!row) throw new Error("Member not found");
  await assertOwner(context.supabase, context.userId, row.community_id);
  const payload = {};
  if (data.role) payload.role = data.role;
  if (data.status) payload.status = data.status;
  const {
    error
  } = await context.supabase.from("community_members").update(payload).eq("id", data.memberId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const removeMember_createServerFn_handler = createServerRpc({
  id: "05cde11348cae24dcffd32b86e4ac07f9cb1a0a2cf1df639cd309c6288792474",
  name: "removeMember",
  filename: "src/lib/community.functions.ts"
}, (opts) => removeMember.__executeServer(opts));
const removeMember = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  memberId: stringType().uuid()
}).parse(d)).handler(removeMember_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: row
  } = await context.supabase.from("community_members").select("community_id,role").eq("id", data.memberId).maybeSingle();
  if (!row) throw new Error("Member not found");
  if (row.role === "owner") throw new Error("Cannot remove owner");
  await assertOwner(context.supabase, context.userId, row.community_id);
  const {
    error
  } = await context.supabase.from("community_members").delete().eq("id", data.memberId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const listJoinRequests_createServerFn_handler = createServerRpc({
  id: "0bc34845f1b49a364fd2724f24209f6fff281858ba8360bc78373be658e63d24",
  name: "listJoinRequests",
  filename: "src/lib/community.functions.ts"
}, (opts) => listJoinRequests.__executeServer(opts));
const listJoinRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(listJoinRequests_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const {
    data: rows
  } = await context.supabase.from("community_join_requests").select("id,user_id,message,status,created_at,user:profiles!community_join_requests_user_id_fkey(id,username,avatar_url,avatar_color)").eq("community_id", data.communityId).eq("status", "pending").order("created_at", {
    ascending: true
  });
  return rows ?? [];
});
const decideJoinRequest_createServerFn_handler = createServerRpc({
  id: "e8b5e654a43949cb0fc1bcab7be5f55ca0a57fac0c984f0c76a5385514c34c85",
  name: "decideJoinRequest",
  filename: "src/lib/community.functions.ts"
}, (opts) => decideJoinRequest.__executeServer(opts));
const decideJoinRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  requestId: stringType().uuid(),
  approve: booleanType()
}).parse(d)).handler(decideJoinRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: req
  } = await context.supabase.from("community_join_requests").select("id,community_id,user_id").eq("id", data.requestId).maybeSingle();
  if (!req) throw new Error("Request not found");
  await assertOwner(context.supabase, context.userId, req.community_id);
  if (data.approve) {
    await context.supabase.from("community_members").upsert({
      community_id: req.community_id,
      user_id: req.user_id,
      role: "member",
      status: "active"
    }, {
      onConflict: "community_id,user_id"
    });
  }
  await context.supabase.from("community_join_requests").update({
    status: data.approve ? "approved" : "rejected"
  }).eq("id", data.requestId);
  return {
    ok: true
  };
});
const listInvites_createServerFn_handler = createServerRpc({
  id: "aa20e99aac3bbbc0c3801ef649d3e8c9a9b85ac97cf0ce72a034a9edc19bfe62",
  name: "listInvites",
  filename: "src/lib/community.functions.ts"
}, (opts) => listInvites.__executeServer(opts));
const listInvites = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(listInvites_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const {
    data: rows
  } = await context.supabase.from("community_invites").select("*").eq("community_id", data.communityId).order("created_at", {
    ascending: false
  }).limit(100);
  return rows ?? [];
});
const createInvite_createServerFn_handler = createServerRpc({
  id: "d4aa01f3445ece0e9e7bab3f457d3283a9db9d332220a9a21a081cb5f7c0fc87",
  name: "createInvite",
  filename: "src/lib/community.functions.ts"
}, (opts) => createInvite.__executeServer(opts));
const createInvite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  maxUses: numberType().int().min(1).max(1e5).optional(),
  expiresAt: stringType().datetime().nullable().optional()
}).parse(d)).handler(createInvite_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const {
    randomBytes
  } = await import("node:crypto");
  const code = randomBytes(6).toString("base64url");
  const {
    error,
    data: row
  } = await context.supabase.from("community_invites").insert({
    community_id: data.communityId,
    code,
    created_by: context.userId,
    max_uses: data.maxUses ?? null,
    expires_at: data.expiresAt ?? null
  }).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const revokeInvite_createServerFn_handler = createServerRpc({
  id: "e817a1fbd3e4a83668c53d2132ad9c65dc0438c4e2dc7455db5c6b5a219313a1",
  name: "revokeInvite",
  filename: "src/lib/community.functions.ts"
}, (opts) => revokeInvite.__executeServer(opts));
const revokeInvite = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  inviteId: stringType().uuid()
}).parse(d)).handler(revokeInvite_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: inv
  } = await context.supabase.from("community_invites").select("community_id").eq("id", data.inviteId).maybeSingle();
  if (!inv) throw new Error("Invite not found");
  await assertOwner(context.supabase, context.userId, inv.community_id);
  const {
    error
  } = await context.supabase.from("community_invites").delete().eq("id", data.inviteId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getMyCommunity_createServerFn_handler = createServerRpc({
  id: "bf04213158e148e39b16cdb434168bfc6967b097cdfb28de018b72cc67d3a5d1",
  name: "getMyCommunity",
  filename: "src/lib/community.functions.ts"
}, (opts) => getMyCommunity.__executeServer(opts));
const getMyCommunity = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).handler(getMyCommunity_createServerFn_handler, async ({
  context
}) => {
  const {
    data: row
  } = await context.supabase.from("communities").select("*").eq("owner_id", context.userId).maybeSingle();
  return row;
});
const listCommunityMembersPublic_createServerFn_handler = createServerRpc({
  id: "5ab30af61d478d7be5363574b7836d09f6c039598b2bde1854a60ae102a88f29",
  name: "listCommunityMembersPublic",
  filename: "src/lib/community.functions.ts"
}, (opts) => listCommunityMembersPublic.__executeServer(opts));
const listCommunityMembersPublic = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(listCommunityMembersPublic_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: comm,
    error: commErr
  } = await supabaseAdmin.from("communities").select("id,privacy_mode,status").eq("id", data.communityId).maybeSingle();
  if (commErr) throw new Error(commErr.message);
  if (!comm || comm.status !== "active" || comm.privacy_mode !== "public") return [];
  const {
    data: rows,
    error
  } = await supabaseAdmin.from("community_members").select("id,user_id,role,status,created_at,user:profiles!community_members_user_id_fkey(id,username,display_name,avatar_url,avatar_color)").eq("community_id", data.communityId).eq("status", "active").order("role", {
    ascending: true
  }).order("created_at", {
    ascending: true
  }).limit(500);
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const listCommunityMembersAuthed_createServerFn_handler = createServerRpc({
  id: "907fcf3bb98bed6bd7102699956590e4e38fe928bd1b832bb3cfeb761e94c8ed",
  name: "listCommunityMembersAuthed",
  filename: "src/lib/community.functions.ts"
}, (opts) => listCommunityMembersAuthed.__executeServer(opts));
const listCommunityMembersAuthed = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(listCommunityMembersAuthed_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: membership
  } = await context.supabase.from("community_members").select("role,status").eq("community_id", data.communityId).eq("user_id", context.userId).maybeSingle();
  const isActive = !!membership && membership.status === "active";
  if (!isActive) {
    const {
      data: comm
    } = await context.supabase.from("communities").select("owner_id").eq("id", data.communityId).maybeSingle();
    if (!comm || comm.owner_id !== context.userId) return [];
  }
  const {
    data: rows,
    error
  } = await context.supabase.from("community_members").select("id,user_id,role,status,created_at,user:profiles!community_members_user_id_fkey(id,username,display_name,avatar_url,avatar_color)").eq("community_id", data.communityId).eq("status", "active").order("role", {
    ascending: true
  }).order("created_at", {
    ascending: true
  }).limit(500);
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const updateCommunityVisibility_createServerFn_handler = createServerRpc({
  id: "bdaa4a16f7e0c0233305890b409586023c304b8a9321e99e4ea1d95ed163dfd4",
  name: "updateCommunityVisibility",
  filename: "src/lib/community.functions.ts"
}, (opts) => updateCommunityVisibility.__executeServer(opts));
const updateCommunityVisibility = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  visibility: enumType(["public", "hidden", "unlisted", "featured_only"]),
  category: stringType().max(60).nullable().optional(),
  tags: arrayType(stringType().min(1).max(30)).max(15).optional(),
  language: stringType().max(10).nullable().optional(),
  country: stringType().max(10).nullable().optional(),
  confirmLargeChange: booleanType().optional()
}).parse(d)).handler(updateCommunityVisibility_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: comm
  } = await context.supabase.from("communities").select("owner_id,visibility,member_count").eq("id", data.communityId).maybeSingle();
  if (!comm) throw new Error("Community not found");
  if (comm.owner_id !== context.userId) throw new Error("Only the community owner can change visibility");
  if (comm.visibility === "public" && data.visibility === "hidden" && (comm.member_count ?? 0) > 1e4 && !data.confirmLargeChange) {
    throw new Error("CONFIRM_LARGE_HIDE");
  }
  const payload = {
    visibility: data.visibility
  };
  if (data.category !== void 0) payload.category = data.category;
  if (data.tags !== void 0) payload.tags = data.tags;
  if (data.language !== void 0) payload.language = data.language;
  if (data.country !== void 0) payload.country = data.country;
  const {
    error
  } = await context.supabase.from("communities").update(payload).eq("id", data.communityId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const verificationInput = objectType({
  communityId: stringType().uuid(),
  community_name: stringType().min(1).max(120),
  website: stringType().url().max(300).nullable().optional(),
  socials: recordType(stringType().max(300)).optional(),
  business_email: stringType().email().max(200).nullable().optional(),
  reason: stringType().max(2e3).nullable().optional(),
  doc_urls: arrayType(stringType().url().max(500)).max(10).optional()
});
const submitVerificationRequest_createServerFn_handler = createServerRpc({
  id: "63215c8a9ac4290c661e8fed16710cafdb99beb0423a90b0234679acc6078886",
  name: "submitVerificationRequest",
  filename: "src/lib/community.functions.ts"
}, (opts) => submitVerificationRequest.__executeServer(opts));
const submitVerificationRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => verificationInput.parse(d)).handler(submitVerificationRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const {
    data: existing
  } = await context.supabase.from("community_verification_requests").select("id,status,history").eq("community_id", data.communityId).in("status", ["pending", "needs_changes"]).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const payload = {
    community_name: data.community_name,
    website: data.website ?? null,
    socials: data.socials ?? {},
    business_email: data.business_email ?? null,
    reason: data.reason ?? null,
    doc_urls: data.doc_urls ?? [],
    status: "pending"
  };
  if (existing) {
    const nextHistory = [...existing.history ?? [], {
      at: now,
      by: context.userId,
      action: existing.status === "needs_changes" ? "resubmitted" : "updated"
    }];
    const {
      error
    } = await context.supabase.from("community_verification_requests").update({
      ...payload,
      history: nextHistory
    }).eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const {
      error
    } = await context.supabase.from("community_verification_requests").insert({
      ...payload,
      community_id: data.communityId,
      submitted_by: context.userId,
      history: [{
        at: now,
        by: context.userId,
        action: "submitted"
      }]
    });
    if (error) throw new Error(error.message);
  }
  await context.supabase.from("communities").update({
    verification_status: "pending"
  }).eq("id", data.communityId);
  return {
    ok: true
  };
});
const getMyVerificationRequest_createServerFn_handler = createServerRpc({
  id: "8d76fbf1e94c604dd2262f46fd73410c1fdd4f22431a765bd3bf481ed5d9241c",
  name: "getMyVerificationRequest",
  filename: "src/lib/community.functions.ts"
}, (opts) => getMyVerificationRequest.__executeServer(opts));
const getMyVerificationRequest = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(getMyVerificationRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const {
    data: row
  } = await context.supabase.from("community_verification_requests").select("*").eq("community_id", data.communityId).order("created_at", {
    ascending: false
  }).limit(1).maybeSingle();
  return row ?? null;
});
async function assertPlatformAdmin(supabase, userId) {
  const {
    data: isAdmin
  } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin"
  });
  const {
    data: isSuper
  } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin"
  });
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}
const adminListVerificationRequests_createServerFn_handler = createServerRpc({
  id: "09df6d9e3460e87d32a7c5be54b06e20eb0048ac5e6db0f43a9285c821b08fad",
  name: "adminListVerificationRequests",
  filename: "src/lib/community.functions.ts"
}, (opts) => adminListVerificationRequests.__executeServer(opts));
const adminListVerificationRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  status: enumType(["all", "pending", "needs_changes", "rejected", "approved"]).optional()
}).parse(d)).handler(adminListVerificationRequests_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertPlatformAdmin(context.supabase, context.userId);
  let q = context.supabase.from("community_verification_requests").select("*, community:communities!community_verification_requests_community_id_fkey(id,slug,name,logo_url,banner_url,accent_color,member_count,is_verified,is_official,is_partner,is_trusted)").order("created_at", {
    ascending: false
  }).limit(200);
  if (data.status && data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const decideInput = objectType({
  requestId: stringType().uuid(),
  action: enumType(["approve", "reject", "needs_changes"]),
  admin_notes: stringType().max(2e3).optional(),
  // Independent badge flags applied on approve. Ignored otherwise.
  is_verified: booleanType().optional(),
  is_official: booleanType().optional(),
  is_partner: booleanType().optional(),
  is_trusted: booleanType().optional()
});
const adminDecideVerificationRequest_createServerFn_handler = createServerRpc({
  id: "8528e39a65c6060913c020ae6f1291e95dccbe150f8cb2ed23b280149d8efb00",
  name: "adminDecideVerificationRequest",
  filename: "src/lib/community.functions.ts"
}, (opts) => adminDecideVerificationRequest.__executeServer(opts));
const adminDecideVerificationRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => decideInput.parse(d)).handler(adminDecideVerificationRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertPlatformAdmin(context.supabase, context.userId);
  const {
    data: req,
    error: rerr
  } = await context.supabase.from("community_verification_requests").select("id,community_id,status,history").eq("id", data.requestId).maybeSingle();
  if (rerr) throw new Error(rerr.message);
  if (!req) throw new Error("Request not found");
  const nextStatus = data.action === "approve" ? "approved" : data.action === "reject" ? "rejected" : "needs_changes";
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const history = [...req.history ?? [], {
    at: now,
    by: context.userId,
    action: data.action,
    note: data.admin_notes ?? void 0
  }];
  const {
    error: uerr
  } = await context.supabase.from("community_verification_requests").update({
    status: nextStatus,
    admin_notes: data.admin_notes ?? null,
    history,
    decided_by: context.userId,
    decided_at: now
  }).eq("id", data.requestId);
  if (uerr) throw new Error(uerr.message);
  const patch = {
    verification_status: nextStatus
  };
  if (data.action === "approve") {
    if (data.is_verified !== void 0) patch.is_verified = data.is_verified;
    if (data.is_official !== void 0) patch.is_official = data.is_official;
    if (data.is_partner !== void 0) patch.is_partner = data.is_partner;
    if (data.is_trusted !== void 0) patch.is_trusted = data.is_trusted;
    if (data.is_verified === void 0 && data.is_official === void 0 && data.is_partner === void 0 && data.is_trusted === void 0) {
      patch.is_verified = true;
    }
  } else if (data.action === "reject") {
    patch.is_verified = false;
    patch.is_official = false;
    patch.is_partner = false;
    patch.is_trusted = false;
  }
  const {
    error: cerr
  } = await context.supabase.from("communities").update(patch).eq("id", req.community_id);
  if (cerr) throw new Error(cerr.message);
  return {
    ok: true,
    status: nextStatus
  };
});
const getInviteLanding_createServerFn_handler = createServerRpc({
  id: "e03f296dae9ac6f37078e91caa50f7a68178ff9512da63209e5206e1818e2899",
  name: "getInviteLanding",
  filename: "src/lib/community.functions.ts"
}, (opts) => getInviteLanding.__executeServer(opts));
const getInviteLanding = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  code: stringType().min(3).max(80)
}).parse(d)).handler(getInviteLanding_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: inv
  } = await supabaseAdmin.from("community_invites").select("id,community_id,code,max_uses,uses,expires_at,created_at").eq("code", data.code).maybeSingle();
  if (!inv) return {
    valid: false,
    reason: "not_found",
    community: null,
    invite: null
  };
  const expired = inv.expires_at && new Date(inv.expires_at).getTime() < Date.now();
  const exhausted = inv.max_uses != null && (inv.uses ?? 0) >= inv.max_uses;
  const sb = await serverPublicClient();
  const {
    data: comm
  } = await sb.from("communities").select("id,slug,name,description,welcome_text,logo_url,banner_url,accent_color,rules,privacy_mode,visibility,category,tags,is_featured,is_verified,is_official,is_partner,is_trusted,verification_status,language,country,status,member_count,online_count,owner_id").eq("id", inv.community_id).eq("status", "active").maybeSingle();
  if (!comm) return {
    valid: false,
    reason: "community_missing",
    community: null,
    invite: inv
  };
  const {
    data: owner
  } = await sb.from("profiles").select("id,username,display_name,avatar_url").eq("id", comm.owner_id).maybeSingle();
  const reason = expired ? "expired" : exhausted ? "exhausted" : null;
  return {
    valid: !reason,
    reason,
    community: {
      ...comm,
      is_partner: comm.is_partner ?? false,
      is_trusted: comm.is_trusted ?? false,
      verification_status: comm.verification_status ?? "not_verified"
    },
    invite: inv,
    owner: owner ?? null
  };
});
const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const resolveCommunitySlug_createServerFn_handler = createServerRpc({
  id: "9f37d25506a7a829144c09bda55b0fa2268d851eb37dd8b32b38e24315be94f4",
  name: "resolveCommunitySlug",
  filename: "src/lib/community.functions.ts"
}, (opts) => resolveCommunitySlug.__executeServer(opts));
const resolveCommunitySlug = createServerFn({
  method: "GET"
}).inputValidator((d) => objectType({
  slug: stringType().min(1).max(80)
}).parse(d)).handler(resolveCommunitySlug_createServerFn_handler, async ({
  data
}) => {
  const sb = await serverPublicClient();
  const {
    data: active
  } = await sb.from("communities").select("slug").eq("slug", data.slug).maybeSingle();
  if (active) return {
    slug: active.slug,
    redirected: false
  };
  const {
    data: hist
  } = await sb.from("community_slug_history").select("community_id").eq("old_slug", data.slug).maybeSingle();
  if (!hist) return {
    slug: null,
    redirected: false
  };
  const {
    data: comm
  } = await sb.from("communities").select("slug").eq("id", hist.community_id).maybeSingle();
  if (!comm) return {
    slug: null,
    redirected: false
  };
  return {
    slug: comm.slug,
    redirected: true
  };
});
const requestPremiumSlug_createServerFn_handler = createServerRpc({
  id: "464a633b09d69a86b22e7ab0f821ac680f6b95fbf77c39db0dd46cf87114e608",
  name: "requestPremiumSlug",
  filename: "src/lib/community.functions.ts"
}, (opts) => requestPremiumSlug.__executeServer(opts));
const requestPremiumSlug = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid(),
  requestedSlug: stringType().min(2).max(40).regex(SLUG_RE, "Invalid slug format"),
  reason: stringType().max(500).optional()
}).parse(d)).handler(requestPremiumSlug_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const requested = data.requestedSlug.toLowerCase();
  const {
    data: comm
  } = await supabase.from("communities").select("id,slug,owner_id").eq("id", data.communityId).maybeSingle();
  if (!comm) throw new Error("Community not found");
  if (comm.owner_id !== userId) throw new Error("Only the owner can request a premium URL");
  if (comm.slug === requested) throw new Error("This is already your slug");
  const {
    isReservedSlug
  } = await import("./reserved-routes-BWsWje6t.mjs");
  if (isReservedSlug(requested)) throw new Error("This slug is reserved by the platform");
  const {
    data: taken
  } = await supabase.from("communities").select("id").eq("slug", requested).maybeSingle();
  if (taken) throw new Error("This slug is already in use");
  const {
    data: hist
  } = await supabase.from("community_slug_history").select("community_id").eq("old_slug", requested).maybeSingle();
  if (hist && hist.community_id !== data.communityId) {
    throw new Error("This slug was previously used by another community");
  }
  const {
    data: pending
  } = await supabase.from("community_premium_slug_requests").select("id").eq("requested_slug", requested).eq("status", "pending").maybeSingle();
  if (pending) throw new Error("Another request is already pending for this slug");
  const {
    data: row,
    error
  } = await supabase.from("community_premium_slug_requests").insert({
    community_id: data.communityId,
    requested_by: userId,
    current_slug: comm.slug,
    requested_slug: requested,
    reason: data.reason ?? null
  }).select("*").single();
  if (error) throw new Error(error.message);
  return row;
});
const listPremiumSlugRequests_createServerFn_handler = createServerRpc({
  id: "f98517c9a31ed5258d74508da92aa5be0e841032231ecf213c4806d1a84331a9",
  name: "listPremiumSlugRequests",
  filename: "src/lib/community.functions.ts"
}, (opts) => listPremiumSlugRequests.__executeServer(opts));
const listPremiumSlugRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(listPremiumSlugRequests_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    data: rows
  } = await context.supabase.from("community_premium_slug_requests").select("*").eq("community_id", data.communityId).order("created_at", {
    ascending: false
  });
  return rows ?? [];
});
const cancelPremiumSlugRequest_createServerFn_handler = createServerRpc({
  id: "95b39620aa6e73ddf63ec8b399967937dea48a6897d5bfb48b161eada1454ea8",
  name: "cancelPremiumSlugRequest",
  filename: "src/lib/community.functions.ts"
}, (opts) => cancelPremiumSlugRequest.__executeServer(opts));
const cancelPremiumSlugRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  requestId: stringType().uuid()
}).parse(d)).handler(cancelPremiumSlugRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    error
  } = await context.supabase.from("community_premium_slug_requests").update({
    status: "cancelled"
  }).eq("id", data.requestId).eq("requested_by", context.userId).eq("status", "pending");
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const adminListPremiumSlugRequests_createServerFn_handler = createServerRpc({
  id: "928f0aa39bfcd0bd5b585389edab4600e85cd219d4218ce13127b378594e94ea",
  name: "adminListPremiumSlugRequests",
  filename: "src/lib/community.functions.ts"
}, (opts) => adminListPremiumSlugRequests.__executeServer(opts));
const adminListPremiumSlugRequests = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  status: enumType(["all", "pending", "approved", "rejected", "cancelled"]).optional()
}).parse(d)).handler(adminListPremiumSlugRequests_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertPlatformAdmin(context.supabase, context.userId);
  let q = context.supabase.from("community_premium_slug_requests").select("*, community:communities!community_premium_slug_requests_community_id_fkey(id,slug,name,logo_url,banner_url,accent_color,member_count,is_verified,is_official,is_partner,is_trusted)").order("created_at", {
    ascending: false
  }).limit(200);
  if (data.status && data.status !== "all") q = q.eq("status", data.status);
  const {
    data: rows,
    error
  } = await q;
  if (error) throw new Error(error.message);
  return rows ?? [];
});
const reviewPremiumSlugRequest_createServerFn_handler = createServerRpc({
  id: "7ae29f2e597b47a4d071fe194c4ab9546ac2889c8dc4a5c8d4914013bced665f",
  name: "reviewPremiumSlugRequest",
  filename: "src/lib/community.functions.ts"
}, (opts) => reviewPremiumSlugRequest.__executeServer(opts));
const reviewPremiumSlugRequest = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  requestId: stringType().uuid(),
  decision: enumType(["approved", "rejected"]),
  note: stringType().max(500).optional()
}).parse(d)).handler(reviewPremiumSlugRequest_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  await assertPlatformAdmin(supabase, userId);
  const {
    data: req
  } = await supabase.from("community_premium_slug_requests").select("id,community_id,current_slug,requested_slug,status").eq("id", data.requestId).maybeSingle();
  if (!req) throw new Error("Request not found");
  if (req.status !== "pending") throw new Error("Request is not pending");
  if (data.decision === "rejected") {
    const {
      error
    } = await supabase.from("community_premium_slug_requests").update({
      status: "rejected",
      review_note: data.note ?? null,
      reviewed_by: userId,
      reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", data.requestId);
    if (error) throw new Error(error.message);
    return {
      ok: true,
      applied: false
    };
  }
  const {
    supabaseAdmin
  } = await import("./client.server-BXCYxJZY.mjs");
  const requested = req.requested_slug;
  const communityId = req.community_id;
  const currentSlug = req.current_slug;
  const {
    data: taken
  } = await supabaseAdmin.from("communities").select("id").eq("slug", requested).neq("id", communityId).maybeSingle();
  if (taken) throw new Error("Slug was taken by another community");
  const {
    isPremiumSlug
  } = await import("./premium-slugs-D4Q35qvA.mjs");
  const tier = isPremiumSlug(requested) ? "premium" : "standard";
  if (currentSlug && currentSlug !== requested) {
    await supabaseAdmin.from("community_slug_history").upsert({
      community_id: communityId,
      old_slug: currentSlug
    }, {
      onConflict: "old_slug"
    });
  }
  const {
    error: upErr
  } = await supabaseAdmin.from("communities").update({
    slug: requested,
    slug_tier: tier
  }).eq("id", communityId);
  if (upErr) throw new Error(upErr.message);
  const {
    error: rvErr
  } = await supabaseAdmin.from("community_premium_slug_requests").update({
    status: "approved",
    review_note: data.note ?? null,
    reviewed_by: userId,
    reviewed_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.requestId);
  if (rvErr) throw new Error(rvErr.message);
  return {
    ok: true,
    applied: true,
    newSlug: requested
  };
});
const archiveCommunity_createServerFn_handler = createServerRpc({
  id: "0868f3d3694bd41196d19b2ed4b9a94f671e042f14d9f2b1aab7c7cfd1ffd54e",
  name: "archiveCommunity",
  filename: "src/lib/community.functions.ts"
}, (opts) => archiveCommunity.__executeServer(opts));
const archiveCommunity = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(archiveCommunity_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const {
    error
  } = await context.supabase.from("communities").update({
    status: "archived"
  }).eq("id", data.communityId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const restoreCommunity_createServerFn_handler = createServerRpc({
  id: "84e76b84bd8ba8ef0f19ecad6dbca071abb1324d00b9e182f106407886014d17",
  name: "restoreCommunity",
  filename: "src/lib/community.functions.ts"
}, (opts) => restoreCommunity.__executeServer(opts));
const restoreCommunity = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(restoreCommunity_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const {
    error
  } = await context.supabase.from("communities").update({
    status: "active"
  }).eq("id", data.communityId);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getCommunityAnalytics_createServerFn_handler = createServerRpc({
  id: "6dbfae677965187a86caf823ba44ee9726c3702740150cd6b681f703dfa89bb6",
  name: "getCommunityAnalytics",
  filename: "src/lib/community.functions.ts"
}, (opts) => getCommunityAnalytics.__executeServer(opts));
const getCommunityAnalytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).inputValidator((d) => objectType({
  communityId: stringType().uuid()
}).parse(d)).handler(getCommunityAnalytics_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertOwner(context.supabase, context.userId, data.communityId);
  const cid = data.communityId;
  const now = /* @__PURE__ */ new Date();
  const d7 = new Date(now.getTime() - 7 * 24 * 3600 * 1e3).toISOString();
  const d30 = new Date(now.getTime() - 30 * 24 * 3600 * 1e3).toISOString();
  const sb = context.supabase;
  const [{
    data: comm
  }, m7, m30, posts, posts7, rooms, comps, growth] = await Promise.all([sb.from("communities").select("member_count,online_count").eq("id", cid).maybeSingle(), sb.from("community_members").select("id", {
    count: "exact",
    head: true
  }).eq("community_id", cid).gte("joined_at", d7), sb.from("community_members").select("id", {
    count: "exact",
    head: true
  }).eq("community_id", cid).gte("joined_at", d30), sb.from("posts").select("id", {
    count: "exact",
    head: true
  }).eq("community_id", cid), sb.from("posts").select("id", {
    count: "exact",
    head: true
  }).eq("community_id", cid).gte("created_at", d7), sb.from("chatrooms").select("id", {
    count: "exact",
    head: true
  }).eq("community_id", cid), sb.from("competitions").select("id", {
    count: "exact",
    head: true
  }).eq("community_id", cid), sb.from("community_members").select("joined_at").eq("community_id", cid).gte("joined_at", d30)]);
  const buckets = /* @__PURE__ */ new Map();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 3600 * 1e3);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of growth.data ?? []) {
    const day = String(row.joined_at ?? "").slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  const growthByDay = Array.from(buckets.entries()).map(([day, count]) => ({
    day,
    count
  }));
  return {
    memberCount: comm?.member_count ?? 0,
    onlineCount: comm?.online_count ?? 0,
    membersLast7d: m7.count ?? 0,
    membersLast30d: m30.count ?? 0,
    postCount: posts.count ?? 0,
    postsLast7d: posts7.count ?? 0,
    chatroomCount: rooms.count ?? 0,
    competitionCount: comps.count ?? 0,
    growthByDay
  };
});
const adminCommunityReport_createServerFn_handler = createServerRpc({
  id: "8285ee8226922c117fa21641155bc211d50173240b5ad9e275f06f5dc6a91ef2",
  name: "adminCommunityReport",
  filename: "src/lib/community.functions.ts"
}, (opts) => adminCommunityReport.__executeServer(opts));
const adminCommunityReport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("community.write")]).handler(adminCommunityReport_createServerFn_handler, async ({
  context
}) => {
  await assertPlatformAdmin(context.supabase, context.userId);
  const sb = context.supabase;
  const d7 = new Date(Date.now() - 7 * 24 * 3600 * 1e3).toISOString();
  const [all, active, archived, verified, official, featured, recent, top] = await Promise.all([sb.from("communities").select("id", {
    count: "exact",
    head: true
  }), sb.from("communities").select("id", {
    count: "exact",
    head: true
  }).eq("status", "active"), sb.from("communities").select("id", {
    count: "exact",
    head: true
  }).eq("status", "archived"), sb.from("communities").select("id", {
    count: "exact",
    head: true
  }).eq("is_verified", true), sb.from("communities").select("id", {
    count: "exact",
    head: true
  }).eq("is_official", true), sb.from("communities").select("id", {
    count: "exact",
    head: true
  }).eq("is_featured", true), sb.from("communities").select("id", {
    count: "exact",
    head: true
  }).gte("created_at", d7), sb.from("communities").select("id,slug,name,logo_url,banner_url,accent_color,member_count,online_count,is_verified,is_official,is_partner,is_trusted,status").eq("status", "active").order("member_count", {
    ascending: false
  }).limit(10)]);
  return {
    totals: {
      all: all.count ?? 0,
      active: active.count ?? 0,
      archived: archived.count ?? 0,
      verified: verified.count ?? 0,
      official: official.count ?? 0,
      featured: featured.count ?? 0,
      newLast7d: recent.count ?? 0
    },
    topByMembers: top.data ?? []
  };
});
export {
  adminCommunityReport_createServerFn_handler,
  adminDecideVerificationRequest_createServerFn_handler,
  adminListPremiumSlugRequests_createServerFn_handler,
  adminListVerificationRequests_createServerFn_handler,
  archiveCommunity_createServerFn_handler,
  cancelPremiumSlugRequest_createServerFn_handler,
  createInvite_createServerFn_handler,
  decideJoinRequest_createServerFn_handler,
  getCommunityAnalytics_createServerFn_handler,
  getCommunityBySlug_createServerFn_handler,
  getDiscoveryStats_createServerFn_handler,
  getInviteLanding_createServerFn_handler,
  getMyCommunity_createServerFn_handler,
  getMyMembership_createServerFn_handler,
  getMyVerificationRequest_createServerFn_handler,
  joinCommunity_createServerFn_handler,
  leaveCommunity_createServerFn_handler,
  listCommunityMembersAuthed_createServerFn_handler,
  listCommunityMembersPublic_createServerFn_handler,
  listCommunityMembers_createServerFn_handler,
  listInvites_createServerFn_handler,
  listJoinRequests_createServerFn_handler,
  listMyCommunities_createServerFn_handler,
  listPremiumSlugRequests_createServerFn_handler,
  listPublicCommunities_createServerFn_handler,
  removeMember_createServerFn_handler,
  requestPremiumSlug_createServerFn_handler,
  resolveCommunitySlug_createServerFn_handler,
  restoreCommunity_createServerFn_handler,
  reviewPremiumSlugRequest_createServerFn_handler,
  revokeInvite_createServerFn_handler,
  searchCommunities_createServerFn_handler,
  setMemberState_createServerFn_handler,
  submitVerificationRequest_createServerFn_handler,
  updateCommunityBranding_createServerFn_handler,
  updateCommunityPrivacy_createServerFn_handler,
  updateCommunityVisibility_createServerFn_handler
};
