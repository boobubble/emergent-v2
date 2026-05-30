import { notImplemented } from "./_shared";

export interface TipInput { creatorId: string; amount: number; postId?: string; message?: string }
export interface CreatorTippingService {
  tip(input: TipInput): Promise<{ id: string }>;
  totalsFor(creatorId: string): Promise<{ coins: number; tips: number }>;
}

export const creatorTippingService: CreatorTippingService = {
  tip: () => notImplemented("creator_tipping", "tip"),
  totalsFor: () => notImplemented("creator_tipping", "totalsFor"),
};
