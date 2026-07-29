import { r as reactExports } from "../_libs/react.mjs";
import { a as useAuth } from "./router-CYWPFaDK.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
function useMyRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = reactExports.useState([]);
  const [loaded, setLoaded] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let cancel = false;
    if (!user?.id) {
      setRoles([]);
      setLoaded(true);
      return;
    }
    (async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (cancel) return;
      setRoles((data ?? []).map((r) => r.role));
      setLoaded(true);
    })();
    return () => {
      cancel = true;
    };
  }, [user?.id]);
  const isSuperAdmin = roles.includes("super_admin");
  const isAdmin = isSuperAdmin || roles.includes("admin");
  const isModerator = isAdmin || roles.includes("moderator");
  return { roles, isSuperAdmin, isAdmin, isModerator, loaded };
}
export {
  useMyRoles as u
};
