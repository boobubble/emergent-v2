import { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "./Avatar";
import { FrameAvatar, CosmeticName, RankChip } from "@/components/cosmetics/CosmeticBits";
import { UserMenu } from "./UserMenu";
import { StaffActionsMenu } from "./StaffActionsMenu";
import type { Message, Attachment } from "@/lib/chat-types";
import { Download, Reply, CornerDownRight, CheckCheck } from "lucide-react";
import { NameEmojiBadge, NameAdornments } from "@/lib/name-emoji";
import { EmojiEffectLayer } from "./EmojiEffectLayer";
import { HighlightButton } from "./HighlightButton";
import { useIgnore } from "@/lib/ignore-store";
import { linkify } from "@/lib/linkify";
import { MediaEmbed } from "./MediaEmbed";
import { VoiceNoteBubble } from "./VoiceNoteBubble";

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
  const lines = text.split("\n");
  lines.forEach((line, li) => {
    const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
    tokens.forEach((t, i) => {
      if (/^\*\*.+\*\*$/.test(t))
        parts.push(<strong key={`${li}-${i}`} className="font-semibold text-foreground">{linkify(t.slice(2, -2), `${li}-${i}`)}</strong>);
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
    <div className={`mb-1 flex max-w-[80%] items-center gap-1.5 rounded-lg border-l-2 border-primary/60 bg-white/5 px-2 py-1 text-[11px] ${align === "right" ? "self-end" : ""}`}>
      <CornerDownRight className="h-3 w-3 shrink-0 text-primary/70" />
      <span className="font-semibold text-primary/90">{author?.name || "Unknown"}</span>
      <span className="truncate text-muted-foreground">
        {message.text || (message.attachment ? `📎 ${message.attachment.name}` : "(message)")}
      </span>
    </div>
  );
}

export function MessageList({ channelId }: { channelId: string }) {
  const { channelMessages, state, setReplyingTo, findMessage, isDM, dmPeerReadAt } = useChat();
  const { isIgnored } = useIgnore();
  const allMsgs = channelMessages(channelId);
  const msgs = useMemo(
    () => allMsgs.filter(m => {
      const u = state.users[m.authorId];
      if (!u || m.authorId === "me") return true;
      return !isIgnored(m.authorId, u.isBot);
    }),
    [allMsgs, state.users, isIgnored],
  );
  const peerReadAt = isDM(channelId) ? dmPeerReadAt(channelId) : 0;
  const lastSeenMeId = useMemo(() => {
    let lastMeIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].authorId === "me") { lastMeIdx = i; break; }
    }
    if (lastMeIdx === -1) return null;
    if (isDM(channelId)) {
      // Real read receipt: show "Seen" only if peer's last_read_at >= my message ts
      return peerReadAt && msgs[lastMeIdx].ts <= peerReadAt ? msgs[lastMeIdx].id : null;
    }
    const hasLaterHuman = msgs.slice(lastMeIdx + 1).some(m => {
      if (m.authorId === "me") return false;
      const u = state.users[m.authorId];
      return u && !u.isBot;
    });
    return hasLaterHuman ? msgs[lastMeIdx].id : null;
  }, [msgs, state.users, isDM, channelId, peerReadAt]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs.length, channelId]);

  const groups: Message[][] = [];
  msgs.forEach(m => {
    const last = groups[groups.length - 1];
    if (
      last &&
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
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 text-xs md:text-[15px]">
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
      <div className="space-y-2">
        {groups.map((g, gi) => {
          const author = state.users[g[0].authorId];
          if (!author) return null;
          const isMe = author.id === "me";

          if (isMe) {
            return (
              <div key={gi} className="group flex flex-row-reverse gap-2">
                <FrameAvatar user={author} size={28} />
                <div className="flex min-w-0 flex-1 flex-col items-end">
                  <div className="mb-0.5 flex items-center gap-1.5">

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
                      return (
                        <div key={m.id} className="flex w-full flex-col items-end">
                          {replied && <ReplyPreview message={replied} align="right" />}
                          <div className="group/msg flex items-center gap-1">
                            <button
                              onClick={() => setReplyingTo(m)}
                              className="opacity-0 transition-opacity hover:text-primary group-hover/msg:opacity-100"
                              title="Reply"
                              aria-label="Reply"
                            >
                              <Reply className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                            <div
                              className={
                                m.kind === "me"
                                  ? "rounded-2xl bg-white/5 px-3 py-1.5 text-xs italic text-primary chat-bubble-in"
                                  : "rounded-2xl rounded-tr-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/20 chat-bubble-in"
                              }
                            >
                              <div className="whitespace-pre-wrap break-words">{renderText(m.text)}</div>
                              {m.text && <MediaEmbed text={m.text} />}
                              {m.attachment && <AttachmentView a={m.attachment} />}
                            </div>
                          </div>
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
            <div key={gi} className="group flex gap-2">
              <FrameAvatar user={author} size={28} />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-1.5">
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
                    return (
                      <div key={m.id} className="flex flex-col">
                        {replied && <ReplyPreview message={replied} />}
                        <div className="group/msg flex items-center gap-1">
                          <div
                            className={
                              m.kind === "me"
                                ? "rounded-2xl bg-white/5 px-3 py-1.5 text-xs italic text-primary chat-bubble-in"
                                : "max-w-[80%] rounded-2xl rounded-tl-md border border-border bg-card/70 backdrop-blur-sm px-3 py-1.5 text-xs leading-snug text-foreground/90 shadow-sm chat-bubble-in"
                            }
                          >
                            <div className="whitespace-pre-wrap break-words">{renderText(m.text)}</div>
                            {m.text && <MediaEmbed text={m.text} />}
                            {m.attachment && <AttachmentView a={m.attachment} />}
                          </div>
                          <button
                            onClick={() => setReplyingTo(m)}
                            className="opacity-0 transition-opacity hover:text-primary group-hover/msg:opacity-100"
                            title="Reply"
                            aria-label="Reply"
                          >
                            <Reply className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
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
