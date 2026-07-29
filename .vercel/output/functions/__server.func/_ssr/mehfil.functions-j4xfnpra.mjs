import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { createClient } from "../_libs/supabase__supabase-js.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { s as slugifyTitle } from "./mehfil-types-okfUX99d.mjs";
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
import "./env.server-Bcmcot3M.mjs";
function publicClient() {
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
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, {
          ...init,
          headers: h
        });
      }
    }
  });
}
async function attachAuthorsAndCats(sb, poems) {
  if (poems.length === 0) return [];
  const authorIds = Array.from(new Set(poems.map((p) => p.author_id)));
  const catIds = Array.from(new Set(poems.map((p) => p.category_id).filter((v) => !!v)));
  const poemIds = poems.map((p) => p.id);
  const [{
    data: profiles
  }, {
    data: cats
  }, {
    data: stats
  }, {
    data: rxRows
  }] = await Promise.all([sb.from("profiles").select("id, username, display_name, avatar_url, country_code").in("id", authorIds), catIds.length ? sb.from("mehfil_categories").select("id, slug, name, color, icon").in("id", catIds) : Promise.resolve({
    data: []
  }), sb.from("mehfil_writer_stats").select("user_id, writer_rank").in("user_id", authorIds), poemIds.length ? sb.from("reactions").select("target_id").eq("target_type", "mehfil_poem").in("target_id", poemIds) : Promise.resolve({
    data: []
  })]);
  const pmap = /* @__PURE__ */ new Map();
  (profiles ?? []).forEach((p) => pmap.set(p.id, p));
  const cmap = /* @__PURE__ */ new Map();
  (cats ?? []).forEach((c) => cmap.set(c.id, c));
  const smap = /* @__PURE__ */ new Map();
  (stats ?? []).forEach((s) => smap.set(s.user_id, s.writer_rank));
  const rxmap = /* @__PURE__ */ new Map();
  (rxRows ?? []).forEach((r) => {
    rxmap.set(r.target_id, (rxmap.get(r.target_id) ?? 0) + 1);
  });
  return poems.map((p) => {
    const prof = pmap.get(p.author_id);
    return {
      ...p,
      category: p.category_id ? cmap.get(p.category_id) ?? null : null,
      author: prof ? {
        id: prof.id,
        username: prof.username ?? "anonymous",
        display_name: prof.display_name,
        avatar_url: prof.avatar_url,
        country_code: prof.country_code
      } : null,
      writer_rank: smap.get(p.author_id) ?? "fresh_writer",
      reaction_count: rxmap.get(p.id) ?? 0
    };
  });
}
const listMehfilCategories_createServerFn_handler = createServerRpc({
  id: "2d49c78b3e8be2e8d6f64a5e8ed74f01f505dab7da198c399bc0f1c48b2f7fd3",
  name: "listMehfilCategories",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => listMehfilCategories.__executeServer(opts));
const listMehfilCategories = createServerFn({
  method: "GET"
}).handler(listMehfilCategories_createServerFn_handler, async () => {
  const sb = publicClient();
  const {
    data,
    error
  } = await sb.from("mehfil_categories").select("*").eq("is_active", true).order("sort_order", {
    ascending: true
  });
  if (error) throw error;
  return data ?? [];
});
const getMehfilHallOfFame_createServerFn_handler = createServerRpc({
  id: "d93d7fe63cd82e512cabd86b7231e6836e56f0c717e97d19bd1f8feb9e38f2fd",
  name: "getMehfilHallOfFame",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => getMehfilHallOfFame.__executeServer(opts));
const getMehfilHallOfFame = createServerFn({
  method: "GET"
}).handler(getMehfilHallOfFame_createServerFn_handler, async () => {
  const sb = publicClient();
  const {
    data: rows
  } = await sb.from("mehfil_hall_of_fame").select("*").order("awarded_at", {
    ascending: false
  }).limit(100);
  const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
  const poemIds = Array.from(new Set((rows ?? []).map((r) => r.poem_id).filter(Boolean)));
  const [{
    data: profiles
  }, {
    data: poems
  }] = await Promise.all([ids.length ? sb.from("profiles").select("id, username, display_name, avatar_url").in("id", ids) : Promise.resolve({
    data: []
  }), poemIds.length ? sb.from("mehfil_poems").select("id, slug, title").in("id", poemIds) : Promise.resolve({
    data: []
  })]);
  const pmap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const poemMap = new Map((poems ?? []).map((p) => [p.id, p]));
  return (rows ?? []).map((r) => ({
    ...r,
    profile: pmap.get(r.user_id) ?? null,
    poem: poemMap.get(r.poem_id) ?? null
  }));
});
const getMehfilDiscovery_createServerFn_handler = createServerRpc({
  id: "44a6f45161991cf3b090f43e0dd7af6ed5d307812ad61190f01edfbe434e2bbb",
  name: "getMehfilDiscovery",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => getMehfilDiscovery.__executeServer(opts));
const getMehfilDiscovery = createServerFn({
  method: "GET"
}).handler(getMehfilDiscovery_createServerFn_handler, async () => {
  const sb = publicClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3).toISOString();
  const baseSelect = () => sb.from("mehfil_poems").select("*").eq("status", "published");
  const run = async (q) => {
    const {
      data,
      error
    } = await q;
    if (error) throw error;
    return attachAuthorsAndCats(sb, data ?? []);
  };
  const [trending, pick, fresh, loved, read, winners] = await Promise.all([run(baseSelect().gte("published_at", weekAgo).order("upvote_count", {
    ascending: false
  }).order("read_count", {
    ascending: false
  }).limit(8)), run(baseSelect().eq("is_editors_pick", true).order("published_at", {
    ascending: false
  }).limit(8)), run(baseSelect().order("published_at", {
    ascending: false
  }).limit(8)), run(baseSelect().order("upvote_count", {
    ascending: false
  }).limit(8)), run(baseSelect().order("read_count", {
    ascending: false
  }).limit(8)), run(baseSelect().not("competition_id", "is", null).order("upvote_count", {
    ascending: false
  }).limit(8))]);
  const {
    data: risingStats
  } = await sb.from("mehfil_writer_stats").select("user_id, poems_published, total_upvotes, writer_rank").in("writer_rank", ["rising_poet", "poet"]).order("total_upvotes", {
    ascending: false
  }).limit(12);
  const risingIds = (risingStats ?? []).map((s) => s.user_id);
  const {
    data: risingProfiles
  } = risingIds.length ? await sb.from("profiles").select("id, username, display_name, avatar_url, country_code").in("id", risingIds) : {
    data: []
  };
  const sections = [{
    key: "trending",
    label: "🔥 Trending",
    poems: trending
  }, {
    key: "editors_pick",
    label: "⭐ Editors Pick",
    poems: pick
  }, {
    key: "fresh",
    label: "🆕 Fresh Poetry",
    poems: fresh
  }, {
    key: "most_loved",
    label: "❤️ Most Loved",
    poems: loved
  }, {
    key: "most_read",
    label: "👁 Most Read",
    poems: read
  }, {
    key: "battle_winners",
    label: "🏆 Battle Winners",
    poems: winners
  }];
  return {
    sections,
    rising: (risingStats ?? []).map((s) => ({
      stats: s,
      profile: risingProfiles?.find((p) => p.id === s.user_id) ?? null
    }))
  };
});
const listPoemsByCategory_createServerFn_handler = createServerRpc({
  id: "d18b369204e6391491673b3efdcdeb8b7dfb88d43aa31cf9e206d4d70aa2bc4b",
  name: "listPoemsByCategory",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => listPoemsByCategory.__executeServer(opts));
const listPoemsByCategory = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(listPoemsByCategory_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const {
    data: cat,
    error: cErr
  } = await sb.from("mehfil_categories").select("*").eq("slug", data.slug).maybeSingle();
  if (cErr) throw cErr;
  if (!cat) return {
    category: null,
    poems: []
  };
  let q = sb.from("mehfil_poems").select("*").eq("status", "published").eq("category_id", cat.id).limit(Math.min(data.limit ?? 40, 100));
  if (data.sort === "trending") q = q.order("upvote_count", {
    ascending: false
  });
  else if (data.sort === "top") q = q.order("read_count", {
    ascending: false
  });
  else q = q.order("published_at", {
    ascending: false
  });
  const {
    data: poems,
    error
  } = await q;
  if (error) throw error;
  const enriched = await attachAuthorsAndCats(sb, poems ?? []);
  return {
    category: cat,
    poems: enriched
  };
});
const getPoemBySlug_createServerFn_handler = createServerRpc({
  id: "cbfbda44a4f28b17490b00aec2039a6416cd71794c7efa7247d59fdc2ef2eef8",
  name: "getPoemBySlug",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => getPoemBySlug.__executeServer(opts));
const getPoemBySlug = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(getPoemBySlug_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const {
    data: poem,
    error
  } = await sb.from("mehfil_poems").select("*").eq("slug", data.slug).eq("status", "published").maybeSingle();
  if (error) throw error;
  if (!poem) return null;
  const [enriched] = await attachAuthorsAndCats(sb, [poem]);
  void sb.rpc("mehfil_increment_view", {
    p_poem_id: poem.id
  }).then(() => {
  });
  return enriched;
});
const getMehfilRelated_createServerFn_handler = createServerRpc({
  id: "10674d1c7381785e93e0f198693865d6e3ae451ae06113e790ae69223a7387c1",
  name: "getMehfilRelated",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => getMehfilRelated.__executeServer(opts));
const getMehfilRelated = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(getMehfilRelated_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const limit = Math.min(data.limit ?? 6, 12);
  const [moreFromAuthorRes, relatedRes, trendingRes] = await Promise.all([sb.from("mehfil_poems").select("*").eq("status", "published").eq("author_id", data.authorId).neq("id", data.poemId).order("published_at", {
    ascending: false
  }).limit(limit), data.categoryId ? sb.from("mehfil_poems").select("*").eq("status", "published").eq("category_id", data.categoryId).neq("id", data.poemId).neq("author_id", data.authorId).order("upvote_count", {
    ascending: false
  }).limit(limit) : Promise.resolve({
    data: []
  }), sb.from("mehfil_poems").select("*").eq("status", "published").neq("id", data.poemId).order("upvote_count", {
    ascending: false
  }).limit(limit)]);
  const [moreFromAuthor, related, trending] = await Promise.all([attachAuthorsAndCats(sb, moreFromAuthorRes.data ?? []), attachAuthorsAndCats(sb, relatedRes.data ?? []), attachAuthorsAndCats(sb, trendingRes.data ?? [])]);
  return {
    moreFromAuthor,
    related,
    trending
  };
});
const recordPoemRead_createServerFn_handler = createServerRpc({
  id: "0c998845b4720371824d3a1c5d3d1019f5653a6dc6dad1a4ee303b916a890d0b",
  name: "recordPoemRead",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => recordPoemRead.__executeServer(opts));
const recordPoemRead = createServerFn({
  method: "POST"
}).inputValidator((input) => input).handler(recordPoemRead_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const {
    error
  } = await sb.rpc("mehfil_record_read", {
    p_poem_id: data.poemId,
    p_session: data.sessionKey ?? void 0
  });
  if (error) throw error;
  return {
    ok: true
  };
});
const getWriterStats_createServerFn_handler = createServerRpc({
  id: "bfd9897b99fa2d9b86022ed5e044d91dd85ce1cfeba6414cd9fde8bf47eb053b",
  name: "getWriterStats",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => getWriterStats.__executeServer(opts));
const getWriterStats = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(getWriterStats_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const {
    data: stats
  } = await sb.from("mehfil_writer_stats").select("*").eq("user_id", data.userId).maybeSingle();
  return stats ?? null;
});
const getMehfilProfileSection_createServerFn_handler = createServerRpc({
  id: "0b8e4e93a0ecb1d26c9756db6bd5a1fc799948ab4d0ced069fbd69d893546487",
  name: "getMehfilProfileSection",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => getMehfilProfileSection.__executeServer(opts));
const getMehfilProfileSection = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(getMehfilProfileSection_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const {
    data: profile
  } = await sb.from("profiles").select("id, username, display_name, avatar_url, country_code").ilike("username", data.username).maybeSingle();
  if (!profile) return {
    profile: null,
    stats: null,
    poems: []
  };
  const [{
    data: stats
  }, {
    data: poems
  }, {
    data: featured
  }, {
    data: hof
  }, {
    data: allCatRows
  }, {
    data: parts
  }] = await Promise.all([sb.from("mehfil_writer_stats").select("*").eq("user_id", profile.id).maybeSingle(), sb.from("mehfil_poems").select("*").eq("author_id", profile.id).eq("status", "published").order("published_at", {
    ascending: false
  }).limit(Math.min(data.limit ?? 6, 20)), sb.from("mehfil_poems").select("*").eq("author_id", profile.id).eq("status", "published").or("is_featured.eq.true,is_editors_pick.eq.true").order("published_at", {
    ascending: false
  }).limit(6), sb.from("mehfil_hall_of_fame").select("id, poem_id, period, rank, awarded_at, competition_id").eq("user_id", profile.id).order("awarded_at", {
    ascending: false
  }).limit(12), sb.from("mehfil_poems").select("category_id, upvote_count").eq("author_id", profile.id).eq("status", "published"), sb.from("competition_participants").select("id, competition_id, mehfil_poem_id, rank, vote_count").eq("user_id", profile.id).eq("status", "approved")]);
  const enriched = await attachAuthorsAndCats(sb, poems ?? []);
  const featuredEnriched = await attachAuthorsAndCats(sb, featured ?? []);
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3).toISOString();
  const {
    data: trending
  } = await sb.from("mehfil_poems").select("*").eq("author_id", profile.id).eq("status", "published").gte("published_at", monthAgo).order("upvote_count", {
    ascending: false
  }).limit(4);
  const trendingEnriched = await attachAuthorsAndCats(sb, trending ?? []);
  const catCounts = /* @__PURE__ */ new Map();
  (allCatRows ?? []).forEach((r) => {
    if (!r.category_id) return;
    const cur = catCounts.get(r.category_id) ?? {
      count: 0,
      upvotes: 0
    };
    cur.count += 1;
    cur.upvotes += r.upvote_count ?? 0;
    catCounts.set(r.category_id, cur);
  });
  const catIds = Array.from(catCounts.keys());
  const {
    data: catRows
  } = catIds.length ? await sb.from("mehfil_categories").select("id, slug, name, color, icon").in("id", catIds) : {
    data: []
  };
  const categoriesWritten = (catRows ?? []).map((c) => ({
    ...c,
    poem_count: catCounts.get(c.id)?.count ?? 0,
    total_upvotes: catCounts.get(c.id)?.upvotes ?? 0
  })).sort((a, b) => b.poem_count - a.poem_count);
  const favoriteCategory = categoriesWritten[0] ?? null;
  const partRows = parts ?? [];
  const compIds = Array.from(new Set(partRows.map((p) => p.competition_id)));
  const activeBattles = [];
  const battleHistory = [];
  if (compIds.length) {
    const {
      data: comps
    } = await sb.from("competitions").select("id, slug, name, status, type, end_at, start_at").in("id", compIds).eq("type", "poetry_battle");
    const cmap = new Map((comps ?? []).map((c) => [c.id, c]));
    partRows.forEach((p) => {
      const comp = cmap.get(p.competition_id);
      if (!comp) return;
      const item = {
        competition_id: p.competition_id,
        competition_slug: comp.slug,
        competition_name: comp.name,
        status: comp.status,
        end_at: comp.end_at,
        rank: p.rank,
        vote_count: p.vote_count ?? 0,
        poem_id: p.mehfil_poem_id
      };
      if (comp.status === "live" || comp.status === "upcoming") activeBattles.push(item);
      else battleHistory.push(item);
    });
    battleHistory.sort((a, b) => (b.end_at ?? "").localeCompare(a.end_at ?? ""));
  }
  return {
    profile,
    stats: stats ?? null,
    poems: enriched,
    featured: featuredEnriched,
    trending: trendingEnriched,
    hof: hof ?? [],
    active_battles: activeBattles,
    battle_history: battleHistory.slice(0, 6),
    categories_written: categoriesWritten,
    favorite_category: favoriteCategory
  };
});
const publishPoem_createServerFn_handler = createServerRpc({
  id: "66bdf9a426915c5d9933b199a4f298c12274caff62dbb4adf80274fb51cc4ba9",
  name: "publishPoem",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => publishPoem.__executeServer(opts));
const publishPoem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => {
  if (!input?.title?.trim()) throw new Error("Title is required");
  if (!input?.body?.trim() || input.body.trim().length < 10) {
    throw new Error("Poem body must be at least 10 characters");
  }
  return input;
}).handler(publishPoem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  let categoryId = null;
  if (data.categorySlug) {
    const {
      data: cat
    } = await supabase.from("mehfil_categories").select("id").eq("slug", data.categorySlug).maybeSingle();
    categoryId = cat?.id ?? null;
  }
  const base = slugifyTitle(data.title);
  const short = Math.random().toString(36).slice(2, 8);
  const slug = `${base}-${short}`;
  const scheduledAt = data.scheduledAt ?? null;
  const wantsSchedule = !!scheduledAt && new Date(scheduledAt).getTime() > Date.now();
  const status = data.saveAsDraft || wantsSchedule ? "draft" : data.status ?? "published";
  if (data.poemId) {
    const {
      data: updated,
      error: upErr
    } = await supabase.from("mehfil_poems").update({
      title: data.title.trim(),
      body: data.body.trim(),
      category_id: categoryId,
      cover_url: data.coverUrl ?? null,
      theme: data.theme ?? null,
      language: data.language ?? "en",
      tags: data.tags ?? [],
      status,
      opt_in_battle: !!data.optInBattle,
      seo_title: data.seoTitle ?? null,
      seo_description: data.seoDescription ?? null,
      scheduled_at: wantsSchedule ? scheduledAt : null,
      published_at: status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : null
    }).eq("id", data.poemId).eq("author_id", userId).select("*").single();
    if (upErr) throw upErr;
    return updated;
  }
  const {
    data: inserted,
    error
  } = await supabase.from("mehfil_poems").insert({
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
    scheduled_at: wantsSchedule ? scheduledAt : null,
    published_at: status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : null
  }).select("*").single();
  if (error) throw error;
  return inserted;
});
const listMyDrafts_createServerFn_handler = createServerRpc({
  id: "a6c37b4769d6e5fe825ae79bec42e52190b367a628e7e8c9e9dc8feb06d8947a",
  name: "listMyDrafts",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => listMyDrafts.__executeServer(opts));
const listMyDrafts = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyDrafts_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("mehfil_poems").select("*").eq("author_id", userId).eq("status", "draft").order("updated_at", {
    ascending: false
  }).limit(100);
  if (error) throw error;
  return data ?? [];
});
const schedulePoem_createServerFn_handler = createServerRpc({
  id: "ced235494f0a6bfda039567817f1a45eca6126dd7406634f8380afa170f6b060",
  name: "schedulePoem",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => schedulePoem.__executeServer(opts));
const schedulePoem = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(schedulePoem_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  if (new Date(data.scheduledAt).getTime() <= Date.now()) {
    throw new Error("Schedule must be in the future");
  }
  const {
    error
  } = await supabase.from("mehfil_poems").update({
    scheduled_at: data.scheduledAt,
    status: "draft"
  }).eq("id", data.poemId).eq("author_id", userId);
  if (error) throw error;
  return {
    ok: true
  };
});
const deleteDraft_createServerFn_handler = createServerRpc({
  id: "e6d5c7b488bc67682bc11cdc41e0e5486a9b60d8c3485e23e3f3b92747fb568b",
  name: "deleteDraft",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => deleteDraft.__executeServer(opts));
const deleteDraft = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(deleteDraft_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    error
  } = await supabase.from("mehfil_poems").delete().eq("id", data.poemId).eq("author_id", userId).eq("status", "draft");
  if (error) throw error;
  return {
    ok: true
  };
});
const togglePoemBookmark_createServerFn_handler = createServerRpc({
  id: "6c593f9612024adcc8eac770b33166a331327f3a5f5d1a0504422c12f43cacd9",
  name: "togglePoemBookmark",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => togglePoemBookmark.__executeServer(opts));
const togglePoemBookmark = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => input).handler(togglePoemBookmark_createServerFn_handler, async ({
  data,
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data: existing
  } = await supabase.from("mehfil_bookmarks").select("user_id").eq("user_id", userId).eq("poem_id", data.poemId).maybeSingle();
  if (existing) {
    await supabase.from("mehfil_bookmarks").delete().eq("user_id", userId).eq("poem_id", data.poemId);
    return {
      bookmarked: false
    };
  }
  await supabase.from("mehfil_bookmarks").insert({
    user_id: userId,
    poem_id: data.poemId
  });
  return {
    bookmarked: true
  };
});
const listMyPoems_createServerFn_handler = createServerRpc({
  id: "5f3ecd1ad5980fa429fe39f30fdbc609a510a3865d9d358e53aae947291db692",
  name: "listMyPoems",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => listMyPoems.__executeServer(opts));
const listMyPoems = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(listMyPoems_createServerFn_handler, async ({
  context
}) => {
  const {
    supabase,
    userId
  } = context;
  const {
    data,
    error
  } = await supabase.from("mehfil_poems").select("*").eq("author_id", userId).order("created_at", {
    ascending: false
  }).limit(50);
  if (error) throw error;
  return data ?? [];
});
const getPoemNeighbors_createServerFn_handler = createServerRpc({
  id: "045552475ef6719f2b1d7e41344a92c22f5e038bead8523d0f9fa52a1e8a837e",
  name: "getPoemNeighbors",
  filename: "src/lib/mehfil.functions.ts"
}, (opts) => getPoemNeighbors.__executeServer(opts));
const getPoemNeighbors = createServerFn({
  method: "GET"
}).inputValidator((input) => input).handler(getPoemNeighbors_createServerFn_handler, async ({
  data
}) => {
  const sb = publicClient();
  const base = () => sb.from("mehfil_poems").select("id,slug,title,published_at,category_id").eq("status", "published");
  async function findOne(dir, scoped) {
    let q = base();
    if (scoped && data.categoryId) q = q.eq("category_id", data.categoryId);
    if (dir === "prev") {
      q = q.lt("published_at", data.publishedAt).order("published_at", {
        ascending: false
      });
    } else {
      q = q.gt("published_at", data.publishedAt).order("published_at", {
        ascending: true
      });
    }
    const {
      data: rows
    } = await q.limit(1);
    return rows?.[0] ?? null;
  }
  const [prev, next] = await Promise.all([findOne("prev", true).then((r) => r ?? findOne("prev", false)), findOne("next", true).then((r) => r ?? findOne("next", false))]);
  return {
    prev,
    next
  };
});
export {
  deleteDraft_createServerFn_handler,
  getMehfilDiscovery_createServerFn_handler,
  getMehfilHallOfFame_createServerFn_handler,
  getMehfilProfileSection_createServerFn_handler,
  getMehfilRelated_createServerFn_handler,
  getPoemBySlug_createServerFn_handler,
  getPoemNeighbors_createServerFn_handler,
  getWriterStats_createServerFn_handler,
  listMehfilCategories_createServerFn_handler,
  listMyDrafts_createServerFn_handler,
  listMyPoems_createServerFn_handler,
  listPoemsByCategory_createServerFn_handler,
  publishPoem_createServerFn_handler,
  recordPoemRead_createServerFn_handler,
  schedulePoem_createServerFn_handler,
  togglePoemBookmark_createServerFn_handler
};
