import { createFileRoute } from "@tanstack/react-router";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import { IrcChatApp } from "@/components/irc-chat/IrcChatApp";
import { IrcChatRuntimeProvider } from "@/lib/irc-chat/runtime";
import { loadRouteSeo, headFromRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/chatroom")({
  loader: () => loadRouteSeo(
    "/chatroom",
    "Chatrooms",
    "Join public IRC chat rooms and send direct messages on Yaarzo.",
  ),
  head: ({ loaderData }) => headFromRouteSeo(loaderData),
  component: () => (
    <RouteErrorBoundary section="Chatrooms" featureStore="chat">
      <IrcChatRuntimeProvider>
        <IrcChatApp />
      </IrcChatRuntimeProvider>
    </RouteErrorBoundary>
  ),
});
