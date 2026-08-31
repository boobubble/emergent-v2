/**
 * Pure incoming/outgoing link accounting for the Internal Linking Hub.
 * URL comparison is canonical: domain stripped, /p/{slug} ≡ /{slug}, quotes
 * ignored, trailing slashes stripped.
 */

const SITE_HOSTS = /^(www\.)?yaarzo\.com$/i;
const HREF_RE = /href\s*=\s*(["'])([^"']*?)\1/gi;

export type OrphanTarget = {
  url: string;
  title: string;
  type: string;
};

export type OrphanSourceDoc = {
  /** Canonical path for this document, e.g. /lahore-chat-room or /blog/my-post */
  canonicalUrl: string;
  html: string;
};

export type OrphanGraphLink = {
  sourceUrl: string;
  targetUrl: string;
};

export type OrphanReportRow = {
  url: string;
  title: string;
  type: string;
  incoming: number;
  outgoing: number;
};

export type OrphanReport = {
  orphans: OrphanReportRow[];
  lowLinks: OrphanReportRow[];
  wellLinked: OrphanReportRow[];
  total: number;
};

/** Canonical public path for a custom page slug (`/{slug}`, never `/p/{slug}`). */
export function canonicalPagePath(slug: string): string {
  const s = (slug || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  return s ? `/${s}` : "";
}

/**
 * Normalize an href or target URL for comparison.
 * Returns null for empty, hash-only, or off-site absolute URLs.
 */
export function normalizeInternalHref(raw: string): string | null {
  let s = (raw || "").trim();
  if (!s) return null;

  s = s.split("#")[0].split("?")[0].trim();
  if (!s) return null;

  let path = s;
  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (!SITE_HOSTS.test(u.hostname)) return null;
      path = u.pathname || "/";
    } catch {
      return null;
    }
  } else if (!s.startsWith("/")) {
    return null;
  }

  path = path.replace(/\/{2,}/g, "/");
  if (path.length > 1) path = path.replace(/\/+$/, "");
  if (!path.startsWith("/")) path = `/${path}`;

  const legacy = path.match(/^\/p\/([^/]+)$/i);
  if (legacy) path = `/${legacy[1]}`;

  return path.toLowerCase();
}

/** All internal hrefs found in HTML (single- or double-quoted). */
export function extractInternalHrefs(html: string): string[] {
  if (!html) return [];
  const found: string[] = [];
  const re = new RegExp(HREF_RE.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const norm = normalizeInternalHref(m[2] ?? "");
    if (norm) found.push(norm);
  }
  return found;
}

export function buildOrphanReport(input: {
  targets: OrphanTarget[];
  documents: OrphanSourceDoc[];
  graphLinks?: OrphanGraphLink[];
}): OrphanReport {
  const incoming: Record<string, number> = {};
  const outgoing: Record<string, number> = {};

  const bump = (map: Record<string, number>, key: string, n = 1) => {
    map[key] = (map[key] ?? 0) + n;
  };

  for (const doc of input.documents) {
    const source = normalizeInternalHref(doc.canonicalUrl);
    if (!source) continue;
    const hrefs = extractInternalHrefs(doc.html);
    let out = 0;
    for (const href of hrefs) {
      if (href === source) continue;
      bump(incoming, href);
      out += 1;
    }
    bump(outgoing, source, out);
  }

  for (const link of input.graphLinks ?? []) {
    const src = normalizeInternalHref(link.sourceUrl);
    const dest = normalizeInternalHref(link.targetUrl);
    if (!src || !dest || src === dest) continue;
    bump(incoming, dest);
    bump(outgoing, src);
  }

  const report: OrphanReportRow[] = (input.targets ?? []).map((t) => {
    const url = normalizeInternalHref(t.url) ?? t.url;
    return {
      url: t.url,
      title: t.title,
      type: t.type,
      incoming: incoming[url] ?? 0,
      outgoing: outgoing[url] ?? 0,
    };
  });

  return {
    orphans: report.filter((r) => r.incoming === 0).sort((a, b) => a.outgoing - b.outgoing),
    lowLinks: report.filter((r) => r.incoming > 0 && r.incoming < 3),
    wellLinked: report.filter((r) => r.incoming >= 3),
    total: report.length,
  };
}
