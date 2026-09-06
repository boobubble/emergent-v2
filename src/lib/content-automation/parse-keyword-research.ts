import { detectHashtagDump } from "@/lib/pages-cms/content-quality";

export type KeywordResearchParse = {
  title: string;
  keywords: string[];
  joined: string;
};

export type KeywordResearchCandidate = {
  type: "blog" | "page";
  id: string | number;
  title: string;
  slug?: string | null;
  keywords: string | null;
  /** Extra titles (h1, meta_title, branded browser title) for published pages. */
  aliases?: string[];
};

export type KeywordResearchMatch =
  | {
      status: "matched";
      title: string;
      match: KeywordResearchCandidate;
      confidence: "exact" | "derived";
    }
  | {
      status: "none";
      title: string;
      message: string;
    }
  | {
      status: "ambiguous";
      title: string;
      message: string;
      candidates: KeywordResearchCandidate[];
    };

export type KeywordSaveMode = "replace" | "append";

const INTENT_HEADER = /\(\s*(commercial|informational|transactional|navigational)\s*\)\s*$/i;
const CHAT_ROOM_SUFFIX = /\s+(chat[-\s]?rooms?|chatrooms?)$/i;

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\u2028|\u2029/g, "\n");
}

export function normalizeMatchKey(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function addKey(keys: Set<string>, value: string | null | undefined) {
  if (!value) return;
  const normalized = normalizeMatchKey(value);
  if (normalized) keys.add(normalized);
  const slug = slugify(value);
  if (slug) keys.add(slug);
}

/** Keys a pasted title may be known as (exact title, slug, chat-room variants). */
export function pastedTitleKeys(title: string): string[] {
  const keys = new Set<string>();
  addKey(keys, title);
  const stripped = normalizeMatchKey(title).replace(CHAT_ROOM_SUFFIX, "").trim();
  if (stripped) {
    addKey(keys, stripped);
    addKey(keys, `${stripped} chat room`);
    addKey(keys, `${stripped} chatroom`);
    addKey(keys, `${slugify(stripped)}-chat-room`);
  }
  return [...keys];
}

/** Keys a pending page idea can match (base name, slug, "X Chat Room"). */
export function pageIdeaMatchKeys(baseName: string, slug?: string | null): string[] {
  const keys = new Set<string>();
  addKey(keys, baseName);
  addKey(keys, slug);
  addKey(keys, `${baseName} chat room`);
  addKey(keys, `${baseName} chatroom`);
  const baseSlug = slugify(baseName);
  if (baseSlug) keys.add(`${baseSlug}-chat-room`);
  return [...keys];
}

function splitKeywordList(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function joinKeywords(keywords: string[]): string {
  return keywords.join(", ");
}

export function dedupeKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of keywords) {
    const keyword = raw.trim();
    if (!keyword) continue;
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(keyword);
  }
  return out;
}

export function mergeKeywords(
  existing: string | null | undefined,
  incoming: string | string[],
  mode: KeywordSaveMode,
): string {
  const next = Array.isArray(incoming) ? incoming : splitKeywordList(incoming);
  if (mode === "replace") return joinKeywords(dedupeKeywords(next));
  return joinKeywords(dedupeKeywords([...splitKeywordList(existing), ...next]));
}

/**
 * Parse an SEO-tool keyword-cluster paste.
 * First non-empty line is the title; `* ` bullets across all clusters are keywords.
 */
export function parseKeywordResearch(text: string): KeywordResearchParse {
  const lines = normalizeNewlines(text).split("\n");
  let title = "";
  const keywords: string[] = [];
  const seen = new Set<string>();

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (!title) {
      title = line;
      continue;
    }
    if (INTENT_HEADER.test(line)) continue;
    const bullet = line.match(/^\*\s+(.+)$/);
    if (!bullet) continue;
    const keyword = bullet[1].trim();
    if (!keyword) continue;
    const key = keyword.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    keywords.push(keyword);
  }

  return { title, keywords, joined: joinKeywords(keywords) };
}

function noMatchMessage(title: string, kind: "pending" | "published"): string {
  return kind === "published"
    ? `No matching published item found for '${title}'`
    : `No matching pending item found for '${title}'`;
}

function hasCandidateId(candidate: KeywordResearchCandidate): boolean {
  if (typeof candidate.id === "number") return Number.isFinite(candidate.id) && candidate.id > 0;
  return typeof candidate.id === "string" && candidate.id.trim().length > 0;
}

/** Drop CMS branding suffixes like "Jaipur Chat Room | Yaarzo". */
export function brandlessTitle(value: string): string {
  const pipe = value.split("|")[0]?.trim();
  return pipe || value.trim();
}

function isExactCandidate(title: string, candidate: KeywordResearchCandidate): boolean {
  const pasted = normalizeMatchKey(title);
  if (pasted && pasted === normalizeMatchKey(candidate.title)) return true;
  if (candidate.slug && pasted === normalizeMatchKey(candidate.slug)) return true;
  return false;
}

/**
 * Match a parsed title: exact blog title first, then page base_name / slug /
 * "X Chat Room" aliases. Ambiguous or missing matches are reported, never guessed.
 */
export function matchKeywordResearchTitle(
  title: string,
  candidates: KeywordResearchCandidate[],
): KeywordResearchMatch {
  const trimmed = title.trim();
  if (!trimmed) {
    return { status: "none", title: "", message: "Paste should start with the topic or page title." };
  }

  const blogs = candidates.filter((c) => c.type === "blog" && hasCandidateId(c));
  const pages = candidates.filter((c) => c.type === "page" && hasCandidateId(c));
  const pastedNorm = normalizeMatchKey(trimmed);

  const exactBlogs = blogs.filter((c) => normalizeMatchKey(c.title) === pastedNorm);
  if (exactBlogs.length === 1) {
    return { status: "matched", title: trimmed, match: exactBlogs[0], confidence: "exact" };
  }
  if (exactBlogs.length > 1) {
    return {
      status: "ambiguous",
      title: trimmed,
      message: `Ambiguous match for '${trimmed}' — ${exactBlogs.length} blog topics share this title.`,
      candidates: exactBlogs,
    };
  }

  const titleKeys = new Set(pastedTitleKeys(trimmed));
  const pageHits = pages.filter((page) => {
    const pageKeys = pageIdeaMatchKeys(page.title, page.slug);
    return pageKeys.some((key) => titleKeys.has(key));
  });

  if (pageHits.length === 1) {
    return {
      status: "matched",
      title: trimmed,
      match: pageHits[0],
      confidence: isExactCandidate(trimmed, pageHits[0]) ? "exact" : "derived",
    };
  }
  if (pageHits.length > 1) {
    return {
      status: "ambiguous",
      title: trimmed,
      message: `Ambiguous match for '${trimmed}' — ${pageHits.length} pending pages could match. Pick one below.`,
      candidates: pageHits,
    };
  }

  return { status: "none", title: trimmed, message: noMatchMessage(trimmed, "pending") };
}

function candidateMatchKeys(candidate: KeywordResearchCandidate): string[] {
  const keys = new Set(pageIdeaMatchKeys(candidate.title, candidate.slug));
  addKey(keys, brandlessTitle(candidate.title));
  for (const alias of candidate.aliases ?? []) {
    addKey(keys, alias);
    addKey(keys, brandlessTitle(alias));
    for (const key of pageIdeaMatchKeys(brandlessTitle(alias), null)) keys.add(key);
  }
  return [...keys];
}

/**
 * Match a parsed title against published blog_posts / custom_pages.
 * Prefer exact blog title, then page h1 / title / slug / chat-room aliases.
 */
export function matchPublishedContentTitle(
  title: string,
  candidates: KeywordResearchCandidate[],
): KeywordResearchMatch {
  const trimmed = title.trim();
  if (!trimmed) {
    return { status: "none", title: "", message: "Paste should start with the topic or page title." };
  }

  const blogs = candidates.filter((c) => c.type === "blog" && hasCandidateId(c));
  const pages = candidates.filter((c) => c.type === "page" && hasCandidateId(c));
  const pastedNorm = normalizeMatchKey(trimmed);
  const pastedBrandless = normalizeMatchKey(brandlessTitle(trimmed));

  const exactBlogs = blogs.filter((c) => {
    const titleKey = normalizeMatchKey(c.title);
    const aliasHit = (c.aliases ?? []).some((alias) => normalizeMatchKey(alias) === pastedNorm);
    return titleKey === pastedNorm || titleKey === pastedBrandless || aliasHit || (c.slug && normalizeMatchKey(c.slug) === pastedNorm);
  });
  if (exactBlogs.length === 1) {
    return { status: "matched", title: trimmed, match: exactBlogs[0], confidence: "exact" };
  }
  if (exactBlogs.length > 1) {
    return {
      status: "ambiguous",
      title: trimmed,
      message: `Ambiguous match for '${trimmed}' — ${exactBlogs.length} published posts share this title.`,
      candidates: exactBlogs,
    };
  }

  const titleKeys = new Set(pastedTitleKeys(trimmed));
  addKey(titleKeys, brandlessTitle(trimmed));
  const pageHits = pages.filter((page) => candidateMatchKeys(page).some((key) => titleKeys.has(key)));

  if (pageHits.length === 1) {
    return {
      status: "matched",
      title: trimmed,
      match: pageHits[0],
      confidence: isExactCandidate(trimmed, pageHits[0]) ? "exact" : "derived",
    };
  }
  if (pageHits.length > 1) {
    return {
      status: "ambiguous",
      title: trimmed,
      message: `Ambiguous match for '${trimmed}' — ${pageHits.length} published pages could match. Pick one below.`,
      candidates: pageHits,
    };
  }

  return { status: "none", title: trimmed, message: noMatchMessage(trimmed, "published") };
}

export function formatKeywordResearchMatch(candidate: KeywordResearchCandidate): string {
  const kind = candidate.type === "blog" ? "Blog" : "Page";
  const name =
    candidate.type === "page" && candidate.slug
      ? `${candidate.title} (${candidate.slug})`
      : candidate.title;
  return `${kind} #${candidate.id} — ${name}`;
}

export type KeywordResearchTagPrep = {
  tags: string[];
  keywordPhrases: string[];
  keywordsText: string;
  extractedCount: number;
  trimmed: boolean;
  dumpAvoided: boolean;
  warning: string | null;
};

/**
 * Turn extracted research bullets into a tags array that passes detectHashtagDump.
 * Also returns a shorter SEO-phrase list for blog_posts.keywords.
 */
export function prepareKeywordResearchTags(
  keywords: string[],
  opts?: { maxTags?: number; maxPhrases?: number; maxPhraseLength?: number },
): KeywordResearchTagPrep {
  const maxTags = opts?.maxTags ?? 12;
  const maxPhrases = opts?.maxPhrases ?? 12;
  const maxPhraseLength = opts?.maxPhraseLength ?? 80;
  const extracted = dedupeKeywords(keywords);
  const rawWouldDump = detectHashtagDump(extracted);

  const unique: string[] = [];
  for (const item of extracted) {
    if (unique.some((u) => u.toLowerCase() === item.toLowerCase())) continue;
    unique.push(item);
  }
  const nonChat = unique.filter((t) => !/chat/i.test(t));
  const chat = unique.filter((t) => /chat/i.test(t)).slice(0, 3);
  const roomForChat = Math.min(chat.length, Math.max(0, maxTags - Math.min(nonChat.length, maxTags)));
  let tags = [...nonChat.slice(0, maxTags - roomForChat), ...chat.slice(0, roomForChat)];
  if (tags.length > maxTags) tags = tags.slice(0, maxTags);
  if (detectHashtagDump(tags)) tags = nonChat.slice(0, maxTags);

  const keywordPhrases = extracted.filter((k) => k.length <= maxPhraseLength).slice(0, maxPhrases);
  const trimmed = tags.length < extracted.length;
  const dumpAvoided = rawWouldDump && !detectHashtagDump(tags);
  const warning = trimmed
    ? `Trimmed from ${extracted.length} keywords to ${tags.length} tags${dumpAvoided ? " so the list passes the hashtag-dump check" : ""}.`
    : null;

  return {
    tags,
    keywordPhrases,
    keywordsText: joinKeywords(keywordPhrases),
    extractedCount: extracted.length,
    trimmed,
    dumpAvoided,
    warning,
  };
}
