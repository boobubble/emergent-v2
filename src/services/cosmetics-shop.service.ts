import { notImplemented } from "./_shared";

export interface ShopProduct { id: string; name: string; category: string; priceCoins: number }
export interface CosmeticsShopService {
  catalog(): Promise<ShopProduct[]>;
  purchase(productId: string): Promise<{ inventoryId: string }>;
  equip(inventoryId: string): Promise<void>;
}

export const cosmeticsShopService: CosmeticsShopService = {
  catalog: () => notImplemented("cosmetics_shop", "catalog"),
  purchase: () => notImplemented("cosmetics_shop", "purchase"),
  equip: () => notImplemented("cosmetics_shop", "equip"),
};
