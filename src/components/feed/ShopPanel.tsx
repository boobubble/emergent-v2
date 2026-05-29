import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Coins, Check, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { SHOP_BY_CATEGORY, CATEGORY_LABEL, type ShopCategory, type ShopItem } from "@/lib/shop-catalog";
import { getMyInventory, purchaseItem, equipItem } from "@/lib/rewards.functions";
import { SHOP_BY_ID } from "@/lib/shop-catalog";
import { setLocalEquip } from "@/lib/cosmetics-store";
import { useAuth } from "@/lib/auth-store";

const CATS: ShopCategory[] = ["frame", "username_effect", "theme", "emoji_pack", "badge", "background"];

interface InventoryRow { item_id: string; category: string; equipped: boolean; acquired_at: string }

export function ShopPanel({ onBack }: { onBack: () => void }) {
  const fetchInv = useServerFn(getMyInventory);
  const buy = useServerFn(purchaseItem);
  const equip = useServerFn(equipItem);
  const { user: authUser } = useAuth();
  const [coins, setCoins] = useState(0);
  const [inv, setInv] = useState<InventoryRow[]>([]);
  const [cat, setCat] = useState<ShopCategory>("frame");
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    const r = await fetchInv();
    setCoins(r.profile?.coins ?? 0);
    setInv(r.inventory as InventoryRow[]);
  }
  useEffect(() => { void refresh(); }, []);

  const ownedIds = new Set(inv.map(i => i.item_id));
  const equippedByCat: Record<string, string | undefined> = {};
  inv.forEach(i => { if (i.equipped) equippedByCat[i.category] = i.item_id; });

  async function onBuy(item: ShopItem) {
    if (coins < item.price) { toast.error("Not enough coins"); return; }
    setBusy(item.id);
    try {
      await buy({ data: { itemId: item.id } });
      toast.success(`Purchased ${item.name}!`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    } finally { setBusy(null); }
  }

  async function onEquip(item: ShopItem, equipped: boolean) {
    setBusy(item.id);
    try {
      await equip({ data: { itemId: item.id, equipped } });
      // Optimistic: update local cosmetic cache so UI reflects instantly.
      if (authUser?.id) {
        // Unequip any other item in same category locally first.
        if (equipped) {
          const prevId = equippedByCat[item.category];
          const prev = prevId ? SHOP_BY_ID[prevId] : undefined;
          if (prev) setLocalEquip(authUser.id, prev, false);
        }
        setLocalEquip(authUser.id, item, equipped);
      }
      toast.success(equipped ? `${item.name} equipped` : `${item.name} unequipped`);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(null); }
  }

  return (
    <div>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Coins className="h-5 w-5 text-amber-500" /> Shop
        </h1>
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-600 dark:text-amber-400">
          <Coins className="h-4 w-4" /> {coins}
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Cosmetics only — show off your style. No gambling, no trading.</p>

      <div className="mt-4 flex gap-1 overflow-x-auto rounded-full border border-border bg-background/50 p-1">
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${cat === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}
          >
            {CATEGORY_LABEL[c]} <span className="ml-1 opacity-70">({SHOP_BY_CATEGORY[c].length})</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SHOP_BY_CATEGORY[cat].map(item => {
          const owned = ownedIds.has(item.id);
          const isEquipped = equippedByCat[cat] === item.id;
          const canAfford = coins >= item.price;
          return (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-3">
              <div className="flex items-start gap-3">
                <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-2xl ${item.frameRing ?? ""}`}>
                  {item.preview}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-bold ${item.usernameClass ?? ""}`}>{item.name}</div>
                  <div className="text-[11px] text-muted-foreground">{item.description}</div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Coins className="h-3 w-3" /> {item.price}
                    </span>
                    {owned ? (
                      <button
                        onClick={() => onEquip(item, !isEquipped)}
                        disabled={busy === item.id}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${isEquipped ? "bg-primary text-primary-foreground" : "border border-primary text-primary hover:bg-primary/10"}`}
                      >
                        {isEquipped ? <><Check className="mr-0.5 inline h-3 w-3" /> Equipped</> : "Equip"}
                      </button>
                    ) : (
                      <button
                        onClick={() => onBuy(item)}
                        disabled={!canAfford || busy === item.id}
                        className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {!canAfford ? <><Lock className="mr-0.5 inline h-3 w-3" /> Locked</> : busy === item.id ? "…" : "Buy"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
