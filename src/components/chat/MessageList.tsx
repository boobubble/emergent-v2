import { useEffect, useRef } from "react";
import { useChat } from "@/lib/chat-store";
import { Avatar } from "./Avatar";
import type { Message } from "@/lib/chat-types";

function formatTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Light markdown: **bold** and `code` and \n
function renderText(text: string) {
  const parts: React.ReactNode[] = [];
  const lines = text.split("\n");
  lines.forEach((line, li) => {
    const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g);
    tokens.forEach((t, i) => {
      if (/^\*\*.+\*\*$/.test(t)) parts.push(<strong key={`${li}-${i}`} className="font-semibold text-accent">{t.slice(2,-2)}</strong>);
      else if (/^`.+`$/.test(t)) parts.push(<code key={`${li}-${i}`} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-accent">{t.slice(1,-1)}</code>);
      else if (/^_.+_$/.test(t)) parts.push(<em key={`${li}-${i}`} className="text-muted-foreground">{t.slice(1,-1)}</em>);
      else parts.push(<span key={`${li}-${i}`}>{t}</span>);
    });
    if (li < lines.length - 1) parts.push(<br key={`br-${li}`} />);
  });
  return parts;
}

export function MessageList({ channelId }: { channelId: string }) {
  const { channelMessages, state } = useChat();
  const msgs = channelMessages(channelId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length, channelId]);

  // Group consecutive messages by author
  const groups: Message[][] = [];
  msgs.forEach(m => {
    const last = groups[groups.length - 1];
    if (last && last[0].authorId === m.authorId && m.ts - last[last.length-1].ts < 5 * 60_000) last.push(m);
    else groups.push([m]);
  });

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
      {groups.length === 0 && (
        <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
          <div>
            <div className="mb-2 text-4xl">💬</div>
            <p>No messages yet. Say hi or type <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-accent">!help</code></p>
          </div>
        </div>
      )}
      {groups.map((g, gi) => {
        const author = state.users[g[0].authorId];
        if (!author) return null;
        const isMe = author.id === "me";
        return (
          <div key={gi} className="group mb-3 flex gap-3">
            <Avatar user={author} size={36} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className={`text-sm font-semibold ${isMe ? "text-primary" : author.isBot ? "text-accent" : ""}`}>
                  {author.name}
                </span>
                {author.isBot && <span className="rounded bg-accent/20 px-1 text-[10px] font-bold uppercase text-accent">Bot</span>}
                <span className="text-xs text-muted-foreground">{formatTime(g[0].ts)}</span>
              </div>
              {g.map(m => (
                <div
                  key={m.id}
                  className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${m.kind === "me" ? "italic text-accent" : ""}`}
                >
                  {renderText(m.text)}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}