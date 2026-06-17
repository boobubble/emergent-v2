import { useRef, useState, type ReactNode } from "react";
import { Loader2, ArrowDown } from "lucide-react";

type Props = {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
  /** Pixels to pull before triggering refresh */
  threshold?: number;
  /** Maximum pull distance (resistance cap) */
  max?: number;
  className?: string;
};

/**
 * Lightweight pull-to-refresh wrapper. Activates only when the nearest
 * scrolling ancestor (window) is at scrollTop = 0 and the user pulls down.
 * Designed for mobile; desktop users can simply ignore it.
 */
export function PullToRefresh({
  onRefresh,
  children,
  threshold = 70,
  max = 120,
  className = "",
}: Props) {
  const startY = useRef<number | null>(null);
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = (e: React.TouchEvent) => {
    if (refreshing) return;
    if (window.scrollY > 0) {
      startY.current = null;
      return;
    }
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0) {
      setPull(0);
      return;
    }
    // Resistance curve
    const eased = Math.min(max, dy * 0.55);
    setPull(eased);
  };

  const onTouchEnd = async () => {
    if (startY.current == null) return;
    startY.current = null;
    if (pull >= threshold && !refreshing) {
      setRefreshing(true);
      setPull(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setPull(0);
      }
    } else {
      setPull(0);
    }
  };

  const progress = Math.min(1, pull / threshold);
  const ready = progress >= 1;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      className={`relative ${className}`}
      style={{ touchAction: pull > 0 ? "none" : "pan-y" }}
    >
      {/* Indicator */}
      <div
        aria-hidden={!pull && !refreshing}
        className="pointer-events-none absolute left-0 right-0 top-0 z-10 flex justify-center"
        style={{
          height: `${pull}px`,
          opacity: pull > 6 || refreshing ? 1 : 0,
          transition: startY.current == null ? "height 220ms cubic-bezier(.2,.8,.2,1), opacity 180ms" : "none",
        }}
      >
        <div
          className="mt-2 flex h-9 w-9 items-center justify-center rounded-full feed-glass ring-1 ring-border shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]"
          style={{
            transform: `scale(${0.6 + 0.4 * progress})`,
            transition: startY.current == null ? "transform 200ms" : "none",
          }}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : (
            <ArrowDown
              className={`h-4 w-4 transition-transform ${ready ? "rotate-180 text-primary" : "text-muted-foreground"}`}
              style={{ transform: ready ? "rotate(180deg)" : `rotate(${progress * 180}deg)` }}
            />
          )}
        </div>
      </div>

      <div
        style={{
          transform: `translateY(${pull}px)`,
          transition: startY.current == null ? "transform 220ms cubic-bezier(.2,.8,.2,1)" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
