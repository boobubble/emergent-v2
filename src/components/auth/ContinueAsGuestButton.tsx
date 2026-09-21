import { useNavigate } from "@tanstack/react-router";
import { useGuestChat } from "@/lib/guest-chat-context";

/**
 * Auth popup guest entry → CodyChat native guest login (no Supabase anonymous user).
 */
export function LoginAsGuestButton({
  className,
  onBeforeOpen,
  label = "Login as Guest",
}: {
  className?: string;
  /** e.g. close the sign-in dialog before navigating to chatroom */
  onBeforeOpen?: () => void;
  label?: string;
}) {
  const guestChat = useGuestChat();
  const navigate = useNavigate();

  if (!guestChat.enabled) return null;

  return (
    <button
      type="button"
      onClick={() => {
        onBeforeOpen?.();
        void navigate({ to: "/chatroom", search: { guest: 1 } });
      }}
      className={
        className
        ?? "w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm font-bold text-foreground hover:bg-accent"
      }
    >
      {label}
    </button>
  );
}

/** @deprecated Use LoginAsGuestButton — kept as alias for older imports. */
export const ContinueAsGuestButton = LoginAsGuestButton;

