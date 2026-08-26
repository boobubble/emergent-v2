import { useSyncExternalStore } from "react";

type ConflictState = {
  conflict: boolean;
  prevUid: string | null;
  nextUid: string | null;
  at: number;
};

let conflictState: ConflictState = { conflict: false, prevUid: null, nextUid: null, at: 0 };
const conflictListeners = new Set<() => void>();

export function emitSessionConflict(next: ConflictState) {
  conflictState = next;
  conflictListeners.forEach((l) => l());
}

export function useSessionConflict() {
  return useSyncExternalStore(
    (cb) => {
      conflictListeners.add(cb);
      return () => conflictListeners.delete(cb);
    },
    () => conflictState,
    () => conflictState,
  );
}

export function clearSessionConflict() {
  emitSessionConflict({ conflict: false, prevUid: null, nextUid: null, at: 0 });
}
