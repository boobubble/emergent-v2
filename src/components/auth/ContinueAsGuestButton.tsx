import { useGuestChat } from "@/lib/guest-chat-context";
import { GuestNicknameDialog } from "@/components/chat/GuestNicknameDialog";

/**
 * Ephemeral Lobby guest entry for the Login / Auth popup only.
 * Never creates Supabase anonymous auth users or profiles.
 */
export function LoginAsGuestButton({
  includeDialog = false,
  className,
  onBeforeOpen,
}: {
  /** Mount GuestNicknameDialog here when the parent does not already. */
  includeDialog?: boolean;
  className?: string;
  /** e.g. close the sign-in dialog before opening the nickname flow */
  onBeforeOpen?: () => void;
}) {
  const guestChat = useGuestChat();

  if (!guestChat.enabled) return null;

  return (
    <>
      {includeDialog ? <GuestNicknameDialog /> : null}
      <button
        type="button"
        onClick={() => {
          onBeforeOpen?.();
          guestChat.openNicknameDialog({ navigateToLobby: true });
        }}
        className={
          className
          ?? "w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground hover:bg-accent"
        }
      >
        Login as Guest
      </button>
    </>
  );
}

/** @deprecated Use LoginAsGuestButton — kept as alias for older imports. */
export const ContinueAsGuestButton = LoginAsGuestButton;