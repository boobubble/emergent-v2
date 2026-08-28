import type { CSSProperties } from "react";

/** Matches Tailwind `md:` (desktop Chatroom column). */
export const CHATROOM_MD_MQ = "(min-width: 768px)";
/** Matches Tailwind `lg:` (right members column). */
export const CHATROOM_LG_MQ = "(min-width: 1024px)";
export const CHATROOM_DESKTOP_SIDEBAR_PX = 272;

export type ChatroomShellLayout = {
  /**
   * True only when this ChatApp instance first ran in the browser.
   * SSR / hydration keeps this false so markup stays aligned with `md:` CSS.
   */
  clientMounted: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
};

const SSR_LAYOUT: ChatroomShellLayout = {
  clientMounted: false,
  isDesktop: false,
  isLargeDesktop: false,
};

type MatchMedia = (query: string) => { matches: boolean };

/**
 * Read Chatroom desktop/mobile layout for the *first* render of this instance.
 * On the server, returns the SSR placeholder (CSS `md:`/`lg:` remain in charge).
 * On a client-only mount (post-login), matchMedia is available immediately so
 * desktop vs mobile is correct without waiting for app-surfaces.css or a
 * second render.
 */
export function readChatroomShellLayout(matchMedia?: MatchMedia): ChatroomShellLayout {
  const mq =
    matchMedia ??
    (typeof window !== "undefined" ? window.matchMedia.bind(window) : undefined);
  if (!mq) return SSR_LAYOUT;
  return {
    clientMounted: true,
    isDesktop: mq(CHATROOM_MD_MQ).matches,
    isLargeDesktop: mq(CHATROOM_LG_MQ).matches,
  };
}

export function isClientDesktopShell(layout: ChatroomShellLayout): boolean {
  return layout.clientMounted && layout.isDesktop;
}

export function isClientLargeDesktopShell(layout: ChatroomShellLayout): boolean {
  return layout.clientMounted && layout.isLargeDesktop;
}

export function chatroomSidebarClassName(
  layout: ChatroomShellLayout,
  sidebarOpen: boolean,
): string {
  if (isClientDesktopShell(layout)) {
    return "relative z-auto w-[272px] max-w-none shrink-0 translate-x-0 opacity-100 pointer-events-auto shadow-none";
  }
  return [
    "fixed inset-y-0 left-0 z-40 w-[85vw] max-w-xs shadow-2xl transition-transform duration-200 ease-out",
    "md:static md:z-auto md:w-auto md:max-w-none md:shrink-0 md:translate-x-0 md:opacity-100 md:pointer-events-auto md:shadow-none",
    sidebarOpen ? "translate-x-0" : "-translate-x-full pointer-events-none md:pointer-events-auto",
  ].join(" ");
}

/**
 * Inline styles so the desktop column / mobile overlay is correct even when
 * guest `/` CSS is still the only sheet in the document (no `md:static`
 * / `w-[272px]` / `-translate-x-full` yet).
 */
export function chatroomSidebarStyle(
  layout: ChatroomShellLayout,
  sidebarOpen = false,
): CSSProperties | undefined {
  if (!layout.clientMounted) return undefined;
  if (layout.isDesktop) {
    return {
      position: "static",
      transform: "none",
      width: CHATROOM_DESKTOP_SIDEBAR_PX,
      maxWidth: "none",
      zIndex: "auto",
      opacity: 1,
      pointerEvents: "auto",
      boxShadow: "none",
    };
  }
  return {
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 40,
    width: "85vw",
    maxWidth: "20rem",
    transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
    pointerEvents: sidebarOpen ? "auto" : "none",
  };
}

export function chatroomSidebarToggleVisible(
  layout: ChatroomShellLayout,
  sidebarOpen: boolean,
): boolean {
  if (isClientDesktopShell(layout)) return false;
  return !sidebarOpen;
}

export function chatroomSidebarBackdropVisible(
  layout: ChatroomShellLayout,
  sidebarOpen: boolean,
): boolean {
  if (isClientDesktopShell(layout)) return false;
  return sidebarOpen;
}

export function chatroomShellLayoutAttr(layout: ChatroomShellLayout): "ssr" | "desktop" | "mobile" {
  if (!layout.clientMounted) return "ssr";
  return layout.isDesktop ? "desktop" : "mobile";
}
