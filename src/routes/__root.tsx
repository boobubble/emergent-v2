import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider, useAuth } from "@/lib/auth-store";
import { ChatProvider } from "@/lib/chat-store";
import { FeedPrefsProvider } from "@/lib/feed-prefs";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { useEffect } from "react";
import { applyAccent, getStoredAccent } from "@/lib/use-accent";
import { FaviconSwitcher } from "@/components/FaviconSwitcher";
import { usePresenceHeartbeat } from "@/lib/use-presence-heartbeat";
import { useSessionChangeDetector } from "@/lib/use-session-change-detector";
import { RealtimeDebugOverlay } from "@/components/RealtimeDebugOverlay";
import { SessionConflictBanner } from "@/components/SessionConflictBanner";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { HeadFootScripts } from "@/components/HeadFootScripts";
import { AdsAutoLoader } from "@/components/AdSlot";

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
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Chatroom Test" },
      { name: "description", content: "Testing App Chatroom" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Chatroom Test" },
      { property: "og:description", content: "Testing App Chatroom" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "Chatroom Test" },
      { name: "twitter:description", content: "Testing App Chatroom" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6114dd7e-4f62-4356-9288-08a4f9004c65/id-preview-3949a20f--18cb7521-83eb-440b-8f96-fe1f394ccca4.lovable.app-1779440985646.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6114dd7e-4f62-4356-9288-08a4f9004c65/id-preview-3949a20f--18cb7521-83eb-440b-8f96-fe1f394ccca4.lovable.app-1779440985646.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon-blue.png" },
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
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AuthGate() {
  const { user, ready } = useAuth();
  usePresenceHeartbeat();
  useSessionChangeDetector();
  if (!ready) return <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">Loading…</div>;
  if (!user) return (<><HeadFootScripts /><AdsAutoLoader /><SessionConflictBanner /><AuthScreen /><Sonner /><RealtimeDebugOverlay /></>);
  return (
    <ChatProvider username={user.username} authUserId={user.id} isGuest={user.isGuest}>
      <FeedPrefsProvider>
        <HeadFootScripts />
        <AdsAutoLoader />
        <SessionConflictBanner />
        <FaviconSwitcher />
        <Outlet />
        <Sonner />
        <RealtimeDebugOverlay />
      </FeedPrefsProvider>
    </ChatProvider>
  );
}
