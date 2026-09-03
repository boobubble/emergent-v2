/**
 * Pre-publish quality gate for the serverless content-automation pipeline.
 * Keeps future blog/static publishes aligned with evaluatePageQuality:
 * canonical /chatroom, no unpublished internal slugs, no tag dumps.
 */
import { isReservedSlug } from "@/lib/reserved-routes";
import { extractInternalHrefs as extractOrphanInternalHrefs } from "@/lib/internal-linking-orphans";
import {
  CMS_BROKEN_HREF_UNWRAP,
  detectHashtagDump,
  evaluatePageQuality,
  type CmsQualityInput,
  type CmsQualityWarning,
  normalizeInternalPath,
} from "@/lib/pages-cms/content-quality";

export const CANONICAL_CHATROOM_PATH = "/chatroom";

/** Live hub pages used when a requested peer/interest slug is not published yet. */
export const SAFE_FALLBACK_SLUGS = ["international-chat-room", "friendship-chat-room"] as const;

/** In-body generated links. Widgets (Related + Explore) are counted separately. */
export const STATIC_INTERNAL_LINK_MIN = 4;
export const STATIC_INTERNAL_LINK_MAX = 5;
export const BLOG_INTERNAL_LINK_MIN = 2;
export const BLOG_INTERNAL_LINK_MAX = 3;

/** Reserved feature URLs that are always safe to link (not custom_pages slugs). */
export const PIPELINE_FEATURE_LINKS: Array<{ href: string; label: string }> = [
  { href: "https://yaarzo.com/signup", label: "create your free account" },
  { href: "https://yaarzo.com/feed", label: "community feed" },
  { href: "https://yaarzo.com/find-friends", label: "find friends" },
  { href: "https://yaarzo.com/poetry", label: "poetry hub" },
];

export const PIPELINE_BLOCKING_CODES = [
  "broken_internal_link",
  "chatrooms_alias",
  "hashtag_dump",
  "too_few_internal_links",
  "too_many_internal_links",
] as const;

export type PipelineBlockingCode = (typeof PIPELINE_BLOCKING_CODES)[number];

const APP_PREFIXES = new Set(["blog", "poetry"]);

export function hrefForSlug(slug: string): string {
  return `https://yaarzo.com/${String(slug || "").replace(/^\/+/, "")}`;
}

export function slugFromInternalHref(href: string): string | null {
  const path = normalizeInternalPath(href);
  if (!path || path === "/") return null;
  return path.replace(/^\//, "").split("/")[0]?.toLowerCase() || null;
}

function publishedSet(input?: Iterable<string>): Set<string> {
  return new Set([...(input ?? [])].map((s) => s.replace(/^\/+/, "").toLowerCase()));
}

/** True when this internal href is safe to persist (reserved app route or a published page). */
export function isAllowedPipelineHref(href: string, publishedSlugs: Iterable<string>): boolean {
  const path = normalizeInternalPath(href);
  if (!path) return true;
  const slug = path.replace(/^\//, "").split("/")[0]?.toLowerCase() ?? "";
  if (!slug) return true;
  if (slug === "chatrooms" || slug === "p") return false;
  if (CMS_BROKEN_HREF_UNWRAP.has(path) || CMS_BROKEN_HREF_UNWRAP.has(`/${slug}`)) return false;
  if (APP_PREFIXES.has(slug)) return true;
  if (isReservedSlug(slug) && slug !== "chatrooms") return true;
  const published = publishedSet(publishedSlugs);
  if (published.size === 0) return true;
  return published.has(slug);
}

export function filterPublishedHrefs(
  candidates: string[],
  publishedSlugs: Iterable<string>,
  excludeSlug?: string,
): string[] {
  const published = publishedSet(publishedSlugs);
  const exclude = excludeSlug?.replace(/^\/+/, "").toLowerCase();
  return candidates.filter((url) => {
    const slug = slugFromInternalHref(url);
    if (!slug) return false;
    if (exclude && slug === exclude) return false;
    return isAllowedPipelineHref(url, published);
  });
}

export function pickPublishedInternalHref(
  candidates: string[],
  publishedSlugs: Iterable<string>,
  excludeSlug?: string,
): string {
  const picked = pickPublishedInternalHrefs(candidates, publishedSlugs, { excludeSlug, count: 1 });
  return picked[0] ?? hrefForSlug(SAFE_FALLBACK_SLUGS[0]);
}

export function pickPublishedInternalHrefs(
  candidates: string[],
  publishedSlugs: Iterable<string>,
  opts?: { excludeSlug?: string; count?: number },
): string[] {
  const count = Math.max(0, opts?.count ?? 1);
  const ok = filterPublishedHrefs(candidates, publishedSlugs, opts?.excludeSlug);
  const shuffled = [...ok].sort(() => Math.random() - 0.5);
  const unique: string[] = [];
  const seen = new Set<string>();
  for (const url of shuffled) {
    const slug = slugFromInternalHref(url);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    unique.push(url);
    if (unique.length >= count) return unique;
  }
  for (const slug of SAFE_FALLBACK_SLUGS) {
    if (unique.length >= count) break;
    if (opts?.excludeSlug && slug === opts.excludeSlug.replace(/^\/+/, "").toLowerCase()) continue;
    if (seen.has(slug)) continue;
    const published = publishedSet(publishedSlugs);
    if (published.size > 0 && !published.has(slug)) continue;
    seen.add(slug);
    unique.push(hrefForSlug(slug));
  }
  return unique;
}

export function countInternalLinks(html: string): number {
  return extractOrphanInternalHrefs(html).length;
}

export function uniqueAnchorTexts(html: string): string[] {
  const texts: string[] = [];
  const re = /<a\b[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html || ""))) {
    const text = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
    if (text) texts.push(text);
  }
  return texts;
}

export function hasRepeatedAnchorText(html: string): boolean {
  const texts = uniqueAnchorTexts(html);
  return new Set(texts).size !== texts.length;
}

export type PlannedInternalLink = { href: string; label: string };

/** Append unused planned links until `min`, never exceeding `max`. */
export function padInternalLinks(
  html: string,
  extras: PlannedInternalLink[],
  min: number,
  max: number,
): string {
  let out = html || "";
  let n = countInternalLinks(out);
  if (n >= min) return out;
  for (const extra of extras) {
    if (n >= min || n >= max) break;
    if (!extra.href || htmlHasHref(out, extra.href)) continue;
    const label = extra.label.trim() || "related page";
    out += `<p>You can also explore the <a href="${extra.href}">${label}</a>.</p>`;
    n = countInternalLinks(out);
  }
  return out;
}

export function internalLinkCountIssue(html: string, min: number, max: number): string | null {
  const n = countInternalLinks(html);
  if (n < min) return `too_few_internal_links: ${n} (need ${min}–${max})`;
  if (n > max) return `too_many_internal_links: ${n} (need ${min}–${max})`;
  return null;
}

/** Canonicalize /chatrooms → /chatroom and /p/{slug} → /{slug}. */
export function canonicalizePipelineHref(href: string): string {
  let next = String(href || "").trim();
  next = next.replace(/\/chatrooms(?=\/|$|\?|#)/gi, CANONICAL_CHATROOM_PATH);
  next = next.replace(/^(https?:\/\/(?:www\.)?yaarzo\.com)\/p\/([^/?#]+)/i, "$1/$2");
  next = next.replace(/^\/p\/([^/?#]+)/i, "/$1");
  return next;
}

export function htmlHasHref(html: string, href: string): boolean {
  const raw = String(href || "").trim();
  if (!raw) return false;
  if (html.includes(raw)) return true;
  const path = normalizeInternalPath(raw);
  if (path && html.includes(path)) return true;
  const slug = path?.replace(/^\//, "") || "";
  return Boolean(slug && html.includes(`yaarzo.com/${slug}`));
}

export function htmlHasPeerGeoLink(html: string, peerHrefs: string[]): boolean {
  return peerHrefs.some((href) => htmlHasHref(html, href));
}

export function ensurePeerGeoLinks(
  html: string,
  peers: Array<{ href: string; label: string }>,
  max?: number,
): string {
  let out = html || "";
  for (const peer of peers) {
    if (!peer.href) continue;
    if (max != null && countInternalLinks(out) >= max) break;
    if (htmlHasHref(out, peer.href)) continue;
    const label = peer.label.trim() || "related room";
    out += `<p>Nearby, you can also jump into the <a href="${peer.href}">${label}</a> room.</p>`;
  }
  return out;
}

/** Append unused planned links, never exceeding `max`. Unlike padInternalLinks, this does not require `n < min`. */
export function ensurePlannedLinks(
  html: string,
  extras: PlannedInternalLink[],
  max: number,
): string {
  let out = html || "";
  let n = countInternalLinks(out);
  if (n >= max) return out;
  for (const extra of extras) {
    if (n >= max) break;
    if (!extra.href || htmlHasHref(out, extra.href)) continue;
    const label = extra.label.trim() || "related page";
    out += `<p>You can also explore the <a href="${extra.href}">${label}</a>.</p>`;
    n = countInternalLinks(out);
  }
  return out;
}

/** Rewrite /chatrooms and /p/{slug}; retarget unpublished/unwrap hrefs to a published fallback. */
export function rewritePipelineHtml(
  html: string,
  publishedSlugs: Iterable<string>,
  fallbackHref?: string,
): string {
  const published = publishedSet(publishedSlugs);
  const fallback = fallbackHref || pickPublishedInternalHref([], published);
  return (html || "").replace(
    /<a\b([^>]*?)href\s*=\s*(["'])([^"']+)\2([^>]*)>([\s\S]*?)<\/a>/gi,
    (full, pre: string, q: string, href: string, post: string, inner: string) => {
      const raw = String(href).trim();
      if (!raw.startsWith("/") && !/^https?:\/\/(www\.)?yaarzo\.com/i.test(raw)) return full;
      let next = canonicalizePipelineHref(raw);
      if (isAllowedPipelineHref(next, published)) {
        if (next === raw) return full;
        return `<a${pre}href=${q}${next}${q}${post}>${inner}</a>`;
      }
      next = fallback;
      return `<a${pre}href=${q}${next}${q}${post}>${inner}</a>`;
    },
  );
}

/**
 * Cap chat-keyword stuffing so detectHashtagDump() is false.
 * Prefer topical tags; keep at most 3 tags containing "chat". Does not invent tags.
 */
export function sanitizePipelineTags(tags: string[] | null | undefined): string[] {
  const unique: string[] = [];
  for (const raw of tags ?? []) {
    const t = raw.trim();
    if (!t) continue;
    if (unique.some((u) => u.toLowerCase() === t.toLowerCase())) continue;
    unique.push(t);
  }
  const nonChat = unique.filter((t) => !/chat/i.test(t));
  const chat = unique.filter((t) => /chat/i.test(t)).slice(0, 3);
  const roomForChat = Math.min(chat.length, Math.max(0, 12 - nonChat.length));
  let out = [...nonChat.slice(0, 12 - roomForChat), ...chat.slice(0, roomForChat)];
  if (out.length > 12) out = out.slice(0, 12);
  if (detectHashtagDump(out)) out = nonChat.slice(0, 12);
  return out;
}

export type PreparePublishResult = {
  content: string;
  tags: string[];
  blocked: boolean;
  blockReason?: string;
  warnings: CmsQualityWarning[];
};

export type PreparePublishOptions = CmsQualityInput & {
  content: string;
  linkCount?: { min: number; max: number };
};

/** Auto-correct quality rules, then block if they still fail (including link-count range). */
export function preparePublishablePage(input: PreparePublishOptions): PreparePublishResult {
  const published = publishedSet(input.publishedSlugs);
  const fallback = pickPublishedInternalHref([], published);
  const content = rewritePipelineHtml(input.content ?? "", published, fallback);
  const tags = sanitizePipelineTags(input.tags);
  const quality = evaluatePageQuality({
    ...input,
    content,
    tags,
    publishedSlugs: published,
  });
  const blocking = quality.warnings.filter((w) =>
    (PIPELINE_BLOCKING_CODES as readonly string[]).includes(w.code),
  );
  const range = input.linkCount;
  const countIssue = range ? internalLinkCountIssue(content, range.min, range.max) : null;
  if (countIssue) {
    const code = countIssue.startsWith("too_few") ? "too_few_internal_links" : "too_many_internal_links";
    blocking.push({ code, severity: "warning", message: countIssue });
  }
  if (blocking.length) {
    const blockReason = blocking.map((w) => `${w.code}: ${w.message}`).join("; ");
    console.error(`[publish-quality] blocked ${input.slug}: ${blockReason}`);
    return { content, tags, blocked: true, blockReason, warnings: quality.warnings };
  }
  return { content, tags, blocked: false, warnings: quality.warnings };
}
