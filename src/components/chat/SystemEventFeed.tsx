import { useEffect, useRef } from "react";
import { useChat } from "@/lib/chat-store";

/**
 * A stripped-down message list that only shows system-generated events for
 * a game room. No composer, no user messages, no reactions.
 */
export function SystemEventFeed({ channelId }: { channelId: string }) {
  const { channelMessages } = useChat();
  const msgs = channelMessages(channelId).filter(m => m.kind === "system");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [msgs.length]);

  return (
    <div
      ref={ref}
      className="flex max-h-40 min-h-[6rem] shrink-0 flex-col gap-1 overflow-y-auto border-t border-border bg-card/40 px-3 py-2 text-[12px] text-muted-foreground backdrop-blur sm:max-h-52"
    >
      {msgs.length === 0 ? (
        <div className="py-4 text-center text-[11px] italic opacity-70">
          Play the game — events will appear here.
        </div>
      ) : (
        msgs.slice(-40).map(m => (
          <div key={m.id} className="rounded-lg bg-background/60 px-2.5 py-1 leading-snug">
            <span className="mr-1.5 text-[10px] tabular-nums opacity-60">
              {new Date(m.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {m.text}
          </div>
        ))
      )}
    </div>
  );
}
