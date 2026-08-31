/**
 * One-off (and re-runnable) backfill: persist peer city/country links into
 * page_internal_links so Related Chat Rooms + the orphan detector both see them.
 *
 * Default: only true-orphan geo pages. Reciprocal edges give those pages inbound.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canonicalPagePath,
  buildOrphanReport,
  normalizeInternalHref,
  type OrphanSourceDoc,
} from "@/lib/internal-linking-orphans";
import { recalculateInternalLinkCount } from "@/lib/pages-cms/internal-links";
import {
  PEER_GEO_LINK_SOURCE,
  canonicalPeerHref,
  isGeoPage,
  peerAnchorLabel,
  planPeerLinkEdges,
  type GeoPage,
  type PeerLinkEdge,
} from "./peer-geo-links";

type Sb = SupabaseClient<any>;

export type PeerBackfillOptions = {
  dryRun?: boolean;
  /** If true (default), only pages with zero incoming after Part-1 rules. */
  onlyOrphans?: boolean;
};

export type PlannedPeerInsert = {
  page_id: string;
  source_slug: string;
  target_page_id: string;
  target_url: string;
  anchor_text: string;
  source: typeof PEER_GEO_LINK_SOURCE;
};

export type PeerBackfillPlan = {
  orphanGeoSlugs: string[];
  skippedNoPeers: string[];
  inserts: PlannedPeerInsert[];
  pagesTouched: string[];
};

function toGeo(row: {
  id: string;
  slug: string;
  title: string | null;
  h1?: string | null;
  page_type?: string | null;
  category?: string | null;
  country_id?: string | null;
  city_id?: string | null;
  link_priority?: number | null;
}): GeoPage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title || row.slug,
    h1: row.h1 ?? null,
    page_type: row.page_type ?? null,
    category: row.category ?? null,
    country_id: row.country_id ?? null,
    city_id: row.city_id ?? null,
    link_priority: row.link_priority ?? 0,
  };
}

export function planPeerBackfillInserts(input: {
  pages: Array<GeoPage & { content?: string | null; status?: string }>;
  blogDocs: OrphanSourceDoc[];
  graphLinks: { sourceUrl: string; targetUrl: string }[];
  existingKeys: Set<string>;
  onlyOrphans: boolean;
}): PeerBackfillPlan {
  const published = input.pages.filter((p) => (p.status ?? "published") === "published");
  const documents: OrphanSourceDoc[] = [
    ...published.map((p) => ({
      canonicalUrl: canonicalPagePath(p.slug),
      html: (p.content as string) ?? "",
    })),
    ...input.blogDocs,
  ];
  const targets = published.map((p) => ({
    url: canonicalPagePath(p.slug),
    title: p.title,
    type: "seo_page",
  }));
  const report = buildOrphanReport({
    targets,
    documents,
    graphLinks: input.graphLinks,
  });
  const orphanUrls = new Set(report.orphans.map((o) => o.url));

  const geoPool = published.filter(isGeoPage);
  const sources = geoPool.filter((p) => {
    if (!input.onlyOrphans) return true;
    return orphanUrls.has(canonicalPagePath(p.slug));
  });

  const skippedNoPeers: string[] = [];
  const withPeers: GeoPage[] = [];
  for (const s of sources) {
    const edges = planPeerLinkEdges([s], published, { maxPeers: 3, reciprocal: false });
    if (edges.length === 0) skippedNoPeers.push(s.slug);
    else withPeers.push(s);
  }

  const edges: PeerLinkEdge[] = planPeerLinkEdges(withPeers, published, {
    maxPeers: 3,
    reciprocal: true,
  });

  const inserts: PlannedPeerInsert[] = [];
  const seen = new Set<string>();
  for (const edge of edges) {
    const target_url = canonicalPeerHref(edge.to.slug);
    const destKey = normalizeInternalHref(target_url) ?? target_url;
    const dedupe = `${edge.from.id}|${destKey}`;
    if (input.existingKeys.has(dedupe) || seen.has(dedupe)) continue;
    seen.add(dedupe);
    inserts.push({
      page_id: edge.from.id,
      source_slug: edge.from.slug,
      target_page_id: edge.to.id,
      target_url,
      anchor_text: peerAnchorLabel(edge.to),
      source: PEER_GEO_LINK_SOURCE,
    });
  }

  return {
    orphanGeoSlugs: sources.map((s) => s.slug).sort(),
    skippedNoPeers: skippedNoPeers.sort(),
    inserts,
    pagesTouched: [...new Set(inserts.map((i) => i.source_slug))].sort(),
  };
}

export async function runPeerGeoBackfill(
  sb: Sb,
  opts: PeerBackfillOptions = {},
): Promise<PeerBackfillPlan & { dryRun: boolean; inserted: number }> {
  const dryRun = opts.dryRun !== false;
  const onlyOrphans = opts.onlyOrphans !== false;

  const { data: pageRows, error: pageErr } = await sb
    .from("custom_pages")
    .select("id, slug, title, h1, content, status, page_type, category, country_id, city_id, link_priority")
    .eq("status", "published");
  if (pageErr) throw new Error(pageErr.message);

  const { data: blogRows, error: blogErr } = await sb
    .from("blog_posts")
    .select("slug, content")
    .eq("status", "published");
  if (blogErr) throw new Error(blogErr.message);

  const pages = (pageRows ?? []).map((p) => ({ ...toGeo(p), content: p.content, status: p.status }));
  const idToSlug = new Map(pages.map((p) => [p.id, p.slug]));

  const { data: graphRows, error: graphErr } = await sb
    .from("page_internal_links")
    .select("page_id, target_url, target_page_id");
  if (graphErr) throw new Error(graphErr.message);

  const graphLinks = (graphRows ?? [])
    .map((row) => {
      const srcSlug = idToSlug.get(row.page_id);
      if (!srcSlug) return null;
      return { sourceUrl: canonicalPagePath(srcSlug), targetUrl: row.target_url as string };
    })
    .filter(Boolean) as { sourceUrl: string; targetUrl: string }[];

  const existingKeys = new Set(
    (graphRows ?? []).map((row) => {
      const dest = normalizeInternalHref(String(row.target_url)) ?? String(row.target_url);
      return `${row.page_id}|${dest}`;
    }),
  );

  const plan = planPeerBackfillInserts({
    pages,
    blogDocs: (blogRows ?? []).map((b) => ({
      canonicalUrl: `/blog/${b.slug}`,
      html: (b.content as string) ?? "",
    })),
    graphLinks,
    existingKeys,
    onlyOrphans,
  });

  if (dryRun) {
    return { ...plan, dryRun: true, inserted: 0 };
  }

  let inserted = 0;
  const touchedIds = new Set<string>();
  for (const row of plan.inserts) {
    const { error } = await sb.from("page_internal_links").insert({
      page_id: row.page_id,
      target_page_id: row.target_page_id,
      target_url: row.target_url,
      anchor_text: row.anchor_text,
      sort_order: 200,
      is_manual: true,
      source: PEER_GEO_LINK_SOURCE,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      if (/duplicate|unique/i.test(error.message || "")) continue;
      throw new Error(error.message);
    }
    inserted += 1;
    touchedIds.add(row.page_id);
  }

  for (const pageId of touchedIds) {
    await recalculateInternalLinkCount(sb, pageId, { refreshJsonCache: true });
  }

  return { ...plan, dryRun: false, inserted };
}
