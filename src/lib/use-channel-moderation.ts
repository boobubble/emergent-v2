/**
 * Per-channel moderation powers: global admin/mod roles plus room_moderators row.
 */
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { useMyRoles } from "@/lib/use-my-role";
import { supabase } from "@/integrations/supabase/client";

export type RoomModPerms = {
  can_mute: boolean;
  can_kick: boolean;
  can_pin: boolean;
  can_delete: boolean;
};

const NO_ROOM_PERMS: RoomModPerms = {
  can_mute: false,
  can_kick: false,
  can_pin: false,
  can_delete: false,
};

export function useChannelModeration(channelId: string) {
  const { user } = useAuth();
  const { isAdmin, isModerator, loaded: rolesLoaded } = useMyRoles();
  const [roomPerms, setRoomPerms] = useState<RoomModPerms>(NO_ROOM_PERMS);
  const [roomLoaded, setRoomLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id || !channelId) {
      setRoomPerms(NO_ROOM_PERMS);
      setRoomLoaded(true);
      return;
    }
    let cancel = false;
    void (async () => {
      const { data } = await supabase
        .from("room_moderators")
        .select("can_mute, can_kick, can_pin, can_delete")
        .eq("channel_id", channelId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancel) return;
      setRoomPerms({
        can_mute: !!data?.can_mute,
        can_kick: !!data?.can_kick,
        can_pin: !!data?.can_pin,
        can_delete: !!data?.can_delete,
      });
      setRoomLoaded(true);
    })();
    return () => { cancel = true; };
  }, [user?.id, channelId]);

  const isStaff =
    isAdmin
    || isModerator
    || roomPerms.can_delete
    || roomPerms.can_mute
    || roomPerms.can_kick
    || roomPerms.can_pin;

  return {
    isAdmin,
    isModerator,
    roomPerms,
    isStaff,
    loaded: rolesLoaded && roomLoaded,
  };
}
