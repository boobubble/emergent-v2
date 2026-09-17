import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import type { IrcActiveView } from "./irc-chat-types";
import { dmComposerPlaceholder, roomComposerPlaceholder } from "./irc-chat-ui";
import "./irc-message-input.css";

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

  const composerKind = view.kind === "dm" ? "dm" : "room";

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
        "chat-composer-footer shrink-0 border-t border-border/50 px-3 py-2 sm:px-4",
        className,
      )}
    >
      <form
        data-irc-chat-composer=""
        data-irc-chat-composer-kind={composerKind}
        className={cn(
          "chat-composer-root mx-auto flex max-w-4xl items-end gap-2",
          "chat-composer-glow rounded-2xl border border-border/60 bg-background/90 p-1.5 shadow-sm backdrop-blur-sm",
        )}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
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
            "chat-composer-input min-h-[42px] max-h-36 min-w-0 flex-1 resize-y rounded-xl border-0 bg-muted/25 py-2.5 pl-3 pr-3 text-sm shadow-none",
            "focus-visible:bg-background focus-visible:ring-0",
            !connected && "opacity-60",
          )}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!connected || !draft.trim()}
          className="chat-composer-send h-[42px] w-[42px] shrink-0 rounded-xl shadow-sm disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
