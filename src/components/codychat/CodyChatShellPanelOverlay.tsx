import { Suspense, lazy, useMemo, type ComponentType, type ReactNode } from "react";
import { ArrowLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteErrorBoundary } from "@/components/AppErrorBoundary";
import {
  type ChatroomShellPanelId,
  shellPanelTitle,
} from "@/lib/chatroom-shell-panel";
import { HomeGuestShell } from "@/components/home/HomeGuestShell";
import { FindFriendsView, parseFindFriendsTab } from "@/routes/find-friends";
import { ConfessionsView } from "@/routes/confessions";
import { PoetryDiscoveryView } from "@/routes/poetry.index";
import { PoetryComposeView } from "@/routes/poetry.compose";
import { useAuth } from "@/lib/auth-store";
import { ChatProvider } from "@/lib/chat-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { FeedNotificationPanel } from "@/components/feed/FeedNotifications";
import { ChatroomFeedMode } from "./ChatroomFeedMode";
import {
  ChatroomShellAuthenticatedSurface,
  ChatroomShellSignInPrompt,
} from "./chatroom-shell-auth";
import {
  ChatroomShellPanelContext,
  type ChatroomShellPanelContextValue,
} from "./chatroom-shell-panel-context";

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

const CompetitionsPanel = lazyRouteComponent(() => import("@/routes/competitions.index"));

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
    return <ChatroomShellSignInPrompt label="Sign in to view notifications." />;
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
  onOpenShellPanel,
}: {
  panel: ChatroomShellPanelId;
  panelTab?: string;
  onOpenShellPanel?: (panel: ChatroomShellPanelId, opts?: { tab?: string }) => void;
}) {
  switch (panel) {
    case "home":
      return <HomeGuestShell />;
    case "feed":
      if (panelTab === "notifications") {
        return (
          <ChatroomShellAuthenticatedSurface requireSignedInUser>
            <ChatroomShellNotifications />
          </ChatroomShellAuthenticatedSurface>
        );
      }
      if (panelTab === "account") {
        return (
          <ChatroomShellAuthenticatedSurface requireSignedInUser>
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
          </ChatroomShellAuthenticatedSurface>
        );
      }
      return (
        <ChatroomShellAuthenticatedSurface requireSignedInUser>
          <ChatroomFeedMode tab={panelTab} />
        </ChatroomShellAuthenticatedSurface>
      );
    case "find-friends":
      return (
        <ChatroomShellAuthenticatedSurface>
          <FindFriendsView embedded embeddedTab={parseFindFriendsTab(panelTab)} />
        </ChatroomShellAuthenticatedSurface>
      );
    case "poetry":
      if (panelTab === "compose") {
        return (
          <ChatroomShellAuthenticatedSurface requireSignedInUser>
            <PoetryComposeView embeddedInShell />
          </ChatroomShellAuthenticatedSurface>
        );
      }
      return (
        <ChatroomShellAuthenticatedSurface>
          <PoetryDiscoveryView />
        </ChatroomShellAuthenticatedSurface>
      );
    case "competitions":
      return (
        <ChatroomShellAuthenticatedSurface>
          <CompetitionsPanel />
        </ChatroomShellAuthenticatedSurface>
      );
    case "confessions":
      return (
        <ChatroomShellAuthenticatedSurface>
          <ConfessionsView preferSignedInIdentity />
        </ChatroomShellAuthenticatedSurface>
      );
    default:
      return null;
  }
}

function overlayTitle(panel: ChatroomShellPanelId, panelTab?: string): string {
  if (panel === "feed" && panelTab === "notifications") return "Notifications";
  if (panel === "feed" && panelTab === "account") return "Account";
  if (panel === "feed" && panelTab === "trending") return "Trending";
  if (panel === "poetry" && panelTab === "compose") return "Write a Poem";
  return shellPanelTitle(panel);
}

type CodyChatShellPanelOverlayProps = {
  panel: ChatroomShellPanelId;
  panelTab?: string;
  onClose: () => void;
  onOpenShellPanel?: (panel: ChatroomShellPanelId, opts?: { tab?: string }) => void;
};

export function CodyChatShellPanelOverlay({
  panel,
  panelTab,
  onClose,
  onOpenShellPanel,
}: CodyChatShellPanelOverlayProps) {
  const title = overlayTitle(panel, panelTab);

  const shellContext = useMemo<ChatroomShellPanelContextValue>(
    () => ({
      embedded: true,
      openPoetryCompose: () => onOpenShellPanel?.("poetry", { tab: "compose" }),
      closePoetryCompose: () => onOpenShellPanel?.("poetry"),
    }),
    [onOpenShellPanel],
  );

  return (
    <ChatroomShellPanelContext.Provider value={shellContext}>
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
              <PanelBody
                panel={panel}
                panelTab={panelTab}
                onOpenShellPanel={onOpenShellPanel}
              />
            </Suspense>
          </RouteErrorBoundary>
        </div>
      </div>
    </ChatroomShellPanelContext.Provider>
  );
}
