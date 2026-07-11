/**
 * License revalidation cron endpoint.
 *
 * Called by pg_cron every 24h. Reads the local signed cache, re-verifies
 * with the provider, updates the DB + cache, appends a `license_logs` row.
 *
 * Auth: standard Supabase `apikey` header (the anon/publishable key) — this
 * lives under `/api/public/*`, which bypasses the site-wide auth wall on
 * published deployments.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/license-revalidate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apikey = request.headers.get("apikey") ?? request.headers.get("x-api-key");
        const expected = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!apikey || !expected || apikey !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }
        try {
          const { LicenseManager } = await import("@/lib/licensing/manager.server");
          const cache = await LicenseManager.readCache();
          if (!cache) {
            return Response.json({ ok: true, skipped: "no-cache" });
          }
          const result = await LicenseManager.check({
            domain: cache.domain,
            serverIp: cache.serverIp,
            productVersion: cache.productVersion,
            runtime: "pg_cron",
          });
          return Response.json({
            ok: result.ok,
            status: result.status,
            message: result.message ?? null,
            licenseId: cache.licenseId,
            checkedAt: new Date().toISOString(),
          });
        } catch (e) {
          return Response.json(
            { ok: false, error: (e as Error)?.message ?? "revalidate failed" },
            { status: 500 },
          );
        }
      },
      GET: async () => Response.json({ ok: true, endpoint: "license-revalidate" }),
    },
  },
});
