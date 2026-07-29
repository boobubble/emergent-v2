import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
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
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
function pub() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, {
          ...init,
          headers: h
        });
      }
    }
  });
}
const EMPTY = {
  poems: [],
  writers: [],
  categories: [],
  hashtags: []
};
const mehfilSearch_createServerFn_handler = createServerRpc({
  id: "722e804184728be1990daea0856f5346808c09c428fbc6439d952af664553a5e",
  name: "mehfilSearch",
  filename: "src/lib/mehfil-search.functions.ts"
}, (opts) => mehfilSearch.__executeServer(opts));
const mehfilSearch = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(mehfilSearch_createServerFn_handler, async ({
  data
}) => {
  const raw = (data.q || "").trim();
  if (raw.length < 2) return EMPTY;
  const isHashtag = raw.startsWith("#");
  const q = raw.replace(/^[#@]/, "");
  if (q.length < 2) return EMPTY;
  const limit = Math.min(Math.max(data.limit ?? 12, 4), 30);
  const like = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
  const filter = (data.filter || "all").toLowerCase();
  const sb = pub();
  const trending_since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
  let poemsQ = sb.from("mehfil_poems").select("id, slug, title, body, tags, language, upvote_count, read_count, comment_count, competition_id, is_featured, is_editors_pick, published_at, category_id, author_id").eq("status", "published");
  if (isHashtag) {
    poemsQ = poemsQ.contains("tags", [q.toLowerCase()]);
  } else {
    poemsQ = poemsQ.or(`title.ilike.${like},body.ilike.${like}`);
  }
  if (filter === "battle") poemsQ = poemsQ.not("competition_id", "is", null);
  if (filter === "trending") poemsQ = poemsQ.gte("published_at", trending_since).order("upvote_count", {
    ascending: false
  });
  if (["urdu", "hindi", "english"].includes(filter)) poemsQ = poemsQ.eq("language", filter);
  poemsQ = poemsQ.order("upvote_count", {
    ascending: false
  }).limit(limit);
  let categoryFilterId = null;
  const namedCategoryFilters = ["love", "breakup", "life", "friendship", "motivation", "funny"];
  if (namedCategoryFilters.includes(filter)) {
    const {
      data: c
    } = await sb.from("mehfil_categories").select("id").eq("slug", filter).maybeSingle();
    categoryFilterId = c?.id ?? null;
    if (categoryFilterId) poemsQ = poemsQ.eq("category_id", categoryFilterId);
  }
  const [poemsRes, writersRes, catsRes] = await Promise.all([
    poemsQ,
    // Writer search (skip in pure hashtag mode)
    isHashtag ? Promise.resolve({
      data: []
    }) : sb.from("profiles").select("id, username, display_name, avatar_url, is_verified").or(`username.ilike.${like},display_name.ilike.${like}`).limit(8),
    sb.from("mehfil_categories").select("id, slug, name, color").eq("is_active", true).ilike("name", like).limit(6)
  ]);
  const poemRows = poemsRes.data ?? [];
  const authorIds = Array.from(new Set(poemRows.map((p) => p.author_id).filter(Boolean)));
  const catIds = Array.from(new Set(poemRows.map((p) => p.category_id).filter(Boolean)));
  const writerRows = writersRes.data ?? [];
  const writerIds = writerRows.map((w) => w.id);
  const allProfileIds = Array.from(/* @__PURE__ */ new Set([...authorIds, ...writerIds]));
  const [profRes, catAllRes, statsRes, wCountsRes] = await Promise.all([allProfileIds.length ? sb.from("profiles").select("id, username, display_name, avatar_url, is_verified").in("id", allProfileIds) : Promise.resolve({
    data: []
  }), catIds.length ? sb.from("mehfil_categories").select("id, slug, name, color").in("id", catIds) : Promise.resolve({
    data: []
  }), allProfileIds.length ? sb.from("mehfil_writer_stats").select("user_id, writer_rank, poems_published, total_upvotes").in("user_id", allProfileIds) : Promise.resolve({
    data: []
  }), Promise.resolve({
    data: []
  })]);
  const pmap = new Map((profRes.data ?? []).map((p) => [p.id, p]));
  const cmap = new Map((catAllRes.data ?? []).map((c) => [c.id, c]));
  const smap = new Map((statsRes.data ?? []).map((s) => [s.user_id, s]));
  const poems = poemRows.map((p) => {
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
      is_trending: !!(p.is_featured || p.is_editors_pick || p.published_at && p.published_at > trending_since && (p.upvote_count ?? 0) > 5),
      published_at: p.published_at ?? null,
      category: cat ? {
        slug: cat.slug,
        name: cat.name,
        color: cat.color
      } : null,
      author: prof ? {
        id: prof.id,
        username: prof.username ?? null,
        name: prof.display_name || prof.username || "Poet",
        avatar_url: prof.avatar_url ?? null,
        writer_rank: stat?.writer_rank ?? null,
        is_verified: !!prof.is_verified
      } : null
    };
  });
  const writers = writerRows.map((w) => {
    const stat = smap.get(w.id);
    return {
      kind: "writer",
      id: w.id,
      username: w.username ?? null,
      name: w.display_name || w.username || "Poet",
      avatar_url: w.avatar_url ?? null,
      writer_rank: stat?.writer_rank ?? null,
      is_verified: !!w.is_verified,
      poems_published: stat?.poems_published ?? 0,
      total_upvotes: stat?.total_upvotes ?? 0
    };
  }).slice(0, 6);
  const catRows = catsRes.data ?? [];
  let counts = {};
  if (catRows.length) {
    const ids = catRows.map((c) => c.id);
    const {
      data: pc
    } = await sb.from("mehfil_poems").select("category_id").in("category_id", ids).eq("status", "published");
    for (const row of pc ?? []) if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }
  const categories = catRows.map((c) => ({
    kind: "category",
    id: c.id,
    slug: c.slug,
    name: c.name,
    color: c.color,
    poem_count: counts[c.id] ?? 0
  }));
  const {
    data: tagRows
  } = await sb.from("mehfil_poems").select("tags").eq("status", "published").not("tags", "is", null).limit(500);
  const tagCounts = {};
  const needle = q.toLowerCase();
  for (const r of tagRows ?? []) {
    for (const t of r.tags ?? []) {
      const tl = String(t).toLowerCase();
      if (tl.includes(needle)) tagCounts[tl] = (tagCounts[tl] ?? 0) + 1;
    }
  }
  const hashtags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, poem_count]) => ({
    kind: "hashtag",
    tag,
    poem_count
  }));
  return {
    poems,
    writers,
    categories,
    hashtags
  };
});
const getMehfilQuickPanel_createServerFn_handler = createServerRpc({
  id: "1e9263a94064e968274b67a5b7a58e16d30d15feea34c6fb1c57da7bae57c0da",
  name: "getMehfilQuickPanel",
  filename: "src/lib/mehfil-search.functions.ts"
}, (opts) => getMehfilQuickPanel.__executeServer(opts));
const getMehfilQuickPanel = createServerFn({
  method: "GET"
}).handler(getMehfilQuickPanel_createServerFn_handler, async () => {
  const sb = pub();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString();
  const [topWritersRes, tagRowsRes] = await Promise.all([sb.from("mehfil_writer_stats").select("user_id, writer_rank, poems_published, total_upvotes").order("total_upvotes", {
    ascending: false
  }).limit(8), sb.from("mehfil_poems").select("tags").eq("status", "published").gte("published_at", since).not("tags", "is", null).limit(300)]);
  const writerIds = (topWritersRes.data ?? []).map((r) => r.user_id).filter(Boolean);
  const {
    data: profs
  } = writerIds.length ? await sb.from("profiles").select("id, username, display_name, avatar_url, is_verified").in("id", writerIds) : {
    data: []
  };
  const pm = new Map((profs ?? []).map((p) => [p.id, p]));
  const popular_writers = (topWritersRes.data ?? []).map((s) => {
    const p = pm.get(s.user_id);
    if (!p) return null;
    return {
      kind: "writer",
      id: p.id,
      username: p.username ?? null,
      name: p.display_name || p.username || "Poet",
      avatar_url: p.avatar_url ?? null,
      writer_rank: s.writer_rank ?? null,
      is_verified: !!p.is_verified,
      poems_published: s.poems_published ?? 0,
      total_upvotes: s.total_upvotes ?? 0
    };
  }).filter(Boolean).slice(0, 6);
  const tagCounts = {};
  for (const r of tagRowsRes.data ?? []) {
    for (const t of r.tags ?? []) {
      const tl = String(t).toLowerCase().trim();
      if (!tl) continue;
      tagCounts[tl] = (tagCounts[tl] ?? 0) + 1;
    }
  }
  const trending_hashtags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([tag, poem_count]) => ({
    kind: "hashtag",
    tag,
    poem_count
  }));
  const popular_keywords = trending_hashtags.slice(0, 8).map((h) => h.tag);
  const trending_searches = ["love", "breakup", "rain", "mother", "friendship", "motivation"];
  return {
    trending_searches,
    popular_keywords,
    popular_writers,
    trending_hashtags
  };
});
export {
  getMehfilQuickPanel_createServerFn_handler,
  mehfilSearch_createServerFn_handler
};
