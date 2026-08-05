import { createServerFn } from "@tanstack/react-start";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { logSupabaseEnvPresence } from "@/integrations/supabase/env.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "./rate-limit-middleware";
import { auditSeoHealth } from "@/lib/seo/health";
import {
  buildRobotsTxt,
  buildSitemapXml,
  staticSitemapEntries,
  customPageSitemapEntries,
  mergeSitemapEntries,
} from "@/lib/seo/sitemap";
import {
  buildRouteCatalog,
  parseRoutePathsFromTree,
  pageKeyFromPath,
  labelFromPath,
} from "@/lib/seo/route-registry";
import { resolvePageSeo, type EntitySeoOverride } from "@/lib/seo/resolve-seo";
import { getSeoCache, setSeoCache, invalidateSeoCache, seoCacheKey } from "@/lib/seo/load-route-seo";
import type { SeoAiField, SeoGlobal, SeoPageRow } from "@/lib/seo/types";
import { buildSeoInventory, summarizeSeoInventory, type SeoInventoryRow } from "@/lib/seo/inventory";
import {
  editFormToGlobalPatch,
  editFormToPagePatch,
  globalToEditForm,
  pageToEditForm,
  validateSeoEditForm,
  getRouteEditMode,
  getTemplateVariablesForRoute,
  isPrivateAuthRoute,
  isCmsTemplateRoute,
  PRIVATE_ROUTE_WARNING,
  type SeoEditFormValues,
} from "@/lib/seo/edit-form";
import { SEO_ROUTE_CATALOG } from "@/lib/seo/route-registry";
import { loadSeoGlobal } from "@/lib/seo/load-global";

const SEO_INVENTORY_GENERIC_ERROR =
  "Could not load inventory. Check admin permissions and try again.";

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

function logSeoInventoryError(phase: string, err: unknown, userId?: string) {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;
  if (message.includes("supabaseKey is required") || message.includes("Missing Supabase environment")) {
    logSupabaseEnvPresence(`getSeoInventory ${phase}`);
  }
  console.error("[getSeoInventory]", { phase, userId, message, stack });
}

function toClientSeoInventoryError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  if (isProductionRuntime()) {
    return new Error(SEO_INVENTORY_GENERIC_ERROR);
  }
  return new Error(message || SEO_INVENTORY_GENERIC_ERROR);
}

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Forbidden: admin only");
}

async function loadStaffPermissions(): Promise<{ manage_seo_settings?: boolean }> {
  const { data } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "staff_permissions")
    .maybeSingle();
  return (data?.value as { manage_seo_settings?: boolean } | null) ?? {};
}

async function assertSeoRead(userId: string) {
  await assertAdmin(userId);
}

async function assertSeoManage(userId: string) {
  const { data: roles, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const list = (roles ?? []).map((r) => r.role as string);
  if (list.includes("super_admin")) return;
  if (list.includes("admin")) {
    const perms = await loadStaffPermissions();
    if (perms.manage_seo_settings !== false) return;
    throw new Error("Forbidden: manage_seo_settings permission required");
  }
  throw new Error("Forbidden: admin only");
}

async function canManageSeo(userId: string): Promise<boolean> {
  try {
    await assertSeoManage(userId);
    return true;
  } catch {
    return false;
  }
}

function resolvedToInheritedForm(resolved: ReturnType<typeof resolvePageSeo>): SeoEditFormValues {
  const { index, follow } = (() => {
    const robots = resolved.robots.toLowerCase();
    return { index: !robots.includes("noindex"), follow: !robots.includes("nofollow") };
  })();
  return {
    title: resolved.title,
    description: resolved.description,
    keywords: resolved.keywords,
    canonicalUrl: resolved.canonical,
    index,
    follow,
    ogTitle: resolved.ogTitle,
    ogDescription: resolved.ogDescription,
    ogImage: resolved.ogImage,
    twitterTitle: resolved.twitterTitle,
    twitterDescription: resolved.twitterDescription,
    twitterImage: resolved.twitterImage,
    jsonLdType: typeof resolved.jsonLd?.["@type"] === "string" ? resolved.jsonLd["@type"] : "",
    customJsonLd: resolved.jsonLd ? JSON.stringify(resolved.jsonLd, null, 2) : "",
    sitemapEnabled: true,
    sitemapPriority: "0.5",
    sitemapChangeFreq: "weekly",
  };
}

async function loadGlobal(): Promise<SeoGlobal | null> {
  return loadSeoGlobal(supabaseAdmin as unknown as Parameters<typeof loadSeoGlobal>[0]);
}

async function loadPages(): Promise<SeoPageRow[]> {
  const { data, error } = await supabaseAdmin.from("seo_settings").select("*").order("label").order("page_key");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as SeoPageRow[];
}

function readDiscoveredPaths(): string[] {
  try {
    const src = readFileSync(join(process.cwd(), "src/routeTree.gen.ts"), "utf8");
    return parseRoutePathsFromTree(src);
  } catch {
    return [];
  }
}

const globalSchema = z.object({
  site_name: z.string().max(120).nullable().optional(),
  site_tagline: z.string().max(300).nullable().optional(),
  default_title: z.string().max(120).nullable().optional(),
  default_description: z.string().max(500).nullable().optional(),
  default_keywords: z.string().max(500).nullable().optional(),
  canonical_domain: z.string().max(200).nullable().optional(),
  robots: z.string().max(80).nullable().optional(),
  theme_color: z.string().max(20).nullable().optional(),
  author: z.string().max(120).nullable().optional(),
  language: z.string().max(12).nullable().optional(),
  default_og_image: z.string().max(500).nullable().optional(),
  twitter_card: z.string().max(40).nullable().optional(),
  twitter_site: z.string().max(80).nullable().optional(),
  twitter_creator: z.string().max(80).nullable().optional(),
  facebook_app_id: z.string().max(40).nullable().optional(),
  google_verification: z.string().max(120).nullable().optional(),
  bing_verification: z.string().max(120).nullable().optional(),
  yandex_verification: z.string().max(120).nullable().optional(),
  baidu_verification: z.string().max(120).nullable().optional(),
});

const pageSchema = z.object({
  page_key: z.string().min(1).max(80),
  route_path: z.string().max(200).nullable().optional(),
  label: z.string().max(120).nullable().optional(),
  enabled: z.boolean().optional(),
  title: z.string().max(120).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  keywords: z.string().max(500).nullable().optional(),
  canonical_url: z.string().max(500).nullable().optional(),
  og_title: z.string().max(120).nullable().optional(),
  og_description: z.string().max(500).nullable().optional(),
  og_image: z.string().max(500).nullable().optional(),
  twitter_card: z.string().max(40).nullable().optional(),
  twitter_title: z.string().max(120).nullable().optional(),
  twitter_description: z.string().max(500).nullable().optional(),
  twitter_image: z.string().max(500).nullable().optional(),
  robots: z.string().max(80).nullable().optional(),
  json_ld: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).nullable().optional(),
  sitemap_priority: z.number().min(0).max(1).nullable().optional(),
  sitemap_changefreq: z.string().max(20).nullable().optional(),
  sitemap_exclude: z.boolean().optional(),
  noindex: z.boolean().optional(),
  nofollow: z.boolean().optional(),
  is_dynamic: z.boolean().optional(),
});

export const getSeoManagerState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [global, pages, discovered] = await Promise.all([
      loadGlobal(),
      loadPages(),
      Promise.resolve(readDiscoveredPaths()),
    ]);
    const catalog = buildRouteCatalog(discovered);
    const health = auditSeoHealth(pages, global);
    return { global, pages, catalog, discovered, health };
  });

export const syncSeoRoutes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const discovered = readDiscoveredPaths();
    const catalog = buildRouteCatalog(discovered);
    const existing = await loadPages();
    const existingKeys = new Set(existing.map((p) => p.page_key));
    const toInsert = catalog
      .filter((c) => !existingKeys.has(c.pageKey))
      .map((c) => ({
        page_key: c.pageKey,
        route_path: c.routePath,
        label: c.label,
        enabled: false,
        is_dynamic: !!c.isDynamic,
        auto_discovered: c.group === "Auto-discovered",
        sitemap_priority: c.isDynamic ? 0.4 : 0.6,
        sitemap_changefreq: c.isDynamic ? "daily" : "weekly",
      }));
    if (toInsert.length) {
      const { error } = await (supabaseAdmin as any).from("seo_settings").upsert(toInsert, { onConflict: "page_key" });
      if (error) throw new Error(error.message);
    }
    return { inserted: toInsert.length, total: catalog.length };
  });

export const upsertSeoGlobal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => globalSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await (supabaseAdmin as any).from("seo_global").upsert({
        id: 1,
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertSeoPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => pageSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await (supabaseAdmin as any).from("seo_settings").upsert({
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      }, { onConflict: "page_key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getPublicSeoGlobal = createServerFn({ method: "GET" }).handler(async () => {
  return loadGlobal();
});

export const getPublicSeoForPath = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({
    routePath: z.string(),
    templatePath: z.string().optional(),
    vars: z.record(z.string(), z.string()).optional(),
    entityOverride: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.string().optional(),
      canonical: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogImage: z.string().optional(),
      twitterTitle: z.string().optional(),
      twitterDescription: z.string().optional(),
      twitterImage: z.string().optional(),
      robots: z.string().optional(),
      noindex: z.boolean().optional(),
      nofollow: z.boolean().optional(),
    }).optional(),
    fallback: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      keywords: z.string().optional(),
      canonical: z.string().optional(),
      ogTitle: z.string().optional(),
      ogDescription: z.string().optional(),
      ogImage: z.string().optional(),
      twitterTitle: z.string().optional(),
      twitterDescription: z.string().optional(),
      twitterImage: z.string().optional(),
      robots: z.string().optional(),
      noindex: z.boolean().optional(),
      nofollow: z.boolean().optional(),
    }).optional(),
    routeDefaultsOnly: z.boolean().optional(),
  }).parse(input))
  .handler(async ({ data }) => {
    const cacheKey = seoCacheKey({
      routePath: data.routePath,
      templatePath: data.templatePath,
      vars: data.vars ? JSON.stringify(data.vars) : undefined,
      routeDefaultsOnly: data.routeDefaultsOnly,
      entity: data.entityOverride ? "1" : "0",
    });
    const cached = getSeoCache<{ global: SeoGlobal | null; resolved: ReturnType<typeof resolvePageSeo>; page: SeoPageRow | null }>(cacheKey);
    if (cached) return cached;

    const [global, pagesRes] = await Promise.all([
      loadGlobal(),
      supabaseAdmin.from("seo_settings").select("*"),
    ]);
    if (pagesRes.error) throw new Error(pagesRes.error.message);
    const pages = (pagesRes.data ?? []) as SeoPageRow[];
    const fallback = data.fallback;
    const routePath = data.routePath;
    const templatePath = data.templatePath ?? routePath;
    const entityOverride = data.entityOverride as EntitySeoOverride | undefined;
    const vars = {
      ...(data.vars ?? {}),
      site_name: global?.site_name?.trim() || data.vars?.site_name || "BooBubble",
    };
    const resolveOpts = {
      routePath,
      fallback,
      vars,
      entityOverride,
      routeDefaultsOnly: data.routeDefaultsOnly,
    };

    const exact =
      pages.find((p) => p.route_path === templatePath)
      ?? pages.find((p) => p.route_path === routePath)
      ?? pages.find((p) => p.page_key === pageKeyFromPath(templatePath));

    if (exact && !exact.is_dynamic) {
      const result = {
        global,
        resolved: resolvePageSeo(exact, global, resolveOpts),
        page: exact,
      };
      setSeoCache(cacheKey, result);
      return result;
    }

    const dynamic = pages.find((p) => {
      if (!p.is_dynamic || !p.enabled) return false;
      if (templatePath && p.route_path === templatePath) return true;
      return routePath.match(pathToRegex(p.route_path ?? "")) != null;
    });
    if (dynamic) {
      const result = {
        global,
        resolved: resolvePageSeo(dynamic, global, resolveOpts),
        page: dynamic,
      };
      setSeoCache(cacheKey, result);
      return result;
    }

    const result = {
      global,
      resolved: resolvePageSeo(null, global, {
        ...resolveOpts,
        fallback: fallback ?? { title: labelFromPath(routePath) },
      }),
      page: null,
    };
    setSeoCache(cacheKey, result);
    return result;
  });

function pathToRegex(routePath: string): RegExp {
  const pattern = routePath
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\$[a-zA-Z]+/g, "[^/]+");
  return new RegExp(`^${pattern}$`);
}

export async function buildPublicSitemapXml(): Promise<string> {
  const sb = await import("@/integrations/supabase/client.server").then((m) => m.supabaseAdmin);
  const [global, seoPages, customPagesRes, redirectsRes] = await Promise.all([
    loadGlobal(),
    loadPages(),
    sb.from("custom_pages")
      .select("slug,updated_at,published_at,noindex")
      .eq("status", "published"),
    sb.from("page_redirects").select("from_slug"),
  ]);
  const redirectFromSlugs = new Set((redirectsRes.data ?? []).map((r) => r.from_slug));
  const entries = mergeSitemapEntries(
    staticSitemapEntries(seoPages, global),
    customPageSitemapEntries(customPagesRes.data ?? [], redirectFromSlugs, global),
  );
  return buildSitemapXml(entries);
}

export async function buildPublicRobotsTxt(): Promise<string> {
  const global = await loadGlobal();
  const { siteOrigin } = await import("@/lib/seo/resolve-seo");
  return buildRobotsTxt(siteOrigin(global), global);
}

export const generatePublicSitemap = createServerFn({ method: "GET" }).handler(async () => buildPublicSitemapXml());

export const generatePublicRobots = createServerFn({ method: "GET" }).handler(async () => buildPublicRobotsTxt());

type BulkAction = "regenerate" | "keywords" | "descriptions" | "og" | "sitemap";

export const bulkSeoAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({
    action: z.enum(["regenerate", "keywords", "descriptions", "og", "sitemap"]),
    pageKeys: z.array(z.string()).optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const [global, pages] = await Promise.all([loadGlobal(), loadPages()]);
    const targets = data.pageKeys?.length
      ? pages.filter((p) => data.pageKeys!.includes(p.page_key))
      : pages.filter((p) => !p.is_dynamic);

    if (data.action === "sitemap") {
      return { ok: true, xml: buildSitemapXml(staticSitemapEntries(pages, global)) };
    }

    const updates = targets.map((p) => {
      const label = p.label ?? labelFromPath(p.route_path ?? "/");
      const site = global?.site_name ?? "App";
      const patch: Partial<SeoPageRow> = { page_key: p.page_key };
      if (data.action === "regenerate" || data.action === "descriptions") {
        patch.description = p.description?.trim() || `${label} — ${global?.site_tagline ?? `Explore ${label} on ${site}.`}`;
        patch.enabled = true;
      }
      if (data.action === "regenerate" || data.action === "keywords") {
        patch.keywords = p.keywords?.trim() || `${label}, ${site}, community, social`.toLowerCase();
      }
      if (data.action === "regenerate" || data.action === "og") {
        patch.og_title = p.og_title?.trim() || p.title?.trim() || `${label} | ${site}`;
        patch.og_description = p.og_description?.trim() || (patch.description as string | undefined) || p.description || "";
        patch.og_image = p.og_image?.trim() || global?.default_og_image || p.og_image;
        patch.twitter_title = patch.og_title as string;
        patch.twitter_description = patch.og_description as string;
        patch.twitter_image = patch.og_image as string;
      }
      if (data.action === "regenerate") {
        patch.title = p.title?.trim() || `${label} | ${site}`;
      }
      return patch;
    });

    if (updates.length) {
      const { error } = await (supabaseAdmin as any).from("seo_settings").upsert(
          updates.map((u) => ({ ...pages.find((p) => p.page_key === u.page_key), ...u, updated_at: new Date().toISOString(), updated_by: context.userId })),
          { onConflict: "page_key" },
        );
      if (error) throw new Error(error.message);
    }
    return { ok: true, updated: updates.length };
  });

export const aiGenerateSeoField = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({
    pageKey: z.string(),
    field: z.enum(["title", "description", "keywords", "og", "json_ld"]),
    context: z.string().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const [global, pages] = await Promise.all([loadGlobal(), loadPages()]);
    const page = pages.find((p) => p.page_key === data.pageKey);
    const label = page?.label ?? data.pageKey;
    const site = global?.site_name ?? "App";
    const ctx = data.context ?? page?.description ?? label;

    const generated = generateAiSeo(data.field as SeoAiField, label, site, ctx);
    if (!page) return generated;

    const patch: Partial<SeoPageRow> = { page_key: page.page_key, enabled: true };
    if (data.field === "title") patch.title = generated.title ?? `${label} | ${site}`;
    if (data.field === "description") patch.description = generated.description ?? `${label} on ${site}. ${ctx}`.slice(0, 160);
    if (data.field === "keywords") patch.keywords = generated.keywords ?? `${label}, ${site}`.toLowerCase();
    if (data.field === "og") {
      patch.og_title = generated.ogTitle ?? patch.title ?? `${label} | ${site}`;
      patch.og_description = generated.ogDescription ?? patch.description ?? "";
      patch.twitter_title = patch.og_title;
      patch.twitter_description = patch.og_description;
    }
    if (data.field === "json_ld") patch.json_ld = generated.jsonLd ?? { "@context": "https://schema.org", "@type": "WebPage", name: label, description: patch.description ?? ctx };

    await (supabaseAdmin as any).from("seo_settings").upsert({ ...page, ...patch, updated_at: new Date().toISOString(), updated_by: context.userId }, { onConflict: "page_key" });
    return generated;
  });

function generateAiSeo(field: SeoAiField, label: string, site: string, ctx: string) {
  const title = `${label} | ${site}`;
  const description = `Discover ${label} on ${site}. ${ctx}`.replace(/\s+/g, " ").trim().slice(0, 160);
  const keywords = [label, site, "community", "social", label.split(" ").join(", ")].join(", ").toLowerCase();
  const ogTitle = title;
  const ogDescription = description;
  const jsonLd = { "@context": "https://schema.org", "@type": "WebPage", name: label, description, url: "/" };

  switch (field) {
    case "title": return { title };
    case "description": return { description };
    case "keywords": return { keywords };
    case "og": return { ogTitle, ogDescription };
    case "json_ld": return { jsonLd };
    default: return { title, description, keywords, ogTitle, ogDescription, jsonLd };
  }
}


export const getSeoTargetsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [rooms, profiles, posts, games] = await Promise.all([
      supabaseAdmin.from("chatrooms").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("posts").select("id", { count: "exact", head: true }).eq("privacy", "public"),
      supabaseAdmin.from("games").select("id", { count: "exact", head: true }),
    ]);
    return {
      rooms: rooms.count ?? 0,
      profiles: profiles.count ?? 0,
      publicPosts: posts.count ?? 0,
      games: games.count ?? 0,
    };
  });

/** Read-only SEO inventory for /admin/seo — no writes, no route sync. */
export const getSeoInventory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .handler(async ({ context }) => {
    const userId = context.userId;
    try {
      await assertSeoRead(userId);
      const [global, pages, discovered] = await Promise.all([
        loadGlobal(),
        loadPages(),
        Promise.resolve(readDiscoveredPaths()),
      ]);
      const catalog = buildRouteCatalog(discovered);
      const rows = buildSeoInventory({ global, pages, catalog, discovered });
      return {
        rows,
        summary: summarizeSeoInventory(rows),
        global,
        pageCount: pages.length,
        catalogCount: catalog.length,
        discoveredCount: discovered.length,
      };
    } catch (err) {
      logSeoInventoryError("handler", err, userId);
      throw toClientSeoInventoryError(err);
    }
  });

const seoEditFormSchema = z.object({
  title: z.string().max(500),
  description: z.string().max(2000),
  keywords: z.string().max(500),
  canonicalUrl: z.string().max(500),
  index: z.boolean(),
  follow: z.boolean(),
  ogTitle: z.string().max(500),
  ogDescription: z.string().max(2000),
  ogImage: z.string().max(500),
  twitterTitle: z.string().max(500),
  twitterDescription: z.string().max(2000),
  twitterImage: z.string().max(500),
  jsonLdType: z.string().max(80),
  customJsonLd: z.string().max(10000),
  sitemapEnabled: z.boolean(),
  sitemapPriority: z.string().max(10),
  sitemapChangeFreq: z.string().max(20),
});

async function findPageForRoute(pages: SeoPageRow[], routePath: string): Promise<SeoPageRow | null> {
  const pageKey = pageKeyFromPath(routePath);
  return (
    pages.find((p) => p.route_path === routePath)
    ?? pages.find((p) => p.page_key === pageKey)
    ?? null
  );
}

/** Load editable SEO record for any inventory route. */
export const getSeoEditRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.read")])
  .inputValidator((input) => z.object({
    target: z.enum(["global", "route"]),
    routePath: z.string().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSeoRead(context.userId);
    const canManage = await canManageSeo(context.userId);

    if (data.target === "global") {
      const global = await loadGlobal();
      return {
        target: "global" as const,
        label: "Global Defaults",
        routePath: null,
        pageKey: null,
        exists: !!global,
        form: globalToEditForm(global),
        inherited: globalToEditForm(null),
        editMode: "global" as const,
        isTemplate: false,
        templateVariables: [] as string[],
        cmsManaged: false,
        canManage,
      };
    }

    const routePath = data.routePath?.trim();
    if (!routePath) throw new Error("routePath is required for route edits.");

    const [global, pages] = await Promise.all([loadGlobal(), loadPages()]);
    const page = await findPageForRoute(pages, routePath);
    const catalog = SEO_ROUTE_CATALOG.find((c) => c.routePath === routePath);
    const isDynamic = catalog?.isDynamic ?? routePath.includes("$");
    const editMode = getRouteEditMode(routePath, isDynamic);
    const templateVariables = isDynamic ? getTemplateVariablesForRoute(routePath) : [];
    const isPrivateDefault = isPrivateAuthRoute(routePath) && !page;

    const inheritedResolved = resolvePageSeo(null, global, {
      routePath,
      fallback: { title: catalog?.label ?? labelFromPath(routePath) },
    });
    const inherited = resolvedToInheritedForm(inheritedResolved);

    return {
      target: "route" as const,
      label: catalog?.label ?? labelFromPath(routePath),
      routePath,
      pageKey: page?.page_key ?? catalog?.pageKey ?? pageKeyFromPath(routePath),
      exists: !!page,
      form: pageToEditForm(page, { isPrivateDefault }),
      inherited,
      editMode,
      isTemplate: isDynamic,
      templateVariables,
      cmsManaged: isCmsTemplateRoute(routePath),
      privateRouteWarning: editMode === "private" ? PRIVATE_ROUTE_WARNING : undefined,
      canManage,
    };
  });

/** Save editable SEO record — explicit admin action only; upserts existing row keys. */
export const saveSeoEditRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth, withRateLimit("admin.write")])
  .inputValidator((input) => z.object({
    target: z.enum(["global", "route"]),
    routePath: z.string().optional(),
    form: seoEditFormSchema,
    resetToInherited: z.boolean().optional(),
  }).parse(input))
  .handler(async ({ data, context }) => {
    await assertSeoManage(context.userId);

    const catalogEntry = data.routePath
      ? SEO_ROUTE_CATALOG.find((c) => c.routePath === data.routePath)
      : undefined;
    const isTemplate = catalogEntry?.isDynamic ?? (data.routePath?.includes("$") ?? false);
    const templateVariables = isTemplate && data.routePath
      ? getTemplateVariablesForRoute(data.routePath)
      : [];

    const validation = validateSeoEditForm(data.form as SeoEditFormValues, {
      isTemplate,
      templateVariables,
    });
    if (Object.keys(validation.fieldErrors).length) {
      const first = Object.values(validation.fieldErrors)[0];
      throw new Error(first ?? "Invalid SEO form");
    }

    if (data.target === "global") {
      const patch = editFormToGlobalPatch(data.form as SeoEditFormValues);
      const { error } = await (supabaseAdmin as any).from("seo_global").upsert({
        id: 1,
        ...patch,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      });
      if (error) throw new Error(error.message);
      invalidateSeoCache();

      const [global, pages, discovered] = await Promise.all([
        loadGlobal(),
        loadPages(),
        Promise.resolve(readDiscoveredPaths()),
      ]);
      const catalog = buildRouteCatalog(discovered);
      const row = buildSeoInventory({ global, pages, catalog, discovered })
        .find((r) => r.id === "__global__") as SeoInventoryRow;

      return { ok: true, row, warnings: validation.warnings };
    }

    const routePath = data.routePath?.trim();
    if (!routePath) throw new Error("routePath is required for route edits.");

    const pages = await loadPages();
    const existing = await findPageForRoute(pages, routePath);
    const catalog = SEO_ROUTE_CATALOG.find((c) => c.routePath === routePath);
    const pageKey = existing?.page_key ?? catalog?.pageKey ?? pageKeyFromPath(routePath);
    const routeIsTemplate = catalog?.isDynamic ?? routePath.includes("$");

    if (data.resetToInherited) {
      const { error } = await (supabaseAdmin as any).from("seo_settings").upsert({
        ...existing,
        page_key: pageKey,
        route_path: routePath,
        label: existing?.label ?? catalog?.label ?? labelFromPath(routePath),
        enabled: false,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      }, { onConflict: "page_key" });
      if (error) throw new Error(error.message);
    } else {
      const patch = editFormToPagePatch(data.form as SeoEditFormValues, {
        page_key: pageKey,
        route_path: routePath,
        label: existing?.label ?? catalog?.label ?? labelFromPath(routePath),
        auto_discovered: existing?.auto_discovered ?? false,
      }, {
        isTemplate: routeIsTemplate,
        routeType: routeIsTemplate ? "dynamic" : "static",
        templateVariables,
      });

      const { error } = await (supabaseAdmin as any).from("seo_settings").upsert({
        ...existing,
        ...patch,
        updated_at: new Date().toISOString(),
        updated_by: context.userId,
      }, { onConflict: "page_key" });
      if (error) throw new Error(error.message);
    }

    const [global, freshPages, discovered] = await Promise.all([
      loadGlobal(),
      loadPages(),
      Promise.resolve(readDiscoveredPaths()),
    ]);
    const catalogAll = buildRouteCatalog(discovered);
    const row = buildSeoInventory({ global, pages: freshPages, catalog: catalogAll, discovered })
      .find((r) => r.routePath === routePath) as SeoInventoryRow;

    invalidateSeoCache();
    return { ok: true, row, warnings: validation.warnings };
  });
