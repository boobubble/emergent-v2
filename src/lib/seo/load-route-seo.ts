import { getPublicSeoForPath } from "@/lib/seo.functions";
import { createSeoRouteHead, resolvePageSeo, seoFallback } from "@/lib/seo";
import type { ResolvedSeo, SeoGlobal } from "@/lib/seo/types";

export type RouteSeoLoaderData = {
  seo: ResolvedSeo;
  global: SeoGlobal | null;
};

/** Load centralized SEO for a static route (use in route loader + head). */
export async function loadRouteSeo(
  routePath: string,
  fallbackLabel: string,
  fallbackDescription?: string,
): Promise<RouteSeoLoaderData> {
  try {
    const data = await getPublicSeoForPath({ data: { routePath } }) as { resolved: ResolvedSeo; global: SeoGlobal | null };
    return { seo: data.resolved, global: data.global };
  } catch {
    const global = null;
    return {
      global,
      seo: resolvePageSeo(null, global, {
        routePath,
        fallback: seoFallback(fallbackLabel, fallbackDescription),
      }),
    };
  }
}

/**
 * Homepage Batch 4: merge route-level seo_settings with hardcoded defaults.
 * Skips seo_global during SSR resolution so existing route defaults remain the baseline.
 */
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

export function headFromRouteSeo(loaderData?: RouteSeoLoaderData | null) {
  if (!loaderData?.seo) {
    return createSeoRouteHead(
      resolvePageSeo(null, null, { routePath: "/", fallback: seoFallback("App") }),
    );
  }
  return createSeoRouteHead(loaderData.seo, loaderData.global);
}
