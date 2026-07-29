import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { b as useServerFn, Y as getAllSettings } from "./router-CYWPFaDK.mjs";
const DEFAULT_STAFF_PERMISSIONS = {
  mod_can_kick: true,
  mod_can_mute: true,
  mod_can_ban: true,
  mod_can_announce: false,
  mod_can_clear: false
};
function useStaffPermissions() {
  const fetchSettings = useServerFn(getAllSettings);
  const { data } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => fetchSettings({}),
    staleTime: 6e4
  });
  const v = data?.staff_permissions ?? {};
  return { ...DEFAULT_STAFF_PERMISSIONS, ...v };
}
export {
  DEFAULT_STAFF_PERMISSIONS as D,
  useStaffPermissions as u
};
