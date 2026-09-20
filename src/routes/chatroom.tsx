import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import { CodyChatShell } from "@/components/codychat/CodyChatShell";
import { useAuth } from "@/lib/auth-store";
import { useServerFn } from "@tanstack/react-start";
import { getCodyChatSsoUrl } from "@/lib/codychat-sso.functions";
import { isYaarzoLogoutMessage } from "@/lib/codychat-sso-messages";
import { loadRouteSeo, headFromRouteSeo } from "@/lib/seo";
import { consumeChatFreshEntry, isChatFreshEntryPending } from "@/lib/auth-entry";

const YAARZO_ORIGINS = ["https://yaarzo.com", "https://www.yaarzo.com"] as const;

function CodyChatPage() {
  const { user, logout, loggingOut } = useAuth();
  const navigate = useNavigate();
  const getSsoUrl = useServerFn(getCodyChatSsoUrl);
  const [chatUrl, setChatUrl] = useState<string | null>(null);
  const [ssoError, setSsoError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!user || user.isGuest) {
      setChatUrl(null);
      void navigate({ to: "/" });
      return;
    }

    setSsoError(null);
    void getSsoUrl()
      .then(({ url }) => {
        setChatUrl(url);
      })
      .catch((error: unknown) => {
        const message =
          error instanceof Error ? error.message : "Unable to open chat.";
        setSsoError(message);
        console.error("CodyChat SSO failed:", error);
      });
  }, [user, navigate, getSsoUrl]);

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

  if (!user || user.isGuest) {
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
