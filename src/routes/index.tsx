import { createFileRoute, Navigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { HomeGuestShell } from "@/components/home/HomeGuestShell";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import { useAppSettings } from "@/lib/app-settings";
import { useAuth } from "@/lib/auth-store";
import { loadRouteSeoWithDefaults } from "@/lib/seo";
import { HOME_SEO_FALLBACK, homeRouteHead } from "@/lib/seo/home-page";

const ChatApp = lazy(() =>
  import("@/components/chat/ChatApp").then((m) => ({ default: m.ChatApp })),
);

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
  // homepage so crawlers and hydration see the same HTML. Authenticated
  // ChatApp mounts after.
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
        <Suspense fallback={null}>
          <ChatApp />
        </Suspense>
      </RouteErrorBoundary>
    );
  }

  return <HomeGuestShell />;
}
