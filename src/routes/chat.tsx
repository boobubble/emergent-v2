import { createFileRoute } from "@tanstack/react-router";
import { ChatApp } from "@/components/chat/ChatApp";

// Dedicated chatroom route. `/` may redirect to `/feed` when admins set
// "feed first", which would loop any chatroom button on the feed page back
// to feed. This route always renders the chatroom regardless of layout
// priority so the feed → chatrooms navigation works in both modes.
export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chatrooms — BooBubble" },
      { name: "description", content: "Public chat rooms, DMs, and games." },
    ],
  }),
  component: () => <ChatApp />,
});
