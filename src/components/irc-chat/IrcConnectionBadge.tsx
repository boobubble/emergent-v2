import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ircConnectionLabel, useIrcChatState } from "@/lib/irc-chat";

export function IrcConnectionBadge({ className }: { className?: string }) {
  const state = useIrcChatState();
  const hadAuthRef = useRef(false);
  if (state.status === "authenticated") hadAuthRef.current = true;

  const label = ircConnectionLabel(state.status, hadAuthRef.current);
  const tone =
    label === "Connected"
      ? "bg-emerald-500/12 text-emerald-700 ring-emerald-500/20"
      : label === "Disconnected"
        ? "bg-destructive/10 text-destructive ring-destructive/20"
        : "bg-amber-500/12 text-amber-800 ring-amber-500/20";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        tone,
        className,
      )}
      title={state.statusDetail ?? label}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          label === "Connected"
            ? "bg-emerald-500"
            : label === "Disconnected"
              ? "bg-destructive"
              : "animate-pulse bg-amber-500",
        )}
        aria-hidden
      />
      {label}
    </span>
  );
}
