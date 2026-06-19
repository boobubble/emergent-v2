import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

/**
 * Renders a real first-frame thumbnail for a local video File.
 * Uses an offscreen <video> + canvas to snapshot frame 0.
 */
export function VideoThumb({ file, className }: { file: File; className?: string }) {
  const [thumb, setThumb] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.crossOrigin = "anonymous";

    let cancelled = false;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    const capture = () => {
      try {
        const w = video.videoWidth || 320;
        const h = video.videoHeight || 240;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        if (!cancelled) setThumb(canvas.toDataURL("image/jpeg", 0.7));
      } catch {
        // ignore — fall back to blank thumb
      } finally {
        cleanup();
      }
    };

    const onLoaded = () => {
      // Seek a tiny bit in to avoid black first frames in some codecs.
      try {
        video.currentTime = Math.min(0.1, (video.duration || 1) / 2);
      } catch {
        capture();
      }
    };
    const onSeeked = () => capture();
    const onError = () => cleanup();

    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("seeked", onSeeked);
    video.addEventListener("error", onError);

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("seeked", onSeeked);
      video.removeEventListener("error", onError);
      cleanup();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [file]);

  return (
    <div className={`relative h-full w-full bg-black ${className ?? ""}`}>
      {thumb ? (
        <img src={thumb} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="h-full w-full animate-pulse bg-neutral-800" />
      )}
      <div className="absolute inset-0 grid place-items-center bg-black/20">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-black/60 backdrop-blur">
          <Play className="h-3.5 w-3.5 fill-white text-white" />
        </div>
      </div>
    </div>
  );
}
