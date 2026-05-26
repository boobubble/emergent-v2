import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { rtLog } from "@/lib/realtime-debug";

/** Detects when the auth user changes underneath an open tab (e.g. another
 *  tab signed in as a different account and overwrote localStorage). Warns
 *  the user, invalidates caches, and forces a router refresh so all
 *  realtime subscriptions rebuild with the new identity. */
export function useSessionChangeDetector() {
  const knownUidRef = useRef<string | null | undefined>(undefined);
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      knownUidRef.current = data.user?.id ?? null;
      rtLog("auth", "init", knownUidRef.current ?? "anon");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const next = session?.user?.id ?? null;
      const prev = knownUidRef.current;
      rtLog("auth", event, next ?? "anon");

      // First observation — just record it.
      if (prev === undefined) {
        knownUidRef.current = next;
        return;
      }

      if (next !== prev) {
        knownUidRef.current = next;
        // Account swap happened in another tab/window.
        if (prev && next && prev !== next) {
          toast.warning("Session changed in another tab/browser.", {
            description: "Refreshing realtime connection…",
          });
          rtLog("auth", "swap", `${prev.slice(0, 6)}→${next.slice(0, 6)}`);
        } else if (prev && !next) {
          rtLog("auth", "signed-out");
        } else if (!prev && next) {
          rtLog("auth", "signed-in", next.slice(0, 8));
        }
        // Force everything user-scoped to rebuild.
        queryClient.invalidateQueries();
        void router.invalidate();
      }
    });

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [queryClient, router]);
}
