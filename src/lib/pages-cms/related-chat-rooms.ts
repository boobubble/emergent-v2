/**
 * Related Chat Rooms — public selection from page_internal_links (+ safe fill).
 *
 * Canonical relationship source: outgoing `page_internal_links` rows.
 * Optional presentation overlay: custom_pages.related_chat_rooms
 *   1) manual enabled items (admin order + labels)
 *   2) page_internal_links (when auto_fill)
 *   3) same-country / category fallback (when auto_fill)
 *
 * Only published, indexable destinations render. Same-country geo preference;
 * never leak city↔city (or geo) across countries.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { pagePublicPath, slugifyPageSlug } from "@/lib/page-slug";
import { isPubliclyVisibleStatus } from "@/lib/pages-cms/schemas";
import { pickAnchor, cityAnchors, countryAnchors, categoryAnchors } from "@/lib/pages-cms/phase4c-priority";
import {
  parseRelatedChatRoomsConfig,
  type RelatedChatRoomsConfig,
} from "@/lib/pages-cms/related-chat-rooms-config";

export const RELATED_CHAT_ROOMS_MAX = 8;
export const RELATED_CHAT_ROOMS_HEADING = "Explore Related Chat Rooms";

export type RelatedChatRoomKind = "country" | "city" | "category" | "other";

export type RelatedChatRoomLink = {
  slug: string;
  href: string;
  label: string;
  kind: RelatedChatRoomKind;
};

export type RelatedRoomSourcePage = {
  id: string;
  slug: string;
  title?: string | null;
  page_type?: string | null;
  country_id?: string | null;
  related_chat_rooms?: unknown;
};

export type RelatedRoomTargetPage = {
  id: string;
  slug: string;
  title: string;
  h1?: string | null;
  status: string;
  noindex: boolean;
  page_type?: string | null;
  country_id?: string | null;
  link_priority?: number | null;
};

export type RelatedRoomInternalLink = {
  anchor_text: string;
  target_url: string;
  target_page_id?: string | null;
  sort_order?: number | null;
};

const GEO_PAGE_TYPES = new Set([
  "country",
  "state",
  "city",
  "hub",
  "country_category",
  "state_category",
  "city_category",
]);

export function slugFromTargetUrl(targetUrl: string): string {
  const raw = (targetUrl || "").trim();
  if (!raw) return "";
  // Flat canonical URLs only — reject /p/... and multi-segment paths.
  if (/^\/p\//i.test(raw)) return "";
  try {
    if (/^https?:\/\//i.test(raw)) {
      const path = new URL(raw).pathname;
      return slugifyPageSlug(path);
    }
  } catch {
    /* fall through */
  }
  const cleaned = raw.replace(/^\/+|\/+$/g, "");
  if (!cleaned || cleaned.includes("/")) return "";
  return slugifyPageSlug(cleaned);
}

export function classifyRelatedRoomKind(pageType: string | null | undefined): RelatedChatRoomKind {
  const t = (pageType || "").toLowerCase();
  if (t === "country" || t === "hub") return "country";
  if (t === "city" || t === "state") return "city";
  if (t === "category" || t.endsWith("_category")) return "category";
  return "other";
}

export function kindRank(kind: RelatedChatRoomKind): number {
  switch (kind) {
    case "country":
      return 0;
    case "city":
      return 1;
    case "category":
      return 2;
    default:
      return 3;
  }
}

/** Block geo pages that would cross-link India ↔ Pakistan (and similar). */
export function isCrossCountryGeoLeak(
  source: Pick<RelatedRoomSourcePage, "page_type" | "country_id">,
  target: Pick<RelatedRoomTargetPage, "page_type" | "country_id">,
): boolean {
  const sourceCountry = source.country_id?.trim() || null;
  if (!sourceCountry) return false;
  const sourceType = (source.page_type || "").toLowerCase();
  if (!GEO_PAGE_TYPES.has(sourceType) && sourceType !== "") return false;
  if (sourceType === "category") return false;

  const targetCountry = target.country_id?.trim() || null;
  if (!targetCountry || targetCountry === sourceCountry) return false;

  const targetType = (target.page_type || "").toLowerCase();
  if (targetType === "category") return false;
  return GEO_PAGE_TYPES.has(targetType);
}

export function isPublicRelatedTarget(
  target: Pick<RelatedRoomTargetPage, "status" | "noindex" | "slug">,
): boolean {
  if (!target.slug?.trim()) return false;
  if (!isPubliclyVisibleStatus(target.status)) return false;
  if (target.noindex) return false;
  return true;
}

export function cleanRelatedLabel(raw: string): string {
  return (raw || "").replace(/\s+/g, " ").trim();
}

export function labelForRelatedTarget(
  target: Pick<RelatedRoomTargetPage, "slug" | "title" | "h1" | "page_type">,
  anchorText?: string | null,
  salt = "",
): string {
  const fromAnchor = cleanRelatedLabel(anchorText || "");
  if (fromAnchor) return fromAnchor;

  const kind = classifyRelatedRoomKind(target.page_type);
  const base =
    cleanRelatedLabel(target.h1 || "") ||
    cleanRelatedLabel(target.title || "") ||
    cleanRelatedLabel(target.slug.replace(/-/g, " "));

  if (kind === "city") {
    const city = base.replace(/\s+chat(\s+room)?$/i, "").trim() || base;
    return pickAnchor(cityAnchors(city), salt || target.slug);
  }
  if (kind === "country") {
    const country = base.replace(/\s+chat(\s+room)?$/i, "").trim() || base;
    return pickAnchor(countryAnchors(country), salt || target.slug);
  }
  if (kind === "category") {
    return pickAnchor(categoryAnchors(base), salt || target.slug);
  }
  return base;
}

type RankedCandidate = RelatedChatRoomLink & {
  sortOrder: number;
  linkPriority: number;
  fromManual: boolean;
};

function toLink(
  target: RelatedRoomTargetPage,
  label: string,
  sortOrder: number,
  fromManual: boolean,
): RankedCandidate {
  const kind = classifyRelatedRoomKind(target.page_type);
  const slug = slugifyPageSlug(target.slug) || target.slug;
  return {
    slug,
    href: pagePublicPath(slug),
    label: cleanRelatedLabel(label) || target.title,
    kind,
    sortOrder,
    linkPriority: target.link_priority ?? 0,
    fromManual,
  };
}

/**
 * Pure selector: build up to `max` related room links.
 * Manual config items first (admin order), then internal links, then fill.
 */
export function selectRelatedChatRooms(input: {
  source: RelatedRoomSourcePage;
  links: RelatedRoomInternalLink[];
  targetsById: Map<string, RelatedRoomTargetPage>;
  targetsBySlug: Map<string, RelatedRoomTargetPage>;
  fillCandidates?: RelatedRoomTargetPage[];
  config?: RelatedChatRoomsConfig | null;
  max?: number;
}): RelatedChatRoomLink[] {
  const max = Math.min(Math.max(input.max ?? RELATED_CHAT_ROOMS_MAX, 0), RELATED_CHAT_ROOMS_MAX);
  if (max === 0) return [];

  const config = input.config ?? parseRelatedChatRoomsConfig(input.source.related_chat_rooms);
  const autoFill = config == null ? true : config.auto_fill !== false;

  const selfSlug = (slugifyPageSlug(input.source.slug) || input.source.slug).toLowerCase();
  const selfId = input.source.id;
  const seen = new Set<string>();
  const picked: RankedCandidate[] = [];

  const tryAdd = (
    target: RelatedRoomTargetPage | undefined,
    label: string,
    sortOrder: number,
    fromManual: boolean,
  ) => {
    if (!target || picked.length >= max) return;
    if (!isPublicRelatedTarget(target)) return;
    if (target.id === selfId) return;
    const slug = (slugifyPageSlug(target.slug) || target.slug).toLowerCase();
    if (!slug || slug === selfSlug) return;
    if (seen.has(slug)) return;
    if (isCrossCountryGeoLeak(input.source, target)) return;
    const href = pagePublicPath(slug);
    if (!href.startsWith("/") || href.startsWith("/p/")) return;

    seen.add(slug);
    picked.push(toLink(target, label, sortOrder, fromManual));
  };

  const manualItems = config?.items ?? [];
  let usedManual = false;
  if (manualItems.length) {
    const ordered = [...manualItems]
      .filter((item) => item.enabled !== false)
      .sort((a, b) => a.sort_order - b.sort_order);
    for (const item of ordered) {
      const target = input.targetsById.get(item.target_page_id);
      if (!target) continue;
      usedManual = true;
      const manualLabel =
        cleanRelatedLabel(item.label || "") ||
        cleanRelatedLabel(target.title || "") ||
        cleanRelatedLabel(target.h1 || "");
      tryAdd(
        target,
        manualLabel ||
          labelForRelatedTarget(
            target,
            null,
            `${input.source.slug}:manual:${target.slug}`,
          ),
        item.sort_order,
        true,
      );
    }
  }

  if (!autoFill) {
    return picked.slice(0, max).map(({ slug, href, label, kind }) => ({
      slug,
      href,
      label,
      kind,
    }));
  }

  const sortedLinks = [...input.links].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
  );

  for (const link of sortedLinks) {
    const byId = link.target_page_id
      ? input.targetsById.get(link.target_page_id)
      : undefined;
    const slug = slugFromTargetUrl(link.target_url);
    const bySlug = slug ? input.targetsBySlug.get(slug.toLowerCase()) : undefined;
    const target = byId || bySlug;
    if (!target) continue;
    tryAdd(
      target,
      labelForRelatedTarget(target, link.anchor_text, `${input.source.slug}:${target.slug}`),
      100 + (link.sort_order ?? 0),
      false,
    );
  }

  if (picked.length < max && input.fillCandidates?.length) {
    const fill = [...input.fillCandidates].sort((a, b) => {
      const ka = kindRank(classifyRelatedRoomKind(a.page_type));
      const kb = kindRank(classifyRelatedRoomKind(b.page_type));
      if (ka !== kb) return ka - kb;
      const pa = b.link_priority ?? 0;
      const pb = a.link_priority ?? 0;
      if (pa !== pb) return pa - pb;
      return (a.title || "").localeCompare(b.title || "");
    });
    for (const target of fill) {
      tryAdd(
        target,
        labelForRelatedTarget(target, null, `${input.source.slug}:fill:${target.slug}`),
        1000 + (target.link_priority ?? 0),
        false,
      );
      if (picked.length >= max) break;
    }
  }

  if (!usedManual) {
    picked.sort((a, b) => {
      const kr = kindRank(a.kind) - kindRank(b.kind);
      if (kr !== 0) return kr;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.label.localeCompare(b.label);
    });
  }

  return picked.slice(0, max).map(({ slug, href, label, kind }) => ({
    slug,
    href,
    label,
    kind,
  }));
}

type Sb = SupabaseClient<Database>;

const TARGET_SELECT =
  "id,slug,title,h1,status,noindex,page_type,country_id,link_priority";

/** Load related chat rooms for a published Custom Page (SSR-safe). */
export async function loadRelatedChatRoomsForPage(
  sb: Sb,
  page: { id: string; slug: string },
  opts?: { max?: number },
): Promise<RelatedChatRoomLink[]> {
  const max = opts?.max ?? RELATED_CHAT_ROOMS_MAX;

  const { data: sourceRow, error: sourceErr } = await sb
    .from("custom_pages")
    .select("id,slug,title,page_type,country_id,related_chat_rooms")
    .eq("id", page.id)
    .maybeSingle();
  if (sourceErr) throw new Error(sourceErr.message);
  if (!sourceRow) return [];

  const config = parseRelatedChatRoomsConfig(sourceRow.related_chat_rooms);

  const source: RelatedRoomSourcePage = {
    id: sourceRow.id,
    slug: sourceRow.slug,
    title: sourceRow.title,
    page_type: sourceRow.page_type,
    country_id: sourceRow.country_id,
    related_chat_rooms: sourceRow.related_chat_rooms,
  };

  const { data: linkRows, error: linkErr } = await sb
    .from("page_internal_links")
    .select("anchor_text,target_url,target_page_id,sort_order")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true })
    .limit(40);
  if (linkErr) throw new Error(linkErr.message);

  const links = (linkRows ?? []) as RelatedRoomInternalLink[];
  const targetIds = [
    ...new Set([
      ...(links.map((l) => l.target_page_id).filter(Boolean) as string[]),
      ...(config?.items.map((i) => i.target_page_id) ?? []),
    ]),
  ];
  const targetSlugs = [
    ...new Set(
      links
        .map((l) => slugFromTargetUrl(l.target_url))
        .filter(Boolean)
        .map((s) => s.toLowerCase()),
    ),
  ];

  const targetsById = new Map<string, RelatedRoomTargetPage>();
  const targetsBySlug = new Map<string, RelatedRoomTargetPage>();

  const ingest = (rows: RelatedRoomTargetPage[] | null | undefined) => {
    for (const row of rows ?? []) {
      targetsById.set(row.id, row);
      targetsBySlug.set(row.slug.toLowerCase(), row);
    }
  };

  if (targetIds.length) {
    const { data, error } = await sb.from("custom_pages").select(TARGET_SELECT).in("id", targetIds);
    if (error) throw new Error(error.message);
    ingest(data as RelatedRoomTargetPage[]);
  }
  if (targetSlugs.length) {
    const missing = targetSlugs.filter((s) => !targetsBySlug.has(s));
    if (missing.length) {
      const { data, error } = await sb.from("custom_pages").select(TARGET_SELECT).in("slug", missing);
      if (error) throw new Error(error.message);
      ingest(data as RelatedRoomTargetPage[]);
    }
  }

  const autoFill = config == null ? true : config.auto_fill !== false;
  let fillCandidates: RelatedRoomTargetPage[] = [];

  if (autoFill) {
    const { data: fillRows, error: fillErr } = await sb
      .from("custom_pages")
      .select(TARGET_SELECT)
      .eq("status", "published")
      .eq("noindex", false)
      .neq("id", page.id)
      .in("page_type", ["country", "hub", "city", "state", "category"])
      .order("link_priority", { ascending: false })
      .limit(80);
    if (fillErr) throw new Error(fillErr.message);

    fillCandidates = ((fillRows ?? []) as RelatedRoomTargetPage[]).filter((row) => {
      const kind = classifyRelatedRoomKind(row.page_type);
      if (kind === "category") return true;
      if (!source.country_id) return kind === "country" || kind === "city";
      return row.country_id === source.country_id;
    });
  }

  return selectRelatedChatRooms({
    source,
    links,
    targetsById,
    targetsBySlug,
    fillCandidates,
    config,
    max,
  });
}
