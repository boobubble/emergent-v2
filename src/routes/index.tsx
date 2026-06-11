import { createFileRoute } from "@tanstack/react-router";
import { ChatApp } from "@/components/chat/ChatApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Palrgo — Chat rooms & command-driven games" },
      { name: "description", content: "Public chat rooms, private DMs, file sharing, threaded replies, daily streaks, achievements and game commands like !trivia, !hangman, !roll, !fish and !dig." },
      { property: "og:title", content: "Palrgo — Chat & Games" },
      { property: "og:description", content: "Hang out in public rooms, DM friends, share files, earn badges, and play games with chat commands." },
    ],
  }),
  component: ChatApp,
});
