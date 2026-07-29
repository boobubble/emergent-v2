import { createFileRoute } from "@tanstack/react-router";
import { ChatApp } from "@/components/chat/ChatApp";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";

export const Route = createFileRoute("/chatroom")({
  head: () => ({
    meta: [
      { title: "Chatrooms" },
      { name: "description", content: "Join public chat rooms, send DMs, share files and play in-chat games ." },
      { property: "og:title", content: "Chatrooms" },
      { property: "og:description", content: "Hang out in public rooms, DM friends, and play games with chat commands." },
    ],
  }),
  component: () => (
    <RouteErrorBoundary section="Chatrooms" featureStore="chat">
      <ChatApp />
    </RouteErrorBoundary>
  ),
});
