import { useEffect, useState } from "react";
import { useChat } from "@/lib/chat-store";
import { useIsMobile } from "@/hooks/use-mobile";
import { FrameAvatar } from "@/components/cosmetics/CosmeticBits";
import { X } from "lucide-react";

/**
 * Mobile-only minimized DM dock. When a user taps "minimize" inside a DM,
 * the conversation collapses into a floating circular bubble (like FB Messenger
 * chat heads). Tap to restore. Listens for `palrgo:minimizeMobileDM` events.
 */
export function MobileDMMinimizedDock() {
  const isMobile = useIsMobile();
  const chat = useChat();
  const { state, setActive, dmChannelFor, isDmUnread } = chat;
  const [minimized, setMinimized] = useState<string[]>([]);

  useEffect(() => {
    function onMinimize(e: Event) {
      const ce = e as CustomEvent<{ peerId: string }>;
      const peerId = ce.detail?.peerId;
      if (!peerId) return;
      setMinimized((m) => (m.includes(peerId) ? m : [peerId, ...m]).slice(0, 6));
    }
    window.addEventListener("palrgo:minimizeMobileDM", onMinimize as EventListener);
    return () => window.removeEventListener("palrgo:minimizeMobileDM", onMinimize as EventListener);
  }, []);

  // If the active channel becomes one of the minimized peers' DMs, remove it.
  useEffect(() => {
    if (minimized.length === 0) return;
    setMinimized((m) => m.filter((peerId) => dmChannelFor(peerId) !== state.activeChannel));
  }, [state.activeChannel, dmChannelFor, minimized.length]);

  if (!isMobile || minimized.length === 0) return null;

  const restore = (peerId: string) => {
    setActive(dmChannelFor(peerId));
    setMinimized((m) => m.filter((id) => id !== peerId));
  };

  const close = (peerId: string) => {
    setMinimized((m) => m.filter((id) => id !== peerId));
  };

  return (
    <div className="pointer-events-none fixed bottom-20 right-3 z-40 flex flex-col items-end gap-2 lg:hidden">
      {minimized.map((peerId) => {
        const u = state.users[peerId];
        if (!u) return null;
        const unread = isDmUnread(peerId);
        return (
          <div key={peerId} className="pointer-events-auto relative animate-scale-in">
            <button
              onClick={() => restore(peerId)}
              title={u.name}
              className="group relative rounded-full bg-card/90 p-0.5 shadow-2xl ring-2 ring-primary/40 backdrop-blur-md transition-transform hover:scale-110"
              style={{ boxShadow: "var(--shadow-glow, 0 10px 30px rgba(0,0,0,.45))" }}
            >
              <FrameAvatar user={u} size={48} />
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-card ${
                  u.status === "online" ? "bg-emerald-500" : "bg-muted-foreground/50"
                }`}
              />
              {unread && (
                <span className="unread-pop unread-dot absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card">
                  •
                </span>
              )}
            </button>
            <button
              onClick={() => close(peerId)}
              aria-label="Close minimized DM"
              className="absolute -top-1 -left-1 grid h-5 w-5 place-items-center rounded-full bg-card text-muted-foreground shadow ring-1 ring-border transition hover:bg-destructive/15 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
