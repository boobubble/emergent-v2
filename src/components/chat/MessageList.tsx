import { useEffect, useRef, useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "./Avatar";
import { FrameAvatar, CosmeticName, RankChip } from "@/components/cosmetics/CosmeticBits";
import { UserMenu } from "./UserMenu";
import { StaffActionsMenu } from "./StaffActionsMenu";
import type { Message, Attachment } from "@/lib/chat-types";
import { Download, Reply, CornerDownRight, CheckCheck, Clock } from "lucide-react";
import { NameEmojiBadge, NameAdornments } from "@/lib/name-emoji";
import { EmojiEffectLayer } from "./EmojiEffectLayer";
import { HighlightButton } from "./HighlightButton";
import { useIgnore } from "@/lib/ignore-store";
import { linkify } from "@/lib/linkify";
import { MediaEmbed } from "./MediaEmbed";
import { VoiceNoteBubble } from "./VoiceNoteBubble";
import { useDmUrlMask } from "@/lib/dm-url-mask";
import { useGuestLobbyFeed, confirmGuestOptimistic, failGuestOptimistic, markGuestOptimisticSending } from "@/lib/use-guest-lobby-feed";
import { GUEST_LOBBY_CHANNEL_ID } from "@/lib/guest-chat-config";
import { useGuestChat } from "@/lib/guest-chat-context";
import { sendGuestLobbyMessage } from "@/lib/guest-chat.functions";
import { isPresenceSystemMessage as isRoomPresenceLine } from "@/lib/presence-ui";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import {
  filterChatMessages,
  resolveMessageAuthor,
  safeMessageText,
} from "@/lib/message-list-model";

function PresenceSystemLine({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-1">
      <div className="flex max-w-full items-center gap-2 px-2 text-[11px] text-muted-foreground/80">
        <span className="h-px min-w-[1rem] flex-1 bg-border/60" aria-hidden />
        <span className="shrink-0 text-center">{text}</span>
        <span className="h-px min-w-[1rem] flex-1 bg-border/60" aria-hidden />
      </div>
    </div>
  );
}

function isPresenceSystemMessage(m: Message): boolean {
  return isRoomPresenceLine(m.authorId, m.kind);
}

function AttachmentView({ a }: { a: Attachment }) {
  if (a.mime?.startsWith("audio/")) {
    return <VoiceNoteBubble a={a} />;
  }
  if (a.kind === "image") {
    const isSticker = a.mime === "image/gif" || /\.gif$/i.test(a.name || "");
    if (isSticker) {
      return (
        <img
          src={a.dataUrl}
          alt={a.name}
          className="mt-1 block h-16 w-16 object-contain"
        />
      );
    }
    return (
      <a href={a.dataUrl} download={a.name} className="mt-1 block max-w-[280px] overflow-hidden rounded-xl border border-border">
        <img src={a.dataUrl} alt={a.name} className="block max-h-72 w-full object-contain bg-black/30" />
      </a>
    );
  }
  return (
    <a href={a.dataUrl} download={a.name} className="mt-1 flex max-w-[280px] items-center gap-2 rounded-xl border border-border bg-white/5 px-3 py-2 text-xs hover:bg-white/10">
      <Download className="h-4 w-4 text-primary" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{a.name}</div>
        <div className="text-muted-foreground">{(a.size / 1024).toFixed(1)} KB</div>
      </div>
    </a>
  );
}

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function renderText(text: string) {
  const parts: React.ReactNode[] = [];
  const lines = safeMessageText(text).split("\n");
  lines.forEach((line, li) => {
    const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
    tokens.forEach((t, i) => {
      if (/^\*\*.+\*\*$/.test(t))
        parts.push(<strong key={`${li}-${i}`} className="font-semibold">{linkify(t.slice(2, -2), `${li}-${i}`)}</strong>);
      else if (/^`.+`$/.test(t))
        parts.push(<code key={`${li}-${i}`} className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-primary">{t.slice(1, -1)}</code>);
      else if (/^_.+_$/.test(t))
        parts.push(<em key={`${li}-${i}`} className="text-muted-foreground">{linkify(t.slice(1, -1), `${li}-${i}`)}</em>);
      else parts.push(<span key={`${li}-${i}`}>{linkify(t, `${li}-${i}`)}</span>);
    });
    if (li < lines.length - 1) parts.push(<br key={`br-${li}`} />);
  });
  return parts;
}

function Time({ ts }: { ts: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span className="text-[10px] text-muted-foreground/70" suppressHydrationWarning>
      {mounted ? formatTime(ts) : ""}
    </span>
  );
}

function ReplyPreview({ message, align = "left" }: { message: Message; align?: "left" | "right" }) {
  const { state } = useChat();
  const author = state.users[message.authorId];
  return (
    <div
      className={`mb-1.5 flex max-w-[min(80%,20rem)] items-start gap-1.5 rounded-lg border border-primary/25 bg-primary/5 px-2.5 py-1.5 text-[11px] ${
        align === "right" ? "self-end border-r-2 border-r-primary/70" : "border-l-2 border-l-primary/70"
      }`}
    >
      <CornerDownRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
      <div className="min-w-0">
        <span className="block font-semibold text-primary">{author?.name || "Unknown"}</span>
        <span className="line-clamp-2 text-muted-foreground">
          {message.text || (message.attachment ? `📎 ${message.attachment.name}` : "(message)")}
        </span>
      </div>
    </div>
  );
}

function ReplyButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full text-muted-foreground opacity-70 transition-opacity hover:bg-primary/10 hover:text-primary sm:min-h-8 sm:min-w-8 sm:opacity-0 sm:group-hover/msg:opacity-100"
      title="Reply"
      aria-label="Reply"
    >
      <Reply className="h-4 w-4" />
    </button>
  );
}

function SendStatusBits({ m, onRetry }: { m: Message; onRetry?: () => void }) {
  if (m.sendStatus === "sending") {
    return (
      <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground/80" title="Sending">
        <Clock className="h-3 w-3 animate-pulse" />
        <span>Sending</span>
      </span>
    );
  }
  if (m.sendStatus === "failed") {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="mt-0.5 text-[10px] font-medium text-destructive hover:underline"
      >
        Couldn't send · Retry
      </button>
    );
  }
  return null;
}

function bubblePendingClass(m: Message, extra: string) {
  if (m.sendStatus === "sending") return `${extra} opacity-70`;
  if (m.sendStatus === "failed") return `${extra} opacity-80 ring-1 ring-destructive/40`;
  return extra;
}

export function MessageList({ channelId }: { channelId: string }) {
  const { channelMessages, state, setReplyingTo, findMessage, isDM, dmPeerReadAt, replyingTo, retrySend } = useChat();
  const { isIgnored } = useIgnore();
  const { isGuestChatting, session } = useGuestChat();
  const { profiles } = useRemoteProfiles();
  const guestFeed = useGuestLobbyFeed(channelId === GUEST_LOBBY_CHANNEL_ID);
  const sendGuest = useServerFn(sendGuestLobbyMessage);
  const maskDmUrls = useDmUrlMask();
  const isDmChan = typeof channelId === "string" && isDM(channelId);
  const applyMask = (authorId: string, text: string) =>
    isDmChan && authorId !== "me" ? maskDmUrls(safeMessageText(text)) : safeMessageText(text);
  const baseMsgs = typeof channelId === "string" ? channelMessages(channelId) : [];
  const allMsgs = useMemo(() => {
    if (channelId !== GUEST_LOBBY_CHANNEL_ID) return baseMsgs;
    const merged = [...baseMsgs, ...guestFeed.messages];
    const seen = new Set<string>();
    return merged
      .filter((m) => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      })
      .sort((a, b) => a.ts - b.ts);
  }, [baseMsgs, guestFeed.messages, channelId]);
  const usersById = useMemo(
    () => ({ ...profiles, ...state.users, ...guestFeed.users }),
    [profiles, state.users, guestFeed.users],
  );
  const msgs = useMemo(
    () => filterChatMessages(allMsgs, usersById, isIgnored),
    [allMsgs, usersById, isIgnored],
  );
  const peerReadAt = isDM(channelId) ? dmPeerReadAt(channelId) : 0;
  const lastSeenMeId = useMemo(() => {
    let lastMeIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].authorId === "me" && !msgs[i].sendStatus) { lastMeIdx = i; break; }
    }
    if (lastMeIdx === -1) return null;
    if (isDM(channelId)) {
      // Real read receipt: show "Seen" only if peer's last_read_at >= my message ts
      return peerReadAt && msgs[lastMeIdx].ts <= peerReadAt ? msgs[lastMeIdx].id : null;
    }
    const hasLaterHuman = msgs.slice(lastMeIdx + 1).some(m => {
      if (m.authorId === "me") return false;
      const u = usersById[m.authorId];
      return u && !u.isBot && !u.isGuest;
    });
    return hasLaterHuman ? msgs[lastMeIdx].id : null;
  }, [msgs, usersById, isDM, channelId, peerReadAt]);

  async function retryGuestMessage(m: Message) {
    if (!session) return;
    const optId = m.id.startsWith("guestmsg:") ? m.id.slice("guestmsg:".length) : m.id;
    markGuestOptimisticSending(optId);
    try {
      const real = await sendGuest({
        data: {
          visitorId: session.visitorId,
          channelId: GUEST_LOBBY_CHANNEL_ID,
          text: m.text,
        },
      });
      confirmGuestOptimistic(optId, {
        id: real.id,
        channelId: real.channelId,
        visitorId: real.visitorId,
        displayName: real.displayName,
        text: real.text,
        createdAt: real.createdAt,
        expiresAt: real.expiresAt,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send";
      failGuestOptimistic(optId, msg);
    }
  }

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs.length, channelId]);

  const groups: Message[][] = [];
  msgs.forEach(m => {
    if (isPresenceSystemMessage(m)) {
      groups.push([m]);
      return;
    }
    const last = groups[groups.length - 1];
    if (
      last &&
      !isPresenceSystemMessage(last[0]) &&
      last[0].authorId === m.authorId &&
      !m.replyToId && !last[last.length - 1].replyToId &&
      m.ts - last[last.length - 1].ts < 5 * 60_000
    )
      last.push(m);
    else groups.push([m]);
  });

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
    <EmojiEffectLayer channelId={channelId} />
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 text-xs sm:px-4 md:text-[15px]">
      {groups.length === 0 && (
        <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
          <div>
            <div className="mb-3 text-5xl">💬</div>
            <p>
              No messages yet. Say hi or type{" "}
              <code className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-primary">!help</code>
            </p>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {groups.map((g, gi) => {
          if (isPresenceSystemMessage(g[0])) {
            return <PresenceSystemLine key={g[0].id} text={g[0].text} />;
          }
          const author = resolveMessageAuthor(usersById, g[0].authorId);
          const isEphemeralGuest = Boolean(author.isGuest || author.id.startsWith("visitor_"));
          const isOwnGuest = Boolean(isGuestChatting && session && author.id === session.visitorId);
          const isMe = author.id === "me" || isOwnGuest;

          if (isEphemeralGuest) {
            return (
              <div key={gi} className={`group flex gap-2.5 ${isOwnGuest ? "flex-row-reverse" : ""}`}>
                <Avatar user={author} size={28} />
                <div className={`min-w-0 flex-1 ${isOwnGuest ? "flex flex-col items-end" : ""}`}>
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">{author.name}</span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-muted-foreground">
                      Guest
                    </span>
                    <Time ts={g[0].ts} />
                  </div>
                  {/* Own-guest fill must be opaque `bg-primary` (not /90). The guest
                      stylesheet only emits hover:bg-primary/90, not standalone
                      .bg-primary/90. Light + purple sets --primary-foreground to
                      near-white, so missing fill = invisible text until selected. */}
                  <div className={`flex flex-col gap-1 ${isOwnGuest ? "items-end" : ""}`}>
                    {g.map((m) => (
                      <div key={m.id} className={`flex flex-col ${isOwnGuest ? "items-end" : ""}`}>
                        <div
                          data-message-role={isOwnGuest ? "me" : undefined}
                          className={bubblePendingClass(
                            m,
                            isOwnGuest
                              ? "msg-mine max-w-[min(80%,20rem)] rounded-2xl rounded-tr-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/20 chat-bubble-in"
                              : "max-w-[min(80%,20rem)] rounded-2xl rounded-tl-md border border-border bg-muted/40 px-3 py-2 text-xs leading-snug text-foreground/90",
                          )}
                          style={
                            isOwnGuest
                              ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                              : undefined
                          }
                        >
                          <div className="whitespace-pre-wrap break-words [color:inherit]">{renderText(m.text)}</div>
                        </div>
                        {isOwnGuest && (
                          <SendStatusBits m={m} onRetry={() => void retryGuestMessage(m)} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          if (isMe) {
            return (
              <div key={gi} className="group flex flex-row-reverse gap-2.5">
                <FrameAvatar user={author} size={28} />
                <div className="flex min-w-0 flex-1 flex-col items-end">
                  <div className="mb-1 flex items-center gap-1.5">

                    <Time ts={g[0].ts} />
                    <UserMenu userId={author.id} username={author.name}>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">

                        <CosmeticName userId={author.id} name={author.name} />
                        <NameAdornments user={author} />
                      </span>
                    </UserMenu>
                    <RankChip level={author.level} compact />
                  </div>
                  <div className="flex max-w-[80%] flex-col items-end gap-1">
                    {g.map(m => {
                      const replied = m.replyToId ? findMessage(m.replyToId) : null;
                      const isReplyTarget = replyingTo?.id === m.id;
                      return (
                        <div key={m.id} className="flex w-full flex-col items-end">
                          {replied && <ReplyPreview message={replied} align="right" />}
                          <div className="group/msg flex items-center gap-0.5 sm:gap-1">
                            <ReplyButton onClick={() => setReplyingTo(m)} />
                            <div
                              className={bubblePendingClass(
                                m,
                                m.kind === "me"
                                  ? `rounded-2xl bg-white/5 px-3 py-2 text-xs italic text-primary chat-bubble-in ${isReplyTarget ? "ring-2 ring-primary/50" : ""}`
                                  : `rounded-2xl rounded-tr-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/20 chat-bubble-in ${isReplyTarget ? "ring-2 ring-primary-foreground/40" : ""}`,
                              )}
                            >
                              <div className="whitespace-pre-wrap break-words">{renderText(applyMask(m.authorId, m.text))}</div>
                              {m.text && <MediaEmbed text={m.text} />}
                              {m.attachment && <AttachmentView a={m.attachment} />}
                            </div>
                          </div>
                          <SendStatusBits m={m} onRetry={() => retrySend(m.id)} />
                        </div>
                      );
                    })}
                  </div>
                  {g.some(m => m.id === lastSeenMeId) && (
                    <div className="mt-1 flex items-center gap-1 pr-1 text-[10px] font-medium text-primary/80">
                      <CheckCheck className="h-3 w-3" />
                      <span>Seen</span>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div key={gi} className="group flex gap-2.5">
              <FrameAvatar user={author} size={28} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-1.5">
                  <UserMenu userId={author.id} username={author.name}>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                      <CosmeticName userId={author.id} name={author.name} />
                      <NameAdornments user={author} />
                    </span>
                  </UserMenu>
                  {author.isBot && (
                    <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-primary">
                      Bot
                    </span>
                  )}
                  {!author.isBot && author.level > 1 && <RankChip level={author.level} compact />}
                  <Time ts={g[0].ts} />
                </div>
                <div className="flex flex-col gap-1">
                  {g.map(m => {
                    const replied = m.replyToId ? findMessage(m.replyToId) : null;
                    const isReplyTarget = replyingTo?.id === m.id;
                    return (
                      <div key={m.id} className="flex flex-col">
                        {replied && <ReplyPreview message={replied} />}
                        <div className="group/msg flex items-center gap-0.5 sm:gap-1">
                          <div
                            className={
                              m.kind === "me"
                                ? `rounded-2xl bg-white/5 px-3 py-2 text-xs italic text-primary chat-bubble-in ${isReplyTarget ? "ring-2 ring-primary/50" : ""}`
                                : `max-w-[min(80%,20rem)] rounded-2xl rounded-tl-md border border-border bg-card/70 px-3 py-2 text-xs leading-snug text-foreground/90 shadow-sm backdrop-blur-sm chat-bubble-in ${isReplyTarget ? "ring-2 ring-primary/40" : ""}`
                            }
                          >
                            <div className="whitespace-pre-wrap break-words">{renderText(applyMask(m.authorId, m.text))}</div>
                            {m.text && <MediaEmbed text={m.text} />}
                            {m.attachment && <AttachmentView a={m.attachment} />}
                          </div>
                          <ReplyButton onClick={() => setReplyingTo(m)} />
                          <HighlightButton messageId={m.id} channelId={state.activeChannel} />
                          <StaffActionsMenu targetUserId={author.id} targetName={author.name} isBot={author.isBot} messageId={m.id} size="xs" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </div>
  );
}
