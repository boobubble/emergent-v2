import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useBrand } from "@/lib/branding";
import { getPublicSeoGlobal } from "@/lib/seo.functions";
import { applyBrandChromeToDocument } from "@/lib/seo/dynamic-brand-chrome";

/**
 * Applies white-label brand chrome (favicon, theme-color, verification, site_name)
 * at runtime. Does NOT own page SEO title/description/canonical/robots —
 * those come exclusively from TanStack route `head()` (headFromRouteSeo).
 */
export function DynamicBrandHead() {
  const brand = useBrand();
  const fetchGlobal = useServerFn(getPublicSeoGlobal);
  const { data: seoGlobal } = useQuery({
    queryKey: ["seo-global-public"],
    queryFn: () => fetchGlobal({}),
    staleTime: 5 * 60_000,
    retry: false,
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    applyBrandChromeToDocument(document, {
      themeColor: seoGlobal?.theme_color || brand.themeColor,
      siteName: seoGlobal?.site_name || brand.name,
      shortName: brand.shortName,
      author: seoGlobal?.author,
      googleVerification: seoGlobal?.google_verification,
      bingVerification: seoGlobal?.bing_verification,
      twitterSite: seoGlobal?.twitter_site,
      twitterCreator: seoGlobal?.twitter_creator,
      favicon: brand.favicon,
      appleTouchIcon: brand.appleTouchIcon,
    });
  }, [brand, seoGlobal]);

  return null;
}
