import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Cron-callable endpoint that purges expired backup_history rows.
export const Route = createFileRoute("/api/public/backup-retention")({
  server: {
    handlers: {
      POST: async () => {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
          return new Response(JSON.stringify({ error: "server not configured" }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
        const supabase = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await supabase.rpc("backup_history_purge_expired");
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(JSON.stringify({ ok: true, removed: data ?? 0 }), {
          headers: { "Content-Type": "application/json" },
        });
      },
      GET: async () => new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      }),
    },
  },
});
