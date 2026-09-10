import { useEffect, useState } from "react";

export const YOUTUBE_COMPOSER_CLEARANCE_GAP_PX = 12;
export const YOUTUBE_COMPOSER_CLEARANCE_FALLBACK_PX = 76;

/** Distance from viewport bottom to place the floating player above the chat composer. */
export function measureChatComposerClearancePx(
  viewportHeight: number,
  composerTop: number,
): number {
  const clearance = Math.ceil(viewportHeight - composerTop + YOUTUBE_COMPOSER_CLEARANCE_GAP_PX);
  if (!Number.isFinite(clearance) || clearance <= 0) {
    return YOUTUBE_COMPOSER_CLEARANCE_FALLBACK_PX;
  }
  return Math.max(YOUTUBE_COMPOSER_CLEARANCE_FALLBACK_PX, clearance);
}

function readComposerTop(): number | null {
  if (typeof document === "undefined") return null;
  const footer = document.querySelector(".chat-composer-footer");
  const composer = document.querySelector('[data-chat-composer="room"], [data-chat-composer="dm"]');
  const el = footer ?? composer;
  if (!el) return null;
  return el.getBoundingClientRect().top;
}

export function useChatComposerClearance(): number {
  const [clearancePx, setClearancePx] = useState(YOUTUBE_COMPOSER_CLEARANCE_FALLBACK_PX);

  useEffect(() => {
    const measure = () => {
      const top = readComposerTop();
      if (top === null) return;
      setClearancePx(measureChatComposerClearancePx(window.innerHeight, top));
    };

    measure();

    const ro = new ResizeObserver(measure);
    const footer = document.querySelector(".chat-composer-footer");
    if (footer) ro.observe(footer);
    const composer = document.querySelector('[data-chat-composer="room"], [data-chat-composer="dm"]');
    if (composer) ro.observe(composer);

    window.addEventListener("resize", measure);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", measure);
    vv?.addEventListener("scroll", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      vv?.removeEventListener("resize", measure);
      vv?.removeEventListener("scroll", measure);
    };
  }, []);

  return clearancePx;
}
