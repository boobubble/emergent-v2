import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 8;
const PANEL_MAX_WIDTH = 340;
const PANEL_HEIGHT_ESTIMATE = 280;

type PanelPlacement = {
  left: number;
  top: number;
  transform: string;
};

function panelWidthPx(): number {
  return Math.min(window.innerWidth - VIEWPORT_MARGIN * 2, PANEL_MAX_WIDTH);
}

function computePanelPlacement(
  anchor: DOMRect,
  panelHeight: number,
  panelWidth: number,
): PanelPlacement {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(anchor.left, vw - VIEWPORT_MARGIN - panelWidth),
  );

  const spaceAbove = anchor.top - VIEWPORT_MARGIN;
  const spaceBelow = vh - anchor.bottom - VIEWPORT_MARGIN;
  const need = panelHeight + ANCHOR_GAP;

  const fitsAbove = need <= spaceAbove;
  const fitsBelow = need <= spaceBelow;

  if (fitsAbove || (!fitsBelow && spaceAbove >= spaceBelow)) {
    const anchorLine = anchor.top - ANCHOR_GAP;
    const top = Math.max(VIEWPORT_MARGIN + panelHeight, anchorLine);
    return { left, top, transform: "translateY(-100%)" };
  }

  const belowTop = anchor.bottom + ANCHOR_GAP;
  const maxTop = vh - VIEWPORT_MARGIN - panelHeight;
  return {
    left,
    top: Math.max(VIEWPORT_MARGIN, Math.min(belowTop, maxTop)),
    transform: "none",
  };
}

export function IrcComposerPickerPortal({
  open,
  onClose,
  anchorRef,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<PanelPlacement | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPlacement(null);
      return;
    }
    const anchor = anchorRef.current;
    if (!anchor) return;

    const update = () => {
      const rect = anchor.getBoundingClientRect();
      const width = panelWidthPx();
      const measured = panelRef.current?.getBoundingClientRect().height;
      const height = measured && measured > 0 ? measured : PANEL_HEIGHT_ESTIMATE;
      setPlacement(computePanelPlacement(rect, height, width));
    };

    let ro: ResizeObserver | null = null;

    update();
    const raf = requestAnimationFrame(() => {
      update();
      const panel = panelRef.current;
      if (panel && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(update);
        ro.observe(panel);
      }
    });

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      ro?.disconnect();
    };
  }, [open, anchorRef]);

  if (!open || !placement || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[100]"
        aria-hidden
        onPointerDown={(ev) => {
          ev.preventDefault();
          onClose();
        }}
      />
      <div
        ref={panelRef}
        className={cn("fixed z-[101] w-[min(100vw-1rem,340px)]", className)}
        style={{
          left: placement.left,
          top: placement.top,
          transform: placement.transform,
        }}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
