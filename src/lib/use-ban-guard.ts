import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Signs out and warns the current user if they are actively banned.
 * Runs whenever the auth user id changes. RLS on user_bans permits a user
 * to read their own ban row.
 */
export function useBanGuard(userId: string | null | undefined) {
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_bans")
        .select("reason, expires_at")
        .eq("user_id", userId)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled || !data) return;
      if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return;
      const until = data.expires_at
        ? `until ${new Date(data.expires_at).toLocaleString()}`
        : "permanently";
      toast.error(`Account banned ${until}${data.reason ? ` — ${data.reason}` : ""}`, {
        duration: 8000,
      });
      await supabase.auth.signOut();
    })();
    return () => { cancelled = true; };
  }, [userId]);
}
