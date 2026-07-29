import { createFileRoute } from "@tanstack/react-router";
import { buildPublicSitemapXml } from "@/lib/seo.functions";

export const Route = createFileRoute("/sitemap.xml" as never)({
  server: {
    handlers: {
      GET: async () => {
        const xml = await buildPublicSitemapXml();
        return new Response(xml, {
          headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
