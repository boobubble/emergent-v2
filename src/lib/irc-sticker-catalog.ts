/** Read-only IRC sticker catalog (custom_stickers kind=sticker). */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FALLBACK_CATEGORIES,
  type EmojiDisplaySize,
  type StickerCategory,
  type StickerPack,
} from "@/lib/sticker-catalog";

export type IrcStickerRecord = {
  id: string;
  name: string;
  url: string;
  packId: string | null;
  packName: string;
  categoryId: string | null;
  sortOrder: number;
  displaySize: EmojiDisplaySize;
};

export const IRC_STICKER_CATALOG_QUERY_KEY = ["irc-sticker-catalog", "active"] as const;

type StickerRow = {
  id: string;
  name: string;
  pack: string;
  pack_id: string | null;
  kind: string;
  url: string;
  sort_order: number;
  display_size?: string | null;
};

const sb = supabase as any;

export function normalizeStickerDisplaySize(raw: string | null | undefined): EmojiDisplaySize {
  return raw === "large" ? "large" : "small";
}

export function rowsToActiveIrcStickers(
  rows: StickerRow[],
  packs: StickerPack[],
  categories: StickerCategory[],
): IrcStickerRecord[] {
  const activeCategoryIds = new Set(categories.filter((c) => c.is_active).map((c) => c.id));
  const packById = new Map(
    packs
      .filter((p) => p.is_active && activeCategoryIds.has(p.category_id))
      .map((p) => [p.id, p]),
  );

  const out: IrcStickerRecord[] = [];

  for (const row of rows) {
    if (row.kind !== "sticker") continue;
    const displaySize = normalizeStickerDisplaySize(row.display_size);
    if (row.pack_id) {
      const pack = packById.get(row.pack_id);
      if (!pack) continue;
      out.push({
        id: row.id,
        name: row.name,
        url: row.url,
        packId: row.pack_id,
        packName: pack.name,
        categoryId: pack.category_id,
        sortOrder: row.sort_order,
        displaySize,
      });
      continue;
    }
    out.push({
      id: row.id,
      name: row.name,
      url: row.url,
      packId: null,
      packName: row.pack || "Stickers",
      categoryId: null,
      sortOrder: row.sort_order,
      displaySize,
    });
  }

  out.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return out;
}

export async function fetchActiveIrcStickers(): Promise<IrcStickerRecord[]> {
  const [catRes, packRes, stickerRes] = await Promise.all([
    sb
      .from("sticker_categories")
      .select("id, name, emoji, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    sb
      .from("sticker_packs")
      .select("id, name, category_id, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    sb
      .from("custom_stickers")
      .select("id, name, pack, pack_id, kind, url, sort_order, display_size")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
  ]);

  if (catRes.error) throw new Error(catRes.error.message);
  if (packRes.error) throw new Error(packRes.error.message);
  if (stickerRes.error) throw new Error(stickerRes.error.message);

  const categories = (catRes.data?.length ? catRes.data : FALLBACK_CATEGORIES) as StickerCategory[];
  const packs = (packRes.data ?? []) as StickerPack[];
  const rows = (stickerRes.data ?? []) as StickerRow[];
  return rowsToActiveIrcStickers(rows, packs, categories);
}

export function buildStickerById(stickers: IrcStickerRecord[]): Map<string, IrcStickerRecord> {
  const map = new Map<string, IrcStickerRecord>();
  for (const s of stickers) {
    map.set(s.id.toLowerCase(), s);
  }
  return map;
}

/** CSS classes for sticker-only IRC messages (trusted catalog size). */
export function ircMessageStickerClassName(displaySize: EmojiDisplaySize): string {
  if (displaySize === "large") {
    return "irc-msg-sticker irc-msg-sticker--large max-h-[140px] max-w-[140px] sm:max-h-[160px] sm:max-w-[160px]";
  }
  return "irc-msg-sticker irc-msg-sticker--small max-h-[96px] max-w-[96px] sm:max-h-[112px] sm:max-w-[112px]";
}

export function useIrcStickerCatalog() {
  const query = useQuery({
    queryKey: IRC_STICKER_CATALOG_QUERY_KEY,
    queryFn: fetchActiveIrcStickers,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const byId = useMemo(() => buildStickerById(query.data ?? []), [query.data]);

  return {
    stickers: query.data ?? [],
    byId,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
