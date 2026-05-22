import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { Send, Smile, Sparkles, Paperclip, X, Reply } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import type { Attachment } from "@/lib/chat-types";

const COMMANDS = [
  "!help", "!roll", "!flip", "!slots", "!fish", "!dig",
  "!trivia", "!a", "!hangman", "!g", "!blackjack", "!me", "!stats",
];
const EMOJIS = ["😀","😂","😎","🥳","👍","❤️","🔥","🎲","🎰","🏆","👀","🪙","💀","🎉"];
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

export function MessageInput() {
  const { send, state, replyingTo, setReplyingTo } = useChat();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [attachError, setAttachError] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const suggestions = text.startsWith("!")
    ? COMMANDS.filter(c => c.startsWith(text.split(" ")[0])).slice(0, 5)
    : [];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + "px";
    }
  }, [text]);

  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  function submit() {
    if (!text.trim() && !attachment) return;
    send(text, { attachment: attachment || undefined, replyToId: replyingTo?.id });
    setText("");
    setAttachment(null);
    setAttachError("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape" && replyingTo) {
      e.preventDefault();
      setReplyingTo(null);
    }
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAttachError("");
    if (file.size > MAX_ATTACHMENT_BYTES) {
      setAttachError(`Max ${(MAX_ATTACHMENT_BYTES / 1024 / 1024).toFixed(0)}MB`);
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = () => reject(r.error);
        r.readAsDataURL(file);
      });
      setAttachment({
        kind: file.type.startsWith("image/") ? "image" : "file",
        name: file.name.slice(0, 120),
        mime: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
      });
    } catch {
      setAttachError("Couldn't read file");
    }
  }

  const replyAuthor = replyingTo ? state.users[replyingTo.authorId] : null;

  return (
    <div className="px-6 pb-6 pt-2">
      {replyingTo && (
        <div className="mb-2 flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs">
          <Reply className="h-3.5 w-3.5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-primary">Replying to {replyAuthor?.name || "user"}</div>
            <div className="truncate text-muted-foreground">
              {replyingTo.text || (replyingTo.attachment ? `📎 ${replyingTo.attachment.name}` : "(message)")}
            </div>
          </div>
          <button onClick={() => setReplyingTo(null)} className="shrink-0 text-muted-foreground hover:text-destructive" aria-label="Cancel reply">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {suggestions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {suggestions.map(c => (
            <button key={c} onClick={() => setText(c + " ")} className="rounded-full bg-white/5 px-3 py-1 font-mono text-xs text-primary transition-colors hover:bg-white/10">
              {c}
            </button>
          ))}
        </div>
      )}
      {showEmoji && (
        <div className="mb-2 flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-2">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => { setText(t => t + e); setShowEmoji(false); inputRef.current?.focus(); }} className="rounded-lg p-1 text-xl transition-colors hover:bg-white/5">
              {e}
            </button>
          ))}
        </div>
      )}
      {attachment && (
        <div className="mb-2 flex items-center gap-2 rounded-2xl border border-border bg-white/5 px-3 py-2">
          {attachment.kind === "image" ? (
            <img src={attachment.dataUrl} alt={attachment.name} className="h-12 w-12 rounded-lg object-cover" />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-white/5 text-xl">📎</div>
          )}
          <div className="min-w-0 flex-1 text-xs">
            <div className="truncate font-medium">{attachment.name}</div>
            <div className="text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</div>
          </div>
          <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-destructive" aria-label="Remove attachment">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {attachError && <div className="mb-2 px-3 text-xs text-destructive">{attachError}</div>}
      <div className="group relative flex items-end gap-1 rounded-3xl border border-border bg-white/5 py-2 pl-4 pr-2 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30">
        <input ref={fileRef} type="file" onChange={onFile} className="hidden" accept="image/*,application/pdf,text/plain,.zip,.doc,.docx" />
        <button onClick={() => fileRef.current?.click()} className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-primary" title="Attach file">
          <Paperclip className="h-5 w-5" />
        </button>
        <button onClick={() => setText(t => t + (t.endsWith(" ") || !t ? "!" : " !"))} className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-primary" title="Command">
          <Sparkles className="h-5 w-5" />
        </button>
        <textarea ref={inputRef} value={text} onChange={e => setText(e.target.value)} onKeyDown={onKey} rows={1} placeholder={replyingTo ? "Write your reply…" : "Message — try !help"} className="max-h-[140px] flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/70" />
        <button onClick={() => setShowEmoji(s => !s)} className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground">
          <Smile className="h-5 w-5" />
        </button>
        <button onClick={submit} disabled={!text.trim() && !attachment} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
