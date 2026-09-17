import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import type { IrcActiveView } from "./irc-chat-types";
import { dmComposerPlaceholder, roomComposerPlaceholder } from "./irc-chat-ui";

type IrcMessageComposerProps = {
  onSend: (text: string) => void;
  view: IrcActiveView;
  className?: string;
};

export function IrcMessageComposer({ onSend, view, className }: IrcMessageComposerProps) {
  const state = useIrcChatState();
  const [draft, setDraft] = useState("");
  const connected = state.status === "authenticated";

  const roomName =
    view.kind === "room"
      ? (state.rooms[view.roomId]?.name ?? view.roomId)
      : null;

  const placeholder = connected
    ? view.kind === "room" && roomName
      ? roomComposerPlaceholder(roomName)
      : view.kind === "dm"
        ? dmComposerPlaceholder(view.peerNick)
        : "Write a message…"
    : "Disconnected — reconnecting…";

  function submit() {
    const text = draft.trim();
    if (!text || !connected) return;
    onSend(text);
    setDraft("");
  }

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border/60 bg-background px-3 py-2.5 shadow-[0_-4px_24px_-8px_hsl(var(--foreground)/0.06)] sm:px-4",
        "pb-[max(0.625rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <form
        className="mx-auto flex max-w-3xl items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            disabled={!connected}
            maxLength={2000}
            rows={1}
            className={cn(
              "min-h-[42px] max-h-36 w-full resize-y rounded-xl border-border/70 bg-muted/30 py-2.5 pl-3 pr-3 text-sm shadow-sm",
              "transition-shadow focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/25",
              !connected && "opacity-60",
            )}
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!connected || !draft.trim()}
          className="h-[42px] w-[42px] shrink-0 rounded-xl shadow-sm disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
