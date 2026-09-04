// Read the signed-in user's roles for UI guards.
// Reads directly from public.user_roles — RLS allows users to read their own row.
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { supabase } from "@/integrations/supabase/client";
import { summarizeRoles } from "@/lib/content-roles";

export type AppRole = "super_admin" | "admin" | "moderator" | "writer" | "user" | "dj" | "rj";

export function useMyRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancel = false;
    if (!user?.id) { setRoles([]); setLoaded(true); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancel) return;
      setRoles(((data ?? []).map((r) => r.role) as AppRole[]));
      setLoaded(true);
    })();
    return () => { cancel = true; };
  }, [user?.id]);

  const flags = summarizeRoles(roles);
  const isModerator = flags.isAdmin || roles.includes("moderator");
  return { ...flags, roles, isModerator, loaded };
}
