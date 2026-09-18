import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ircConnectionLabel, useIrcChatState } from "@/lib/irc-chat";

export function IrcConnectionBadge({
  className,
  compact = false,
  inline = false,
  variant = "default",
}: {
  className?: string;
  compact?: boolean;
  inline?: boolean;
  variant?: "default" | "header";
}) {
  const state = useIrcChatState();
  const hadAuthRef = useRef(false);
  if (state.status === "authenticated") hadAuthRef.current = true;

  const label = ircConnectionLabel(state.status, hadAuthRef.current);
  const tone =
    label === "Connected"
      ? inline
        ? "text-muted-foreground"
        : "bg-primary/8 text-primary ring-primary/15"
      : label === "Disconnected"
        ? "bg-destructive/8 text-destructive ring-destructive/15"
        : "bg-amber-500/10 text-amber-900 ring-amber-500/20 dark:text-amber-200";

  const dotClass =
    label === "Connected"
      ? variant === "header"
        ? "bg-emerald-500 shadow-[0_0_0_2px_color-mix(in_oklab,var(--background)_80%,transparent)]"
        : "bg-primary"
      : label === "Disconnected"
        ? "bg-destructive"
        : "animate-pulse bg-amber-500";

  if (inline) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-[11px] font-medium",
          variant === "header" && label === "Connected"
            ? "text-emerald-700/90 dark:text-emerald-400/90"
            : tone,
          className,
        )}
        title={state.statusDetail ?? label}
      >
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} aria-hidden />
        <span className="truncate">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        tone,
        className,
      )}
      title={state.statusDetail ?? label}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} aria-hidden />
      {label}
    </span>
  );
}
