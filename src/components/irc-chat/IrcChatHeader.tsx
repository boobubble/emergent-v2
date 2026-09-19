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
import { BrandMark } from "@/components/BrandMark";
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
import { roomListGlyph, roomListSubtitle } from "./irc-room-glyph";

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

  const roomRecord = view.kind === "room" ? state.rooms[view.roomId] : null;
  const roomRaw = view.kind === "room" ? (roomRecord?.name ?? view.roomId) : null;
  const roomTitle = roomRaw ? formatRoomDisplayTitle(roomRaw) : null;
  const roomTitlePlain = roomRaw ? formatRoomTitlePlain(roomRaw) : null;
  const roomTopic =
    view.kind === "room" && roomRaw
      ? roomListSubtitle(roomRecord?.topic, roomTitlePlain ?? "")
      : null;
  const roomGlyph = roomRaw ? roomListGlyph(roomRaw) : null;

  const title = view.kind === "room" ? roomTitle : view.peerNick;

  const member = view.kind === "dm" ? findMemberByNick(state.members, view.peerNick) : null;
  const profileId = member ? profileUserIdForMember(member) : null;
  const hue = view.kind === "dm" ? nickAvatarHue(view.peerNick) : null;

  return (
    <header
      className={cn(
        "chat-glass sticky top-0 z-20 shrink-0",
        isDesktop
          ? "irc-center-room-header chat-glass hidden h-16 w-full items-center justify-between gap-2 px-3 sm:px-5 md:flex"
          : "flex min-h-[3.75rem] items-center gap-3 px-3 py-2.5 sm:min-h-16 sm:px-5",
        onBack && !isDesktop ? "pl-2 sm:pl-3" : !isDesktop ? "pl-3 sm:pl-5" : undefined,
        className,
      )}
    >
      {isDesktop ? (
        <>
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
            {onToggleSidebar ? (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden h-9 w-9 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-foreground md:grid"
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
            {view.kind === "room" ? (
              <BrandMark
                slot="chat"
                roomId={view.roomId}
                alt="Room logo"
                className="hidden h-9 w-9 shrink-0 rounded-xl object-contain ring-1 ring-border sm:block"
              />
            ) : hue !== null ? (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-background shadow-sm"
                style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
              >
                {nickInitial(view.peerNick)}
              </span>
            ) : null}
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                {view.kind === "room" && roomGlyph ? (
                  <span className="shrink-0 text-base leading-none" aria-hidden>
                    {roomGlyph}
                  </span>
                ) : null}
                <span
                  className="block truncate text-[17px] font-bold tracking-tight text-foreground sm:text-lg"
                  title={view.kind === "room" ? (roomTitlePlain ?? roomTitle ?? undefined) : title}
                >
                  {view.kind === "room" ? (roomTitlePlain ?? roomTitle) : title}
                </span>
              </div>
              {view.kind === "room" && roomTopic ? (
                <p className="mt-0.5 truncate text-[11px] text-muted-foreground" title={roomTopic}>
                  {roomTopic}
                </p>
              ) : null}
              <div className="irc-header-status-strip mt-0.5 gap-2">
                {view.kind === "room" ? (
                  <span className="irc-header-status-pill">
                    <span className="chat-online-dot" aria-hidden style={{ width: "0.4rem", height: "0.4rem" }} />
                    {roomMembers > 0 ? `${roomMembers} online` : "Public room"}
                  </span>
                ) : (
                  <span className="irc-header-status-pill">Direct message</span>
                )}
                <IrcConnectionBadge inline variant="header" className="text-[10px]" />
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {view.kind === "room" ? (
              <>
                {roomMembers > 0 ? (
                  <span className="hidden text-xs font-medium tabular-nums text-muted-foreground md:inline">
                    {roomMembers > 999 ? "999+" : roomMembers} online
                  </span>
                ) : null}
                <button
                  type="button"
                  className="chat-icon-btn"
                  title="Chatroom themes"
                  aria-label="Chatroom themes"
                  onClick={() => window.dispatchEvent(new Event("palrgo:open-chat-theme-store"))}
                >
                  <Palette className="h-4 w-4" />
                </button>
                {showMembersButton && onOpenMembers ? (
                  <button
                    type="button"
                    onClick={onOpenMembers}
                    className="chat-icon-btn relative lg:hidden"
                    aria-label={`Show members (${roomMembers})`}
                    title="Members"
                  >
                    <Users className="h-4 w-4" />
                    <span className="absolute -right-1 -top-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                      {roomMembers > 99 ? "99+" : roomMembers}
                    </span>
                  </button>
                ) : null}
              </>
            ) : profileId ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-lg border-border/70 px-2.5 text-xs shadow-none"
                onClick={() => openProfile(profileId)}
              >
                <User className="h-3.5 w-3.5" />
                Profile
              </Button>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {onBack ? (
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

          {view.kind === "room" ? (
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
            <div className="flex min-w-0 items-center gap-1.5">
              {view.kind === "room" && roomGlyph ? (
                <span className="shrink-0 text-sm leading-none" aria-hidden>{roomGlyph}</span>
              ) : null}
              <h1 className="truncate text-[15px] font-bold leading-tight tracking-tight text-foreground md:text-base">
                {view.kind === "room" ? (roomTitlePlain ?? roomTitle) : title}
              </h1>
            </div>
            {view.kind === "room" && roomTopic ? (
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{roomTopic}</p>
            ) : null}
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
          </div>

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

          {view.kind === "dm" && onMinimizeDm ? (
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
        </>
      )}
    </header>
  );
}
