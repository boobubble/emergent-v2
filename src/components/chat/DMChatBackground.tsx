import { useEffect, useRef } from "react";
import { wallpaperBackground, type DmWallpaper } from "@/lib/dm-wallpapers";

interface DMChatBackgroundProps {
  wallpaper: DmWallpaper | null;
  opacity?: number;      // 0..1
  blur?: number;         // 0..40 px
  brightness?: number;   // 0.3..1.5
  overlay?: number;      // 0..1 (dark overlay)
  // When true, animated media (GIF/WebP video) is paused.
  paused?: boolean;
}

/**
 * Full-cover background layer for the message list of a DM. Sits absolutely
 * behind the messages; opacity/blur/brightness/overlay come from user prefs.
 */
export function DMChatBackground({
  wallpaper,
  opacity = 1,
  blur = 0,
  brightness = 1,
  overlay = 0,
  paused = false,
}: DMChatBackgroundProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const bg = wallpaperBackground(wallpaper);

  // Pause GIF playback by hiding the image while tab / chat is inactive.
  // Static images and CSS backgrounds don't need this.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.animationPlayState = paused ? "paused" : "running";
  }, [paused]);

  if (!wallpaper || !bg) return null;

  const isImage = wallpaper.kind === "image" || wallpaper.kind === "animated";

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ opacity }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: bg,
          filter: `${blur ? `blur(${blur}px) ` : ""}brightness(${brightness})`,
          transform: blur ? "scale(1.05)" : undefined, // hide blur edges
          backgroundSize: isImage ? "cover" : undefined,
          backgroundPosition: isImage ? "center" : undefined,
          backgroundRepeat: isImage ? "no-repeat" : undefined,
          visibility: paused && wallpaper.kind === "animated" ? "hidden" : undefined,
        }}
      />
      {overlay > 0 && (
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${overlay})` }}
        />
      )}
    </div>
  );
}
