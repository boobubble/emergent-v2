import { notImplemented } from "./_shared";
import type { LoyaltyScope } from "@/lib/retention-config";

export interface LoyaltyState {
  scope: LoyaltyScope;
  /** Optional sub-scope, e.g. the channel id for `chatroom`. */
  scopeRef?: string;
  points: number;
  rank: number;
  pausedUntil?: string | null;
}

export interface LoyaltyService {
  get(scope: LoyaltyScope, scopeRef?: string): Promise<LoyaltyState>;
  bump(scope: LoyaltyScope, points: number, reason: string, scopeRef?: string): Promise<LoyaltyState>;
  /** Inactivity → growth pauses. NEVER removes earned points. */
  markInactive(scope: LoyaltyScope, scopeRef?: string): Promise<LoyaltyState>;
}

export const loyaltyService: LoyaltyService = {
  get: () => notImplemented("loyalty", "get"),
  bump: () => notImplemented("loyalty", "bump"),
  markInactive: () => notImplemented("loyalty", "markInactive"),
};
