import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  isRtDebugEnabled,
  rtCounters,
  rtClear,
  rtSubscribe,
  setRtDebugEnabled,
  type RtEvent,
  type RtEventKind,
} from "@/lib/realtime-debug";

const KIND_COLOR: Record<RtEventKind, string> = {
  ws: "text-blue-400",
  channel: "text-purple-400",
  presence: "text-emerald-400",
  dm: "text-pink-400",
  msg: "text-cyan-400",
  typing: "text-amber-400",
  heartbeat: "text-zinc-400",
  auth: "text-orange-400",
  error: "text-red-400",
};

export function RealtimeDebugOverlay() {
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<RtEvent[]>([]);
  const [uid, setUid] = useState<string | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    setEnabled(isRtDebugEnabled());
    const onToggle = () => setEnabled(isRtDebugEnabled());
    window.addEventListener("palrgo:rt-debug-toggle", onToggle);
    return () => window.removeEventListener("palrgo:rt-debug-toggle", onToggle);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    return rtSubscribe(evts => setEvents([...evts]));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    supabase.auth.getUser().then(({ data }) => setUid(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setUid(s?.user?.id ?? null);
    });
    const id = window.setInterval(() => force(t => t + 1), 1000);
    return () => { sub.subscription.unsubscribe(); window.clearInterval(id); };
  }, [enabled]);

  if (!enabled) return null;

  const channels = (() => {
    try { return supabase.getChannels().map(c => ({ topic: c.topic, state: c.state })); }
    catch { return []; }
  })();

  const last = events.slice(-50).reverse();
  const lastBeat = rtCounters.lastHeartbeatAt
    ? `${Math.max(0, Math.round((Date.now() - rtCounters.lastHeartbeatAt) / 1000))}s ago`
    : "—";

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-[9999] font-mono text-[11px]">
      <div className="pointer-events-auto rounded-lg border border-white/10 bg-black/85 text-white shadow-2xl backdrop-blur">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5"
        >
          <span className={`h-2 w-2 rounded-full ${rtCounters.wsState === "SUBSCRIBED" || rtCounters.wsState === "open" ? "bg-emerald-400" : "bg-amber-400"}`} />
          <span className="font-semibold">RT</span>
          <span className="opacity-70">{rtCounters.wsState}</span>
          <span className="opacity-50">·</span>
          <span className="opacity-70">ch:{channels.length}</span>
          <span className="opacity-70">in:{rtCounters.msgIn + rtCounters.dmIn}</span>
          <span className="opacity-70">↺{rtCounters.wsConnects}</span>
          <span className="ml-2 opacity-50">{open ? "▾" : "▸"}</span>
        </button>
        {open && (
          <div className="w-[360px] max-w-[90vw] border-t border-white/10 p-2">
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-1 pb-2 text-[10px]">
              <div>uid: <span className="opacity-80">{uid ? `${uid.slice(0, 8)}…` : "—"}</span></div>
              <div>beat: <span className="opacity-80">{lastBeat}</span></div>
              <div>conn↑/↓: <span className="opacity-80">{rtCounters.wsConnects}/{rtCounters.wsDisconnects}</span></div>
              <div>ch err: <span className="opacity-80">{rtCounters.channelErrors}</span></div>
              <div>dm in/out: <span className="opacity-80">{rtCounters.dmIn}/{rtCounters.dmOut}</span></div>
              <div>presence j/l: <span className="opacity-80">{rtCounters.presenceJoins}/{rtCounters.presenceLeaves}</span></div>
            </div>
            <div className="mb-1 px-1 text-[10px] font-semibold opacity-60">CHANNELS</div>
            <div className="mb-2 max-h-24 overflow-auto rounded bg-white/5 p-1">
              {channels.length === 0 && <div className="px-1 opacity-50">none</div>}
              {channels.map((c, i) => (
                <div key={i} className="flex justify-between gap-2 px-1">
                  <span className="truncate">{c.topic}</span>
                  <span className="opacity-60">{c.state}</span>
                </div>
              ))}
            </div>
            <div className="mb-1 flex items-center justify-between px-1 text-[10px] font-semibold opacity-60">
              <span>EVENTS</span>
              <div className="flex gap-2">
                <button onClick={rtClear} className="opacity-70 hover:opacity-100">clear</button>
                <button onClick={() => { setRtDebugEnabled(false); setOpen(false); }} className="opacity-70 hover:opacity-100">off</button>
              </div>
            </div>
            <div className="max-h-64 overflow-auto rounded bg-white/5 p-1">
              {last.length === 0 && <div className="px-1 opacity-50">no events yet</div>}
              {last.map(e => (
                <div key={e.id} className="flex gap-2 px-1 leading-snug">
                  <span className="opacity-50 tabular-nums">{new Date(e.ts).toLocaleTimeString().slice(0, 8)}</span>
                  <span className={`w-[60px] shrink-0 ${KIND_COLOR[e.kind]}`}>{e.kind}</span>
                  <span className="truncate" title={e.detail}>{e.label}{e.detail ? ` · ${e.detail}` : ""}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
