import { Eye, Lock, Coins, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useMyProfileVisitors, unlockProfileVisitorHistory, useProfileViewPrefs, relTime } from "@/lib/use-profile-views";

const FREE_LIMIT = 5;
const UNLOCK_COST = 300;

export function RecentVisitorsWidget() {
  const { visitors, loading, refresh } = useMyProfileVisitors(20);
  const { prefs, refresh: refreshPrefs } = useProfileViewPrefs();

  const unlocked = !!prefs?.profile_views_unlocked_full;
  const enabled = prefs?.profile_views_enabled !== false;

  const handleUnlock = async () => {
    const res = await unlockProfileVisitorHistory();
    if (res.ok) {
      toast.success("Full visitor history unlocked!");
      await Promise.all([refresh(), refreshPrefs()]);
    } else {
      toast.error(res.error || "Could not unlock");
    }
  };

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          <Eye className="h-3.5 w-3.5 text-primary" /> Recent visitors
        </h3>
        {visitors.length > 0 && (
          <span className="text-[10px] font-semibold text-muted-foreground">
            {unlocked ? `${visitors.length} shown` : `Free • last ${FREE_LIMIT}`}
          </span>
        )}
      </div>

      {!enabled ? (
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <EyeOff className="mr-1 inline h-3.5 w-3.5" /> Profile views are turned off. Enable them in settings to see who visits.
        </p>
      ) : loading && visitors.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">Loading…</p>
      ) : visitors.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No one has visited your profile yet.
        </p>
      ) : (
        <ul className="grid gap-2">
          {visitors.map(v => (
            <li key={v.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: v.anonymous ? "var(--muted)" : (v.avatar_color || "var(--primary)") }}
              >
                {v.anonymous ? "?" : (v.avatar_url
                  ? <img src={v.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                  : (v.username?.[0]?.toUpperCase() || "?"))}
              </div>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-sm font-bold">
                  {v.anonymous ? <span className="text-muted-foreground">Anonymous visitor</span> : (v.username || "Someone")}
                </div>
                <div className="text-[11px] text-muted-foreground">{relTime(v.viewed_at)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {enabled && !unlocked && visitors.length >= FREE_LIMIT && (
        <button
          onClick={handleUnlock}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/20"
        >
          <Lock className="h-4 w-4" /> Unlock full visitor history
          <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-[11px]">
            <Coins className="h-3 w-3" /> {UNLOCK_COST}
          </span>
        </button>
      )}
    </section>
  );
}
