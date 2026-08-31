/**
 * Conservative HTML sanitizer that never needs DOM / JSDOM.
 * Used when isomorphic-dompurify's browser build is incorrectly resolved during SSR
 * (it throws on import/eval without `window`) so /$slug can still emit real markup.
 */
import { PAGE_CTA_CLASSES } from "./page-cta";

const VOID_OK = new Set(["br", "hr", "img"]);

const ALLOWED = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "ul", "ol", "li", "blockquote",
  "strong", "em", "b", "i", "u", "s", "a",
  "br", "hr", "pre", "code",
  "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "nav", "span",
]);

const ATTR_OK = new Set([
  "href", "target", "rel", "id", "class", "src", "alt", "title",
  "colspan", "rowspan", "width", "height",
  "loading", "decoding",
  "aria-label", "aria-hidden", "role",
  "data-href", "data-label",
]);

const ALLOWED_CLASSES = new Set([
  ...PAGE_CTA_CLASSES,
  "callout",
  "callout-info",
  "callout-success",
  "callout-warning",
  "callout-danger",
  "toc",
  "toc-title",
  "toc-l2",
  "toc-l3",
  "custom-page-content",
  "custom-page-img",
  "custom-page-img-left",
  "custom-page-img-center",
  "custom-page-img-right",
  "cta-button",
  "cta-button-link",
]);

function isSafeUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith("#") || v.startsWith("/") || v.startsWith("./") || v.startsWith("../")) return true;
  if (/^(https?:|mailto:)/i.test(v)) return true;
  return false;
}

function filterClasses(value: string): string {
  return value
    .split(/\s+/)
    .filter((cls) => cls && ALLOWED_CLASSES.has(cls))
    .join(" ");
}

function sanitizeOpenTag(tag: string, rawAttrs: string): string {
  const name = tag.toLowerCase();
  if (!ALLOWED.has(name)) return "";
  const attrs: string[] = [];
  const re = /([a-zA-Z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rawAttrs))) {
    const attr = m[1].toLowerCase();
    if (attr.startsWith("on") || attr === "style") continue;
    if (!ATTR_OK.has(attr) && !attr.startsWith("data-")) continue;
    const value = m[3] ?? m[4] ?? m[5] ?? "";
    if ((attr === "href" || attr === "src" || attr === "data-href") && !isSafeUrl(value)) continue;
    if (attr === "class") {
      const filtered = filterClasses(value);
      if (!filtered) continue;
      attrs.push(`class="${filtered.replace(/"/g, "&quot;")}"`);
      continue;
    }
    if (attr === "href" || attr === "src") {
      attrs.push(`${attr}="${value.replace(/"/g, "&quot;")}"`);
      continue;
    }
    attrs.push(`${attr}="${String(value).replace(/"/g, "&quot;")}"`);
  }
  if (name === "a" && attrs.some((a) => a.startsWith('target="_blank"'))) {
    if (!attrs.some((a) => a.startsWith("rel="))) {
      attrs.push('rel="noopener noreferrer"');
    }
  }
  const attrStr = attrs.length ? ` ${attrs.join(" ")}` : "";
  if (VOID_OK.has(name)) return `<${name}${attrStr}>`;
  return `<${name}${attrStr}>`;
}

/**
 * Strip scripts/styles and drop disallowed tags while keeping text + safe markup.
 * Sync, DOM-free, safe for TanStack Start SSR module evaluation.
 */
export function sanitizeHtmlFallback(html: string): string {
  let out = html ?? "";
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  out = out.replace(/<!--[\s\S]*?-->/g, "");
  out = out.replace(/<\/?([a-zA-Z][\w:-]*)\b([^>]*)>/g, (full, tag: string, attrs: string) => {
    const name = tag.toLowerCase();
    const closing = full.trimStart().startsWith("</");
    if (closing) return ALLOWED.has(name) && !VOID_OK.has(name) ? `</${name}>` : "";
    const selfClosing = /\/>\s*$/.test(full);
    const open = sanitizeOpenTag(name, attrs || "");
    if (!open) return "";
    if (selfClosing && !VOID_OK.has(name)) {
      return `${open}</${name}>`;
    }
    return open;
  });
  return out;
}
