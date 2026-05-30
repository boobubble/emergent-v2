import { notImplemented } from "./_shared";

export interface MarketListingInput { title: string; priceCoins: number; category: string; payload: Record<string, unknown> }
export interface MarketplaceService {
  list(input: MarketListingInput): Promise<{ id: string }>;
  buy(listingId: string): Promise<{ orderId: string }>;
  search(query: string): Promise<unknown[]>;
}

export const marketplaceService: MarketplaceService = {
  list: () => notImplemented("marketplace", "list"),
  buy: () => notImplemented("marketplace", "buy"),
  search: () => notImplemented("marketplace", "search"),
};
