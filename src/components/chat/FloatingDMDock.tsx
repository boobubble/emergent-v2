import { useCallback, useEffect, useState } from "react";
import { Minus, X, MessageCircle, Trash2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { deleteMyDmConversation } from "@/lib/account-dm.functions";

import { useChat } from "@/lib/chat-store";
import { isRemoteDmChannel } from "@/lib/dm-utils";
import { useAuth } from "@/lib/auth-store";
import { useRemoteProfiles } from "@/lib/use-remote-profiles";
import { resolveMiniDmPeer } from "@/lib/mini-dm";
import { useIsMobile } from "@/hooks/use-mobile";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { FrameAvatar, CosmeticName } from "@/components/cosmetics/CosmeticBits";
import { ChatErrorBoundary } from "@/components/ChatErrorBoundary";

const MAX_OPEN = 2;

/**
 * Floating mini-DM dock (desktop only).
 * Lets users hold DM conversations without leaving the public chatroom.
 * Mobile keeps the existing full-screen DM behaviour.
 */
export function FloatingDMDock() {
  const chat = useChat();
  const { state, dmChannelFor, startDM, setActive, markDmRead, watchRemoteChannel } = chat;
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
    open.forEach(peerId => {
      const ch = dmChannelFor(peerId);
      if (!ch || !isRemoteDmChannel(ch, authUser.id)) return;
      void markDmRead(ch);
    });
  }, [open, authUser?.id, dmChannelFor, state.messages, markDmRead]);

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
            onOpenFull={() => {
              const ch = dmChannelFor(peerId);
              if (ch) setActive(ch);
            }}
            onActivity={() => bumpToTop(peerId)}
            dmChannelFor={dmChannelFor}
            watchRemoteChannel={watchRemoteChannel}
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
  dmChannelFor,
  watchRemoteChannel,
}: {
  peerId: string;
  leavingMode?: "minimize" | "close";
  onClose: () => void;
  onMinimize: () => void;
  onOpenFull: () => void;
  onActivity: () => void;
  dmChannelFor: (peerId: string) => string | null;
  watchRemoteChannel: (channelId: string | null | undefined) => void;
}) {
  // Hooks must run on every render. MembersPanel can open a DM for a remote
  // profile that is not in chat-store.users yet; returning before these hooks
  // crashed /chatroom with the Chatrooms AppErrorBoundary.
  const chat = useChat();
  const { state } = chat;
  const unread = chat.isDmUnread(peerId);
  const { profiles } = useRemoteProfiles();
  const channelId = dmChannelFor(peerId);
  const u = resolveMiniDmPeer(peerId, state.users, profiles, channelId);
  const [deleting, setDeleting] = useState(false);
  const deleteDm = useServerFn(deleteMyDmConversation);

  useEffect(() => {
    watchRemoteChannel(channelId);
  }, [channelId, watchRemoteChannel]);

  if (!channelId || !u) return null;

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
          disabled={deleting}
          onClick={async () => {
            if (!window.confirm(`Delete the entire chat with ${u.name}? This removes messages for both of you and cannot be undone.`)) return;
            setDeleting(true);
            try {
              await deleteDm({ data: { peerId: u.id } });
              onClose();
            } catch (e) {
              alert((e as Error).message || 'Failed to delete chat');
            } finally {
              setDeleting(false);
            }
          }}
          title="Delete chat"
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
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
        <ChatErrorBoundary label="mini-dm-messages">
          <MessageList channelId={channelId} />
        </ChatErrorBoundary>
      </div>

      <div className="shrink-0 border-t border-border bg-card/70">
        <MessageInput
          channelId={channelId}
          compact
          autoFocus
          onActivity={onActivity}
          placeholder={`Message ${u.name}…`}
        />
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
