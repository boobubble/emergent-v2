import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { Send, Smile, Sparkles, Paperclip, X, Reply, Sticker, Youtube, ImagePlay } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { useTyping } from "@/lib/use-typing";
import { EmojiPicker } from "./EmojiPicker";
import { AnimatedEmojiPicker, gifUrlForSticker } from "./AnimatedEmojiPicker";
import { GiphyPicker } from "./GiphyPicker";
import { YoutubePicker } from "./YoutubePicker";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaConfig } from "@/lib/media-providers-config";
import { earnChatMessage } from "@/lib/economy.functions";
import type { Attachment } from "@/lib/chat-types";

const COMMANDS = [
  "!help", "!roll", "!flip", "!slots", "!fish", "!dig",
  "!trivia", "!a", "!hangman", "!g", "!me", "!stats",
];
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

export function MessageInput() {
  const { send, state, replyingTo, setReplyingTo } = useChat();
  const { user } = useAuth();
  const me = user && !user.isGuest ? { id: user.id, name: user.username } : null;
  const { typers, sendTyping } = useTyping(state.activeChannel, me, !!me);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const { raw: appRaw } = useAppSettings();
  const media = mergeMediaConfig((appRaw as any).media);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [attachError, setAttachError] = useState("");
  const [caret, setCaret] = useState(0);
  const [mentionIdx, setMentionIdx] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const suggestions = text.startsWith("!")
    ? COMMANDS.filter(c => c.startsWith(text.split(" ")[0])).slice(0, 5)
    : [];

  const mentionMatch = (() => {
    const before = text.slice(0, caret);
    const m = before.match(/(?:^|\s)@([\w-]*)$/);
    if (!m) return null;
    return { query: m[1].toLowerCase(), start: caret - m[1].length - 1 };
  })();
  const mentionSuggestions = mentionMatch
    ? Object.values(state.users)
        .filter(u => u.id !== "me" && u.name.toLowerCase().includes(mentionMatch.query))
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(mentionMatch.query) ? 0 : 1;
          const bStarts = b.name.toLowerCase().startsWith(mentionMatch.query) ? 0 : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;
          const aOn = a.status === "online" ? 0 : 1;
          const bOn = b.status === "online" ? 0 : 1;
          if (aOn !== bOn) return aOn - bOn;
          return a.name.localeCompare(b.name);
        })
        .slice(0, 6)
    : [];

  useEffect(() => { setMentionIdx(0); }, [mentionMatch?.query]);

  function applyMention(name: string) {
    if (!mentionMatch) return;
    const before = text.slice(0, mentionMatch.start);
    const after = text.slice(caret);
    const inserted = `@${name} `;
    const next = before + inserted + after;
    setText(next);
    const pos = (before + inserted).length;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(pos, pos);
      setCaret(pos);
    });
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 140) + "px";
    }
  }, [text]);

  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  useEffect(() => {
    function onMention(e: Event) {
      const ce = e as CustomEvent<{ name?: string }>;
      const name = ce.detail?.name;
      if (!name) return;
      setText(t => {
        const needsSpace = t.length > 0 && !t.endsWith(" ");
        return t + (needsSpace ? " " : "") + `@${name} `;
      });
      requestAnimationFrame(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        const pos = el.value.length;
        el.setSelectionRange(pos, pos);
        setCaret(pos);
      });
    }
    window.addEventListener("palrgo:mention", onMention);
    return () => window.removeEventListener("palrgo:mention", onMention);
  }, []);

  const earnChat = useServerFn(earnChatMessage);

  function submit() {
    if (!text.trim() && !attachment) return;
    send(text, { attachment: attachment || undefined, replyToId: replyingTo?.id });
    // Fire-and-forget earn call — server enforces cooldown + daily cap.
    if (me) {
      earnChat({ data: { channelId: state.activeChannel, isReply: !!replyingTo } }).catch(() => {});
    }
    setText("");
    setAttachment(null);
    setAttachError("");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIdx(i => (i + 1) % mentionSuggestions.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setMentionIdx(i => (i - 1 + mentionSuggestions.length) % mentionSuggestions.length); return; }
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        applyMention(mentionSuggestions[mentionIdx].name);
        return;
      }
      if (e.key === "Escape") { e.preventDefault(); setCaret(-1); return; }
    }
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

  const lobbyMuteUntil = state.moderation?.["lobby"]?.me?.mutedUntil;
  const isLobbyMuted = !!(lobbyMuteUntil && lobbyMuteUntil > Date.now() && state.activeChannel === "lobby");
  const muteSecsLeft = isLobbyMuted ? Math.ceil((lobbyMuteUntil! - Date.now()) / 1000) : 0;
  const muteLabel = muteSecsLeft >= 60 ? `${Math.ceil(muteSecsLeft / 60)}m` : `${muteSecsLeft}s`;

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
      {mentionSuggestions.length > 0 && (
        <div className="mb-2 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {mentionSuggestions.map((u, i) => (
            <button
              key={u.id}
              onMouseDown={e => { e.preventDefault(); applyMention(u.name); }}
              onMouseEnter={() => setMentionIdx(i)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${i === mentionIdx ? "bg-primary/15 text-primary" : "hover:bg-white/5"}`}
            >
              <span
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-bold text-white"
                style={{ background: u.avatarColor }}
              >
                {u.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="flex-1 truncate font-medium">@{u.name}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${u.status === "online" ? "bg-green-400" : u.status === "away" ? "bg-yellow-400" : "bg-muted-foreground/40"}`} />
            </button>
          ))}
        </div>
      )}
      {showEmoji && (
        <div className="mb-2">
          <EmojiPicker
            onPick={(e) => { setText(t => t + e); setShowEmoji(false); inputRef.current?.focus(); }}
          />
        </div>
      )}
      {showStickers && (
        <div className="mb-2">
          <AnimatedEmojiPicker
            onPick={(s) => {
              send("", {
                attachment: {
                  kind: "image",
                  name: `${s.name}.gif`,
                  mime: "image/gif",
                  size: 0,
                  dataUrl: gifUrlForSticker(s.cp),
                },
                replyToId: replyingTo?.id,
              });
              setShowStickers(false);
            }}
          />
        </div>
      )}
      {showGiphy && (
        <div className="mb-2">
          <GiphyPicker
            onPick={(g) => {
              send(g.pageUrl, { replyToId: replyingTo?.id });
              setShowGiphy(false);
            }}
          />
        </div>
      )}
      {showYoutube && (
        <div className="mb-2">
          <YoutubePicker
            onPick={(url) => {
              send(url, { replyToId: replyingTo?.id });
              setShowYoutube(false);
            }}
          />
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
      {typers.length > 0 && (
        <div className="mb-1 flex items-center gap-1.5 px-3 text-[11px] italic text-muted-foreground">
          <span className="inline-flex gap-0.5">
            <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
            <span className="h-1 w-1 animate-bounce rounded-full bg-primary" />
          </span>
          {typers.length === 1
            ? `${typers[0].name} is typing…`
            : typers.length === 2
              ? `${typers[0].name} and ${typers[1].name} are typing…`
              : `${typers.length} people are typing…`}
        </div>
      )}
      {isLobbyMuted ? (
        <div className="flex items-center gap-2 rounded-3xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span className="text-base">🔇</span>
          <span className="flex-1">You're muted in the lobby ({muteLabel} left). You can still DM friends from your friends list.</span>
        </div>
      ) : (
      <div className="group relative flex items-end gap-1 rounded-3xl border border-border bg-white/5 py-2 pl-4 pr-2 transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/30">
        <input ref={fileRef} type="file" onChange={onFile} className="hidden" accept="image/*,application/pdf,text/plain,.zip,.doc,.docx" />
        <button onClick={() => fileRef.current?.click()} className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-primary" title="Attach file">
          <Paperclip className="h-5 w-5" />
        </button>
        <button onClick={() => setText(t => t + (t.endsWith(" ") || !t ? "!" : " !"))} className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-primary" title="Command">
          <Sparkles className="h-5 w-5" />
        </button>
        <textarea ref={inputRef} value={text} onChange={e => { setText(e.target.value); setCaret(e.target.selectionStart ?? e.target.value.length); sendTyping(); }} onKeyUp={e => setCaret(e.currentTarget.selectionStart ?? 0)} onClick={e => setCaret(e.currentTarget.selectionStart ?? 0)} onKeyDown={onKey} rows={1} placeholder={replyingTo ? "Write your reply…" : "Message — try !help or @mention"} className="max-h-[140px] flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/70" />
        <button onClick={() => { setShowStickers(s => !s); setShowEmoji(false); setShowGiphy(false); setShowYoutube(false); }} className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-primary" title="Animated stickers">
          <Sticker className="h-5 w-5" />
        </button>
        {media.giphy.enabled && (
          <button
            onClick={() => { setShowGiphy(s => !s); setShowEmoji(false); setShowStickers(false); setShowYoutube(false); }}
            className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-fuchsia-400"
            title="Share a GIF"
          >
            <ImagePlay className="h-5 w-5" />
          </button>
        )}
        {media.youtube.enabled && (
          <button
            onClick={() => { setShowYoutube(s => !s); setShowEmoji(false); setShowStickers(false); setShowGiphy(false); }}
            className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-red-500"
            title="Share a YouTube video"
          >
            <Youtube className="h-5 w-5" />
          </button>
        )}
        <button onClick={() => { setShowEmoji(s => !s); setShowStickers(false); setShowGiphy(false); setShowYoutube(false); }} className="mb-1.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground" title="Emoji">
          <Smile className="h-5 w-5" />
        </button>
        <button onClick={submit} disabled={!text.trim() && !attachment} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100">
          <Send className="h-4 w-4" />
        </button>
      </div>
      )}
    </div>
  );
}
