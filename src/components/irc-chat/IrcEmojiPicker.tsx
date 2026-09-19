import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { pickerItemPointerHandlers } from "@/components/chat/picker-pointer-tap";
import {
  partitionCustomEmojisByDisplaySize,
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
        <div className="max-h-[min(50dvh,360px)] overflow-y-auto p-2">
          {byPack.map((group) => {
            const { smallEmojis, largeEmojis } = partitionCustomEmojisByDisplaySize(group.items);
            return (
              <div key={group.packKey} className="mb-4 last:mb-0">
                <p className="mb-2 px-0.5 text-[11px] font-bold uppercase tracking-wide text-foreground/90">
                  {group.packName}
                </p>
                <div className="space-y-3">
                  {smallEmojis.length > 0 ? (
                    <EmojiSizeSection
                      label="Small Emojis"
                      emojis={smallEmojis}
                      sizeClass="small"
                      onPick={onPick}
                      onClose={onClose}
                    />
                  ) : null}
                  {smallEmojis.length > 0 && largeEmojis.length > 0 ? (
                    <div className="border-t border-border/70" role="separator" />
                  ) : null}
                  {largeEmojis.length > 0 ? (
                    <EmojiSizeSection
                      label="Large Emojis"
                      emojis={largeEmojis}
                      sizeClass="large"
                      onPick={onPick}
                      onClose={onClose}
                    />
                  ) : null}
                </div>
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
    <section
      className={cn(
        "rounded-lg border border-border/70 bg-muted/15 p-2.5",
        isLarge && "bg-muted/25 p-3",
      )}
      aria-label={label}
    >
      <h4 className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </h4>
      <div
        className={cn(
          "grid",
          isLarge ? "grid-cols-3 gap-2.5 sm:grid-cols-4" : "grid-cols-6 gap-1 sm:grid-cols-7",
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
              "grid place-items-center rounded-lg border border-transparent transition-transform hover:scale-105 hover:border-border/60 hover:bg-background/40 active:scale-95",
              isLarge ? "h-[4.25rem] w-full min-w-[4.25rem]" : "h-9 w-9",
            )}
          >
            <img
              src={emoji.url}
              alt={emoji.name}
              loading="lazy"
              className={cn("object-contain", isLarge ? "h-14 w-14 sm:h-16 sm:w-16" : "h-8 w-8")}
            />
          </button>
        ))}
      </div>
    </section>
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
