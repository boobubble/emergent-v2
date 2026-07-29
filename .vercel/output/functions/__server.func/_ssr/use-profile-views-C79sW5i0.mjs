import { r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-H8IXbXWR.mjs";
import { a as useAuth } from "./router-CYWPFaDK.mjs";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function recordProfileView(ownerId) {
  if (!ownerId || !UUID_RE.test(ownerId)) return;
  supabase.rpc("record_profile_view", { _owner_id: ownerId }).then(({ error }) => {
  });
}
function useRecordProfileView(ownerId) {
  const { user } = useAuth();
  reactExports.useEffect(() => {
    if (!ownerId || !user?.id || ownerId === user.id) return;
    recordProfileView(ownerId);
  }, [ownerId, user?.id]);
}
function useMyProfileVisitors(limit = 20) {
  const { user } = useAuth();
  const [visitors, setVisitors] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [hasLockedExtras, setHasLockedExtras] = reactExports.useState(false);
  const refresh = reactExports.useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_my_profile_visitors", { _limit: limit });
    setLoading(false);
    if (error) {
      return;
    }
    const rows = data ?? [];
    setVisitors(rows);
    setHasLockedExtras(rows.some((r) => r.locked));
  }, [user?.id, limit]);
  reactExports.useEffect(() => {
    refresh();
  }, [refresh]);
  return { visitors, loading, hasLockedExtras, refresh };
}
async function unlockProfileVisitorHistory() {
  const { error } = await supabase.rpc("unlock_profile_visitor_history");
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
function useProfileViewPrefs() {
  const { user } = useAuth();
  const [prefs, setPrefs] = reactExports.useState(null);
  const refresh = reactExports.useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase.from("profiles").select("profile_views_enabled, profile_views_anonymous, profile_views_friends_only, profile_views_unlocked_full").eq("id", user.id).maybeSingle();
    if (data) setPrefs(data);
  }, [user?.id]);
  reactExports.useEffect(() => {
    refresh();
  }, [refresh]);
  const update = reactExports.useCallback(async (patch) => {
    if (!user?.id) return;
    setPrefs((p) => p ? { ...p, ...patch } : p);
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) await refresh();
  }, [user?.id, refresh]);
  return { prefs, update, refresh };
}
function relTime(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 6e4) return "just now";
  if (ms < 36e5) return `${Math.floor(ms / 6e4)}m ago`;
  if (ms < 864e5) return `${Math.floor(ms / 36e5)}h ago`;
  if (ms < 7 * 864e5) return `${Math.floor(ms / 864e5)}d ago`;
  return new Date(iso).toLocaleDateString();
}
export {
  useProfileViewPrefs as a,
  relTime as b,
  unlockProfileVisitorHistory as c,
  useRecordProfileView as d,
  recordProfileView as r,
  useMyProfileVisitors as u
};
