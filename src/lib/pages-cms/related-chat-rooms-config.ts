/**
 * Related Chat Rooms presentation config (Settings tab).
 * Stored on custom_pages.related_chat_rooms — not in content.
 * page_internal_links remains the canonical relationship source for auto-fill.
 */

import { z } from "zod";

export const RELATED_CHAT_ROOMS_CONFIG_MAX = 8;

export const relatedChatRoomItemSchema = z.object({
  id: z.string().min(1).max(80),
  target_page_id: z.string().uuid(),
  label: z.string().max(120).nullable().default(null),
  enabled: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(100).default(0),
});

export const relatedChatRoomsConfigSchema = z.object({
  auto_fill: z.boolean().default(true),
  // Allow oversized payloads from clients; parseRelatedChatRoomsConfig caps/dedupes.
  items: z.array(relatedChatRoomItemSchema).max(40).default([]),
});

export type RelatedChatRoomItem = z.infer<typeof relatedChatRoomItemSchema>;
export type RelatedChatRoomsConfig = z.infer<typeof relatedChatRoomsConfigSchema>;

export function defaultRelatedChatRoomsConfig(): RelatedChatRoomsConfig {
  return { auto_fill: true, items: [] };
}

/** Normalize unknown DB/JSON into a safe config. Invalid → null (treat as automatic). */
export function parseRelatedChatRoomsConfig(raw: unknown): RelatedChatRoomsConfig | null {
  if (raw == null) return null;
  const parsed = relatedChatRoomsConfigSchema.safeParse(raw);
  if (!parsed.success) return null;
  // Deduplicate by target_page_id; keep first by sort_order.
  const seen = new Set<string>();
  const items = [...parsed.data.items]
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((item) => {
      if (seen.has(item.target_page_id)) return false;
      seen.add(item.target_page_id);
      return true;
    })
    .slice(0, RELATED_CHAT_ROOMS_CONFIG_MAX)
    .map((item, idx) => ({
      ...item,
      label: item.label?.trim() ? item.label.trim() : null,
      sort_order: idx,
    }));
  return { auto_fill: parsed.data.auto_fill, items };
}

/** Serialize for DB write (always stores a concrete object once admin saves). */
export function serializeRelatedChatRoomsConfig(
  config: RelatedChatRoomsConfig | null | undefined,
): RelatedChatRoomsConfig | null {
  if (config == null) return null;
  return parseRelatedChatRoomsConfig(config) ?? defaultRelatedChatRoomsConfig();
}

export function newRelatedChatRoomItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rcr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
