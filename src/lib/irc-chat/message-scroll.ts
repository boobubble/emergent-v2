/** Scroll-follow helpers for IRC message list (no DOM). */

export const IRC_MESSAGE_SCROLL_NEAR_BOTTOM_PX = 120;

export function isNearScrollBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  thresholdPx = IRC_MESSAGE_SCROLL_NEAR_BOTTOM_PX,
): boolean {
  if (scrollHeight <= clientHeight) return true;
  return scrollHeight - scrollTop - clientHeight <= thresholdPx;
}
