import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsCard, NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { Button } from "@/components/ui/button";
import { useAdminSetting } from "@/lib/use-admin-setting";

interface GameFlags { [key: string]: boolean }

interface GamesValues {
  enabled: GameFlags;
  reward_multiplier: number;
  max_concurrent_matches: number;
  lobby_timeout_sec: number;
  turn_timeout_sec: number;
  tournaments_enabled: boolean;
  tournament_entry_fee: number;
  tournament_prize_pool: number;
  spectators_allowed: boolean;
  mod_live_games: boolean;
}

const GAME_LIST = ["tic_tac_toe", "rock_paper_scissors", "connect_four", "checkers", "chess", "trivia"];

const DEFAULTS: GamesValues = {
  enabled: Object.fromEntries(GAME_LIST.map((g) => [g, true])),
  reward_multiplier: 1,
  max_concurrent_matches: 100,
  lobby_timeout_sec: 120,
  turn_timeout_sec: 45,
  tournaments_enabled: false,
  tournament_entry_fee: 25,
  tournament_prize_pool: 500,
  spectators_allowed: true,
  mod_live_games: true,
};

export const Route = createFileRoute("/admin/games")({ component: GamesPage });

function GamesPage() {
  const { values, set, save, saving } = useAdminSetting<GamesValues>("games", DEFAULTS);
  const toggleGame = (g: string, v: boolean) => set("enabled", { ...values.enabled, [g]: v });
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Games"
        description="Enable mini-games, configure rewards, and moderate live matches."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsCard title="Available games" description="Enable or disable individual games.">
          <div className="grid gap-2 sm:grid-cols-2">
            {GAME_LIST.map((g) => (
              <ToggleRow key={g} label={g.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} value={values.enabled?.[g] ?? true} onChange={(v) => toggleGame(g, v)} />
            ))}
          </div>
        </SettingsCard>
        <SettingsCard title="Match settings">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Reward multiplier" step={0.1} value={values.reward_multiplier} onChange={(v) => set("reward_multiplier", v)} hint="Scales XP & coin payouts." />
            <NumberField label="Max concurrent matches" value={values.max_concurrent_matches} onChange={(v) => set("max_concurrent_matches", v)} />
            <NumberField label="Lobby timeout (sec)" value={values.lobby_timeout_sec} onChange={(v) => set("lobby_timeout_sec", v)} />
            <NumberField label="Turn timeout (sec)" value={values.turn_timeout_sec} onChange={(v) => set("turn_timeout_sec", v)} />
          </div>
        </SettingsCard>
        <SettingsCard title="Tournaments">
          <ToggleRow label="Enable tournaments" desc="Scheduled bracket events." value={values.tournaments_enabled} onChange={(v) => set("tournaments_enabled", v)} />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Entry fee (coins)" value={values.tournament_entry_fee} onChange={(v) => set("tournament_entry_fee", v)} />
            <NumberField label="Prize pool (coins)" value={values.tournament_prize_pool} onChange={(v) => set("tournament_prize_pool", v)} />
          </div>
        </SettingsCard>
        <SettingsCard title="Live moderation">
          <ToggleRow label="Allow spectators" desc="Public matches viewable by others." value={values.spectators_allowed} onChange={(v) => set("spectators_allowed", v)} />
          <ToggleRow label="Moderator live access" desc="Mods can join & abort live games." value={values.mod_live_games} onChange={(v) => set("mod_live_games", v)} />
        </SettingsCard>
      </div>
    </div>
  );
}
