import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { Loader2, PanelLeft, UserCircle, Users } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CHATROOM_LG_MQ,
  CHATROOM_MD_MQ,
  bindChatShellToVisualViewport,
  chatroomShellLayoutAttr,
  chatroomSidebarBackdropVisible,
  chatroomSidebarClassName,
  chatroomSidebarStyle,
  isClientDesktopShell,
  isClientLargeDesktopShell,
  readChatroomShellLayout,
} from "@/components/chat/chatroom-shell";
import {
  readSidebarOpenPreference,
  writeSidebarOpenPreference,
} from "@/lib/sidebar-prefs";
import { CodyChatSidebarNav } from "./CodyChatSidebarNav";
import { CodyChatMemberPanel } from "./CodyChatMemberPanel";
import { CodyChatProfilePanel } from "./CodyChatProfilePanel";
import { CodyChatMobileBar } from "./CodyChatMobileBar";
import { CodyChatRoomHeader } from "./CodyChatRoomHeader";
import { CodyChatTrendingBar } from "./CodyChatTrendingBar";
import { useCodyChatCommunity } from "./use-codychat-community";
import {
  type CodyChatAction,
  YAARZO_CODY_ACTION_MESSAGE,
  YAARZO_CODY_LOGOUT_MESSAGE,
  postCodyChatBridgeMessage,
  resolveCodyChatTargetOrigin,
} from "./codychat-actions";
import type { CodyChatGuestRosterEntry } from "./codychat-roster";
import type { ChatroomShellPanelId } from "@/lib/chatroom-shell-panel";
import { CodyChatShellPanelOverlay } from "./CodyChatShellPanelOverlay";
import "./codychat-shell.css";

const CHATROOM_XL_MQ = "(min-width: 1440px)";

type CodyChatShellProps = {
  chatUrl: string | null;
  loading?: boolean;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onIframeLoad?: () => void;
  codyGuests?: CodyChatGuestRosterEntry[];
  nativeCodyGuest?: boolean;
  onSignedInLogout?: () => void;
  onNativeGuestLogout?: () => void;
  shellPanel?: ChatroomShellPanelId;
  shellPanelTab?: string;
  onOpenShellPanel?: (panel: ChatroomShellPanelId, opts?: { tab?: string }) => void;
  onCloseShellPanel?: () => void;
};

export function CodyChatShell({
  chatUrl,
  loading,
  iframeRef,
  onIframeLoad,
  codyGuests = [],
  nativeCodyGuest = false,
  onSignedInLogout,
  onNativeGuestLogout,
  shellPanel,
  shellPanelTab,
  onOpenShellPanel,
  onCloseShellPanel,
}: CodyChatShellProps) {
  const shellRef = useRef<HTMLDivElement>(null);
  const sidebarPrefHydrated = useRef(false);

  const [shellLayout, setShellLayout] = useState(readChatroomShellLayout);
  const [isWideDesktop, setIsWideDesktop] = useState(false);
  const [sidebarOpen, setSidebarOpenState] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { room, topicLabels } = useCodyChatCommunity();

  const isDesktopShell = isClientDesktopShell(shellLayout);
  const isLargeDesktop = isClientLargeDesktopShell(shellLayout);
  const chatConnected = Boolean(chatUrl && !loading);

  useEffect(() => {
    const md = window.matchMedia(CHATROOM_MD_MQ);
    const lg = window.matchMedia(CHATROOM_LG_MQ);
    const xl = window.matchMedia(CHATROOM_XL_MQ);
    const onShell = () => {
      setShellLayout(readChatroomShellLayout());
      setIsWideDesktop(xl.matches);
    };
    md.addEventListener("change", onShell);
    lg.addEventListener("change", onShell);
    xl.addEventListener("change", onShell);
    window.addEventListener("resize", onShell);
    setIsWideDesktop(xl.matches);
    return () => {
      md.removeEventListener("change", onShell);
      lg.removeEventListener("change", onShell);
      xl.removeEventListener("change", onShell);
      window.removeEventListener("resize", onShell);
    };
  }, []);

  useEffect(() => {
    if (sidebarPrefHydrated.current) return;
    sidebarPrefHydrated.current = true;
    if (window.matchMedia(CHATROOM_MD_MQ).matches) {
      setSidebarOpenState(readSidebarOpenPreference(false));
    }
  }, []);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    return bindChatShellToVisualViewport(el);
  }, []);

  const setSidebarOpen = useCallback((next: boolean) => {
    setSidebarOpenState(next);
    if (window.matchMedia(CHATROOM_MD_MQ).matches) {
      writeSidebarOpenPreference(next);
    }
  }, []);

  const sendCodyIframeAction = useCallback(
    (action: CodyChatAction) => {
      const targetOrigin = resolveCodyChatTargetOrigin(chatUrl);
      if (!targetOrigin) return;
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow) return;
      iframeWindow.postMessage(
        { type: YAARZO_CODY_ACTION_MESSAGE, action },
        targetOrigin,
      );
    },
    [chatUrl, iframeRef],
  );

  const sendCodyChatAction = useCallback(
    (action: CodyChatAction) => {
      if (action === "private") {
        sendCodyIframeAction(action);
        return;
      }
      if (!onOpenShellPanel) return;
      if (action === "friends") {
        onOpenShellPanel("find-friends");
        return;
      }
      if (action === "notifications") {
        onOpenShellPanel("feed", { tab: "notifications" });
        return;
      }
      if (action === "profile") {
        onOpenShellPanel("feed", { tab: "account" });
      }
    },
    [onOpenShellPanel, sendCodyIframeAction],
  );

  const handleMemberLogout = useCallback(() => {
    postCodyChatBridgeMessage(iframeRef, chatUrl, { type: YAARZO_CODY_LOGOUT_MESSAGE });
    if (nativeCodyGuest) {
      onNativeGuestLogout?.();
      return;
    }
    onSignedInLogout?.();
  }, [chatUrl, iframeRef, nativeCodyGuest, onNativeGuestLogout, onSignedInLogout]);

  const memberPanelProps = {
    onCodyAction: sendCodyChatAction,
    onCodyLogout: handleMemberLogout,
    codyGuests,
    nativeCodyGuest,
    onOpenShellPanel,
  };

  const showInlineSidebar = isDesktopShell;
  const showInlineMembers = isLargeDesktop;
  const showInlineProfile = isLargeDesktop && isWideDesktop;
  const showMobileChrome = !isDesktopShell;
  const showTabletToolbar = isDesktopShell && !isLargeDesktop;
  const showWideToolbarExtras = isLargeDesktop && !isWideDesktop;
  const showSidebarFab = isDesktopShell && isLargeDesktop && !sidebarOpen;

  return (
    <div
      ref={shellRef}
      data-codychat-shell=""
      data-chatroom-shell=""
      data-chatroom-layout={chatroomShellLayoutAttr(shellLayout)}
      data-cody-wide={showInlineProfile ? "true" : "false"}
      className={cn(
        "mx-auto flex w-full max-w-none flex-col overflow-hidden overscroll-none text-foreground",
        isDesktopShell ? "h-dvh" : "h-dvh max-h-dvh",
      )}
    >
      {chatroomSidebarBackdropVisible(shellLayout, sidebarOpen) ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/45 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        {showInlineSidebar ? (
          <div
            data-chatroom-sidebar=""
            data-cody-column="sidebar"
            data-sidebar-open={sidebarOpen ? "true" : "false"}
            className={cn(chatroomSidebarClassName(shellLayout, sidebarOpen))}
            style={chatroomSidebarStyle(shellLayout, sidebarOpen)}
            aria-hidden={!sidebarOpen}
          >
            <CodyChatSidebarNav
              connected={chatConnected}
              onCollapse={() => setSidebarOpen(false)}
              shellPanel={shellPanel}
              shellPanelTab={shellPanelTab}
              onOpenShellPanel={onOpenShellPanel}
              onCloseShellPanel={onCloseShellPanel}
              nativeCodyGuest={nativeCodyGuest}
            />
          </div>
        ) : null}

        <main className="cody-center-column relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {showTabletToolbar || showWideToolbarExtras ? (
            <div className="cody-tablet-toolbar flex shrink-0 items-center gap-1 px-1.5 py-0.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Collapse navigation" : "Expand navigation"}
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-0 flex-1 truncate text-center text-xs font-semibold md:text-left">
                {room.roomTitle}
              </div>
              {showWideToolbarExtras ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-lg"
                  onClick={() => setProfileOpen(true)}
                  aria-label="Open profile panel"
                >
                  <UserCircle className="h-4 w-4" />
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg"
                onClick={() => setMembersOpen(true)}
                aria-label="Open members panel"
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          ) : null}

          {showMobileChrome ? (
            <CodyChatMobileBar
              connected={chatConnected}
              roomTitle={room.roomTitle}
              onOpenNav={() => setMobileNavOpen(true)}
              onOpenMembers={() => setMembersOpen(true)}
            />
          ) : (
            <>
              <CodyChatRoomHeader room={room} connected={chatConnected} />
              <CodyChatTrendingBar topics={topicLabels} />
            </>
          )}

          <div
            className={cn(
              "cody-center-frame relative flex min-h-0 flex-1 flex-col overflow-hidden",
              shellPanel && "cody-center-frame-has-panel",
            )}
          >
            {showSidebarFab ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cody-sidebar-fab"
                onClick={() => setSidebarOpen(true)}
                aria-label="Show navigation"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            ) : null}

            {loading || !chatUrl ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary/80" aria-hidden />
                <div>
                  <p className="text-sm font-medium">Connecting to Yaarzo Chat</p>
                  <p className="mt-1 text-xs text-muted-foreground">Secure sign-in via SSO…</p>
                </div>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                src={chatUrl}
                title="Yaarzo Chat"
                className={cn(
                  "cody-iframe min-h-0 flex-1",
                  shellPanel && "cody-iframe-under-panel",
                )}
                allow="camera; microphone; autoplay; clipboard-write"
                onLoad={onIframeLoad}
              />
            )}
            {shellPanel && onCloseShellPanel ? (
              <CodyChatShellPanelOverlay
                panel={shellPanel}
                panelTab={shellPanelTab}
                onClose={onCloseShellPanel}
                onOpenShellPanel={onOpenShellPanel}
              />
            ) : null}
          </div>
        </main>

        {showInlineMembers ? (
          <CodyChatMemberPanel forceDesktopColumn {...memberPanelProps} />
        ) : null}

        {showInlineProfile ? (
          <CodyChatProfilePanel forceDesktopColumn />
        ) : null}
      </div>

      {!isDesktopShell ? (
        <>
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent
              side="left"
              className="w-[min(100vw,280px)] max-w-[280px] border-r border-border/50 bg-[var(--cody-shell-bg)] p-0"
            >
              <CodyChatSidebarNav
                connected={chatConnected}
                onClose={() => setMobileNavOpen(false)}
                className="h-full w-full max-w-none"
                shellPanel={shellPanel}
                shellPanelTab={shellPanelTab}
                onOpenShellPanel={onOpenShellPanel}
                onCloseShellPanel={onCloseShellPanel}
                nativeCodyGuest={nativeCodyGuest}
              />
            </SheetContent>
          </Sheet>
          <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
            <SheetContent
              side="right"
              className="w-[min(100vw,300px)] max-w-[300px] border-l border-border/50 bg-[var(--cody-shell-bg)] p-0"
            >
              <CodyChatMemberPanel
                onClose={() => setMembersOpen(false)}
                {...memberPanelProps}
                className="w-full max-w-none border-l-0"
              />
            </SheetContent>
          </Sheet>
          <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
            <SheetContent
              side="right"
              className="w-[min(100vw,320px)] max-w-[320px] border-l border-border/50 bg-[var(--cody-shell-bg)] p-0"
            >
              <CodyChatProfilePanel
                onClose={() => setProfileOpen(false)}
                className="w-full max-w-none border-l-0"
              />
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <>
          <Sheet open={membersOpen && !isLargeDesktop} onOpenChange={setMembersOpen}>
            <SheetContent
              side="right"
              className="w-[min(100vw,300px)] max-w-[300px] border-l border-border/50 bg-[var(--cody-shell-bg)] p-0 lg:hidden"
            >
              <CodyChatMemberPanel
                onClose={() => setMembersOpen(false)}
                {...memberPanelProps}
                className="flex w-full max-w-none border-l-0"
              />
            </SheetContent>
          </Sheet>
          <Sheet open={profileOpen && !showInlineProfile} onOpenChange={setProfileOpen}>
            <SheetContent
              side="right"
              className="w-[min(100vw,320px)] max-w-[320px] border-l border-border/50 bg-[var(--cody-shell-bg)] p-0"
            >
              <CodyChatProfilePanel
                onClose={() => setProfileOpen(false)}
                className="flex w-full max-w-none border-l-0"
              />
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  );
}
