import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Reaction {
  id: string;
  emoji: string;
  x: number;
}

const EMOJIS = ["❤️", "🔥", "👏", "🎉", "⭐", "💜"];

/**
 * Full-viewport, pointer-events-none overlay that fires transient emoji
 * bursts whenever any viewer casts a vote (via broadcast channel).
 */
export function FloatingReactions({ competitionId }: { competitionId: string }) {
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    if (!competitionId) return;
    const ch = supabase
      .channel(`comp-broadcast:${competitionId}`, { config: { broadcast: { self: true } } })
      .on("broadcast", { event: "vote" }, () => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        const x = 20 + Math.random() * 60; // 20–80% viewport width
        setReactions((prev) => [...prev.slice(-8), { id, emoji, x }]);
        setTimeout(() => {
          setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 2200);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [competitionId]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.span
            key={r.id}
            initial={{ opacity: 0, y: 40, scale: 0.6 }}
            animate={{ opacity: [0, 1, 1, 0], y: -160, scale: [0.6, 1.2, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.1, ease: "easeOut" }}
            style={{ left: `${r.x}%`, bottom: "18%" }}
            className="absolute text-3xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
          >
            {r.emoji}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
