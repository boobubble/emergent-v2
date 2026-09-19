import { useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ircConnectionLabel, useIrcChatState, type IrcConnectionLabel } from "@/lib/irc-chat";

function connectionDisplayText(label: IrcConnectionLabel): string {
  if (label === "Connected") return "Connected";
  if (label === "Reconnecting") return "Reconnecting…";
  if (label === "Connecting") return "Connecting…";
  return "Disconnected";
}

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
  const display = connectionDisplayText(label);
  const isWarning = label === "Reconnecting" || label === "Connecting";
  const tone =
    label === "Connected"
      ? inline
        ? "text-muted-foreground"
        : "bg-primary/8 text-primary ring-primary/15"
      : label === "Disconnected"
        ? "bg-destructive/8 text-destructive ring-destructive/15"
        : "bg-amber-500/12 text-amber-950 ring-amber-500/25 dark:text-amber-100";

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
            ? "text-muted-foreground/90"
            : isWarning && variant === "header"
              ? "irc-connection-warning font-semibold text-amber-800 dark:text-amber-200"
              : label === "Disconnected" && variant === "header"
                ? "font-semibold text-destructive"
                : tone,
          className,
        )}
        title={state.statusDetail ?? display}
      >
        {isWarning && variant === "header" ? (
          <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
        ) : (
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClass)} aria-hidden />
        )}
        <span className="truncate">{display}</span>
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
      title={state.statusDetail ?? display}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotClass)} aria-hidden />
      {display}
    </span>
  );
}
