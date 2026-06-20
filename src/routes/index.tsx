import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ChatApp } from "@/components/chat/ChatApp";
import { useAppSettings } from "@/lib/app-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Palrgo — Chat rooms & command-driven games" },
      { name: "description", content: "Public chat rooms, private DMs, file sharing, threaded replies, daily streaks, achievements and game commands like !trivia, !hangman, !roll, !fish and !dig." },
      { property: "og:title", content: "Palrgo — Chat & Games" },
      { property: "og:description", content: "Hang out in public rooms, DM friends, share files, earn badges, and play games with chat commands." },
    ],
  }),
  component: HomeRouter,
});

function HomeRouter() {
  const { layoutPriority, ready } = useAppSettings();
  // While settings load, render chat (the default) to avoid a flash of nothing.
  if (ready && layoutPriority === "feed_first") {
    return <Navigate to="/feed" replace />;
  }
  return <ChatApp />;
}
