import type { CmsContentStatus, TemplateVars } from "./types";

const VAR_PATTERN = /\{([a-z_]+)\}/gi;

export function renderTemplate(template: string, vars: TemplateVars): string {
  if (!template) return "";
  return template.replace(VAR_PATTERN, (_, key: string) => vars[key.toLowerCase()] ?? "");
}

export function buildTemplateVars(input: Partial<TemplateVars> & { brand?: string }): TemplateVars {
  const base: TemplateVars = {
    brand: input.brand ?? "Yaarzo",
    country: input.country ?? "",
    state: input.state ?? "",
    city: input.city ?? "",
    category: input.category ?? "",
    primary_keyword: input.primary_keyword ?? "",
    year: input.year ?? String(new Date().getFullYear()),
  };
  // Merge optional taxonomy/context keys (nearby_cities, country_context, language_note, …)
  for (const [k, v] of Object.entries(input)) {
    if (v == null) continue;
    const key = k.toLowerCase();
    if (key in base && ["brand", "country", "state", "city", "category", "primary_keyword", "year"].includes(key)) {
      continue; // already set above
    }
    if (typeof v === "string") base[key] = v;
  }
  return base;
}

/** Render string fields inside a CTA object; leave non-strings untouched. */
export function renderCtaTemplate(
  cta: Record<string, unknown> | null | undefined,
  vars: TemplateVars,
): { label?: string; href?: string; text?: string; [key: string]: string | undefined } | null {
  if (!cta || typeof cta !== "object") return null;
  const out: { [key: string]: string | undefined } = {};
  for (const [k, v] of Object.entries(cta)) {
    if (typeof v === "string") out[k] = renderTemplate(v, vars);
    else if (v == null) out[k] = undefined;
    else out[k] = String(v);
  }
  return out;
}

/** Render FAQ q/a templates. */
export function renderFaqTemplate(
  faq: Array<{ q?: string; a?: string }> | null | undefined,
  vars: TemplateVars,
): Array<{ q: string; a: string }> | null {
  if (!Array.isArray(faq) || !faq.length) return null;
  return faq.map((item) => ({
    q: typeof item?.q === "string" ? renderTemplate(item.q, vars) : String(item?.q ?? ""),
    a: typeof item?.a === "string" ? renderTemplate(item.a, vars) : String(item?.a ?? ""),
  }));
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
