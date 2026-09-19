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
  formatRoomTitlePlain,
  nickAvatarHue,
  nickInitial,
} from "./irc-chat-ui";
import { IrcMessageBody } from "./IrcMessageBody";
import "./message-list.css";

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
    <article
      className={cn(
        "irc-msg-row group/msg max-w-full irc-msg-in",
        showMeta ? "irc-msg-row--start" : "irc-msg-row--grouped",
        own && "irc-msg-row--own",
      )}
      data-irc-msg-own={own ? "true" : undefined}
    >
      <div className="irc-msg-avatar-col" aria-hidden>
        {showMeta ? (
          <div
            className="irc-msg-avatar"
            style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
          >
            {nickInitial(msg.nick)}
          </div>
        ) : null}
      </div>
      <div className="irc-msg-content min-w-0 max-w-full flex-1">
        {showMeta ? (
          <header className="irc-msg-meta mb-0.5 flex min-w-0 items-baseline gap-x-2">
            <span className="truncate text-[13px] font-semibold text-foreground sm:text-sm">
              {msg.nick}
            </span>
            <time
              className="shrink-0 text-[10px] tabular-nums text-muted-foreground"
              dateTime={new Date(msg.ts).toISOString()}
            >
              {formatMessageTime(msg.ts)}
            </time>
          </header>
        ) : null}
        <div
          className={cn(
            "irc-msg-body-wrap",
            own && "irc-msg-body-wrap--own",
            msg.pending && "irc-msg-body-wrap--pending",
            msg.failed && "irc-msg-body-wrap--failed",
          )}
        >
          <IrcMessageBody text={msg.text} />
          {msg.pending ? (
            <span className="irc-msg-status irc-msg-status--pending">
              <Clock className="h-3 w-3 shrink-0" aria-hidden />
              Sending…
            </span>
          ) : null}
          {msg.failed ? (
            <p className="irc-msg-status irc-msg-status--failed">Failed to send</p>
          ) : null}
        </div>
      </div>
    </article>
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
  const roomPlain =
    view.kind === "room"
      ? formatRoomTitlePlain(state.rooms[view.roomId]?.name ?? view.roomId)
      : view.peerNick;

  return (
    <div className="irc-empty-conversation flex flex-col items-center px-6 pb-10 pt-0 text-center">
      <div className="irc-empty-icon-shell mb-3 flex items-center justify-center text-primary" aria-hidden>
        {view.kind === "room" ? (
          <span className="text-xl leading-none" role="img" aria-label="Wave">
            👋
          </span>
        ) : (
          <Hash className="h-5 w-5" strokeWidth={2.25} />
        )}
      </div>
      <p className="irc-empty-room-title text-foreground">
        {view.kind === "room" ? `Welcome to ${roomPlain}` : roomPlain}
      </p>
      <p className="mt-2 max-w-[20rem] text-xs leading-relaxed text-muted-foreground">
        {connected ? (
          <>
            Start the conversation.
            <br />
            Be respectful and enjoy the room.
          </>
        ) : (
          "Connect to chat to send messages."
        )}
      </p>
      {view.kind === "room" && roomTitle ? (
        <p className="mt-2 text-[10px] font-medium text-muted-foreground/80">{roomTitle}</p>
      ) : null}
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
    <ScrollArea className={cn("irc-message-canvas min-h-0 flex-1", className)}>
      <div className="irc-message-list-inner">
        {connecting && messages.length === 0 ? (
          <div className="irc-connecting-state flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden />
            <p className="text-sm font-medium text-foreground">
              {connectionLabel === "Reconnecting"
                ? "Reconnecting to Yaarzo Chat…"
                : "Connecting to Yaarzo Chat…"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {connectionLabel === "Reconnecting" ? "Restoring IRC session" : "Opening IRC connection"}
            </p>
            {state.statusDetail ? (
              <p className="max-w-xs text-xs text-muted-foreground">{state.statusDetail}</p>
            ) : null}
          </div>
        ) : messages.length === 0 ? (
          <EmptyConversation view={view} connected={connected} />
        ) : (
          <div className="irc-message-stream">
            {items.map((item) => {
              if (item.type === "date") {
                return (
                  <div key={item.key} className="irc-date-divider" role="separator">
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
