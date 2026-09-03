export const PAGE_CTA_CLASSES = [
  "custom-page-cta",
  "custom-page-cta-button",
  "custom-page-cta-note",
  "custom-page-cta-secondary",
] as const;

export type PageCtaStyle = "primary" | "secondary";

export type PageCtaDefaults = {
  buttonText: string;
  href: string;
  note: string;
  openInNewTab: boolean;
  style: PageCtaStyle;
};

export const DEFAULT_PAGE_CTA_DEFAULTS: PageCtaDefaults = {
  buttonText: "Start Chatting Now",
  href: "/chatrooms",
  note: "Free to explore • Join when you are ready",
  openInNewTab: false,
  style: "primary",
};

/** CTA dialog defaults for /pages-editor/$id when creating a page (`id === "new"`). */
export function pageEditorCtaDefaults(isNew: boolean): PageCtaDefaults | undefined {
  return isNew ? DEFAULT_PAGE_CTA_DEFAULTS : undefined;
}

export type PageCtaInput = {
  buttonText: string;
  href: string;
  note?: string;
  openInNewTab?: boolean;
  style?: PageCtaStyle;
};

/** Normalize and validate CTA href — internal paths or http(s) only. */
export function sanitizeCtaHref(raw: string): string {
  const href = raw.trim();
  if (!href) return DEFAULT_PAGE_CTA_DEFAULTS.href;
  if (href.startsWith("/") || href.startsWith("#")) return href;
  if (/^https?:\/\//i.test(href)) return href;
  return DEFAULT_PAGE_CTA_DEFAULTS.href;
}

export function isExternalCtaHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/** Build sanitized CTA HTML for insertion into the page editor. */
export function buildPageCtaHtml(input: PageCtaInput): string {
  const buttonText = escapeHtmlText(input.buttonText.trim() || DEFAULT_PAGE_CTA_DEFAULTS.buttonText);
  const href = escapeHtmlText(sanitizeCtaHref(input.href));
  const note = input.note?.trim();
  const openInNewTab = input.openInNewTab ?? false;
  const style = input.style ?? "primary";

  const btnClasses =
    style === "secondary"
      ? "custom-page-cta-button custom-page-cta-secondary"
      : "custom-page-cta-button";

  const targetAttrs = openInNewTab
    ? ' target="_blank" rel="noopener noreferrer"'
    : "";

  const noteHtml = note
    ? `<p class="custom-page-cta-note">${escapeHtmlText(note)}</p>`
    : "";

  return [
    `<div class="custom-page-cta">`,
    `<a href="${href}" class="${btnClasses}"${targetAttrs}>`,
    `<span>${buttonText}</span>`,
    `<span aria-hidden="true">→</span>`,
    `</a>`,
    noteHtml,
    `</div>`,
    `<p></p>`,
  ].join("");
}

function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
