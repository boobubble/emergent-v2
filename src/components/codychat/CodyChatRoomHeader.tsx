import { MoreHorizontal, Share2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CodyChatRoomMeta } from "./codychat-room-meta";

type CodyChatRoomHeaderProps = {
  room: CodyChatRoomMeta;
  connected?: boolean;
  className?: string;
};

export function CodyChatRoomHeader({
  room,
  connected = false,
  className,
}: CodyChatRoomHeaderProps) {
  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) return;
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title: room.roomTitle, url });
        return;
      }
    } catch {
      /* user cancelled */
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };

  return (
    <header
      className={cn("cody-room-header shrink-0", className)}
      aria-label={`${room.roomTitle} chatroom`}
    >
      <div className="cody-room-header-main">
        <div className="cody-room-avatar" aria-hidden>
          {room.roomTitle.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-[13px] font-semibold leading-tight sm:text-sm">
              {room.roomTitle}
            </h1>
            <span className="cody-status-pill shrink-0 py-0">
              <span
                className={cn("cody-status-dot", connected && "cody-status-dot-live")}
                aria-hidden
              />
              <span className="sr-only">{connected ? "Chat connected" : "Connecting"}</span>
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
            {room.roomSubtitle}
          </p>
        </div>
      </div>

      <div className="cody-room-header-actions">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cody-room-icon-btn hidden sm:inline-flex"
          aria-label="Favorites (not available yet)"
          disabled
          title="Favorites are managed inside chat"
        >
          <Star className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cody-room-icon-btn"
          aria-label="Share chatroom link"
          onClick={() => void onShare()}
        >
          <Share2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="cody-room-icon-btn"
          aria-label="More actions"
          disabled
          title="Use the chat panel for room options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
