import { useEffect, useRef, useState } from "react";
import { Mic, Square, Send, X } from "lucide-react";
import { toast } from "sonner";
import type { Attachment } from "@/lib/chat-types";

const MAX_VOICE_BYTES = 4 * 1024 * 1024; // 4MB

interface Props {
  maxSeconds: number;
  onSend: (a: Attachment) => void;
  onClose: () => void;
}

export function VoiceRecorder({ maxSeconds, onSend, onClose }: Props) {
  const [phase, setPhase] = useState<"idle" | "recording" | "preview">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [preview, setPreview] = useState<{ dataUrl: string; size: number; duration: number } | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startTsRef = useRef<number>(0);

  useEffect(() => {
    void start();
    return () => { void cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4" : "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => finalize();
      mediaRef.current = rec;
      rec.start();
      startTsRef.current = Date.now();
      setPhase("recording");
      timerRef.current = window.setInterval(() => {
        const s = Math.floor((Date.now() - startTsRef.current) / 1000);
        setElapsed(s);
        if (s >= maxSeconds) stop();
      }, 200);
    } catch (e) {
      toast.error("Microphone unavailable", { description: e instanceof Error ? e.message : "Permission denied" });
      onClose();
    }
  }

  function stop() {
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  async function cleanup() {
    if (timerRef.current) clearInterval(timerRef.current);
    try { mediaRef.current?.state !== "inactive" && mediaRef.current?.stop(); } catch { /* noop */ }
    streamRef.current?.getTracks().forEach(t => t.stop());
  }

  async function finalize() {
    const dur = Math.max(1, Math.floor((Date.now() - startTsRef.current) / 1000));
    const blob = new Blob(chunksRef.current, { type: mediaRef.current?.mimeType || "audio/webm" });
    if (blob.size > MAX_VOICE_BYTES) {
      toast.error("Voice note too large", { description: "Try a shorter recording." });
      onClose();
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
    setPreview({ dataUrl, size: blob.size, duration: dur });
    setPhase("preview");
    streamRef.current?.getTracks().forEach(t => t.stop());
  }

  function send() {
    if (!preview) return;
    onSend({
      kind: "file",
      name: `voice-note-${preview.duration}s.webm`,
      mime: "audio/webm",
      size: preview.size,
      dataUrl: preview.dataUrl,
      duration: preview.duration,
    });
    onClose();
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const remaining = Math.max(0, maxSeconds - elapsed);

  return (
    <div className="mb-2 rounded-2xl border border-border bg-card/80 p-3 shadow-lg backdrop-blur-md">
      {phase === "recording" && (() => {
        const pct = Math.min(100, (elapsed / Math.max(1, maxSeconds)) * 100);
        const ring = `conic-gradient(hsl(var(--primary)) ${pct}%, hsl(var(--muted)) ${pct}% 100%)`;
        const warn = remaining <= 5;
        return (
          <div className="flex items-center gap-3">
            <div className="relative grid h-12 w-12 place-items-center rounded-full" style={{ background: ring }} aria-label={`Recording, ${remaining} seconds left`}>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-card">
                <span className={`h-2.5 w-2.5 rounded-full bg-red-500 ${warn ? "animate-ping" : "animate-pulse"}`} />
              </span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold tabular-nums">Recording… {mm}:{ss}</div>
              <div className={`text-xs tabular-nums ${warn ? "font-semibold text-destructive" : "text-muted-foreground"}`}>
                {remaining}s left (max {maxSeconds}s)
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-[width] duration-200" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:text-destructive" title="Cancel">
              <X className="h-4 w-4" />
            </button>
            <button onClick={stop} className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform" title="Stop">
              <Square className="h-4 w-4" />
            </button>
          </div>
        );
      })()}
      {phase === "preview" && preview && (
        <div className="flex items-center gap-3">
          <Mic className="h-5 w-5 text-primary" />
          <audio src={preview.dataUrl} controls className="h-10 flex-1" />
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:text-destructive" title="Discard">
            <X className="h-4 w-4" />
          </button>
          <button onClick={send} className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-transform" title="Send">
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
      {phase === "idle" && (
        <div className="text-xs text-muted-foreground">Requesting microphone…</div>
      )}
    </div>
  );
}
