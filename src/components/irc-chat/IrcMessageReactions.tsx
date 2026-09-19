import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CornerDownLeft, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeReactionPickerPlacement } from "@/lib/irc-chat/irc-chat-mobile-conversation";
import { cn } from "@/lib/utils";
import {
  hasVisibleReactions,
  IRC_REACTION_EMOJI,
  IRC_REACTION_TYPES,
  type IrcMessageReactions,
  type IrcReactionType,
} from "@/lib/irc-chat/reactions";

type IrcMessageReactionsRowProps = {
  reactions?: IrcMessageReactions;
  showReply?: boolean;
  onToggle: (type: IrcReactionType) => void;
  onReply?: () => void;
};

export function IrcMessageReactionsRow({
  reactions,
  showReply,
  onToggle,
  onReply,
}: IrcMessageReactionsRowProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerPlacement, setPickerPlacement] = useState({
    alignEnd: false,
    openBelow: false,
  });
  const pickerRef = useRef<HTMLDivElement>(null);
  const visible = hasVisibleReactions(reactions);

  useLayoutEffect(() => {
    if (!pickerOpen || !pickerRef.current) return;
    const anchor = pickerRef.current.getBoundingClientRect();
    const pickerWidth = 168;
    const pickerHeight = 44;
    setPickerPlacement(
      computeReactionPickerPlacement({
        anchorLeft: anchor.left,
        anchorTop: anchor.top,
        anchorBottom: anchor.bottom,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        pickerWidth,
        pickerHeight,
      }),
    );
  }, [pickerOpen]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [pickerOpen]);

  return (
    <div className="irc-msg-actions mt-1 flex min-w-0 flex-wrap items-center gap-1">
      {visible ? (
        <div className="irc-msg-reaction-chips flex flex-wrap items-center gap-1">
          {IRC_REACTION_TYPES.map((type) => {
            const bucket = reactions?.[type];
            if (!bucket || bucket.count <= 0) return null;
            return (
              <button
                key={type}
                type="button"
                className={cn(
                  "irc-reaction-chip",
                  bucket.reactedByMe && "irc-reaction-chip--active",
                )}
                onClick={() => onToggle(type)}
                aria-pressed={bucket.reactedByMe}
                aria-label={`${IRC_REACTION_EMOJI[type]} ${bucket.count}`}
              >
                <span className="irc-reaction-chip-emoji" aria-hidden>
                  {IRC_REACTION_EMOJI[type]}
                </span>
                <span className="irc-reaction-chip-count tabular-nums">{bucket.count}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="irc-msg-actions-tools relative flex items-center gap-0.5">
        <div ref={pickerRef} className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="irc-msg-react-btn h-7 w-7 p-0 text-muted-foreground opacity-100 md:opacity-0 md:group-hover/msg:opacity-100 md:group-focus-within/msg:opacity-100"
            onClick={() => setPickerOpen((open) => !open)}
            aria-label="Add reaction"
            aria-expanded={pickerOpen}
          >
            <SmilePlus className="h-3.5 w-3.5" aria-hidden />
          </Button>
          {pickerOpen ? (
            <div
              className={cn(
                "irc-reaction-picker",
                pickerPlacement.alignEnd && "irc-reaction-picker--align-end",
                pickerPlacement.openBelow && "irc-reaction-picker--below",
              )}
              role="menu"
            >
              {IRC_REACTION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="menuitem"
                  className="irc-reaction-picker-item"
                  onClick={() => {
                    onToggle(type);
                    setPickerOpen(false);
                  }}
                  aria-label={type}
                >
                  {IRC_REACTION_EMOJI[type]}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {showReply && onReply ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="irc-msg-reply-btn h-7 gap-0.5 px-1.5 text-[10px] font-semibold text-muted-foreground opacity-100 md:opacity-0 md:group-hover/msg:opacity-100 md:group-focus-within/msg:opacity-100"
            onClick={onReply}
            aria-label="Reply"
          >
            <CornerDownLeft className="h-3 w-3" aria-hidden />
            Reply
          </Button>
        ) : null}
      </div>
    </div>
  );
}
