import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import * as trio from "@/services/trio-rooms.service";

/**
 * App-wide listener for incoming 3some (trio) room invitations.
 * Shows a toast on any page so users see invites even when not in chat.
 */
export function TrioInvitesListener() {
  const { user } = useAuth();
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;

    async function notifyInvite(roomId: string) {
      const key = `${roomId}`;
      if (seen.current.has(key)) return;
      seen.current.add(key);

      const { data: room } = await supabase
        .from("trio_rooms")
        .select("id,name,owner_id")
        .eq("id", roomId)
        .maybeSingle();
      if (!room) return;

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
            try { await trio.rejectInvite(room.id); } catch {}
          },
        },
      });
    }

    // Catch any already-pending invites on mount (in case realtime missed them).
    (async () => {
      try {
        const mine = await trio.listMyMemberships();
        for (const m of mine) {
          if (m.status === "invited") notifyInvite(m.room_id);
        }
      } catch { /* RLS may filter */ }
    })();

    const ch = supabase
      .channel(`trio-invites-global-${uid}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trio_room_members",
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          const row = payload.new as { room_id: string; status: string };
          if (row.status !== "invited") return;
          notifyInvite(row.room_id);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "trio_room_members",
          filter: `user_id=eq.${uid}`,
        },
        (payload) => {
          const row = payload.new as { room_id: string; status: string };
          if (row.status !== "invited") return;
          notifyInvite(row.room_id);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(ch);
    };
  }, [user?.id]);

  return null;
}
