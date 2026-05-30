import { notImplemented } from "./_shared";

export interface CoinGiftSendInput { toUserId: string; amount: number; message?: string }
export interface CoinGiftingService {
  send(input: CoinGiftSendInput): Promise<{ id: string }>;
  listSent(userId: string): Promise<unknown[]>;
  listReceived(userId: string): Promise<unknown[]>;
}

export const coinGiftingService: CoinGiftingService = {
  send: () => notImplemented("coin_gifting", "send"),
  listSent: () => notImplemented("coin_gifting", "listSent"),
  listReceived: () => notImplemented("coin_gifting", "listReceived"),
};
