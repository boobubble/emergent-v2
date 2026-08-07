import type { CmsContentStatus, TemplateVars } from "./types";

const VAR_PATTERN = /\{([a-z_]+)\}/gi;

export function renderTemplate(template: string, vars: TemplateVars): string {
  if (!template) return "";
  return template.replace(VAR_PATTERN, (_, key: string) => vars[key.toLowerCase()] ?? "");
}

export function buildTemplateVars(input: Partial<TemplateVars> & { brand?: string }): TemplateVars {
  return {
    brand: input.brand ?? "Yaarzo",
    country: input.country ?? "",
    state: input.state ?? "",
    city: input.city ?? "",
    category: input.category ?? "",
    primary_keyword: input.primary_keyword ?? "",
    year: String(new Date().getFullYear()),
  };
}

/** Merge optional intro/faq around canonical custom_pages.content (main body). */
export function composePageContent(parts: {
  intro?: string | null;
  content?: string | null;
  faq?: string | null;
}): string {
  return [parts.intro, parts.content, parts.faq].filter(Boolean).join("\n");
}

export function deriveContentStatus(content: string): CmsContentStatus {
  const text = content.replace(/<[^>]+>/g, "").trim();
  if (!text) return "empty";
  if (text.length < 120) return "partial";
  return "complete";
}

export function computeSeoScore(page: {
  meta_title?: string | null;
  meta_description?: string | null;
  h1?: string | null;
  primary_keyword?: string | null;
  content?: string;
  noindex?: boolean;
}): number {
  let score = 0;
  if (page.meta_title && page.meta_title.length >= 30 && page.meta_title.length <= 60) score += 20;
  else if (page.meta_title) score += 10;
  if (page.meta_description && page.meta_description.length >= 70 && page.meta_description.length <= 160) score += 20;
  else if (page.meta_description) score += 10;
  if (page.h1) score += 15;
  if (page.primary_keyword) score += 10;
  const textLen = (page.content ?? "").replace(/<[^>]+>/g, "").trim().length;
  if (textLen >= 300) score += 20;
  else if (textLen >= 100) score += 10;
  if (!page.noindex) score += 15;
  return Math.min(100, score);
}
