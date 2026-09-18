import { useEffect, useMemo, useRef } from "react";
import { Clock, Hash, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ircConnectionLabel, useIrcChatState, type IrcChatMessage } from "@/lib/irc-chat";
import type { IrcActiveView } from "./irc-chat-types";
import {
  buildMessageListItems,
  formatMessageTime,
  formatRoomDisplayTitle,
  nickAvatarHue,
  nickInitial,
} from "./irc-chat-ui";
import "@/components/chat/message-list.css";

const BUBBLE_SHELL = "w-max max-w-[min(80%,20rem)] shrink-0";
const MSG_BODY_CLASS = "text-[13px] leading-snug sm:text-sm";

type IrcMessageListProps = {
  messages: IrcChatMessage[];
  selfNick: string | null;
  view: IrcActiveView;
  className?: string;
};

function MessageRow({
  msg,
  own,
  showMeta,
}: {
  msg: IrcChatMessage;
  own: boolean;
  showMeta: boolean;
}) {
  const hue = nickAvatarHue(msg.nick);

  return (
    <div className="group/msg flex max-w-full gap-2 py-0.5 sm:gap-2.5">
      {showMeta ? (
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-1 ring-border/30 sm:h-8 sm:w-8"
          style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
          aria-hidden
        >
          {nickInitial(msg.nick)}
        </div>
      ) : (
        <div className="w-7 shrink-0 sm:w-8" aria-hidden />
      )}
      <div className="min-w-0 max-w-full flex-1">
        {showMeta ? (
          <div className="mb-1 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="text-[13px] font-semibold text-foreground/95">{msg.nick}</span>
            {own ? (
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                You
              </span>
            ) : null}
            <time
              className="text-[10px] tabular-nums text-muted-foreground/90"
              dateTime={new Date(msg.ts).toISOString()}
            >
              {formatMessageTime(msg.ts)}
            </time>
          </div>
        ) : null}
        <div
          className={cn(
            own
              ? `msg-mine ${BUBBLE_SHELL} rounded-2xl rounded-tr-md bg-primary px-3 py-2 ${MSG_BODY_CLASS} font-medium text-primary-foreground shadow-lg shadow-primary/20 chat-msg-in`
              : `${BUBBLE_SHELL} rounded-2xl rounded-tl-md border border-border bg-card/70 px-3 py-2 ${MSG_BODY_CLASS} leading-snug text-foreground/90 shadow-sm backdrop-blur-sm chat-msg-in`,
            msg.pending && "opacity-75",
          )}
        >
          <p className="whitespace-pre-wrap [overflow-wrap:break-word]">{msg.text}</p>
          {msg.pending ? (
            <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3 animate-pulse" aria-hidden />
              Sending…
            </span>
          ) : null}
          {msg.failed ? (
            <p className="mt-1 text-[10px] font-medium text-destructive">Failed to send</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EmptyConversation({
  view,
  connected,
}: {
  view: IrcActiveView;
  connected: boolean;
}) {
  const state = useIrcChatState();
  const roomTitle =
    view.kind === "room"
      ? formatRoomDisplayTitle(state.rooms[view.roomId]?.name ?? view.roomId)
      : null;

  return (
    <div className="irc-empty-conversation flex flex-col items-center justify-center px-6 py-14 text-center">
      <div
        className="irc-empty-icon-shell mb-5 flex h-16 w-16 items-center justify-center text-primary"
        aria-hidden
      >
        {view.kind === "room" ? (
          <Hash className="h-7 w-7" strokeWidth={2.25} />
        ) : (
          <span className="text-2xl">💬</span>
        )}
      </div>
      <p className="text-lg font-bold tracking-tight text-foreground">
        {view.kind === "room" ? roomTitle : view.peerNick}
      </p>
      <p className="mt-1 text-sm font-semibold text-muted-foreground">No messages yet</p>
      <p className="mt-2 max-w-[20rem] text-xs leading-relaxed text-muted-foreground/90">
        {connected
          ? "Say hello and start the conversation."
          : "Connect to IRC to send messages."}
      </p>
    </div>
  );
}

export function IrcMessageList({ messages, selfNick, view, className }: IrcMessageListProps) {
  const state = useIrcChatState();
  const bottomRef = useRef<HTMLDivElement>(null);
  const hadAuthRef = useRef(false);
  if (state.status === "authenticated") hadAuthRef.current = true;

  const connectionLabel = ircConnectionLabel(state.status, hadAuthRef.current);
  const connecting = connectionLabel === "Connecting" || connectionLabel === "Reconnecting";
  const connected = connectionLabel === "Connected";

  const items = useMemo(
    () => buildMessageListItems(messages, selfNick),
    [messages, selfNick],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, messages[messages.length - 1]?.id]);

  return (
    <ScrollArea
      className={cn("irc-message-canvas min-h-0 flex-1", className)}
    >
      <div className="flex-1 px-3 py-3 text-xs sm:px-4 md:text-[15px]">
        {connecting && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">
              {connectionLabel === "Reconnecting" ? "Reconnecting to IRC…" : "Connecting to IRC…"}
            </p>
            {state.statusDetail ? (
              <p className="max-w-xs text-xs text-muted-foreground">{state.statusDetail}</p>
            ) : null}
          </div>
        ) : messages.length === 0 ? (
          <EmptyConversation view={view} connected={connected} />
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              if (item.type === "date") {
                return (
                  <div
                    key={item.key}
                    className="irc-date-divider"
                    role="separator"
                  >
                    <span>{item.label}</span>
                  </div>
                );
              }
              return (
                <MessageRow
                  key={item.msg.id}
                  msg={item.msg}
                  own={item.own}
                  showMeta={item.showMeta}
                />
              );
            })}
          </div>
        )}
        <div ref={bottomRef} aria-hidden className="h-2" />
      </div>
    </ScrollArea>
  );
}
