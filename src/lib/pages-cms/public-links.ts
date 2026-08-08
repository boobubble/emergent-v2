/**
 * Public CMS HTML helpers — never expose links to unpublished custom_pages.
 */

const RELATIVE_PAGE_HREF =
  /href\s*=\s*(["'])\/([a-z0-9][a-z0-9-]*)\/?\1/gi;

/** Collect single-segment relative href targets from HTML (`/foo-bar`). */
export function extractRelativeCmsHrefSlugs(html: string): string[] {
  const found = new Set<string>();
  const re = new RegExp(RELATIVE_PAGE_HREF.source, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(html || ""))) {
    if (m[2]) found.add(m[2].toLowerCase());
  }
  return [...found];
}

/**
 * Unwrap <a href="/slug">…</a> when slug is an unpublished custom page.
 * Leaves app routes and published CMS slugs untouched.
 * `unpublishedSlugs` = custom_pages.slug where status !== 'published'.
 */
export function filterUnpublishedCmsLinks(
  html: string,
  unpublishedSlugs: Iterable<string>,
): string {
  if (!html) return "";
  const blocked = new Set(
    [...unpublishedSlugs].map((s) => s.trim().toLowerCase()).filter(Boolean),
  );
  if (!blocked.size) return html;

  // Replace anchors whose href path is a blocked slug; keep inner text.
  return html.replace(
    /<a\b([^>]*?)href\s*=\s*(["'])\/([a-z0-9][a-z0-9-]*)\/?\2([^>]*)>([\s\S]*?)<\/a>/gi,
    (full, pre, _q, slug, post, inner) => {
      if (!blocked.has(String(slug).toLowerCase())) return full;
      // Drop the anchor; keep visible text (already sanitized upstream/downstream).
      return inner;
    },
  );
}

/** Compose public body from optional intro + main content (display-only; no DB rewrite). */
export function composePublicCmsHtml(parts: {
  intro?: string | null;
  content?: string | null;
}): string {
  return [parts.intro, parts.content].filter((p) => (p || "").trim()).join("\n");
}
