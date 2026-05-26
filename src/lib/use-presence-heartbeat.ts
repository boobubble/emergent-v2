import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Keeps the current user's `profiles.last_seen` fresh so other clients
 *  see them as online. Heartbeats every 25s while visible, marks offline
 *  on tab hide / unload for instant disappearance, and re-pings on focus. */
export function usePresenceHeartbeat() {
  useEffect(() => {
    let cancelled = false;
    let intervalId: number | undefined;
    let userId: string | null = null;

    async function beat(status: "online" | "offline" = "online") {
      if (!userId || cancelled) return;
      await supabase
        .from("profiles")
        .update({ last_seen: new Date().toISOString(), status })
        .eq("id", userId);
    }

    function sendOfflineBeacon() {
      if (!userId) return;
      // Best-effort synchronous offline ping on unload.
      try {
        const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`;
        const body = JSON.stringify({
          last_seen: new Date().toISOString(),
          status: "offline",
        });
        const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
        // sendBeacon can't set custom headers, so fall back to fetch keepalive.
        void fetch(url, {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            apikey: key,
            authorization: `Bearer ${key}`,
            prefer: "return=minimal",
          },
          body,
          keepalive: true,
        });
      } catch {
        /* noop */
      }
    }

    async function start() {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      userId = data.user?.id ?? null;
      if (!userId) return;
      void beat("online");
      intervalId = window.setInterval(() => {
        if (document.visibilityState === "visible") void beat("online");
      }, 25_000);
    }

    void start();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const newId = session?.user?.id ?? null;
      if (newId && newId !== userId) {
        userId = newId;
        void beat("online");
      }
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") void beat("online");
      else void beat("offline");
    };
    const onFocus = () => void beat("online");
    const onUnload = () => sendOfflineBeacon();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pagehide", onUnload);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pagehide", onUnload);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, []);
}
