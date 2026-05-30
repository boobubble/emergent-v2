import { cn } from "@/lib/utils";

/**
 * WoWonder-style ON/OFF pill toggle. Used across the admin panel so every
 * boolean setting reads the same.
 */
export function AdminToggle({
  checked,
  onCheckedChange,
  disabled,
  size = "md",
  className,
  ariaLabel,
}: {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}) {
  const dims = size === "sm"
    ? { w: "w-[52px]", h: "h-6", text: "text-[9px]", padOn: "pl-1.5", padOff: "pr-1.5", knob: "h-4 w-4", knobOn: "translate-x-7", knobOff: "translate-x-0.5" }
    : { w: "w-[60px]", h: "h-7", text: "text-[10px]", padOn: "pl-2",   padOff: "pr-2",   knob: "h-5 w-5", knobOn: "translate-x-8", knobOff: "translate-x-0.5" };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full border font-bold uppercase tracking-wider transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        dims.w, dims.h, dims.text,
        checked
          ? "border-emerald-500/40 bg-emerald-500 text-white"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      <span className={cn("flex-1 text-center", checked ? dims.padOn : "opacity-0")}>ON</span>
      <span className={cn("flex-1 text-center", !checked ? dims.padOff : "opacity-0")}>OFF</span>
      <span
        className={cn(
          "absolute top-1/2 -translate-y-1/2 rounded-full bg-white shadow-sm transition-transform",
          dims.knob,
          checked ? dims.knobOn : dims.knobOff,
        )}
      />
    </button>
  );
}
