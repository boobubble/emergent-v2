import { useEffect, useState } from "react";
import { CornerDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IRC_CHAT_BELOW_MD_MQ,
  mobileReplyPreviewMaxChars,
} from "@/lib/irc-chat/irc-chat-mobile-conversation";
import { buildReplyPreviewText } from "@/lib/irc-chat/reply";

type IrcMessageReplyPreviewProps = {
  authorNick: string;
  previewText: string;
  unavailable?: boolean;
  onNavigate?: () => void;
  className?: string;
};

export function IrcMessageReplyPreview({
  authorNick,
  previewText,
  unavailable,
  onNavigate,
  className,
}: IrcMessageReplyPreviewProps) {
  const label = unavailable ? "Original message unavailable" : authorNick;
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(IRC_CHAT_BELOW_MD_MQ);
    const apply = () => setIsMobileViewport(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const body = unavailable
    ? ""
    : buildReplyPreviewText(
        previewText,
        mobileReplyPreviewMaxChars(isMobileViewport),
      );

  const interactive = Boolean(onNavigate && !unavailable);

  return (
    <div
      className={cn(
        "irc-msg-reply-preview mb-1 max-w-full min-w-0 border-l-2 border-primary/35 pl-2",
        interactive && "cursor-pointer rounded-sm hover:bg-primary/5",
        className,
      )}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onNavigate : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onNavigate?.();
              }
            }
          : undefined
      }
    >
      <p className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
        <CornerDownRight className="h-3 w-3 shrink-0 text-primary/70" aria-hidden />
        <span className="truncate">{label}</span>
      </p>
      {body ? (
        <p className="line-clamp-2 text-[11px] leading-snug text-muted-foreground/90">{body}</p>
      ) : null}
    </div>
  );
}
