import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { pickerItemPointerHandlers } from "@/components/chat/picker-pointer-tap";
import { useCustomEmojiCatalog, type CustomEmojiRecord } from "@/lib/custom-emoji-catalog";
import { createCustomEmojiToken } from "@/lib/irc-chat/irc-custom-emoji";

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
        <div className="max-h-[240px] overflow-y-auto p-2">
          {byPack.map((group) => (
            <div key={group.packKey} className="mb-2 last:mb-0">
              <p className="mb-1 px-0.5 text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                {group.packName}
              </p>
              <div className="grid grid-cols-6 gap-1">
                {group.items.map((emoji) => (
                  <button
                    key={emoji.id}
                    type="button"
                    title={emoji.name}
                    {...pickerItemPointerHandlers(() => {
                      onPick(createCustomEmojiToken(emoji.id));
                      onClose?.();
                    })}
                    className="grid h-10 w-10 place-items-center rounded-lg transition-transform hover:scale-110 hover:bg-muted/50 active:scale-95"
                  >
                    <img
                      src={emoji.url}
                      alt={emoji.name}
                      loading="lazy"
                      className="h-8 w-8 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
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
