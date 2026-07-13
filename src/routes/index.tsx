import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ChatApp } from "@/components/chat/ChatApp";
import { useAppSettings } from "@/lib/app-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chat rooms & community" },
      { name: "description", content: "Public chat rooms, private DMs, file sharing, threaded replies, daily streaks, achievements and game commands like !trivia, !hangman, !roll, !fish and !dig." },
      { property: "og:title", content: "Chat rooms & community" },
      { property: "og:description", content: "Hang out in public rooms, DM friends, share files, earn badges, and play games with chat commands." },
    ],
  }),
  component: HomeRouter,
});

function HomeRouter() {
  const { layoutPriority, ready } = useAppSettings();
  // Wait for settings before deciding home target so feed_first users
  // aren't briefly dropped into the chatroom while settings load.
  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
        <p>Loading…</p>
      </div>
    );
  }
  if (layoutPriority === "feed_first") {
    return <Navigate to="/feed" replace />;
  }
  return <ChatApp />;
}
