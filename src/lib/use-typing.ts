import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { rtLog } from "@/lib/realtime-debug";

export interface Typer { id: string; name: string; ts: number }

/**
 * Broadcast-based "user is typing" indicator for a channel.
 * Only registered users participate; pass enabled=false for guests so they
 * neither send nor reveal a presence event.
 */
export function useTyping(channelId: string | null, me: { id: string; name: string } | null, enabled: boolean) {
  const [typers, setTypers] = useState<Typer[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSentRef = useRef(0);

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
      setTypers(prev => {
        const others = prev.filter(t => t.id !== pid);
        return [...others, { id: pid, name: pname, ts: Date.now() }];
      });
    });
    ch.subscribe();
    channelRef.current = ch;
    return () => {
      supabase.removeChannel(ch);
      channelRef.current = null;
      setTypers([]);
    };
  }, [channelId, me?.id, me?.name]);

  // Expire stale typers
  useEffect(() => {
    const i = setInterval(() => {
      setTypers(prev => {
        const fresh = prev.filter(t => Date.now() - t.ts < 3500);
        return fresh.length === prev.length ? prev : fresh;
      });
    }, 1000);
    return () => clearInterval(i);
  }, []);

  function sendTyping() {
    if (!enabled || !me || !channelRef.current) return;
    const now = Date.now();
    if (now - lastSentRef.current < 1500) return;
    lastSentRef.current = now;
    void channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: { id: me.id, name: me.name },
    });
  }

  const visible = typers.filter(t => Date.now() - t.ts < 3500);
  return { typers: visible, sendTyping };
}
