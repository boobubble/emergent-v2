// Read staff permission toggles (admin-controlled) from app_settings.
// Admins/super admins always have full power; toggles only gate moderators.
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAllSettings } from "@/lib/admin.functions";

export interface StaffPermissions {
  mod_can_kick: boolean;
  mod_can_mute: boolean;
  mod_can_ban: boolean;
  mod_can_announce: boolean;
}

export const DEFAULT_STAFF_PERMISSIONS: StaffPermissions = {
  mod_can_kick: true,
  mod_can_mute: true,
  mod_can_ban: true,
  mod_can_announce: false,
};


export function useStaffPermissions(): StaffPermissions {
  const fetchSettings = useServerFn(getAllSettings);
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings({}),
    staleTime: 60_000,
  });
  const v = (data?.staff_permissions as Partial<StaffPermissions> | undefined) ?? {};
  return { ...DEFAULT_STAFF_PERMISSIONS, ...v };
}
