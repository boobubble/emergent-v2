import type { SDKResult } from "./types";

export interface AchievementDefinition {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  points?: number;
  hidden?: boolean;
}

export interface AchievementProgress {
  achievementId: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
  unlockedAt?: string;
}

export interface AchievementsAdapter {
  list(): Promise<SDKResult<AchievementDefinition[]>>;
  getProgress(): Promise<SDKResult<AchievementProgress[]>>;
  unlockAchievement(achievementId: string): Promise<SDKResult<AchievementProgress>>;
  incrementProgress(achievementId: string, delta: number): Promise<SDKResult<AchievementProgress>>;
}
