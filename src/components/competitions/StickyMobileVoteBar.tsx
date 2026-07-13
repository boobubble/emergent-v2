import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Sticky bottom vote CTA visible on mobile only.
 * Hidden if user already voted or voting isn't open.
 */
export function StickyMobileVoteBar({
  canVote,
  hasVoted,
  onClick,
  label = "Vote Now",
}: {
  canVote: boolean;
  hasVoted: boolean;
  onClick: () => void;
  label?: string;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!canVote || hasVoted) {
      setShow(false);
      return;
    }
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [canVote, hasVoted]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
          className="fixed inset-x-0 bottom-3 z-40 mx-auto flex w-max max-w-[92%] items-center gap-2 rounded-full border border-white/10 bg-black/70 px-2 py-2 backdrop-blur-xl shadow-[0_20px_50px_-20px_rgba(244,63,94,0.6)] md:hidden"
        >
          <Button
            onClick={onClick}
            className="h-9 rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 px-4 text-xs font-black text-white shadow-lg hover:brightness-110"
          >
            <Vote className="mr-1.5 h-3.5 w-3.5" />
            {label}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
