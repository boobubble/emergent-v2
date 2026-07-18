import type { SDKResult, UserId } from "./types";

export interface NotificationInput {
  title: string;
  body?: string;
  toUserId?: UserId;
  data?: Record<string, unknown>;
}

export interface FriendFanoutInput {
  title: string;
  body?: string;
  kind?: string;
  data?: Record<string, unknown>;
}

export interface NotificationsAdapter {
  sendNotification(input: NotificationInput): Promise<SDKResult<{ id: string }>>;
  notifyFriends?(input: FriendFanoutInput): Promise<SDKResult<{ delivered: number }>>;
}
