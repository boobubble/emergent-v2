import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Fire-and-forget: record that the current user opened someone else's profile. */
export function recordProfileView(ownerId: string | null | undefined) {
  if (!ownerId || !UUID_RE.test(ownerId)) return;
  supabase.rpc("record_profile_view", { _owner_id: ownerId }).then(({ error }) => {
    if (error && import.meta.env.DEV) console.warn("[profile-views] record failed:", error.message);
  });
}

/** Auto-record when the given owner id is set & differs from the viewer. */
export function useRecordProfileView(ownerId: string | null | undefined) {
  const { user } = useAuth();
  useEffect(() => {
    if (!ownerId || !user?.id || ownerId === user.id) return;
    recordProfileView(ownerId);
  }, [ownerId, user?.id]);
}

export type ProfileVisitor = {
  id: string;
  viewer_id: string | null;
  viewed_at: string;
  anonymous: boolean;
  username: string | null;
  avatar_url: string | null;
  avatar_color: string | null;
  locked: boolean;
};

export function useMyProfileVisitors(limit = 20) {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState<ProfileVisitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLockedExtras, setHasLockedExtras] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_my_profile_visitors", { _limit: limit });
    setLoading(false);
    if (error) {
      if (import.meta.env.DEV) console.warn("[profile-views] fetch failed:", error.message);
      return;
    }
    const rows = (data ?? []) as ProfileVisitor[];
    setVisitors(rows);
    setHasLockedExtras(rows.some(r => r.locked));
  }, [user?.id, limit]);

  useEffect(() => { refresh(); }, [refresh]);

  return { visitors, loading, hasLockedExtras, refresh };
}

export async function unlockProfileVisitorHistory(): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc("unlock_profile_visitor_history");
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type ProfileViewPrefs = {
  profile_views_enabled: boolean;
  profile_views_anonymous: boolean;
  profile_views_friends_only: boolean;
  profile_views_unlocked_full: boolean;
};

export function useProfileViewPrefs() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<ProfileViewPrefs | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("profile_views_enabled, profile_views_anonymous, profile_views_friends_only, profile_views_unlocked_full")
      .eq("id", user.id)
      .maybeSingle();
    if (data) setPrefs(data as ProfileViewPrefs);
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const update = useCallback(async (patch: Partial<ProfileViewPrefs>) => {
    if (!user?.id) return;
    setPrefs(p => (p ? { ...p, ...patch } : p));
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) await refresh();
  }, [user?.id, refresh]);

  return { prefs, update, refresh };
}

export function relTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  if (ms < 7 * 86_400_000) return `${Math.floor(ms / 86_400_000)}d ago`;
  return new Date(iso).toLocaleDateString();
}
