// Skype-style animated emoticon picker.
// - Shop sticker packs the user owns (Noto Animated Emoji GIFs).
// - Admin-uploaded custom stickers/emojis (from public.custom_stickers), available to everyone.
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { SHOP_BY_ID, SHOP_BY_CATEGORY, stickerGifUrl, type StickerDef, type ShopItem } from "@/lib/shop-catalog";

export type Sticker = StickerDef & { url?: string };

export function gifUrlForSticker(cp: string) {
  return stickerGifUrl(cp);
}

/** Resolve a Sticker to its final image URL (custom uploads use `url`; shop uses `cp`). */
export function stickerUrl(s: Sticker) {
  return s.url ?? stickerGifUrl(s.cp);
}

type Pack = {
  id: string;
  name: string;
  stickers: Sticker[];
  isCustom?: boolean;
};

function useCustomPacks() {
  const [packs, setPacks] = useState<Pack[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("custom_stickers")
        .select("id, name, pack, kind, url, sort_order")
        .eq("is_active", true)
        .order("pack", { ascending: true })
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      const byPack = new Map<string, Sticker[]>();
      for (const r of (data ?? []) as any[]) {
        const key = `${r.kind === "emoji" ? "Emojis" : "Stickers"} · ${r.pack || "Custom"}`;
        const list = byPack.get(key) ?? [];
        list.push({ cp: r.id, name: r.name, label: r.name, url: r.url });
        byPack.set(key, list);
      }
      const out: Pack[] = [];
      for (const [name, stickers] of byPack) {
        out.push({ id: `custom:${name}`, name, stickers, isCustom: true });
      }
      setPacks(out);
    })();
    return () => { cancelled = true; };
  }, []);
  return packs;
}

export function AnimatedEmojiPicker({ onPick, onOpenShop }: { onPick: (s: Sticker) => void; onOpenShop?: () => void }) {
  const { user } = useAuth();
  const [ownedPacks, setOwnedPacks] = useState<ShopItem[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const customPacks = useCustomPacks();

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
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const totalForSale = SHOP_BY_CATEGORY.emoji_pack.length;

  const allPacks: Pack[] = [
    ...(customPacks ?? []),
    ...((ownedPacks ?? []).map(p => ({ id: p.id, name: p.name.replace(/ Pack$/, ""), stickers: (p.stickers ?? []) as Sticker[] }))),
  ];

  // set default active pack once packs load
  useEffect(() => {
    if (activeId) return;
    if (allPacks.length > 0) setActiveId(allPacks[0].id);
  }, [allPacks.length, activeId]);

  if (customPacks === null || ownedPacks === null) {
    return (
      <div className="w-[320px] rounded-xl border border-border bg-card p-4 text-center text-xs text-muted-foreground shadow-lg">
        Loading stickers…
      </div>
    );
  }

  if (allPacks.length === 0) {
    return (
      <div className="w-[320px] rounded-xl border border-border bg-card p-4 shadow-lg">
        <div className="flex flex-col items-center gap-2 py-3 text-center">
          <div className="text-sm font-semibold">No animated stickers yet</div>
          <div className="text-[11px] text-muted-foreground">
            Buy sticker packs from the Shop, or ask an admin to upload custom ones.
          </div>
          {onOpenShop && (
            <button
              onClick={onOpenShop}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground hover:bg-primary/90"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Open Shop ({totalForSale} packs)
            </button>
          )}
        </div>
      </div>
    );
  }

  const active = allPacks.find(p => p.id === activeId) ?? allPacks[0];
  const isEmojiPack = active.isCustom && /^Emojis/.test(active.name);
  const cellSize = isEmojiPack ? "h-10 w-10" : "h-16 w-16";
  const imgSize = isEmojiPack ? "h-9 w-9" : "h-14 w-14";
  const cols = isEmojiPack ? "grid-cols-6" : "grid-cols-4";

  return (
    <div className="w-[320px] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1 overflow-x-auto">
        {allPacks.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            title={p.name}
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${active.id === p.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"}`}
          >
            {p.name}
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
      <div className="max-h-[240px] overflow-y-auto p-2">
        <div className={`grid ${cols} gap-1.5`}>
          {(active.stickers ?? []).map(s => (
            <button
              key={s.name + s.cp}
              onClick={() => onPick(s)}
              title={s.label}
              className={`grid ${cellSize} place-items-center rounded-lg transition-transform hover:scale-110 hover:bg-white/5 active:scale-95`}
            >
              <img
                src={stickerUrl(s)}
                alt={s.label}
                loading="lazy"
                className={`${imgSize} object-contain`}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-border px-2 py-1 text-center text-[9px] uppercase tracking-wider text-muted-foreground">
        Tap to send
      </div>
    </div>
  );
}
