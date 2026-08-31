/**
 * Pre-publish quality gate for the serverless content-automation pipeline.
 * Keeps future blog/static publishes aligned with evaluatePageQuality:
 * canonical /chatroom, no unpublished internal slugs, no tag dumps.
 */
import { isReservedSlug } from "@/lib/reserved-routes";
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

export const PIPELINE_BLOCKING_CODES = [
  "broken_internal_link",
  "chatrooms_alias",
  "hashtag_dump",
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
  const published = publishedSet(publishedSlugs);
  const ok = filterPublishedHrefs(candidates, published, excludeSlug);
  if (ok.length > 0) return ok[Math.floor(Math.random() * ok.length)];
  for (const slug of SAFE_FALLBACK_SLUGS) {
    if (excludeSlug && slug === excludeSlug.replace(/^\/+/, "").toLowerCase()) continue;
    if (published.size === 0 || published.has(slug)) return hrefForSlug(slug);
  }
  return hrefForSlug(SAFE_FALLBACK_SLUGS[0]);
}

/** Rewrite /chatrooms aliases and retarget unpublished/unwrap hrefs to a published fallback. */
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
      let next = raw.replace(/\/chatrooms(?=\/|$|\?|#)/gi, CANONICAL_CHATROOM_PATH);
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

/** Auto-correct the 3 pipeline quality rules, then block if they still fail. */
export function preparePublishablePage(
  input: CmsQualityInput & { content: string },
): PreparePublishResult {
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
  if (blocking.length) {
    const blockReason = blocking.map((w) => `${w.code}: ${w.message}`).join("; ");
    console.error(`[publish-quality] blocked ${input.slug}: ${blockReason}`);
    return { content, tags, blocked: true, blockReason, warnings: quality.warnings };
  }
  return { content, tags, blocked: false, warnings: quality.warnings };
}
