import { createFileRoute } from "@tanstack/react-router";
import { IRC_ROOMS_GATEWAY_ORIGIN_URL } from "@/lib/irc-rooms";

const CACHE = { "Cache-Control": "public, max-age=15" };

/**
 * Same-origin proxy for gateway IRC `/rooms`.
 * Browser fetches cannot read ws.yaarzo.com directly (no CORS); this route
 * forwards the authoritative gateway payload from the app origin.
 */
export const Route = createFileRoute("/api/public/irc-rooms")({
  server: {
    handlers: {
      GET: async () => {
        const res = await fetch(IRC_ROOMS_GATEWAY_ORIGIN_URL, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) {
          return Response.json(
            { ok: false, error: `Gateway IRC rooms HTTP ${res.status}` },
            { status: 502 },
          );
        }
        const payload = await res.json();
        return Response.json(payload, { headers: CACHE });
      },
    },
  },
});
