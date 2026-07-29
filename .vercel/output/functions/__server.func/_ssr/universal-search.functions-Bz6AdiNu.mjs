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
  battles: [],
  categories: [],
  hof: [],
  sources: {
    users: true,
    mehfil: true,
    battles: true,
    categories: true
  }
};
const universalSearch_createServerFn_handler = createServerRpc({
  id: "821deb39e172443f74404bf648a4be5487d7ac2283f4790c539cc68cf0b44805",
  name: "universalSearch",
  filename: "src/lib/universal-search.functions.ts"
}, (opts) => universalSearch.__executeServer(opts));
const universalSearch = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(universalSearch_createServerFn_handler, async ({
  data
}) => {
  const raw = (data.q || "").trim();
  if (raw.length < 2) return EMPTY;
  const q = raw.replace(/^[#@]/, "");
  if (q.length < 2) return EMPTY;
  const limit = Math.min(Math.max(data.limit ?? 5, 1), 10);
  const like = `%${q.replace(/[%_]/g, (m) => `\\${m}`)}%`;
  const sb = pub();
  const {
    data: srow
  } = await sb.from("app_settings").select("value").eq("key", "search").maybeSingle();
  const svalue = srow?.value || {};
  const sources = {
    ...EMPTY.sources,
    ...svalue
  };
  const trending_since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
  const [poemsRes, battlesRes, catsRes, hofRes] = await Promise.all([sources.mehfil ? sb.from("mehfil_poems").select("id, slug, title, body, upvote_count, read_count, competition_id, is_featured, is_editors_pick, published_at, category_id, author_id").eq("status", "published").or(`title.ilike.${like},body.ilike.${like}`).order("upvote_count", {
    ascending: false
  }).limit(limit) : Promise.resolve({
    data: []
  }), sources.battles ? sb.from("competitions").select("id, slug, name, status, end_at, total_participants, winner_count, rewards, type").eq("type", "poetry_battle").ilike("name", like).order("start_at", {
    ascending: false
  }).limit(limit) : Promise.resolve({
    data: []
  }), sources.categories ? sb.from("mehfil_categories").select("id, slug, name, color").eq("is_active", true).ilike("name", like).order("sort_order", {
    ascending: true
  }).limit(limit) : Promise.resolve({
    data: []
  }), sources.mehfil ? sb.from("mehfil_hall_of_fame").select("id, poem_id, rank, period, awarded_at").order("awarded_at", {
    ascending: false
  }).limit(limit * 2) : Promise.resolve({
    data: []
  })]);
  const poemRows = poemsRes.data ?? [];
  const battleRows = battlesRes.data ?? [];
  const catRows = catsRes.data ?? [];
  const hofRowsRaw = hofRes.data ?? [];
  const authorIds = Array.from(new Set(poemRows.map((p) => p.author_id).filter(Boolean)));
  const catIds = Array.from(new Set(poemRows.map((p) => p.category_id).filter(Boolean)));
  const [profRes, catAllRes, statsRes] = await Promise.all([authorIds.length ? sb.from("profiles").select("id, username, display_name, avatar_url").in("id", authorIds) : Promise.resolve({
    data: []
  }), catIds.length ? sb.from("mehfil_categories").select("id, name, color").in("id", catIds) : Promise.resolve({
    data: []
  }), authorIds.length ? sb.from("mehfil_writer_stats").select("user_id, writer_rank").in("user_id", authorIds) : Promise.resolve({
    data: []
  })]);
  const pmap = new Map((profRes.data ?? []).map((p) => [p.id, p]));
  const cmap = new Map((catAllRes.data ?? []).map((c) => [c.id, c]));
  const smap = new Map((statsRes.data ?? []).map((s) => [s.user_id, s]));
  const poems = poemRows.map((p) => {
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
      is_trending: !!(p.is_featured || p.is_editors_pick || p.published_at && p.published_at > trending_since && (p.upvote_count ?? 0) > 5),
      category: cat ? {
        name: cat.name,
        color: cat.color
      } : null,
      author: prof ? {
        id: prof.id,
        name: prof.display_name || prof.username || "Poet",
        avatar_url: prof.avatar_url ?? null,
        writer_rank: stat?.writer_rank ?? null
      } : null
    };
  });
  const battles = battleRows.map((b) => {
    const rewards = b.rewards;
    const first = Array.isArray(rewards) ? rewards[0] : null;
    const prize = first ? first.label || first.title || (first.coins ? `${first.coins} coins` : null) : null;
    return {
      kind: "battle",
      id: b.id,
      slug: b.slug,
      name: b.name,
      status: b.status,
      end_at: b.end_at ?? null,
      participants: b.total_participants ?? 0,
      prize,
      winner_count: b.winner_count ?? 1
    };
  });
  let counts = {};
  if (catRows.length) {
    const ids = catRows.map((c) => c.id);
    const {
      data: pc
    } = await sb.from("mehfil_poems").select("category_id").in("category_id", ids).eq("status", "published");
    for (const row of pc ?? []) {
      if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
    }
  }
  const categories = catRows.map((c) => ({
    kind: "category",
    id: c.id,
    slug: c.slug,
    name: c.name,
    poem_count: counts[c.id] ?? 0,
    is_trending: (counts[c.id] ?? 0) >= 5
  }));
  let hof = [];
  if (hofRowsRaw.length && sources.mehfil) {
    const pids = Array.from(new Set(hofRowsRaw.map((h) => h.poem_id).filter(Boolean)));
    if (pids.length) {
      const {
        data: pRows
      } = await sb.from("mehfil_poems").select("id, slug, title").in("id", pids);
      const pm = new Map((pRows ?? []).map((p) => [p.id, p]));
      hof = hofRowsRaw.map((h) => {
        const poem = pm.get(h.poem_id);
        if (!poem) return null;
        if (!String(poem.title).toLowerCase().includes(q.toLowerCase())) return null;
        return {
          kind: "hof",
          id: h.id,
          poem_slug: poem.slug,
          title: poem.title,
          rank: h.rank,
          period: h.period
        };
      }).filter(Boolean).slice(0, limit);
    }
  }
  return {
    poems,
    battles,
    categories,
    hof,
    sources
  };
});
export {
  universalSearch_createServerFn_handler
};
