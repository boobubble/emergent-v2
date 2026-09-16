import { MessageCircle, UserRound } from "lucide-react";
import { useChat } from "@/lib/chat-store";
import { useGuestChat } from "@/lib/guest-chat-context";
import { useAuth } from "@/lib/auth-store";
import { useAuthGate } from "@/lib/auth-gate";
import { useProfilePopup } from "@/lib/profile-popup-context";
import {
  canViewRegisteredProfile,
  resolveDmTargetUserId,
} from "@/lib/chat-user-actions";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  userId,
  children,
}: {
  userId: string;
  username?: string;
  children: React.ReactNode;
}) {
  const { startDM, openDmTab } = useChat();
  const guestChat = useGuestChat();
  const { user: authUser } = useAuth();
  const { requireAuth } = useAuthGate();
  const { openProfile } = useProfilePopup();
  const isMobile = useIsMobile();

  const dmTargetId = resolveDmTargetUserId(
    userId,
    authUser?.id,
    guestChat.session?.visitorId,
  );
  const showProfile = canViewRegisteredProfile(userId);

  if (userId === "me") {
    return (
      <span className="cursor-default bg-transparent p-0 text-left">{children}</span>
    );
  }

  const openDm = () => {
    if (isMobile) startDM(dmTargetId);
    else openDmTab(dmTargetId);
  };

  const handleDm = () => {
    if (
      guestChat.isGuestChatting ||
      dmTargetId.startsWith("visitor_") ||
      dmTargetId.startsWith("irc:")
    ) {
      openDm();
      return;
    }
    requireAuth(openDm);
  };

  if (!showProfile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer bg-transparent p-0 text-left hover:text-primary focus:outline-none"
          >
            {children}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={handleDm}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Send Direct Message
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer bg-transparent p-0 text-left hover:text-primary focus:outline-none"
        >
          {children}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuItem
          onClick={() => {
            openProfile(userId);
          }}
        >
          <UserRound className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDm}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Send Direct Message
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
