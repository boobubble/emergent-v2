/** Blog taxonomy helpers. Reuses blog_posts.tags (text[]) and blog_posts.keywords (text). */

export const MAX_BLOG_TAGS = 10;
export const MAX_BLOG_TAG_LENGTH = 32;
export const MAX_BLOG_KEYWORDS = 12;
export const MAX_BLOG_KEYWORD_LENGTH = 80;

export type ChipAddResult = {
  next: string[];
  added: boolean;
  reason?: "empty" | "duplicate" | "max" | "too_long";
};

function collapseSpace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeChipLabel(raw: string, maxLength: number): string | null {
  const value = collapseSpace(raw);
  if (!value) return null;
  if (value.length > maxLength) return null;
  return value;
}

function hasInsensitive(list: string[], label: string): boolean {
  const key = label.toLowerCase();
  return list.some((item) => item.toLowerCase() === key);
}

export function addChip(
  list: string[],
  raw: string,
  opts: { maxItems: number; maxLength: number },
): ChipAddResult {
  const label = collapseSpace(raw);
  if (!label) return { next: list, added: false, reason: "empty" };
  if (label.length > opts.maxLength) return { next: list, added: false, reason: "too_long" };
  if (hasInsensitive(list, label)) return { next: list, added: false, reason: "duplicate" };
  if (list.length >= opts.maxItems) return { next: list, added: false, reason: "max" };
  return { next: [...list, label], added: true };
}

export function addChipsFromInput(
  list: string[],
  raw: string,
  opts: { maxItems: number; maxLength: number },
): { next: string[]; remainder: string } {
  const parts = raw.split(",").map((p) => p.trim());
  if (parts.length === 1) {
    return { next: list, remainder: raw };
  }
  let next = list;
  for (let i = 0; i < parts.length - 1; i++) {
    const result = addChip(next, parts[i], opts);
    next = result.next;
  }
  return { next, remainder: parts[parts.length - 1] ?? "" };
}

export function removeChip(list: string[], label: string): string[] {
  const key = label.toLowerCase();
  return list.filter((item) => item.toLowerCase() !== key);
}

export function normalizeTagList(input: unknown): string[] {
  const raw = Array.isArray(input) ? input : [];
  const out: string[] = [];
  for (const item of raw) {
    const result = addChip(out, String(item ?? ""), {
      maxItems: MAX_BLOG_TAGS,
      maxLength: MAX_BLOG_TAG_LENGTH,
    });
    out.splice(0, out.length, ...result.next);
  }
  return out;
}

export function parseKeywordPhrases(raw: unknown): string[] {
  if (Array.isArray(raw)) return normalizeKeywordList(raw);
  if (raw == null) return [];
  const text = String(raw).trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text) as unknown;
      if (Array.isArray(parsed)) return normalizeKeywordList(parsed);
    } catch {
      /* fall through to comma split */
    }
  }
  return normalizeKeywordList(text.split(","));
}

export function normalizeKeywordList(input: unknown): string[] {
  const raw = Array.isArray(input) ? input : [];
  const out: string[] = [];
  for (const item of raw) {
    const result = addChip(out, String(item ?? ""), {
      maxItems: MAX_BLOG_KEYWORDS,
      maxLength: MAX_BLOG_KEYWORD_LENGTH,
    });
    out.splice(0, out.length, ...result.next);
  }
  return out;
}

/** Store phrases in existing blog_posts.keywords text column. */
export function serializeKeywords(phrases: string[]): string | null {
  const list = normalizeKeywordList(phrases);
  if (!list.length) return null;
  return list.join(", ");
}

export function emptyTaxonomyStillValid(tags: unknown, keywords: unknown): boolean {
  const tagList = Array.isArray(tags) ? tags : [];
  const keywordText = keywords == null || keywords === "" ? null : keywords;
  return tagList.length === 0 && (keywordText == null || String(keywordText).trim() === "");
}
