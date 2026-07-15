import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Types ----------
export type CommunityPrivacy = "public" | "private" | "invite_only" | "password" | "invite_password";
export type CommunityVisibility = "public" | "hidden" | "unlisted" | "featured_only";
export type CommunityMemberRole = "owner" | "moderator" | "member";
export type CommunityMemberStatus = "active" | "pending" | "banned" | "muted";

export interface Community {
  id: string;
  owner_id: string;
  slug: string;
  name: string;
  description: string | null;
  welcome_text: string | null;
  logo_url: string | null;
  banner_url: string | null;
  background_url: string | null;
  accent_color: string | null;
  rules: string | null;
  announcement: string | null;
  social_links: Record<string, string>;
  privacy_mode: CommunityPrivacy;
  visibility: CommunityVisibility;
  category: string | null;
  tags: string[];
  is_featured: boolean;
  is_verified: boolean;
  is_official: boolean;
  language: string | null;
  country: string | null;
  status: string;
  member_count: number;
  online_count: number;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}


// ---------- Public server client (for anon-safe reads) ----------
async function serverPublicClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient(process.env.SUPABASE_URL!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input as RequestInfo, { ...(init ?? {}), headers: h });
      },
    },
  });
}

// ---------- Password hashing (PBKDF2, node:crypto — Workers-compatible) ----------
async function hashPassword(pw: string): Promise<string> {
  const { pbkdf2Sync, randomBytes } = await import("node:crypto");
  const salt = randomBytes(16);
  const derived = pbkdf2Sync(pw, salt, 100_000, 32, "sha256");
  return `pbkdf2$100000$${salt.toString("hex")}$${derived.toString("hex")}`;
}

async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  const { pbkdf2Sync, timingSafeEqual } = await import("node:crypto");
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iters = parseInt(parts[1], 10);
  const salt = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(parts[3], "hex");
  const derived = pbkdf2Sync(pw, salt, iters, expected.length, "sha256");
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

// =========================================================================
// PUBLIC READS
// =========================================================================

/** Get a community by slug (public data only, no password hash). */
export const getCommunityBySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await serverPublicClient();
    const { data: row } = await sb
      .from("communities")
      .select("id,owner_id,slug,name,description,welcome_text,logo_url,banner_url,background_url,accent_color,rules,announcement,social_links,privacy_mode,visibility,category,tags,is_featured,is_verified,is_official,is_partner,is_trusted,verification_status,language,country,status,member_count,online_count,meta,created_at,updated_at")
      .eq("slug", data.slug)
      .in("status", ["active", "archived"])
      .maybeSingle();
    if (!row) return null;
    return row as any;
  });

/**
 * List active communities for the public directory.
 * Filters out hidden/unlisted communities. featured_only visibility is included
 * only when the community is also marked is_featured=true.
 */
export const listPublicCommunities = createServerFn({ method: "GET" })
  .inputValidator((d: {
    category?: string;
    sort?: "trending" | "newest" | "members" | "active";
    featuredOnly?: boolean;
    limit?: number;
  } | undefined) =>
    z.object({
      category: z.string().max(60).optional(),
      sort: z.enum(["trending", "newest", "members", "active"]).optional(),
      featuredOnly: z.boolean().optional(),
      limit: z.number().int().min(1).max(120).optional(),
    }).partial().parse(d ?? {}),
  )
  .handler(async ({ data }) => {
    const sb = await serverPublicClient();
    let q = sb
      .from("communities")
      .select("id,slug,name,description,logo_url,banner_url,accent_color,privacy_mode,visibility,category,tags,is_featured,is_verified,is_official,is_partner,is_trusted,verification_status,member_count,online_count,created_at")
      .eq("status", "active")
      // discovery-visible = public OR (featured_only AND is_featured)
      .or("visibility.eq.public,and(visibility.eq.featured_only,is_featured.eq.true)");
    if (data.category) q = q.eq("category", data.category);
    if (data.featuredOnly) q = q.eq("is_featured", true);
    switch (data.sort) {
      case "newest": q = q.order("created_at", { ascending: false }); break;
      case "active": q = q.order("online_count", { ascending: false }); break;
      case "trending":
        q = q.order("is_featured", { ascending: false })
             .order("online_count", { ascending: false })
             .order("member_count", { ascending: false });
        break;
      case "members":
      default:
        q = q.order("member_count", { ascending: false });
    }
    const { data: rows } = await q.limit(data.limit ?? 60);
    return rows ?? [];
  });

/**
 * Search discovery-visible communities by name / description / slug / tags.
 * Same visibility rules as listPublicCommunities.
 */
export const searchCommunities = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string; category?: string; limit?: number }) =>
    z.object({
      q: z.string().min(1).max(80),
      category: z.string().max(60).optional(),
      limit: z.number().int().min(1).max(60).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = await serverPublicClient();
    const term = data.q.replace(/[%_,]/g, " ").trim();
    if (!term) return [];
    const like = `%${term}%`;
    let q = sb
      .from("communities")
      .select("id,slug,name,description,logo_url,banner_url,accent_color,privacy_mode,visibility,category,tags,is_featured,is_verified,is_official,is_partner,is_trusted,verification_status,member_count,online_count")
      .eq("status", "active")
      .or("visibility.eq.public,and(visibility.eq.featured_only,is_featured.eq.true)")
      .or(`name.ilike.${like},slug.ilike.${like},description.ilike.${like}`);
    if (data.category) q = q.eq("category", data.category);
    const { data: rows } = await q
      .order("is_featured", { ascending: false })
      .order("member_count", { ascending: false })
      .limit(data.limit ?? 30);
    return rows ?? [];
  });

/** Aggregate stats for the discovery hero. */
export const getDiscoveryStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const sb = await serverPublicClient();
    const { count: total } = await sb
      .from("communities")
      .select("id", { count: "exact", head: true })
      .eq("status", "active")
      .or("visibility.eq.public,and(visibility.eq.featured_only,is_featured.eq.true)");
    const { data: agg } = await sb
      .from("communities")
      .select("member_count,online_count")
      .eq("status", "active")
      .or("visibility.eq.public,and(visibility.eq.featured_only,is_featured.eq.true)")
      .limit(1000);
    const members = (agg ?? []).reduce((s, r: any) => s + (r.member_count ?? 0), 0);
    const online = (agg ?? []).reduce((s, r: any) => s + (r.online_count ?? 0), 0);
    return { total: total ?? 0, members, online };
  });

// =========================================================================
// MEMBERSHIP (auth required)
// =========================================================================

/** Current user's membership in a community, if any. */
export const getMyMembership = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("community_members")
      .select("id,role,status,created_at")
      .eq("community_id", data.communityId)
      .eq("user_id", context.userId)
      .maybeSingle();
    return row;
  });



/** All communities I belong to. */
export const listMyCommunities = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("community_members")
      .select("role,status,community:communities(id,slug,name,logo_url,accent_color,privacy_mode,member_count)")
      .eq("user_id", context.userId)
      .eq("status", "active");
    return data ?? [];
  });

/**
 * Join a community. Handles all four privacy modes.
 *  - public          → active member
 *  - private         → creates join_request
 *  - invite_only     → requires valid invite code
 *  - password        → requires password
 *  - invite_password → requires both
 */
export const joinCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string; inviteCode?: string; password?: string; message?: string }) =>
    z.object({
      communityId: z.string().uuid(),
      inviteCode: z.string().trim().max(60).optional(),
      password: z.string().max(200).optional(),
      message: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: comm, error: cErr } = await supabase
      .from("communities")
      .select("id,privacy_mode,join_password_hash,status")
      .eq("id", data.communityId)
      .maybeSingle();
    if (cErr || !comm) throw new Error("Community not found");
    if (comm.status !== "active") throw new Error("Community not available");

    // Already a member?
    const { data: existing } = await supabase
      .from("community_members")
      .select("id,status")
      .eq("community_id", data.communityId)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing?.status === "active") return { ok: true, state: "joined" as const };
    if (existing?.status === "banned") throw new Error("You are banned from this community");

    const privacy = comm.privacy_mode as CommunityPrivacy;
    const needsInvite = privacy === "invite_only" || privacy === "invite_password";
    const needsPassword = privacy === "password" || privacy === "invite_password";
    const needsRequest = privacy === "private";

    // Validate invite
    let inviteId: string | null = null;
    if (needsInvite) {
      if (!data.inviteCode) throw new Error("Invite code required");
      const { data: inv } = await supabase
        .from("community_invites")
        .select("id,community_id,max_uses,uses,expires_at")
        .eq("code", data.inviteCode)
        .eq("community_id", data.communityId)
        .maybeSingle();
      if (!inv) throw new Error("Invalid invite code");
      if (inv.expires_at && new Date(inv.expires_at) < new Date()) throw new Error("Invite expired");
      if (inv.max_uses && inv.uses >= inv.max_uses) throw new Error("Invite exhausted");
      inviteId = inv.id;
    }

    // Validate password
    if (needsPassword) {
      if (!data.password) throw new Error("Password required");
      if (!comm.join_password_hash) throw new Error("Community password not configured");
      const ok = await verifyPassword(data.password, comm.join_password_hash);
      if (!ok) throw new Error("Incorrect password");
    }

    // Private → create join request
    if (needsRequest) {
      const { error } = await supabase
        .from("community_join_requests")
        .upsert({
          community_id: data.communityId,
          user_id: userId,
          message: data.message ?? null,
          status: "pending",
        }, { onConflict: "community_id,user_id" });
      if (error) throw new Error(error.message);
      return { ok: true, state: "pending" as const };
    }

    // Public / invite / password → active membership
    const { error: memErr } = await supabase
      .from("community_members")
      .upsert({
        community_id: data.communityId,
        user_id: userId,
        role: "member",
        status: "active",
      }, { onConflict: "community_id,user_id" });
    if (memErr) throw new Error(memErr.message);

    // Increment invite uses + member count via admin (server-only, avoids extra policies).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (inviteId) {
      try {
        const { data: invRow } = await supabaseAdmin.from("community_invites").select("uses").eq("id", inviteId).single();
        if (invRow) await supabaseAdmin.from("community_invites").update({ uses: (invRow.uses ?? 0) + 1 }).eq("id", inviteId);
      } catch { /* best-effort */ }
    }
    try {
      const { data: cRow } = await supabaseAdmin.from("communities").select("member_count").eq("id", data.communityId).single();
      if (cRow) await supabaseAdmin.from("communities").update({ member_count: (cRow.member_count ?? 0) + 1 }).eq("id", data.communityId);
    } catch { /* best-effort */ }


    return { ok: true, state: "joined" as const };
  });

export const leaveCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // Owners can't leave (they must transfer or delete first)
    const { data: comm } = await context.supabase
      .from("communities")
      .select("owner_id")
      .eq("id", data.communityId)
      .maybeSingle();
    if (comm?.owner_id === context.userId) throw new Error("Owners cannot leave their own community");
    const { error } = await context.supabase
      .from("community_members")
      .delete()
      .eq("community_id", data.communityId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =========================================================================
// OWNER / DASHBOARD (auth + ownership required)
// =========================================================================

async function assertOwner(supabase: any, userId: string, communityId: string) {
  const { data } = await supabase
    .from("communities")
    .select("owner_id")
    .eq("id", communityId)
    .maybeSingle();
  if (!data) throw new Error("Community not found");
  if (data.owner_id !== userId) {
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    const { data: isSuper } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
    if (!isAdmin && !isSuper) throw new Error("Forbidden");
  }
}

const brandingInput = z.object({
  communityId: z.string().uuid(),
  name: z.string().min(1).max(80).optional(),
  slug: z.string().min(2).max(40).regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Invalid slug").optional(),
  description: z.string().max(2000).nullable().optional(),
  welcome_text: z.string().max(2000).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  banner_url: z.string().url().nullable().optional(),
  background_url: z.string().url().nullable().optional(),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{3,8}$/).nullable().optional(),
  rules: z.string().max(5000).nullable().optional(),
  announcement: z.string().max(2000).nullable().optional(),
  social_links: z.record(z.string()).optional(),
});

/** Update branding / basic info. Slug change validated for uniqueness. */
export const updateCommunityBranding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => brandingInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, context.userId, data.communityId);
    const { communityId, slug, ...rest } = data;

    if (slug) {
      // Validate slug isn't reserved / duplicate
      const { data: dupe } = await context.supabase
        .from("communities")
        .select("id")
        .eq("slug", slug)
        .neq("id", communityId)
        .maybeSingle();
      if (dupe) throw new Error("That URL is taken");
      const { data: pageDupe } = await context.supabase
        .from("custom_pages")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (pageDupe) throw new Error("That URL is taken");
    }

    const payload: Record<string, unknown> = { ...rest };
    if (slug) payload.slug = slug;

    const { error } = await context.supabase
      .from("communities")
      .update(payload as never)

      .eq("id", communityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Update privacy mode (and password, if applicable). */
export const updateCommunityPrivacy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string; privacy_mode: CommunityPrivacy; password?: string | null }) =>
    z.object({
      communityId: z.string().uuid(),
      privacy_mode: z.enum(["public", "private", "invite_only", "password", "invite_password"]),
      password: z.string().min(4).max(200).nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, context.userId, data.communityId);
    const payload: Record<string, unknown> = { privacy_mode: data.privacy_mode };
    const needsPassword = data.privacy_mode === "password" || data.privacy_mode === "invite_password";
    if (needsPassword && data.password) {
      payload.join_password_hash = await hashPassword(data.password);
    } else if (!needsPassword) {
      payload.join_password_hash = null;
    }
    const { error } = await context.supabase.from("communities").update(payload as never).eq("id", data.communityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** List members of a community (owner/staff view). */
export const listCommunityMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string; status?: CommunityMemberStatus }) =>
    z.object({
      communityId: z.string().uuid(),
      status: z.enum(["active", "pending", "banned", "muted"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, context.userId, data.communityId);
    let q = context.supabase
      .from("community_members")
      .select("id,user_id,role,status,created_at,user:profiles!community_members_user_id_fkey(id,username,avatar_url,avatar_color)")
      .eq("community_id", data.communityId)
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Owner action on a member: ban / mute / kick / promote / demote. */
export const setMemberState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { memberId: string; role?: CommunityMemberRole; status?: CommunityMemberStatus }) =>
    z.object({
      memberId: z.string().uuid(),
      role: z.enum(["owner", "moderator", "member"]).optional(),
      status: z.enum(["active", "pending", "banned", "muted"]).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("community_members")
      .select("community_id")
      .eq("id", data.memberId)
      .maybeSingle();
    if (!row) throw new Error("Member not found");
    await assertCommunityOwner(context.supabase, context.userId, row.community_id);
    const payload: Record<string, unknown> = {};
    if (data.role) payload.role = data.role;
    if (data.status) payload.status = data.status;
    const { error } = await context.supabase.from("community_members").update(payload as never).eq("id", data.memberId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Kick (delete) a member. */
export const removeMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { memberId: string }) => z.object({ memberId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("community_members")
      .select("community_id,role")
      .eq("id", data.memberId)
      .maybeSingle();
    if (!row) throw new Error("Member not found");
    if (row.role === "owner") throw new Error("Cannot remove owner");
    await assertCommunityOwner(context.supabase, context.userId, row.community_id);
    const { error } = await context.supabase.from("community_members").delete().eq("id", data.memberId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Join requests ----------

export const listJoinRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, context.userId, data.communityId);
    const { data: rows } = await context.supabase
      .from("community_join_requests")
      .select("id,user_id,message,status,created_at,user:profiles!community_join_requests_user_id_fkey(id,username,avatar_url,avatar_color)")
      .eq("community_id", data.communityId)
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    return rows ?? [];
  });

export const decideJoinRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { requestId: string; approve: boolean }) =>
    z.object({ requestId: z.string().uuid(), approve: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: req } = await context.supabase
      .from("community_join_requests")
      .select("id,community_id,user_id")
      .eq("id", data.requestId)
      .maybeSingle();
    if (!req) throw new Error("Request not found");
    await assertCommunityOwner(context.supabase, context.userId, req.community_id);

    if (data.approve) {
      await context.supabase.from("community_members").upsert({
        community_id: req.community_id,
        user_id: req.user_id,
        role: "member",
        status: "active",
      }, { onConflict: "community_id,user_id" });
    }
    await context.supabase
      .from("community_join_requests")
      .update({ status: data.approve ? "approved" : "rejected" })
      .eq("id", data.requestId);
    return { ok: true };
  });

// ---------- Invites ----------

export const listInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, context.userId, data.communityId);
    const { data: rows } = await context.supabase
      .from("community_invites")
      .select("*")
      .eq("community_id", data.communityId)
      .order("created_at", { ascending: false })
      .limit(100);
    return rows ?? [];
  });

export const createInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string; maxUses?: number; expiresAt?: string | null }) =>
    z.object({
      communityId: z.string().uuid(),
      maxUses: z.number().int().min(1).max(100000).optional(),
      expiresAt: z.string().datetime().nullable().optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, context.userId, data.communityId);
    const { randomBytes } = await import("node:crypto");
    const code = randomBytes(6).toString("base64url");
    const { error, data: row } = await context.supabase
      .from("community_invites")
      .insert({
        community_id: data.communityId,
        code,
        created_by: context.userId,
        max_uses: data.maxUses ?? null,
        expires_at: data.expiresAt ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const revokeInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { inviteId: string }) => z.object({ inviteId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: inv } = await context.supabase
      .from("community_invites")
      .select("community_id")
      .eq("id", data.inviteId)
      .maybeSingle();
    if (!inv) throw new Error("Invite not found");
    await assertCommunityOwner(context.supabase, context.userId, inv.community_id);
    const { error } = await context.supabase.from("community_invites").delete().eq("id", data.inviteId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- My-community shortcut ----------

/** Get the community owned by the current user (if any). */
export const getMyCommunity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: row } = await context.supabase
      .from("communities")
      .select("*")
      .eq("owner_id", context.userId)
      .maybeSingle();
    return row as any;
  });

/**
 * Public-facing member directory for PUBLIC communities. Requires no auth —
 * signed-out visitors can browse.
 *
 * For non-public privacy modes this returns [], and the client should call
 * `listCommunityMembersAuthed` (which requires a signed-in active member).
 * No fake/guest identity is created anywhere.
 */
export const listCommunityMembersPublic = createServerFn({ method: "GET" })
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: comm, error: commErr } = await supabaseAdmin
      .from("communities")
      .select("id,privacy_mode,status")
      .eq("id", data.communityId)
      .maybeSingle();
    if (commErr) throw new Error(commErr.message);
    if (!comm || comm.status !== "active" || comm.privacy_mode !== "public") return [];

    const { data: rows, error } = await supabaseAdmin
      .from("community_members")
      .select("id,user_id,role,status,created_at,user:profiles!community_members_user_id_fkey(id,username,display_name,avatar_url,avatar_color)")
      .eq("community_id", data.communityId)
      .eq("status", "active")
      .order("role", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/**
 * Member directory for non-public communities. Requires the caller to be an
 * active member (or the owner). Returns [] otherwise.
 */
export const listCommunityMembersAuthed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: membership } = await context.supabase
      .from("community_members")
      .select("role,status")
      .eq("community_id", data.communityId)
      .eq("user_id", context.userId)
      .maybeSingle();
    const isActive = !!membership && membership.status === "active";
    if (!isActive) {
      // Owners always allowed even if they somehow lack a member row.
      const { data: comm } = await context.supabase
        .from("communities")
        .select("owner_id")
        .eq("id", data.communityId)
        .maybeSingle();
      if (!comm || comm.owner_id !== context.userId) return [];
    }
    const { data: rows, error } = await context.supabase
      .from("community_members")
      .select("id,user_id,role,status,created_at,user:profiles!community_members_user_id_fkey(id,username,display_name,avatar_url,avatar_color)")
      .eq("community_id", data.communityId)
      .eq("status", "active")
      .order("role", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

// =========================================================================
// VISIBILITY & DISCOVERY (owner-only, separate from privacy)
// =========================================================================

/**
 * Update discovery visibility. Separate from privacy_mode:
 *   - privacy_mode controls who can ENTER
 *   - visibility controls who can DISCOVER
 * Also lets the owner set category / tags / language / country used by
 * the discovery directory. is_featured/is_verified/is_official are
 * platform-admin flags and NOT settable here.
 */
export const updateCommunityVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    communityId: string;
    visibility: CommunityVisibility;
    category?: string | null;
    tags?: string[];
    language?: string | null;
    country?: string | null;
    confirmLargeChange?: boolean;
  }) => z.object({
    communityId: z.string().uuid(),
    visibility: z.enum(["public", "hidden", "unlisted", "featured_only"]),
    category: z.string().max(60).nullable().optional(),
    tags: z.array(z.string().min(1).max(30)).max(15).optional(),
    language: z.string().max(10).nullable().optional(),
    country: z.string().max(10).nullable().optional(),
    confirmLargeChange: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    // Only the owner can change visibility (not moderators, not platform admins
    // — admins can still see hidden communities, but they should not silently
    // hide someone else's community).
    const { data: comm } = await context.supabase
      .from("communities")
      .select("owner_id,visibility,member_count")
      .eq("id", data.communityId)
      .maybeSingle();
    if (!comm) throw new Error("Community not found");
    if (comm.owner_id !== context.userId) throw new Error("Only the community owner can change visibility");

    // Safety confirmation for large communities going Public → Hidden.
    if (
      comm.visibility === "public" &&
      data.visibility === "hidden" &&
      (comm.member_count ?? 0) > 10_000 &&
      !data.confirmLargeChange
    ) {
      throw new Error("CONFIRM_LARGE_HIDE");
    }

    const payload: Record<string, unknown> = { visibility: data.visibility };
    if (data.category !== undefined) payload.category = data.category;
    if (data.tags !== undefined) payload.tags = data.tags;
    if (data.language !== undefined) payload.language = data.language;
    if (data.country !== undefined) payload.country = data.country;

    const { error } = await context.supabase
      .from("communities")
      .update(payload as never)
      .eq("id", data.communityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// =========================================================================
// TRUST & VERIFICATION
// =========================================================================

export type VerificationStatus = "not_verified" | "pending" | "needs_changes" | "rejected" | "approved";

export interface CommunityVerificationRequest {
  id: string;
  community_id: string;
  submitted_by: string;
  status: VerificationStatus;
  community_name: string;
  website: string | null;
  socials: Record<string, string>;
  business_email: string | null;
  reason: string | null;
  doc_urls: string[];
  admin_notes: string | null;
  history: Array<{ at: string; by: string | null; action: string; note?: string }>;
  decided_by: string | null;
  decided_at: string | null;
  created_at: string;
  updated_at: string;
}

const verificationInput = z.object({
  communityId: z.string().uuid(),
  community_name: z.string().min(1).max(120),
  website: z.string().url().max(300).nullable().optional(),
  socials: z.record(z.string().max(300)).optional(),
  business_email: z.string().email().max(200).nullable().optional(),
  reason: z.string().max(2000).nullable().optional(),
  doc_urls: z.array(z.string().url().max(500)).max(10).optional(),
});

/** Owner submits (or resubmits after "needs_changes") a verification request. */
export const submitVerificationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => verificationInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, context.userId, data.communityId);

    // If an open request exists (pending / needs_changes), update it. Otherwise insert new.
    const { data: existing } = await context.supabase
      .from("community_verification_requests" as never)
      .select("id,status,history")
      .eq("community_id", data.communityId)
      .in("status", ["pending", "needs_changes"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date().toISOString();
    const payload = {
      community_name: data.community_name,
      website: data.website ?? null,
      socials: data.socials ?? {},
      business_email: data.business_email ?? null,
      reason: data.reason ?? null,
      doc_urls: data.doc_urls ?? [],
      status: "pending" as const,
    };

    if (existing) {
      const nextHistory = [
        ...((existing as any).history ?? []),
        { at: now, by: context.userId, action: (existing as any).status === "needs_changes" ? "resubmitted" : "updated" },
      ];
      const { error } = await context.supabase
        .from("community_verification_requests" as never)
        .update({ ...payload, history: nextHistory } as never)
        .eq("id", (existing as any).id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await context.supabase
        .from("community_verification_requests" as never)
        .insert({
          ...payload,
          community_id: data.communityId,
          submitted_by: context.userId,
          history: [{ at: now, by: context.userId, action: "submitted" }],
        } as never);
      if (error) throw new Error(error.message);
    }

    // Reflect status on the community for cheap reads
    await context.supabase
      .from("communities")
      .update({ verification_status: "pending" } as never)
      .eq("id", data.communityId);

    return { ok: true };
  });

/** Owner reads the latest verification request for their community. */
export const getMyVerificationRequest = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, context.userId, data.communityId);
    const { data: row } = await context.supabase
      .from("community_verification_requests" as never)
      .select("*")
      .eq("community_id", data.communityId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return (row ?? null) as CommunityVerificationRequest | null;
  });

async function assertPlatformAdmin(supabase: any, userId: string) {
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  const { data: isSuper } = await supabase.rpc("has_role", { _user_id: userId, _role: "super_admin" });
  if (!isAdmin && !isSuper) throw new Error("Forbidden");
}

/** Admin: list verification requests, optionally filtered by status. */
export const adminListVerificationRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: VerificationStatus | "all" }) =>
    z.object({ status: z.enum(["all", "pending", "needs_changes", "rejected", "approved"]).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertPlatformAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("community_verification_requests" as never)
      .select("*, community:communities!community_verification_requests_community_id_fkey(id,slug,name,logo_url,banner_url,accent_color,member_count,is_verified,is_official,is_partner,is_trusted)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as any[];
  });

const decideInput = z.object({
  requestId: z.string().uuid(),
  action: z.enum(["approve", "reject", "needs_changes"]),
  admin_notes: z.string().max(2000).optional(),
  // Independent badge flags applied on approve. Ignored otherwise.
  is_verified: z.boolean().optional(),
  is_official: z.boolean().optional(),
  is_partner: z.boolean().optional(),
  is_trusted: z.boolean().optional(),
});

/** Admin: approve / reject / request changes. Sets community badge flags on approve. */
export const adminDecideVerificationRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => decideInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertPlatformAdmin(context.supabase, context.userId);
    const { data: req, error: rerr } = await context.supabase
      .from("community_verification_requests" as never)
      .select("id,community_id,status,history")
      .eq("id", data.requestId)
      .maybeSingle();
    if (rerr) throw new Error(rerr.message);
    if (!req) throw new Error("Request not found");

    const nextStatus: VerificationStatus =
      data.action === "approve" ? "approved" : data.action === "reject" ? "rejected" : "needs_changes";
    const now = new Date().toISOString();
    const history = [
      ...(((req as any).history ?? []) as any[]),
      { at: now, by: context.userId, action: data.action, note: data.admin_notes ?? undefined },
    ];

    const { error: uerr } = await context.supabase
      .from("community_verification_requests" as never)
      .update({
        status: nextStatus,
        admin_notes: data.admin_notes ?? null,
        history,
        decided_by: context.userId,
        decided_at: now,
      } as never)
      .eq("id", data.requestId);
    if (uerr) throw new Error(uerr.message);

    // Update community reflection + badge flags
    const patch: Record<string, unknown> = { verification_status: nextStatus };
    if (data.action === "approve") {
      if (data.is_verified !== undefined) patch.is_verified = data.is_verified;
      if (data.is_official !== undefined) patch.is_official = data.is_official;
      if (data.is_partner !== undefined) patch.is_partner = data.is_partner;
      if (data.is_trusted !== undefined) patch.is_trusted = data.is_trusted;
      // Default: if admin didn't set any flag, at least mark verified.
      if (
        data.is_verified === undefined &&
        data.is_official === undefined &&
        data.is_partner === undefined &&
        data.is_trusted === undefined
      ) {
        patch.is_verified = true;
      }
    } else if (data.action === "reject") {
      // Clear verified/official on explicit rejection so cards no longer show badges.
      patch.is_verified = false;
      patch.is_official = false;
      patch.is_partner = false;
      patch.is_trusted = false;
    }

    const { error: cerr } = await context.supabase
      .from("communities")
      .update(patch as never)
      .eq("id", (req as any).community_id);
    if (cerr) throw new Error(cerr.message);

    return { ok: true, status: nextStatus };
  });

// =========================================================================
// INVITE LANDING (public preview — no instant join)
// =========================================================================

/**
 * Public read for an invite code. Returns the invite's community preview
 * plus a validity flag. Never creates a membership. Guests may preview.
 */
export const getInviteLanding = createServerFn({ method: "GET" })
  .inputValidator((d: { code: string }) => z.object({ code: z.string().min(3).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await serverPublicClient();
    const { data: inv } = await sb
      .from("community_invites")
      .select("id,community_id,code,max_uses,uses,expires_at,created_at")
      .eq("code", data.code)
      .maybeSingle();
    if (!inv) return { valid: false as const, reason: "not_found" as const, community: null, invite: null };

    const expired = inv.expires_at && new Date(inv.expires_at as string).getTime() < Date.now();
    const exhausted = inv.max_uses != null && (inv.uses ?? 0) >= (inv.max_uses as number);

    const { data: comm } = await sb
      .from("communities")
      .select("id,slug,name,description,welcome_text,logo_url,banner_url,accent_color,rules,privacy_mode,visibility,category,tags,is_featured,is_verified,is_official,is_partner,is_trusted,verification_status,language,country,status,member_count,online_count,owner_id")
      .eq("id", inv.community_id as string)
      .eq("status", "active")
      .maybeSingle();

    if (!comm) return { valid: false as const, reason: "community_missing" as const, community: null, invite: inv };

    // Owner display name (best-effort, public columns only)
    const { data: owner } = await sb
      .from("profiles")
      .select("id,username,display_name,avatar_url")
      .eq("id", (comm as any).owner_id as string)
      .maybeSingle();

    const reason: "expired" | "exhausted" | null = expired ? "expired" : exhausted ? "exhausted" : null;
    return {
      valid: !reason,
      reason,
      community: { ...(comm as any), is_partner: (comm as any).is_partner ?? false, is_trusted: (comm as any).is_trusted ?? false, verification_status: (comm as any).verification_status ?? "not_verified" },
      invite: inv,
      owner: owner ?? null,
    };
  });

// =========================================================================
// PREMIUM URL CLAIM SYSTEM (Phase 3)
// =========================================================================

export type PremiumSlugRequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface PremiumSlugRequest {
  id: string;
  community_id: string;
  requested_by: string;
  current_slug: string;
  requested_slug: string;
  reason: string | null;
  status: PremiumSlugRequestStatus;
  review_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

/** Resolve a slug: returns the community's current slug if the incoming slug is an old alias. */
export const resolveCommunitySlug = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data }) => {
    const sb = await serverPublicClient();
    // Check active slug first
    const { data: active } = await sb
      .from("communities")
      .select("slug")
      .eq("slug", data.slug)
      .maybeSingle();
    if (active) return { slug: (active as any).slug, redirected: false };
    // Check history
    const { data: hist } = await sb
      .from("community_slug_history" as never)
      .select("community_id")
      .eq("old_slug", data.slug)
      .maybeSingle();
    if (!hist) return { slug: null, redirected: false };
    const { data: comm } = await sb
      .from("communities")
      .select("slug")
      .eq("id", (hist as any).community_id)
      .maybeSingle();
    if (!comm) return { slug: null, redirected: false };
    return { slug: (comm as any).slug as string, redirected: true };
  });

/** Owner: submit a request to claim a new (usually premium) slug for their community. */
export const requestPremiumSlug = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string; requestedSlug: string; reason?: string }) =>
    z.object({
      communityId: z.string().uuid(),
      requestedSlug: z.string().min(2).max(40).regex(SLUG_RE, "Invalid slug format"),
      reason: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const requested = data.requestedSlug.toLowerCase();

    // Ownership check
    const { data: comm } = await supabase
      .from("communities")
      .select("id,slug,owner_id")
      .eq("id", data.communityId)
      .maybeSingle();
    if (!comm) throw new Error("Community not found");
    if ((comm as any).owner_id !== userId) throw new Error("Only the owner can request a premium URL");
    if ((comm as any).slug === requested) throw new Error("This is already your slug");

    // Reserved-route conflict
    const { isReservedSlug } = await import("./reserved-routes");
    if (isReservedSlug(requested)) throw new Error("This slug is reserved by the platform");

    // Already in use by another community
    const { data: taken } = await supabase
      .from("communities")
      .select("id")
      .eq("slug", requested)
      .maybeSingle();
    if (taken) throw new Error("This slug is already in use");

    // Already claimed in slug history by another community
    const { data: hist } = await supabase
      .from("community_slug_history" as never)
      .select("community_id")
      .eq("old_slug", requested)
      .maybeSingle();
    if (hist && (hist as any).community_id !== data.communityId) {
      throw new Error("This slug was previously used by another community");
    }

    // Pending duplicate
    const { data: pending } = await supabase
      .from("community_premium_slug_requests" as never)
      .select("id")
      .eq("requested_slug", requested)
      .eq("status", "pending")
      .maybeSingle();
    if (pending) throw new Error("Another request is already pending for this slug");

    const { data: row, error } = await supabase
      .from("community_premium_slug_requests" as never)
      .insert({
        community_id: data.communityId,
        requested_by: userId,
        current_slug: (comm as any).slug,
        requested_slug: requested,
        reason: data.reason ?? null,
      } as never)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as PremiumSlugRequest;
  });

/** Owner or admin: list requests for a community. */
export const listPremiumSlugRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) =>
    z.object({ communityId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("community_premium_slug_requests" as never)
      .select("*")
      .eq("community_id", data.communityId)
      .order("created_at", { ascending: false });
    return (rows ?? []) as unknown as PremiumSlugRequest[];
  });

/** Owner: cancel a pending request. */
export const cancelPremiumSlugRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { requestId: string }) =>
    z.object({ requestId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("community_premium_slug_requests" as never)
      .update({ status: "cancelled" } as never)
      .eq("id", data.requestId)
      .eq("requested_by", context.userId)
      .eq("status", "pending");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin: list all premium slug requests, optionally filtered by status. */
export const adminListPremiumSlugRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { status?: PremiumSlugRequestStatus | "all" }) =>
    z.object({ status: z.enum(["all", "pending", "approved", "rejected", "cancelled"]).optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertPlatformAdmin(context.supabase, context.userId);
    let q = context.supabase
      .from("community_premium_slug_requests" as never)
      .select("*, community:communities!community_premium_slug_requests_community_id_fkey(id,slug,name,logo_url,banner_url,accent_color,member_count,is_verified,is_official,is_partner,is_trusted)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data.status && data.status !== "all") q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []) as any[];
  });

/** Admin: approve or reject a premium slug request. On approve, rename the community + record history. */
export const reviewPremiumSlugRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { requestId: string; decision: "approved" | "rejected"; note?: string }) =>
    z.object({
      requestId: z.string().uuid(),
      decision: z.enum(["approved", "rejected"]),
      note: z.string().max(500).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertPlatformAdmin(supabase, userId);

    const { data: req } = await supabase
      .from("community_premium_slug_requests" as never)
      .select("id,community_id,current_slug,requested_slug,status")
      .eq("id", data.requestId)
      .maybeSingle();
    if (!req) throw new Error("Request not found");
    if ((req as any).status !== "pending") throw new Error("Request is not pending");

    if (data.decision === "rejected") {
      const { error } = await supabase
        .from("community_premium_slug_requests" as never)
        .update({
          status: "rejected",
          review_note: data.note ?? null,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
        } as never)
        .eq("id", data.requestId);
      if (error) throw new Error(error.message);
      return { ok: true, applied: false };
    }

    // Approve: rename community, record old slug in history, mark tier premium.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const requested = (req as any).requested_slug as string;
    const communityId = (req as any).community_id as string;
    const currentSlug = (req as any).current_slug as string;

    // Re-verify slug is still free
    const { data: taken } = await supabaseAdmin
      .from("communities")
      .select("id")
      .eq("slug", requested)
      .neq("id", communityId)
      .maybeSingle();
    if (taken) throw new Error("Slug was taken by another community");

    // Determine tier
    const { isPremiumSlug } = await import("./premium-slugs");
    const tier = isPremiumSlug(requested) ? "premium" : "standard";

    // Record old slug in history (ignore duplicate — same community re-claiming)
    if (currentSlug && currentSlug !== requested) {
      await supabaseAdmin
        .from("community_slug_history" as never)
        .upsert({ community_id: communityId, old_slug: currentSlug } as never, { onConflict: "old_slug" });
    }

    // Rename community
    const { error: upErr } = await supabaseAdmin
      .from("communities")
      .update({ slug: requested, slug_tier: tier } as never)
      .eq("id", communityId);
    if (upErr) throw new Error(upErr.message);

    // Mark request approved
    const { error: rvErr } = await supabaseAdmin
      .from("community_premium_slug_requests" as never)
      .update({
        status: "approved",
        review_note: data.note ?? null,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      } as never)
      .eq("id", data.requestId);
    if (rvErr) throw new Error(rvErr.message);

    return { ok: true, applied: true, newSlug: requested };
  });

// =========================================================================
// ARCHIVE MODE + ANALYTICS (Phase 4)
// =========================================================================

// (uses existing assertOwner defined above)

/** Owner: archive a community. Hides it from discovery and freezes the surface (read-only). */
export const archiveCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, data.communityId, context.userId);
    const { error } = await context.supabase
      .from("communities")
      .update({ status: "archived" } as never)
      .eq("id", data.communityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Owner: restore an archived community. */
export const restoreCommunity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, data.communityId, context.userId);
    const { error } = await context.supabase
      .from("communities")
      .update({ status: "active" } as never)
      .eq("id", data.communityId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export interface CommunityAnalytics {
  memberCount: number;
  onlineCount: number;
  membersLast7d: number;
  membersLast30d: number;
  postCount: number;
  postsLast7d: number;
  chatroomCount: number;
  competitionCount: number;
  growthByDay: { day: string; count: number }[];
}

/** Owner: community analytics overview. */
export const getCommunityAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertCommunityOwner(context.supabase, data.communityId, context.userId);
    const cid = data.communityId;
    const now = new Date();
    const d7 = new Date(now.getTime() - 7 * 24 * 3600 * 1000).toISOString();
    const d30 = new Date(now.getTime() - 30 * 24 * 3600 * 1000).toISOString();

    const sb = context.supabase;

    const [{ data: comm }, m7, m30, posts, posts7, rooms, comps, growth] = await Promise.all([
      sb.from("communities").select("member_count,online_count").eq("id", cid).maybeSingle(),
      sb.from("community_members").select("id", { count: "exact", head: true }).eq("community_id", cid).gte("joined_at", d7),
      sb.from("community_members").select("id", { count: "exact", head: true }).eq("community_id", cid).gte("joined_at", d30),
      sb.from("posts").select("id", { count: "exact", head: true }).eq("community_id", cid),
      sb.from("posts").select("id", { count: "exact", head: true }).eq("community_id", cid).gte("created_at", d7),
      sb.from("chatrooms").select("id", { count: "exact", head: true }).eq("community_id", cid),
      sb.from("competitions").select("id", { count: "exact", head: true }).eq("community_id", cid),
      sb.from("community_members").select("joined_at").eq("community_id", cid).gte("joined_at", d30),
    ]);

    // Bucket growth by day
    const buckets = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const row of ((growth.data ?? []) as any[])) {
      const day = String(row.joined_at ?? "").slice(0, 10);
      if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
    }
    const growthByDay = Array.from(buckets.entries()).map(([day, count]) => ({ day, count }));

    return {
      memberCount: (comm as any)?.member_count ?? 0,
      onlineCount: (comm as any)?.online_count ?? 0,
      membersLast7d: m7.count ?? 0,
      membersLast30d: m30.count ?? 0,
      postCount: posts.count ?? 0,
      postsLast7d: posts7.count ?? 0,
      chatroomCount: rooms.count ?? 0,
      competitionCount: comps.count ?? 0,
      growthByDay,
    } satisfies CommunityAnalytics;
  });

/** Admin: platform-wide community reporting overview. */
export const adminCommunityReport = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertPlatformAdmin(context.supabase, context.userId);
    const sb = context.supabase;
    const d7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const [all, active, archived, verified, official, featured, recent, top] = await Promise.all([
      sb.from("communities").select("id", { count: "exact", head: true }),
      sb.from("communities").select("id", { count: "exact", head: true }).eq("status", "active"),
      sb.from("communities").select("id", { count: "exact", head: true }).eq("status", "archived"),
      sb.from("communities").select("id", { count: "exact", head: true }).eq("is_verified", true),
      sb.from("communities").select("id", { count: "exact", head: true }).eq("is_official", true),
      sb.from("communities").select("id", { count: "exact", head: true }).eq("is_featured", true),
      sb.from("communities").select("id", { count: "exact", head: true }).gte("created_at", d7),
      sb.from("communities")
        .select("id,slug,name,logo_url,banner_url,accent_color,member_count,online_count,is_verified,is_official,is_partner,is_trusted,status")
        .eq("status", "active")
        .order("member_count", { ascending: false })
        .limit(10),
    ]);

    return {
      totals: {
        all: all.count ?? 0,
        active: active.count ?? 0,
        archived: archived.count ?? 0,
        verified: verified.count ?? 0,
        official: official.count ?? 0,
        featured: featured.count ?? 0,
        newLast7d: recent.count ?? 0,
      },
      topByMembers: (top.data ?? []) as any[],
    };
  });

