import { useEffect, useRef, useState } from "react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "./Avatar";
import { UserMenu } from "./UserMenu";
import type { Message, Attachment } from "@/lib/chat-types";
import { Download } from "lucide-react";

function AttachmentView({ a }: { a: Attachment }) {
  if (a.kind === "image") {
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

// Light markdown: **bold**, `code`, _italic_
function renderText(text: string) {
  const parts: React.ReactNode[] = [];
  const lines = text.split("\n");
  lines.forEach((line, li) => {
    const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
    tokens.forEach((t, i) => {
      if (/^\*\*.+\*\*$/.test(t))
        parts.push(
          <strong key={`${li}-${i}`} className="font-semibold text-foreground">
            {t.slice(2, -2)}
          </strong>,
        );
      else if (/^`.+`$/.test(t))
        parts.push(
          <code
            key={`${li}-${i}`}
            className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-primary"
          >
            {t.slice(1, -1)}
          </code>,
        );
      else if (/^_.+_$/.test(t))
        parts.push(
          <em key={`${li}-${i}`} className="text-muted-foreground">
            {t.slice(1, -1)}
          </em>,
        );
      else parts.push(<span key={`${li}-${i}`}>{t}</span>);
    });
    if (li < lines.length - 1) parts.push(<br key={`br-${li}`} />);
  });
  return parts;
}

// Avoid SSR/client hydration mismatch on locale time formatting.
function Time({ ts }: { ts: number }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span className="text-[10px] text-muted-foreground/70" suppressHydrationWarning>
      {mounted ? formatTime(ts) : ""}
    </span>
  );
}

export function MessageList({ channelId }: { channelId: string }) {
  const { channelMessages, state } = useChat();
  const msgs = channelMessages(channelId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [msgs.length, channelId]);

  // Group consecutive messages by author within 5 minutes
  const groups: Message[][] = [];
  msgs.forEach(m => {
    const last = groups[groups.length - 1];
    if (
      last &&
      last[0].authorId === m.authorId &&
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
              <code className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-xs text-primary">
                !help
              </code>
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
            // Right-aligned own messages
            return (
              <div key={gi} className="flex flex-row-reverse gap-3">
                <Avatar user={author} size={36} />
                <div className="flex min-w-0 flex-1 flex-col items-end">
                  <div className="mb-1 flex items-center gap-2">
                    <Time ts={g[0].ts} />
                    <Link to="/u/$username" params={{ username: author.name }} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-foreground hover:text-primary hover:underline">{author.name}</Link>
                  </div>
                  <div className="flex max-w-[80%] flex-col items-end gap-1">
                    {g.map(m => (
                      <div
                        key={m.id}
                        className={
                          m.kind === "me"
                            ? "rounded-2xl bg-white/5 px-4 py-2.5 text-sm italic text-primary"
                            : "rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[0_4px_15px_var(--primary-glow)]"
                        }
                      >
                        <div className="whitespace-pre-wrap break-words">{renderText(m.text)}</div>
                        {m.attachment && <AttachmentView a={m.attachment} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={gi} className="group flex gap-3">
              <Avatar user={author} size={36} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Link
                    to="/u/$username"
                    params={{ username: author.name }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm font-bold text-foreground hover:text-primary hover:underline`}
                  >
                    {author.name}
                  </Link>
                  {author.isBot && (
                    <span className="rounded-md bg-primary/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tight text-primary">
                      Bot
                    </span>
                  )}
                  <Time ts={g[0].ts} />
                </div>
                <div className="flex flex-col gap-1">
                  {g.map(m => (
                    <div
                      key={m.id}
                      className={
                        m.kind === "me"
                          ? "rounded-2xl bg-white/5 px-4 py-2.5 text-sm italic text-primary"
                          : "max-w-[80%] rounded-2xl rounded-tl-sm border border-border bg-white/5 px-4 py-2.5 text-sm leading-relaxed text-foreground/90"
                      }
                    >
                      <div className="whitespace-pre-wrap break-words">{renderText(m.text)}</div>
                      {m.attachment && <AttachmentView a={m.attachment} />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
