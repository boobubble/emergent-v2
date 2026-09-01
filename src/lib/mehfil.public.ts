import { publishedLookupResult } from "@/lib/fetch-published-page";
import type { MehfilPoem, MehfilPoemEnriched, WriterRank } from "@/lib/mehfil-types";

type PoemDbClient = {
  from: (table: string) => {
    select: (columns: string) => any;
  };
};

type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
};

async function loadPoemDb(sb?: PoemDbClient): Promise<PoemDbClient> {
  if (sb) return sb;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as PoemDbClient;
}

async function attachAuthorsAndCats(
  sb: PoemDbClient,
  poems: MehfilPoem[],
): Promise<MehfilPoemEnriched[]> {
  if (poems.length === 0) return [];
  const authorIds = Array.from(new Set(poems.map((p) => p.author_id)));
  const catIds = Array.from(
    new Set(poems.map((p) => p.category_id).filter((v): v is string => !!v)),
  );
  const poemIds = poems.map((p) => p.id);

  const [profilesRes, catsRes, statsRes, rxRes] = await Promise.all([
    sb.from("profiles")
      .select("id, username, display_name, avatar_url, country_code")
      .in("id", authorIds),
    catIds.length
      ? sb.from("mehfil_categories").select("id, slug, name, color, icon").in("id", catIds)
      : Promise.resolve({ data: [] as Array<{ id: string; slug: string; name: string; color: string | null; icon: string | null }>, error: null }),
    sb.from("mehfil_writer_stats").select("user_id, writer_rank").in("user_id", authorIds),
    poemIds.length
      ? sb.from("reactions").select("target_id").eq("target_type", "mehfil_poem").in("target_id", poemIds)
      : Promise.resolve({ data: [] as Array<{ target_id: string }>, error: null }),
  ]);

  const profiles = publishedLookupResult(
    (profilesRes.data ?? []) as ProfileRow[],
    profilesRes.error,
    "Failed to load poem authors",
  ) ?? [];
  const cats = publishedLookupResult(
    (catsRes.data ?? []) as Array<{ id: string; slug: string; name: string; color: string | null; icon: string | null }>,
    catsRes.error,
    "Failed to load poem categories",
  ) ?? [];
  const stats = publishedLookupResult(
    (statsRes.data ?? []) as Array<{ user_id: string; writer_rank: WriterRank }>,
    statsRes.error,
    "Failed to load writer stats",
  ) ?? [];
  const rxRows = publishedLookupResult(
    (rxRes.data ?? []) as Array<{ target_id: string }>,
    rxRes.error,
    "Failed to load poem reactions",
  ) ?? [];

  const pmap = new Map<string, ProfileRow>();
  profiles.forEach((p) => pmap.set(p.id, p));
  const cmap = new Map<string, { id: string; slug: string; name: string; color: string | null; icon: string | null }>();
  cats.forEach((c) => cmap.set(c.id, c));
  const smap = new Map<string, WriterRank>();
  stats.forEach((s) => smap.set(s.user_id, s.writer_rank));
  const rxmap = new Map<string, number>();
  rxRows.forEach((r) => {
    rxmap.set(r.target_id, (rxmap.get(r.target_id) ?? 0) + 1);
  });

  return poems.map((p): MehfilPoemEnriched => {
    const prof = pmap.get(p.author_id);
    return {
      ...p,
      category: p.category_id ? cmap.get(p.category_id) ?? null : null,
      author: prof
        ? {
            id: prof.id,
            username: prof.username ?? "anonymous",
            display_name: prof.display_name,
            avatar_url: prof.avatar_url,
            country_code: prof.country_code,
          }
        : null,
      writer_rank: smap.get(p.author_id) ?? "fresh_writer",
      reaction_count: rxmap.get(p.id) ?? 0,
    };
  });
}

/**
 * SSR-safe published poem by slug. Uses service-role client — never the browser
 * supabase proxy. Miss → null (404). Unexpected query error throws (500).
 */
export async function getPublishedPoemBySlug(
  slug: string,
  sb?: PoemDbClient,
): Promise<MehfilPoemEnriched | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  const db = await loadPoemDb(sb);
  const { data, error } = await db
    .from("mehfil_poems")
    .select("*")
    .eq("slug", trimmed)
    .eq("status", "published")
    .maybeSingle();
  const poem = publishedLookupResult(data as MehfilPoem | null, error, "Failed to load poem");
  if (!poem) return null;
  const [enriched] = await attachAuthorsAndCats(db, [poem]);
  return enriched ?? null;
}
