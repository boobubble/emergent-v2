import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const BAN_STORAGE_KEY = "lovable:last-ban";

export type StoredBan = {
  reason: string | null;
  expires_at: string | null;
  signed_out_at: string;
};

export function readStoredBan(): StoredBan | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BAN_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredBan;
  } catch {
    return null;
  }
}

export function clearStoredBan() {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(BAN_STORAGE_KEY); } catch { /* noop */ }
}

/**
 * Signs out and routes the user to /banned if they are actively banned.
 * Ban details are persisted to localStorage so /banned can render them
 * without an authenticated session.
 */
export function useBanGuard(userId: string | null | undefined) {
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("user_bans_self" as any)
        .select("reason, expires_at")
        .eq("user_id", userId)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle() as { data: { reason: string | null; expires_at: string | null } | null };
      if (cancelled || !data) return;
      if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) return;

      const payload: StoredBan = {
        reason: data.reason ?? null,
        expires_at: data.expires_at ?? null,
        signed_out_at: new Date().toISOString(),
      };
      try { window.localStorage.setItem(BAN_STORAGE_KEY, JSON.stringify(payload)); } catch { /* noop */ }
      await supabase.auth.signOut();
      window.location.replace("/banned");
    })();
    return () => { cancelled = true; };
  }, [userId]);
}
