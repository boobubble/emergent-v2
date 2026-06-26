import { useEffect, useRef, useState } from "react";
import { Play, Pause, Loader2, Mic } from "lucide-react";
import type { Attachment } from "@/lib/chat-types";

interface Props { a: Attachment; }

function fmt(s: number) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const ss = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
}

// 28 pseudo-random but stable bar heights derived from attachment name.
function bars(seed: string, n = 28): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(0.25 + ((h >>> 8) % 100) / 130); // 0.25 - ~1.0
  }
  return out;
}

export function VoiceNoteBubble({ a }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState<number>(a.duration ?? 0);
  const heights = bars(a.name);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCur(el.currentTime);
    const onMeta = () => { if (isFinite(el.duration) && el.duration > 0) setDur(el.duration); };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnd = () => { setPlaying(false); setCur(0); };
    const onWait = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onPlaying = () => setBuffering(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnd);
    el.addEventListener("waiting", onWait);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("playing", onPlaying);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("waiting", onWait);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("playing", onPlaying);
    };
  }, []);

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) { setBuffering(true); void el.play().catch(() => setBuffering(false)); }
    else el.pause();
  }

  function seekTo(ratio: number) {
    const el = audioRef.current;
    if (!el || !dur) return;
    el.currentTime = Math.max(0, Math.min(dur, ratio * dur));
    setCur(el.currentTime);
  }

  function onBarClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  }

  const progress = dur > 0 ? Math.min(1, cur / dur) : 0;
  const litCount = Math.round(progress * heights.length);

  return (
    <div className="mt-1 flex w-[260px] max-w-full items-center gap-2 rounded-2xl border border-border bg-white/5 px-2.5 py-2 shadow-sm">
      <audio ref={audioRef} src={a.dataUrl} preload="metadata" className="hidden" />
      <button
        onClick={toggle}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95"
        aria-label={playing ? "Pause voice note" : "Play voice note"}
      >
        {buffering ? <Loader2 className="h-4 w-4 animate-spin" /> : playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-[1px]" />}
      </button>
      <div className="min-w-0 flex-1">
        <div
          role="slider"
          aria-valuemin={0}
          aria-valuemax={Math.max(1, Math.floor(dur))}
          aria-valuenow={Math.floor(cur)}
          aria-label="Voice note progress"
          onClick={onBarClick}
          className="group flex h-7 cursor-pointer items-end gap-[2px]"
        >
          {heights.map((h, i) => (
            <span
              key={i}
              className={`block w-[3px] rounded-full transition-colors ${i < litCount ? "bg-primary" : "bg-foreground/25"}`}
              style={{ height: `${Math.round(h * 100)}%` }}
            />
          ))}
        </div>
        <div className="mt-0.5 flex items-center justify-between text-[10px] tabular-nums text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Mic className="h-2.5 w-2.5" /> {fmt(cur)} / {fmt(dur)}</span>
          {buffering && <span className="text-primary/80">buffering…</span>}
        </div>
      </div>
    </div>
  );
}
