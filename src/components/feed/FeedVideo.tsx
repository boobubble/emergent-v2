import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, Pause, Loader2, VideoOff, X } from "lucide-react";

/**
 * Consistent video player for the feed.
 * - Shows a captured thumbnail (from first frame) as a poster
 * - Hover on desktop shows a muted silent preview
 * - Click/tap opens a fullscreen modal with pause/resume + close
 * - Graceful error fallback
 */
export function FeedVideo({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [hovering, setHovering] = useState(false);
  const [open, setOpen] = useState(false);
  const [modalPlaying, setModalPlaying] = useState(false);

  // Capture a poster frame from the video
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
        if (!cancelled) setStatus("ready");
      }
    };
    const onError = () => { if (!cancelled) setStatus("error"); };
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
    const v = previewRef.current;
    if (!v) return;
    if (hovering) {
      v.muted = true;
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
      try { v.currentTime = 0; } catch {}
    }
  }, [hovering]);

  // Lock body scroll + ESC to close while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function openModal() {
    setOpen(true);
    setModalPlaying(true);
    // attempt autoplay once the video element is mounted
    requestAnimationFrame(() => {
      const v = modalVideoRef.current;
      if (!v) return;
      v.muted = false;
      v.play().catch(() => {
        // autoplay with sound blocked — try muted, user can unmute via controls
        v.muted = true;
        v.play().catch(() => setModalPlaying(false));
      });
    });
  }

  function closeModal() {
    const v = modalVideoRef.current;
    if (v) v.pause();
    setOpen(false);
    setModalPlaying(false);
  }

  function togglePlay() {
    const v = modalVideoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setModalPlaying(true);
    } else {
      v.pause();
      setModalPlaying(false);
    }
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
    <>
      <div
        className={`relative bg-black overflow-hidden cursor-pointer ${className}`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onClick={openModal}
        role="button"
        aria-label="Play video fullscreen"
      >
        <video
          ref={previewRef}
          src={src}
          poster={poster ?? undefined}
          playsInline
          muted
          preload="metadata"
          className="h-full w-full object-contain pointer-events-none"
        />
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/40 via-transparent to-transparent transition-colors hover:bg-black/15">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-white/95 text-black shadow-lg ring-1 ring-black/10 transition-transform duration-200 hover:scale-110 active:scale-95">
            {status === "loading" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <Play className="h-7 w-7 translate-x-0.5 fill-current" />
            )}
          </span>
        </div>
      </div>

      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm animate-fade-in flex items-center justify-center"
          onClick={closeModal}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); closeModal(); }}
            aria-label="Close video"
            className="absolute top-4 right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-white/20 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative max-h-full max-w-full w-full h-full flex items-center justify-center p-4 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={modalVideoRef}
              src={src}
              poster={poster ?? undefined}
              controls
              autoPlay
              playsInline
              onPlay={() => setModalPlaying(true)}
              onPause={() => setModalPlaying(false)}
              onEnded={() => setModalPlaying(false)}
              className="max-h-full max-w-full rounded-lg shadow-2xl bg-black"
            />

            {/* Center pause/resume tap target overlay (mobile-friendly) */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={modalPlaying ? "Pause" : "Resume"}
              className={`absolute inset-0 grid place-items-center transition-opacity ${modalPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"}`}
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 text-black shadow-xl ring-1 ring-black/10 transition-transform hover:scale-110 active:scale-95">
                {modalPlaying ? (
                  <Pause className="h-7 w-7 fill-current" />
                ) : (
                  <Play className="h-8 w-8 translate-x-0.5 fill-current" />
                )}
              </span>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
