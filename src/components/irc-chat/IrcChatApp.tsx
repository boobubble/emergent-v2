import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { IrcChatGuestGate } from "./IrcChatGuestGate";
import { IrcChatHeader } from "./IrcChatHeader";
import { IrcChatSidebar } from "./IrcChatSidebar";
import { IrcDmInfoPanel } from "./IrcDmInfoPanel";
import { IrcMembersPanel } from "./IrcMembersPanel";
import { IrcMessageComposer } from "./IrcMessageComposer";
import { IrcMessageList } from "./IrcMessageList";
import { IrcMobileNav } from "./IrcMobileNav";
import type { IrcActiveView } from "./irc-chat-types";

function IrcChatCenter({
  view,
  onBack,
  showHeader = true,
}: {
  view: IrcActiveView;
  onBack?: () => void;
  showHeader?: boolean;
}) {
  const core = useIrcChatCore();
  const state = useIrcChatState();
  const selfNick = state.ircNick;

  const messages =
    view.kind === "room"
      ? state.messages[view.roomId] ?? []
      : state.privateMessages[ircPmChannelForNick(view.peerNick)] ?? [];

  function handleSend(text: string) {
    if (view.kind === "room") {
      core.sendPublicMessage(text, view.roomId);
    } else {
      core.sendPrivateMessage(view.peerNick, text);
    }
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background lg:border-x lg:border-border/50">
      {showHeader ? <IrcChatHeader view={view} onBack={onBack} /> : null}
      <IrcMessageList messages={messages} selfNick={selfNick} view={view} />
      <IrcMessageComposer onSend={handleSend} view={view} />
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
  const [activeView, setActiveView] = useState<IrcActiveView>({
    kind: "room",
    roomId: IRC_CHAT_PRODUCT_ROOM,
  });
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [lastReadDmByPeer, setLastReadDmByPeer] = useState<Record<string, number>>({});

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
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

  const activeRoomId =
    activeView.kind === "room" ? activeView.roomId : IRC_CHAT_PRODUCT_ROOM;
  const selfNick = core.getState().ircNick;
  const activeRoomName = core.getState().rooms[activeRoomId]?.name;

  const mobileSidebarLastRead = useMemo(() => lastReadDmByPeer, [lastReadDmByPeer]);

  function selectRoom(roomId: string) {
    core.joinRoom(roomId);
    setActiveView({ kind: "room", roomId });
    setRoomsOpen(false);
  }

  function openDm(peerNick: string) {
    setActiveView({ kind: "dm", peerNick });
    markDmRead(peerNick);
    setMembersOpen(false);
    setRoomsOpen(false);
  }

  return (
    <div
      className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-[1720px] flex-col overflow-hidden bg-muted/20 lg:h-[calc(100dvh-2rem)] lg:rounded-2xl lg:border lg:border-border/70 lg:bg-muted/25 lg:shadow-[0_8px_40px_-12px_hsl(var(--foreground)/0.08)]"
      data-irc-chat-app
    >
      {isMobile ? (
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
        />
      ) : null}

      <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
        {!isMobile ? (
          <IrcChatSidebar
            activeView={activeView}
            onSelectRoom={selectRoom}
            onSelectDm={openDm}
            lastReadDmByPeer={lastReadDmByPeer}
          />
        ) : null}

        <IrcChatCenter view={activeView} showHeader={!isMobile} />

        {!isMobile ? (
          activeView.kind === "dm" ? (
            <IrcDmInfoPanel peerNick={activeView.peerNick} selfNick={selfNick} />
          ) : (
            <IrcMembersPanel
              roomId={activeView.roomId}
              selfNick={selfNick}
              onDm={openDm}
            />
          )
        ) : null}
      </div>

      {isMobile ? (
        <>
          <Sheet open={roomsOpen} onOpenChange={setRoomsOpen}>
            <SheetContent side="left" className="w-[min(100vw,280px)] p-0">
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
            <SheetContent side="right" className="w-[min(100vw,300px)] p-0">
              <IrcMembersPanel
                roomId={activeRoomId}
                selfNick={selfNick}
                onDm={openDm}
                onClose={() => setMembersOpen(false)}
                className="w-full border-l-0 shadow-none"
              />
            </SheetContent>
          </Sheet>
        </>
      ) : null}

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
