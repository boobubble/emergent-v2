import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChatApp } from "@/components/chat/ChatApp";
import { HomeSeoContent } from "@/components/home/HomeSeoContent";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
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
  // SSR and the first client paint always render HomeSeoContent so crawlers
  // and hydration see the same HTML. Authenticated ChatApp mounts after.
  const [showApp, setShowApp] = useState(false);

  useEffect(() => {
    setShowApp(Boolean(user));
  }, [user]);

  if (showApp && user) {
    if (settingsReady && layoutPriority === "feed_first") {
      return <Navigate to="/feed" replace />;
    }
    return (
      <RouteErrorBoundary section="Chatrooms" featureStore="chat">
        <ChatApp />
      </RouteErrorBoundary>
    );
  }

  return <HomeSeoContent />;
}
