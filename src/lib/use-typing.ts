import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { rtLog } from "@/lib/realtime-debug";

export interface Typer { id: string; name: string; ts: number }

// How long after the last keystroke we consider the user "stopped typing".
const IDLE_MS = 2500;
// How often we re-broadcast while continuously typing (throttle).
const HEARTBEAT_MS = 1500;
// Safety: drop stale typers if no heartbeat / stop arrives.
const STALE_MS = 3000;

/**
 * Broadcast-based "user is typing" indicator for a channel.
 * - Sends a heartbeat at most every HEARTBEAT_MS while typing
 * - Automatically emits a "stop" broadcast IDLE_MS after the last keystroke
 * - Receivers clear typers on explicit stop or after STALE_MS without a heartbeat
 */
export function useTyping(channelId: string | null, me: { id: string; name: string } | null, enabled: boolean) {
  const [typers, setTypers] = useState<Typer[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSentRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!channelId || !me) return;
    const ch = supabase.channel(`typing:${channelId}`, {
      config: { broadcast: { self: false } },
    });
    ch.on("broadcast", { event: "typing" }, (msg) => {
      const p = msg.payload as { id?: string; name?: string };
      const pid = p?.id;
      const pname = p?.name;
      if (!pid || !pname || pid === me.id) return;
      rtLog("typing", "in", `${pname} @ ${channelId}`);
      setTypers(prev => {
        const others = prev.filter(t => t.id !== pid);
        return [...others, { id: pid, name: pname, ts: Date.now() }];
      });
    });
    ch.on("broadcast", { event: "stop" }, (msg) => {
      const p = msg.payload as { id?: string };
      const pid = p?.id;
      if (!pid || pid === me.id) return;
      setTypers(prev => prev.filter(t => t.id !== pid));
    });
    ch.subscribe(status => rtLog("ws", status, `typing:${channelId}`));
    channelRef.current = ch;
    return () => {
      // tell others we stopped on unmount
      if (isTypingRef.current) {
        void ch.send({ type: "broadcast", event: "stop", payload: { id: me.id } });
      }
      supabase.removeChannel(ch);
      channelRef.current = null;
      isTypingRef.current = false;
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      setTypers([]);
    };
  }, [channelId, me?.id, me?.name]);

  // Safety net: drop stale typers if heartbeats stop arriving (peer crashed/disconnected)
  useEffect(() => {
    const i = setInterval(() => {
      setTypers(prev => {
        const fresh = prev.filter(t => Date.now() - t.ts < STALE_MS);
        return fresh.length === prev.length ? prev : fresh;
      });
    }, 500);
    return () => clearInterval(i);
  }, []);

  function emitStop() {
    if (!channelRef.current || !me) return;
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    void channelRef.current.send({
      type: "broadcast",
      event: "stop",
      payload: { id: me.id },
    });
  }

  function sendTyping() {
    if (!enabled || !me || !channelRef.current) return;
    const now = Date.now();
    if (now - lastSentRef.current >= HEARTBEAT_MS) {
      lastSentRef.current = now;
      isTypingRef.current = true;
      void channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { id: me.id, name: me.name },
      });
    }
    // Reset the idle timer on every keystroke; fires "stop" after IDLE_MS of silence.
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      emitStop();
      lastSentRef.current = 0;
    }, IDLE_MS);
  }

  /** Call when the message is sent — clears typing immediately. */
  function stopTyping() {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    lastSentRef.current = 0;
    emitStop();
  }

  const visible = typers.filter(t => Date.now() - t.ts < STALE_MS);
  return { typers: visible, sendTyping, stopTyping };
}
