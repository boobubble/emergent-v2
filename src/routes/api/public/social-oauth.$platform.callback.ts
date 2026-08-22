import { createFileRoute } from "@tanstack/react-router";
import { completeFacebookOauth, completePinterestOauth, consumeOauthState } from "@/lib/social-connections.server";

function redirectConnections(extra?: Record<string, string>) {
  const params = new URLSearchParams({ tab: "connections" });
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v);
    }
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/admin/social-automation?${params.toString()}`,
      "Cache-Control": "no-store",
    },
  });
}

export const Route = createFileRoute("/api/public/social-oauth/$platform/callback")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const platform = params.platform;
        const url = new URL(request.url);
        const err = url.searchParams.get("error_description") || url.searchParams.get("error");
        if (err) return redirectConnections({ oauth_error: err.slice(0, 180) });
        if (platform !== "facebook" && platform !== "pinterest") {
          return redirectConnections({ oauth_error: "unsupported_platform" });
        }
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (!code || !state) {
          return redirectConnections({ oauth_error: "missing_code" });
        }
        try {
          const consumed = await consumeOauthState(state, platform);
          void consumed;
          if (platform === "facebook") {
            const result = await completeFacebookOauth(code, consumed.adminUserId);
            return redirectConnections({
              oauth_ok: "facebook",
              facebook_pages: result.needsPageSelection ? "1" : "0",
            });
          }
          await completePinterestOauth(code, consumed.verifier, consumed.adminUserId);
          return redirectConnections({ oauth_ok: "pinterest" });
        } catch (e) {
          const message = e instanceof Error ? e.message : "OAuth failed";
          return redirectConnections({ oauth_error: message.slice(0, 180) });
        }
      },
    },
  },
});
