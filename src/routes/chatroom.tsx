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
import {
  isYaarzoCodyGuestLoginOkMessage,
  YAARZO_CODY_GUEST_LOGIN_MESSAGE,
} from "@/components/codychat/codychat-actions";
import {
  clearCodyGuestLoginSession,
  completeCodyGuestLogin,
  isCodyGuestLoginComplete,
  readCodyGuestDetails,
  shouldDispatchCodyGuestLogin,
} from "@/lib/codychat-guest-session";
import {
  getCodyChatMessageOrigin,
  parseCodyChatGuestRosterMessage,
  type CodyChatGuestRosterEntry,
} from "@/components/codychat/codychat-roster";
import { isCodyChatOpenDmMessageEvent } from "@/components/codychat/codychat-dm-bridge";
import { openYaarzoDmPeer } from "@/lib/yaarzo-dm-events";
import { clearGuestChatSession } from "@/lib/visitor-session";
import { loadRouteSeo, headFromRouteSeo } from "@/lib/seo";
import { consumeChatFreshEntry, isChatFreshEntryPending } from "@/lib/auth-entry";
import {
  buildChatroomSearch,
  chatroomDedicatedPageForLegacyPanel,
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
    if (typeof window === "undefined") return;
    const legacyPanel = new URLSearchParams(window.location.search).get("yaarzo");
    const dedicated = chatroomDedicatedPageForLegacyPanel(legacyPanel);
    if (!dedicated) return;
    void navigate({ to: dedicated, replace: true });
  }, [navigate, shellPanel]);

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

      if (isYaarzoCodyGuestLoginOkMessage(event.data)) {
        if (event.origin !== codyOrigin) return;
        completeCodyGuestLogin();
        return;
      }

      const dmPeerId = isCodyChatOpenDmMessageEvent(
        event,
        iframeRef.current?.contentWindow,
      );
      if (dmPeerId) {
        const openDm = () => openYaarzoDmPeer(dmPeerId);
        if (!user?.id || user.isGuest) {
          requireAuth(openDm);
        } else {
          openDm();
        }
        return;
      }

      if (!isYaarzoLogoutMessage(event.data, event.origin, YAARZO_ORIGINS)) return;
      if (loggingOut || !user || user.isGuest) return;
      if (isChatFreshEntryPending()) return;
      void logout();
    };

    window.addEventListener("message", handleCodyChatMessage);
    return () => window.removeEventListener("message", handleCodyChatMessage);
  }, [logout, loggingOut, requireAuth, user]);

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
      clearCodyGuestLoginSession();
      clearGuestChatSession();
    } catch {
      /* ignore */
    }
    setCodyGuests([]);
    void navigate({ to: "/" });
  };

  const dispatchGuestLoginToIframe = useCallback(() => {
    if (!guestIntent || !shouldDispatchCodyGuestLogin()) {
      return;
    }

    const details = readCodyGuestDetails();
    if (!details) {
      return;
    }

    const iframeWindow = iframeRef.current?.contentWindow;
    if (!iframeWindow) {
      return;
    }

    iframeWindow.postMessage(
      {
        type: YAARZO_CODY_GUEST_LOGIN_MESSAGE,
        name: details.name,
        gender: details.gender,
      },
      getCodyChatPublicBaseUrl(),
    );
  }, [guestIntent]);

  useEffect(() => {
    if (!guestIntent || !chatUrl || isCodyGuestLoginComplete()) {
      return;
    }
    if (!readCodyGuestDetails()) {
      return;
    }

    dispatchGuestLoginToIframe();
    const retryTimer = window.setInterval(() => {
      if (isCodyGuestLoginComplete()) {
        window.clearInterval(retryTimer);
        return;
      }
      dispatchGuestLoginToIframe();
    }, 800);

    return () => {
      window.clearInterval(retryTimer);
    };
  }, [guestIntent, chatUrl, dispatchGuestLoginToIframe]);

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
        dispatchGuestLoginToIframe();
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
