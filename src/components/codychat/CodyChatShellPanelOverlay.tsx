import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import {
  type ChatroomShellPanelId,
  shellPanelTitle,
} from "@/lib/chatroom-shell-panel";
import { HomeGuestShell } from "@/components/home/HomeGuestShell";
import { FindFriendsView, parseFindFriendsTab } from "@/routes/find-friends";
import { useAuth } from "@/lib/auth-store";
import { ChatProvider } from "@/lib/chat-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { FeedNotificationPanel } from "@/components/feed/FeedNotifications";
import { ChatroomFeedMode } from "./ChatroomFeedMode";

const AccountPanel = lazy(() =>
  import("@/components/feed/AccountPanel").then((m) => ({ default: m.AccountPanel })),
);

function lazyRouteComponent(
  importer: () => Promise<{ Route: { options: { component: ComponentType } } }>,
) {
  return lazy(async () => {
    const mod = await importer();
    const Inner = mod.Route.options.component as ComponentType;
    return {
      default: function LazyRoutePanel() {
        return <Inner />;
      },
    };
  });
}

const PoetryPanel = lazyRouteComponent(() => import("@/routes/poetry.index"));
const CompetitionsPanel = lazyRouteComponent(() => import("@/routes/competitions.index"));
const ConfessionsPanel = lazyRouteComponent(() => import("@/routes/confessions"));

/** Account panel uses useChat; /chatroom has no root ChatProvider. */
function ChatroomShellChatProviders({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user || user.isGuest) {
    return <>{children}</>;
  }
  return (
    <ChatProvider username={user.username} authUserId={user.id} isGuest={false}>
      {children}
    </ChatProvider>
  );
}

function ChatroomShellNotifications() {
  const { user } = useAuth();
  const { profiles } = useRemoteProfiles();
  const meId = user?.id ?? "";
  if (!meId) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">Sign in to view notifications.</div>
    );
  }
  return (
    <div className="chatroom-feed-mode w-full">
      <FeedNotificationPanel meId={meId} profiles={profiles} />
    </div>
  );
}

function PanelBody({
  panel,
  panelTab,
}: {
  panel: ChatroomShellPanelId;
  panelTab?: string;
}) {
  switch (panel) {
    case "home":
      return <HomeGuestShell />;
    case "feed":
      if (panelTab === "notifications") {
        return <ChatroomShellNotifications />;
      }
      if (panelTab === "account") {
        return (
          <ChatroomShellChatProviders>
            <Suspense
              fallback={
                <div className="flex justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-primary/80" aria-hidden />
                </div>
              }
            >
              <AccountPanel />
            </Suspense>
          </ChatroomShellChatProviders>
        );
      }
      return <ChatroomFeedMode tab={panelTab} />;
    case "find-friends":
      return <FindFriendsView embeddedTab={parseFindFriendsTab(panelTab)} />;
    case "poetry":
      return <PoetryPanel />;
    case "competitions":
      return <CompetitionsPanel />;
    case "confessions":
      return <ConfessionsPanel />;
    default:
      return null;
  }
}

function overlayTitle(panel: ChatroomShellPanelId, panelTab?: string): string {
  if (panel === "feed" && panelTab === "notifications") return "Notifications";
  if (panel === "feed" && panelTab === "account") return "Account";
  if (panel === "feed" && panelTab === "trending") return "Trending";
  return shellPanelTitle(panel);
}

type CodyChatShellPanelOverlayProps = {
  panel: ChatroomShellPanelId;
  panelTab?: string;
  onClose: () => void;
};

export function CodyChatShellPanelOverlay({
  panel,
  panelTab,
  onClose,
}: CodyChatShellPanelOverlayProps) {
  const title = overlayTitle(panel, panelTab);

  return (
    <div
      className="cody-shell-panel-overlay"
      data-cody-shell-panel=""
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <header className="cody-shell-panel-header">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs"
          onClick={onClose}
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to chat
        </Button>
        <h2 className="min-w-0 flex-1 truncate text-center text-xs font-semibold">{title}</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onClose}
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </header>
      <div className="cody-shell-panel-body">
        <RouteErrorBoundary section={title}>
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary/80" aria-hidden />
              </div>
            }
          >
            <PanelBody panel={panel} panelTab={panelTab} />
          </Suspense>
        </RouteErrorBoundary>
      </div>
    </div>
  );
}
