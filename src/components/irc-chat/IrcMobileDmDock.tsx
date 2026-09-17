import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { nickAvatarHue, nickInitial, countDmUnread } from "./irc-chat-ui";
import type { IrcChatMessage } from "@/lib/irc-chat";
import { ircPmChannelForNick } from "@/lib/irc-chat/dm";

type IrcMobileDmDockProps = {
  minimizedPeers: string[];
  selfNick: string | null;
  privateMessages: Record<string, IrcChatMessage[]>;
  lastReadDmByPeer: Record<string, number>;
  onRestore: (peerNick: string) => void;
  onDismiss: (peerNick: string) => void;
  className?: string;
};

/**
 * Mobile floating DM bubbles (premium Yaarzo pattern). IRC nicks only — no legacy chat-store.
 */
export function IrcMobileDmDock({
  minimizedPeers,
  selfNick,
  privateMessages,
  lastReadDmByPeer,
  onRestore,
  onDismiss,
  className,
}: IrcMobileDmDockProps) {
  if (minimizedPeers.length === 0) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-20 right-3 z-40 flex flex-col items-end gap-2 lg:hidden",
        className,
      )}
    >
      {minimizedPeers.map((peerNick) => {
        const hue = nickAvatarHue(peerNick);
        const channel = ircPmChannelForNick(peerNick);
        const msgs = privateMessages[channel] ?? [];
        const unread = countDmUnread(
          msgs,
          selfNick,
          lastReadDmByPeer[peerNick.toLowerCase()] ?? 0,
        );

        return (
          <div
            key={peerNick.toLowerCase()}
            className="pointer-events-auto relative animate-scale-in"
          >
            <button
              type="button"
              onClick={() => onRestore(peerNick)}
              title={peerNick}
              className="group relative rounded-full bg-card/90 p-0.5 shadow-2xl ring-2 ring-primary/40 backdrop-blur-md transition-transform hover:scale-110"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: `hsl(${hue} 52% 46%)` }}
              >
                {nickInitial(peerNick)}
              </span>
              {unread > 0 ? (
                <span className="unread-pop unread-dot absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground ring-2 ring-card">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => onDismiss(peerNick)}
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
