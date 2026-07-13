import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { AnimatedCounter } from "./AnimatedCounter";

/**
 * Live audience counter using Supabase Realtime presence.
 * Every viewer on the same competition page joins the same channel;
 * `presenceState()` gives the concurrent watcher count.
 */
export function AudienceCounter({ competitionId }: { competitionId: string }) {
  const { user } = useAuth();
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!competitionId) return;
    const key = user?.id ?? `guest-${Math.random().toString(36).slice(2, 10)}`;
    const channel = supabase.channel(`comp-presence:${competitionId}`, {
      config: { presence: { key } },
    });

    const recount = () => {
      const state = channel.presenceState();
      const n = Object.keys(state).length;
      setCount(n > 0 ? n : 1);
    };

    channel
      .on("presence", { event: "sync" }, recount)
      .on("presence", { event: "join" }, recount)
      .on("presence", { event: "leave" }, recount)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ at: Date.now() });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [competitionId, user?.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-200"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <Eye className="h-2.5 w-2.5" />
      <AnimatedCounter value={count} /> watching
    </motion.div>
  );
}
