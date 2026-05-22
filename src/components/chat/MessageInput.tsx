import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { Send, Smile, Sparkles } from "lucide-react";
import { useChat } from "@/lib/chat-store";

const COMMANDS = [
  "!help", "!roll", "!flip", "!slots", "!fish", "!dig",
  "!trivia", "!a", "!hangman", "!g", "!blackjack", "!me", "!stats",
];
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
    <div className="px-6 pb-6 pt-2">
      {suggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {suggestions.map(c => (
            <button
              key={c}
              onClick={() => setText(c + " ")}
              className="rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-primary transition-colors hover:bg-white/10"
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {showEmoji && (
        <div className="mb-2 flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-2">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => {
                setText(t => t + e);
                setShowEmoji(false);
                inputRef.current?.focus();
              }}
              className="rounded-lg p-1 text-xl transition-colors hover:bg-white/5"
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <div className="group relative flex items-end gap-1 rounded-3xl border border-border bg-white/5 py-2 pl-4 pr-2 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30">
        <button
          onClick={() => setText(t => t + (t.endsWith(" ") || !t ? "!" : " !"))}
          className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-primary"
          title="Command"
        >
          <Sparkles className="h-5 w-5" />
        </button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={onKey}
          rows={1}
          placeholder="Message — try !help"
          className="max-h-[140px] flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        <button
          onClick={() => setShowEmoji(s => !s)}
          className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Smile className="h-5 w-5" />
        </button>
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
