import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { rtLog } from "@/lib/realtime-debug";

// ---------- Session-conflict signal (module-level pub/sub) ----------
type ConflictState = {
  conflict: boolean;
  prevUid: string | null;
  nextUid: string | null;
  at: number;
};
let conflictState: ConflictState = { conflict: false, prevUid: null, nextUid: null, at: 0 };
const conflictListeners = new Set<() => void>();

function emitConflict(next: ConflictState) {
  conflictState = next;
  conflictListeners.forEach(l => l());
}

export function useSessionConflict() {
  return useSyncExternalStore(
    (cb) => { conflictListeners.add(cb); return () => conflictListeners.delete(cb); },
    () => conflictState,
    () => conflictState,
  );
}

export function clearSessionConflict() {
  emitConflict({ conflict: false, prevUid: null, nextUid: null, at: 0 });
}

// ---------- Live auth identity (for the debug overlay) ----------
let liveUid: string | null = null;
const uidListeners = new Set<() => void>();
function setLiveUid(v: string | null) {
  if (liveUid === v) return;
  liveUid = v;
  uidListeners.forEach(l => l());
}
export function useLiveAuthUid() {
  return useSyncExternalStore(
    (cb) => { uidListeners.add(cb); return () => uidListeners.delete(cb); },
    () => liveUid,
    () => liveUid,
  );
}

// ---------- Hard reset for stale realtime state ----------
function nukeRealtime(reason: string) {
  try {
    const channels = supabase.getChannels();
    rtLog("channel", "nuke-all", `${channels.length} (${reason})`);
    channels.forEach(ch => { try { supabase.removeChannel(ch); } catch { /* ignore */ } });
  } catch (e) {
    rtLog("error", "nuke-failed", String(e));
  }
}

/** Continuously verifies the auth identity and tears down stale realtime
 *  state whenever it changes. Listens to:
 *   - supabase.auth.onAuthStateChange (in-tab)
 *   - window 'storage' events (other tab overwrites localStorage)
 *   - visibility/focus (revalidate when tab comes back)
 */
export function useSessionChangeDetector() {
  const knownUidRef = useRef<string | null | undefined>(undefined);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const handleUid = (next: string | null, source: string) => {
      const prev = knownUidRef.current;
      if (prev === undefined) {
        knownUidRef.current = next;
        setLiveUid(next);
        rtLog("auth", "init", `${next ?? "anon"} (${source})`);
        return;
      }
      if (next === prev) return;

      knownUidRef.current = next;
      setLiveUid(next);

      if (prev && next && prev !== next) {
        rtLog("auth", "swap", `${prev.slice(0, 6)}→${next.slice(0, 6)} (${source})`);
        toast.warning("Another account session has replaced this tab.", {
          description: "Refreshing realtime connection…",
          duration: 8000,
        });
        emitConflict({ conflict: true, prevUid: prev, nextUid: next, at: Date.now() });
      } else if (prev && !next) {
        rtLog("auth", "signed-out", `(${source})`);
      } else if (!prev && next) {
        rtLog("auth", "signed-in", `${next.slice(0, 8)} (${source})`);
      }

      nukeRealtime(`auth ${prev?.slice(0, 6) ?? "·"}→${next?.slice(0, 6) ?? "·"}`);
      queryClient.invalidateQueries();
      void router.invalidate();
    };

    // Seed
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      handleUid(data.user?.id ?? null, "init");
    });

    // In-tab auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      rtLog("auth", event, session?.user?.id?.slice(0, 8) ?? "anon");
      handleUid(session?.user?.id ?? null, event);
    });

    // Cross-tab: another tab wrote a different supabase session into localStorage.
    const onStorage = (e: StorageEvent) => {
      if (!e.key || !e.key.includes("supabase.auth")) return;
      supabase.auth.getUser().then(({ data }) => handleUid(data.user?.id ?? null, "storage"));
    };
    window.addEventListener("storage", onStorage);

    // Tab focus revalidation
    const onFocus = () => {
      if (document.visibilityState !== "visible") return;
      supabase.auth.getUser().then(({ data }) => handleUid(data.user?.id ?? null, "focus"));
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
    };
  }, [queryClient, router]);
}

// Re-export for convenience
export function useSessionConflictBannerVisible(): boolean {
  const s = useSessionConflict();
  const [shown, setShown] = useState(s.conflict);
  useEffect(() => { setShown(s.conflict); }, [s.conflict, s.at]);
  return shown;
}
