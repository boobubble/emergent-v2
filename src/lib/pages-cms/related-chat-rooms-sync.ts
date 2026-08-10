/**
 * Sync manual Related Chat Rooms selections into page_internal_links.
 *
 * custom_pages.related_chat_rooms = presentation/config only.
 * page_internal_links = canonical relationship graph.
 *
 * Ownership: rows with source = 'related_chat_rooms' are sync-owned.
 * Reconcile desired enabled targets vs existing sync-owned rows:
 *   - insert missing desired (when no graph row already covers the target)
 *   - keep matching sync-owned
 *   - remove stale sync-owned
 *   - never touch unrelated graph rows (even if same target)
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

/** Marker written on page_internal_links.source for Related Chat Rooms sync. */
export const RELATED_CHAT_ROOMS_LINK_SOURCE = "related_chat_rooms" as const;

export type ExistingInternalLinkRef = {
  id: string;
  target_page_id?: string | null;
  target_url: string;
  anchor_text: string;
  source?: string | null;
  is_manual?: boolean | null;
};

export type PlannedInternalLinkInsert = {
  target_page_id: string;
  target_url: string;
  anchor_text: string;
  sort_order: number;
  is_manual: true;
  source: typeof RELATED_CHAT_ROOMS_LINK_SOURCE;
};

export type RelatedChatRoomsSyncPlan = {
  toInsert: PlannedInternalLinkInsert[];
  toRemoveIds: string[];
  keepOwnedIds: string[];
};

function normalizeTargetUrl(slugOrUrl: string): string {
  const slug = slugifyPageSlug(slugOrUrl) || slugOrUrl.replace(/^\/+|\/+$/g, "").toLowerCase();
  return pagePublicPath(slug);
}

export function isRelatedChatRoomsOwnedLink(
  row: Pick<ExistingInternalLinkRef, "source">,
): boolean {
  return row.source === RELATED_CHAT_ROOMS_LINK_SOURCE;
}

/** True when an existing graph row already represents this target (by id or flat URL). */
export function internalLinkCoversTarget(
  existing: Array<Pick<ExistingInternalLinkRef, "target_page_id" | "target_url">>,
  target: { target_page_id: string; target_url: string },
): boolean {
  const url = normalizeTargetUrl(target.target_url);
  return existing.some((row) => {
    if (row.target_page_id && row.target_page_id === target.target_page_id) return true;
    return normalizeTargetUrl(row.target_url) === url;
  });
}

function linkMatchesDesired(
  row: Pick<ExistingInternalLinkRef, "target_page_id" | "target_url">,
  desired: Array<{ target_page_id: string; target_url: string }>,
): boolean {
  return desired.some(
    (d) =>
      (row.target_page_id != null && row.target_page_id === d.target_page_id) ||
      normalizeTargetUrl(row.target_url) === normalizeTargetUrl(d.target_url),
  );
}

type DesiredTarget = {
  target_page_id: string;
  target_url: string;
  anchor_text: string;
  sort_order: number;
};

function buildDesiredTargets(input: {
  pageId: string;
  sourceSlug?: string | null;
  config: RelatedChatRoomsConfig | null | undefined;
  targetsById: Map<string, { id: string; slug: string; title: string }>;
}): DesiredTarget[] {
  const config = parseRelatedChatRoomsConfig(input.config);
  if (!config?.items.length) return [];

  const selfSlug = (slugifyPageSlug(input.sourceSlug || "") || "").toLowerCase();
  const desired: DesiredTarget[] = [];
  const seen = new Set<string>();

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
    if (seen.has(target.id) || seen.has(target_url)) continue;
    seen.add(target.id);
    seen.add(target_url);

    const anchor =
      (item.label || "").trim() ||
      (target.title || "").trim() ||
      slug.replace(/-/g, " ");

    desired.push({
      target_page_id: target.id,
      target_url,
      anchor_text: anchor.slice(0, 200),
      sort_order: item.sort_order,
    });
  }

  return desired;
}

/**
 * Pure reconcile plan for Related Chat Rooms ↔ page_internal_links.
 */
export function planRelatedChatRoomsInternalLinkSync(input: {
  pageId: string;
  sourceSlug?: string | null;
  config: RelatedChatRoomsConfig | null | undefined;
  targetsById: Map<string, { id: string; slug: string; title: string }>;
  existingLinks: ExistingInternalLinkRef[];
}): RelatedChatRoomsSyncPlan {
  const desired = buildDesiredTargets(input);
  const owned = input.existingLinks.filter(isRelatedChatRoomsOwnedLink);
  const unrelated = input.existingLinks.filter((row) => !isRelatedChatRoomsOwnedLink(row));

  const keepOwnedIds: string[] = [];
  const toRemoveIds: string[] = [];

  for (const row of owned) {
    if (linkMatchesDesired(row, desired)) keepOwnedIds.push(row.id);
    else toRemoveIds.push(row.id);
  }

  // After removals, coverage for inserts = unrelated + kept owned.
  const coverageBase = [
    ...unrelated,
    ...owned.filter((row) => keepOwnedIds.includes(row.id)),
  ];

  const toInsert: PlannedInternalLinkInsert[] = [];
  for (const d of desired) {
    if (internalLinkCoversTarget(coverageBase, d)) continue;
    if (internalLinkCoversTarget(toInsert, d)) continue;
    toInsert.push({
      target_page_id: d.target_page_id,
      target_url: d.target_url,
      anchor_text: d.anchor_text,
      sort_order: d.sort_order,
      is_manual: true,
      source: RELATED_CHAT_ROOMS_LINK_SOURCE,
    });
  }

  return { toInsert, toRemoveIds, keepOwnedIds };
}

/**
 * Reconcile sync-owned page_internal_links for a page, then refresh count/cache.
 */
export async function syncRelatedChatRoomsToInternalLinks(
  sb: Sb,
  pageId: string,
  config: RelatedChatRoomsConfig | null | undefined,
  opts?: { sourceSlug?: string | null },
): Promise<{
  inserted: number;
  removed: number;
  kept: number;
  internal_link_count: number;
}> {
  const parsed = parseRelatedChatRoomsConfig(config);

  const { data: existingRows, error: exErr } = await sb
    .from("page_internal_links")
    .select("id,target_page_id,target_url,anchor_text,source,is_manual")
    .eq("page_id", pageId);
  if (exErr) throw new Error(exErr.message);

  const enabledIds = [
    ...new Set(
      (parsed?.items ?? [])
        .filter((i) => i.enabled !== false)
        .map((i) => i.target_page_id)
        .filter((id) => id !== pageId),
    ),
  ];

  const targetsById = new Map<string, { id: string; slug: string; title: string }>();
  if (enabledIds.length) {
    const { data: targets, error: tErr } = await sb
      .from("custom_pages")
      .select("id,slug,title")
      .in("id", enabledIds);
    if (tErr) throw new Error(tErr.message);
    for (const t of targets ?? []) targetsById.set(t.id, t);
  }

  const plan = planRelatedChatRoomsInternalLinkSync({
    pageId,
    sourceSlug: opts?.sourceSlug,
    config: parsed,
    targetsById,
    existingLinks: (existingRows ?? []) as ExistingInternalLinkRef[],
  });

  let removed = 0;
  if (plan.toRemoveIds.length) {
    const { error: delErr } = await sb
      .from("page_internal_links")
      .delete()
      .eq("page_id", pageId)
      .eq("source", RELATED_CHAT_ROOMS_LINK_SOURCE)
      .in("id", plan.toRemoveIds);
    if (delErr) throw new Error(delErr.message);
    removed = plan.toRemoveIds.length;
  }

  let inserted = 0;
  for (const row of plan.toInsert) {
    const { error } = await sb.from("page_internal_links").insert({
      page_id: pageId,
      target_page_id: row.target_page_id,
      target_url: row.target_url,
      anchor_text: row.anchor_text,
      sort_order: row.sort_order,
      is_manual: true,
      source: RELATED_CHAT_ROOMS_LINK_SOURCE,
      updated_at: new Date().toISOString(),
    } as never);
    if (error) {
      if (/duplicate|unique/i.test(error.message || "")) continue;
      throw new Error(error.message);
    }
    inserted += 1;
  }

  const internal_link_count = await recalculateInternalLinkCount(sb, pageId, {
    refreshJsonCache: true,
  });

  return {
    inserted,
    removed,
    kept: plan.keepOwnedIds.length,
    internal_link_count,
  };
}
