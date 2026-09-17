import { useEffect, useMemo, useRef } from "react";
import { Clock, Loader2, MessagesSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ircConnectionLabel, useIrcChatState, type IrcChatMessage } from "@/lib/irc-chat";
import type { IrcActiveView } from "./irc-chat-types";
import {
  buildMessageListItems,
  formatMessageTime,
  formatRoomLabel,
  nickAvatarHue,
  nickInitial,
} from "./irc-chat-ui";
import "@/components/chat/message-list.css";

type IrcMessageListProps = {
  messages: IrcChatMessage[];
  selfNick: string | null;
  view: IrcActiveView;
  className?: string;
};

const BUBBLE_SHELL =
  "w-max max-w-[min(85%,28rem)] shrink-0 rounded-xl px-3 py-2 text-[13px] leading-[1.55] shadow-sm ring-1 ring-inset chat-bubble-in";

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
    <div
      className={cn(
        "group/msg flex gap-2.5 px-0.5 py-0.5",
        own ? "flex-row-reverse" : "",
      )}
    >
      {!own ? (
        showMeta ? (
          <div
            className="mt-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-1 ring-black/5"
            style={{ backgroundColor: `hsl(${hue} 52% 46%)` }}
            aria-hidden
          >
            {nickInitial(msg.nick)}
          </div>
        ) : (
          <div className="w-7 shrink-0" aria-hidden />
        )
      ) : null}
      <div
        className={cn(
          "min-w-0 flex-1",
          own && "flex flex-col items-end",
        )}
      >
        {showMeta ? (
          <div
            className={cn(
              "mb-1 flex flex-wrap items-baseline gap-x-2 px-0.5",
              own && "flex-row-reverse",
            )}
          >
            <span className="text-[11px] font-semibold text-foreground">{msg.nick}</span>
            <time
              className="text-[10px] tabular-nums text-muted-foreground/80"
              dateTime={new Date(msg.ts).toISOString()}
            >
              {formatMessageTime(msg.ts)}
            </time>
          </div>
        ) : null}
        <div
          className={cn(
            BUBBLE_SHELL,
            own
              ? "rounded-br-md bg-primary/[0.09] text-foreground ring-primary/18"
              : "rounded-bl-md bg-card/95 text-foreground ring-border/45",
            msg.pending && "opacity-80",
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
      ? formatRoomLabel(state.rooms[view.roomId]?.name ?? view.roomId)
      : null;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 text-primary ring-1 ring-primary/15"
        aria-hidden
      >
        <MessagesSquare className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-semibold text-foreground">
        {view.kind === "room" ? roomTitle : view.peerNick}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">No messages yet</p>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-muted-foreground">
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
      className={cn(
        "min-h-0 flex-1 bg-[color-mix(in_oklab,var(--muted)_32%,var(--background)_68%)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-4xl space-y-1 px-3 py-3 sm:px-5 sm:py-4 md:text-[15px]">
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
          items.map((item) => {
            if (item.type === "date") {
              return (
                <div
                  key={item.key}
                  className="flex items-center gap-2 py-2.5"
                  role="separator"
                >
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/90">
                    {item.label}
                  </span>
                  <div className="h-px flex-1 bg-border/60" />
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
          })
        )}
        <div ref={bottomRef} aria-hidden className="h-px" />
      </div>
    </ScrollArea>
  );
}
