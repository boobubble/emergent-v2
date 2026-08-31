/**
 * Peer city/country link selection for auto-publish and orphan backfill.
 * Never cross-links India ↔ Pakistan (or any two different country clusters).
 */

export const PEER_GEO_LINK_SOURCE = "peer_geo" as const;

export const CITY_CATEGORIES = new Set([
  "india_city",
  "pakistan_city",
  "us_city",
  "uk_city",
  "canada_city",
  "australia_city",
  "city_subcategory",
]);

const CATEGORY_CLUSTER: Record<string, string> = {
  india_city: "india",
  pakistan_city: "pakistan",
  us_city: "usa",
  uk_city: "uk",
  canada_city: "canada",
  australia_city: "australia",
};

export type GeoPage = {
  id: string;
  slug: string;
  title: string;
  h1?: string | null;
  page_type?: string | null;
  category?: string | null;
  country_id?: string | null;
  city_id?: string | null;
  link_priority?: number | null;
};

export type PeerLinkEdge = {
  from: GeoPage;
  to: GeoPage;
};

export function isCityPage(page: Pick<GeoPage, "page_type" | "category">): boolean {
  const t = (page.page_type || "").toLowerCase();
  if (t === "city" || t === "state") return true;
  return CITY_CATEGORIES.has((page.category || "").toLowerCase());
}

export function isCountryPage(page: Pick<GeoPage, "page_type" | "category">): boolean {
  const t = (page.page_type || "").toLowerCase();
  if (t === "country" || t === "hub") return true;
  return (page.category || "").toLowerCase() === "country";
}

export function isGeoPage(page: Pick<GeoPage, "page_type" | "category">): boolean {
  return isCityPage(page) || isCountryPage(page);
}

function slugCluster(slug: string): string {
  return slug
    .replace(/-chat-room$/i, "")
    .replace(/-chat$/i, "")
    .toLowerCase()
    .trim();
}

/** Stable cluster key: prefer country_id, else category/slug. */
export function geoClusterKey(page: GeoPage): string | null {
  const countryId = page.country_id?.trim();
  if (countryId) return `id:${countryId}`;

  const cat = (page.category || "").toLowerCase();
  if (CATEGORY_CLUSTER[cat]) return `slug:${CATEGORY_CLUSTER[cat]}`;

  if (isCountryPage(page) || isCityPage(page)) {
    const base = slugCluster(page.slug);
    return base ? `slug:${base}` : null;
  }
  return null;
}

export function sameGeoCluster(a: GeoPage, b: GeoPage): boolean {
  const ka = geoClusterKey(a);
  const kb = geoClusterKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  // Country hub slug:{pakistan} should match cities keyed by country_id when
  // the city category maps to the same slug cluster.
  const slugOf = (p: GeoPage) => {
    const cat = (p.category || "").toLowerCase();
    if (CATEGORY_CLUSTER[cat]) return CATEGORY_CLUSTER[cat];
    if (isCountryPage(p)) return slugCluster(p.slug);
    return null;
  };
  const sa = ka.startsWith("id:") ? slugOf(a) : ka.slice("slug:".length);
  const sb = kb.startsWith("id:") ? slugOf(b) : kb.slice("slug:".length);
  if (sa && sb && sa === sb) return true;
  return false;
}

export function peerAnchorLabel(page: GeoPage): string {
  const raw = (page.h1 || page.title || page.slug).replace(/\s+/g, " ").trim();
  const stripped = raw.replace(/\s*[|–—].*$/, "").replace(/\s+chat(\s+room)?$/i, "").trim();
  return stripped || page.slug.replace(/-/g, " ");
}

function byPriorityThenTitle(a: GeoPage, b: GeoPage) {
  const pa = b.link_priority ?? 0;
  const pb = a.link_priority ?? 0;
  if (pa !== pb) return pa - pb;
  return (a.title || a.slug).localeCompare(b.title || b.slug);
}

const FALLBACK_HUB_SLUGS = [
  "international-chat-room",
  "online-chat-room",
  "friendship-chat-room",
  "free-chat-room",
];

/** city_subcategory pages inherit the parent city's country cluster when possible. */
export function withInheritedGeoCluster(source: GeoPage, pool: GeoPage[]): GeoPage {
  if ((source.category || "").toLowerCase() !== "city_subcategory") return source;
  if (source.country_id?.trim()) return source;
  const prefix = source.slug.toLowerCase();
  const parent = pool
    .filter((p) => isCityPage(p) && (p.category || "").toLowerCase() !== "city_subcategory")
    .filter((p) => prefix.startsWith(p.slug.replace(/-chat-room$/i, "").toLowerCase()))
    .sort((a, b) => b.slug.length - a.slug.length)[0];
  if (!parent) return source;
  return {
    ...source,
    country_id: parent.country_id ?? source.country_id,
    category: parent.category ?? source.category,
  };
}

/**
 * Pick 1–3 peer city/country pages for `source`.
 * City → country hub (if any) + other cities in the same cluster.
 * Country → major cities in the same cluster. Never other countries.
 * Isolated geo pages fall back to a few non-geo hub rooms (not other countries).
 */
export function pickPeerPages(source: GeoPage, pool: GeoPage[], opts?: { max?: number }): GeoPage[] {
  const max = Math.min(Math.max(opts?.max ?? 3, 0), 4);
  if (max === 0 || !isGeoPage(source)) return [];

  const resolved = withInheritedGeoCluster(source, pool);
  const selfId = resolved.id;
  const selfSlug = resolved.slug.toLowerCase();
  const candidates = pool.filter((p) => {
    if (p.id && selfId && p.id === selfId) return false;
    if (p.slug.toLowerCase() === selfSlug) return false;
    if (!isGeoPage(p)) return false;
    return sameGeoCluster(resolved, p);
  });

  const picked: GeoPage[] = [];
  const seen = new Set<string>();
  const add = (p: GeoPage | undefined) => {
    if (!p || picked.length >= max) return;
    const key = p.slug.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    picked.push(p);
  };

  if (isCityPage(resolved)) {
    const hubs = candidates.filter(isCountryPage).sort(byPriorityThenTitle);
    add(hubs[0]);
    const cities = candidates.filter(isCityPage).sort(byPriorityThenTitle);
    for (const c of cities) add(c);
  } else if (isCountryPage(resolved)) {
    const cities = candidates.filter(isCityPage).sort(byPriorityThenTitle);
    for (const c of cities) add(c);
  }

  if (picked.length === 0) {
    for (const slug of FALLBACK_HUB_SLUGS) {
      add(pool.find((p) => p.slug.toLowerCase() === slug));
    }
  }

  return picked;
}

function edgeKey(fromSlug: string, toSlug: string) {
  return `${fromSlug.toLowerCase()}→${toSlug.toLowerCase()}`;
}

/** Directed edges source→peers, plus reciprocal peer→source so orphans gain inbound. */
export function planPeerLinkEdges(
  sources: GeoPage[],
  pool: GeoPage[],
  opts?: { maxPeers?: number; reciprocal?: boolean },
): PeerLinkEdge[] {
  const reciprocal = opts?.reciprocal !== false;
  const maxPeers = opts?.maxPeers ?? 3;
  const edges: PeerLinkEdge[] = [];
  const seen = new Set<string>();

  const add = (from: GeoPage, to: GeoPage) => {
    if (!from.id || !to.id) return;
    const key = edgeKey(from.slug, to.slug);
    if (seen.has(key)) return;
    if (from.slug.toLowerCase() === to.slug.toLowerCase()) return;
    seen.add(key);
    edges.push({ from, to });
  };

  for (const source of sources) {
    const peers = pickPeerPages(source, pool, { max: maxPeers });
    for (const peer of peers) {
      add(source, peer);
      if (reciprocal) add(peer, source);
    }
  }
  return edges;
}

export function canonicalPeerHref(slug: string): string {
  const s = (slug || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  return s ? `/${s}` : "";
}
