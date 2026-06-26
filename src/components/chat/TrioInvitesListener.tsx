import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import * as trio from "@/services/trio-rooms.service";

/**
 * App-wide listener for incoming 3some (trio) room invitations.
 *
 * Realtime is best-effort: Supabase channels can drop on network blips,
 * tab sleep, or auth refresh and silently miss INSERT/UPDATE events. To
 * guarantee invited users still see an Accept/Decline toast we layer
 * three catch-up mechanisms on top of the live subscription:
 *
 *  1. Initial fetch on mount.
 *  2. Periodic poll every 30s while the tab is visible.
 *  3. Immediate poll on tab focus / online / channel resubscribe events,
 *     and a force-resubscribe if the channel drops to CLOSED/CHANNEL_ERROR.
 */
export function TrioInvitesListener() {
  const { user } = useAuth();
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;

    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let resubscribeTimer: ReturnType<typeof setTimeout> | null = null;

    async function notifyInvite(roomId: string) {
      if (cancelled) return;
      const key = `${roomId}`;
      if (seen.current.has(key)) return;
      seen.current.add(key);

      const { data: room } = await supabase
        .from("trio_rooms")
        .select("id,name,owner_id")
        .eq("id", roomId)
        .maybeSingle();
      if (!room || cancelled) {
        // Allow another attempt later if room metadata is not visible yet (RLS lag).
        if (!room) seen.current.delete(key);
        return;
      }

      let inviterName = "Someone";
      if (room.owner_id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", room.owner_id)
          .maybeSingle();
        inviterName = prof?.username || inviterName;
      }

      toast(`💬 ${inviterName} invited you to "${room.name}"`, {
        duration: 30_000,
        description: "3some private room invitation",
        action: {
          label: "Accept",
          onClick: async () => {
            try {
              await trio.acceptInvite(room.id);
              toast.success(`Joined ${room.name}`);
              window.dispatchEvent(new CustomEvent("trio:open-launcher"));
            } catch (e) {
              toast.error((e as Error).message);
            }
          },
        },
        cancel: {
          label: "Decline",
          onClick: async () => {
            try { await trio.rejectInvite(room.id); } catch { /* ignore */ }
          },
        },
      });
    }

    async function catchUp() {
      if (cancelled) return;
      try {
        const mine = await trio.listMyMemberships();
        for (const m of mine) {
          if (m.status === "invited") {
            // Skip invites the user already actioned in another tab/session.
            void notifyInvite(m.room_id);
          }
        }
      } catch {
        /* swallow — RLS may filter, retry on next interval */
      }
    }

    function subscribe() {
      if (channel) {
        void supabase.removeChannel(channel);
        channel = null;
      }
      channel = supabase
        .channel(`trio-invites-global-${uid}-${Date.now()}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "trio_room_members", filter: `user_id=eq.${uid}` },
          (payload) => {
            const row = payload.new as { room_id: string; status: string };
            if (row.status !== "invited") return;
            void notifyInvite(row.room_id);
          },
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "trio_room_members", filter: `user_id=eq.${uid}` },
          (payload) => {
            const row = payload.new as { room_id: string; status: string };
            if (row.status !== "invited") return;
            void notifyInvite(row.room_id);
          },
        )
        .subscribe((status) => {
          // Resync state whenever the socket comes back from a hiccup.
          if (status === "SUBSCRIBED") {
            void catchUp();
            return;
          }
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            if (resubscribeTimer) clearTimeout(resubscribeTimer);
            resubscribeTimer = setTimeout(() => {
              if (!cancelled) subscribe();
            }, 2000);
          }
        });
    }

    function onVisible() {
      if (document.visibilityState === "visible") void catchUp();
    }
    function onOnline() { void catchUp(); }

    // 1) Initial catch-up + live subscription.
    void catchUp();
    subscribe();

    // 2) Steady-state poll while the tab is visible (cheap; one indexed query).
    pollTimer = setInterval(() => {
      if (document.visibilityState === "visible") void catchUp();
    }, 30_000);

    // 3) Recover immediately on focus / network return.
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      cancelled = true;
      if (pollTimer) clearInterval(pollTimer);
      if (resubscribeTimer) clearTimeout(resubscribeTimer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("online", onOnline);
      if (channel) void supabase.removeChannel(channel);
      channel = null;
    };
  }, [user?.id]);

  return null;
}
