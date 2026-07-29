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

export function headFromRouteSeo(loaderData?: RouteSeoLoaderData | null) {
  if (!loaderData?.seo) {
    return createSeoRouteHead(
      resolvePageSeo(null, null, { routePath: "/", fallback: seoFallback("App") }),
    );
  }
  return createSeoRouteHead(loaderData.seo, loaderData.global);
}
