import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useChat } from "@/lib/chat-store";
import { useAppSettings } from "@/lib/app-settings";

/**
 * Lightweight realtime presence overlay for the active public chatroom.
 *
 * - Does NOT touch the existing message store.
 * - Subscribes to a per-room Supabase Realtime presence channel.
 * - Emits a "join" system line only after a user has been continuously
 *   present for >= JOIN_DELAY_MS (default 10s).
 * - Emits a "leave" system line only after a user has been continuously
 *   absent for >= LEAVE_DELAY_MS (default 15s).
 * - Per-user cooldown prevents reconnect spam.
 * - Self events are suppressed.
 * - Toggle via app_settings.presence_messages (boolean, default true).
 */

const JOIN_DELAY_MS = 10_000;
const LEAVE_DELAY_MS = 15_000;
const COOLDOWN_MS = 60_000;
const VISIBLE_MS = 6_000;
const MAX_VISIBLE = 5;

interface PresenceEvent {
  id: string;
  kind: "join" | "leave";
  name: string;
}

interface TrackPayload {
  user_id: string;
  name: string;
}

export function PresenceFeed({ channelId }: { channelId: string }) {
  const { state, isDM } = useChat();
  const { raw } = useAppSettings();
  const enabled = raw.presence_messages !== false; // default ON
  const [events, setEvents] = useState<PresenceEvent[]>([]);

  // Stable ref for me to avoid re-subscribing on rename.
  const meRef = useRef({ id: "me", name: state.me.name });
  meRef.current = { id: state.me.name || "me", name: state.me.name };

  useEffect(() => {
    if (!enabled) return;
    if (isDM(channelId)) return;

    let cancelled = false;
    let pendingJoin = new Map<string, ReturnType<typeof setTimeout>>();
    let pendingLeave = new Map<string, ReturnType<typeof setTimeout>>();
    const lastJoinAt = new Map<string, number>();
    const lastLeaveAt = new Map<string, number>();
    let knownPresent = new Set<string>();

    function push(kind: "join" | "leave", name: string) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const ev: PresenceEvent = { id, kind, name };
      if (cancelled) return;
      setEvents(prev => {
        const next = [...prev, ev];
        return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
      });
      setTimeout(() => {
        if (cancelled) return;
        setEvents(prev => prev.filter(e => e.id !== id));
      }, VISIBLE_MS);
    }

    let userId = "anon-" + Math.random().toString(36).slice(2, 9);
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) userId = data.user.id;
    });

    const channel = supabase.channel(`room-presence:${channelId}`, {
      config: { presence: { key: meRef.current.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const stateMap = channel.presenceState<TrackPayload>();
        const presentNow = new Set<string>();
        const nameMap = new Map<string, string>();
        for (const key of Object.keys(stateMap)) {
          const metas = stateMap[key];
          if (!metas || !metas.length) continue;
          const uid = metas[0].user_id || key;
          presentNow.add(uid);
          if (metas[0].name) nameMap.set(uid, metas[0].name);
        }

        // Arrivals
        presentNow.forEach(uid => {
          if (uid === userId) return; // self
          if (knownPresent.has(uid)) {
            // Cancel pending leave if any
            const t = pendingLeave.get(uid);
            if (t) { clearTimeout(t); pendingLeave.delete(uid); }
            return;
          }
          // newly present
          if (pendingJoin.has(uid)) return;
          const t = setTimeout(() => {
            pendingJoin.delete(uid);
            const last = lastJoinAt.get(uid) || 0;
            if (Date.now() - last < COOLDOWN_MS) return;
            lastJoinAt.set(uid, Date.now());
            push("join", nameMap.get(uid) || "Someone");
          }, JOIN_DELAY_MS);
          pendingJoin.set(uid, t);
        });

        // Departures
        knownPresent.forEach(uid => {
          if (presentNow.has(uid)) return;
          if (uid === userId) return;
          // Cancel pending join if they never met the threshold
          const tj = pendingJoin.get(uid);
          if (tj) { clearTimeout(tj); pendingJoin.delete(uid); }
          if (pendingLeave.has(uid)) return;
          const nameForUid = nameMap.get(uid) || "Someone";
          const t = setTimeout(() => {
            pendingLeave.delete(uid);
            const last = lastLeaveAt.get(uid) || 0;
            if (Date.now() - last < COOLDOWN_MS) return;
            lastLeaveAt.set(uid, Date.now());
            push("leave", nameForUid);
          }, LEAVE_DELAY_MS);
          pendingLeave.set(uid, t);
        });

        knownPresent = presentNow;
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: userId, name: meRef.current.name });
        }
      });

    return () => {
      cancelled = true;
      pendingJoin.forEach(t => clearTimeout(t));
      pendingLeave.forEach(t => clearTimeout(t));
      pendingJoin = new Map();
      pendingLeave = new Map();
      void supabase.removeChannel(channel);
    };
  }, [channelId, enabled, isDM]);

  if (!enabled || isDM(channelId) || events.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 flex flex-col items-center gap-1 px-3">
      {events.map(ev => (
        <div
          key={ev.id}
          className="presence-msg pointer-events-none rounded-full border border-white/10 bg-background/60 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-md"
        >
          {ev.kind === "join" ? (
            <>
              <span className="mr-1">🟢</span>
              <span className="text-foreground/90">{ev.name}</span>{" "}
              <span className="opacity-75">joined the room</span>
            </>
          ) : (
            <>
              <span className="mr-1">👋</span>
              <span className="text-foreground/90">{ev.name}</span>{" "}
              <span className="opacity-75">left the room</span>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
