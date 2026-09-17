import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Menu, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-store";
import {
  IRC_CHAT_PRODUCT_ROOM,
  ircConnectionLabel,
  useIrcChatCore,
  useIrcChatState,
  useOptionalIrcChatCore,
} from "@/lib/irc-chat";
import { ircPmChannelForNick } from "@/lib/irc-chat/dm";
import { IrcChatGuestGate } from "./IrcChatGuestGate";

type ActiveView =
  | { kind: "room"; roomId: string }
  | { kind: "dm"; peerNick: string };

function ConnectionBadge() {
  const state = useIrcChatState();
  const hadAuthRef = useRef(false);
  if (state.status === "authenticated") hadAuthRef.current = true;
  const label = ircConnectionLabel(state.status, hadAuthRef.current);
  const tone =
    label === "Connected"
      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
      : label === "Disconnected"
        ? "bg-destructive/15 text-destructive"
        : "bg-amber-500/15 text-amber-800 dark:text-amber-300";

  return (
    <span
      className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tone)}
      title={state.statusDetail ?? label}
    >
      {label}
    </span>
  );
}

function RoomSidebar({
  activeRoomId,
  onSelectRoom,
  onClose,
}: {
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onClose?: () => void;
}) {
  const state = useIrcChatState();
  const rooms = useMemo(() => {
    const list = Object.values(state.rooms);
    if (!list.some((r) => r.id === IRC_CHAT_PRODUCT_ROOM)) {
      list.unshift({
        id: IRC_CHAT_PRODUCT_ROOM,
        name: "Yaarzo Global",
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [state.rooms]);

  return (
    <aside className="flex h-full flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <h2 className="text-sm font-semibold text-foreground">Rooms</h2>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {rooms.map((room) => (
          <li key={room.id}>
            <button
              type="button"
              onClick={() => onSelectRoom(room.id)}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                activeRoomId === room.id
                  ? "bg-primary/10 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="block truncate">#{room.name}</span>
              {room.memberCount != null ? (
                <span className="text-xs text-muted-foreground">{room.memberCount} online</span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function MembersPanel({
  roomId,
  selfNick,
  onDm,
  onClose,
}: {
  roomId: string;
  selfNick: string | null;
  onDm: (nick: string) => void;
  onClose?: () => void;
}) {
  const state = useIrcChatState();
  const members = state.members[roomId] ?? [];

  return (
    <aside className="flex h-full flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-3">
        <h2 className="text-sm font-semibold text-foreground">Members</h2>
        {onClose ? (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      <ul className="flex-1 overflow-y-auto p-2">
        {members.length === 0 ? (
          <li className="px-3 py-2 text-xs text-muted-foreground">No members yet</li>
        ) : (
          members.map((member) => {
            const isSelf = selfNick && member.nick.toLowerCase() === selfNick.toLowerCase();
            return (
              <li
                key={`${member.nick}:${member.userId}`}
                className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {member.nick}
                    {isSelf ? " (you)" : ""}
                  </p>
                  {member.isGuest ? (
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Guest</p>
                  ) : null}
                </div>
                {!isSelf ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-xs"
                    onClick={() => onDm(member.nick)}
                  >
                    DM
                  </Button>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </aside>
  );
}

function MessagePane({
  view,
  onBack,
}: {
  view: ActiveView;
  onBack?: () => void;
}) {
  const core = useIrcChatCore();
  const state = useIrcChatState();
  const [draft, setDraft] = useState("");

  const messages =
    view.kind === "room"
      ? state.messages[view.roomId] ?? []
      : state.privateMessages[ircPmChannelForNick(view.peerNick)] ?? [];

  const title =
    view.kind === "room" ? `#${state.rooms[view.roomId]?.name ?? view.roomId}` : `@${view.peerNick}`;

  const connected = state.status === "authenticated";
  const selfNick = state.ircNick;

  function send() {
    const text = draft.trim();
    if (!text) return;
    if (view.kind === "room") {
      core.sendPublicMessage(text, view.roomId);
    } else {
      core.sendPrivateMessage(view.peerNick, text);
    }
    setDraft("");
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-border px-3 py-2">
        {onBack ? (
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
          {selfNick ? (
            <p className="truncate text-xs text-muted-foreground">You are {selfNick}</p>
          ) : null}
        </div>
        <ConnectionBadge />
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const own =
              selfNick && msg.nick.toLowerCase() === selfNick.toLowerCase();
            return (
              <div
                key={msg.id}
                className={cn("max-w-[85%] rounded-lg px-3 py-2 text-sm", own ? "ml-auto bg-primary/10" : "bg-muted")}
              >
                {!own ? (
                  <p className="mb-0.5 text-xs font-semibold text-foreground">{msg.nick}</p>
                ) : null}
                <p className="whitespace-pre-wrap break-words text-foreground">{msg.text}</p>
                {msg.pending ? (
                  <p className="mt-1 text-[10px] text-muted-foreground">Sending…</p>
                ) : null}
                {msg.failed ? (
                  <p className="mt-1 text-[10px] text-destructive">Failed to send</p>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border p-3">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={connected ? "Type a message…" : "Disconnected"}
            disabled={!connected}
            maxLength={2000}
            className="flex-1"
          />
          <Button type="submit" disabled={!connected || !draft.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

export function IrcChatApp() {
  const core = useOptionalIrcChatCore();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>({
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
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Connecting to IRC…
      </div>
    );
  }

  const activeRoomId =
    activeView.kind === "room" ? activeView.roomId : IRC_CHAT_PRODUCT_ROOM;

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
      className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-[1600px] flex-col overflow-hidden bg-background lg:h-[calc(100dvh-2rem)]"
      data-irc-chat-app
    >
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => setRoomsOpen(true)}
          aria-label="Rooms"
        >
          <Menu className="h-4 w-4" />
        </Button>
        <p className="flex-1 truncate text-sm font-medium text-foreground">IRC Chat</p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={() => setMembersOpen(true)}
          aria-label="Members"
        >
          <Users className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {!isMobile ? (
          <div className="hidden w-64 shrink-0 lg:block">
            <RoomSidebar activeRoomId={activeRoomId} onSelectRoom={selectRoom} />
          </div>
        ) : null}

        <main className="flex min-w-0 flex-1 flex-col">
          <MessagePane
            view={activeView}
            onBack={
              isMobile && activeView.kind === "dm"
                ? () => setActiveView({ kind: "room", roomId: activeRoomId })
                : undefined
            }
          />
        </main>

        {!isMobile ? (
          <div className="hidden w-72 shrink-0 lg:block">
            <MembersPanel
              roomId={activeRoomId}
              selfNick={core.getState().ircNick}
              onDm={openDm}
            />
          </div>
        ) : null}

        {isMobile && roomsOpen ? (
          <div className="absolute inset-0 z-20 flex bg-background/80 backdrop-blur-sm">
            <div className="h-full w-[min(100%,18rem)] shadow-xl">
              <RoomSidebar
                activeRoomId={activeRoomId}
                onSelectRoom={selectRoom}
                onClose={() => setRoomsOpen(false)}
              />
            </div>
            <button
              type="button"
              className="flex-1"
              aria-label="Close rooms"
              onClick={() => setRoomsOpen(false)}
            />
          </div>
        ) : null}

        {isMobile && membersOpen ? (
          <div className="absolute inset-0 z-20 flex justify-end bg-background/80 backdrop-blur-sm">
            <button
              type="button"
              className="flex-1"
              aria-label="Close members"
              onClick={() => setMembersOpen(false)}
            />
            <div className="h-full w-[min(100%,18rem)] shadow-xl">
              <MembersPanel
                roomId={activeRoomId}
                selfNick={core.getState().ircNick}
                onDm={openDm}
                onClose={() => setMembersOpen(false)}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
