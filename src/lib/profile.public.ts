import { publishedLookupResult } from "@/lib/fetch-published-page";

export type PublicProfileSeoRow = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_private: boolean | null;
};

type ProfileDbClient = {
  from: (table: string) => {
    select: (columns: string) => any;
  };
};

/** Route param → username. Rejects empty / wildcard / UUID-as-id lookups. */
export function normalizeProfileUsernameParam(raw: string): string | null {
  const username = raw.trim();
  if (!username || username.length > 32) return null;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(username)) {
    return null;
  }
  if (!/^[a-zA-Z0-9_ ]+$/.test(username)) return null;
  return username;
}

/** Escape ILIKE wildcards so `_` in usernames is matched literally. */
export function escapeIlikeExact(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

async function loadProfileDb(sb?: ProfileDbClient): Promise<ProfileDbClient> {
  if (sb) return sb;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as ProfileDbClient;
}

/**
 * SSR-safe public profile by username.
 * Uses the service-role client — never the browser supabase proxy.
 * Miss → null (404). Unexpected query error throws (500).
 */
export async function getPublicProfileByUsername(
  username: string,
  sb?: ProfileDbClient,
): Promise<PublicProfileSeoRow | null> {
  const normalized = normalizeProfileUsernameParam(username);
  if (!normalized) return null;
  const db = await loadProfileDb(sb);
  const { data, error } = await db
    .from("profiles")
    .select("id,username,display_name,bio,avatar_url,is_private")
    .ilike("username", escapeIlikeExact(normalized))
    .limit(2);
  const rows = publishedLookupResult(
    (data ?? []) as PublicProfileSeoRow[],
    error,
    "Failed to load profile",
  );
  if (!rows || rows.length === 0) return null;
  const exact = rows.find((r) => r.username.toLowerCase() === normalized.toLowerCase());
  return exact ?? rows[0] ?? null;
}
