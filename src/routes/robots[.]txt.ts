import { createFileRoute } from "@tanstack/react-router";
import { buildPublicRobotsTxt } from "@/lib/seo.functions";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const txt = await buildPublicRobotsTxt();
        return new Response(txt, {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
