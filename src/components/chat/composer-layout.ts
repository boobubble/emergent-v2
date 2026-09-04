/** Matches Tailwind `md:` / chatroom desktop shell. */
export const CHAT_COMPOSER_MD_PX = 768;

/** Mobile auto-grow cap (~4 lines at 24px). After this, the textarea scrolls. */
export const CHAT_COMPOSER_MOBILE_MAX_PX = 96;

/** Desktop auto-grow cap — existing MessageInput behavior. */
export const CHAT_COMPOSER_DESKTOP_MAX_PX = 140;

export type ChatComposerAutoSize = {
  /** `null` clears the inline height so CSS min-height wins. */
  heightPx: number | null;
  overflowY: "hidden" | "auto";
};

/**
 * Layout-only auto-resize for the chat textarea.
 * Empty value returns a CSS-driven height so wrapping placeholders cannot
 * inflate the composer.
 */
export function chatComposerAutoSize(
  text: string,
  unconstrainedScrollHeight: number,
  viewportWidth: number,
): ChatComposerAutoSize {
  if (!text) {
    return { heightPx: null, overflowY: "hidden" };
  }
  const max =
    viewportWidth < CHAT_COMPOSER_MD_PX
      ? CHAT_COMPOSER_MOBILE_MAX_PX
      : CHAT_COMPOSER_DESKTOP_MAX_PX;
  const heightPx = Math.min(Math.max(unconstrainedScrollHeight, 0), max);
  return {
    heightPx,
    overflowY: unconstrainedScrollHeight > max ? "auto" : "hidden",
  };
}
