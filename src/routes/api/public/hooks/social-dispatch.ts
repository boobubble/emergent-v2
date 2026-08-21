import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getSupabasePublicEnv } from "@/integrations/supabase/env.server";

/**
 * Drains social_post_queue via the buffer-social Edge Function.
 * Auth: Authorization Bearer = social_automation_settings.hook_secret
 *   OR header x-social-hook-secret
 *
 * Safe to call every minute (pg_cron / external cron).
 * Never affects user signup — only processes already-queued events.
 */
export const Route = createFileRoute("/api/public/hooks/social-dispatch")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { data: settings } = await (supabaseAdmin as any)
            .from("social_automation_settings")
            .select("hook_secret, social_signup_enabled")
            .eq("id", true)
            .maybeSingle();

          if (!settings?.social_signup_enabled) {
            return Response.json({ ok: true, skipped: "social_signup_disabled" });
          }

          const expected =
            typeof settings?.hook_secret === "string" ? settings.hook_secret : "";
          if (!expected || expected.length < 16) {
            return new Response("Hook secret not configured", { status: 503 });
          }

          const header =
            request.headers.get("x-social-hook-secret") ??
            (request.headers.get("authorization")?.toLowerCase().startsWith("bearer ")
              ? request.headers.get("authorization")!.slice(7).trim()
              : null);

          if (!header || !timingSafeEq(header, expected)) {
            return new Response("Unauthorized", { status: 401 });
          }

          const { url } = getSupabasePublicEnv();
          const fnUrl = `${url.replace(/\/$/, "")}/functions/v1/buffer-social`;
          const anon =
            process.env.SUPABASE_ANON_KEY?.trim() ||
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
            "";

          const res = await fetch(fnUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: anon,
              "x-social-hook-secret": expected,
            },
            body: JSON.stringify({ action: "process_queue", limit: 5 }),
          });

          const payload = await res.json().catch(() => ({
            ok: false,
            error: `Edge Function HTTP ${res.status}`,
          }));

          return Response.json(payload, { status: res.ok ? 200 : 502 });
        } catch (e) {
          console.error("[social-dispatch]", e instanceof Error ? e.message : e);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});

function timingSafeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
