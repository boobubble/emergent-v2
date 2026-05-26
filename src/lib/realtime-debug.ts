// Lightweight pub/sub event bus + ring buffer for realtime diagnostics.
// Always-on (cheap), but the overlay UI is dev-only / opt-in.

export type RtEventKind =
  | "ws"            // websocket connection state
  | "channel"       // subscribe/unsubscribe
  | "presence"      // join/leave/sync
  | "dm"            // dm message in/out
  | "msg"           // lobby/room message in
  | "typing"        // typing broadcast
  | "heartbeat"     // presence heartbeat ping
  | "auth"          // auth user changed
  | "error";

export interface RtEvent {
  id: number;
  ts: number;
  kind: RtEventKind;
  label: string;
  detail?: string;
}

const MAX_EVENTS = 200;
let nextId = 1;
const buffer: RtEvent[] = [];
const listeners = new Set<(events: RtEvent[]) => void>();

// Cumulative health counters
export const rtCounters = {
  wsConnects: 0,
  wsDisconnects: 0,
  channelSubs: 0,
  channelErrors: 0,
  presenceJoins: 0,
  presenceLeaves: 0,
  dmIn: 0,
  dmOut: 0,
  msgIn: 0,
  heartbeats: 0,
  lastHeartbeatAt: 0 as number,
  wsState: "unknown" as string,
};

function notify() {
  for (const l of listeners) l(buffer);
}

export function rtLog(kind: RtEventKind, label: string, detail?: string) {
  const evt: RtEvent = { id: nextId++, ts: Date.now(), kind, label, detail };
  buffer.push(evt);
  if (buffer.length > MAX_EVENTS) buffer.splice(0, buffer.length - MAX_EVENTS);

  // Update counters
  switch (kind) {
    case "ws":
      rtCounters.wsState = label;
      if (label === "open" || label === "SUBSCRIBED") rtCounters.wsConnects++;
      if (label === "close" || label === "CHANNEL_ERROR" || label === "TIMED_OUT") rtCounters.wsDisconnects++;
      break;
    case "channel":
      if (label.startsWith("subscribe")) rtCounters.channelSubs++;
      if (label.includes("error")) rtCounters.channelErrors++;
      break;
    case "presence":
      if (label === "join") rtCounters.presenceJoins++;
      else if (label === "leave") rtCounters.presenceLeaves++;
      break;
    case "dm":
      if (label === "in") rtCounters.dmIn++;
      else if (label === "out") rtCounters.dmOut++;
      break;
    case "msg":
      rtCounters.msgIn++;
      break;
    case "heartbeat":
      rtCounters.heartbeats++;
      rtCounters.lastHeartbeatAt = evt.ts;
      break;
  }
  notify();
}

export function rtSubscribe(cb: (events: RtEvent[]) => void): () => void {
  listeners.add(cb);
  cb(buffer);
  return () => listeners.delete(cb);
}

export function rtClear() {
  buffer.length = 0;
  notify();
}

const STORAGE_KEY = "palrgo:rt-debug";

export function isRtDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).has("debug")) return true;
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setRtDebugEnabled(enabled: boolean) {
  try {
    if (enabled) localStorage.setItem(STORAGE_KEY, "1");
    else localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("palrgo:rt-debug-toggle"));
  } catch { /* noop */ }
}
