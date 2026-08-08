/**
 * Public CMS page SSR / crawlability helpers.
 * Ensures crawlers receive H1 + body in the initial HTML (not only after hydration).
 */

export type PublicCmsPageSeoFields = {
  slug: string;
  title: string;
  h1?: string | null;
  content?: string | null;
  intro_content?: string | null;
  publicHtml?: string | null;
  excerpt?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  canonical_url?: string | null;
  noindex?: boolean | null;
  nofollow?: boolean | null;
};

/** Single visible page H1: prefer CMS h1, else title. Never emit both. */
export function resolvePublicCmsH1(page: Pick<PublicCmsPageSeoFields, "h1" | "title">): string {
  return (page.h1?.trim() || page.title || "").trim();
}

/** Body HTML used in the public article (intro+content composition already applied when publicHtml is set). */
export function resolvePublicCmsBodyHtml(
  page: Pick<PublicCmsPageSeoFields, "publicHtml" | "content" | "intro_content">,
): string {
  if (typeof page.publicHtml === "string" && page.publicHtml.trim()) return page.publicHtml;
  return [page.intro_content, page.content].filter((p) => (p || "").trim()).join("\n");
}

/**
 * Build the SEO-critical article markup that must appear in the initial HTML.
 * Mirrors PublicPageView structure (one H1 outside body; body may start at H2).
 */
export function buildPublicCmsArticleInitialHtml(page: PublicCmsPageSeoFields): string {
  const h1 = resolvePublicCmsH1(page);
  const body = resolvePublicCmsBodyHtml(page);
  const excerpt = page.excerpt?.trim()
    ? `<p class="excerpt">${escapeText(page.excerpt.trim())}</p>`
    : "";
  return [
    "<article>",
    `<h1>${escapeText(h1)}</h1>`,
    excerpt,
    `<div class="custom-page-content">${body}</div>`,
    "</article>",
  ].join("");
}

function escapeText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type InitialHtmlSeoAudit = {
  hasTitle: boolean;
  title: string | null;
  hasMetaDescription: boolean;
  metaDescription: string | null;
  hasCanonical: boolean;
  canonical: string | null;
  robots: string | null;
  h1Count: number;
  h1Texts: string[];
  hasArticleBody: boolean;
  bodyTextLength: number;
  hasInternalLinks: boolean;
  internalLinkCount: number;
  /** True when only the route pending shell is present (crawlability failure). */
  isPendingShellOnly: boolean;
  ok: boolean;
  failures: string[];
};

/** Strip script tags so audits reflect crawler-visible markup, not dehydrated JSON. */
export function stripScripts(html: string): string {
  return (html || "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

/**
 * Audit initial HTML the way a non-JS crawler sees it.
 * Pass the raw HTTP response body (not the hydrated DOM).
 */
export function auditInitialCmsHtml(
  html: string,
  opts?: { expectedCanonical?: string; expectIndexable?: boolean },
): InitialHtmlSeoAudit {
  const raw = html || "";
  const visible = stripScripts(raw);
  const failures: string[] = [];

  const title =
    (raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/\s+/g, " ").trim() || null;
  const hasTitle = !!title;
  if (!hasTitle) failures.push("missing <title>");

  const metaDescription =
    (raw.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i) ||
      raw.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) ||
      [])[1] || null;
  const hasMetaDescription = !!metaDescription?.trim();
  if (!hasMetaDescription) failures.push("missing meta description");

  const canonical =
    (raw.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
      raw.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i) ||
      [])[1] || null;
  const hasCanonical = !!canonical;
  if (!hasCanonical) failures.push("missing canonical");
  if (opts?.expectedCanonical && canonical !== opts.expectedCanonical) {
    failures.push(`canonical mismatch: ${canonical}`);
  }

  const robots =
    (raw.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) ||
      raw.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']robots["']/i) ||
      [])[1] || null;
  if (opts?.expectIndexable !== false) {
    if (!robots || !/index/i.test(robots) || /noindex/i.test(robots)) {
      failures.push(`robots not indexable: ${robots}`);
    }
  }

  const h1Matches = [...visible.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1Texts = h1Matches.map((m) => m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
  const h1Count = h1Texts.length;
  if (h1Count !== 1) failures.push(`expected exactly 1 H1 in initial HTML, got ${h1Count}`);

  const bodyText = visible
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const isPendingShellOnly = /Loading page/i.test(bodyText) && bodyText.length < 80;
  if (isPendingShellOnly) failures.push("initial HTML is pending shell only (client-rendered body)");

  const hasArticleBody =
    /custom-page-content/i.test(visible) ||
    (/<article\b/i.test(visible) && bodyText.length > 120);
  const bodyTextLength = bodyText.length;
  if (!hasArticleBody || bodyTextLength < 80) {
    failures.push("missing meaningful body text in initial HTML");
  }

  const internalHrefs = [...visible.matchAll(/href\s*=\s*["']\/([a-z0-9][a-z0-9-]*)\/?["']/gi)];
  const internalLinkCount = internalHrefs.length;
  const hasInternalLinks = internalLinkCount > 0;
  // Internal links are desirable but not always required on every page shape.

  return {
    hasTitle,
    title,
    hasMetaDescription,
    metaDescription,
    hasCanonical,
    canonical,
    robots,
    h1Count,
    h1Texts,
    hasArticleBody,
    bodyTextLength,
    hasInternalLinks,
    internalLinkCount,
    isPendingShellOnly,
    ok: failures.length === 0,
    failures,
  };
}

/** Count H1 tags in a fragment (visible markup). Used to prevent duplicate H1 after compose. */
export function countH1Tags(html: string): number {
  return (html.match(/<h1\b/gi) || []).length;
}
