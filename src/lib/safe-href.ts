/**
 * Shared href allow-list for CMS/blog sanitizers and the editor link tool.
 * Relative site paths and https/mailto stay; javascript/data never do.
 */

const DANGEROUS = /^(javascript|data|vbscript):/i;
const BARE_INTERNAL = /^[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)*$/i;

/** True when the href is safe to persist on an <a> tag. */
export function isSafeHref(value: string): boolean {
  return normalizeSafeHref(value) !== null;
}

/**
 * Canonicalize a user- or editor-provided href.
 * Returns null for empty/dangerous values (caller should drop the href).
 */
export function normalizeSafeHref(raw: string | null | undefined): string | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (DANGEROUS.test(v)) return null;
  if (v.startsWith("#") || v.startsWith("/") || v.startsWith("./") || v.startsWith("../")) return v;
  if (/^(https?:|mailto:)/i.test(v)) return v;
  // Prompt users often omit the leading slash ("bahrain-chat-room").
  if (BARE_INTERNAL.test(v)) return `/${v}`;
  return null;
}

/** Rewrite href values on <a> tags before sanitizing so relative slugs are not dropped. */
export function rewriteAnchorHrefs(html: string): string {
  if (!html) return html;
  return html.replace(
    /(<a\b[^>]*?\bhref\s*=\s*)(["'])([^"']*)\2/gi,
    (full, pre: string, quote: string, href: string) => {
      const next = normalizeSafeHref(href);
      if (next == null) return full;
      return `${pre}${quote}${next}${quote}`;
    },
  );
}
