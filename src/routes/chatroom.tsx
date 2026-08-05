import { createFileRoute } from "@tanstack/react-router";
import { ChatApp } from "@/components/chat/ChatApp";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import { loadRouteSeo, headFromRouteSeo } from "@/lib/seo";

export const Route = createFileRoute("/chatroom")({
  loader: () => loadRouteSeo(
    "/chatroom",
    "Chatrooms",
    "Join public chat rooms, send DMs, share files and play in-chat games.",
  ),
  head: ({ loaderData }) => headFromRouteSeo(loaderData),
  component: () => (
    <RouteErrorBoundary section="Chatrooms" featureStore="chat">
      <ChatApp />
    </RouteErrorBoundary>
  ),
});
