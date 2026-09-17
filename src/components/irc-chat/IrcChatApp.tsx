import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth-store";
import {
  IRC_CHAT_PRODUCT_ROOM,
  useIrcChatCore,
  useIrcChatState,
  useOptionalIrcChatCore,
} from "@/lib/irc-chat";
import { ircPmChannelForNick } from "@/lib/irc-chat/dm";
import { IrcChatGuestGate } from "./IrcChatGuestGate";
import { IrcChatHeader } from "./IrcChatHeader";
import { IrcChatSidebar } from "./IrcChatSidebar";
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background">
      {showHeader ? <IrcChatHeader view={view} onBack={onBack} /> : null}
      <IrcMessageList messages={messages} selfNick={selfNick} />
      <IrcMessageComposer onSend={handleSend} />
    </div>
  );
}

export function IrcChatApp() {
  const core = useOptionalIrcChatCore();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<IrcActiveView>({
    kind: "room",
    roomId: IRC_CHAT_PRODUCT_ROOM,
  });
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  const activeRoomId =
    activeView.kind === "room" ? activeView.roomId : IRC_CHAT_PRODUCT_ROOM;
  const selfNick = core.getState().ircNick;
  const activeRoomName = core.getState().rooms[activeRoomId]?.name;

  function selectRoom(roomId: string) {
    core.joinRoom(roomId);
    setActiveView({ kind: "room", roomId });
    setRoomsOpen(false);
  }

  function openDm(peerNick: string) {
    setActiveView({ kind: "dm", peerNick });
    setMembersOpen(false);
  }

  return (
    <div
      className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-[1680px] flex-col overflow-hidden bg-background lg:h-[calc(100dvh-2rem)]"
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
          <IrcChatSidebar activeRoomId={activeRoomId} onSelectRoom={selectRoom} />
        ) : null}

        <IrcChatCenter view={activeView} showHeader={!isMobile} />

        {!isMobile ? (
          <IrcMembersPanel
            roomId={activeRoomId}
            selfNick={selfNick}
            onDm={openDm}
          />
        ) : null}
      </div>

      {isMobile ? (
        <>
          <Sheet open={roomsOpen} onOpenChange={setRoomsOpen}>
            <SheetContent side="left" className="w-[min(100vw,280px)] p-0">
              <IrcChatSidebar
                activeRoomId={activeRoomId}
                onSelectRoom={selectRoom}
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
    </div>
  );
}
