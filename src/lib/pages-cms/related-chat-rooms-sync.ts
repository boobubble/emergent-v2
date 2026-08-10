/**
 * Sync manual Related Chat Rooms selections into page_internal_links.
 *
 * custom_pages.related_chat_rooms stays presentation-only.
 * page_internal_links remains the canonical relationship graph.
 * Inserts missing enabled targets only — never duplicates existing rows,
 * never rewrites page body content.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { pagePublicPath, slugifyPageSlug } from "@/lib/page-slug";
import { recalculateInternalLinkCount } from "@/lib/pages-cms/internal-links";
import {
  parseRelatedChatRoomsConfig,
  type RelatedChatRoomsConfig,
} from "@/lib/pages-cms/related-chat-rooms-config";

type Sb = SupabaseClient<Database>;

export type ExistingInternalLinkRef = {
  id?: string;
  target_page_id?: string | null;
  target_url: string;
  anchor_text: string;
};

export type ManualRelatedSyncTarget = {
  target_page_id: string;
  slug: string;
  title: string;
  label?: string | null;
  sort_order: number;
};

export type PlannedInternalLinkInsert = {
  target_page_id: string;
  target_url: string;
  anchor_text: string;
  sort_order: number;
  is_manual: true;
};

function normalizeTargetUrl(slugOrUrl: string): string {
  const slug = slugifyPageSlug(slugOrUrl) || slugOrUrl.replace(/^\/+|\/+$/g, "").toLowerCase();
  return pagePublicPath(slug);
}

/** True when an existing graph row already represents this target (by id or flat URL). */
export function internalLinkCoversTarget(
  existing: ExistingInternalLinkRef[],
  target: { target_page_id: string; target_url: string },
): boolean {
  const url = normalizeTargetUrl(target.target_url);
  return existing.some((row) => {
    if (row.target_page_id && row.target_page_id === target.target_page_id) return true;
    return normalizeTargetUrl(row.target_url) === url;
  });
}

/**
 * Pure plan: which enabled manual related rooms are missing from page_internal_links.
 * Skips self, empty, and already-covered targets.
 */
export function planRelatedChatRoomsInternalLinkSync(input: {
  pageId: string;
  sourceSlug?: string | null;
  config: RelatedChatRoomsConfig | null | undefined;
  targetsById: Map<string, { id: string; slug: string; title: string }>;
  existingLinks: ExistingInternalLinkRef[];
}): PlannedInternalLinkInsert[] {
  const config = parseRelatedChatRoomsConfig(input.config);
  if (!config?.items.length) return [];

  const selfSlug = (slugifyPageSlug(input.sourceSlug || "") || "").toLowerCase();
  const planned: PlannedInternalLinkInsert[] = [];
  const plannedUrls = new Set<string>();

  const enabled = [...config.items]
    .filter((item) => item.enabled !== false)
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const item of enabled) {
    if (item.target_page_id === input.pageId) continue;
    const target = input.targetsById.get(item.target_page_id);
    if (!target?.slug) continue;
    const slug = slugifyPageSlug(target.slug) || target.slug;
    if (!slug || slug.toLowerCase() === selfSlug) continue;
    const target_url = pagePublicPath(slug);
    if (target_url.startsWith("/p/")) continue;
    if (internalLinkCoversTarget(input.existingLinks, { target_page_id: target.id, target_url })) {
      continue;
    }
    if (plannedUrls.has(target_url)) continue;
    plannedUrls.add(target_url);

    const anchor =
      (item.label || "").trim() ||
      (target.title || "").trim() ||
      slug.replace(/-/g, " ");

    planned.push({
      target_page_id: target.id,
      target_url,
      anchor_text: anchor.slice(0, 200),
      sort_order: item.sort_order,
      is_manual: true,
    });
  }

  return planned;
}

/**
 * Upsert missing enabled Related Chat Rooms targets into page_internal_links,
 * then refresh internal_link_count (+ JSON cache).
 */
export async function syncRelatedChatRoomsToInternalLinks(
  sb: Sb,
  pageId: string,
  config: RelatedChatRoomsConfig | null | undefined,
  opts?: { sourceSlug?: string | null },
): Promise<{ inserted: number; skipped: number; internal_link_count: number }> {
  const parsed = parseRelatedChatRoomsConfig(config);
  if (!parsed?.items.length) {
    const count = await recalculateInternalLinkCount(sb, pageId, { refreshJsonCache: true });
    return { inserted: 0, skipped: 0, internal_link_count: count };
  }

  const enabledIds = [
    ...new Set(
      parsed.items.filter((i) => i.enabled !== false).map((i) => i.target_page_id),
    ),
  ].filter((id) => id !== pageId);

  const { data: existingRows, error: exErr } = await sb
    .from("page_internal_links")
    .select("id,target_page_id,target_url,anchor_text")
    .eq("page_id", pageId);
  if (exErr) throw new Error(exErr.message);

  const targetsById = new Map<string, { id: string; slug: string; title: string }>();
  if (enabledIds.length) {
    const { data: targets, error: tErr } = await sb
      .from("custom_pages")
      .select("id,slug,title")
      .in("id", enabledIds);
    if (tErr) throw new Error(tErr.message);
    for (const t of targets ?? []) targetsById.set(t.id, t);
  }

  const planned = planRelatedChatRoomsInternalLinkSync({
    pageId,
    sourceSlug: opts?.sourceSlug,
    config: parsed,
    targetsById,
    existingLinks: (existingRows ?? []) as ExistingInternalLinkRef[],
  });

  let inserted = 0;
  for (const row of planned) {
    const { error } = await sb.from("page_internal_links").insert({
      page_id: pageId,
      target_page_id: row.target_page_id,
      target_url: row.target_url,
      anchor_text: row.anchor_text,
      sort_order: row.sort_order,
      is_manual: true,
      updated_at: new Date().toISOString(),
    } as never);
    if (error) {
      // Unique (page_id, target_url, anchor_text) — treat as already present.
      if (/duplicate|unique/i.test(error.message || "")) continue;
      throw new Error(error.message);
    }
    inserted += 1;
  }

  const skipped = Math.max(0, enabledIds.length - inserted);
  const internal_link_count = await recalculateInternalLinkCount(sb, pageId, {
    refreshJsonCache: true,
  });
  return { inserted, skipped, internal_link_count };
}
