import { c as createServerRpc } from "./createServerRpc-9vB30MM2.mjs";
import { c as createServerFn } from "./server-DxoLgaf4.mjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { r as requireSupabaseAuth } from "./auth-middleware-B-ZvcUuj.mjs";
import { supabaseAdmin } from "./client.server-BXCYxJZY.mjs";
import { w as withRateLimit } from "./rate-limit-middleware-CAVrvtrO.mjs";
import { r as resolvePageSeo, b as buildSitemapXml, s as staticSitemapEntries, a as buildRobotsTxt } from "./sitemap-Dl8Aqg_O.mjs";
import { a as auditSeoHealth } from "./health-87xmw6GE.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, b as booleanType, n as numberType, r as recordType, c as unionType, d as nullType, a as arrayType, e as enumType } from "../_libs/zod.mjs";
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
const SEO_ROUTE_CATALOG = [
  { pageKey: "home", routePath: "/", label: "Home", group: "Core" },
  { pageKey: "welcome", routePath: "/welcome", label: "Welcome / Landing", group: "Core" },
  { pageKey: "heropage", routePath: "/heropage", label: "Hero Page", group: "Core" },
  { pageKey: "feed", routePath: "/feed", label: "Feed", group: "Social" },
  { pageKey: "chatroom", routePath: "/chatroom", label: "Chatrooms", group: "Social" },
  { pageKey: "chatrooms", routePath: "/chatrooms", label: "Chatrooms List", group: "Social" },
  { pageKey: "competitions", routePath: "/competitions", label: "Competitions", group: "Social" },
  { pageKey: "competition-detail", routePath: "/competitions/$slug", label: "Competition Details", group: "Social", isDynamic: true, dynamicPattern: "/competitions/:slug" },
  { pageKey: "hall-of-fame", routePath: "/hall-of-fame", label: "Hall of Fame", group: "Social" },
  { pageKey: "leaderboard", routePath: "/leaderboard", label: "Leaderboard", group: "Social" },
  { pageKey: "confessions", routePath: "/confessions", label: "Confessions", group: "Social" },
  { pageKey: "communities", routePath: "/communities", label: "Communities", group: "Social" },
  { pageKey: "community-detail", routePath: "/community/$slug", label: "Community Details", group: "Social", isDynamic: true, dynamicPattern: "/community/:slug" },
  { pageKey: "find-friends", routePath: "/find-friends", label: "Friends", group: "Social" },
  { pageKey: "poetry", routePath: "/poetry/", label: "Poetry", group: "Poetry" },
  { pageKey: "poetry-detail", routePath: "/poetry/$slug", label: "Poetry Detail", group: "Poetry", isDynamic: true, dynamicPattern: "/poetry/:slug" },
  { pageKey: "poetry-categories", routePath: "/poetry/categories", label: "Poetry Categories", group: "Poetry" },
  { pageKey: "battle-hub", routePath: "/battle-hub", label: "Battle Field", group: "Games" },
  { pageKey: "games", routePath: "/games", label: "Games", group: "Games" },
  { pageKey: "game-detail", routePath: "/games/$slug", label: "Game Detail", group: "Games", isDynamic: true, dynamicPattern: "/games/:slug" },
  { pageKey: "radio", routePath: "/radio", label: "Radio", group: "Media" },
  { pageKey: "reels", routePath: "/reels", label: "Reels", group: "Media" },
  { pageKey: "profile", routePath: "/u/$username", label: "Profiles", group: "Users", isDynamic: true, dynamicPattern: "/u/:username" },
  { pageKey: "feed-post", routePath: "/feed/$slug", label: "Feed Post", group: "Social", isDynamic: true, dynamicPattern: "/feed/:slug" },
  { pageKey: "search", routePath: "/search", label: "Search", group: "Core" },
  { pageKey: "notifications", routePath: "/notifications", label: "Notifications", group: "Users" },
  { pageKey: "messages", routePath: "/messages", label: "Messages", group: "Users" },
  { pageKey: "account", routePath: "/account", label: "Account", group: "Users" },
  { pageKey: "pricing", routePath: "/pricing", label: "Pricing", group: "Marketing" },
  { pageKey: "wallet", routePath: "/wallet", label: "Wallet", group: "Users" },
  { pageKey: "login", routePath: "/login", label: "Login", group: "Auth" },
  { pageKey: "signup", routePath: "/signup", label: "Signup", group: "Auth" },
  { pageKey: "reset-password", routePath: "/reset-password", label: "Reset Password", group: "Auth" },
  { pageKey: "custom-page", routePath: "/$slug", label: "Static / CMS Pages", group: "Content", isDynamic: true, dynamicPattern: "/:slug" },
  { pageKey: "not-found", routePath: "/404", label: "404", group: "System" },
  { pageKey: "error", routePath: "/500", label: "500", group: "System" }
];
const EXCLUDED_PREFIXES = ["/admin", "/api/", "/broadcaster", "/deploy", "/installer", "/setup-wizard", "/lovable/"];
const EXCLUDED_EXACT = /* @__PURE__ */ new Set([
  "/manifest.webmanifest",
  "/banned"
]);
function pageKeyFromPath(routePath) {
  return routePath.replace(/^\//, "").replace(/\$[a-zA-Z]+/g, "param").replace(/\//g, "-").replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "home";
}
function labelFromPath(routePath) {
  if (routePath === "/") return "Home";
  const parts = routePath.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "Page";
  if (last.startsWith("$")) return `${last.slice(1)} Detail`;
  return last.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function isPublicSeoRoute(routePath) {
  if (!routePath || routePath.includes("//")) return false;
  if (EXCLUDED_EXACT.has(routePath)) return false;
  return !EXCLUDED_PREFIXES.some((p) => routePath === p || routePath.startsWith(p));
}
function parseRoutePathsFromTree(source) {
  const paths = /* @__PURE__ */ new Set();
  for (const match of source.matchAll(/fullPath:\s*'([^']+)'/g)) {
    const p = match[1];
    if (isPublicSeoRoute(p)) paths.add(p);
  }
  return [...paths].sort();
}
function buildRouteCatalog(discoveredPaths) {
  const byPath = /* @__PURE__ */ new Map();
  for (const def of SEO_ROUTE_CATALOG) byPath.set(def.routePath, def);
  for (const routePath of discoveredPaths) {
    if (byPath.has(routePath)) continue;
    byPath.set(routePath, {
      pageKey: pageKeyFromPath(routePath),
      routePath,
      label: labelFromPath(routePath),
      group: "Auto-discovered",
      isDynamic: routePath.includes("$"),
      dynamicPattern: routePath.includes("$") ? routePath.replace(/\$[a-zA-Z]+/g, ":param") : void 0
    });
  }
  return [...byPath.values()].sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
}
async function assertAdmin(userId) {
  const {
    data,
    error
  } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Forbidden: admin only");
}
async function loadGlobal() {
  const {
    data,
    error
  } = await supabaseAdmin.from("seo_global").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
async function loadPages() {
  const {
    data,
    error
  } = await supabaseAdmin.from("seo_settings").select("*").order("label").order("page_key");
  if (error) throw new Error(error.message);
  return data ?? [];
}
function readDiscoveredPaths() {
  try {
    const src = readFileSync(join(process.cwd(), "src/routeTree.gen.ts"), "utf8");
    return parseRoutePathsFromTree(src);
  } catch {
    return [];
  }
}
const globalSchema = objectType({
  site_name: stringType().max(120).nullable().optional(),
  site_tagline: stringType().max(300).nullable().optional(),
  default_title: stringType().max(120).nullable().optional(),
  default_description: stringType().max(500).nullable().optional(),
  default_keywords: stringType().max(500).nullable().optional(),
  canonical_domain: stringType().max(200).nullable().optional(),
  robots: stringType().max(80).nullable().optional(),
  theme_color: stringType().max(20).nullable().optional(),
  author: stringType().max(120).nullable().optional(),
  language: stringType().max(12).nullable().optional(),
  default_og_image: stringType().max(500).nullable().optional(),
  twitter_card: stringType().max(40).nullable().optional(),
  twitter_site: stringType().max(80).nullable().optional(),
  twitter_creator: stringType().max(80).nullable().optional(),
  facebook_app_id: stringType().max(40).nullable().optional(),
  google_verification: stringType().max(120).nullable().optional(),
  bing_verification: stringType().max(120).nullable().optional(),
  yandex_verification: stringType().max(120).nullable().optional(),
  baidu_verification: stringType().max(120).nullable().optional()
});
const pageSchema = objectType({
  page_key: stringType().min(1).max(80),
  route_path: stringType().max(200).nullable().optional(),
  label: stringType().max(120).nullable().optional(),
  enabled: booleanType().optional(),
  title: stringType().max(120).nullable().optional(),
  description: stringType().max(500).nullable().optional(),
  keywords: stringType().max(500).nullable().optional(),
  canonical_url: stringType().max(500).nullable().optional(),
  og_title: stringType().max(120).nullable().optional(),
  og_description: stringType().max(500).nullable().optional(),
  og_image: stringType().max(500).nullable().optional(),
  twitter_card: stringType().max(40).nullable().optional(),
  twitter_title: stringType().max(120).nullable().optional(),
  twitter_description: stringType().max(500).nullable().optional(),
  twitter_image: stringType().max(500).nullable().optional(),
  robots: stringType().max(80).nullable().optional(),
  json_ld: recordType(unionType([stringType(), numberType(), booleanType(), nullType()])).nullable().optional(),
  sitemap_priority: numberType().min(0).max(1).nullable().optional(),
  sitemap_changefreq: stringType().max(20).nullable().optional(),
  sitemap_exclude: booleanType().optional(),
  noindex: booleanType().optional(),
  nofollow: booleanType().optional(),
  is_dynamic: booleanType().optional()
});
const getSeoManagerState_createServerFn_handler = createServerRpc({
  id: "d4f043ae2bae1e1c5d64d642dae2a1a50f1324fa30664816663b99571d0b9273",
  name: "getSeoManagerState",
  filename: "src/lib/seo.functions.ts"
}, (opts) => getSeoManagerState.__executeServer(opts));
const getSeoManagerState = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.read")]).handler(getSeoManagerState_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const [global, pages, discovered] = await Promise.all([loadGlobal(), loadPages(), Promise.resolve(readDiscoveredPaths())]);
  const catalog = buildRouteCatalog(discovered);
  const health = auditSeoHealth(pages, global);
  return {
    global,
    pages,
    catalog,
    discovered,
    health
  };
});
const syncSeoRoutes_createServerFn_handler = createServerRpc({
  id: "cae8cf0592ed74179d08a1c15f4fe008adfedcc57a668612f90f57f2dac24397",
  name: "syncSeoRoutes",
  filename: "src/lib/seo.functions.ts"
}, (opts) => syncSeoRoutes.__executeServer(opts));
const syncSeoRoutes = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).handler(syncSeoRoutes_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const discovered = readDiscoveredPaths();
  const catalog = buildRouteCatalog(discovered);
  const existing = await loadPages();
  const existingKeys = new Set(existing.map((p) => p.page_key));
  const toInsert = catalog.filter((c) => !existingKeys.has(c.pageKey)).map((c) => ({
    page_key: c.pageKey,
    route_path: c.routePath,
    label: c.label,
    enabled: false,
    is_dynamic: !!c.isDynamic,
    auto_discovered: c.group === "Auto-discovered",
    sitemap_priority: c.isDynamic ? 0.4 : 0.6,
    sitemap_changefreq: c.isDynamic ? "daily" : "weekly"
  }));
  if (toInsert.length) {
    const {
      error
    } = await supabaseAdmin.from("seo_settings").upsert(toInsert, {
      onConflict: "page_key"
    });
    if (error) throw new Error(error.message);
  }
  return {
    inserted: toInsert.length,
    total: catalog.length
  };
});
const upsertSeoGlobal_createServerFn_handler = createServerRpc({
  id: "3da852e36fd8679dbf791b761d0223ea984bb4634eb8fe689af166bdb47ed5b0",
  name: "upsertSeoGlobal",
  filename: "src/lib/seo.functions.ts"
}, (opts) => upsertSeoGlobal.__executeServer(opts));
const upsertSeoGlobal = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => globalSchema.parse(input)).handler(upsertSeoGlobal_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("seo_global").upsert({
    id: 1,
    ...data,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_by: context.userId
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const upsertSeoPage_createServerFn_handler = createServerRpc({
  id: "d3fbc3c38eae1a113befecb843e3b35df67c53fcb7eae10955fdd59f44947fdb",
  name: "upsertSeoPage",
  filename: "src/lib/seo.functions.ts"
}, (opts) => upsertSeoPage.__executeServer(opts));
const upsertSeoPage = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => pageSchema.parse(input)).handler(upsertSeoPage_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const {
    error
  } = await supabaseAdmin.from("seo_settings").upsert({
    ...data,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_by: context.userId
  }, {
    onConflict: "page_key"
  });
  if (error) throw new Error(error.message);
  return {
    ok: true
  };
});
const getPublicSeoGlobal_createServerFn_handler = createServerRpc({
  id: "057107a16154625217fb17f4a99066fb28501f65e826827aacff4360cfe96d0d",
  name: "getPublicSeoGlobal",
  filename: "src/lib/seo.functions.ts"
}, (opts) => getPublicSeoGlobal.__executeServer(opts));
const getPublicSeoGlobal = createServerFn({
  method: "GET"
}).handler(getPublicSeoGlobal_createServerFn_handler, async () => {
  return loadGlobal();
});
const getPublicSeoForPath_createServerFn_handler = createServerRpc({
  id: "d298245276cf4685cce59f087db7ceb6d3e7f79bf9b571300da7b5f7cc309330",
  name: "getPublicSeoForPath",
  filename: "src/lib/seo.functions.ts"
}, (opts) => getPublicSeoForPath.__executeServer(opts));
const getPublicSeoForPath = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  routePath: stringType()
}).parse(input)).handler(getPublicSeoForPath_createServerFn_handler, async ({
  data
}) => {
  const [global, pagesRes] = await Promise.all([loadGlobal(), supabaseAdmin.from("seo_settings").select("*")]);
  if (pagesRes.error) throw new Error(pagesRes.error.message);
  const pages = pagesRes.data ?? [];
  const exact = pages.find((p) => p.route_path === data.routePath);
  if (exact) {
    const resolved2 = resolvePageSeo(exact, global, {
      routePath: data.routePath
    });
    return {
      global,
      resolved: resolved2
    };
  }
  const dynamic = pages.find((p) => p.is_dynamic && p.enabled && data.routePath.match(pathToRegex(p.route_path ?? "")));
  if (dynamic) {
    const resolved2 = resolvePageSeo(dynamic, global, {
      routePath: data.routePath
    });
    return {
      global,
      resolved: resolved2
    };
  }
  const resolved = resolvePageSeo(null, global, {
    routePath: data.routePath,
    fallback: {
      title: labelFromPath(data.routePath)
    }
  });
  return {
    global,
    resolved
  };
});
function pathToRegex(routePath) {
  const pattern = routePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\$[a-zA-Z]+/g, "[^/]+");
  return new RegExp(`^${pattern}$`);
}
async function buildPublicSitemapXml() {
  const [global, pages] = await Promise.all([loadGlobal(), loadPages()]);
  return buildSitemapXml(staticSitemapEntries(pages, global));
}
async function buildPublicRobotsTxt() {
  const global = await loadGlobal();
  const {
    siteOrigin
  } = await import("./sitemap-Dl8Aqg_O.mjs").then((n) => n.c);
  return buildRobotsTxt(siteOrigin(global), global);
}
const generatePublicSitemap_createServerFn_handler = createServerRpc({
  id: "d26328e6ea7fc3a67aa5e8c7fa807565a02abca187435011918b129469deab8a",
  name: "generatePublicSitemap",
  filename: "src/lib/seo.functions.ts"
}, (opts) => generatePublicSitemap.__executeServer(opts));
const generatePublicSitemap = createServerFn({
  method: "GET"
}).handler(generatePublicSitemap_createServerFn_handler, async () => buildPublicSitemapXml());
const generatePublicRobots_createServerFn_handler = createServerRpc({
  id: "10dbeb1283fb76c8e0ca8d3551fcc62033e9c26ba38d60921827b0deb613ecf6",
  name: "generatePublicRobots",
  filename: "src/lib/seo.functions.ts"
}, (opts) => generatePublicRobots.__executeServer(opts));
const generatePublicRobots = createServerFn({
  method: "GET"
}).handler(generatePublicRobots_createServerFn_handler, async () => buildPublicRobotsTxt());
const bulkSeoAction_createServerFn_handler = createServerRpc({
  id: "837235bd73d4681b6805fcb18718f242f55991f28b3a1249914900c581704891",
  name: "bulkSeoAction",
  filename: "src/lib/seo.functions.ts"
}, (opts) => bulkSeoAction.__executeServer(opts));
const bulkSeoAction = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  action: enumType(["regenerate", "keywords", "descriptions", "og", "sitemap"]),
  pageKeys: arrayType(stringType()).optional()
}).parse(input)).handler(bulkSeoAction_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const [global, pages] = await Promise.all([loadGlobal(), loadPages()]);
  const targets = data.pageKeys?.length ? pages.filter((p) => data.pageKeys.includes(p.page_key)) : pages.filter((p) => !p.is_dynamic);
  if (data.action === "sitemap") {
    return {
      ok: true,
      xml: buildSitemapXml(staticSitemapEntries(pages, global))
    };
  }
  const updates = targets.map((p) => {
    const label = p.label ?? labelFromPath(p.route_path ?? "/");
    const site = global?.site_name ?? "App";
    const patch = {
      page_key: p.page_key
    };
    if (data.action === "regenerate" || data.action === "descriptions") {
      patch.description = p.description?.trim() || `${label} — ${global?.site_tagline ?? `Explore ${label} on ${site}.`}`;
      patch.enabled = true;
    }
    if (data.action === "regenerate" || data.action === "keywords") {
      patch.keywords = p.keywords?.trim() || `${label}, ${site}, community, social`.toLowerCase();
    }
    if (data.action === "regenerate" || data.action === "og") {
      patch.og_title = p.og_title?.trim() || p.title?.trim() || `${label} | ${site}`;
      patch.og_description = p.og_description?.trim() || patch.description || p.description || "";
      patch.og_image = p.og_image?.trim() || global?.default_og_image || p.og_image;
      patch.twitter_title = patch.og_title;
      patch.twitter_description = patch.og_description;
      patch.twitter_image = patch.og_image;
    }
    if (data.action === "regenerate") {
      patch.title = p.title?.trim() || `${label} | ${site}`;
    }
    return patch;
  });
  if (updates.length) {
    const {
      error
    } = await supabaseAdmin.from("seo_settings").upsert(updates.map((u) => ({
      ...pages.find((p) => p.page_key === u.page_key),
      ...u,
      updated_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_by: context.userId
    })), {
      onConflict: "page_key"
    });
    if (error) throw new Error(error.message);
  }
  return {
    ok: true,
    updated: updates.length
  };
});
const aiGenerateSeoField_createServerFn_handler = createServerRpc({
  id: "98d71ad3953702bd8d0692b9089988403278853af9b953bb54faaf91ee50fab8",
  name: "aiGenerateSeoField",
  filename: "src/lib/seo.functions.ts"
}, (opts) => aiGenerateSeoField.__executeServer(opts));
const aiGenerateSeoField = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth, withRateLimit("admin.write")]).inputValidator((input) => objectType({
  pageKey: stringType(),
  field: enumType(["title", "description", "keywords", "og", "json_ld"]),
  context: stringType().optional()
}).parse(input)).handler(aiGenerateSeoField_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context.userId);
  const [global, pages] = await Promise.all([loadGlobal(), loadPages()]);
  const page = pages.find((p) => p.page_key === data.pageKey);
  const label = page?.label ?? data.pageKey;
  const site = global?.site_name ?? "App";
  const ctx = data.context ?? page?.description ?? label;
  const generated = generateAiSeo(data.field, label, site, ctx);
  if (!page) return generated;
  const patch = {
    page_key: page.page_key,
    enabled: true
  };
  if (data.field === "title") patch.title = generated.title ?? `${label} | ${site}`;
  if (data.field === "description") patch.description = generated.description ?? `${label} on ${site}. ${ctx}`.slice(0, 160);
  if (data.field === "keywords") patch.keywords = generated.keywords ?? `${label}, ${site}`.toLowerCase();
  if (data.field === "og") {
    patch.og_title = generated.ogTitle ?? patch.title ?? `${label} | ${site}`;
    patch.og_description = generated.ogDescription ?? patch.description ?? "";
    patch.twitter_title = patch.og_title;
    patch.twitter_description = patch.og_description;
  }
  if (data.field === "json_ld") patch.json_ld = generated.jsonLd ?? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: label,
    description: patch.description ?? ctx
  };
  await supabaseAdmin.from("seo_settings").upsert({
    ...page,
    ...patch,
    updated_at: (/* @__PURE__ */ new Date()).toISOString(),
    updated_by: context.userId
  }, {
    onConflict: "page_key"
  });
  return generated;
});
function generateAiSeo(field, label, site, ctx) {
  const title = `${label} | ${site}`;
  const description = `Discover ${label} on ${site}. ${ctx}`.replace(/\s+/g, " ").trim().slice(0, 160);
  const keywords = [label, site, "community", "social", label.split(" ").join(", ")].join(", ").toLowerCase();
  const ogTitle = title;
  const ogDescription = description;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: label,
    description,
    url: "/"
  };
  switch (field) {
    case "title":
      return {
        title
      };
    case "description":
      return {
        description
      };
    case "keywords":
      return {
        keywords
      };
    case "og":
      return {
        ogTitle,
        ogDescription
      };
    case "json_ld":
      return {
        jsonLd
      };
    default:
      return {
        title,
        description,
        keywords,
        ogTitle,
        ogDescription,
        jsonLd
      };
  }
}
const getSeoTargetsSummary_createServerFn_handler = createServerRpc({
  id: "295eb0929d821b3073eb4274063ec8e58b419ef8db80b8be3f9f496509c0eac3",
  name: "getSeoTargetsSummary",
  filename: "src/lib/seo.functions.ts"
}, (opts) => getSeoTargetsSummary.__executeServer(opts));
const getSeoTargetsSummary = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth, withRateLimit("admin.read")]).handler(getSeoTargetsSummary_createServerFn_handler, async ({
  context
}) => {
  await assertAdmin(context.userId);
  const [rooms, profiles, posts, games] = await Promise.all([supabaseAdmin.from("chatrooms").select("id", {
    count: "exact",
    head: true
  }), supabaseAdmin.from("profiles").select("id", {
    count: "exact",
    head: true
  }), supabaseAdmin.from("posts").select("id", {
    count: "exact",
    head: true
  }).eq("privacy", "public"), supabaseAdmin.from("games").select("id", {
    count: "exact",
    head: true
  })]);
  return {
    rooms: rooms.count ?? 0,
    profiles: profiles.count ?? 0,
    publicPosts: posts.count ?? 0,
    games: games.count ?? 0
  };
});
export {
  aiGenerateSeoField_createServerFn_handler,
  bulkSeoAction_createServerFn_handler,
  generatePublicRobots_createServerFn_handler,
  generatePublicSitemap_createServerFn_handler,
  getPublicSeoForPath_createServerFn_handler,
  getPublicSeoGlobal_createServerFn_handler,
  getSeoManagerState_createServerFn_handler,
  getSeoTargetsSummary_createServerFn_handler,
  syncSeoRoutes_createServerFn_handler,
  upsertSeoGlobal_createServerFn_handler,
  upsertSeoPage_createServerFn_handler
};
