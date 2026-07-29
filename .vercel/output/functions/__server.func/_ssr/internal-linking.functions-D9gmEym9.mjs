import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, b as booleanType, n as numberType, e as enumType, a as arrayType } from "../_libs/zod.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "./env.server-Bcmcot3M.mjs";
async function assertAdmin(userId) {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data,
    error
  } = await supabaseAdmin2.from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("Forbidden: admin only");
}
const GENERIC_ANCHORS = /* @__PURE__ */ new Set(["click here", "read more", "learn more", "here", "this", "more", "this page", "this article", "click", "link"]);
const targetSchema = objectType({
  id: stringType().uuid().optional(),
  title: stringType().min(1).max(200),
  slug: stringType().max(200).nullable().optional(),
  url: stringType().min(1).max(500),
  description: stringType().max(1e3).nullable().optional(),
  keywords: arrayType(stringType().max(80)).max(40).optional(),
  category: stringType().max(80).nullable().optional(),
  type: enumType(["blog", "tool", "game", "feed_page", "poll", "hashtag", "community_page", "help_page", "announcement", "seo_page"]),
  priority: numberType().int().min(1).max(10).optional(),
  is_cornerstone: booleanType().optional(),
  is_active: booleanType().optional(),
  source_table: stringType().max(80).nullable().optional(),
  source_id: stringType().uuid().nullable().optional()
});
const listLinkTargets_createServerFn_handler = createServerRpc({
  id: "5ce65aa2e8e895f2018e9e5063d7f9dc603d5bad9ed44d1b4085d7ce4bef21fd",
  name: "listLinkTargets",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => listLinkTargets.__executeServer(opts));
const listLinkTargets = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(listLinkTargets_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data,
    error
  } = await supabaseAdmin2.from("internal_link_targets").select("*").order("is_cornerstone", {
    ascending: false
  }).order("priority", {
    ascending: false
  }).order("updated_at", {
    ascending: false
  }).limit(1e3);
  if (error) throw new Error(error.message);
  return data ?? [];
});
const upsertLinkTarget_createServerFn_handler = createServerRpc({
  id: "252f293278d9058682e9d9a629844fa7ed16133753f70d711628c5de78246de9",
  name: "upsertLinkTarget",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => upsertLinkTarget.__executeServer(opts));
const upsertLinkTarget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((input) => targetSchema.parse(input)).handler(upsertLinkTarget_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const row = {
    ...data,
    keywords: data.keywords ?? [],
    priority: data.priority ?? 5,
    is_cornerstone: data.is_cornerstone ?? false,
    is_active: data.is_active ?? true,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  const {
    error
  } = await supabaseAdmin2.from("internal_link_targets").upsert(row, {
    onConflict: "url"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const deleteLinkTarget_createServerFn_handler = createServerRpc({
  id: "17f507d159b469cf52756054746f66281437c049165210f88e7d181e58593b02",
  name: "deleteLinkTarget",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => deleteLinkTarget.__executeServer(opts));
const deleteLinkTarget = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((input) => objectType({
  id: stringType().uuid()
}).parse(input)).handler(deleteLinkTarget_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    error
  } = await supabaseAdmin2.from("internal_link_targets").delete().eq("id", data.id);
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const syncLinkTargets_createServerFn_handler = createServerRpc({
  id: "9f285e3de8baed76d5f1511d9799b223bb3c4b336bdc143c5e6aeffea5a8ea78",
  name: "syncLinkTargets",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => syncLinkTargets.__executeServer(opts));
const syncLinkTargets = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(syncLinkTargets_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const rows = [];
  const {
    data: pages
  } = await supabaseAdmin2.from("custom_pages").select("id, slug, title, excerpt, meta_description, meta_keywords, category, is_cornerstone, link_priority, status").eq("status", "published").limit(2e3);
  for (const p of pages ?? []) {
    const type = p.category === "help" ? "help_page" : "seo_page";
    const kw = (p.meta_keywords ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    rows.push({
      title: p.title || p.slug,
      slug: p.slug,
      url: `/p/${p.slug}`,
      description: p.excerpt || p.meta_description || null,
      keywords: kw,
      category: p.category,
      type,
      priority: p.link_priority ?? 5,
      is_cornerstone: !!p.is_cornerstone,
      is_active: true,
      source_table: "custom_pages",
      source_id: p.id
    });
  }
  const {
    data: tags
  } = await supabaseAdmin2.from("hashtags").select("tag, usage_count").order("usage_count", {
    ascending: false
  }).limit(200);
  for (const t of tags ?? []) {
    const tag = String(t.tag).toLowerCase();
    rows.push({
      title: `#${tag}`,
      slug: tag,
      url: `/hashtags/${tag}`,
      description: `Posts tagged #${tag}`,
      keywords: [tag, `#${tag}`],
      category: "hashtag",
      type: "hashtag",
      priority: Math.min(10, 1 + Math.floor(Math.log2((t.usage_count ?? 1) + 1))),
      is_cornerstone: false,
      is_active: true,
      source_table: "hashtags",
      source_id: null
    });
  }
  const STATIC = [{
    title: "Chatrooms",
    url: "/chatroom",
    type: "community_page",
    keywords: ["chat", "chatroom", "rooms"],
    description: "Live community chatrooms"
  }, {
    title: "Social Feed",
    url: "/feed",
    type: "feed_page",
    keywords: ["feed", "posts", "social"],
    description: "Community social feed"
  }, {
    title: "Games",
    url: "/games",
    type: "game",
    keywords: ["games", "play", "mini games"],
    description: "Mini games and competitions"
  }, {
    title: "Find Friends",
    url: "/find-friends",
    type: "community_page",
    keywords: ["friends", "online friends"],
    description: "Find people to chat with"
  }, {
    title: "Confessions",
    url: "/confessions",
    type: "community_page",
    keywords: ["confessions", "anonymous"],
    description: "Anonymous community confessions"
  }, {
    title: "Leaderboard",
    url: "/leaderboard",
    type: "community_page",
    keywords: ["leaderboard", "top users"],
    description: "Top users leaderboard"
  }];
  for (const s of STATIC) {
    rows.push({
      ...s,
      slug: s.url.replace(/^\//, ""),
      priority: 7,
      is_cornerstone: false,
      is_active: true,
      category: null,
      source_table: "static",
      source_id: null
    });
  }
  let inserted = 0;
  for (const r of rows) {
    const {
      error
    } = await supabaseAdmin2.from("internal_link_targets").upsert({
      ...r,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }, {
      onConflict: "url"
    });
    if (!error) inserted++;
  }
  return {
    ok: true,
    count: inserted,
    total: rows.length
  };
});
const listLinkablePages_createServerFn_handler = createServerRpc({
  id: "67e1bc18c4da8bdd7960c22416a3e9c317044f118e06f121d18229d7955b7f41",
  name: "listLinkablePages",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => listLinkablePages.__executeServer(opts));
const listLinkablePages = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(listLinkablePages_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data,
    error
  } = await supabaseAdmin2.from("custom_pages").select("id, slug, title, content, status").eq("status", "published").order("updated_at", {
    ascending: false
  }).limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title || p.slug,
    url: `/p/${p.slug}`,
    content: p.content ?? ""
  }));
});
function stripHtml(s) {
  return s.replace(/<[^>]*>/g, " ");
}
function findMatches(text, target) {
  const candidates = /* @__PURE__ */ new Set();
  if (target.title) candidates.add(target.title);
  for (const k of target.keywords ?? []) if (k && k.length >= 3) candidates.add(k);
  const matches = [];
  for (const cand of candidates) {
    if (GENERIC_ANCHORS.has(cand.toLowerCase())) continue;
    const escaped = cand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "gi");
    let m;
    while ((m = re.exec(text)) !== null) {
      matches.push({
        anchor: m[0],
        index: m.index
      });
    }
  }
  return matches;
}
function buildForbiddenRanges(html) {
  const ranges = [];
  const re = /<(h1|h2|h3|code|pre|blockquote|a|table|img|figcaption)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    ranges.push([m.index, m.index + m[0].length]);
  }
  const re2 = /<(img|br|hr)\b[^>]*\/?>/gi;
  while ((m = re2.exec(html)) !== null) ranges.push([m.index, m.index + m[0].length]);
  const lines = html.split("\n");
  let offset = 0;
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      ranges.push([offset, offset + line.length + 1]);
      inFence = !inFence;
    } else if (inFence) {
      ranges.push([offset, offset + line.length + 1]);
    } else if (/^#{1,3}\s/.test(line)) {
      ranges.push([offset, offset + line.length + 1]);
    }
    offset += line.length + 1;
  }
  return ranges;
}
const inRanges = (idx, ranges) => ranges.some(([a, b]) => idx >= a && idx < b);
const suggestLinks_createServerFn_handler = createServerRpc({
  id: "2effa52156f93330768cd81b6a4bc58580b5e25f896ccf6ac65a82f7e0866ade",
  name: "suggestLinks",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => suggestLinks.__executeServer(opts));
const suggestLinks = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((input) => objectType({
  content: stringType().min(1).max(2e5),
  contentType: stringType().max(40).optional(),
  excludeUrl: stringType().max(500).optional(),
  maxSuggestions: numberType().int().min(1).max(50).optional()
}).parse(input)).handler(suggestLinks_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: targets,
    error
  } = await supabaseAdmin2.from("internal_link_targets").select("*").eq("is_active", true).limit(2e3);
  if (error) throw new Error(error.message);
  const html = data.content;
  const plain = stripHtml(html);
  const forbidden = buildForbiddenRanges(html);
  const suggestions = [];
  const TYPE_WEIGHT = {
    seo_page: 10,
    blog: 8,
    tool: 7,
    game: 6,
    community_page: 6,
    poll: 5,
    hashtag: 4,
    help_page: 4,
    feed_page: 3,
    announcement: 2
  };
  const perTargetCount = {};
  for (const t of targets ?? []) {
    if (data.excludeUrl && t.url === data.excludeUrl) continue;
    const matches = findMatches(plain, {
      title: t.title,
      keywords: t.keywords ?? []
    });
    for (const m of matches) {
      if (GENERIC_ANCHORS.has(m.anchor.toLowerCase())) continue;
      const htmlIdx = html.toLowerCase().indexOf(m.anchor.toLowerCase());
      if (htmlIdx === -1 || inRanges(htmlIdx, forbidden)) continue;
      const start = Math.max(0, htmlIdx - 60);
      const end = Math.min(html.length, htmlIdx + m.anchor.length + 60);
      const snippet = stripHtml(html.slice(start, end)).replace(/\s+/g, " ").trim();
      const baseScore = (TYPE_WEIGHT[t.type] ?? 3) + (t.is_cornerstone ? 4 : 0) + (t.priority ?? 5) / 2;
      suggestions.push({
        target_id: t.id,
        target_url: t.url,
        title: t.title,
        type: t.type,
        anchor_text: m.anchor,
        context_snippet: snippet,
        relevance_score: Math.round(baseScore * 10) / 10,
        reason: t.is_cornerstone ? `Cornerstone ${t.type.replace("_", " ")} matched anchor "${m.anchor}"` : `Matched anchor "${m.anchor}" for ${t.type.replace("_", " ")}`,
        offset: htmlIdx
      });
    }
  }
  suggestions.sort((a, b) => b.relevance_score - a.relevance_score);
  const usedAnchors = /* @__PURE__ */ new Set();
  const filtered = [];
  for (const s of suggestions) {
    perTargetCount[s.target_id] = perTargetCount[s.target_id] ?? 0;
    if (perTargetCount[s.target_id] >= 3) continue;
    const dedupeKey = `${s.anchor_text.toLowerCase()}@${Math.floor(s.offset / 300)}`;
    if (usedAnchors.has(dedupeKey)) continue;
    usedAnchors.add(dedupeKey);
    perTargetCount[s.target_id]++;
    filtered.push(s);
    if (filtered.length >= (data.maxSuggestions ?? 30)) break;
  }
  return filtered.map(({
    offset: _o,
    ...rest
  }) => rest);
});
const applyItemSchema = objectType({
  target_url: stringType().min(1).max(500),
  anchor_text: stringType().min(1).max(120)
});
const applyLinksToPage_createServerFn_handler = createServerRpc({
  id: "d6e9d1a8d3fcfbaf515ce5e454bc9b27705b337807c6d2b92979519496550641",
  name: "applyLinksToPage",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => applyLinksToPage.__executeServer(opts));
const applyLinksToPage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).inputValidator((input) => objectType({
  pageId: stringType().uuid(),
  approved: arrayType(applyItemSchema).min(1).max(50)
}).parse(input)).handler(applyLinksToPage_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: page,
    error
  } = await supabaseAdmin2.from("custom_pages").select("id, content").eq("id", data.pageId).single();
  if (error || !page) throw new Error(error?.message ?? "Page not found");
  let content = page.content;
  const forbidden = buildForbiddenRanges(content);
  const appliedAnchors = /* @__PURE__ */ new Set();
  let applied = 0;
  for (const item of data.approved) {
    if (appliedAnchors.has(item.anchor_text.toLowerCase())) continue;
    const escaped = item.anchor_text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`\\b${escaped}\\b`, "i");
    const match = re.exec(content);
    if (!match) continue;
    if (inRanges(match.index, forbidden)) continue;
    const before = content.slice(Math.max(0, match.index - 200), match.index);
    if (/<a\b[^>]*$/i.test(before)) continue;
    const link = `<a href="${item.target_url}" data-internal-link="1">${match[0]}</a>`;
    content = content.slice(0, match.index) + link + content.slice(match.index + match[0].length);
    appliedAnchors.add(item.anchor_text.toLowerCase());
    applied++;
  }
  const {
    error: upErr
  } = await supabaseAdmin2.from("custom_pages").update({
    content,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.pageId);
  if (upErr) throw new Error(upErr.message);
  return {
    ok: true,
    applied
  };
});
const getOrphanReport_createServerFn_handler = createServerRpc({
  id: "862947d4e956959370b8111f80baebb7f5784a6ee5fc2efba2dec540910a7c8a",
  name: "getOrphanReport",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => getOrphanReport.__executeServer(opts));
const getOrphanReport = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(getOrphanReport_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: pages
  } = await supabaseAdmin2.from("custom_pages").select("id, slug, title, content, status").eq("status", "published").limit(1e3);
  const {
    data: targets
  } = await supabaseAdmin2.from("internal_link_targets").select("url, title, type").eq("is_active", true).limit(2e3);
  const incoming = {};
  const outgoing = {};
  for (const p of pages ?? []) {
    const out = p.content.match(/href="(\/[^"]+)"/g) ?? [];
    outgoing[`/p/${p.slug}`] = out.length;
    for (const h of out) {
      const url = h.match(/href="([^"]+)"/)?.[1];
      if (url) incoming[url] = (incoming[url] ?? 0) + 1;
    }
  }
  const report = (targets ?? []).map((t) => ({
    url: t.url,
    title: t.title,
    type: t.type,
    incoming: incoming[t.url] ?? 0,
    outgoing: outgoing[t.url] ?? 0
  }));
  return {
    orphans: report.filter((r) => r.incoming === 0).sort((a, b) => a.outgoing - b.outgoing),
    lowLinks: report.filter((r) => r.incoming > 0 && r.incoming < 3),
    total: report.length
  };
});
const getLinkAnalytics_createServerFn_handler = createServerRpc({
  id: "00b65b5d311059736d517194b4abedc1ff57d9f4ba3c9b905fe070fa33488561",
  name: "getLinkAnalytics",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => getLinkAnalytics.__executeServer(opts));
const getLinkAnalytics = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("api")]).handler(getLinkAnalytics_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1e3).toISOString();
  const {
    data: clicks
  } = await supabaseAdmin2.from("internal_link_clicks").select("target_url, anchor_text, created_at").gte("created_at", since).limit(2e4);
  const byUrl = {};
  const byAnchor = {};
  for (const c of clicks ?? []) {
    byUrl[c.target_url] = (byUrl[c.target_url] ?? 0) + 1;
    if (c.anchor_text) byAnchor[c.anchor_text] = (byAnchor[c.anchor_text] ?? 0) + 1;
  }
  const top = (obj) => Object.entries(obj).map(([k, v]) => ({
    key: k,
    count: v
  })).sort((a, b) => b.count - a.count).slice(0, 20);
  return {
    totalClicks: clicks?.length ?? 0,
    windowDays: 30,
    topUrls: top(byUrl),
    topAnchors: top(byAnchor)
  };
});
const trackLinkClick_createServerFn_handler = createServerRpc({
  id: "ab3b07ff9ee4a546390a97072e6c8d16850cae428cc4f04c916a369d8be1fb6e",
  name: "trackLinkClick",
  filename: "src/lib/internal-linking.functions.ts"
}, (opts) => trackLinkClick.__executeServer(opts));
const trackLinkClick = createServerFn({
  method: "POST"
}).middleware([withRateLimit("api")]).inputValidator((input) => objectType({
  target_url: stringType().min(1).max(500),
  source_url: stringType().max(500).optional(),
  anchor_text: stringType().max(200).optional()
}).parse(input)).handler(trackLinkClick_createServerFn_handler, async ({
  data
}) => {
  const {
    supabaseAdmin: supabaseAdmin2
  } = await import("./client.server-BXCYxJZY.mjs");
  const {
    data: target
  } = await supabaseAdmin2.from("internal_link_targets").select("id").eq("url", data.target_url).maybeSingle();
  await supabaseAdmin2.from("internal_link_clicks").insert({
    target_id: target?.id ?? null,
    target_url: data.target_url,
    source_url: data.source_url ?? null,
    anchor_text: data.anchor_text ?? null
  });
  return {
    ok: true
  };
});
export {
  applyLinksToPage_createServerFn_handler,
  deleteLinkTarget_createServerFn_handler,
  getLinkAnalytics_createServerFn_handler,
  getOrphanReport_createServerFn_handler,
  listLinkTargets_createServerFn_handler,
  listLinkablePages_createServerFn_handler,
  suggestLinks_createServerFn_handler,
  syncLinkTargets_createServerFn_handler,
  trackLinkClick_createServerFn_handler,
  upsertLinkTarget_createServerFn_handler
};
