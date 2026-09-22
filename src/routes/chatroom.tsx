import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { getCodyChatPublicBaseUrl } from "@/lib/codychat-public-url";
import { YAARZO_CODY_GUEST_LOGIN_MESSAGE } from "@/components/codychat/codychat-actions";
import {
  getCodyChatMessageOrigin,
  parseCodyChatGuestRosterMessage,
  type CodyChatGuestRosterEntry,
} from "@/components/codychat/codychat-roster";
import { clearGuestChatSession } from "@/lib/visitor-session";
import { loadRouteSeo, headFromRouteSeo } from "@/lib/seo";
import { consumeChatFreshEntry, isChatFreshEntryPending } from "@/lib/auth-entry";
import {
  buildChatroomSearch,
  isGuestProtectedShellPanel,
  parseChatroomRouteSearch,
  type ChatroomShellPanelId,
} from "@/lib/chatroom-shell-panel";
import { useAuthGate } from "@/lib/auth-gate";

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
  const routeSearch = Route.useSearch();
  const { guest: guestSearch, yaarzo: shellPanel, tab: shellPanelTab } =
    parseChatroomRouteSearch(routeSearch);
  const guestIntent = parseChatroomGuestIntent({ guest: guestSearch });
  const navigate = useNavigate();
  const { requireAuth } = useAuthGate();
  const getSsoUrl = useServerFn(getCodyChatSsoUrl);
  const [chatUrl, setChatUrl] = useState<string | null>(null);
  const [ssoError, setSsoError] = useState<string | null>(null);
  const [codyGuests, setCodyGuests] = useState<CodyChatGuestRosterEntry[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const hydrationState = { ready, hydrationSlow, hydrationError };
  const nativeCodyGuest = shouldUseNativeCodyChatGuestEntry(hydrationState, user, guestIntent);
  const activeShellPanel = nativeCodyGuest ? undefined : shellPanel;
  const activeShellPanelTab = nativeCodyGuest ? undefined : shellPanelTab;

  useEffect(() => {
    if (!nativeCodyGuest || !shellPanel) return;
    void navigate({
      to: "/chatroom",
      search: buildChatroomSearch(parseChatroomRouteSearch(routeSearch), null),
      resetScroll: false,
      replace: true,
    });
  }, [nativeCodyGuest, shellPanel, navigate, routeSearch]);

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
    const codyOrigin = getCodyChatMessageOrigin();

    const handleCodyChatMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;

      const roster = parseCodyChatGuestRosterMessage(event.data);
      if (roster !== null) {
        if (event.origin !== codyOrigin) return;
        setCodyGuests(roster);
        return;
      }

      if (!isYaarzoLogoutMessage(event.data, event.origin, YAARZO_ORIGINS)) return;
      if (loggingOut || !user || user.isGuest) return;
      if (isChatFreshEntryPending()) return;
      void logout();
    };

    window.addEventListener("message", handleCodyChatMessage);
    return () => window.removeEventListener("message", handleCodyChatMessage);
  }, [logout, loggingOut, user]);

  const openShellPanel = useCallback(
    (panel: ChatroomShellPanelId, opts?: { tab?: string }) => {
      if (nativeCodyGuest && isGuestProtectedShellPanel(panel)) {
        requireAuth();
        return;
      }
      void navigate({
        to: "/chatroom",
        search: buildChatroomSearch(parseChatroomRouteSearch(routeSearch), panel, opts),
        resetScroll: false,
      });
    },
    [nativeCodyGuest, requireAuth, navigate, routeSearch],
  );

  const closeShellPanel = () => {
    void navigate({
      to: "/chatroom",
      search: buildChatroomSearch(parseChatroomRouteSearch(routeSearch), null),
      resetScroll: false,
    });
  };

  const handleNativeGuestLogout = () => {
    try {
      sessionStorage.removeItem("yaarzo:codychat:guest-details");
      clearGuestChatSession();
    } catch {
      /* ignore */
    }
    setCodyGuests([]);
    void navigate({ to: "/" });
  };

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
      codyGuests={codyGuests}
      nativeCodyGuest={nativeCodyGuest}
      shellPanel={activeShellPanel}
      shellPanelTab={activeShellPanelTab}
      onOpenShellPanel={openShellPanel}
      onCloseShellPanel={closeShellPanel}
      onSignedInLogout={() => {
        void logout();
      }}
      onNativeGuestLogout={handleNativeGuestLogout}
      onIframeLoad={() => {
        consumeChatFreshEntry();

        if (guestIntent) {
          const rawGuestDetails = sessionStorage.getItem("yaarzo:codychat:guest-details");

          if (rawGuestDetails) {
            try {
              const details = JSON.parse(rawGuestDetails) as {
                name?: string;
                gender?: "male" | "female" | "other";
              };

              if (details.name && details.gender) {
                iframeRef.current?.contentWindow?.postMessage(
                  {
                    type: YAARZO_CODY_GUEST_LOGIN_MESSAGE,
                    name: details.name,
                    gender: details.gender,
                  },
                  getCodyChatPublicBaseUrl(),
                );

                sessionStorage.removeItem("yaarzo:codychat:guest-details");
              }
            } catch {
              sessionStorage.removeItem("yaarzo:codychat:guest-details");
            }
          }
        }
      }}
    />
  );
}

export const Route = createFileRoute("/chatroom")({
  validateSearch: (search: Record<string, unknown>) => parseChatroomRouteSearch(search),
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
