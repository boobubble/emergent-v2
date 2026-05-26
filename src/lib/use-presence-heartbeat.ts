import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Keeps the current user's `profiles.last_seen` fresh so other clients
 *  see them as online. Without this, newly registered/logged-in users
 *  appear offline within minutes because nothing else updates last_seen. */
export function usePresenceHeartbeat() {
  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;
    let userId: string | null = null;

    async function beat() {
      if (!userId || cancelled) return;
      await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString(), status: "online" })
        .eq("id", userId);
    }

    async function start() {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      userId = data.user?.id ?? null;
      if (!userId) return;
      void beat();
      intervalId = window.setInterval(beat, 60_000);
    }

    void start();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const newId = session?.user?.id ?? null;
      if (newId && newId !== userId) {
        userId = newId;
        void beat();
      }
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") void beat();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}
