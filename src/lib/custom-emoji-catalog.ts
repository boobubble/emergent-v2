/** Read-only admin custom emoji catalog (custom_stickers kind=emoji). */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FALLBACK_CATEGORIES,
  type EmojiDisplaySize,
  type StickerCategory,
  type StickerPack,
} from "@/lib/sticker-catalog";

export type CustomEmojiDisplaySize = EmojiDisplaySize;

export type CustomEmojiRecord = {
  id: string;
  name: string;
  url: string;
  packId: string | null;
  packName: string;
  categoryId: string | null;
  sortOrder: number;
  displaySize: CustomEmojiDisplaySize;
};

export const CUSTOM_EMOJI_CATALOG_QUERY_KEY = ["custom-emoji-catalog", "active"] as const;

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

export function normalizeEmojiDisplaySize(raw: string | null | undefined): CustomEmojiDisplaySize {
  return raw === "large" ? "large" : "small";
}

/** CSS classes for rendered IRC message custom emoji (trusted catalog size only). */
export function ircMessageCustomEmojiClassName(displaySize: CustomEmojiDisplaySize): string {
  if (displaySize === "large") {
    return "mx-0.5 inline-block h-[48px] w-[48px] max-w-[48px] align-text-bottom object-contain";
  }
  return "mx-0.5 inline-block h-[28px] w-[28px] max-w-[32px] align-text-bottom object-contain md:h-[32px] md:w-[32px]";
}

/** Pure filter used by fetch + tests. */
export function rowsToActiveCustomEmojis(
  rows: StickerRow[],
  packs: StickerPack[],
  categories: StickerCategory[],
): CustomEmojiRecord[] {
  const activeCategoryIds = new Set(categories.filter((c) => c.is_active).map((c) => c.id));
  const packById = new Map(
    packs
      .filter((p) => p.is_active && activeCategoryIds.has(p.category_id))
      .map((p) => [p.id, p]),
  );

  const out: CustomEmojiRecord[] = [];

  for (const row of rows) {
    if (row.kind !== "emoji") continue;
    const displaySize = normalizeEmojiDisplaySize(row.display_size);
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
      packName: row.pack || "Custom",
      categoryId: null,
      sortOrder: row.sort_order,
      displaySize,
    });
  }

  out.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return out;
}

export async function fetchActiveCustomEmojis(): Promise<CustomEmojiRecord[]> {
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

  if (catRes.error) {
    throw new Error(catRes.error.message);
  }
  if (packRes.error) {
    throw new Error(packRes.error.message);
  }
  if (stickerRes.error) {
    throw new Error(stickerRes.error.message);
  }

  const categories = (catRes.data?.length ? catRes.data : FALLBACK_CATEGORIES) as StickerCategory[];
  const packs = (packRes.data ?? []) as StickerPack[];
  const rows = (stickerRes.data ?? []) as StickerRow[];
  return rowsToActiveCustomEmojis(rows, packs, categories);
}

export function buildCustomEmojiById(
  emojis: CustomEmojiRecord[],
): Map<string, CustomEmojiRecord> {
  const map = new Map<string, CustomEmojiRecord>();
  for (const e of emojis) {
    map.set(e.id.toLowerCase(), e);
  }
  return map;
}

export function useCustomEmojiCatalog() {
  const query = useQuery({
    queryKey: CUSTOM_EMOJI_CATALOG_QUERY_KEY,
    queryFn: fetchActiveCustomEmojis,
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  const byId = useMemo(
    () => buildCustomEmojiById(query.data ?? []),
    [query.data],
  );

  return {
    emojis: query.data ?? [],
    byId,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
