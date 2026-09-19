import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import { useAuth } from "@/lib/auth-store";
import { useServerFn } from "@tanstack/react-start";
import { getCodyChatSsoUrl } from "@/lib/codychat-sso.functions";
import { loadRouteSeo, headFromRouteSeo } from "@/lib/seo";

function CodyChatPage() {
  const { user } = useAuth();
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

  if (!user || user.isGuest) {
    return null;
  }

  if (!chatUrl) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="text-center">
          <div className="text-lg font-semibold">Opening Chatroom…</div>
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
      className="h-[calc(100vh-4rem)] w-full border-0"
      allow="camera; microphone; autoplay; clipboard-write"
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