import { createServerFn } from "@tanstack/react-start";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { withRateLimit } from "./rate-limit-middleware";
import {
  auditSeoHealth,
  buildRobotsTxt,
  buildRouteCatalog,
  buildSitemapXml,
  parseRoutePathsFromTree,
  pageKeyFromPath,
  labelFromPath,
  resolvePageSeo,
  staticSitemapEntries,
  type SeoAiField,
  type SeoGlobal,
  type SeoPageRow,
} from "@/lib/seo";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["super_admin", "admin"]);
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Forbidden: admin only");
}

async function loadGlobal(): Promise<SeoGlobal | null> {
  const { data, error } = await (supabaseAdmin as any).from("seo_global").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return data as SeoGlobal | null;
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
  .inputValidator((input) => z.object({ routePath: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const [global, pagesRes] = await Promise.all([
      loadGlobal(),
      supabaseAdmin.from("seo_settings").select("*"),
    ]);
    if (pagesRes.error) throw new Error(pagesRes.error.message);
    const pages = (pagesRes.data ?? []) as SeoPageRow[];
    const exact = pages.find((p) => p.route_path === data.routePath);
    if (exact) {
      const resolved = resolvePageSeo(exact, global, { routePath: data.routePath });
      return { global, resolved };
    }

    const dynamic = pages.find((p) => p.is_dynamic && p.enabled && data.routePath.match(pathToRegex(p.route_path ?? "")));
    if (dynamic) {
      const resolved = resolvePageSeo(dynamic, global, { routePath: data.routePath });
      return { global, resolved };
    }

    const resolved = resolvePageSeo(null, global, {
      routePath: data.routePath,
      fallback: { title: labelFromPath(data.routePath) },
    });
    return { global, resolved };
  });

function pathToRegex(routePath: string): RegExp {
  const pattern = routePath
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\$[a-zA-Z]+/g, "[^/]+");
  return new RegExp(`^${pattern}$`);
}

export async function buildPublicSitemapXml(): Promise<string> {
  const [global, pages] = await Promise.all([loadGlobal(), loadPages()]);
  return buildSitemapXml(staticSitemapEntries(pages, global));
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
