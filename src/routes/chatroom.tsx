import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import { useAuth } from "@/lib/auth-store";
import { useServerFn } from "@tanstack/react-start";
import { getCodyChatSsoUrl } from "@/lib/codychat-sso.functions";
import { loadRouteSeo, headFromRouteSeo } from "@/lib/seo";
import { consumeChatFreshEntry, isChatFreshEntryPending } from "@/lib/auth-entry";

function CodyChatPage() {
  const { user, logout, loggingOut } = useAuth();
  const navigate = useNavigate();
  const getSsoUrl = useServerFn(getCodyChatSsoUrl);
  const [chatUrl, setChatUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.isGuest) {
      void navigate({ to: "/" });
      return;
    }

    void getSsoUrl()
      .then(({ url }) => {
        setChatUrl(url);
      })
      .catch((error) => {
        console.error("CodyChat SSO failed:", error);
      });
  }, [user, navigate, getSsoUrl]);

  useEffect(() => {
    const handleCodyChatMessage = (event: MessageEvent) => {
      if (event.origin !== "https://chat.yaarzo.com" || event.data?.type !== "YAARZO_LOGOUT") return;
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

  if (!chatUrl) {
    return (
      <div className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-lg font-semibold">Opening Chatroomù</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Connecting you to Yaarzo Chat.
          </div>
        </div>
      </div>
    );
  }

  return (
    <iframe
      src={chatUrl}
      title="Yaarzo Chat"
      className="fixed inset-0 z-50 h-dvh w-screen border-0"
      allow="camera; microphone; autoplay; clipboard-write"
      onLoad={() => {
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

