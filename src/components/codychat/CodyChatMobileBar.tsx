import { Menu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CodyChatMobileBarProps = {
  connected?: boolean;
  roomTitle?: string;
  onOpenNav: () => void;
  onOpenMembers: () => void;
  className?: string;
};

export function CodyChatMobileBar({
  connected = false,
  roomTitle = "Yaarzo",
  onOpenNav,
  onOpenMembers,
  className,
}: CodyChatMobileBarProps) {
  return (
    <header
      className={cn(
        "cody-mobile-bar sticky top-0 z-20 flex shrink-0 items-center gap-1 px-1.5 py-0.5 md:hidden",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onOpenNav}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center">
        <p className="truncate text-[10px] font-medium text-muted-foreground">Yaarzo</p>
        <div className="flex max-w-full items-center gap-1.5">
          <span
            className={cn("cody-status-dot shrink-0", connected && "cody-status-dot-live")}
            aria-hidden
          />
          <p className="truncate text-[13px] font-semibold">{roomTitle}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-ring"
        onClick={onOpenMembers}
        aria-label="Open members"
      >
        <Users className="h-5 w-5" />
      </Button>
    </header>
  );
}
