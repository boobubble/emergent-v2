import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { pickerItemPointerHandlers } from "@/components/chat/picker-pointer-tap";
import { useIrcStickerCatalog, type IrcStickerRecord } from "@/lib/irc-sticker-catalog";
import { FALLBACK_CATEGORIES } from "@/lib/sticker-catalog";
import { cn } from "@/lib/utils";

type IrcStickerPickerProps = {
  onPick: (stickerId: string) => void;
  onClose?: () => void;
};

export function IrcStickerPicker({ onPick, onClose }: IrcStickerPickerProps) {
  const { stickers, isLoading } = useIrcStickerCatalog();
  const categories = useMemo(() => {
    const ids = new Set(
      stickers.map((s) => s.categoryId).filter((id): id is string => Boolean(id)),
    );
    return FALLBACK_CATEGORIES.filter((c) => ids.has(c.id) || c.id === "custom");
  }, [stickers]);

  const [categoryId, setCategoryId] = useState<string>("custom");

  const packsInCategory = useMemo(() => {
    const map = new Map<string, { packName: string; items: IrcStickerRecord[] }>();
    for (const sticker of stickers) {
      const cat = sticker.categoryId ?? "custom";
      if (cat !== categoryId) continue;
      const key = sticker.packId ?? sticker.packName;
      const cur = map.get(key) ?? { packName: sticker.packName, items: [] };
      cur.items.push(sticker);
      map.set(key, cur);
    }
    return [...map.values()].filter((p) => p.items.length > 0);
  }, [stickers, categoryId]);

  const activeCategories = useMemo(() => {
    const withStickers = new Set(
      stickers.map((s) => s.categoryId ?? "custom"),
    );
    const list = categories.filter((c) => withStickers.has(c.id));
    return list.length ? list : [{ id: "custom", name: "Stickers", emoji: "⭐", sort_order: 0, is_active: true }];
  }, [categories, stickers]);

  if (isLoading) {
    return (
      <div className="irc-sticker-picker flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading stickers…
      </div>
    );
  }

  if (!stickers.length) {
    return (
      <p className="irc-sticker-picker p-4 text-center text-sm text-muted-foreground">
        No stickers available yet.
      </p>
    );
  }

  return (
    <div className="irc-sticker-picker flex max-h-[min(50dvh,360px)] min-w-[min(100vw-2rem,320px)] flex-col">
      <div className="flex gap-1 overflow-x-auto border-b border-border/70 px-2 py-2">
        {activeCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
              categoryId === cat.id
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
            onClick={() => setCategoryId(cat.id)}
          >
            <span aria-hidden>{cat.emoji}</span> {cat.name}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {packsInCategory.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">No stickers in this category.</p>
        ) : (
          packsInCategory.map((pack) => (
            <div key={pack.packName} className="mb-3 last:mb-0">
              <p className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {pack.packName}
              </p>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                {pack.items.map((sticker) => (
                  <button
                    key={sticker.id}
                    type="button"
                    aria-label={sticker.name}
                    title={sticker.name}
                    {...pickerItemPointerHandlers(() => {
                      onPick(sticker.id);
                      onClose?.();
                    })}
                    className="grid h-14 w-full place-items-center rounded-lg border border-transparent transition-transform hover:scale-105 hover:border-border/60 hover:bg-muted/30 active:scale-95"
                  >
                    <img
                      src={sticker.url}
                      alt=""
                      loading="lazy"
                      className="h-11 w-11 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
