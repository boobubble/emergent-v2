/**
 * Mehfil server functions.
 *
 * READS are public-friendly (published poems visible to anon) via a
 * publishable server client, so /mehfil works for guests just like /feed.
 *
 * WRITES require an authenticated caller. XP/Wallet/Notifications are
 * fired via the existing `gam_emit` platform through `gamify()` on the
 * client after a successful publish — no duplicate business logic here.
 */

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import type {
  MehfilCategory,
  MehfilPoem,
  MehfilPoemEnriched,
  MehfilWriterStats,
  MehfilDiscoverySection,
  PoemStatus,
  WriterRank,
} from "./mehfil-types";
import { slugifyTitle } from "./mehfil-types";

// ---------------------------------------------------------------------------
// Server publishable client (public reads only)
// ---------------------------------------------------------------------------

function publicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

// Lightweight profile fetch — avoids the huge profiles.select(*) explosion.
type ProfileRow = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  country_code: string | null;
};

async function attachAuthorsAndCats(
  sb: ReturnType<typeof publicClient>,
  poems: MehfilPoem[],
): Promise<MehfilPoemEnriched[]> {
  if (poems.length === 0) return [];
  const authorIds = Array.from(new Set(poems.map((p) => p.author_id)));
  const catIds = Array.from(
    new Set(poems.map((p) => p.category_id).filter((v): v is string => !!v)),
  );

  const [{ data: profiles }, { data: cats }, { data: stats }] = await Promise.all([
    sb.from("profiles")
      .select("id, username, display_name, avatar_url, country_code")
      .in("id", authorIds),
    catIds.length
      ? sb.from("mehfil_categories").select("id, slug, name, color, icon").in("id", catIds)
      : Promise.resolve({ data: [] as Array<{ id: string; slug: string; name: string; color: string | null; icon: string | null }> }),
    sb.from("mehfil_writer_stats").select("user_id, writer_rank").in("user_id", authorIds),
  ]);

  const pmap = new Map<string, ProfileRow>();
  ((profiles ?? []) as ProfileRow[]).forEach((p) => pmap.set(p.id, p));
  const cmap = new Map<string, { id: string; slug: string; name: string; color: string | null; icon: string | null }>();
  (cats ?? []).forEach((c) => cmap.set(c.id, c));
  const smap = new Map<string, WriterRank>();
  ((stats ?? []) as Array<{ user_id: string; writer_rank: WriterRank }>).forEach((s) => smap.set(s.user_id, s.writer_rank));

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
    };
  });
}

// ---------------------------------------------------------------------------
// Public reads
// ---------------------------------------------------------------------------

export const listMehfilCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("mehfil_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MehfilCategory[];
});

export const getMehfilDiscovery = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const baseSelect = () => sb.from("mehfil_poems").select("*").eq("status", "published");

  const run = async (q: any): Promise<MehfilPoemEnriched[]> => {
    const { data, error } = await q;
    if (error) throw error;
    return attachAuthorsAndCats(sb, (data ?? []) as MehfilPoem[]);
  };

  const [trending, pick, fresh, loved, read, winners] = await Promise.all([
    run(baseSelect().gte("published_at", weekAgo).order("upvote_count", { ascending: false }).order("read_count", { ascending: false }).limit(8)),
    run(baseSelect().eq("is_editors_pick", true).order("published_at", { ascending: false }).limit(8)),
    run(baseSelect().order("published_at", { ascending: false }).limit(8)),
    run(baseSelect().order("upvote_count", { ascending: false }).limit(8)),
    run(baseSelect().order("read_count", { ascending: false }).limit(8)),
    run(baseSelect().not("competition_id", "is", null).order("upvote_count", { ascending: false }).limit(8)),
  ]);

  const { data: risingStats } = await sb
    .from("mehfil_writer_stats")
    .select("user_id, poems_published, total_upvotes, writer_rank")
    .in("writer_rank", ["rising_poet", "poet"])
    .order("total_upvotes", { ascending: false })
    .limit(12);

  const risingIds = (risingStats ?? []).map((s) => s.user_id);
  const { data: risingProfiles } = risingIds.length
    ? await sb.from("profiles").select("id, username, display_name, avatar_url, country_code").in("id", risingIds)
    : { data: [] as ProfileRow[] };

  const sections: MehfilDiscoverySection[] = [
    { key: "trending",       label: "🔥 Trending",        poems: trending },
    { key: "editors_pick",   label: "⭐ Editors Pick",     poems: pick },
    { key: "fresh",          label: "🆕 Fresh Poetry",     poems: fresh },
    { key: "most_loved",     label: "❤️ Most Loved",       poems: loved },
    { key: "most_read",      label: "👁 Most Read",         poems: read },
    { key: "battle_winners", label: "🏆 Battle Winners",   poems: winners },
  ];

  return {
    sections,
    rising: (risingStats ?? []).map((s) => ({
      stats: s,
      profile: (risingProfiles as ProfileRow[] | null | undefined)?.find((p) => p.id === s.user_id) ?? null,
    })),
  };
});

export const listPoemsByCategory = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string; sort?: "new" | "trending" | "top"; limit?: number }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: cat, error: cErr } = await sb
      .from("mehfil_categories").select("*").eq("slug", data.slug).maybeSingle();
    if (cErr) throw cErr;
    if (!cat) return { category: null, poems: [] as MehfilPoemEnriched[] };

    let q = sb.from("mehfil_poems").select("*")
      .eq("status", "published")
      .eq("category_id", cat.id)
      .limit(Math.min(data.limit ?? 40, 100));

    if (data.sort === "trending") q = q.order("upvote_count", { ascending: false });
    else if (data.sort === "top") q = q.order("read_count", { ascending: false });
    else q = q.order("published_at", { ascending: false });

    const { data: poems, error } = await q;
    if (error) throw error;
    const enriched = await attachAuthorsAndCats(sb, (poems ?? []) as MehfilPoem[]);
    return { category: cat as MehfilCategory, poems: enriched };
  });

export const getPoemBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: poem, error } = await sb
      .from("mehfil_poems").select("*")
      .eq("slug", data.slug).eq("status", "published").maybeSingle();
    if (error) throw error;
    if (!poem) return null;
    const [enriched] = await attachAuthorsAndCats(sb, [poem as MehfilPoem]);

    // Fire-and-forget view increment.
    void sb.rpc("mehfil_increment_view", { p_poem_id: poem.id }).then(() => {});
    return enriched;
  });

export const recordPoemRead = createServerFn({ method: "POST" })
  .inputValidator((input: { poemId: string; sessionKey?: string }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.rpc("mehfil_record_read", {
      p_poem_id: data.poemId,
      p_session: data.sessionKey ?? undefined,
    });
    if (error) throw error;
    return { ok: true };
  });

export const getWriterStats = createServerFn({ method: "GET" })
  .inputValidator((input: { userId: string }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: stats } = await sb
      .from("mehfil_writer_stats").select("*").eq("user_id", data.userId).maybeSingle();
    return (stats ?? null) as MehfilWriterStats | null;
  });

export const getMehfilProfileSection = createServerFn({ method: "GET" })
  .inputValidator((input: { username: string; limit?: number }) => input)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: profile } = await sb
      .from("profiles")
      .select("id, username, display_name, avatar_url, country_code")
      .ilike("username", data.username)
      .maybeSingle();
    if (!profile) return { profile: null, stats: null, poems: [] as MehfilPoemEnriched[] };

    const [
      { data: stats },
      { data: poems },
      { data: featured },
      { data: hof },
      { data: allCatRows },
      { data: parts },
    ] = await Promise.all([
      sb.from("mehfil_writer_stats").select("*").eq("user_id", profile.id).maybeSingle(),
      sb.from("mehfil_poems").select("*").eq("author_id", profile.id).eq("status", "published")
        .order("published_at", { ascending: false }).limit(Math.min(data.limit ?? 6, 20)),
      sb.from("mehfil_poems").select("*").eq("author_id", profile.id).eq("status", "published")
        .or("is_featured.eq.true,is_editors_pick.eq.true")
        .order("published_at", { ascending: false }).limit(6),
      sb.from("mehfil_hall_of_fame")
        .select("id, poem_id, period, rank, awarded_at, competition_id")
        .eq("user_id", profile.id).order("awarded_at", { ascending: false }).limit(12),
      sb.from("mehfil_poems").select("category_id, upvote_count")
        .eq("author_id", profile.id).eq("status", "published"),
      sb.from("competition_participants")
        .select("id, competition_id, mehfil_poem_id, rank, vote_count")
        .eq("user_id", profile.id).eq("status", "approved"),
    ]);

    const enriched = await attachAuthorsAndCats(sb, (poems ?? []) as MehfilPoem[]);
    const featuredEnriched = await attachAuthorsAndCats(sb, (featured ?? []) as MehfilPoem[]);

    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: trending } = await sb.from("mehfil_poems").select("*")
      .eq("author_id", profile.id).eq("status", "published")
      .gte("published_at", monthAgo).order("upvote_count", { ascending: false }).limit(4);
    const trendingEnriched = await attachAuthorsAndCats(sb, (trending ?? []) as MehfilPoem[]);

    const catCounts = new Map<string, { count: number; upvotes: number }>();
    ((allCatRows ?? []) as Array<{ category_id: string | null; upvote_count: number | null }>).forEach((r) => {
      if (!r.category_id) return;
      const cur = catCounts.get(r.category_id) ?? { count: 0, upvotes: 0 };
      cur.count += 1; cur.upvotes += r.upvote_count ?? 0;
      catCounts.set(r.category_id, cur);
    });
    const catIds = Array.from(catCounts.keys());
    const { data: catRows } = catIds.length
      ? await sb.from("mehfil_categories").select("id, slug, name, color, icon").in("id", catIds)
      : { data: [] as Array<{ id: string; slug: string; name: string; color: string | null; icon: string | null }> };
    const categoriesWritten = (catRows ?? []).map((c) => ({
      ...c,
      poem_count: catCounts.get(c.id)?.count ?? 0,
      total_upvotes: catCounts.get(c.id)?.upvotes ?? 0,
    })).sort((a, b) => b.poem_count - a.poem_count);
    const favoriteCategory = categoriesWritten[0] ?? null;

    const partRows = (parts ?? []) as Array<{ competition_id: string; mehfil_poem_id: string | null; rank: number | null; vote_count: number | null }>;
    const compIds = Array.from(new Set(partRows.map((p) => p.competition_id)));
    const activeBattles: any[] = [];
    const battleHistory: any[] = [];
    if (compIds.length) {
      const { data: comps } = await sb.from("competitions")
        .select("id, slug, name, status, type, end_at, start_at")
        .in("id", compIds).eq("type", "poetry_battle");
      const cmap = new Map((comps ?? []).map((c: any) => [c.id, c]));
      partRows.forEach((p) => {
        const comp = cmap.get(p.competition_id) as any;
        if (!comp) return;
        const item = {
          competition_id: p.competition_id, competition_slug: comp.slug, competition_name: comp.name,
          status: comp.status, end_at: comp.end_at, rank: p.rank, vote_count: p.vote_count ?? 0,
          poem_id: p.mehfil_poem_id,
        };
        if (comp.status === "live" || comp.status === "upcoming") activeBattles.push(item);
        else battleHistory.push(item);
      });
      battleHistory.sort((a, b) => (b.end_at ?? "").localeCompare(a.end_at ?? ""));
    }

    return {
      profile: profile as ProfileRow,
      stats: (stats ?? null) as MehfilWriterStats | null,
      poems: enriched,
      featured: featuredEnriched,
      trending: trendingEnriched,
      hof: hof ?? [],
      active_battles: activeBattles,
      battle_history: battleHistory.slice(0, 6),
      categories_written: categoriesWritten,
      favorite_category: favoriteCategory,
    };
  });

// ---------------------------------------------------------------------------
// Authenticated writes
// ---------------------------------------------------------------------------

export interface PublishPoemInput {
  title: string;
  body: string;
  categorySlug?: string;
  language?: string;
  tags?: string[];
  coverUrl?: string;
  theme?: string;
  status?: PoemStatus;
  seoTitle?: string;
  seoDescription?: string;
  optInBattle?: boolean;
}

export const publishPoem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: PublishPoemInput) => {
    if (!input?.title?.trim()) throw new Error("Title is required");
    if (!input?.body?.trim() || input.body.trim().length < 10) {
      throw new Error("Poem body must be at least 10 characters");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    let categoryId: string | null = null;
    if (data.categorySlug) {
      const { data: cat } = await supabase
        .from("mehfil_categories").select("id").eq("slug", data.categorySlug).maybeSingle();
      categoryId = (cat as { id: string } | null)?.id ?? null;
    }

    const base = slugifyTitle(data.title);
    const short = Math.random().toString(36).slice(2, 8);
    const slug = `${base}-${short}`;

    const status = data.status ?? "published";

    const { data: inserted, error } = await supabase
      .from("mehfil_poems")
      .insert({
        slug,
        title: data.title.trim(),
        body: data.body.trim(),
        category_id: categoryId,
        author_id: userId,
        cover_url: data.coverUrl ?? null,
        theme: data.theme ?? null,
        language: data.language ?? "en",
        tags: data.tags ?? [],
        status,
        opt_in_battle: !!data.optInBattle,
        seo_title: data.seoTitle ?? null,
        seo_description: data.seoDescription ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return inserted as MehfilPoem;
  });

export const togglePoemBookmark = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { poemId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("mehfil_bookmarks")
      .select("user_id")
      .eq("user_id", userId)
      .eq("poem_id", data.poemId)
      .maybeSingle();

    if (existing) {
      await supabase.from("mehfil_bookmarks").delete()
        .eq("user_id", userId).eq("poem_id", data.poemId);
      return { bookmarked: false };
    }
    await supabase.from("mehfil_bookmarks").insert({ user_id: userId, poem_id: data.poemId });
    return { bookmarked: true };
  });

export const listMyPoems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("mehfil_poems")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as MehfilPoem[];
  });
