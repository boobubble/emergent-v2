import { notImplemented } from "./_shared";

export interface CoinBombDropInput { channelId: string; totalCoins: number; winners: number; durationSec: number }
export interface CoinBombsService {
  drop(input: CoinBombDropInput): Promise<{ id: string }>;
  claim(bombId: string): Promise<{ amount: number }>;
  listActive(channelId: string): Promise<unknown[]>;
}

export const coinBombsService: CoinBombsService = {
  drop: () => notImplemented("coin_bombs", "drop"),
  claim: () => notImplemented("coin_bombs", "claim"),
  listActive: () => notImplemented("coin_bombs", "listActive"),
};
