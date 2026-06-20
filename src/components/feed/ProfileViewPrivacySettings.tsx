import { Eye, EyeOff, UserCheck } from "lucide-react";
import { useProfileViewPrefs } from "@/lib/use-profile-views";

export function ProfileViewPrivacySettings() {
  const { prefs, update } = useProfileViewPrefs();
  if (!prefs) return null;

  const Row = ({
    icon, label, desc, value, onChange,
  }: {
    icon: React.ReactNode; label: string; desc: string; value: boolean; onChange: (v: boolean) => void;
  }) => (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-3 transition hover:bg-white/5">
      <span className="mt-0.5 text-primary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{label}</span>
        <span className="block text-[11px] text-muted-foreground">{desc}</span>
      </span>
      <input
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
      />
    </label>
  );

  return (
    <section>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Profile views privacy
      </h3>
      <div className="grid gap-2">
        <Row
          icon={<Eye className="h-4 w-4" />}
          label="Track profile views"
          desc="Record when other users open your profile."
          value={prefs.profile_views_enabled}
          onChange={v => update({ profile_views_enabled: v })}
        />
        <Row
          icon={<EyeOff className="h-4 w-4" />}
          label="Browse anonymously"
          desc="Your visits to other profiles appear as “Anonymous visitor”."
          value={prefs.profile_views_anonymous}
          onChange={v => update({ profile_views_anonymous: v })}
        />
        <Row
          icon={<UserCheck className="h-4 w-4" />}
          label="Friends-only visibility"
          desc="Only friends' visits are recorded on your profile."
          value={prefs.profile_views_friends_only}
          onChange={v => update({ profile_views_friends_only: v })}
        />
      </div>
    </section>
  );
}
