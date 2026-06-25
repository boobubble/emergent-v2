import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Minus, X, MessageCircle, Send, Smile, Paperclip, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { deleteMyDmConversation } from "@/lib/account-dm.functions";

import { useChat } from "@/lib/chat-store";
import { useAuth } from "@/lib/auth-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { MessageList } from "./MessageList";
import { TypingIndicator } from "./TypingIndicator";
import { useTyping } from "@/lib/use-typing";
import { FrameAvatar, CosmeticName } from "@/components/cosmetics/CosmeticBits";
import type { Attachment } from "@/lib/chat-types";

const MAX_OPEN = 2;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;

/**
 * Floating mini-DM dock (desktop only).
 * Lets users hold DM conversations without leaving the public chatroom.
 * Mobile keeps the existing full-screen DM behaviour.
 */
export function FloatingDMDock() {
  const chat = useChat();
  const { state, send, dmChannelFor, startDM, setActive } = chat;
  const { user: authUser } = useAuth();
  const isMobile = useIsMobile();

  // peerIds currently rendered as open windows (max MAX_OPEN). Order = oldest first.
  const [open, setOpen] = useState<string[]>([]);
  // peerIds currently minimized in the dock (most-recent first)
  const [minimized, setMinimized] = useState<string[]>([]);
  // peerIds animating out (minimize/close) — kept briefly so CSS transition can play
  const [leaving, setLeaving] = useState<Record<string, "minimize" | "close">>({});

  function bumpToTop(peerId: string) {
    setOpen(curr => (curr[curr.length - 1] === peerId ? curr : [...curr.filter(id => id !== peerId), peerId]));
  }

  // Listen for "open mini DM" events from member list / profile / etc.
  useEffect(() => {
    function onOpen(e: Event) {
      const ce = e as CustomEvent<{ peerId: string }>;
      const peerId = ce.detail?.peerId;
      if (!peerId || peerId === "me") return;
      if (isMobile) {
        startDM(peerId);
        return;
      }
      setMinimized(m => m.filter(id => id !== peerId));
      setOpen(curr => {
        if (curr.includes(peerId)) {
          // already open — bring to focus position
          return curr[curr.length - 1] === peerId ? curr : [...curr.filter(id => id !== peerId), peerId];
        }
        if (curr.length < MAX_OPEN) return [...curr, peerId];
        // Auto-minimize the oldest with animation, push new to the end
        const [oldest, ...rest] = curr;
        setLeaving(l => ({ ...l, [oldest]: "minimize" }));
        window.setTimeout(() => {
          setLeaving(l => {
            const { [oldest]: _gone, ...next } = l;
            return next;
          });
          setMinimized(m => (m.includes(oldest) ? m : [oldest, ...m]));
        }, 180);
        return [...rest, peerId];
      });
    }
    window.addEventListener("palrgo:openMiniDM", onOpen as EventListener);
    return () => window.removeEventListener("palrgo:openMiniDM", onOpen as EventListener);
  }, [isMobile, startDM]);

  // Clear local dock state when switching to mobile (full-page DM owns it there)
  useEffect(() => {
    if (isMobile) {
      setOpen([]);
      setMinimized([]);
      setLeaving({});
    }
  }, [isMobile]);

  const closeWindow = useCallback((peerId: string) => {
    setLeaving(l => ({ ...l, [peerId]: "close" }));
    window.setTimeout(() => {
      setOpen(o => o.filter(id => id !== peerId));
      setMinimized(m => m.filter(id => id !== peerId));
      setLeaving(l => {
        const { [peerId]: _gone, ...rest } = l;
        return rest;
      });
    }, 160);
  }, []);

  const minimizeWindow = useCallback((peerId: string) => {
    setLeaving(l => ({ ...l, [peerId]: "minimize" }));
    window.setTimeout(() => {
      setOpen(o => o.filter(id => id !== peerId));
      setMinimized(m => (m.includes(peerId) ? m : [peerId, ...m]));
      setLeaving(l => {
        const { [peerId]: _gone, ...rest } = l;
        return rest;
      });
    }, 180);
  }, []);

  const restoreWindow = useCallback((peerId: string) => {
    setMinimized(m => m.filter(id => id !== peerId));
    setOpen(curr => {
      if (curr.includes(peerId)) return curr;
      if (curr.length < MAX_OPEN) return [...curr, peerId];
      const [oldest, ...rest] = curr;
      setLeaving(l => ({ ...l, [oldest]: "minimize" }));
      window.setTimeout(() => {
        setLeaving(l => {
          const { [oldest]: _gone, ...next } = l;
          return next;
        });
        setMinimized(m => (m.includes(oldest) ? m : [oldest, ...m]));
      }, 180);
      return [...rest, peerId];
    });
  }, []);

  // Mark DM read whenever a mini window for that peer is open (and on new msgs while open)
  useEffect(() => {
    if (!authUser?.id || open.length === 0) return;
    const meId = authUser.id;
    open.forEach(peerId => {
      const ch = dmChannelFor(peerId);
      if (!ch.startsWith("dm:") || !ch.includes(meId)) return;
      void supabase
        .from("dm_reads")
        .upsert(
          { user_id: meId, channel_id: ch, last_read_at: new Date().toISOString() },
          { onConflict: "user_id,channel_id" },
        );
    });
  }, [open, authUser?.id, dmChannelFor, state.messages]);

  if (isMobile) return null;
  if (!authUser?.id) return null;
  if (open.length === 0 && minimized.length === 0) return null;

  const visibleMinimized = minimized.slice(0, 4);
  const moreMinimized = Math.max(0, minimized.length - visibleMinimized.length);

  return (
    <div className="pointer-events-none fixed bottom-0 right-4 z-40 hidden items-end gap-3 lg:flex">
      {/* Minimized dock */}
      {(visibleMinimized.length > 0 || moreMinimized > 0) && (
        <div className="pointer-events-auto mb-3 flex items-end gap-2">
          {visibleMinimized.map(peerId => {
            const u = state.users[peerId];
            if (!u) return null;
            const unread = chat.isDmUnread(peerId);
            return (
              <button
                key={peerId}
                onClick={() => restoreWindow(peerId)}
                title={u.name}
                className="group relative rounded-full bg-card/80 p-0.5 shadow-lg ring-1 ring-border backdrop-blur-md transition-all duration-200 hover:scale-110 animate-scale-in"
              >
                <FrameAvatar user={u} size={36} />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${
                    u.status === "online" ? "bg-emerald-500" : "bg-muted-foreground/50"
                  }`}
                />
                {unread && (
                  <span
                    key="unread"
                    className="unread-pop unread-dot absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card"
                  >
                    •
                  </span>
                )}
              </button>
            );
          })}
          {moreMinimized > 0 && (
            <div
              className="grid h-9 min-w-[36px] place-items-center rounded-full bg-card/80 px-2 text-[11px] font-bold text-foreground shadow-lg ring-1 ring-border backdrop-blur-md"
              title={`${moreMinimized} more DM${moreMinimized === 1 ? "" : "s"}`}
            >
              +{moreMinimized}
            </div>
          )}
        </div>
      )}

      {/* Open windows */}
      <div className="pointer-events-auto flex items-end gap-3">
        {open.map(peerId => (
          <MiniDMWindow
            key={peerId}
            peerId={peerId}
            leavingMode={leaving[peerId]}
            onClose={() => closeWindow(peerId)}
            onMinimize={() => minimizeWindow(peerId)}
            onOpenFull={() => setActive(dmChannelFor(peerId))}
            onActivity={() => bumpToTop(peerId)}
            send={send}
            dmChannelFor={dmChannelFor}
          />
        ))}
      </div>
    </div>
  );
}

function MiniDMWindow({
  peerId,
  leavingMode,
  onClose,
  onMinimize,
  onOpenFull,
  onActivity,
  send,
  dmChannelFor,
}: {
  peerId: string;
  leavingMode?: "minimize" | "close";
  onClose: () => void;
  onMinimize: () => void;
  onOpenFull: () => void;
  onActivity: () => void;
  send: (text: string, opts?: { channelId?: string; attachment?: Attachment }) => void;
  dmChannelFor: (peerId: string) => string;
}) {
  const chat = useChat();
  const { state } = chat;
  const unread = chat.isDmUnread(peerId);
  const u = state.users[peerId];
  const channelId = dmChannelFor(peerId);
  const me = state.users.me;
  const meForTyping = me && !me.isGuest ? { id: me.id, name: me.name } : null;
  const { typers, sendTyping } = useTyping(channelId, meForTyping, !!meForTyping);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [attachError, setAttachError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!u) return null;

  const submit = () => {
    const t = text.trim();
    if (!t && !attachment) return;
    send(t, { channelId, attachment: attachment ?? undefined });
    setText("");
    setAttachment(null);
    setAttachError("");
    onActivity();
  };

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

  const isLeaving = !!leavingMode;

  return (
    <div
      onMouseDown={onActivity}
      className={`flex h-[440px] w-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl backdrop-blur-xl origin-bottom-right transition-all duration-200 ease-out ${
        isLeaving ? "scale-90 opacity-0 translate-y-3" : "scale-100 opacity-100 translate-y-0 animate-scale-in"
      }`}
      style={{ boxShadow: "var(--shadow-glow, 0 10px 40px rgba(0,0,0,.35))" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border bg-card/70 px-3 py-2">
        <button onClick={onOpenFull} className="relative flex min-w-0 flex-1 items-center gap-2 text-left">
          <div className="relative">
            <FrameAvatar user={u} size={28} />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
                u.status === "online" ? "bg-emerald-500" : "bg-muted-foreground/50"
              }`}
            />
            {unread && (
              <span
                key="hdr-unread"
                className="unread-pop unread-dot absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-destructive ring-2 ring-card"
                title="Unread"
              />
            )}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-xs font-semibold">
              <CosmeticName userId={u.id} name={u.name} />
            </div>
            <div className="truncate text-[10px] text-muted-foreground">
              {u.status === "online" ? "Online" : u.isBot ? "Bot" : "Offline"}
            </div>
          </div>
        </button>
        <button
          onClick={onMinimize}
          title="Minimize"
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          title="Close"
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body — reuse existing MessageList for full feature parity */}
      <div className="flex min-h-0 flex-1 flex-col">
        <MessageList channelId={channelId} />
      </div>

      {/* Attachment preview */}
      {attachment && (
        <div className="mx-2 mb-1 mt-1 flex items-center gap-2 rounded-xl border border-border bg-white/5 px-2 py-1.5">
          {attachment.kind === "image" ? (
            <img src={attachment.dataUrl} alt={attachment.name} className="h-9 w-9 rounded-md object-cover" />
          ) : (
            <div className="grid h-9 w-9 place-items-center rounded-md bg-white/5 text-base">📎</div>
          )}
          <div className="min-w-0 flex-1 text-[11px]">
            <div className="truncate font-medium">{attachment.name}</div>
            <div className="text-muted-foreground">{(attachment.size / 1024).toFixed(1)} KB</div>
          </div>
          <button
            onClick={() => setAttachment(null)}
            className="text-muted-foreground hover:text-destructive"
            aria-label="Remove attachment"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {attachError && <div className="px-3 pb-1 text-[11px] text-destructive">{attachError}</div>}

      <TypingIndicator typers={typers} />

      {/* Footer */}
      <div className="flex items-center gap-1.5 border-t border-border bg-card/70 px-2 py-2">
        <input
          ref={fileRef}
          type="file"
          onChange={onFile}
          className="hidden"
          accept="image/*,application/pdf,text/plain,.zip,.doc,.docx"
        />
        <button
          title="Attach file"
          onClick={() => fileRef.current?.click()}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          title="Emoji"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          onClick={() => setText(t => t + "😊")}
        >
          <Smile className="h-4 w-4" />
        </button>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => { setText(e.target.value); sendTyping(); }}
          onFocus={onActivity}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={`Message ${u.name}…`}
          className="min-w-0 flex-1 rounded-full bg-muted/40 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 outline-none ring-0 focus:bg-muted/60"
        />
        <button
          onClick={submit}
          disabled={!text.trim() && !attachment}
          title="Send"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/** Helper for callers to open a mini DM (or fall back to full-page on mobile). */
export function openMiniDM(peerId: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("palrgo:openMiniDM", { detail: { peerId } }));
}

// Marker icon export so tree-shake keeps MessageCircle if not used elsewhere
export const _MiniDMIcon = MessageCircle;
