import { useEffect, useRef } from "react";
import { Loader2, MessageSquareDashed } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ircConnectionLabel, useIrcChatState, type IrcChatMessage } from "@/lib/irc-chat";
import { nickAvatarHue, nickInitial } from "./irc-chat-ui";

type IrcMessageListProps = {
  messages: IrcChatMessage[];
  selfNick: string | null;
  className?: string;
};

function MessageRow({
  msg,
  own,
}: {
  msg: IrcChatMessage;
  own: boolean;
}) {
  const hue = nickAvatarHue(msg.nick);

  return (
    <div className={cn("flex gap-2.5", own ? "flex-row-reverse" : "flex-row")}>
      {!own ? (
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm"
          style={{ backgroundColor: `hsl(${hue} 58% 48%)` }}
          aria-hidden
        >
          {nickInitial(msg.nick)}
        </div>
      ) : null}
      <div className={cn("max-w-[min(85%,28rem)]", own ? "items-end" : "items-start")}>
        {!own ? (
          <p className="mb-1 px-1 text-[11px] font-semibold text-muted-foreground">{msg.nick}</p>
        ) : null}
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
            own
              ? "rounded-br-md bg-primary text-primary-foreground"
              : "rounded-bl-md border border-border/60 bg-card text-foreground",
          )}
        >
          <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
          {msg.pending ? (
            <p className={cn("mt-1 text-[10px]", own ? "text-primary-foreground/70" : "text-muted-foreground")}>
              Sending…
            </p>
          ) : null}
          {msg.failed ? (
            <p className="mt-1 text-[10px] text-destructive">Failed to send</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function IrcMessageList({ messages, selfNick, className }: IrcMessageListProps) {
  const state = useIrcChatState();
  const bottomRef = useRef<HTMLDivElement>(null);
  const hadAuthRef = useRef(false);
  if (state.status === "authenticated") hadAuthRef.current = true;

  const connectionLabel = ircConnectionLabel(state.status, hadAuthRef.current);
  const connecting = connectionLabel === "Connecting" || connectionLabel === "Reconnecting";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, messages[messages.length - 1]?.id]);

  return (
    <ScrollArea className={cn("min-h-0 flex-1 bg-muted/20", className)}>
      <div className="space-y-4 px-4 py-4">
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
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <MessageSquareDashed className="h-8 w-8 text-muted-foreground/70" aria-hidden />
            <p className="text-sm font-medium text-foreground">No messages yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              {connectionLabel === "Connected"
                ? "Be the first to say hello in this room."
                : "Waiting for IRC connection before you can chat."}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const own = Boolean(selfNick && msg.nick.toLowerCase() === selfNick.toLowerCase());
            return <MessageRow key={msg.id} msg={msg} own={own} />;
          })
        )}
        <div ref={bottomRef} aria-hidden className="h-px" />
      </div>
    </ScrollArea>
  );
}
