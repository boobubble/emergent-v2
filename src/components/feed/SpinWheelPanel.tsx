import { useState } from "react";
import { motion } from "framer-motion";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { spinDailyWheel } from "@/lib/rewards.functions";

const SEGMENTS = [
  { label: "+10 🪙", color: "#fbbf24" },
  { label: "+20 🪙", color: "#f59e0b" },
  { label: "+25 ⭐", color: "#a78bfa" },
  { label: "+50 🪙", color: "#fb7185" },
  { label: "+50 ⭐", color: "#22d3ee" },
  { label: "+100 🪙", color: "#f43f5e" },
];

export function SpinWheelPanel({ onBack }: { onBack: () => void }) {
  const spin = useServerFn(spinDailyWheel);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSpin() {
    if (spinning || done) return;
    setSpinning(true);
    setResult(null);
    try {
      const res = await spin();
      if (res.alreadyClaimed) {
        toast.info("You've already spun today — come back tomorrow!");
        setDone(true);
        setSpinning(false);
        return;
      }
      const segIdx = res.prizeIndex % SEGMENTS.length;
      const segAngle = 360 / SEGMENTS.length;
      // land on selected segment center, plus 5 full turns
      const target = 360 * 5 + (360 - (segIdx * segAngle + segAngle / 2));
      setRotation(target);
      setTimeout(() => {
        setSpinning(false);
        setDone(true);
        setResult(SEGMENTS[segIdx].label);
        toast.success(`Daily spin: ${SEGMENTS[segIdx].label}`);
      }, 3200);
    } catch (e) {
      setSpinning(false);
      toast.error(e instanceof Error ? e.message : "Spin failed");
    }
  }

  const segAngle = 360 / SEGMENTS.length;
  const gradient = SEGMENTS.map((s, i) => `${s.color} ${i * segAngle}deg ${(i + 1) * segAngle}deg`).join(", ");

  return (
    <div>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <h1 className="flex items-center gap-2 text-xl font-bold">
        <Sparkles className="h-5 w-5 text-violet-500" /> Daily Spin
      </h1>
      <p className="mt-1 text-xs text-muted-foreground">One free spin every day. No purchases, no gambling — just bonus rewards.</p>

      <div className="mt-6 grid place-items-center">
        <div className="relative">
          {/* pointer */}
          <div className="absolute left-1/2 -top-2 z-10 -translate-x-1/2">
            <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-foreground" />
          </div>
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid h-64 w-64 place-items-center rounded-full shadow-xl ring-4 ring-border"
            style={{ background: `conic-gradient(${gradient})` }}
          >
            {SEGMENTS.map((s, i) => {
              const angle = i * segAngle + segAngle / 2;
              return (
                <div
                  key={i}
                  className="absolute text-xs font-bold text-white drop-shadow"
                  style={{
                    transform: `rotate(${angle}deg) translateY(-90px) rotate(${-angle}deg)`,
                  }}
                >
                  {s.label}
                </div>
              );
            })}
            <div className="absolute h-12 w-12 rounded-full bg-background ring-2 ring-border" />
          </motion.div>
        </div>

        <button
          onClick={onSpin}
          disabled={spinning || done}
          className="mt-6 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {spinning ? "Spinning…" : done ? "Come back tomorrow" : "Spin!"}
        </button>
        {result && (
          <div className="mt-3 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-bold text-primary">You won {result}</div>
        )}
      </div>
    </div>
  );
}
