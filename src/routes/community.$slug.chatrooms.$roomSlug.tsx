import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChatApp } from "@/components/chat/ChatApp";
import { useChat } from "@/lib/chat-store";
import { useCommunity } from "@/lib/community-context";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/community/$slug/chatrooms/$roomSlug")({
  component: CommunityChatroomView,
});

/**
 * Renders the existing ChatApp inside the persistent Community Shell so that
 * Community Context, branding, and header stay intact. We only wire routing
 * here — the chat runtime, realtime, permissions, and UI are reused as-is.
 */
function CommunityChatroomView() {
  const { roomSlug, slug } = Route.useParams();
  const { community } = useCommunity();
  const chat = useChat();

  // Attempt to select the requested room once the chat store has loaded it.
  useEffect(() => {
    if (!roomSlug) return;
    if (chat.state.rooms[roomSlug] && chat.state.activeChannel !== roomSlug) {
      chat.setActive(roomSlug);
    }
  }, [roomSlug, chat.state.rooms, chat.state.activeChannel, chat]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs">
        <Link
          to="/community/$slug/chatrooms"
          params={{ slug }}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to {community.name} rooms
        </Link>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold uppercase text-primary">
          Community room
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border bg-card">
        <ChatApp />
      </div>
    </div>
  );
}
