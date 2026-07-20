/**
 * Poetry Hub — social layer.
 *
 * Follows are a dedicated one-way graph (poetry_writer_follows). Collections
 * live in poetry_collections + poetry_collection_items. All writes use the
 * authenticated Supabase client; reads mix authenticated + publishable
 * clients depending on whether we need the current viewer's context.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

function slugify(name: string): string {
  return (name || "collection")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40) || "collection";
}

// ---------------------------------------------------------------------------
// Follows
// ---------------------------------------------------------------------------

export const followWriter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { writerId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.writerId === userId) throw new Error("You cannot follow yourself");
    const { error } = await (supabase.from as any)("poetry_writer_follows")
      .insert({ follower_id: userId, writer_id: data.writerId });
    if (error && !`${error.message}`.includes("duplicate")) throw error;
    return { ok: true, following: true };
  });

export const unfollowWriter = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { writerId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await (supabase.from as any)("poetry_writer_follows")
      .delete().eq("follower_id", userId).eq("writer_id", data.writerId);
    if (error) throw error;
    return { ok: true, following: false };
  });

export const isFollowingWriter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { writerId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row } = await (supabase.from as any)("poetry_writer_follows")
      .select("id").eq("follower_id", userId).eq("writer_id", data.writerId).maybeSingle();
    return { following: !!row };
  });

type ProfileLite = { id: string; username: string | null; display_name: string | null; avatar_url: string | null };

async function attachProfiles(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, ProfileLite>();
  const sb = publicClient();
  const { data } = await sb.from("profiles").select("id,username,display_name,avatar_url").in("id", userIds);
  const map = new Map<string, ProfileLite>();
  for (const r of (data ?? []) as ProfileLite[]) map.set(r.id, r);
  return map;
}

export const listFollowers = createServerFn({ method: "GET" })
  .inputValidator((input: { userId: string; limit?: number }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows } = await (sb.from as any)("poetry_writer_follows")
      .select("follower_id,created_at")
      .eq("writer_id", data.userId)
      .order("created_at", { ascending: false })
      .limit(Math.min(data.limit ?? 100, 500));
    const list = (rows ?? []) as { follower_id: string; created_at: string }[];
    const profiles = await attachProfiles(list.map((r) => r.follower_id));
    return list.map((r) => ({ ...profiles.get(r.follower_id), followed_at: r.created_at })).filter((r) => r.id);
  });

export const listFollowing = createServerFn({ method: "GET" })
  .inputValidator((input: { userId: string; limit?: number }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows } = await (sb.from as any)("poetry_writer_follows")
      .select("writer_id,created_at")
      .eq("follower_id", data.userId)
      .order("created_at", { ascending: false })
      .limit(Math.min(data.limit ?? 100, 500));
    const list = (rows ?? []) as { writer_id: string; created_at: string }[];
    const profiles = await attachProfiles(list.map((r) => r.writer_id));
    return list.map((r) => ({ ...profiles.get(r.writer_id), followed_at: r.created_at })).filter((r) => r.id);
  });

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export const createCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; description?: string; isPublic?: boolean; coverUrl?: string | null }) => {
    if (!input.name?.trim()) throw new Error("Name is required");
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const base = slugify(data.name);
    const slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data: row, error } = await (supabase.from as any)("poetry_collections")
      .insert({
        user_id: userId,
        name: data.name.trim(),
        slug,
        description: data.description?.trim() ?? null,
        cover_url: data.coverUrl ?? null,
        is_public: data.isPublic ?? true,
      })
      .select("*").single();
    if (error) throw error;
    return row;
  });

export const deleteCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { collectionId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await (supabase.from as any)("poetry_collections")
      .delete().eq("id", data.collectionId).eq("user_id", userId);
    if (error) throw error;
    return { ok: true };
  });

export const addToCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { collectionId: string; poemId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await (supabase.from as any)("poetry_collection_items")
      .insert({ collection_id: data.collectionId, poem_id: data.poemId });
    if (error && !`${error.message}`.includes("duplicate")) throw error;
    return { ok: true };
  });

export const removeFromCollection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { collectionId: string; poemId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await (supabase.from as any)("poetry_collection_items")
      .delete().eq("collection_id", data.collectionId).eq("poem_id", data.poemId);
    if (error) throw error;
    return { ok: true };
  });

export const listMyCollections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await (supabase.from as any)("poetry_collections")
      .select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(200);
    return (data ?? []) as Array<{ id: string; name: string; slug: string; description: string | null; is_public: boolean; poem_count: number; cover_url: string | null }>;
  });

/** Public collections for a user (profile view). */
export const listUserCollections = createServerFn({ method: "GET" })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows } = await (sb.from as any)("poetry_collections")
      .select("id,name,slug,description,cover_url,poem_count,is_public")
      .eq("user_id", data.userId).eq("is_public", true)
      .order("updated_at", { ascending: false }).limit(50);
    return (rows ?? []) as Array<{ id: string; name: string; slug: string; description: string | null; cover_url: string | null; poem_count: number; is_public: boolean }>;
  });
