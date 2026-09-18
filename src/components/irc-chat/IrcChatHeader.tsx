import {
  ArrowLeft,
  Hash,
  Minus,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIrcChatState } from "@/lib/irc-chat";
import { useProfilePopup } from "@/lib/profile-popup-context";
import { IrcConnectionBadge } from "./IrcConnectionBadge";
import type { IrcActiveView } from "./irc-chat-types";
import {
  findMemberByNick,
  formatRoomDisplayTitle,
  formatRoomTitlePlain,
  nickAvatarHue,
  nickInitial,
  profileUserIdForMember,
} from "./irc-chat-ui";

type IrcChatHeaderProps = {
  view: IrcActiveView;
  layout?: "mobile" | "desktop";
  onBack?: () => void;
  onMinimizeDm?: () => void;
  onCloseDm?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  showMembersButton?: boolean;
  onOpenMembers?: () => void;
  className?: string;
};

export function IrcChatHeader({
  view,
  layout = "mobile",
  onBack,
  onMinimizeDm,
  onCloseDm,
  sidebarOpen,
  onToggleSidebar,
  showMembersButton,
  onOpenMembers,
  className,
}: IrcChatHeaderProps) {
  const state = useIrcChatState();
  const { openProfile } = useProfilePopup();
  const isDesktop = layout === "desktop";

  const roomMembers =
    view.kind === "room" ? (state.members[view.roomId] ?? []).length : 0;

  const roomRaw =
    view.kind === "room"
      ? state.rooms[view.roomId]?.name ?? view.roomId
      : null;
  const roomTitle = roomRaw ? formatRoomDisplayTitle(roomRaw) : null;
  const roomTitlePlain = roomRaw ? formatRoomTitlePlain(roomRaw) : null;

  const title = view.kind === "room" ? roomTitle : view.peerNick;

  const member = view.kind === "dm" ? findMemberByNick(state.members, view.peerNick) : null;
  const profileId = member ? profileUserIdForMember(member) : null;
  const hue = view.kind === "dm" ? nickAvatarHue(view.peerNick) : null;

  return (
    <header
      className={cn(
        "irc-center-room-header shrink-0 bg-background",
        isDesktop
          ? "hidden items-center gap-3 px-4 md:flex"
          : "chat-glass sticky top-0 z-20 flex min-h-[3.75rem] items-center gap-3 px-3 py-2.5 sm:min-h-16 sm:px-5",
        onBack && !isDesktop ? "pl-2 sm:pl-3" : isDesktop ? "pl-3" : "pl-3 sm:pl-5",
        className,
      )}
    >
      {isDesktop && onToggleSidebar ? (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/60 bg-background text-muted-foreground shadow-sm transition hover:bg-muted/50 hover:text-foreground"
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </button>
      ) : null}

      {!isDesktop && onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      ) : null}

      {view.kind === "room" && !isDesktop ? (
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
          aria-hidden
        >
          <Hash className="h-4 w-4" strokeWidth={2.25} />
        </span>
      ) : hue !== null ? (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-background shadow-sm"
          style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
          aria-hidden
        >
          {nickInitial(view.peerNick)}
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        {isDesktop && view.kind === "room" ? (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="min-w-0 flex-1 truncate text-base font-bold leading-tight tracking-tight text-foreground">
              {roomTitlePlain ?? roomTitle}
            </h1>
            <span className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground lg:inline-flex">
              <Users className="h-3.5 w-3.5 opacity-60" aria-hidden />
              {roomMembers > 0 ? `${roomMembers} online` : "Public room"}
            </span>
          </div>
        ) : (
          <>
            <h1 className="truncate text-[15px] font-bold leading-tight tracking-tight text-foreground md:text-base">
              {view.kind === "room" ? (roomTitle ?? roomTitlePlain) : title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-muted-foreground">
              {view.kind === "room" ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground/70">
                  <Users className="h-3.5 w-3.5 opacity-60" aria-hidden />
                  {roomMembers > 0 ? `${roomMembers} online` : "Public room"}
                </span>
              ) : (
                <span className="font-medium">Direct message</span>
              )}
              <IrcConnectionBadge inline variant="header" className="text-[11px]" />
            </div>
          </>
        )}
      </div>

      {isDesktop && view.kind === "room" ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <IrcConnectionBadge inline variant="header" className="hidden text-[11px] xl:inline-flex" />
          <button
            type="button"
            className="chat-icon-btn"
            title="Chatroom themes"
            aria-label="Chatroom themes"
            onClick={() => window.dispatchEvent(new Event("palrgo:open-chat-theme-store"))}
          >
            <Palette className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {view.kind === "dm" && profileId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden h-8 gap-1.5 rounded-lg border-border/70 px-2.5 text-xs shadow-none sm:inline-flex"
          onClick={() => openProfile(profileId)}
        >
          <User className="h-3.5 w-3.5" />
          Profile
        </Button>
      ) : null}

      {isDesktop && showMembersButton && onOpenMembers ? (
        <button
          type="button"
          onClick={onOpenMembers}
          className="chat-icon-btn shrink-0"
          aria-label="Open online users"
          title="Online users"
        >
          <Users className="h-4 w-4" />
        </button>
      ) : null}

      {view.kind === "dm" && onMinimizeDm && !isDesktop ? (
        <button
          type="button"
          onClick={onMinimizeDm}
          aria-label="Minimize DM"
          title="Minimize"
          className="chat-icon-btn lg:hidden"
        >
          <Minus className="h-4 w-4" />
        </button>
      ) : null}
      {view.kind === "dm" && onCloseDm ? (
        <button
          type="button"
          onClick={onCloseDm}
          aria-label="Close DM"
          className="chat-icon-btn hidden lg:grid"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </header>
  );
}
