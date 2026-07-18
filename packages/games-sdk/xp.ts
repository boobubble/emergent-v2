import type { SDKResult, UserId } from "./types";

export interface XPState {
  userId: UserId;
  xp: number;
  level: number;
  nextLevelAt?: number;
}

export interface XPAdapter {
  getXP(userId?: UserId): Promise<SDKResult<XPState>>;
  addXP(amount: number, reason?: string): Promise<SDKResult<XPState>>;
}
