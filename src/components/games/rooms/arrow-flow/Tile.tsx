import type { Piece, Shape, Side } from "./logic";
import { endpoints } from "./logic";

/**
 * Renders a single Arrow Flow piece as SVG within a 100×100 viewBox.
 * The container div handles rotation via CSS transform so React only
 * re-renders on shape/state changes, not per-frame during animation.
 */
export function Tile({
  piece,
  powered,
  focused,
  solved,
  onTap,
  onSecondary,
}: {
  piece: Piece;
  size?: number;
  powered: boolean;
  focused: boolean;
  solved: boolean;
  onTap: () => void;
  onSecondary: () => void;
}) {

  const isNone = piece.shape === "none";
  const isSourceOrSink = piece.shape === "source" || piece.shape === "sink";
  const canInteract = !isNone && !piece.locked;

  return (
    <button
      type="button"
      onClick={canInteract ? onTap : undefined}
      onContextMenu={(e) => {
        if (!canInteract) return;
        e.preventDefault();
        onSecondary();
      }}
      onTouchStart={(e) => {
        if (!canInteract) return;
        const target = e.currentTarget;
        const timer = window.setTimeout(() => onSecondary(), 420);
        const cancel = () => {
          window.clearTimeout(timer);
          target.removeEventListener("touchend", cancel);
          target.removeEventListener("touchmove", cancel);
        };
        target.addEventListener("touchend", cancel, { once: true });
        target.addEventListener("touchmove", cancel, { once: true });
      }}
      disabled={!canInteract}
      aria-label={isNone ? "Empty tile" : `${piece.shape} piece, rotation ${piece.rot * 90}°`}
      className={[
        "group relative grid place-items-center rounded-2xl transition-all duration-150 outline-none",
        isNone
          ? "bg-transparent border border-dashed border-border/25"
          : "bg-card/40 border border-border/40 backdrop-blur-md shadow-sm",
        canInteract ? "hover:border-primary/50 hover:bg-card/60 active:scale-95" : "",
        focused ? "outline outline-2 outline-primary/70 outline-offset-2" : "",
        piece.locked ? "opacity-90 saturate-75" : "",
      ].join(" ")}
      style={{ width: "100%", height: "100%" }}
    >
      {!isNone && (
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center transition-transform"
          style={{
            transform: `rotate(${piece.rot * 90}deg)`,
            transitionDuration: "220ms",
            transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <PieceSvg
            shape={piece.shape}
            powered={powered}
            solved={solved}
            highlight={isSourceOrSink}
          />
        </div>
      )}
      {piece.shape === "source" && (
        <span
          className={[
            "pointer-events-none absolute inset-1 rounded-2xl ring-2 ring-emerald-400/60",
            powered ? "animate-pulse" : "",
          ].join(" ")}
        />
      )}
      {piece.shape === "sink" && (
        <span
          className={[
            "pointer-events-none absolute inset-1 rounded-2xl ring-2",
            solved ? "ring-amber-400 animate-pulse" : "ring-amber-400/30",
          ].join(" ")}
        />
      )}
      {piece.locked && !isNone && (
        <span className="pointer-events-none absolute right-1 top-1 rounded-full bg-background/80 px-1 text-[8px] font-bold text-muted-foreground">
          🔒
        </span>
      )}
    </button>
  );
}

function PieceSvg({ shape, powered, solved, highlight }: { shape: Shape; powered: boolean; solved: boolean; highlight: boolean }) {
  const strokeClass = solved
    ? "stroke-amber-400"
    : powered
    ? "stroke-primary"
    : "stroke-muted-foreground/70";
  const filterId = `glow-${shape}`;
  const glow = powered || solved;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" style={{ overflow: "visible" }}>
      {glow && (
        <defs>
          <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g
        className={strokeClass}
        fill="none"
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={glow ? `url(#${filterId})` : undefined}
      >
        {shape === "straight" && <line x1="50" y1="0" x2="50" y2="100" />}
        {shape === "curve" && <path d="M 100 50 Q 50 50 50 100" />}
        {shape === "tee" && (
          <>
            <line x1="0" y1="50" x2="100" y2="50" />
            <line x1="50" y1="50" x2="50" y2="100" />
          </>
        )}
        {shape === "cross" && (
          <>
            <line x1="0" y1="50" x2="100" y2="50" />
            <line x1="50" y1="0" x2="50" y2="100" />
          </>
        )}
        {shape === "source" && (
          <>
            <line x1="50" y1="50" x2="50" y2="100" />
            <circle cx="50" cy="42" r="14" fill="currentColor" className="fill-emerald-400" strokeWidth={0} />
          </>
        )}
        {shape === "sink" && (
          <>
            <line x1="50" y1="0" x2="50" y2="50" />
            <circle cx="50" cy="58" r="14" fill="currentColor" className={solved ? "fill-amber-400" : "fill-amber-400/40"} strokeWidth={0} />
          </>
        )}
      </g>
      {highlight && shape === "source" && (
        <text x="50" y="46" textAnchor="middle" className="fill-emerald-950 text-[14px] font-bold">S</text>
      )}
      {highlight && shape === "sink" && (
        <text x="50" y="62" textAnchor="middle" className="fill-amber-950 text-[14px] font-bold">G</text>
      )}
    </svg>
  );
}

export function _unused_endpoints(p: Piece): Side[] {
  return endpoints(p);
}
