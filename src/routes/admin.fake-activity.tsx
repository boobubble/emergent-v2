import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsCard, NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { Button } from "@/components/ui/button";
import { useAdminSetting } from "@/lib/use-admin-setting";
import { AlertTriangle } from "lucide-react";

interface FakeActivityValues {
  enabled: boolean;
  fake_users_count: number;
  simulate_messages: boolean;
  message_interval_sec: number;
  auto_reactions: boolean;
  reaction_chance_pct: number;
  auto_room_joins: boolean;
  join_interval_sec: number;
  label_visible: boolean;
}

const DEFAULTS: FakeActivityValues = {
  enabled: false,
  fake_users_count: 0,
  simulate_messages: false,
  message_interval_sec: 300,
  auto_reactions: false,
  reaction_chance_pct: 10,
  auto_room_joins: false,
  join_interval_sec: 600,
  label_visible: true,
};

export const Route = createFileRoute("/admin/fake-activity")({ component: FakeActivityPage });

function FakeActivityPage() {
  const { values, set, save, saving } = useAdminSetting<FakeActivityValues>("fake_activity", DEFAULTS);
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Fake Activity"
        description="Optional NPC system to bootstrap engagement. Disabled by default."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>}
      />

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
        <div>
          <div className="font-medium">Use with care</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Simulated activity can mislead real users and may violate marketplace policies. Keep the "Show NPC label" toggle on so fake users are clearly marked in the UI.
          </p>
        </div>
      </div>

      <SettingsCard title="Master switch">
        <ToggleRow label="Enable NPC system" desc="Global on/off for all fake activity below." value={values.enabled} onChange={(v) => set("enabled", v)} />
        <NumberField label="Number of fake users" value={values.fake_users_count} onChange={(v) => set("fake_users_count", v)} hint="Synthetic profiles auto-generated for ambience." />
        <ToggleRow label="Show NPC label" desc="Mark fake users with a visible 'NPC' badge." value={values.label_visible} onChange={(v) => set("label_visible", v)} />
      </SettingsCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsCard title="Simulated messages">
          <ToggleRow label="Enable" value={values.simulate_messages} onChange={(v) => set("simulate_messages", v)} />
          <NumberField label="Avg interval (sec)" value={values.message_interval_sec} onChange={(v) => set("message_interval_sec", v)} hint="Higher = quieter. Recommended 300+." />
        </SettingsCard>
        <SettingsCard title="Auto reactions">
          <ToggleRow label="Enable" value={values.auto_reactions} onChange={(v) => set("auto_reactions", v)} />
          <NumberField label="Reaction chance (%)" value={values.reaction_chance_pct} min={0} max={100} onChange={(v) => set("reaction_chance_pct", v)} />
        </SettingsCard>
        <SettingsCard title="Auto room joins">
          <ToggleRow label="Enable" value={values.auto_room_joins} onChange={(v) => set("auto_room_joins", v)} />
          <NumberField label="Join interval (sec)" value={values.join_interval_sec} onChange={(v) => set("join_interval_sec", v)} />
        </SettingsCard>
      </div>
    </div>
  );
}
