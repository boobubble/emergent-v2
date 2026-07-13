import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildBrand } from "@/lib/branding";

/**
 * Dynamic PWA manifest — pulls name/short_name/theme/icons from
 * app_settings.branding so buyers can white-label without touching source.
 *
 * Served at /manifest.webmanifest thanks to the [.] escape in the filename.
 */
export const Route = createFileRoute("/manifest.webmanifest")({
  server: {
    handlers: {
      GET: async () => {
        let rawBranding: any = {};
        try {
          const { data } = await supabaseAdmin
            .from("app_settings")
            .select("value")
            .eq("key", "branding")
            .maybeSingle();
          rawBranding = data?.value ?? {};
        } catch {
          // fall through — defaults kick in
        }
        const brand = buildBrand(rawBranding, "light");
        const icon192 = brand.logoLight || brand.favicon || "/pwa-192.png";
        const icon512 = brand.logoLight || brand.favicon || "/pwa-512.png";
        const manifest = {
          name: brand.name,
          short_name: brand.shortName,
          description: brand.metaDescription || brand.tagline,
          start_url: "/",
          scope: "/",
          display: "standalone",
          orientation: "portrait",
          background_color: "#0F172A",
          theme_color: brand.themeColor,
          icons: [
            { src: icon192, sizes: "192x192", type: "image/png", purpose: "any maskable" },
            { src: icon512, sizes: "512x512", type: "image/png", purpose: "any maskable" },
          ],
        };
        return new Response(JSON.stringify(manifest), {
          headers: {
            "Content-Type": "application/manifest+json; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
