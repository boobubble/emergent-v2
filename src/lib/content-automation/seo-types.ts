export const SEARCH_INTENTS = [
  "informational",
  "navigational",
  "commercial",
  "transactional",
  "local",
  "mixed",
] as const;

export type SearchIntent = (typeof SEARCH_INTENTS)[number];

export const KEYWORD_TYPES = ["primary", "secondary", "long-tail", "question"] as const;
export type KeywordType = (typeof KEYWORD_TYPES)[number];

export const CONTENT_TYPES = ["blog", "page"] as const;
export type SeoContentType = (typeof CONTENT_TYPES)[number];

export const IMAGE_STATUSES = ["pending", "ready", "failed", "skipped", "missing"] as const;
export type ImageStatus = (typeof IMAGE_STATUSES)[number];

export type DailyPublishKind = "blog" | "page";

export const BLOG_WORD_TARGET = { min: 1200, max: 1500 } as const;
export const PAGE_WORD_TARGET = { min: 700, max: 900 } as const;

/** Hard thin-content floor — quality beats padding, so the prompt range is not a hard gate. */
export const BLOG_WORD_FLOOR = 600;
export const PAGE_WORD_FLOOR = 350;

export function wordTargetFor(kind: SeoContentType) {
  return kind === "blog" ? BLOG_WORD_TARGET : PAGE_WORD_TARGET;
}

export function wordFloorFor(kind: SeoContentType) {
  return kind === "blog" ? BLOG_WORD_FLOOR : PAGE_WORD_FLOOR;
}
