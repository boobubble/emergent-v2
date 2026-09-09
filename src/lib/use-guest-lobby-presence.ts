/**
 * Ephemeral guest presence for the public Lobby channel.
 * Uses Supabase Realtime Presence only — no profiles rows or auth users.
 *
 * Browser Supabase is obtained via loadBrowserSupabase() inside async
 * lifecycle paths (never the eager client proxy).
 */

import { useEffect, useMemo, useState } from "react";
import { loadBrowserSupabase } from "@/integrations/supabase/load-browser";
import { rtLog } from "@/lib/realtime-debug";
import { GUEST_LOBBY_CHANNEL_ID } from "@/lib/guest-chat-config";
import type { User } from "@/lib/chat-types";

export const GUEST_LOBBY_PRESENCE_CHANNEL = "guest-lobby-presence";

type BrowserClient = Awaited<ReturnType<typeof loadBrowserSupabase>>;
type PresenceChannel = ReturnType<BrowserClient["channel"]>;

type GuestPresencePayload = {
  visitor_id: string;
  display_name: string;
  channel_id: string;
  online_at: string;
};

type GuestPresenceSnap = {
  byId: Record<string, { visitorId: string; displayName: string }>;
};

let snapshot: GuestPresenceSnap = { byId: {} };
const listeners = new Set<() => void>();

let sb: BrowserClient | null = null;
let channel: PresenceChannel | null = null;
let viewRefs = 0;
let activeTrack: GuestPresencePayload | null = null;
let heartbeatTimer: number | null = null;
let opGen = 0;

function emit() {
  for (const l of listeners) l();
}

function setSnap(byId: Record<string, { visitorId: string; displayName: string }>) {
  snapshot = { byId };
  emit();
}

function recomputePresence() {
  if (!channel) return;
  const state = channel.presenceState<GuestPresencePayload>();
  const byId: Record<string, { visitorId: string; displayName: string }> = {};
  for (const key of Object.keys(state)) {
    const metas = state[key] ?? [];
    for (const meta of metas) {
      const visitorId = meta?.visitor_id || key;
      const displayName = meta?.display_name;
      if (!visitorId || !displayName) continue;
      if (meta.channel_id && meta.channel_id !== GUEST_LOBBY_CHANNEL_ID) continue;
      byId[visitorId] = { visitorId, displayName };
    }
  }
  setSnap(byId);
}

function bindPresenceHandlers(ch: PresenceChannel) {
  ch.on("presence", { event: "sync" }, () => recomputePresence())
    .on("presence", { event: "join" }, () => recomputePresence())
    .on("presence", { event: "leave" }, () => recomputePresence());
}

async function ensureSupabase(): Promise<BrowserClient> {
  if (sb) return sb;
  sb = await loadBrowserSupabase();
  return sb;
}

async function openChannel(presenceKey?: string): Promise<PresenceChannel> {
  const client = await ensureSupabase();
  if (channel) return channel;
  const ch = client.channel(
    GUEST_LOBBY_PRESENCE_CHANNEL,
    presenceKey ? { config: { presence: { key: presenceKey } } } : {},
  );
  bindPresenceHandlers(ch);
  await new Promise<void>((resolve) => {
    ch.subscribe((status) => {
      rtLog("ws", status, "guest-lobby-presence");
      if (
        status === "SUBSCRIBED"
        || status === "CHANNEL_ERROR"
        || status === "TIMED_OUT"
        || status === "CLOSED"
      ) {
        recomputePresence();
        resolve();
      }
    });
  });
  channel = ch;
  return ch;
}

async function closeChannelIfIdle() {
  if (viewRefs > 0 || activeTrack) return;
  if (heartbeatTimer) {
    window.clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (channel && sb) {
    await sb.removeChannel(channel);
    channel = null;
  }
  setSnap({});
}

function startHeartbeat() {
  if (heartbeatTimer || typeof window === "undefined") return;
  heartbeatTimer = window.setInterval(() => {
    if (!activeTrack || !channel || document.visibilityState !== "visible") return;
    void channel.track({
      ...activeTrack,
      online_at: new Date().toISOString(),
    });
  }, 25_000);
}

function guestPayloadToUser(visitorId: string, displayName: string): User {
  return {
    id: visitorId,
    name: displayName,
    avatarColor: "oklch(0.62 0.02 250)",
    status: "online",
    lastSeen: Date.now(),
    isGuest: true,
    xp: 0,
    level: 1,
    badges: [],
    showGuestBadge: true,
  };
}

export async function trackGuestLobbyPresence(visitorId: string, displayName: string) {
  const gen = ++opGen;
  activeTrack = {
    visitor_id: visitorId,
    display_name: displayName,
    channel_id: GUEST_LOBBY_CHANNEL_ID,
    online_at: new Date().toISOString(),
  };
  const ch = await openChannel(visitorId);
  if (gen !== opGen || !activeTrack) return;
  await ch.track({ ...activeTrack });
  startHeartbeat();
  recomputePresence();
}

export async function untrackGuestLobbyPresence() {
  opGen += 1;
  activeTrack = null;
  if (heartbeatTimer) {
    window.clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  if (channel) {
    try {
      await channel.untrack();
    } catch {
      /* ignore */
    }
  }
  await closeChannelIfIdle();
}

async function addViewer() {
  viewRefs += 1;
  await openChannel(activeTrack?.visitor_id);
  recomputePresence();
}

async function removeViewer() {
  viewRefs = Math.max(0, viewRefs - 1);
  await closeChannelIfIdle();
}

export function useGuestLobbyPresence(enabled: boolean) {
  const [snap, setSnapState] = useState(snapshot);

  useEffect(() => {
    if (!enabled) {
      setSnapState({ byId: {} });
      return;
    }
    let cancelled = false;
    const fn = () => setSnapState({ ...snapshot });
    listeners.add(fn);
    void addViewer().then(() => {
      if (!cancelled) setSnapState({ ...snapshot });
    });
    return () => {
      cancelled = true;
      listeners.delete(fn);
      void removeViewer();
    };
  }, [enabled]);

  const guests = useMemo(
    () => Object.values(snap.byId).map((g) => guestPayloadToUser(g.visitorId, g.displayName)),
    [snap],
  );

  return { guests };
}
