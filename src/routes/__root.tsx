import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  Navigate,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth-store";
import { AuthGateProvider } from "@/lib/auth-gate";
import { ChatProvider } from "@/lib/chat-store";
import { FeedPrefsProvider } from "@/lib/feed-prefs";
import { IgnoreProvider } from "@/lib/ignore-store";
import { AppSettingsProvider } from "@/lib/app-settings";
import { SubscriptionGate } from "@/components/subscription/SubscriptionGate";

import { useEffect } from "react";
import { applyAccent, getStoredAccent } from "@/lib/use-accent";
import { FaviconSwitcher } from "@/components/FaviconSwitcher";
import { usePresenceHeartbeat } from "@/lib/use-presence-heartbeat";
import { useBanGuard } from "@/lib/use-ban-guard";
import { useSessionChangeDetector } from "@/lib/use-session-change-detector";
import { RealtimeDebugOverlay } from "@/components/RealtimeDebugOverlay";
import { SessionConflictBanner } from "@/components/SessionConflictBanner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { HeadFootScripts } from "@/components/HeadFootScripts";
import { AdsAutoLoader } from "@/components/AdSlot";
import { BroadcasterAnnouncementsRunner } from "@/components/broadcaster/BroadcasterAnnouncements";
import { TrioInvitesListener } from "@/components/chat/TrioInvitesListener";
import { CompleteProfileModal } from "@/components/auth/CompleteProfileModal";
import { LicenseGuard } from "@/components/LicenseGuard";
import { useHomePageMode } from "@/lib/use-home-page-mode";
import "@/i18n";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { DynamicBrandHead } from "@/components/DynamicBrandHead";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    // Static SSR defaults — <DynamicBrandHead /> overrides these at runtime
    // with values from app_settings.whitelabel / branding once loaded.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#3B82F6" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "App" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "App" },
      { name: "description", content: "Chat rooms, DMs, games and more." },
      { property: "og:title", content: "App" },
      { property: "og:description", content: "Chat rooms, DMs, games and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "App" },
      { name: "twitter:description", content: "Chat rooms, DMs, games and more." },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon-blue.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    applyAccent(getStoredAccent());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <LanguageProvider>
          <DynamicBrandHead />
          <AuthProvider>
            <AuthGateProvider>
              <AuthGate />
            </AuthGateProvider>
          </AuthProvider>
        </LanguageProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  );
}

// Paths an unauthenticated visitor can reach directly (no AuthScreen takeover).
const PUBLIC_PATH_PREFIXES = ["/welcome", "/heropage", "/login", "/reset-password", "/banned", "/p/", "/api/", "/installer"];
const PUBLIC_EXACT = new Set(["/welcome", "/heropage", "/login", "/reset-password", "/banned", "/installer"]);
const READ_ONLY_PUBLIC_APP_PREFIXES = ["/feed", "/chatroom", "/chatrooms", "/confessions", "/battle-hub", "/leaderboard", "/poetry", "/mehfil"];


function isReadOnlyPublicAppPath(pathname: string) {
  return READ_ONLY_PUBLIC_APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isPublicPath(pathname: string) {
  if (isReadOnlyPublicAppPath(pathname)) return true;
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PATH_PREFIXES.some((p) => pathname.startsWith(p));
}

function hasStoredAuthSession() {
  if (typeof window === "undefined") return true;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i) ?? "";
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) return true;
    }
  } catch { /* ignore */ }
  return false;
}

function AuthenticatedHooks({ userId }: { userId: string }) {
  // These hooks issue Supabase queries / realtime work and previously caused a
  // request flood when mounted before auth was settled. They now mount only
  // after `ready === true` and a valid user exists.
  usePresenceHeartbeat();
  useSessionChangeDetector();
  useBanGuard(userId);
  return null;
}

function AuthGate() {
  const { user, ready } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const hasStoredSession = hasStoredAuthSession();
  const { mode: homeMode, ready: homeReady } = useHomePageMode();
  const landingPath = homeMode === "hero" ? "/heropage" : "/welcome";

  if (!user && isPublicPath(path)) {
    return <PublicOutlet readOnlyApp={isReadOnlyPublicAppPath(path)} />;
  }

  // No stored session at all → send guests to landing immediately.
  if (!ready && !hasStoredSession) {
    if (!homeReady) {
      return (
        <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
          <p>Loading…</p>
        </div>
      );
    }
    return <Navigate to={landingPath} replace />;
  }

  if (!ready) {
    // Stored session is being restored — wait without auto-redirecting.
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center text-muted-foreground">
        <p>Loading…</p>
      </div>
    );
  }


  if (!user) {
    // Public, self-contained routes (landing, login, password reset, public post pages) render normally.
    if (isPublicPath(path)) return <PublicOutlet readOnlyApp={isReadOnlyPublicAppPath(path)} />;
    // Wait for the home_page setting before redirecting so guests don't get
    // briefly sent to /welcome while the admin-selected mode is still loading.
    if (!homeReady) {
      return (
        <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
          <p>Loading…</p>
        </div>
      );
    }
    // Everything else → send guests to the configured landing page first.
    return <Navigate to={landingPath} replace />;
  }

  // Authenticated users shouldn't sit on the public landing or login pages —
  // send them to the app home (chatroom/feed) automatically after sign in.
  if (path === "/welcome" || path === "/heropage" || path === "/login") {
    return <Navigate to="/" replace />;
  }


  return (
    <ChatProvider username={user.username} authUserId={user.id} isGuest={user.isGuest}>
      <FeedPrefsProvider>
        <IgnoreProvider>
          <AuthenticatedHooks userId={user.id} />
          <BroadcasterAnnouncementsRunner />
          <TrioInvitesListener />
          <CompleteProfileModal />
          <HeadFootScripts />
          <AdsAutoLoader />
          <SessionConflictBanner />
          <FaviconSwitcher />
          <SubscriptionGate />
          <LicenseGuard />
          <Outlet />
          <Sonner />
          <RealtimeDebugOverlay />
        </IgnoreProvider>
      </FeedPrefsProvider>
    </ChatProvider>
  );
}

function PublicOutlet({ readOnlyApp }: { readOnlyApp: boolean }) {
  const content = (
    <>
      <HeadFootScripts />
      <AdsAutoLoader />
      <SessionConflictBanner />
      <Outlet />
      <Sonner />
      <RealtimeDebugOverlay />
    </>
  );
  if (!readOnlyApp) return content;
  return (
    <ChatProvider username="__public__" authUserId={null} isGuest>
      <FeedPrefsProvider>
        <IgnoreProvider>{content}</IgnoreProvider>
      </FeedPrefsProvider>
    </ChatProvider>
  );
}

