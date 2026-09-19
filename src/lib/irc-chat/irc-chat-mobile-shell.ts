import type { IrcActiveView } from "@/components/irc-chat/irc-chat-types";

/** IRC `/chatroom` uses a dedicated sticky shell header below `md`, not the center column header. */
export function ircChatUsesMobileShellHeader(isDesktopShell: boolean): boolean {
  return !isDesktopShell;
}

export function ircChatShowCenterColumnHeader(isDesktopShell: boolean): boolean {
  return isDesktopShell ? false : !ircChatUsesMobileShellHeader(isDesktopShell);
}

/** Legacy community chat uses a fixed sidebar + floating toggle on small screens; IRC uses a nav sheet. */
export function ircChatShowFloatingSidebarToggle(
  isDesktopShell: boolean,
  showInlineSidebar: boolean,
): boolean {
  if (!showInlineSidebar) return false;
  return !isDesktopShell;
}

export function ircChatShowSidebarBackdrop(
  isDesktopShell: boolean,
  showInlineSidebar: boolean,
  sidebarOpen: boolean,
): boolean {
  if (!showInlineSidebar) return false;
  if (isDesktopShell) return false;
  return sidebarOpen;
}

export function ircChatMobileNavOpenAfterRoomSelect(): {
  mobileNavOpen: boolean;
  membersOpen: boolean;
} {
  return { mobileNavOpen: false, membersOpen: false };
}

export function ircChatMobileMembersButtonLabel(view: IrcActiveView): string {
  return view.kind === "dm" ? "Conversation info" : "Members";
}
