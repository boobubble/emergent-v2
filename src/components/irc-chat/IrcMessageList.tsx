import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Clock, Hash, Loader2 } from "lucide-react";
import { isNearScrollBottom } from "@/lib/irc-chat/message-scroll";
import { buildIrcMessageReplyPreview, indexMessagesById, resolveReplyParent } from "@/lib/irc-chat/reply";
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
import { IrcMessageReplyPreview } from "./IrcMessageReplyPreview";
import { IrcMessageReactionsRow } from "./IrcMessageReactions";
import type { IrcMessageReactions, IrcReactionType } from "@/lib/irc-chat/reactions";
import {
  buildMentionKeySet,
  buildSelfMentionKeys,
  messageMentionsSelf,
} from "@/lib/irc-chat/mentions";
import { useRemoteProfileDirectory } from "@/lib/use-remote-profiles";
import { IrcTypingIndicator } from "./IrcTypingIndicator";
import "./message-list.css";

type IrcMessageListProps = {
  messages: IrcChatMessage[];
  selfNick: string | null;
  view: IrcActiveView;
  onReply?: (msg: IrcChatMessage) => void;
  onToggleReaction?: (msg: IrcChatMessage, type: IrcReactionType) => void;
  reactionsByMessageId?: Record<string, IrcMessageReactions>;
  className?: string;
};

function MessageRow({
  msg,
  own,
  showMeta,
  byId,
  highlight,
  onReply,
  onToggleReaction,
  reactions,
  onJumpToMessage,
  knownMentionKeys,
  selfMentionKeys,
  mentionedSelf,
}: {
  msg: IrcChatMessage;
  own: boolean;
  showMeta: boolean;
  byId: Map<string, IrcChatMessage>;
  highlight: boolean;
  onReply?: (msg: IrcChatMessage) => void;
  onToggleReaction?: (type: IrcReactionType) => void;
  reactions?: IrcMessageReactions;
  onJumpToMessage: (messageId: string) => void;
  knownMentionKeys: ReadonlySet<string>;
  selfMentionKeys: ReadonlySet<string>;
  mentionedSelf: boolean;
}) {
  const hue = nickAvatarHue(msg.nick);
  const parent = msg.replyToMessageId
    ? resolveReplyParent(msg.replyToMessageId, byId)
    : null;
  const replyUnavailable = Boolean(msg.replyToMessageId && !parent);

  return (
    <article
      className={cn(
        "irc-msg-row group/msg max-w-full irc-msg-in",
        showMeta ? "irc-msg-row--start" : "irc-msg-row--grouped",
        own && "irc-msg-row--own",
        highlight && "irc-msg-row--highlight",
        mentionedSelf && "irc-msg-row--mentioned",
      )}
      data-irc-msg-own={own ? "true" : undefined}
      data-irc-message-id={msg.id}
      id={`irc-msg-${msg.id}`}
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
          {msg.replyToMessageId ? (
            <IrcMessageReplyPreview
              authorNick={parent?.nick ?? ""}
              previewText={parent ? buildIrcMessageReplyPreview(parent) : ""}
              unavailable={replyUnavailable}
              onNavigate={
                parent && msg.replyToMessageId
                  ? () => onJumpToMessage(msg.replyToMessageId!)
                  : undefined
              }
            />
          ) : null}
          <IrcMessageBody
            text={msg.text}
            contentType={msg.contentType}
            stickerId={msg.stickerId}
            attachment={msg.attachment}
            knownMentionKeys={knownMentionKeys}
            selfMentionKeys={selfMentionKeys}
          />
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
        {onToggleReaction ? (
          <IrcMessageReactionsRow
            reactions={reactions}
            showReply={Boolean(onReply)}
            onToggle={onToggleReaction}
            onReply={onReply ? () => onReply(msg) : undefined}
          />
        ) : null}
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

export function IrcMessageList({
  messages,
  selfNick,
  view,
  onReply,
  onToggleReaction,
  reactionsByMessageId,
  className,
}: IrcMessageListProps) {
  const state = useIrcChatState();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pinnedToBottomRef = useRef(true);
  const hadAuthRef = useRef(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [showNewMessages, setShowNewMessages] = useState(false);
  if (state.status === "authenticated") hadAuthRef.current = true;

  const connectionLabel = ircConnectionLabel(state.status, hadAuthRef.current);
  const connecting = connectionLabel === "Connecting" || connectionLabel === "Reconnecting";
  const connected = connectionLabel === "Connected";

  const byId = useMemo(() => indexMessagesById(messages), [messages]);

  const items = useMemo(
    () => buildMessageListItems(messages, selfNick),
    [messages, selfNick],
  );

  const jumpToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`irc-msg-${messageId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightId(messageId);
    window.setTimeout(() => setHighlightId(null), 1600);
  }, []);

  const getScrollViewport = useCallback((): HTMLElement | null => {
    const root = scrollAreaRef.current;
    if (!root) return null;
    return root.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement | null;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const viewport = getScrollViewport();
    if (viewport) {
      viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, [getScrollViewport]);

  useEffect(() => {
    const viewport = getScrollViewport();
    if (!viewport) return;
    const onScroll = () => {
      const near = isNearScrollBottom(
        viewport.scrollTop,
        viewport.scrollHeight,
        viewport.clientHeight,
      );
      pinnedToBottomRef.current = near;
      if (near) setShowNewMessages(false);
    };
    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [getScrollViewport, messages.length]);

  useLayoutEffect(() => {
    if (pinnedToBottomRef.current) {
      scrollToBottom(messages.length <= 1 ? "auto" : "smooth");
      setShowNewMessages(false);
    } else {
      setShowNewMessages(true);
    }
  }, [messages.length, messages[messages.length - 1]?.id, scrollToBottom]);

  const canReply = view.kind === "room" && Boolean(onReply);
  const canReact = view.kind === "room" && Boolean(onToggleReaction);

  const { profiles: directoryProfiles } = useRemoteProfileDirectory();
  const roomMembers =
    view.kind === "room" ? state.members[view.roomId] ?? [] : [];
  const knownMentionKeys = useMemo(
    () => buildMentionKeySet(roomMembers, directoryProfiles),
    [roomMembers, directoryProfiles],
  );
  const selfUsername =
    state.userId && directoryProfiles[state.userId]
      ? directoryProfiles[state.userId]?.username
      : null;
  const selfMentionKeys = useMemo(
    () => buildSelfMentionKeys(selfNick, selfUsername),
    [selfNick, selfUsername],
  );
  const roomTypers =
    view.kind === "room" ? state.typing[view.roomId] ?? [] : [];

  useEffect(() => {
    pinnedToBottomRef.current = true;
    setShowNewMessages(false);
  }, [view.kind, view.kind === "room" ? view.roomId : view.kind === "dm" ? view.peerNick : ""]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {showNewMessages ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 flex justify-center">
          <button
            type="button"
            className="pointer-events-auto inline-flex items-center gap-1 rounded-full border border-primary/30 bg-background/95 px-3 py-1.5 text-xs font-medium text-primary shadow-md backdrop-blur-sm hover:bg-primary/10"
            onClick={() => {
              pinnedToBottomRef.current = true;
              setShowNewMessages(false);
              scrollToBottom("smooth");
            }}
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            New messages
          </button>
        </div>
      ) : null}
    <ScrollArea
      ref={scrollAreaRef}
      className={cn("irc-message-canvas min-h-0 flex-1", className)}
    >
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
                  byId={byId}
                  highlight={highlightId === item.msg.id}
                  onReply={canReply ? onReply : undefined}
                  onToggleReaction={
                    canReact && onToggleReaction
                      ? (type) => onToggleReaction(item.msg, type)
                      : undefined
                  }
                  reactions={reactionsByMessageId?.[item.msg.id]}
                  onJumpToMessage={jumpToMessage}
                  knownMentionKeys={knownMentionKeys}
                  selfMentionKeys={selfMentionKeys}
                  mentionedSelf={messageMentionsSelf(item.msg.text, selfMentionKeys)}
                />
              );
            })}
          </div>
        )}
        {view.kind === "room" ? (
          <IrcTypingIndicator typers={roomTypers} excludeUserId={state.userId} />
        ) : null}
        <div ref={bottomRef} aria-hidden className="h-2" />
      </div>
    </ScrollArea>
    </div>
  );
}
