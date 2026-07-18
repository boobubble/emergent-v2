import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { respondToInvite } from "@/lib/games.functions";

// Listens for incoming game_invites and shows an actionable toast.
// Mount once at the app root.
export function GameInvitesListener() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const respond = useServerFn(respondToInvite);

  useEffect(() => {
    if (!user?.id) return;
    const meId = user.id;

    function show(inviteId: string, gameId: string, fromName: string) {
      toast(`🎲 ${fromName} invited you to Ludo`, {
        duration: 30_000,
        action: {
          label: "Accept",
          onClick: async () => {
            try {
              const res = await respond({ data: { inviteId, accept: true } });
              if (res.gameId) navigate({ to: "/games/ludo", search: { id: res.gameId } as never });
            } catch (e) {
              toast.error((e as Error).message);
            }
          },
        },
        cancel: {
          label: "Decline",
          onClick: async () => {
            try { await respond({ data: { inviteId, accept: false } }); } catch {}
          },
        },
      });
    }

    const ch = supabase
      .channel(`game-invites-${meId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "game_invites", filter: `receiver_id=eq.${meId}` },
        async (payload) => {
          const row = payload.new as { id: string; sender_id: string; game_id: string; status: string };
          if (row.status !== "pending") return;
          const { data: sender } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", row.sender_id)
            .maybeSingle();
          show(row.id, row.game_id, sender?.username || "Someone");
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id, navigate, respond]);

  return null;
}
