import { UserRound } from "lucide-react";
import { useGuestChat } from "@/lib/guest-chat-context";
import { GuestNicknameDialog } from "@/components/chat/GuestNicknameDialog";

type Variant = "auth-screen" | "landing" | "hero";

/**
 * Ephemeral Lobby guest entry for public auth surfaces.
 * Uses GuestChatProvider + GuestNicknameDialog — never Supabase anonymous auth.
 */
export function ContinueAsGuestButton({
  variant = "auth-screen",
  includeDialog = true,
  className,
}: {
  variant?: Variant;
  /** Set false when the parent already mounts GuestNicknameDialog once. */
  includeDialog?: boolean;
  className?: string;
}) {
  const guestChat = useGuestChat();

  if (!guestChat.enabled) return null;

  const base =
    variant === "auth-screen"
      ? "w-full rounded-full border border-border bg-background/60 px-4 py-3 text-sm font-bold text-foreground hover:bg-accent"
      : variant === "hero"
        ? "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border border-dashed border-violet-500/35 bg-transparent px-6 py-3 text-sm font-semibold text-violet-200/90 transition hover:bg-violet-500/10 [data-hero-theme=light]:border-violet-400/50 [data-hero-theme=light]:text-violet-700 sm:w-auto sm:px-7"
        : "inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/25 bg-white/[0.03] px-6 py-3.5 text-sm font-bold text-white/85 backdrop-blur hover:bg-white/[0.07]";

  return (
    <>
      {includeDialog ? <GuestNicknameDialog /> : null}
      <button
        type="button"
        onClick={() => guestChat.openNicknameDialog({ navigateToLobby: true })}
        className={className ? `${base} ${className}` : base}
      >
        {variant !== "auth-screen" ? <UserRound className="h-4 w-4 shrink-0 opacity-80" aria-hidden /> : null}
        Continue as Guest
      </button>
    </>
  );
}
