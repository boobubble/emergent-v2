import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ChatApp } from "@/components/chat/ChatApp";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import { useAppSettings } from "@/lib/app-settings";
import { headFromRouteSeo, loadRouteSeoWithDefaults } from "@/lib/seo";

const HOME_SEO_FALLBACK = {
  title: "Chat rooms & community",
  description:
    "Public chat rooms, private DMs, file sharing, threaded replies, daily streaks, achievements and game commands like !trivia, !hangman, !roll, !fish and !dig.",
  ogTitle: "Chat rooms & community",
  ogDescription:
    "Hang out in public rooms, DM friends, share files, earn badges, and play games with chat commands.",
};

export const Route = createFileRoute("/")({
  loader: () => loadRouteSeoWithDefaults("/", HOME_SEO_FALLBACK),
  head: ({ loaderData }) => headFromRouteSeo(loaderData),
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
  return (
    <RouteErrorBoundary section="Chatrooms" featureStore="chat">
      <ChatApp />
    </RouteErrorBoundary>
  );
}
