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
import { AppSettingsProvider } from "@/lib/app-settings";

import { lazy, Suspense, useEffect } from "react";
import { applyAccent, getStoredAccent } from "@/lib/use-accent";
import { HeadFootScripts } from "@/components/HeadFootScripts";
import { AdsAutoLoader } from "@/components/AdSlot";
import { SessionConflictBanner } from "@/components/SessionConflictBanner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useHomePageMode } from "@/lib/use-home-page-mode";
import { landingPathForMode } from "@/lib/landing-path";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { DynamicBrandHead } from "@/components/DynamicBrandHead";
import { DeferredInterFont } from "@/components/DeferredInterFont";
import { AppErrorBoundary } from "@/components/AppErrorBoundary";
import { GlobalErrorMonitoring } from "@/components/GlobalErrorMonitoring";
import { logger } from "@/lib/logger";
import { isPublicCmsSlugPath } from "@/lib/route-slug";
import { isPublicPath as isPublicPathBase, isReadOnlyPublicAppPath, isPrivateUtilityPath } from "@/lib/public-routes";
import { hasStoredAuthToken } from "@/lib/stored-auth";

import appCss from "../styles.css?url";

const AuthenticatedAppShell = lazy(() =>
  import("@/components/app/app-shells").then((m) => ({ default: m.AuthenticatedAppShell })),
);
const PublicReadOnlyAppShell = lazy(() =>
  import("@/components/app/app-shells").then((m) => ({ default: m.PublicReadOnlyAppShell })),
);

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
  logger.capture({
    severity: "fatal",
    message: error.message || "Route error",
    stack: error.stack ?? null,
    metadata: { source: "tanstack-router-errorComponent" },
  });
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
    // Static SSR shell defaults only. Page SEO (title, description, robots,
    // canonical, OG/Twitter) is owned by each route's head() via
    // headFromRouteSeo / createSeoRouteHead. DynamicBrandHead applies brand
    // chrome (favicon, theme-color, verification) and must not overwrite SEO.
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#3B82F6" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "App" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon-blue.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
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
    <AppErrorBoundary section="application" variant="page">
      <QueryClientProvider client={queryClient}>
        <AppSettingsProvider>
          <LanguageProvider>
            <DynamicBrandHead />
            <DeferredInterFont />
            <AuthProvider>
              <GlobalErrorMonitoring />
              <AuthGateProvider>
                <AuthGate />
              </AuthGateProvider>
            </AuthProvider>
          </LanguageProvider>
        </AppSettingsProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

function isPublicPath(pathname: string) {
  return isPublicPathBase(pathname, { isPublicCmsSlugPath });
}

function isCommunityNonChatPath(pathname: string) {
  if (pathname === "/communities") return true;
  if (!pathname.startsWith("/community/")) return false;
  return !pathname.includes("/chatrooms");
}

function hasStoredAuthSession() {
  if (typeof window === "undefined") return true;
  return hasStoredAuthToken();
}

function AuthGate() {
  const { user, ready, loggingOut } = useAuth();
  const location = useLocation();
  const path = location.pathname;
  const hasStoredSession = hasStoredAuthSession();
  const { mode: homeMode, ready: homeReady } = useHomePageMode();
  const landingPath = landingPathForMode(homeMode);

  if (loggingOut) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center text-muted-foreground">
        <p>Signing out…</p>
      </div>
    );
  }

  if (!user && isPublicPath(path)) {
    return <PublicOutlet pathname={path} readOnlyApp={isReadOnlyPublicAppPath(path)} />;
  }

  // No stored session at all → send guests to landing immediately.
  if (!ready && !hasStoredSession) {
    if (isPrivateUtilityPath(path)) {
      return <Navigate to="/login" replace />;
    }
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
    if (isPublicPath(path)) return <PublicOutlet pathname={path} readOnlyApp={isReadOnlyPublicAppPath(path)} />;
    // Wait for the home_page setting before redirecting so guests don't get
    // briefly sent to `/` while the admin-selected mode is still loading.
    if (isPrivateUtilityPath(path)) {
      return <Navigate to="/login" replace />;
    }
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
  // send them to chatrooms after sign in (Yaarzo default home).
  if (path === "/welcome" || path === "/heropage" || path === "/login") {
    return <Navigate to="/chatroom" replace />;
  }


  const requireChatProvider = !isCommunityNonChatPath(path);
  return (
    <Suspense fallback={null}>
      <AuthenticatedAppShell
        username={user.username}
        authUserId={user.id}
        isGuest={user.isGuest}
        requireChat={requireChatProvider}
      >
        <Outlet />
      </AuthenticatedAppShell>
    </Suspense>
  );
}

function PublicChrome() {
  return (
    <>
      <HeadFootScripts />
      <AdsAutoLoader />
      <SessionConflictBanner />
      <Outlet />
      <Sonner />
    </>
  );
}

function PublicOutlet({ readOnlyApp, pathname }: { readOnlyApp: boolean; pathname: string }) {
  // GuestChatProvider lives on AuthGateProvider so AuthDialogs and chat share
  // one guest session (login popup + /chatroom sidebar).
  const requireChatProvider = readOnlyApp && !isCommunityNonChatPath(pathname);
  if (!requireChatProvider) {
    return <PublicChrome />;
  }
  return (
    <Suspense fallback={null}>
      <PublicReadOnlyAppShell>
        <PublicChrome />
      </PublicReadOnlyAppShell>
    </Suspense>
  );
}
