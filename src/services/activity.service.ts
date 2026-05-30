import { notImplemented } from "./_shared";
import type { StreakKind } from "@/lib/retention-config";

export interface StreakSummary {
  kind: StreakKind;
  current: number;
  longest: number;
  lastActiveDay: string | null;
  /** Milestone day numbers the user has already claimed. */
  claimed: number[];
}

export interface ActivityService {
  /** Record that the user performed a streak-eligible action today. */
  ping(kind: StreakKind): Promise<StreakSummary>;
  /** Read a single streak summary. */
  get(kind: StreakKind): Promise<StreakSummary>;
  /** Claim the reward for a milestone day the user has reached. */
  claimMilestone(kind: StreakKind, day: number): Promise<{ ok: boolean }>;
}

/**
 * Placeholder. The real implementation must NEVER debit coins on streak
 * break — it only resets `current` to 0 and keeps `longest` and any
 * previously-claimed milestones intact.
 */
export const activityService: ActivityService = {
  ping: () => notImplemented("activity", "ping"),
  get: () => notImplemented("activity", "get"),
  claimMilestone: () => notImplemented("activity", "claimMilestone"),
};
