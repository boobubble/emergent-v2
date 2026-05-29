import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SettingsCard, NumberField, ToggleRow } from "@/components/admin/SettingsSection";
import { Button } from "@/components/ui/button";
import { useAdminSetting } from "@/lib/use-admin-setting";

interface EconomyValues {
  xp_per_message: number;
  xp_per_post: number;
  xp_per_comment: number;
  xp_per_game_win: number;
  coins_per_daily: number;
  coins_per_game_win: number;
  streak_bonus_coins: number;
  streak_bonus_xp: number;
  achievements_enabled: boolean;
  shop_enabled: boolean;
  shop_price_multiplier: number;
  cooldown_message_sec: number;
  cooldown_post_sec: number;
  cooldown_reaction_sec: number;
  daily_xp_cap: number;
  daily_coin_cap: number;
}

const DEFAULTS: EconomyValues = {
  xp_per_message: 1, xp_per_post: 10, xp_per_comment: 3, xp_per_game_win: 25,
  coins_per_daily: 50, coins_per_game_win: 10,
  streak_bonus_coins: 5, streak_bonus_xp: 5,
  achievements_enabled: true, shop_enabled: true, shop_price_multiplier: 1,
  cooldown_message_sec: 2, cooldown_post_sec: 30, cooldown_reaction_sec: 1,
  daily_xp_cap: 500, daily_coin_cap: 250,
};

export const Route = createFileRoute("/admin/economy")({ component: EconomyPage });

function EconomyPage() {
  const { values, set, save, saving } = useAdminSetting<EconomyValues>("economy", DEFAULTS);
  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Economy"
        description="Tune XP, coins, streaks, shop pricing, and anti-farming cooldowns."
        actions={<Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <SettingsCard title="XP rewards" description="Experience granted for user activity.">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Per message" value={values.xp_per_message} onChange={(v) => set("xp_per_message", v)} />
            <NumberField label="Per post" value={values.xp_per_post} onChange={(v) => set("xp_per_post", v)} />
            <NumberField label="Per comment" value={values.xp_per_comment} onChange={(v) => set("xp_per_comment", v)} />
            <NumberField label="Per game win" value={values.xp_per_game_win} onChange={(v) => set("xp_per_game_win", v)} />
          </div>
        </SettingsCard>
        <SettingsCard title="Coin rewards" description="Coins issued for engagement.">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Daily login" value={values.coins_per_daily} onChange={(v) => set("coins_per_daily", v)} />
            <NumberField label="Game win" value={values.coins_per_game_win} onChange={(v) => set("coins_per_game_win", v)} />
          </div>
        </SettingsCard>
        <SettingsCard title="Streak bonuses" description="Reward consecutive active days.">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Bonus coins / streak day" value={values.streak_bonus_coins} onChange={(v) => set("streak_bonus_coins", v)} />
            <NumberField label="Bonus XP / streak day" value={values.streak_bonus_xp} onChange={(v) => set("streak_bonus_xp", v)} />
          </div>
        </SettingsCard>
        <SettingsCard title="Shop & achievements">
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleRow label="Achievements" desc="Unlock badges & milestones." value={values.achievements_enabled} onChange={(v) => set("achievements_enabled", v)} />
            <ToggleRow label="Shop" desc="Allow buying with coins." value={values.shop_enabled} onChange={(v) => set("shop_enabled", v)} />
          </div>
          <NumberField label="Shop price multiplier" step={0.1} value={values.shop_price_multiplier} onChange={(v) => set("shop_price_multiplier", v)} hint="1.0 = base pricing. 1.5 = +50% across catalog." />
        </SettingsCard>
        <SettingsCard title="Anti-farming cooldowns" description="Minimum seconds between rewarded actions.">
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberField label="Message (sec)" value={values.cooldown_message_sec} onChange={(v) => set("cooldown_message_sec", v)} />
            <NumberField label="Post (sec)" value={values.cooldown_post_sec} onChange={(v) => set("cooldown_post_sec", v)} />
            <NumberField label="Reaction (sec)" value={values.cooldown_reaction_sec} onChange={(v) => set("cooldown_reaction_sec", v)} />
          </div>
        </SettingsCard>
        <SettingsCard title="Daily caps" description="Hard limits per user per day.">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label="Max XP / day" value={values.daily_xp_cap} onChange={(v) => set("daily_xp_cap", v)} />
            <NumberField label="Max coins / day" value={values.daily_coin_cap} onChange={(v) => set("daily_coin_cap", v)} />
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
