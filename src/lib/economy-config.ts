// Centralized economy rules engine config (foundation only).
// Existing XP / coins / streak systems remain authoritative — these defaults
// are read by future server fns and the admin economy page as a single source
// of truth. Persisted under app_settings.economy.

export interface EconomyConfig {
  modules: {
    chatXp: boolean;
    feedXp: boolean;
    coinRewards: boolean;
    streakRewards: boolean;
    creatorRewards: boolean;
    loyaltyRewards: boolean;
    dailyMissions: boolean;
  };
  chatXp: {
    perMessage: number;
    dailyCap: number;
    cooldownSec: number;
  };
  feedXp: {
    perPost: number;
    perComment: number;
    perReactionReceived: number;
    dailyCap: number;
  };
  coins: {
    perLevel: number;
    perDailyLogin: number;
    perFriendInvite: number;
  };
  streaks: {
    dailyLoginBonusCoins: number;
    milestoneBonusCoins: Record<string, number>; // "7", "14", "30"...
  };
  creator: {
    tipMinCoins: number;
    tipMaxCoins: number;
    platformCutPct: number;
  };
  loyalty: {
    perDayActiveCoins: number;
    weeklyBonusCoins: number;
  };
  missions: {
    enabledCount: number;
    refreshHours: number;
  };
}

export const ECONOMY_DEFAULTS: EconomyConfig = {
  modules: {
    chatXp: true,
    feedXp: true,
    coinRewards: true,
    streakRewards: true,
    creatorRewards: false,
    loyaltyRewards: false,
    dailyMissions: false,
  },
  chatXp:    { perMessage: 1, dailyCap: 200, cooldownSec: 5 },
  feedXp:    { perPost: 10, perComment: 3, perReactionReceived: 1, dailyCap: 300 },
  coins:     { perLevel: 50, perDailyLogin: 10, perFriendInvite: 25 },
  streaks:   { dailyLoginBonusCoins: 5, milestoneBonusCoins: { "7": 50, "14": 120, "30": 300, "100": 1500 } },
  creator:   { tipMinCoins: 10, tipMaxCoins: 10000, platformCutPct: 10 },
  loyalty:   { perDayActiveCoins: 2, weeklyBonusCoins: 25 },
  missions:  { enabledCount: 3, refreshHours: 24 },
};
