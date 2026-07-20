/**
 * Universal Platform Search — extends the existing feed header search by
 * adding server-side results for Mehfil poems, poetry battles, categories,
 * and Hall of Fame entries.
 *
 * The existing user/hashtag suggestions (derived locally from loaded feed
 * data) remain untouched; this function just returns the additional groups
 * so the same dropdown can render them below Users.
 *
 * Admin toggles live in `app_settings.search` and default to all-on:
 *   { users: true, mehfil: true, battles: true, categories: true }
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

export interface USPoemResult {
  kind: "poem";
  id: string;
  slug: string;
  title: string;
  preview: string;
  upvotes: number;
  reads: number;
  is_battle: boolean;
  is_trending: boolean;
  category: { name: string; color: string | null } | null;
  author: { id: string; name: string; avatar_url: string | null; writer_rank: string | null } | null;
}

export interface USBattleResult {
  kind: "battle";
  id: string;
  slug: string;
  name: string;
  status: string;
  end_at: string | null;
  participants: number;
  prize: string | null;
  winner_count: number;
}

export interface USCategoryResult {
  kind: "category";
  id: string;
  slug: string;
  name: string;
  poem_count: number;
  is_trending: boolean;
}

export interface USHofResult {
  kind: "hof";
  id: string;
  poem_slug: string;
  title: string;
  rank: number;
  period: string;
}

export interface UniversalSearchResults {
  poems: USPoemResult[];
  battles: USBattleResult[];
  categories: USCategoryResult[];
  hof: USHofResult[];
  sources: { users: boolean; mehfil: boolean; battles: boolean; categories: boolean };
}

const EMPTY: UniversalSearchResults = {
  poems: [], battles: [], categories: [], hof: [],
  sources: { users: true, mehfil: true, battles: true, categories: true },
};

export const universalSearch = createServerFn({ method: "GET" })
  .inputValidator((input: { q: string; limit?: number }) => input)
  .handler(async ({ data }) => {
    const raw = (data.q || "").trim();
    if (raw.length < 2) return EMPTY;
    // Strip leading @/# so this search still works when the user is typing a
    // hashtag or handle in the same input.
    const q = raw.replace(/^[#@]/, "");
    if (q.length < 2) return EMPTY;
    const limit = Math.min(Math.max(data.limit ?? 5, 1), 10);
    const like = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;

    const sb = pub();

    // Admin toggles
    const { data: srow } = await sb.from("app_settings").select("value").eq("key", "search").maybeSingle();
    const svalue = (srow?.value as Partial<UniversalSearchResults["sources"]>) || {};
    const sources = { ...EMPTY.sources, ...svalue };

    const trending_since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [poemsRes, battlesRes, catsRes, hofRes] = await Promise.all([
      sources.mehfil
        ? sb.from("mehfil_poems")
            .select("id, slug, title, body, upvote_count, read_count, competition_id, is_featured, is_editors_pick, published_at, category_id, author_id")
            .eq("status", "published")
            .or(`title.ilike.${like},body.ilike.${like}`)
            .order("upvote_count", { ascending: false })
            .limit(limit)
        : Promise.resolve({ data: [] as any[] }),
      sources.battles
        ? sb.from("competitions")
            .select("id, slug, name, status, end_at, total_participants, prize_summary, type")
            .eq("type", "poetry_battle")
            .ilike("name", like)
            .order("start_at", { ascending: false })
            .limit(limit)
        : Promise.resolve({ data: [] as any[] }),
      sources.categories
        ? sb.from("mehfil_categories")
            .select("id, slug, name, color")
            .eq("is_active", true)
            .ilike("name", like)
            .order("sort_order", { ascending: true })
            .limit(limit)
        : Promise.resolve({ data: [] as any[] }),
      sources.mehfil
        ? sb.from("mehfil_hall_of_fame")
            .select("id, poem_id, rank, period, awarded_at")
            .order("awarded_at", { ascending: false })
            .limit(limit * 2)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const poemRows = (poemsRes.data ?? []) as any[];
    const battleRows = (battlesRes.data ?? []) as any[];
    const catRows = (catsRes.data ?? []) as any[];
    const hofRowsRaw = (hofRes.data ?? []) as any[];

    // Fetch author + category info for poems
    const authorIds = Array.from(new Set(poemRows.map((p) => p.author_id).filter(Boolean)));
    const catIds = Array.from(new Set(poemRows.map((p) => p.category_id).filter(Boolean)));
    const [profRes, catAllRes, statsRes] = await Promise.all([
      authorIds.length
        ? sb.from("profiles").select("id, username, display_name, avatar_url").in("id", authorIds)
        : Promise.resolve({ data: [] as any[] }),
      catIds.length
        ? sb.from("mehfil_categories").select("id, name, color").in("id", catIds)
        : Promise.resolve({ data: [] as any[] }),
      authorIds.length
        ? sb.from("mehfil_writer_stats").select("user_id, writer_rank").in("user_id", authorIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    const pmap = new Map(((profRes.data ?? []) as any[]).map((p) => [p.id, p]));
    const cmap = new Map(((catAllRes.data ?? []) as any[]).map((c) => [c.id, c]));
    const smap = new Map(((statsRes.data ?? []) as any[]).map((s) => [s.user_id, s]));

    const poems: USPoemResult[] = poemRows.map((p) => {
      const prof = pmap.get(p.author_id);
      const cat = p.category_id ? cmap.get(p.category_id) : null;
      const stat = smap.get(p.author_id);
      const preview = String(p.body || "").replace(/\s+/g, " ").slice(0, 120).trim();
      return {
        kind: "poem",
        id: p.id,
        slug: p.slug,
        title: p.title,
        preview,
        upvotes: p.upvote_count ?? 0,
        reads: p.read_count ?? 0,
        is_battle: !!p.competition_id,
        is_trending: !!(p.is_featured || p.is_editors_pick || (p.published_at && p.published_at > trending_since && (p.upvote_count ?? 0) > 5)),
        category: cat ? { name: cat.name, color: cat.color } : null,
        author: prof ? {
          id: prof.id,
          name: prof.display_name || prof.username || "Poet",
          avatar_url: prof.avatar_url ?? null,
          writer_rank: stat?.writer_rank ?? null,
        } : null,
      };
    });

    const battles: USBattleResult[] = battleRows.map((b) => ({
      kind: "battle",
      id: b.id,
      slug: b.slug,
      name: b.name,
      status: b.status,
      end_at: b.end_at ?? null,
      participants: b.total_participants ?? 0,
      prize: b.prize_summary ?? null,
    }));

    // Poem counts per matching category
    let counts: Record<string, number> = {};
    if (catRows.length) {
      const ids = catRows.map((c) => c.id);
      const { data: pc } = await sb.from("mehfil_poems").select("category_id").in("category_id", ids).eq("status", "published");
      for (const row of (pc ?? []) as any[]) {
        if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
      }
    }
    const categories: USCategoryResult[] = catRows.map((c) => ({
      kind: "category",
      id: c.id,
      slug: c.slug,
      name: c.name,
      poem_count: counts[c.id] ?? 0,
      is_trending: (counts[c.id] ?? 0) >= 5,
    }));

    // Hall of Fame — resolve poem titles and filter by query
    let hof: USHofResult[] = [];
    if (hofRowsRaw.length && sources.mehfil) {
      const pids = Array.from(new Set(hofRowsRaw.map((h) => h.poem_id).filter(Boolean)));
      if (pids.length) {
        const { data: pRows } = await sb.from("mehfil_poems").select("id, slug, title").in("id", pids);
        const pm = new Map(((pRows ?? []) as any[]).map((p) => [p.id, p]));
        hof = hofRowsRaw
          .map((h) => {
            const poem = pm.get(h.poem_id);
            if (!poem) return null;
            if (!String(poem.title).toLowerCase().includes(q.toLowerCase())) return null;
            return {
              kind: "hof" as const,
              id: h.id,
              poem_slug: poem.slug,
              title: poem.title,
              rank: h.rank,
              period: h.period,
            };
          })
          .filter(Boolean)
          .slice(0, limit) as USHofResult[];
      }
    }

    return { poems, battles, categories, hof, sources };
  });
