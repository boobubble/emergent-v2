import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public cleanup endpoint for guest accounts.
// Accepts { access_token } via JSON or text (so sendBeacon can call it on tab close).
// Verifies the token belongs to an anonymous user before deleting.
export const Route = createFileRoute("/api/public/guest-cleanup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const raw = await request.text();
          let token = "";
          try {
            const j = JSON.parse(raw);
            token = typeof j?.access_token === "string" ? j.access_token : "";
          } catch {
            token = raw.trim();
          }
          if (!token || token.length > 4096) {
            return new Response("Invalid token", { status: 400 });
          }
          const { data, error } = await supabaseAdmin.auth.getUser(token);
          if (error || !data?.user) return new Response("Unauthorized", { status: 401 });
          if (!data.user.is_anonymous) return new Response("Not a guest", { status: 403 });

          const userId = data.user.id;
          await supabaseAdmin.from("messages").delete().eq("author_id", userId);
          await supabaseAdmin.from("reactions").delete().eq("user_id", userId);
          await supabaseAdmin.from("profiles").delete().eq("id", userId);
          await supabaseAdmin.auth.admin.deleteUser(userId);
          return new Response("ok");
        } catch (e) {
          console.error("guest-cleanup failed", e);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});
