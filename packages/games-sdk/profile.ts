import type { SDKResult, UserId } from "./types";

export interface GameProfile {
  userId: UserId;
  username: string;
  avatarUrl?: string | null;
  level?: number;
  country?: string | null;
}

export interface ProfileAdapter {
  getProfile(userId?: UserId): Promise<SDKResult<GameProfile | null>>;
  getProfiles(userIds: UserId[]): Promise<SDKResult<GameProfile[]>>;
}
