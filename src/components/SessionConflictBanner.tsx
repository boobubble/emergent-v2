import { clearSessionConflict, useSessionConflict } from "@/lib/use-session-change-detector";

export function SessionConflictBanner() {
  const { conflict, prevUid, nextUid } = useSessionConflict();
  if (!conflict) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[10000] border-b border-amber-500/40 bg-amber-500/95 px-4 py-2 text-sm text-amber-950 shadow-lg">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span aria-hidden>⚠️</span>
          <span>
            <strong>Another account session has replaced this tab.</strong>{" "}
            <span className="opacity-80">
              {prevUid?.slice(0, 6)}… → {nextUid?.slice(0, 6) ?? "signed out"}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-50 hover:bg-amber-900"
          >
            Reload now
          </button>
          <button
            onClick={clearSessionConflict}
            className="rounded-md border border-amber-950/30 px-3 py-1 text-xs font-medium hover:bg-amber-400/30"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
