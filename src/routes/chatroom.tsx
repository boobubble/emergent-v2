import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { useServerFn } from "@tanstack/react-start";
import { getCodyChatSsoUrl } from "@/lib/codychat-sso.functions";
import { loadRouteSeo, headFromRouteSeo } from "@/lib/seo";

function CodyChatPage() {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const getSsoUrl = useServerFn(getCodyChatSsoUrl);

  useEffect(() => {
    if (!user || user.isGuest) return;

    void getSsoUrl()
      .then(({ url }) => {
        window.location.href = url;
      })
      .catch((error) => {
        console.error("CodyChat SSO failed:", error);
      });
  }, [user, getSsoUrl]);

  useEffect(() => {
    if (!user || user.isGuest) {
      requireAuth();
    }
  }, [user, requireAuth]);

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
