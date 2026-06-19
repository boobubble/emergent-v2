import { useEffect, useRef, useState } from "react";
import { Play, Loader2, VideoOff } from "lucide-react";

/**
 * Consistent video player for the feed.
 * - Shows a captured thumbnail (from first frame) as a poster before play
 * - Hover on desktop shows a muted silent preview
 * - Click/tap plays with full controls (audio on)
 * - Graceful error fallback
 */
export function FeedVideo({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [playing, setPlaying] = useState(false);
  const [hovering, setHovering] = useState(false);

  // Capture a poster frame from the video (works for same-origin or CORS-enabled hosts)
  useEffect(() => {
    let cancelled = false;
    const v = document.createElement("video");
    v.crossOrigin = "anonymous";
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.src = src;

    const onLoaded = () => {
      try {
        // seek slightly in to avoid black first-frame
        v.currentTime = Math.min(0.1, (v.duration || 1) / 2);
      } catch {
        capture();
      }
    };
    const onSeeked = () => capture();
    const capture = () => {
      try {
        const canvas = document.createElement("canvas");
        const w = v.videoWidth || 640;
        const h = v.videoHeight || 360;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(v, 0, 0, w, h);
          const url = canvas.toDataURL("image/jpeg", 0.7);
          if (!cancelled) {
            setPoster(url);
            setStatus("ready");
          }
        } else if (!cancelled) {
          setStatus("ready");
        }
      } catch {
        // CORS — can't read pixels; still ok, video itself will play
        if (!cancelled) setStatus("ready");
      }
    };
    const onError = () => {
      if (!cancelled) setStatus("error");
    };
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("seeked", onSeeked);
    v.addEventListener("error", onError);
    return () => {
      cancelled = true;
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("seeked", onSeeked);
      v.removeEventListener("error", onError);
      v.src = "";
    };
  }, [src]);

  // Desktop hover: silent muted preview
  useEffect(() => {
    const v = videoRef.current;
    if (!v || playing) return;
    if (hovering) {
      v.muted = true;
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
      try { v.currentTime = 0; } catch {}
    }
  }, [hovering, playing]);

  function handlePlay() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.controls = true;
    v.play().catch(() => {});
    setPlaying(true);
  }

  if (status === "error") {
    return (
      <div className={`grid place-items-center bg-black/80 text-muted-foreground ${className}`}>
        <div className="flex flex-col items-center gap-2 py-10">
          <VideoOff className="h-8 w-8" />
          <span className="text-xs">Video unavailable</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-black overflow-hidden ${className}`}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        playsInline
        preload="metadata"
        controls={playing}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="h-full w-full object-contain"
      />
      {!playing && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Play video"
          className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/40 via-transparent to-transparent transition-colors hover:bg-black/20"
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-black shadow-lg ring-1 ring-black/10 transition-transform duration-200 hover:scale-110 active:scale-95">
            {status === "loading" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Play className="h-7 w-7 translate-x-0.5 fill-current" />
            )}
          </span>
        </button>
      )}
    </div>
  );
}
