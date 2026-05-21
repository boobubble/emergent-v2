import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Send, Smile, Sparkles } from "lucide-react";
import { useChat } from "@/lib/chat-store";

const COMMANDS = ["!help", "!roll", "!flip", "!8ball", "!slots", "!fish", "!trivia", "!a", "!hangman", "!g", "!blackjack", "!me", "!stats"];
const EMOJIS = ["😀","😂","😎","🥳","👍","❤️","🔥","🎲","🎰","🏆","👀","🪙","💀","🎉"];

export function MessageInput() {
  const { send } = useChat();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = text.startsWith("!")
    ? COMMANDS.filter(c => c.startsWith(text.split(" ")[0])).slice(0, 5)
    : [];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + "px";
    }
  }, [text]);

  function submit() {
    if (!text.trim()) return;
    send(text);
    setText("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-border bg-card p-3">
      {suggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {suggestions.map(c => (
            <button
              key={c}
              onClick={() => setText(c + " ")}
              className="rounded bg-muted px-2 py-1 font-mono text-xs text-accent hover:bg-secondary"
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {showEmoji && (
        <div className="mb-2 flex flex-wrap gap-1 rounded-md border border-border bg-background p-2">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => { setText(t => t + e); setShowEmoji(false); inputRef.current?.focus(); }}
              className="rounded p-1 text-xl hover:bg-muted"
            >{e}</button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-lg border border-border bg-input px-3 py-2 focus-within:ring-1 focus-within:ring-ring">
        <button
          onClick={() => setText(t => t + (t.endsWith(" ") || !t ? "!" : " !"))}
          className="mb-1 text-muted-foreground hover:text-accent"
          title="Command"
        >
          <Sparkles className="h-4 w-4" />
        </button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder="Message — try !help"
          className="max-h-[140px] flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={() => setShowEmoji(s => !s)}
          className="mb-1 text-muted-foreground hover:text-foreground"
        >
          <Smile className="h-4 w-4" />
        </button>
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="grid h-8 w-8 place-items-center rounded-md text-primary-foreground transition-opacity disabled:opacity-40"
          style={{ background: "var(--gradient-accent)" }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}