import { notImplemented } from "./_shared";

export interface SeasonalEventsService {
  active(): Promise<unknown[]>;
  progress(eventId: string): Promise<unknown>;
  claim(eventId: string, rewardId: string): Promise<void>;
}

export const seasonalEventsService: SeasonalEventsService = {
  active: () => notImplemented("seasonal_events", "active"),
  progress: () => notImplemented("seasonal_events", "progress"),
  claim: () => notImplemented("seasonal_events", "claim"),
};
