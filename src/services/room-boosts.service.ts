import { notImplemented } from "./_shared";

export interface RoomBoostsService {
  boost(channelId: string, coins: number, durationHours: number): Promise<{ id: string }>;
  active(channelId: string): Promise<unknown[]>;
}

export const roomBoostsService: RoomBoostsService = {
  boost: () => notImplemented("room_boosts", "boost"),
  active: () => notImplemented("room_boosts", "active"),
};
