import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Types ----------
export type CommunityPrivacy = "public" | "private" | "invite_only" | "password" | "invite_password";
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
      .select("id,owner_id,slug,name,description,welcome_text,logo_url,banner_url,background_url,accent_color,rules,announcement,social_links,privacy_mode,status,member_count,online_count,meta,created_at,updated_at")
      .eq("slug", data.slug)
      .eq("status", "active")
      .maybeSingle();
    if (!row) return null;
    return row as any;
  });

/** List active public communities (for a directory page). */
export const listPublicCommunities = createServerFn({ method: "GET" })
  .handler(async () => {
    const sb = await serverPublicClient();
    const { data } = await sb
      .from("communities")
      .select("id,slug,name,description,logo_url,banner_url,accent_color,privacy_mode,member_count")
      .eq("status", "active")
      .order("member_count", { ascending: false })
      .limit(60);
    return data ?? [];
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
    await assertOwner(context.supabase, context.userId, data.communityId);
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
      .update(payload)
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
    await assertOwner(context.supabase, context.userId, data.communityId);
    const payload: Record<string, unknown> = { privacy_mode: data.privacy_mode };
    const needsPassword = data.privacy_mode === "password" || data.privacy_mode === "invite_password";
    if (needsPassword && data.password) {
      payload.join_password_hash = await hashPassword(data.password);
    } else if (!needsPassword) {
      payload.join_password_hash = null;
    }
    const { error } = await context.supabase.from("communities").update(payload).eq("id", data.communityId);
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
    await assertOwner(context.supabase, context.userId, data.communityId);
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
    await assertOwner(context.supabase, context.userId, row.community_id);
    const payload: Record<string, unknown> = {};
    if (data.role) payload.role = data.role;
    if (data.status) payload.status = data.status;
    const { error } = await context.supabase.from("community_members").update(payload).eq("id", data.memberId);
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
    await assertOwner(context.supabase, context.userId, row.community_id);
    const { error } = await context.supabase.from("community_members").delete().eq("id", data.memberId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Join requests ----------

export const listJoinRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { communityId: string }) => z.object({ communityId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertOwner(context.supabase, context.userId, data.communityId);
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
    await assertOwner(context.supabase, context.userId, req.community_id);

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
    await assertOwner(context.supabase, context.userId, data.communityId);
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
    await assertOwner(context.supabase, context.userId, data.communityId);
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
    await assertOwner(context.supabase, context.userId, inv.community_id);
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
    return row as unknown as Community | null;
  });
