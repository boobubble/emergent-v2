import { Link } from "@tanstack/react-router";
import { MessageCircle, ExternalLink, UserCircle2 } from "lucide-react";
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
  const { startDM } = useChat();
  const isMe = userId === "me";

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
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs">
          <UserCircle2 className="h-3.5 w-3.5 text-primary" />
          {username}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/u/$username"
            params={{ username }}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open profile (new tab)
          </Link>
        </DropdownMenuItem>
        {!isMe && (
          <DropdownMenuItem
            onSelect={() => startDM(userId)}
            className="cursor-pointer"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Send direct message
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
