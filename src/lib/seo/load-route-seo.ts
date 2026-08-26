import { getPublicSeoForPath } from "@/lib/seo.functions";
import { createSeoRouteHead, seoFallback } from "@/lib/seo/route-head";
import { notFoundSeoHead } from "@/lib/seo/not-found";
import { resolvePageSeo, safeJsonLd, siteOrigin, type EntitySeoOverride } from "@/lib/seo/resolve-seo";
import { loadSeoGlobal } from "@/lib/seo/load-global";
import type { ResolvedSeo, SeoGlobal } from "@/lib/seo/types";
import { isPrivateAuthRoute, privateRouteDefaultForm } from "@/lib/seo/edit-form";

export type RouteSeoLoaderData = {
  seo: ResolvedSeo;
  global: SeoGlobal | null;
  /** Route-generated JSON-LD used when admin custom JSON-LD is absent. */
  fallbackJsonLd?: Record<string, string | number | boolean | null> | null;
};

export type DynamicRouteSeoInput = {
  templatePath: string;
  instancePath: string;
  vars: Record<string, string>;
  fallback: Partial<ResolvedSeo>;
  entityOverride?: EntitySeoOverride | null;
  fallbackJsonLd?: Record<string, unknown> | null;
  routeDefaultsOnly?: boolean;
};

/** Load centralized SEO for a static route (use in route loader + head). */
export async function loadRouteSeo(
  routePath: string,
  fallbackLabel: string,
  fallbackDescription?: string,
): Promise<RouteSeoLoaderData> {
  try {
    const data = await getPublicSeoForPath({ data: { routePath } }) as {
      resolved: ResolvedSeo;
      global: SeoGlobal | null;
    };
    return { seo: data.resolved, global: data.global };
  } catch {
    return {
      global: null,
      seo: resolvePageSeo(null, null, {
        routePath,
        fallback: seoFallback(fallbackLabel, fallbackDescription),
      }),
    };
  }
}

/** Static routes with rich hardcoded fallbacks that should win over global defaults. */
export async function loadRouteSeoWithDefaults(
  routePath: string,
  fallback: Partial<ResolvedSeo>,
): Promise<RouteSeoLoaderData> {
  try {
    const data = await getPublicSeoForPath({
      data: { routePath, fallback, routeDefaultsOnly: true },
    }) as { resolved: ResolvedSeo; global: SeoGlobal | null };
    return { seo: data.resolved, global: data.global };
  } catch {
    return {
      global: null,
      seo: resolvePageSeo(null, null, { routePath, fallback }),
    };
  }
}

/** Private/auth routes — defaults to noindex unless explicitly configured in seo_settings. */
export async function loadPrivateRouteSeo(
  routePath: string,
  fallbackLabel: string,
  fallbackDescription?: string,
): Promise<RouteSeoLoaderData> {
  const privateDefaults = privateRouteDefaultForm();
  const fallback = {
    ...seoFallback(fallbackLabel, fallbackDescription),
    noindex: privateDefaults.index === false,
    nofollow: privateDefaults.follow === false,
    robots: "noindex, nofollow",
  };
  try {
    const data = await getPublicSeoForPath({
      data: { routePath, fallback },
    }) as { resolved: ResolvedSeo; global: SeoGlobal | null; page: { enabled?: boolean } | null };
    const seo = data.resolved;
    if (!data.page?.enabled) {
      return {
        seo: {
          ...seo,
          noindex: true,
          nofollow: seo.nofollow ?? true,
          robots: seo.robots?.includes("noindex") ? seo.robots : "noindex, nofollow",
        },
        global: data.global,
      };
    }
    return { seo, global: data.global };
  } catch {
    return {
      global: null,
      seo: resolvePageSeo(null, null, { routePath, fallback }),
    };
  }
}

/** Load seo_global origin + site name for route loaders (SSR). */
export async function loadSeoSiteContext(): Promise<{
  global: SeoGlobal | null;
  origin: string;
  siteName: string;
}> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const global = await loadSeoGlobal(
    supabaseAdmin as unknown as Parameters<typeof loadSeoGlobal>[0],
  );
  return {
    global,
    origin: siteOrigin(global),
    siteName: global?.site_name?.trim() || "BooBubble",
  };
}

/** Dynamic/detail routes with entity template variables and route fallbacks. */
export async function loadDynamicRouteSeo(input: DynamicRouteSeoInput): Promise<RouteSeoLoaderData> {
  const fallbackJsonLd = safeJsonLd(input.fallbackJsonLd ?? undefined);
  try {
    const data = await getPublicSeoForPath({
      data: {
        routePath: input.instancePath,
        templatePath: input.templatePath,
        vars: input.vars,
        fallback: input.fallback,
        entityOverride: input.entityOverride ?? undefined,
        routeDefaultsOnly: input.routeDefaultsOnly,
      },
    }) as { resolved: ResolvedSeo; global: SeoGlobal | null };
    const seo = {
      ...data.resolved,
      jsonLd: data.resolved.jsonLd ?? fallbackJsonLd,
    };
    return { seo, global: data.global, fallbackJsonLd };
  } catch {
    const seo = resolvePageSeo(null, null, {
      routePath: input.instancePath,
      vars: input.vars,
      fallback: input.fallback,
      entityOverride: input.entityOverride,
    });
    return {
      global: null,
      seo: { ...seo, jsonLd: seo.jsonLd ?? fallbackJsonLd },
      fallbackJsonLd,
    };
  }
}

export function headFromRouteSeo(loaderData?: RouteSeoLoaderData | null) {
  if (!loaderData?.seo) {
    return notFoundSeoHead();
  }
  return createSeoRouteHead(loaderData.seo, loaderData.global);
}

export function isPrivateSeoRoute(routePath: string): boolean {
  return isPrivateAuthRoute(routePath);
}

export function competitionOgImage(origin: string, slug: string, completed?: boolean): string {
  const base = `${origin}/api/public/og/competition/${slug}`;
  return completed ? `${base}?variant=winner` : base;
}

export function buildCompetitionFallbackJsonLd(input: {
  name: string;
  description: string;
  startAt?: string;
  endAt?: string;
  status?: string;
  image?: string;
  url: string;
}): Record<string, string | number | boolean | null> | null {
  return safeJsonLd({
    "@context": "https://schema.org",
    "@type": "Event",
    name: input.name,
    description: input.description,
    startDate: input.startAt,
    endDate: input.endAt,
    eventStatus:
      input.status === "live"
        ? "https://schema.org/EventScheduled"
        : input.status === "completed"
          ? "https://schema.org/EventCompleted"
          : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    image: input.image ? [input.image] : undefined,
    url: input.url,
  });
}

export function buildPoetryFallbackJsonLd(input: {
  title: string;
  description: string;
  url: string;
  publishedAt?: string | null;
  coverUrl?: string | null;
  authorName: string;
  categoryName?: string | null;
  upvotes?: number;
  reads?: number;
}): Record<string, string | number | boolean | null> | null {
  return safeJsonLd({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: input.title,
    name: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.publishedAt,
    image: input.coverUrl ? [input.coverUrl] : undefined,
    author: { "@type": "Person", name: input.authorName },
    genre: input.categoryName ?? undefined,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: input.upvotes ?? 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ReadAction",
        userInteractionCount: input.reads ?? 0,
      },
    ],
  });
}

export function buildFeedPostFallbackJsonLd(input: {
  title: string;
  description: string;
  url: string;
  createdAt?: string;
  image?: string;
  authorName: string;
  reactions?: number;
  comments?: number;
}): Record<string, string | number | boolean | null> | null {
  return safeJsonLd({
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.createdAt,
    image: input.image ? [input.image] : undefined,
    author: { "@type": "Person", name: input.authorName },
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: input.reactions ?? 0,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/CommentAction",
        userInteractionCount: input.comments ?? 0,
      },
    ],
  });
}

export function buildCmsFallbackJsonLd(input: {
  title: string;
  description: string;
  url: string;
  publishedAt?: string | null;
  image?: string | null;
}): Record<string, string | number | boolean | null> | null {
  return safeJsonLd({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: input.url,
    datePublished: input.publishedAt,
    image: input.image ? [input.image] : undefined,
  });
}

/** Short-lived in-memory cache for public SEO resolution (SSR). */

type CacheEntry<T> = { value: T; expiresAt: number };

const SEO_CACHE = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 30_000;

export function seoCacheKey(parts: Record<string, string | boolean | undefined>): string {
  return Object.entries(parts)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${String(v)}`)
    .join("&");
}

export function getSeoCache<T>(key: string): T | undefined {
  const entry = SEO_CACHE.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    SEO_CACHE.delete(key);
    return undefined;
  }
  return entry.value;
}

export function setSeoCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS): void {
  SEO_CACHE.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidateSeoCache(prefix?: string): void {
  if (!prefix) {
    SEO_CACHE.clear();
    return;
  }
  for (const key of SEO_CACHE.keys()) {
    if (key.startsWith(prefix)) SEO_CACHE.delete(key);
  }
}
