import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { useHomePageMode } from "@/lib/use-home-page-mode";
import { landingPathForMode } from "@/lib/landing-path";
import { loadPrivateRouteSeo, headFromRouteSeo } from "@/lib/seo";

/**
 * This `/login` route is kept as an OPTIONAL admin-controlled community-login
 * template (for campaigns or special events). It is disabled by default —
 * visitors are redirected to `/` (or `/heropage` in hero mode), which has
 * embedded sign in / sign up / forgot-password dialogs.
 *
 * Admins enable it by setting the `community_login_enabled` flag to `true`
 * in `app_settings`.
 */
function LoginRoute() {
  const [state, setState] = useState<"loading" | "enabled" | "disabled">("loading");
  const { mode: homeMode } = useHomePageMode();

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const supabase = await loadBrowserSupabase();
        const { data } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "community_login_enabled")
          .maybeSingle();
        if (cancel) return;
        const enabled = data?.value === true || (data?.value as { enabled?: boolean } | null)?.enabled === true;
        setState(enabled ? "enabled" : "disabled");
      } catch {
        if (!cancel) setState("disabled");
      }
    })();
    return () => { cancel = true; };
  }, []);

  if (state === "loading") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center text-muted-foreground">
        <p>Loading…</p>
      </div>
    );
  }
  if (state === "disabled") return <Navigate to={landingPathForMode(homeMode)} replace />;
  return <AuthScreen />;
}

export const Route = createFileRoute("/login")({
  loader: () => loadPrivateRouteSeo("/login", "Community sign in", "Optional community sign-in page."),
  head: ({ loaderData }) => headFromRouteSeo(loaderData),
  component: LoginRoute,
});
