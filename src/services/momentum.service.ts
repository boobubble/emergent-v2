import { notImplemented } from "./_shared";

export interface MomentumService {
  get(userId: string): Promise<{ score: number; tier: string }>;
  bump(userId: string, delta: number, reason: string): Promise<void>;
}

export const momentumService: MomentumService = {
  get: () => notImplemented("momentum", "get"),
  bump: () => notImplemented("momentum", "bump"),
};
