import { Link } from "@tanstack/react-router";
import { MessageCircle, ExternalLink, UserCircle2, UserPlus, UserMinus, Ban, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/lib/chat-store";

export function UserMenu({
  userId,
  username,
  children,
}: {
  userId: string;
  username: string;
  children: React.ReactNode;
}) {
  const { startDM, addFriend, removeFriend, blockUser, unblockUser, isFriend, isBlocked } = useChat();
  const isMe = userId === "me";
  const friend = isFriend(userId);
  const blocked = isBlocked(userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="cursor-pointer bg-transparent p-0 text-left hover:text-primary hover:underline focus:outline-none"
        >
          {children}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs">
          <UserCircle2 className="h-3.5 w-3.5 text-primary" />
          {username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to={isMe ? "/account" : "/u/$username"}
            params={isMe ? undefined : { username }}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            {isMe ? "Account settings (new tab)" : "Open profile (new tab)"}
          </Link>
        </DropdownMenuItem>
        {!isMe && (
          <>
            <DropdownMenuItem onSelect={() => startDM(userId)} className="cursor-pointer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Send direct message
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {friend ? (
              <DropdownMenuItem onSelect={() => removeFriend(userId)} className="cursor-pointer">
                <UserMinus className="mr-2 h-4 w-4" /> Remove friend
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => addFriend(userId)} className="cursor-pointer">
                <UserPlus className="mr-2 h-4 w-4 text-primary" /> Add friend
              </DropdownMenuItem>
            )}
            {blocked ? (
              <DropdownMenuItem onSelect={() => unblockUser(userId)} className="cursor-pointer">
                <ShieldCheck className="mr-2 h-4 w-4" /> Unblock user
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => blockUser(userId)} className="cursor-pointer text-destructive focus:text-destructive">
                <Ban className="mr-2 h-4 w-4" /> Block user
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
