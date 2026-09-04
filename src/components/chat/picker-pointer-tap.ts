import type { MouseEvent, PointerEvent } from "react";

/** Movement beyond this is a scroll/drag, not a tap. Matches typical mobile touch slop. */
export const PICKER_TAP_MOVE_THRESHOLD_PX = 10;

type Origin = { x: number; y: number; id: number };

const origins = new WeakMap<EventTarget, Origin>();

function isPrimaryPointer(ev: { pointerType?: string; button: number }) {
  return ev.pointerType !== "mouse" || ev.button === 0;
}

/** Record the pointer origin. Do not select yet — the gesture may become a scroll. */
export function rememberPickerPointerOrigin(ev: PointerEvent) {
  if (!isPrimaryPointer(ev)) return;
  origins.set(ev.currentTarget, {
    x: ev.clientX,
    y: ev.clientY,
    id: ev.pointerId,
  });
}

export function forgetPickerPointerOrigin(ev: PointerEvent) {
  origins.delete(ev.currentTarget);
}

/**
 * True when pointerup is a tap on the same element (same pointer, movement within threshold).
 * Clears the stored origin. Callers should preventDefault on a committing tap so a leftover
 * click cannot land on the toolbar toggle after the picker unmounts (PR #15).
 */
export function isPickerPointerTap(ev: PointerEvent): boolean {
  const start = origins.get(ev.currentTarget);
  origins.delete(ev.currentTarget);
  if (!start || start.id !== ev.pointerId) return false;
  if (!isPrimaryPointer(ev)) return false;
  const dx = ev.clientX - start.x;
  const dy = ev.clientY - start.y;
  return dx * dx + dy * dy <= PICKER_TAP_MOVE_THRESHOLD_PX * PICKER_TAP_MOVE_THRESHOLD_PX;
}

/** Shared emoji/sticker cell handlers: tap selects, scroll/drag does not. */
export function pickerItemPointerHandlers(onTap: () => void) {
  return {
    onPointerDown: rememberPickerPointerOrigin,
    onPointerCancel: forgetPickerPointerOrigin,
    onPointerUp: (ev: PointerEvent) => {
      if (!isPickerPointerTap(ev)) return;
      ev.preventDefault();
      onTap();
    },
    onClick: (ev: MouseEvent) => {
      if (ev.detail === 0) onTap();
    },
  };
}
