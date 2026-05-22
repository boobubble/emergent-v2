import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/lib/chat-store";
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
      { name: "description", content: "Public chat rooms, private DMs, file sharing, and game commands like !trivia, !hangman, !blackjack, !roll, !fish and !dig." },
      { property: "og:title", content: "Palrgo — Chat & Games" },
      { property: "og:description", content: "Hang out in public rooms, DM friends, share files, and play games with chat commands." },
    ],
  }),
  component: ChatApp,
});

function ChatApp() {
  const { state, isDM } = useChat();
  const [profileOpen, setProfileOpen] = useState(false);
  const [lbOpen, setLbOpen] = useState(false);
  const [buzz, setBuzz] = useState<{ key: number; actor?: string; reason: string } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onBuzz(e: Event) {
      const ce = e as CustomEvent<{ actor?: string; reason: string }>;
      setBuzz({ key: Date.now(), actor: ce.detail.actor, reason: ce.detail.reason });
      const el = rootRef.current;
      if (el) {
        el.classList.remove("palrgo-buzzing");
        void el.offsetWidth;
        el.classList.add("palrgo-buzzing");
        setTimeout(() => el.classList.remove("palrgo-buzzing"), 750);
      }
      setTimeout(() => setBuzz(b => (b && b.key === (b?.key) ? null : b)), 2300);
    }
    window.addEventListener("palrgo:buzz", onBuzz);
    return () => window.removeEventListener("palrgo:buzz", onBuzz);
  }, []);

  return (
    <>
      <div ref={rootRef} className="flex h-screen w-full overflow-hidden bg-background text-foreground">
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
      {buzz && (
        <>
          <div key={`flash-${buzz.key}`} className="palrgo-buzz-flash" />
          <div key={`toast-${buzz.key}`} className="palrgo-buzz-toast">
            ⚡ {buzz.actor ? `${buzz.actor} found` : "Rare find:"} {buzz.reason}
          </div>
        </>
      )}
    </>
  );
}
