import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChatProvider, useChat } from "@/lib/chat-store";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { MembersPanel } from "@/components/chat/MembersPanel";
import { ProfileModal, LeaderboardModal } from "@/components/chat/Modals";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Palrgo — Chat rooms & command-driven games" },
      { name: "description", content: "Public chat rooms, private DMs, and game commands like !trivia, !hangman, !blackjack, !roll, and !8ball." },
      { property: "og:title", content: "Palrgo — Chat & Games" },
      { property: "og:description", content: "Hang out in public rooms, DM friends, and play games with chat commands." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ChatProvider>
      <ChatApp />
    </ChatProvider>
  );
}

function ChatApp() {
  const { state, isDM } = useChat();
  const [profileOpen, setProfileOpen] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar onOpenProfile={() => setProfileOpen(true)} onOpenLeaderboard={() => setLbOpen(true)} />
      <main className="flex h-full min-w-0 flex-1 flex-col">
        <ChatHeader />
        <MessageList channelId={state.activeChannel} />
        <MessageInput />
      </main>
      {!isDM(state.activeChannel) && <MembersPanel roomId={state.activeChannel} />}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <LeaderboardModal open={lbOpen} onClose={() => setLbOpen(false)} />
    </div>
  );
}
