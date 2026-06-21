import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Public cleanup endpoint for demo accounts (the "Try demo" flow).
// Accepts { access_token } via JSON or text body so navigator.sendBeacon can
// call it on tab close. Verifies the token belongs to an account flagged as
// demo (and matches the demo email pattern) before cascade-deleting all rows.
export const Route = createFileRoute("/api/public/demo-cleanup")({
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

          const u = data.user;
          const meta = (u.user_metadata ?? {}) as { is_demo?: boolean };
          const isDemoFlag = meta.is_demo === true;
          const emailOk =
            typeof u.email === "string" &&
            /^demo\+[a-z0-9]+@palrgo\.test$/i.test(u.email);
          const notAnon = u.is_anonymous !== true;
          if (!isDemoFlag || !emailOk || !notAnon) {
            return new Response("Not a demo account", { status: 403 });
          }

          // Hard guard: never delete an account that holds any role.
          const { count: roleCount, error: roleErr } = await supabaseAdmin
            .from("user_roles")
            .select("user_id", { count: "exact", head: true })
            .eq("user_id", u.id);
          if (roleErr) return new Response(roleErr.message, { status: 500 });
          if ((roleCount ?? 0) > 0) {
            return new Response("Account has roles", { status: 403 });
          }

          const { error: rpcErr } = await supabaseAdmin.rpc("delete_user_cascade", {
            _user: u.id,
          });
          if (rpcErr) return new Response(rpcErr.message, { status: 500 });

          const { error: dErr } = await supabaseAdmin.auth.admin.deleteUser(u.id);
          if (dErr) return new Response(dErr.message, { status: 500 });

          return new Response("ok");
        } catch (e) {
          console.error("demo-cleanup failed", e);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});
