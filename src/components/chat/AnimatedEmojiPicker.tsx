// Skype-style animated emoticon picker.
// Admin-uploaded custom stickers (custom_stickers + sticker_packs) and owned shop packs.
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-store";
import { SHOP_BY_ID, SHOP_BY_CATEGORY, stickerGifUrl, type StickerDef, type ShopItem } from "@/lib/shop-catalog";
import { pickerItemPointerHandlers } from "./picker-pointer-tap";
import { FALLBACK_CATEGORIES, type StickerCategory, type StickerPack } from "@/lib/sticker-catalog";

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
  kind?: string;
};

const sb = supabase as any;

function useStickerCatalog() {
  const [categories, setCategories] = useState<StickerCategory[] | null>(null);
  const [packs, setPacks] = useState<StickerPack[] | null>(null);
  const [stickers, setStickers] = useState<{ id: string; name: string; pack_id: string | null; pack: string; kind: string; url: string }[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [catRes, packRes, stickerRes] = await Promise.all([
        sb.from("sticker_categories").select("id, name, emoji, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
        sb.from("sticker_packs").select("id, name, category_id, sort_order, is_active").eq("is_active", true).order("sort_order", { ascending: true }),
        sb.from("custom_stickers").select("id, name, pack, pack_id, kind, url, sort_order").eq("is_active", true).order("sort_order", { ascending: true }),
      ]);
      if (cancelled) return;
      setCategories((catRes.data?.length ? catRes.data : FALLBACK_CATEGORIES) as StickerCategory[]);
      setPacks((packRes.data ?? []) as StickerPack[]);
      setStickers(stickerRes.data ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  return { categories, packs, stickers };
}

export function AnimatedEmojiPicker({
  onPick,
  onOpenShop,
  onClose,
}: {
  onPick: (s: Sticker) => void;
  onOpenShop?: () => void;
  /** When set, picking a sticker (and clicking the backdrop) dismisses the picker. */
  onClose?: () => void;
}) {
  const { user } = useAuth();
  const [ownedPacks, setOwnedPacks] = useState<ShopItem[] | null>(null);
  const { categories, packs, stickers } = useStickerCatalog();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [packId, setPackId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user?.id) { setOwnedPacks([]); return; }
      const { data } = await (supabase as any)
        .from("user_inventory")
        .select("item_id, category")
        .eq("user_id", user.id)
        .eq("category", "emoji_pack");
      if (cancelled) return;
      const items = (data ?? [])
        .map((r: { item_id: string }) => SHOP_BY_ID[r.item_id])
        .filter((it: ShopItem | undefined): it is ShopItem => !!it && !!it.stickers?.length);
      setOwnedPacks(items);
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const totalForSale = SHOP_BY_CATEGORY.emoji_pack.length;

  const cats = useMemo(() => {
    const list = [...(categories ?? FALLBACK_CATEGORIES)];
    if ((ownedPacks ?? []).length) {
      list.push({ id: "_shop", name: "Shop", emoji: "🛍️", sort_order: 999, is_active: true });
    }
    return list;
  }, [categories, ownedPacks]);

  const packsInCat: Pack[] = useMemo(() => {
    if (categoryId === "_shop") {
      return (ownedPacks ?? []).map((p) => ({
        id: p.id,
        name: p.name.replace(/ Pack$/, ""),
        stickers: (p.stickers ?? []) as Sticker[],
      }));
    }
    const inCat = (packs ?? []).filter((p) => p.category_id === categoryId);
    if (inCat.length) {
      return inCat.map((p) => {
        const items = (stickers ?? []).filter((s) => s.pack_id === p.id);
        return {
          id: p.id,
          name: p.name,
          isCustom: true,
          kind: items[0]?.kind,
          stickers: items.map((s) => ({ cp: s.id, name: s.name, label: s.name, url: s.url })),
        };
      }).filter((p) => p.stickers.length > 0);
    }
    if (categoryId === "custom" && (stickers ?? []).length) {
      const byPack = new Map<string, { kind: string; stickers: Sticker[] }>();
      for (const s of stickers ?? []) {
        const key = s.pack || "Custom";
        const cur = byPack.get(key) ?? { kind: s.kind, stickers: [] };
        cur.stickers.push({ cp: s.id, name: s.name, label: s.name, url: s.url });
        byPack.set(key, cur);
      }
      return [...byPack.entries()].map(([name, v]) => ({
        id: `legacy:${name}`,
        name,
        isCustom: true,
        kind: v.kind,
        stickers: v.stickers,
      }));
    }
    return [];
  }, [categoryId, packs, stickers, ownedPacks]);

  useEffect(() => {
    if (!cats.length) return;
    if (!categoryId || !cats.some((c) => c.id === categoryId)) setCategoryId(cats[0].id);
  }, [cats, categoryId]);

  useEffect(() => {
    if (!packsInCat.length) {
      setPackId(null);
      return;
    }
    if (!packId || !packsInCat.some((p) => p.id === packId)) setPackId(packsInCat[0].id);
  }, [packsInCat, packId]);

  if (categories === null || packs === null || stickers === null || ownedPacks === null) {
    return (
      <div className="w-[320px] rounded-xl border border-border bg-card p-4 text-center text-xs text-muted-foreground shadow-lg">
        Loading stickers…
      </div>
    );
  }

  const hasAnyCustom = (stickers ?? []).length > 0;
  const hasShop = (ownedPacks ?? []).length > 0;
  if (!hasAnyCustom && !hasShop) {
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

  const active = packsInCat.find((p) => p.id === packId) ?? packsInCat[0];
  const isEmojiPack = !!active?.isCustom && active.kind === "emoji";
  const cellSize = isEmojiPack ? "h-10 w-10" : "h-16 w-16";
  const imgSize = isEmojiPack ? "h-9 w-9" : "h-14 w-14";
  const cols = isEmojiPack ? "grid-cols-6" : "grid-cols-4";
  const showPackTabs = packsInCat.length > 1;

  function pick(s: Sticker) {
    onPick(s);
    onClose?.();
  }

  return (
    <>
    {onClose && (
      <div
        className="fixed inset-0 z-40"
        aria-hidden
        onPointerDown={(ev) => {
          ev.preventDefault();
          onClose();
        }}
      />
    )}
    <div className="relative z-50 w-[320px] overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1 overflow-x-auto">
        {cats.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setCategoryId(c.id); setPackId(null); }}
            className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap transition-colors ${categoryId === c.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"}`}
          >
            {c.emoji} {c.name}
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
      {showPackTabs && (
        <div className="flex items-center gap-1 border-b border-border px-2 py-1 overflow-x-auto">
          {packsInCat.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPackId(p.id)}
              title={p.name}
              className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors ${active?.id === p.id ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5"}`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
      <div className="max-h-[240px] overflow-y-auto p-2">
        {!active ? (
          <p className="py-6 text-center text-[11px] text-muted-foreground">No stickers in this category.</p>
        ) : (
          <div className={`grid ${cols} gap-1.5`}>
            {(active.stickers ?? []).map(s => (
              <button
                type="button"
                key={s.name + s.cp}
                {...pickerItemPointerHandlers(() => pick(s))}
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
        )}
      </div>
      <div className="border-t border-border px-2 py-1 text-center text-[9px] uppercase tracking-wider text-muted-foreground">
        Tap to send
      </div>
    </div>
    </>
  );
}
