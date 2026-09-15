import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HomeGuestShell } from "@/components/home/HomeGuestShell";
import { useAppSettings } from "@/lib/app-settings";
import { useAuth } from "@/lib/auth-store";
import { loadRouteSeoWithDefaults } from "@/lib/seo";
import { HOME_SEO_FALLBACK, homeRouteHead } from "@/lib/seo/home-page";

export const Route = createFileRoute("/")({
  // Homepage <head> is owned by homeRouteHead() (not seo_settings / root shell).
  loader: () => loadRouteSeoWithDefaults("/", HOME_SEO_FALLBACK),
  head: ({ loaderData }) => homeRouteHead(loaderData),
  component: HomeRouter,
});

function HomeRouter() {
  const { user } = useAuth();
  const { layoutPriority, ready: settingsReady } = useAppSettings();
  // SSR and the first client paint always render the welcome-style SEO
  // homepage so crawlers and hydration see the same HTML. Signed-in users
  // are sent to /chatroom after mount (or /feed when feed_first is set).
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    setShowApp(Boolean(user));
  }, [user]);

  if (showApp && user) {
    if (!settingsReady) {
      return (
        <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
          <p>Loading…</p>
        </div>
      );
    }
    if (layoutPriority === "feed_first") {
      return <Navigate to="/feed" replace />;
    }
    return <Navigate to="/chatroom" replace />;
  }

  return <HomeGuestShell />;
}
