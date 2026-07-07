import { useEffect, useMemo } from "react";
import { Tile } from "./Tile";
import type { Level } from "./logic";

export function ArrowFlowBoard({
  level,
  powered,
  solved,
  focused,
  setFocused,
  onRotate,
  onReverse,
}: {
  level: Level;
  powered: Set<number>;
  solved: boolean;
  focused: number;
  setFocused: (i: number) => void;
  onRotate: (i: number) => void;
  onReverse: (i: number) => void;
}) {
  const size = level.gridSize;
  const tileSize = useMemo(() => {
    // Fit board within min(vw, vh) - some chrome. Actual sizing via CSS grid.
    return `min(78vw / ${size}, 62vh / ${size}, 100px)`;
  }, [size]);

  // Keyboard controls scoped to the board container.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const r = Math.floor(focused / size);
      const c = focused % size;
      let next = focused;
      if (e.key === "ArrowUp" && r > 0) next = (r - 1) * size + c;
      else if (e.key === "ArrowDown" && r < size - 1) next = (r + 1) * size + c;
      else if (e.key === "ArrowLeft" && c > 0) next = r * size + (c - 1);
      else if (e.key === "ArrowRight" && c < size - 1) next = r * size + (c + 1);
      else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) onReverse(focused); else onRotate(focused);
        return;
      } else return;
      if (next !== focused) {
        e.preventDefault();
        setFocused(next);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focused, size, setFocused, onRotate, onReverse]);

  return (
    <div className="grid h-full w-full place-items-center px-2 py-3">
      <div
        className="grid gap-1.5 rounded-3xl border border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 p-3 backdrop-blur-xl md:gap-2 md:p-4"
        style={{
          gridTemplateColumns: `repeat(${size}, ${tileSize})`,
          gridTemplateRows: `repeat(${size}, ${tileSize})`,
        }}
      >
        {level.pieces.map((piece, i) => (
          <div key={i} className="h-full w-full">
            <Tile
              piece={piece}
              size={0}
              powered={powered.has(i)}
              focused={focused === i}
              solved={solved && powered.has(i)}
              onTap={() => { setFocused(i); onRotate(i); }}
              onSecondary={() => { setFocused(i); onReverse(i); }}
            />
          </div>

        ))}
      </div>
    </div>
  );
}
