/**
 * Poetry Hub-scoped search. Independent from feed search and universal search —
 * this one is optimized for reading experiences: poems, writers, categories,
 * hashtags. Reuses `mehfil_poems`, `profiles`, `mehfil_writer_stats`, and
 * `mehfil_categories` tables directly with public read policies.
 */
import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function pub() {
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

export interface MSPoemResult {
  kind: "poem";
  id: string;
  slug: string;
  title: string;
  body_excerpt: string;
  tags: string[];
  language: string;
  upvotes: number;
  reads: number;
  comments: number;
  is_battle: boolean;
  is_trending: boolean;
  published_at: string | null;
  category: { slug: string; name: string; color: string | null } | null;
  author: {
    id: string;
    username: string | null;
    name: string;
    avatar_url: string | null;
    writer_rank: string | null;
    is_verified: boolean;
  } | null;
}

export interface MSWriterResult {
  kind: "writer";
  id: string;
  username: string | null;
  name: string;
  avatar_url: string | null;
  writer_rank: string | null;
  is_verified: boolean;
  poems_published: number;
  total_upvotes: number;
}

export interface MSCategoryResult {
  kind: "category";
  id: string;
  slug: string;
  name: string;
  color: string | null;
  poem_count: number;
}

export interface MSHashtagResult {
  kind: "hashtag";
  tag: string;
  poem_count: number;
}

export interface MehfilSearchResults {
  poems: MSPoemResult[];
  writers: MSWriterResult[];
  categories: MSCategoryResult[];
  hashtags: MSHashtagResult[];
}

const EMPTY: MehfilSearchResults = { poems: [], writers: [], categories: [], hashtags: [] };

export const mehfilSearch = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string; filter?: string; limit?: number }) => input)
  .handler(async ({ data }): Promise<MehfilSearchResults> => {
    const raw = (data.q || "").trim();
    if (raw.length < 2) return EMPTY;
    const isHashtag = raw.startsWith("#");
    const q = raw.replace(/^[#@]/, "");
    if (q.length < 2) return EMPTY;
    const limit = Math.min(Math.max(data.limit ?? 12, 4), 30);
    const like = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
    const filter = (data.filter || "all").toLowerCase();

    const sb = pub();
    const trending_since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Build poem query with filter awareness
    let poemsQ = sb
      .from("mehfil_poems")
      .select("id, slug, title, body, tags, language, upvote_count, read_count, comment_count, competition_id, is_featured, is_editors_pick, published_at, category_id, author_id")
      .eq("status", "published");

    if (isHashtag) {
      poemsQ = poemsQ.contains("tags", [q.toLowerCase()]);
    } else {
      poemsQ = poemsQ.or(`title.ilike.${like},body.ilike.${like}`);
    }
    if (filter === "battle") poemsQ = poemsQ.not("competition_id", "is", null);
    if (filter === "trending") poemsQ = poemsQ.gte("published_at", trending_since).order("upvote_count", { ascending: false });
    if (["urdu", "hindi", "english"].includes(filter)) poemsQ = poemsQ.eq("language", filter);
    poemsQ = poemsQ.order("upvote_count", { ascending: false }).limit(limit);

    // Category filter — resolve category slug to id first
    let categoryFilterId: string | null = null;
    const namedCategoryFilters = ["love", "breakup", "life", "friendship", "motivation", "funny"];
    if (namedCategoryFilters.includes(filter)) {
      const { data: c } = await sb.from("mehfil_categories").select("id").eq("slug", filter).maybeSingle();
      categoryFilterId = c?.id ?? null;
      if (categoryFilterId) poemsQ = poemsQ.eq("category_id", categoryFilterId);
    }

    const [poemsRes, writersRes, catsRes] = await Promise.all([
      poemsQ,
      // Writer search (skip in pure hashtag mode)
      isHashtag
        ? Promise.resolve({ data: [] as any[] })
        : sb.from("profiles")
            .select("id, username, display_name, avatar_url, is_verified")
            .or(`username.ilike.${like},display_name.ilike.${like}`)
            .limit(8),
      sb.from("mehfil_categories")
        .select("id, slug, name, color")
        .eq("is_active", true)
        .ilike("name", like)
        .limit(6),
    ]);

    const poemRows = (poemsRes.data ?? []) as any[];
    const authorIds = Array.from(new Set(poemRows.map((p) => p.author_id).filter(Boolean)));
    const catIds = Array.from(new Set(poemRows.map((p) => p.category_id).filter(Boolean)));
    const writerRows = (writersRes.data ?? []) as any[];
    const writerIds = writerRows.map((w) => w.id);
    const allProfileIds = Array.from(new Set([...authorIds, ...writerIds]));

    const [profRes, catAllRes, statsRes, wCountsRes] = await Promise.all([
      allProfileIds.length
        ? sb.from("profiles").select("id, username, display_name, avatar_url, is_verified").in("id", allProfileIds)
        : Promise.resolve({ data: [] as any[] }),
      catIds.length
        ? sb.from("mehfil_categories").select("id, slug, name, color").in("id", catIds)
        : Promise.resolve({ data: [] as any[] }),
      allProfileIds.length
        ? sb.from("mehfil_writer_stats")
            .select("user_id, writer_rank, poems_published, total_upvotes")
            .in("user_id", allProfileIds)
        : Promise.resolve({ data: [] as any[] }),
      Promise.resolve({ data: [] as any[] }),
    ]);
    void wCountsRes;

    const pmap = new Map(((profRes.data ?? []) as any[]).map((p) => [p.id, p]));
    const cmap = new Map(((catAllRes.data ?? []) as any[]).map((c) => [c.id, c]));
    const smap = new Map(((statsRes.data ?? []) as any[]).map((s) => [s.user_id, s]));

    const poems: MSPoemResult[] = poemRows.map((p) => {
      const prof = pmap.get(p.author_id);
      const stat = smap.get(p.author_id);
      const cat = p.category_id ? cmap.get(p.category_id) : null;
      const excerpt = String(p.body || "").replace(/\r/g, "").trim();
      return {
        kind: "poem",
        id: p.id,
        slug: p.slug,
        title: p.title,
        body_excerpt: excerpt.slice(0, 320),
        tags: Array.isArray(p.tags) ? p.tags : [],
        language: p.language ?? "en",
        upvotes: p.upvote_count ?? 0,
        reads: p.read_count ?? 0,
        comments: p.comment_count ?? 0,
        is_battle: !!p.competition_id,
        is_trending: !!(p.is_featured || p.is_editors_pick || (p.published_at && p.published_at > trending_since && (p.upvote_count ?? 0) > 5)),
        published_at: p.published_at ?? null,
        category: cat ? { slug: cat.slug, name: cat.name, color: cat.color } : null,
        author: prof ? {
          id: prof.id,
          username: prof.username ?? null,
          name: prof.display_name || prof.username || "Poet",
          avatar_url: prof.avatar_url ?? null,
          writer_rank: stat?.writer_rank ?? null,
          is_verified: !!prof.is_verified,
        } : null,
      };
    });

    const writers: MSWriterResult[] = writerRows.map((w): MSWriterResult => {
      const stat = smap.get(w.id);
      return {
        kind: "writer" as const,
        id: w.id,
        username: w.username ?? null,
        name: w.display_name || w.username || "Poet",
        avatar_url: w.avatar_url ?? null,
        writer_rank: stat?.writer_rank ?? null,
        is_verified: !!w.is_verified,
        poems_published: stat?.poems_published ?? 0,
        total_upvotes: stat?.total_upvotes ?? 0,
      };
    }).slice(0, 6);

    // Category poem counts
    const catRows = (catsRes.data ?? []) as any[];
    let counts: Record<string, number> = {};
    if (catRows.length) {
      const ids = catRows.map((c) => c.id);
      const { data: pc } = await sb.from("mehfil_poems").select("category_id").in("category_id", ids).eq("status", "published");
      for (const row of (pc ?? []) as any[]) if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
    }
    const categories: MSCategoryResult[] = catRows.map((c) => ({
      kind: "category", id: c.id, slug: c.slug, name: c.name, color: c.color, poem_count: counts[c.id] ?? 0,
    }));

    // Hashtag results — search across recent poems' tags for matches containing q
    const { data: tagRows } = await sb
      .from("mehfil_poems")
      .select("tags")
      .eq("status", "published")
      .not("tags", "is", null)
      .limit(500);
    const tagCounts: Record<string, number> = {};
    const needle = q.toLowerCase();
    for (const r of (tagRows ?? []) as any[]) {
      for (const t of (r.tags ?? []) as string[]) {
        const tl = String(t).toLowerCase();
        if (tl.includes(needle)) tagCounts[tl] = (tagCounts[tl] ?? 0) + 1;
      }
    }
    const hashtags: MSHashtagResult[] = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, poem_count]) => ({ kind: "hashtag", tag, poem_count }));

    return { poems, writers, categories, hashtags };
  });

export interface MehfilQuickPanel {
  trending_searches: string[];
  popular_keywords: string[];
  popular_writers: MSWriterResult[];
  trending_hashtags: MSHashtagResult[];
}

export const getMehfilQuickPanel = createServerFn({ method: "GET" }).handler(async (): Promise<MehfilQuickPanel> => {
  const sb = pub();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [topWritersRes, tagRowsRes] = await Promise.all([
    sb.from("mehfil_writer_stats")
      .select("user_id, writer_rank, poems_published, total_upvotes")
      .order("total_upvotes", { ascending: false })
      .limit(8),
    sb.from("mehfil_poems")
      .select("tags")
      .eq("status", "published")
      .gte("published_at", since)
      .not("tags", "is", null)
      .limit(300),
  ]);

  const writerIds = ((topWritersRes.data ?? []) as any[]).map((r) => r.user_id).filter(Boolean);
  const { data: profs } = writerIds.length
    ? await sb.from("profiles").select("id, username, display_name, avatar_url, is_verified").in("id", writerIds)
    : { data: [] as any[] };
  const pm = new Map(((profs ?? []) as any[]).map((p) => [p.id, p]));

  const popular_writers: MSWriterResult[] = ((topWritersRes.data ?? []) as any[]).map((s) => {
    const p = pm.get(s.user_id);
    if (!p) return null;
    return {
      kind: "writer" as const,
      id: p.id,
      username: p.username ?? null,
      name: p.display_name || p.username || "Poet",
      avatar_url: p.avatar_url ?? null,
      writer_rank: s.writer_rank ?? null,
      is_verified: !!p.is_verified,
      poems_published: s.poems_published ?? 0,
      total_upvotes: s.total_upvotes ?? 0,
    };
  }).filter(Boolean).slice(0, 6) as MSWriterResult[];

  const tagCounts: Record<string, number> = {};
  for (const r of ((tagRowsRes.data ?? []) as any[])) {
    for (const t of (r.tags ?? []) as string[]) {
      const tl = String(t).toLowerCase().trim();
      if (!tl) continue;
      tagCounts[tl] = (tagCounts[tl] ?? 0) + 1;
    }
  }
  const trending_hashtags: MSHashtagResult[] = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tag, poem_count]) => ({ kind: "hashtag", tag, poem_count }));

  const popular_keywords = trending_hashtags.slice(0, 8).map((h) => h.tag);
  const trending_searches = ["love", "breakup", "rain", "mother", "friendship", "motivation"];

  return { trending_searches, popular_keywords, popular_writers, trending_hashtags };
});
