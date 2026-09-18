import { useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import type { IrcActiveView } from "./irc-chat-types";
import { dmComposerPlaceholder, roomComposerPlaceholder } from "./irc-chat-ui";
import "./irc-message-input.css";

type IrcMessageComposerProps = {
  onSend: (text: string) => void;
  view: IrcActiveView;
  shell?: "embedded" | "footer";
  className?: string;
};

export function IrcMessageComposer({
  onSend,
  view,
  shell = "embedded",
  className,
}: IrcMessageComposerProps) {
  const state = useIrcChatState();
  const [draft, setDraft] = useState("");
  const connected = state.status === "authenticated";

  const roomName =
    view.kind === "room"
      ? (state.rooms[view.roomId]?.name ?? view.roomId)
      : null;

  const composerKind = view.kind === "dm" ? "dm" : "room";
  const compact = view.kind === "dm";

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

  const bar = (
    <div
      className={cn(
        "chat-composer-glow chat-composer-bar group relative flex min-w-0 items-end gap-0.5 rounded-3xl border border-border bg-card/60 pb-0 pt-2 pr-1 shadow-sm backdrop-blur-md transition-[border-color,box-shadow]",
        compact
          ? "pl-1 sm:gap-0.5 sm:pl-2 sm:pr-1"
          : "pl-2 sm:gap-1 sm:pl-4 sm:pr-2",
      )}
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
          "chat-composer-input max-h-[140px] min-h-11 min-w-0 flex-1 resize-none border-0 bg-transparent py-2.5 text-base leading-6 text-foreground shadow-none outline-none placeholder:truncate placeholder:whitespace-nowrap placeholder:text-muted-foreground/70 sm:py-1.5 sm:text-sm",
          "focus-visible:ring-0 focus-visible:ring-offset-0",
          !connected && "opacity-60",
        )}
      />
      <button
        type="submit"
        disabled={!connected || !draft.trim()}
        className="chat-composer-send mb-1 grid h-11 w-11 shrink-0 touch-manipulation place-items-center rounded-full text-primary-foreground shadow-lg transition-[transform,opacity] duration-75 ease-out hover:scale-105 active:scale-[0.94] active:opacity-90 disabled:pointer-events-none disabled:opacity-40 disabled:active:scale-100"
        style={{
          background: "var(--gradient-primary)",
          boxShadow: "0 8px 24px -8px var(--primary-glow)",
        }}
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );

  const form = (
    <form
      data-irc-chat-composer=""
      data-irc-chat-composer-kind={composerKind}
      className={cn(
        "chat-composer-root min-w-0",
        compact
          ? "overflow-x-auto px-1.5 py-1"
          : "overflow-x-auto px-2 py-1 sm:px-6 sm:py-0",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {bar}
    </form>
  );

  if (shell === "footer") {
    return form;
  }

  return (
    <div className="chat-composer-footer shrink-0 border-t border-border/60 bg-background/95 px-0 py-0 backdrop-blur-md">
      {form}
    </div>
  );
}
