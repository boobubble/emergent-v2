/**
 * Paste/save normalization for CMS page content (TipTap HTML).
 * Preserves semantic headings while stripping unsafe markup from Word, Docs, and HTML sources.
 */
import DOMPurify from "isomorphic-dompurify";
import { PAGE_CTA_CLASSES } from "./page-cta";

const ALLOWED_TAGS = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "ul", "ol", "li", "blockquote",
  "strong", "em", "b", "i", "u", "s", "a",
  "br", "hr", "pre", "code",
  "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "nav", "span",
];

const ALLOWED_ATTR = [
  "href", "target", "rel", "id", "class", "src", "alt", "title",
  "colspan", "rowspan", "width", "height",
  "type", "checked", "disabled", "data-type", "data-checked",
  "aria-label", "aria-hidden", "role",
];

/** Classes permitted on CMS page HTML (CTA, callouts, TOC). Others are stripped on sanitize. */
export const ALLOWED_PAGE_CONTENT_CLASSES = new Set([
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
]);

export { ALLOWED_TAGS, ALLOWED_ATTR };

const FORBID_TAGS = [
  "script", "style", "iframe", "object", "embed", "form", "input",
  "textarea", "select", "button", "link", "meta", "base",
];

const FORBID_ATTR = [
  "onclick", "ondblclick", "onmousedown", "onmouseup", "onmouseover", "onmousemove", "onmouseout",
  "onkeydown", "onkeyup", "onkeypress", "onload", "onerror", "onfocus", "onblur", "onchange",
  "onsubmit", "onreset", "onscroll", "oninput", "onpaste", "oncopy", "oncut",
  "style", "background", "xmlns", "xmlns:x", "x:str", "x:bool",
];

let pageContentSanitizerHooksInstalled = false;

function filterAllowedClasses(classValue: string): string {
  return classValue
    .split(/\s+/)
    .filter((cls) => cls && ALLOWED_PAGE_CONTENT_CLASSES.has(cls))
    .join(" ");
}

/** Install DOMPurify hooks once for class allow-list and external link rel. */
export function ensurePageContentSanitizerHooks(): void {
  if (pageContentSanitizerHooksInstalled) return;
  pageContentSanitizerHooksInstalled = true;

  DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
    if (data.attrName !== "class") return;
    const filtered = filterAllowedClasses(data.attrValue ?? "");
    if (filtered) {
      data.attrValue = filtered;
    } else {
      data.keepAttr = false;
    }
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName !== "A") return;
    if (node.getAttribute("target") !== "_blank") return;
    const parts = new Set((node.getAttribute("rel") ?? "").split(/\s+/).filter(Boolean));
    parts.add("noopener");
    parts.add("noreferrer");
    node.setAttribute("rel", [...parts].join(" "));
  });
}

export function createPageContentPurifyConfig() {
  ensurePageContentSanitizerHooks();
  return {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS,
    FORBID_ATTR,
    ALLOW_DATA_ATTR: true,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  };
}

export type PageContentNormalizeResult = {
  html: string;
  warnings: string[];
  extraH1Converted: number;
  contentH1ConvertedForPageTitle: number;
};

export function sanitizePageContentHtml(html: string): string {
  return DOMPurify.sanitize(html ?? "", createPageContentPurifyConfig());
}

/** Strip Word / Google Docs noise while keeping semantic heading tags. */
export function cleanWordAndDocsHtml(html: string): string {
  let out = html ?? "";
  out = out.replace(/<!--\[if[\s\S]*?endif\]-->/gi, "");
  out = out.replace(/<\?xml[\s\S]*?\?>/gi, "");
  out = out.replace(/<o:p>\s*<\/o:p>/gi, "");
  out = out.replace(/<\/?o:[^>]+>/gi, "");
  out = out.replace(/<\/?w:[^>]+>/gi, "");
  out = out.replace(/<\/?m:[^>]+>/gi, "");

  out = out.replace(
    /<p([^>]*class="[^"]*MsoHeading1[^"]*"[^>]*)>([\s\S]*?)<\/p>/gi,
    (_m, _attrs, inner) => `<h1>${stripInnerTags(inner)}</h1>`,
  );
  out = out.replace(
    /<p([^>]*class="[^"]*MsoHeading2[^"]*"[^>]*)>([\s\S]*?)<\/p>/gi,
    (_m, _attrs, inner) => `<h2>${stripInnerTags(inner)}</h2>`,
  );
  out = out.replace(
    /<p([^>]*class="[^"]*MsoHeading3[^"]*"[^>]*)>([\s\S]*?)<\/p>/gi,
    (_m, _attrs, inner) => `<h3>${stripInnerTags(inner)}</h3>`,
  );

  out = out.replace(
    /<p[^>]*style="[^"]*mso-outline-level:\s*1[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
    (_m, inner) => `<h1>${stripInnerTags(inner)}</h1>`,
  );
  out = out.replace(
    /<p[^>]*style="[^"]*mso-outline-level:\s*2[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
    (_m, inner) => `<h2>${stripInnerTags(inner)}</h2>`,
  );
  out = out.replace(
    /<p[^>]*style="[^"]*mso-outline-level:\s*3[^"]*"[^>]*>([\s\S]*?)<\/p>/gi,
    (_m, inner) => `<h3>${stripInnerTags(inner)}</h3>`,
  );

  out = out.replace(/<span[^>]*>\s*<\/span>/gi, "");
  out = out.replace(/<\/?font[^>]*>/gi, "");
  out = out.replace(/\sstyle="[^"]*"/gi, "");
  out = out.replace(/\sstyle='[^']*'/gi, "");
  out = out.replace(/\sclass="Mso[^"]*"/gi, "");

  return out;
}

function stripInnerTags(inner: string): string {
  return inner.replace(/<\/?span[^>]*>/gi, "").replace(/<\/?font[^>]*>/gi, "").trim();
}

export function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function isPotentialHeadingLine(line: string): boolean {
  if (line.length < 3 || line.length > 80) return false;
  if (/[.!?;:]$/.test(line)) return false;
  if (line.split(/\s+/).length > 12) return false;
  return true;
}

/** Convert plain text to HTML paragraphs; optionally detect Markdown / standalone headings. */
export function plainTextToHtml(text: string, detectHeadings: boolean): string {
  if (!detectHeadings) {
    const paragraphs = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    if (!paragraphs.length) return `<p>${escapeHtmlText(text.trim())}</p>`;
    return paragraphs.map((p) => `<p>${escapeHtmlText(p.replace(/\n/g, " "))}</p>`).join("");
  }

  const lines = text.split("\n");
  const blocks: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]?.trim() ?? "";
    if (!line) {
      i++;
      continue;
    }

    const mdH3 = /^###\s+(.+)$/.exec(line);
    const mdH2 = /^##\s+(.+)$/.exec(line);
    const mdH1 = /^#\s+(.+)$/.exec(line);
    if (mdH3) {
      blocks.push(`<h3>${escapeHtmlText(mdH3[1]!.trim())}</h3>`);
      i++;
      continue;
    }
    if (mdH2) {
      blocks.push(`<h2>${escapeHtmlText(mdH2[1]!.trim())}</h2>`);
      i++;
      continue;
    }
    if (mdH1) {
      blocks.push(`<h1>${escapeHtmlText(mdH1[1]!.trim())}</h1>`);
      i++;
      continue;
    }

    const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim())?.trim() ?? "";
    if (
      isPotentialHeadingLine(line) &&
      nextNonEmpty &&
      !isPotentialHeadingLine(nextNonEmpty) &&
      nextNonEmpty.length > line.length
    ) {
      blocks.push(`<h2>${escapeHtmlText(line)}</h2>`);
      i++;
      continue;
    }

    const paraLines = [line];
    i++;
    while (i < lines.length && lines[i]?.trim()) {
      paraLines.push(lines[i]!.trim());
      i++;
    }
    blocks.push(`<p>${escapeHtmlText(paraLines.join(" "))}</p>`);
  }

  return blocks.join("") || `<p>${escapeHtmlText(text.trim())}</p>`;
}

export function normalizeContentHeadings(
  html: string,
  options: { pageTitleOwnsH1: boolean },
): { html: string; extraH1Converted: number; contentH1ConvertedForPageTitle: number } {
  let extraH1Converted = 0;
  let contentH1ConvertedForPageTitle = 0;
  let firstH1Kept = false;

  const normalized = html.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi, (full, attrs, inner) => {
    const attrStr = attrs ?? "";
    if (options.pageTitleOwnsH1) {
      contentH1ConvertedForPageTitle++;
      return `<h2${attrStr}>${inner}</h2>`;
    }
    if (!firstH1Kept) {
      firstH1Kept = true;
      return full;
    }
    extraH1Converted++;
    return `<h2${attrStr}>${inner}</h2>`;
  });

  return { html: normalized, extraH1Converted, contentH1ConvertedForPageTitle };
}

function buildWarnings(extraH1Converted: number, contentH1ConvertedForPageTitle: number): string[] {
  const warnings: string[] = [];
  if (contentH1ConvertedForPageTitle > 0) {
    const n = contentH1ConvertedForPageTitle;
    warnings.push(
      `${n} heading${n === 1 ? "" : "s"} converted from H1 to H2 — the page title is the main H1 on the published page.`,
    );
  }
  if (extraH1Converted > 0) {
    const n = extraH1Converted;
    warnings.push(`${n} extra H1 heading${n === 1 ? "" : "s"} converted to H2.`);
  }
  return warnings;
}

export function processPastedPageContent(input: {
  html?: string;
  plainText?: string;
  detectPlainTextHeadings?: boolean;
  pageTitleOwnsH1?: boolean;
}): PageContentNormalizeResult {
  const pageTitleOwnsH1 = input.pageTitleOwnsH1 ?? true;
  let html = "";

  if (input.plainText != null && input.plainText !== "" && !input.html?.trim()) {
    html = plainTextToHtml(input.plainText, input.detectPlainTextHeadings ?? false);
  } else {
    html = input.html ?? "";
    html = cleanWordAndDocsHtml(html);
  }

  html = sanitizePageContentHtml(html);
  const heading = normalizeContentHeadings(html, { pageTitleOwnsH1 });
  const warnings = buildWarnings(heading.extraH1Converted, heading.contentH1ConvertedForPageTitle);

  return {
    html: heading.html,
    warnings,
    extraH1Converted: heading.extraH1Converted,
    contentH1ConvertedForPageTitle: heading.contentH1ConvertedForPageTitle,
  };
}

/** Apply on save when the editor content was modified — not for untouched existing pages. */
export function normalizePageContentForSave(content: string): PageContentNormalizeResult {
  if (!content?.trim()) {
    return { html: content ?? "", warnings: [], extraH1Converted: 0, contentH1ConvertedForPageTitle: 0 };
  }
  const html = sanitizePageContentHtml(content);
  const heading = normalizeContentHeadings(html, { pageTitleOwnsH1: true });
  return {
    html: heading.html,
    warnings: buildWarnings(heading.extraH1Converted, heading.contentH1ConvertedForPageTitle),
    extraH1Converted: heading.extraH1Converted,
    contentH1ConvertedForPageTitle: heading.contentH1ConvertedForPageTitle,
  };
}

/** Count H1 tags in HTML (for tests / public DOM checks). */
export function countHtmlHeadings(html: string, level: 1 | 2 | 3): number {
  const re = new RegExp(`<h${level}[\\s>]`, "gi");
  return (html.match(re) ?? []).length;
}
