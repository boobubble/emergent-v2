import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestNicknameDialog } from "@/components/chat/GuestNicknameDialog";
import { useGuestChat } from "@/lib/guest-chat-context";
import { useAuth } from "@/lib/auth-store";

export function IrcChatGuestGate() {
  const { user } = useAuth();
  const guest = useGuestChat();

  if (user) return null;

  if (!guest.configReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        Loading chat…
      </div>
    );
  }

  if (!guest.enabled) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
        <MessageSquare className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Guest chat is unavailable</h2>
        <p className="text-sm text-muted-foreground">
          Sign in to join the IRC lobby, or check back later.
        </p>
      </div>
    );
  }

  if (guest.session?.gatewayToken) return null;

  return (
    <>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <MessageSquare className="h-10 w-10 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Join the Lobby</h2>
        <p className="text-sm text-muted-foreground">
          Pick a temporary nickname to chat over IRC. No account is created.
        </p>
        <Button type="button" onClick={() => guest.openNicknameDialog()}>
          Enter as guest
        </Button>
      </div>
      <GuestNicknameDialog />
    </>
  );
}
