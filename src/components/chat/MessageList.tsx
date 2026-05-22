import { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "./Avatar";
import { UserMenu } from "./UserMenu";
import type { Message, Attachment } from "@/lib/chat-types";
import { Download, Reply, CornerDownRight, CheckCheck, X } from "lucide-react";

function AttachmentView({ a }: { a: Attachment }) {
  const [preview, setPreview] = useState(false);
  if (a.kind === "image") {
    return (
      <>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className="mt-1 block max-w-[280px] overflow-hidden rounded-xl border border-border cursor-zoom-in"
        >
          <img src={a.dataUrl} alt={a.name} className="block max-h-72 w-full object-contain bg-black/30" />
        </button>
        {preview && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in"
            onClick={() => setPreview(false)}
          >
            <button
              onClick={() => setPreview(false)}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close preview"
            >
              <X className="h-5 w-5" />
            </button>
            <a
              href={a.dataUrl}
              download={a.name}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-16 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Download image"
            >
              <Download className="h-5 w-5" />
            </a>
            <img
              src={a.dataUrl}
              alt={a.name}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain shadow-2xl"
            />
          </div>
        )}
      </>
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
        parts.push(<strong key={`${li}-${i}`} className="font-semibold text-foreground">{t.slice(2, -2)}</strong>);
      else if (/^`.+`$/.test(t))
        parts.push(<code key={`${li}-${i}`} className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-primary">{t.slice(1, -1)}</code>);
      else if (/^_.+_$/.test(t))
        parts.push(<em key={`${li}-${i}`} className="text-muted-foreground">{t.slice(1, -1)}</em>);
      else parts.push(<span key={`${li}-${i}`}>{t}</span>);
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
  const { channelMessages, state, setReplyingTo, findMessage } = useChat();
  const msgs = channelMessages(channelId);
  const lastSeenMeId = useMemo(() => {
    let lastMeIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].authorId === "me") { lastMeIdx = i; break; }
    }
    if (lastMeIdx === -1) return null;
    const hasLaterOther = msgs.slice(lastMeIdx + 1).some(m => m.authorId !== "me");
    return hasLaterOther ? msgs[lastMeIdx].id : null;
  }, [msgs]);
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
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
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
      <div className="space-y-5">
        {groups.map((g, gi) => {
          const author = state.users[g[0].authorId];
          if (!author) return null;
          const isMe = author.id === "me";

          if (isMe) {
            return (
              <div key={gi} className="group flex flex-row-reverse gap-3">
                <Avatar user={author} size={36} />
                <div className="flex min-w-0 flex-1 flex-col items-end">
                  <div className="mb-1 flex items-center gap-2">
                    <Time ts={g[0].ts} />
                    <UserMenu userId={author.id} username={author.name}>
                      <span className="text-sm font-bold text-foreground">{author.name}</span>
                    </UserMenu>
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
                                  ? "rounded-2xl bg-white/5 px-4 py-2.5 text-sm italic text-primary"
                                  : "rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_4px_15px_var(--primary-glow)]"
                              }
                            >
                              <div className="whitespace-pre-wrap break-words">{renderText(m.text)}</div>
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
            <div key={gi} className="group flex gap-3">
              <Avatar user={author} size={36} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <UserMenu userId={author.id} username={author.name}>
                    <span className="text-sm font-bold text-foreground">{author.name}</span>
                  </UserMenu>
                  {author.isBot && (
                    <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-primary">
                      Bot
                    </span>
                  )}
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
                                ? "rounded-2xl bg-white/5 px-4 py-2.5 text-sm italic text-primary"
                                : "max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-white/5 px-4 py-2.5 text-sm leading-relaxed text-foreground/90"
                            }
                          >
                            <div className="whitespace-pre-wrap break-words">{renderText(m.text)}</div>
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
  );
}
