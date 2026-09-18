import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { pickerItemPointerHandlers } from "@/components/chat/picker-pointer-tap";
import {
  useCustomEmojiCatalog,
  type CustomEmojiRecord,
} from "@/lib/custom-emoji-catalog";
import { createCustomEmojiToken } from "@/lib/irc-chat/irc-custom-emoji";
import { cn } from "@/lib/utils";

export function IrcEmojiPicker({
  onPick,
  onClose,
}: {
  onPick: (token: string) => void;
  onClose?: () => void;
}) {
  const { emojis, isLoading } = useCustomEmojiCatalog();
  const hasEmojis = emojis.length > 0;
  const byPack = useMemo(() => groupCustomEmojisByPack(emojis), [emojis]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
      {isLoading ? (
        <div className="grid place-items-center gap-2 p-6 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading emojis…
        </div>
      ) : !hasEmojis ? (
        <p className="p-4 text-center text-[11px] text-muted-foreground">
          No Yaarzo emojis yet.
        </p>
      ) : (
        <div className="max-h-[min(50dvh,320px)] overflow-y-auto p-2">
          {byPack.map((group) => {
            const small = group.items.filter((e) => e.displaySize === "small");
            const large = group.items.filter((e) => e.displaySize === "large");
            return (
              <div key={group.packKey} className="mb-3 last:mb-0">
                <p className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {group.packName}
                </p>
                {small.length > 0 ? (
                  <EmojiSizeSection
                    label="Small Emojis"
                    emojis={small}
                    sizeClass="small"
                    onPick={onPick}
                    onClose={onClose}
                  />
                ) : null}
                {large.length > 0 ? (
                  <EmojiSizeSection
                    label="Large Emojis"
                    emojis={large}
                    sizeClass="large"
                    onPick={onPick}
                    onClose={onClose}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmojiSizeSection({
  label,
  emojis,
  sizeClass,
  onPick,
  onClose,
}: {
  label: string;
  emojis: CustomEmojiRecord[];
  sizeClass: "small" | "large";
  onPick: (token: string) => void;
  onClose?: () => void;
}) {
  const isLarge = sizeClass === "large";
  return (
    <div className={cn("mb-2 last:mb-0", isLarge && "mt-2")}>
      <p className="mb-1 px-0.5 text-[9px] font-semibold text-muted-foreground/90">{label}</p>
      <div
        className={cn(
          "grid gap-1.5",
          isLarge ? "grid-cols-4 sm:grid-cols-5" : "grid-cols-7 sm:grid-cols-8",
        )}
      >
        {emojis.map((emoji) => (
          <button
            key={emoji.id}
            type="button"
            title={emoji.name}
            {...pickerItemPointerHandlers(() => {
              onPick(createCustomEmojiToken(emoji.id));
              onClose?.();
            })}
            className={cn(
              "grid place-items-center rounded-lg transition-transform hover:scale-105 hover:bg-muted/50 active:scale-95",
              isLarge ? "h-16 w-16" : "h-9 w-9",
            )}
          >
            <img
              src={emoji.url}
              alt={emoji.name}
              loading="lazy"
              className={cn("object-contain", isLarge ? "h-14 w-14" : "h-8 w-8")}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function groupCustomEmojisByPack(emojis: CustomEmojiRecord[]) {
  const map = new Map<string, { packKey: string; packName: string; items: CustomEmojiRecord[] }>();
  for (const emoji of emojis) {
    const packKey = emoji.packId ?? `legacy:${emoji.packName}`;
    const cur = map.get(packKey) ?? {
      packKey,
      packName: emoji.packName,
      items: [],
    };
    cur.items.push(emoji);
    map.set(packKey, cur);
  }
  return [...map.values()];
}
