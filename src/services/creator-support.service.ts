import { notImplemented } from "./_shared";

export interface CreatorSupportService {
  subscribe(creatorId: string, monthlyCoins: number): Promise<{ id: string }>;
  cancel(subscriptionId: string): Promise<void>;
  listSupporters(creatorId: string): Promise<unknown[]>;
}

export const creatorSupportService: CreatorSupportService = {
  subscribe: () => notImplemented("creator_support", "subscribe"),
  cancel: () => notImplemented("creator_support", "cancel"),
  listSupporters: () => notImplemented("creator_support", "listSupporters"),
};
