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
        "irc-composer-shell chat-composer-footer shrink-0 px-3 py-2.5 sm:px-4 sm:py-3",
        className,
      )}
    >
      <form
        data-irc-chat-composer=""
        data-irc-chat-composer-kind={composerKind}
        className="chat-composer-root irc-composer-bar mx-auto flex max-w-3xl items-end gap-2 p-1.5"
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
            "chat-composer-input min-h-[40px] max-h-32 min-w-0 flex-1 resize-none rounded-md border-0 bg-transparent py-2 pl-2.5 pr-2 text-sm shadow-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            !connected && "opacity-60",
          )}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!connected || !draft.trim()}
          variant="secondary"
          className="irc-composer-send chat-composer-send h-9 w-9 shrink-0 disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
