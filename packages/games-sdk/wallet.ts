import type { SDKResult, UserId } from "./types";

export interface WalletBalance {
  userId: UserId;
  coins: number;
  updatedAt?: string;
}

export interface WalletAdapter {
  getBalance(userId?: UserId): Promise<SDKResult<WalletBalance>>;
  addCoins(amount: number, reason?: string): Promise<SDKResult<WalletBalance>>;
  spendCoins(amount: number, reason?: string): Promise<SDKResult<WalletBalance>>;
}
