import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import { AuthSessionHydrationRecovery } from "@/components/auth/AuthSessionHydrationRecovery";
import { CodyChatShell } from "@/components/codychat/CodyChatShell";
import { useAuth } from "@/lib/auth-store";
import { applySsoResult, shouldShowAuthHydrationRecovery } from "@/lib/auth-session-hydration";
import {
  parseChatroomGuestIntent,
  shouldRedirectSignedOutFromChatroom,
  shouldRequestChatroomHmacSso,
  shouldUseNativeCodyChatGuestEntry,
} from "@/lib/chatroom-guest-entry";
import { getCodyChatNativeGuestEntryUrl } from "@/lib/codychat-public-url";
import { useServerFn } from "@tanstack/react-start";
import { getCodyChatSsoUrl } from "@/lib/codychat-sso.functions";
import { isYaarzoLogoutMessage } from "@/lib/codychat-sso-messages";
import { loadRouteSeo, headFromRouteSeo } from "@/lib/seo";
import { consumeChatFreshEntry, isChatFreshEntryPending } from "@/lib/auth-entry";

const YAARZO_ORIGINS = ["https://yaarzo.com", "https://www.yaarzo.com"] as const;

function CodyChatPage() {
  const {
    user,
    ready,
    hydrationSlow,
    hydrationError,
    retrySessionHydration,
    logout,
    loggingOut,
  } = useAuth();
  const { guest: guestSearch } = Route.useSearch();
  const guestIntent = parseChatroomGuestIntent({ guest: guestSearch });
  const navigate = useNavigate();
  const getSsoUrl = useServerFn(getCodyChatSsoUrl);
  const [chatUrl, setChatUrl] = useState<string | null>(null);
  const [ssoError, setSsoError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const hydrationState = { ready, hydrationSlow, hydrationError };

  useEffect(() => {
    if (shouldShowAuthHydrationRecovery(hydrationState)) return;
    if (!ready) return;

    if (shouldRedirectSignedOutFromChatroom(hydrationState, user, guestIntent)) {
      setChatUrl(null);
      void navigate({ to: "/" });
      return;
    }

    if (shouldUseNativeCodyChatGuestEntry(hydrationState, user, guestIntent)) {
      setSsoError(null);
      setChatUrl(getCodyChatNativeGuestEntryUrl());
      return;
    }

    if (!shouldRequestChatroomHmacSso(hydrationState, user)) {
      return;
    }

    let cancelled = false;
    setSsoError(null);
    setChatUrl(null);

    void getSsoUrl()
      .then(({ url }) => {
        applySsoResult(cancelled, () => setChatUrl(url));
      })
      .catch((error: unknown) => {
        applySsoResult(cancelled, () => {
          const message =
            error instanceof Error ? error.message : "Unable to open chat.";
          setSsoError(message);
          console.error("CodyChat SSO failed:", error);
        });
      });

    return () => {
      cancelled = true;
    };
  }, [ready, hydrationSlow, hydrationError, user, guestIntent, navigate, getSsoUrl]);

  useEffect(() => {
    const handleCodyChatMessage = (event: MessageEvent) => {
      if (!isYaarzoLogoutMessage(event.data, event.origin, YAARZO_ORIGINS)) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (loggingOut || !user || user.isGuest) return;
      if (isChatFreshEntryPending()) return;
      void logout();
    };

    window.addEventListener("message", handleCodyChatMessage);
    return () => window.removeEventListener("message", handleCodyChatMessage);
  }, [logout, loggingOut, user]);

  if (shouldShowAuthHydrationRecovery(hydrationState)) {
    return (
      <AuthSessionHydrationRecovery
        compact
        hydrationSlow={hydrationSlow}
        hydrationError={hydrationError}
        onRetry={retrySessionHydration}
      />
    );
  }

  if (!ready) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background px-6">
        <Loader2 className="h-7 w-7 animate-spin text-primary/80" aria-hidden />
      </div>
    );
  }

  if (shouldRedirectSignedOutFromChatroom(hydrationState, user, guestIntent)) {
    return null;
  }

  if (ssoError) {
    return (
      <div className="flex h-dvh w-full items-center justify-center bg-background px-6">
        <div className="max-w-md text-center">
          <div className="text-lg font-semibold">Chat unavailable</div>
          <p className="mt-2 text-sm text-muted-foreground">{ssoError}</p>
        </div>
      </div>
    );
  }

  return (
    <CodyChatShell
      chatUrl={chatUrl}
      loading={!chatUrl}
      iframeRef={iframeRef}
      onIframeLoad={() => {
        consumeChatFreshEntry();
      }}
    />
  );
}

export const Route = createFileRoute("/chatroom")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search.guest;
    if (raw === "1" || raw === 1 || raw === true) {
      return { guest: "1" as const };
    }
    return {};
  },
  loader: () =>
    loadRouteSeo(
      "/chatroom",
      "Chatrooms",
      "Join public chat rooms and send direct messages on Yaarzo.",
    ),
  head: ({ loaderData }) => headFromRouteSeo(loaderData),
  component: () => (
    <RouteErrorBoundary section="Chatrooms" featureStore="chat">
      <CodyChatPage />
    </RouteErrorBoundary>
  ),
});
