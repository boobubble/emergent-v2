import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";

type IrcMessageComposerProps = {
  onSend: (text: string) => void;
  className?: string;
};

export function IrcMessageComposer({ onSend, className }: IrcMessageComposerProps) {
  const state = useIrcChatState();
  const [draft, setDraft] = useState("");
  const connected = state.status === "authenticated";

  function submit() {
    const text = draft.trim();
    if (!text || !connected) return;
    onSend(text);
    setDraft("");
  }

  return (
    <div
      className={cn(
        "shrink-0 border-t border-border/80 bg-background/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={connected ? "Write a message…" : "Disconnected — reconnecting…"}
          disabled={!connected}
          maxLength={2000}
          className="h-11 flex-1 rounded-xl border-border/80 bg-card shadow-sm"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!connected || !draft.trim()}
          className="h-11 w-11 shrink-0 rounded-xl shadow-sm"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
