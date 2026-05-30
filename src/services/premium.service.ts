import { notImplemented } from "./_shared";

export interface PremiumPlan { id: string; name: string; priceCents: number; intervalMonths: number; perks: string[] }
export interface PremiumService {
  plans(): Promise<PremiumPlan[]>;
  subscribe(planId: string): Promise<{ checkoutUrl: string }>;
  cancel(): Promise<void>;
  status(userId: string): Promise<{ active: boolean; planId?: string; renewsAt?: string }>;
}

export const premiumService: PremiumService = {
  plans: () => notImplemented("premium", "plans"),
  subscribe: () => notImplemented("premium", "subscribe"),
  cancel: () => notImplemented("premium", "cancel"),
  status: () => notImplemented("premium", "status"),
};
