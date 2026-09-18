import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, PanelLeftOpen } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChatProfilePopupHost } from "@/components/chat/ChatProfilePopupHost";
import { useAuth } from "@/lib/auth-store";
import {
  IRC_CHAT_PRODUCT_ROOM,
  useIrcChatCore,
  useIrcChatState,
  useOptionalIrcChatCore,
} from "@/lib/irc-chat";
import { ircPmChannelForNick } from "@/lib/irc-chat/dm";
import { ProfilePopupProvider } from "@/lib/profile-popup-context";
import {
  readSidebarOpenPreference,
  writeSidebarOpenPreference,
} from "@/lib/sidebar-prefs";
import { cn } from "@/lib/utils";
import {
  CHATROOM_LG_MQ,
  CHATROOM_MD_MQ,
  bindChatShellToVisualViewport,
  chatroomShellLayoutAttr,
  chatroomSidebarBackdropVisible,
  chatroomSidebarClassName,
  chatroomSidebarStyle,
  chatroomSidebarToggleVisible,
  isClientDesktopShell,
  isClientLargeDesktopShell,
  readChatroomShellLayout,
} from "@/components/chat/chatroom-shell";
import { IrcChatGuestGate } from "./IrcChatGuestGate";
import { IrcChatHeader } from "./IrcChatHeader";
import { IrcChatSidebar } from "./IrcChatSidebar";
import { IrcChatConversationTabs } from "./IrcChatConversationTabs";
import { IrcDmInfoPanel } from "./IrcDmInfoPanel";
import { IrcMembersPanel } from "./IrcMembersPanel";
import { IrcMessageComposer } from "./IrcMessageComposer";
import { IrcMessageList } from "./IrcMessageList";
import { IrcMobileNav } from "./IrcMobileNav";
import { IrcMobileDmDock } from "./IrcMobileDmDock";
import type { IrcActiveView } from "./irc-chat-types";
import "./irc-chat-polish.css";

function IrcChatCenter({
  view,
  onBack,
  showHeader = true,
  showComposer = true,
  onMinimizeDm,
  onSend,
}: {
  view: IrcActiveView;
  onBack?: () => void;
  showHeader?: boolean;
  showComposer?: boolean;
  onMinimizeDm?: () => void;
  onSend: (text: string) => void;
}) {
  const state = useIrcChatState();
  const selfNick = state.ircNick;

  const messages =
    view.kind === "room"
      ? state.messages[view.roomId] ?? []
      : state.privateMessages[ircPmChannelForNick(view.peerNick)] ?? [];

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background"
      data-irc-column="center"
    >
      {showHeader ? (
        <IrcChatHeader view={view} onBack={onBack} onMinimizeDm={onMinimizeDm} />
      ) : null}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <IrcMessageList messages={messages} selfNick={selfNick} view={view} />
      </div>
      {showComposer ? (
        <IrcMessageComposer onSend={onSend} view={view} shell="embedded" />
      ) : null}
    </div>
  );
}

function markPeerRead(
  peerNick: string,
  privateMessages: Record<string, import("@/lib/irc-chat").IrcChatMessage[]>,
): number {
  const channel = ircPmChannelForNick(peerNick);
  const msgs = privateMessages[channel] ?? [];
  return msgs.length ? msgs[msgs.length - 1].ts : Date.now();
}

function IrcChatAppShell() {
  const core = useIrcChatCore();
  const state = useIrcChatState();
  const shellRef = useRef<HTMLDivElement>(null);
  const sidebarPrefHydrated = useRef(false);

  const [shellLayout, setShellLayout] = useState(readChatroomShellLayout);
  const [activeView, setActiveView] = useState<IrcActiveView>({
    kind: "room",
    roomId: IRC_CHAT_PRODUCT_ROOM,
  });
  const [sidebarOpen, setSidebarOpenState] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [lastReadDmByPeer, setLastReadDmByPeer] = useState<Record<string, number>>({});
  const [openDmPeers, setOpenDmPeers] = useState<string[]>([]);
  const [minimizedDmPeers, setMinimizedDmPeers] = useState<string[]>([]);

  const isDesktopShell = isClientDesktopShell(shellLayout);
  const isLargeDesktop = isClientLargeDesktopShell(shellLayout);

  useEffect(() => {
    const md = window.matchMedia(CHATROOM_MD_MQ);
    const lg = window.matchMedia(CHATROOM_LG_MQ);
    const onShell = () => setShellLayout(readChatroomShellLayout());
    md.addEventListener("change", onShell);
    lg.addEventListener("change", onShell);
    return () => {
      md.removeEventListener("change", onShell);
      lg.removeEventListener("change", onShell);
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

  const markDmRead = useCallback(
    (peerNick: string) => {
      const ts = markPeerRead(peerNick, state.privateMessages);
      setLastReadDmByPeer((prev) => ({
        ...prev,
        [peerNick.toLowerCase()]: ts,
      }));
    },
    [state.privateMessages],
  );

  useEffect(() => {
    if (activeView.kind === "dm") {
      markDmRead(activeView.peerNick);
    }
  }, [activeView, state.privateMessages, markDmRead]);

  useEffect(() => {
    core.setSoundActiveRoom(activeView.kind === "room" ? activeView.roomId : null);
  }, [core, activeView]);

  const activeRoomId =
    activeView.kind === "room" ? activeView.roomId : IRC_CHAT_PRODUCT_ROOM;
  const selfNick = core.getState().ircNick;
  const activeRoomName = core.getState().rooms[activeRoomId]?.name;

  const mobileSidebarLastRead = useMemo(() => lastReadDmByPeer, [lastReadDmByPeer]);

  function selectRoom(roomId: string) {
    core.joinRoom(roomId);
    setActiveView({ kind: "room", roomId });
    setRoomsOpen(false);
    setSidebarOpen(false);
  }

  function openDm(peerNick: string) {
    setOpenDmPeers((prev) => {
      const key = peerNick.toLowerCase();
      if (prev.some((p) => p.toLowerCase() === key)) return prev;
      return [...prev, peerNick];
    });
    setMinimizedDmPeers((prev) =>
      prev.filter((p) => p.toLowerCase() !== peerNick.toLowerCase()),
    );
    setActiveView({ kind: "dm", peerNick });
    markDmRead(peerNick);
    setMembersOpen(false);
    setRoomsOpen(false);
    setSidebarOpen(false);
  }

  function closeDmTab(peerNick: string) {
    setOpenDmPeers((prev) =>
      prev.filter((p) => p.toLowerCase() !== peerNick.toLowerCase()),
    );
    if (
      activeView.kind === "dm" &&
      activeView.peerNick.toLowerCase() === peerNick.toLowerCase()
    ) {
      setActiveView({ kind: "room", roomId: activeRoomId });
    }
  }

  function minimizeActiveDm() {
    if (activeView.kind !== "dm") return;
    const peer = activeView.peerNick;
    setMinimizedDmPeers((prev) => {
      const key = peer.toLowerCase();
      if (prev.some((p) => p.toLowerCase() === key)) return prev;
      return [peer, ...prev].slice(0, 6);
    });
    setActiveView({ kind: "room", roomId: activeRoomId });
  }

  const handleSend = useCallback(
    (text: string) => {
      if (activeView.kind === "room") {
        core.sendPublicMessage(text, activeView.roomId);
      } else {
        core.sendPrivateMessage(activeView.peerNick, text);
      }
    },
    [activeView, core],
  );

  const showMobileNav = !isDesktopShell;
  const showCenterHeader = !isDesktopShell;
  const showDmConversationTabs =
    isDesktopShell && openDmPeers.length > 0;
  const showInlineSidebar = isDesktopShell;
  const showInlineMembers = isLargeDesktop && activeView.kind === "room";
  const showInlineDmPanel = isLargeDesktop && activeView.kind === "dm";

  return (
    <div
      ref={shellRef}
      data-irc-chat-app
      data-yaarzo-desktop={isDesktopShell ? "true" : undefined}
      data-chatroom-shell=""
      data-chatroom-layout={chatroomShellLayoutAttr(shellLayout)}
      className={cn(
        "mx-auto flex w-full flex-col overflow-hidden overscroll-none bg-background text-foreground",
        isDesktopShell
          ? "h-dvh max-w-none md:rounded-none md:border-0 md:shadow-none"
          : "h-[calc(100dvh-3.5rem)] max-w-[1840px] lg:h-[calc(100dvh-2rem)] lg:rounded-xl lg:border lg:border-border/70 lg:shadow-[0_8px_32px_-12px_hsl(var(--foreground)/0.1)]",
      )}
    >
      {chatroomSidebarBackdropVisible(shellLayout, sidebarOpen) ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
        {showInlineSidebar ? (
          <div
            data-chatroom-sidebar=""
            data-irc-column="sidebar"
            data-sidebar-open={sidebarOpen ? "true" : "false"}
            className={cn(chatroomSidebarClassName(shellLayout, sidebarOpen))}
            style={chatroomSidebarStyle(shellLayout, sidebarOpen)}
            aria-hidden={!sidebarOpen}
          >
            <IrcChatSidebar
              activeView={activeView}
              onSelectRoom={selectRoom}
              onSelectDm={openDm}
              lastReadDmByPeer={lastReadDmByPeer}
              onCollapse={() => setSidebarOpen(false)}
            />
          </div>
        ) : null}

        <main className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col">
          {chatroomSidebarToggleVisible(shellLayout, sidebarOpen) ? (
            <button
              type="button"
              data-chatroom-sidebar-toggle=""
              onClick={() => setSidebarOpen(true)}
              className="absolute left-3 top-3.5 z-30 grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30 transition-all hover:scale-110 hover:shadow-xl md:hidden"
              title="Show sidebar"
              aria-label="Show sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          ) : null}

          {isDesktopShell ? (
            <IrcChatHeader
              layout="desktop"
              view={activeView}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              showMembersButton={!isLargeDesktop && activeView.kind === "room"}
              onOpenMembers={() => setMembersOpen(true)}
            />
          ) : null}

          {showDmConversationTabs ? (
            <IrcChatConversationTabs
              shellLayout={shellLayout}
              activeView={activeView}
              primaryRoomId={activeRoomId}
              openDmPeers={openDmPeers}
              privateMessages={state.privateMessages}
              lastReadDmByPeer={lastReadDmByPeer}
              selfNick={selfNick}
              onSelectRoom={selectRoom}
              onSelectDm={openDm}
              onCloseDmTab={closeDmTab}
            />
          ) : null}

          {showMobileNav ? (
            <IrcMobileNav
              view={activeView}
              roomName={activeRoomName}
              selfNick={selfNick}
              onOpenRooms={() => setRoomsOpen(true)}
              onOpenMembers={() => setMembersOpen(true)}
              onBack={
                activeView.kind === "dm"
                  ? () => setActiveView({ kind: "room", roomId: activeRoomId })
                  : undefined
              }
              onMinimizeDm={
                activeView.kind === "dm" ? minimizeActiveDm : undefined
              }
            />
          ) : null}

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <IrcChatCenter
              view={activeView}
              showHeader={showCenterHeader}
              showComposer={!isDesktopShell}
              onSend={handleSend}
              onBack={
                activeView.kind === "dm"
                  ? () => setActiveView({ kind: "room", roomId: activeRoomId })
                  : undefined
              }
              onMinimizeDm={
                activeView.kind === "dm" && showCenterHeader
                  ? minimizeActiveDm
                  : undefined
              }
            />
          </div>

          {isDesktopShell ? (
            <div
              className="chat-composer-footer shrink-0"
              style={{ position: "relative", bottom: "auto" }}
            >
              <IrcMessageComposer
                onSend={handleSend}
                view={activeView}
                shell="footer"
              />
            </div>
          ) : null}
        </main>

        {showInlineMembers ? (
          <IrcMembersPanel
            roomId={activeView.roomId}
            selfNick={selfNick}
            onDm={openDm}
            forceDesktopColumn
          />
        ) : null}

        {showInlineDmPanel ? (
          <IrcDmInfoPanel peerNick={activeView.peerNick} selfNick={selfNick} forceDesktopColumn />
        ) : null}
      </div>

      {!isDesktopShell ? (
        <>
          <Sheet open={roomsOpen} onOpenChange={setRoomsOpen}>
            <SheetContent side="left" className="w-[min(100vw,290px)] p-0">
              <IrcChatSidebar
                activeView={activeView}
                onSelectRoom={selectRoom}
                onSelectDm={openDm}
                lastReadDmByPeer={mobileSidebarLastRead}
                onClose={() => setRoomsOpen(false)}
                className="w-full border-r-0 shadow-none"
              />
            </SheetContent>
          </Sheet>
            <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
            <SheetContent side="right" className="w-[min(100vw,260px)] p-0">
              {activeView.kind === "dm" ? (
                <IrcDmInfoPanel
                  peerNick={activeView.peerNick}
                  selfNick={selfNick}
                  onClose={() => setMembersOpen(false)}
                  className="w-full border-l-0 shadow-none"
                />
              ) : (
                <IrcMembersPanel
                  roomId={activeRoomId}
                  selfNick={selfNick}
                  onDm={openDm}
                  onClose={() => setMembersOpen(false)}
                  className="w-full border-l-0 shadow-none"
                />
              )}
            </SheetContent>
          </Sheet>
        </>
      ) : !isLargeDesktop ? (
        <Sheet open={membersOpen} onOpenChange={setMembersOpen}>
          <SheetContent side="right" className="w-[min(100vw,260px)] p-0">
            {activeView.kind === "dm" ? (
              <IrcDmInfoPanel
                peerNick={activeView.peerNick}
                selfNick={selfNick}
                onClose={() => setMembersOpen(false)}
                className="w-full border-l-0 shadow-none"
              />
            ) : (
              <IrcMembersPanel
                roomId={activeRoomId}
                selfNick={selfNick}
                onDm={openDm}
                onClose={() => setMembersOpen(false)}
                className="w-full border-l-0 shadow-none"
              />
            )}
          </SheetContent>
        </Sheet>
      ) : null}

      <IrcMobileDmDock
        minimizedPeers={minimizedDmPeers}
        selfNick={selfNick}
        privateMessages={state.privateMessages}
        lastReadDmByPeer={lastReadDmByPeer}
        onRestore={openDm}
        onDismiss={(peer) =>
          setMinimizedDmPeers((prev) =>
            prev.filter((p) => p.toLowerCase() !== peer.toLowerCase()),
          )
        }
      />

      <ChatProfilePopupHost />
    </div>
  );
}

export function IrcChatApp() {
  const core = useOptionalIrcChatCore();
  const { user } = useAuth();

  if (!user && !core) {
    return <IrcChatGuestGate />;
  }

  if (!core) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Connecting to IRC…
      </div>
    );
  }

  return (
    <ProfilePopupProvider>
      <IrcChatAppShell />
    </ProfilePopupProvider>
  );
}
