// Skype-style animated emoticon picker.
// Uses Google's Noto Animated Emoji GIFs (public CDN) as sticker-style GIFs.
// Animated sticker packs must be purchased from the Shop — only owned packs appear here.
import { useEffect, useState } from "react";
import { ShoppingBag, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { SHOP_BY_ID, SHOP_BY_CATEGORY, stickerGifUrl, type StickerDef, type ShopItem } from "@/lib/shop-catalog";

export type Sticker = StickerDef;

export function gifUrlForSticker(cp: string) {
  return stickerGifUrl(cp);
}

export function AnimatedEmojiPicker({ onPick, onOpenShop }: { onPick: (s: Sticker) => void; onOpenShop?: () => void }) {
  const { user } = useAuth();
  const [ownedPacks, setOwnedPacks] = useState<ShopItem[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) { setOwnedPacks([]); return; }
      const { data } = await supabase
        .from("user_inventory")
        .select("item_id, category")
        .eq("user_id", user.id)
        .eq("category", "emoji_pack");
      if (cancelled) return;
      const items = (data ?? [])
        .map(r => SHOP_BY_ID[r.item_id])
        .filter((it): it is ShopItem => !!it && !!it.stickers?.length);
      setOwnedPacks(items);
      setActiveId(prev => prev ?? items[0]?.id ?? null);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const totalForSale = SHOP_BY_CATEGORY.emoji_pack.length;

  if (ownedPacks === null) {
    return (
      <div className="w-[300px] rounded-xl border border-border bg-card p-4 text-center text-xs text-muted-foreground shadow-lg">
        Loading sticker packs…
      </div>
    );
  }

  if (ownedPacks.length === 0) {
    return (
      <div className="w-[300px] rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <div className="text-sm font-semibold">No animated stickers yet</div>
          <div className="text-[11px] text-muted-foreground">
            Buy sticker packs from the Shop to send animated stickers in chat.
          </div>
          <button
            onClick={onOpenShop}
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Open Shop ({totalForSale} packs)
          </button>
        </div>
      </div>
    );
  }

  const active = ownedPacks.find(p => p.id === activeId) ?? ownedPacks[0];
  return (
    <div className="w-[300px] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1 overflow-x-auto">
        {ownedPacks.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            title={p.name}
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${active.id === p.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"}`}
          >
            {p.name.replace(/ Pack$/, "")}
          </button>
        ))}
        {onOpenShop && (
          <button
            onClick={onOpenShop}
            title="Get more packs in Shop"
            className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="max-h-[200px] overflow-y-auto p-1.5">
        <div className="grid grid-cols-6 gap-1">
          {(active.stickers ?? []).map(s => (
            <button
              key={s.name + s.cp}
              onClick={() => onPick(s)}
              title={s.label}
              className="grid h-10 w-10 place-items-center rounded-lg transition-transform hover:scale-110 hover:bg-white/5 active:scale-95"
            >
              <img
                src={gifUrlForSticker(s.cp)}
                alt={s.label}
                loading="lazy"
                className="h-9 w-9 object-contain"
              />
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-border px-2 py-1 text-center text-[9px] uppercase tracking-wider text-muted-foreground">
        Tap to send animated sticker
      </div>
    </div>
  );
}
