import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from "react";
import { Send, Smile, Sparkles, Paperclip, X, Reply, Sticker, Youtube, ImagePlay, Mic } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { useGuestChat } from "@/lib/guest-chat-context";
import { sendGuestLobbyMessage } from "@/lib/guest-chat.functions";
import { GUEST_LOBBY_CHANNEL_ID } from "@/lib/guest-chat-config";
import { publishGuestLobbyRow } from "@/lib/guest-lobby-feed";
import { isBotCommandOrAction } from "@/lib/guest-nickname";
import {
  appendGuestOptimistic,
  confirmGuestOptimistic,
  failGuestOptimistic,
} from "@/lib/use-guest-lobby-feed";
import { useTyping } from "@/lib/use-typing";
import { EmojiPicker } from "./EmojiPicker";
import { AnimatedEmojiPicker, stickerUrl } from "./AnimatedEmojiPicker";
import { GiphyPicker } from "./GiphyPicker";
import { YoutubePicker } from "./YoutubePicker";
import { useAppSettings } from "@/lib/app-settings";
import { mergeMediaConfig } from "@/lib/media-providers-config";
import { earnChatMessage } from "@/lib/economy.functions";
import { clearCaches, formatClearReport, isCurrentUserAdmin } from "@/lib/cache-manager";
import { clearChannelMessages } from "@/lib/moderation.functions";
import type { Attachment } from "@/lib/chat-types";
import { supabase } from "@/integrations/supabase/client";
import { VoiceRecorder } from "./VoiceRecorder";
import { TypingIndicator } from "./TypingIndicator";
import { VOICE_NOTES_DEFAULTS, maxDurationForChannel, type VoiceNotesConfig } from "@/lib/voice-notes-config";
import { chatComposerAutoSize } from "./composer-layout";
import "./message-input.css";


const COMMANDS = [
  "!help", "!roll", "!flip", "!slots", "!fish", "!dig",
  "!trivia", "!a", "!hangman", "!g", "!me", "!stats",
];
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

export function MessageInput({
  channelId: channelIdProp,
  compact: compactProp,
  onActivity,
  autoFocus,
  placeholder,
}: {
  /** When set (desktop mini-DM), send/typing target this thread instead of activeChannel. */
  channelId?: string;
  compact?: boolean;
  onActivity?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
} = {}) {
  const { send, state, replyingTo, setReplyingTo, pushSystem, wipeChannel, isDM } = useChat();
  const channelId = channelIdProp || state.activeChannel;
  const compact = compactProp ?? isDM(channelId);
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const guestChat = useGuestChat();
  const sendGuest = useServerFn(sendGuestLobbyMessage);
  const me = user && !user.isGuest ? { id: user.id, name: user.username } : null;
  const { typers, sendTyping } = useTyping(channelId, me, !!me);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [showGiphy, setShowGiphy] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const { raw: appRaw } = useAppSettings();
  const media = mergeMediaConfig((appRaw as any).media);
  const voiceCfg: VoiceNotesConfig = { ...VOICE_NOTES_DEFAULTS, ...((appRaw as any).voice_notes || {}) };
  const voiceMax = maxDurationForChannel(channelId, voiceCfg);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [attachError, setAttachError] = useState("");
  const [caret, setCaret] = useState(0);
  const [mentionIdx, setMentionIdx] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  /** Swallow the leftover click after a picker unmounts so the toolbar toggle cannot reopen it. */
  const ignorePickerToggleUntilRef = useRef(0);

  function markPickerJustClosed() {
    ignorePickerToggleUntilRef.current = Date.now() + 400;
  }

  function pickerToggleIsSuppressed() {
    return Date.now() < ignorePickerToggleUntilRef.current;
  }

  function closeComposerPickers() {
    setShowEmoji(false);
    setShowStickers(false);
    setShowGiphy(false);
    setShowYoutube(false);
  }

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
    const el = inputRef.current;
    if (!el) return;

    const apply = () => {
      const empty = !el.value;
      if (empty) {
        el.style.height = "";
        el.style.overflowY = "hidden";
        return;
      }
      el.style.height = "auto";
      const size = chatComposerAutoSize(el.value, el.scrollHeight, window.innerWidth);
      el.style.height = size.heightPx == null ? "" : `${size.heightPx}px`;
      el.style.overflowY = size.overflowY;
    };

    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [text]);

  useEffect(() => {
    if (replyingTo) inputRef.current?.focus();
  }, [replyingTo]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus, channelId]);

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
  const clearChannelFn = useServerFn(clearChannelMessages);
  const queryClient = useQueryClient();
  const replyForThis =
    replyingTo && (!replyingTo.channelId || replyingTo.channelId === channelId) ? replyingTo : null;

  async function handleClearCache() {
    const ok = await isCurrentUserAdmin();
    if (!ok) {
      toast.error("Admins only", { description: "/clearcache is restricted to admins." });
      return;
    }
    toast.loading("Clearing caches…", { id: "clearcache" });
    const report = await clearCaches({ queryClient });
    toast.success("Caches cleared", { id: "clearcache", description: formatClearReport(report) });
  }

  async function handleClearChannel() {
    if (!me) {
      toast.error("Admins only", { description: "/clear (or /delete) is restricted to admins and room moderators." });
      return;
    }
    // Client-side pre-check (server still enforces per-room permission)
    const { data: roleRows } = await supabase
      .from("user_roles").select("role").eq("user_id", me.id);
    const roles = (roleRows ?? []).map((r: { role: string }) => r.role);
    const isAdmin = roles.includes("super_admin") || roles.includes("admin");
    let canClear = isAdmin;
    if (!canClear) {
      const { data: rm } = await supabase
        .from("room_moderators")
        .select("can_delete")
        .eq("channel_id", channelId)
        .eq("user_id", me.id)
        .maybeSingle();
      canClear = !!rm?.can_delete;
    }
    if (!canClear && roles.includes("moderator")) {
      // Global moderator may be allowed if admin enabled staff permission
      canClear = true; // let the server make the final call
    }
    if (!canClear) {
      toast.error("Admins only", { description: "/clear (or /delete) is restricted to admins and room moderators." });
      return;
    }
    toast.loading("Clearing chat…", { id: "clearchat" });
    try {
      const res = await clearChannelFn({ data: { channel_id: channelId } });
      const count = res?.deleted ?? 0;
      wipeChannel(channelId);
      toast.success("Chat cleared", { id: "clearchat", description: `${count} messages removed.` });
      const who = user?.username ? `@${user.username}` : "An admin";
      pushSystem(channelId, `🧹 Chat history cleared by ${who} — ${count} message${count === 1 ? "" : "s"} removed.`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to clear chat";
      toast.error("Cannot clear chat", { id: "clearchat", description: msg });
      pushSystem(channelId, `⚠️ Couldn't clear chat — ${msg}`);
    }
  }

  function autoMentionUsernames(input: string): string {
    if (!input) return input;
    // Build map of known usernames (excluding self) sorted longest-first so multi-word/longer names win.
    const names = Object.values(state.users)
      .filter(u => u.id !== "me" && u.id !== me?.id && u.name && u.name.length >= 2)
      .map(u => u.name)
      .sort((a, b) => b.length - a.length);
    if (names.length === 0) return input;
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let out = input;
    for (const name of names) {
      // Match the name as a whole token, not already preceded by @, case-insensitive.
      const re = new RegExp(`(^|[^\\w@])(${escape(name)})(?=$|[^\\w])`, "gi");
      out = out.replace(re, (_m, pre) => `${pre}@${name}`);
    }
    return out;
  }

  async function submitGuestLobby(plain: string) {
    if (!guestChat.session) {
      guestChat.openNicknameDialog();
      return;
    }
    if (channelId !== GUEST_LOBBY_CHANNEL_ID) {
      requireAuth();
      return;
    }
    if (isBotCommandOrAction(plain)) {
      requireAuth();
      return;
    }
    if (attachment) {
      requireAuth();
      return;
    }
    const optId = `opt-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())}`;
    const nowIso = new Date().toISOString();
    appendGuestOptimistic({
      id: optId,
      channelId: GUEST_LOBBY_CHANNEL_ID,
      visitorId: guestChat.session.visitorId,
      displayName: guestChat.session.displayName,
      text: plain,
      createdAt: nowIso,
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
      sendStatus: "sending",
    });
    setText("");
    setAttachment(null);
    setAttachError("");
    setReplyingTo(null);
    try {
      const row = await sendGuest({
        data: {
          visitorId: guestChat.session.visitorId,
          channelId: GUEST_LOBBY_CHANNEL_ID,
          text: plain,
        },
      });
      if (row?.id) {
        confirmGuestOptimistic(optId, {
          id: row.id,
          channelId: row.channelId,
          visitorId: row.visitorId,
          displayName: row.displayName,
          text: row.text,
          createdAt: row.createdAt,
          expiresAt: row.expiresAt,
        });
        publishGuestLobbyRow(row);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send";
      failGuestOptimistic(optId, msg);
      if (msg === "GUEST_BOT_BLOCKED" || /sign up|sign in|login/i.test(msg)) {
        requireAuth();
        return;
      }
      if (/disabled/i.test(msg)) {
        guestChat.endGuestChat();
        toast.error("Guest chat is currently disabled.");
        return;
      }
      toast.error(msg);
    }
  }

  function submit() {
    if (!text.trim() && !attachment) return;
    const trimmed = text.trim();

    // Ephemeral guest Lobby path — never creates auth/profile.
    if (!user && guestChat.isGuestChatting) {
      void submitGuestLobby(trimmed);
      return;
    }
    if (!user && guestChat.enabled && channelId === GUEST_LOBBY_CHANNEL_ID && !attachment && !isBotCommandOrAction(trimmed)) {
      guestChat.openNicknameDialog();
      return;
    }

    requireAuth(() => {
      if (/^\/clearcache\b/i.test(trimmed)) {
        setText(""); setAttachment(null); setAttachError("");
        void handleClearCache();
        return;
      }
      if (/^\/(clear|delete)\b/i.test(trimmed)) {
        setText(""); setAttachment(null); setAttachError("");
        void handleClearChannel();
        return;
      }
      const outgoing = autoMentionUsernames(text);
      send(outgoing, {
        attachment: attachment || undefined,
        replyToId: replyForThis?.id,
        ...(channelIdProp ? { channelId: channelIdProp } : {}),
      });
      if (me) {
        earnChat({ data: { channelId, isReply: !!replyForThis } }).catch(() => {});
      }
      setText("");
      setAttachment(null);
      setAttachError("");
      onActivity?.();
    });
  }

  function sendAsAuthed(
    body: string,
    opts?: { attachment?: Attachment; replyToId?: string },
  ) {
    // Media / stickers / gif / voice always require a real account.
    requireAuth(() => {
      send(body, {
        ...opts,
        ...(channelIdProp ? { channelId: channelIdProp } : {}),
      });
      onActivity?.();
    });
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
    if (e.key === "Escape" && replyForThis) {
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

  const replyAuthor = replyForThis ? state.users[replyForThis.authorId] : null;

  const muteUntil = state.moderation?.[channelId]?.me?.mutedUntil;
  const isChannelMuted = !!(muteUntil && muteUntil > Date.now());
  const muteSecsLeft = isChannelMuted ? Math.ceil((muteUntil! - Date.now()) / 1000) : 0;
  const muteLabel = muteSecsLeft >= 60 ? `${Math.ceil(muteSecsLeft / 60)}m` : `${muteSecsLeft}s`;
  const mutedRoomName = state.rooms[channelId]?.name || channelId;
  const composerPlaceholder = placeholder
    ?? (guestChat.isGuestChatting && channelId === GUEST_LOBBY_CHANNEL_ID
      ? `Message as ${guestChat.session?.displayName ?? "Guest"}…`
      : !user && guestChat.enabled && channelId === GUEST_LOBBY_CHANNEL_ID
        ? "Message Lobby as Guest, or sign in…"
        : replyForThis
          ? "Write your reply…"
          : compact
            ? "Message…"
            : "Message — try !help or @mention");

  return (
    <div
      data-chat-composer={compact ? "dm" : "room"}
      className={`chat-composer-root min-w-0 ${compact ? "overflow-x-auto px-1.5 py-1" : "overflow-x-auto px-2 py-1 sm:px-6 sm:py-0"}`}
    >
      {replyForThis && (
        <div className="mb-2 flex min-h-11 items-center gap-2 rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs">
          <Reply className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-primary">Replying to {replyAuthor?.name || "user"}</div>
            <div className="line-clamp-2 text-muted-foreground">
              {replyForThis.text || (replyForThis.attachment ? `📎 ${replyForThis.attachment.name}` : "(message)")}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="grid min-h-11 min-w-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            aria-label="Cancel reply"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {!compact && suggestions.length > 0 && (
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
        <div className="mb-2 max-w-full overflow-x-auto">
          <EmojiPicker
            onPick={(e) => { setText(t => t + e); inputRef.current?.focus(); }}
            onClose={() => { markPickerJustClosed(); closeComposerPickers(); }}
          />
        </div>
      )}
      {showStickers && (
        <div className="mb-2 max-w-full overflow-x-auto">
          <AnimatedEmojiPicker
            onPick={(s) => {
              sendAsAuthed("", {
                attachment: {
                  kind: "image",
                  name: `${s.name}.gif`,
                  mime: "image/gif",
                  size: 0,
                  dataUrl: stickerUrl(s),
                },
                replyToId: replyForThis?.id,
              });
            }}
            onClose={() => { markPickerJustClosed(); closeComposerPickers(); }}
          />
        </div>
      )}
      {showGiphy && (
        <div className="mb-2">
          <GiphyPicker
            onPick={(g) => {
              sendAsAuthed(g.pageUrl, { replyToId: replyForThis?.id });
              setShowGiphy(false);
            }}
          />
        </div>
      )}
      {showYoutube && (
        <div className="mb-2">
          <YoutubePicker
            onPick={(url) => {
              sendAsAuthed(url, { replyToId: replyForThis?.id });
              setShowYoutube(false);
            }}
          />
        </div>
      )}
      {showVoice && (
        <VoiceRecorder
          maxSeconds={voiceMax}
          onClose={() => setShowVoice(false)}
          onSend={(a) => {
            sendAsAuthed("", { attachment: a, replyToId: replyForThis?.id });
            setShowVoice(false);
          }}
        />
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
      {typers.length > 0 && <TypingIndicator typers={typers} className="mb-1 px-1" />}
      {isChannelMuted ? (
        <div className="flex min-h-11 items-center gap-2 rounded-3xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span className="text-base">🔇</span>
          <span className="flex-1 text-xs sm:text-sm">
            You're muted in {mutedRoomName} ({muteLabel} left).
            {channelId === "lobby" && " You can still DM friends from your friends list."}
          </span>
        </div>
      ) : (
      <div className={`chat-composer-glow chat-composer-bar group relative flex min-w-0 items-end gap-0.5 rounded-3xl border border-border bg-card/60 pb-0 pt-2 pr-1 shadow-sm backdrop-blur-md transition-[border-color,box-shadow] ${compact ? "pl-1 sm:gap-0.5 sm:pl-2 sm:pr-1" : "pl-2 sm:gap-1 sm:pl-4 sm:pr-2"}`}>
        <input ref={fileRef} type="file" onChange={onFile} className="hidden" accept="image/*,application/pdf,text/plain,.zip,.doc,.docx" />
        <button data-composer-slot="attach" onClick={() => requireAuth(() => fileRef.current?.click())} className="chat-composer-btn mb-1.5 grid min-h-11 min-w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-primary" title="Attach file" aria-label="Attach file">
          <Paperclip className="h-5 w-5" />
        </button>
        {!compact && (
        <button data-composer-slot="command" onClick={() => requireAuth(() => setText(t => t + (t.endsWith(" ") || !t ? "!" : " !")))} className="chat-composer-btn mb-1.5 hidden min-h-11 min-w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-primary sm:grid" title="Command" aria-label="Insert command">
          <Sparkles className="h-5 w-5" />
        </button>
        )}
        <textarea data-composer-slot="input" ref={inputRef} value={text} onChange={e => { setText(e.target.value); setCaret(e.target.selectionStart ?? e.target.value.length); sendTyping(); onActivity?.(); }} onFocus={() => onActivity?.()} onKeyUp={e => setCaret(e.currentTarget.selectionStart ?? 0)} onClick={e => setCaret(e.currentTarget.selectionStart ?? 0)} onKeyDown={onKey} rows={1} placeholder={composerPlaceholder} className="chat-composer-input max-h-[140px] min-h-11 min-w-0 flex-1 resize-none bg-transparent py-2.5 text-base leading-6 text-foreground outline-none placeholder:truncate placeholder:whitespace-nowrap placeholder:text-muted-foreground/70 sm:py-1.5 sm:text-sm" />
        <button data-composer-slot="sticker" onClick={() => requireAuth(() => { if (pickerToggleIsSuppressed()) return; setShowStickers(s => !s); setShowEmoji(false); setShowGiphy(false); setShowYoutube(false); })} className="chat-composer-btn mb-1.5 grid min-h-11 min-w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-primary" title="Animated stickers" aria-label="Animated stickers">
          <Sticker className="h-5 w-5" />
        </button>
        {!compact && media.giphy.enabled && (
          <button
            data-composer-slot="image"
            onClick={() => requireAuth(() => { setShowGiphy(s => !s); setShowEmoji(false); setShowStickers(false); setShowYoutube(false); })}
            className="chat-composer-btn mb-1.5 grid min-h-11 min-w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-fuchsia-400"
            title="Share a GIF"
            aria-label="Share a GIF"
          >
            <ImagePlay className="h-5 w-5" />
          </button>
        )}
        {!compact && media.youtube.enabled && (
          <button
            data-composer-slot="youtube"
            onClick={() => requireAuth(() => { setShowYoutube(s => !s); setShowEmoji(false); setShowStickers(false); setShowGiphy(false); })}
            className="chat-composer-btn mb-1.5 hidden min-h-11 min-w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-red-500 sm:grid"
            title="Share a YouTube video"
            aria-label="Share a YouTube video"
          >
            <Youtube className="h-5 w-5" />
          </button>
        )}
        {voiceCfg.enabled && (
          <button
            data-composer-slot="mic"
            onClick={() => requireAuth(() => { setShowVoice(s => !s); setShowEmoji(false); setShowStickers(false); setShowGiphy(false); setShowYoutube(false); })}
            className="chat-composer-btn mb-1.5 grid min-h-11 min-w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-red-400"
            title={`Voice note (max ${voiceMax}s)`}
            aria-label="Voice note"
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
        <button data-composer-slot="emoji" onClick={() => { if (pickerToggleIsSuppressed()) return; setShowEmoji(s => !s); setShowStickers(false); setShowGiphy(false); setShowYoutube(false); }} className="chat-composer-btn mb-1.5 grid min-h-11 min-w-11 shrink-0 place-items-center text-muted-foreground transition-colors hover:text-foreground" title="Emoji" aria-label="Emoji">
          <Smile className="h-5 w-5" />
        </button>
        <button data-composer-slot="send" onClick={submit} disabled={!text.trim() && !attachment} className="chat-composer-send mb-1 grid h-11 w-11 shrink-0 place-items-center rounded-full text-primary-foreground shadow-lg transition-[transform,opacity] hover:scale-110 active:scale-90 disabled:opacity-40 disabled:hover:scale-100" style={{ background: "var(--gradient-primary)", boxShadow: "0 8px 24px -8px var(--primary-glow)" }} aria-label="Send message">
          <Send className="h-4 w-4" />
        </button>
      </div>
      )}
    </div>
  );
}
